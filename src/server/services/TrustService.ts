import { db } from "../db";

export class TrustService {
  /**
   * Recalculates all trust scores and prediction accuracies for creators.
   * In a real production system, this would be a cron job.
   */
  static async calculateCreatorTrust() {
    // 1. Fetch all videos chronologically
    const { data: rawVideos, error } = await (db as any)
      .from("creator_videos")
      .select("id, published_at, creators(id, name, is_verified), content_tags")
      .order("published_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch videos: ${error.message}`);

    // Filter out Division 1 imported historical content (Pre-March 2019)
    const d2LaunchDate = new Date("2019-03-01T00:00:00Z").getTime();
    const videos = rawVideos?.filter((v: any) => new Date(v.published_at).getTime() >= d2LaunchDate) || [];

    const nowTime = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    // Track when each build hit "Established" (>= 5 creators)
    const buildConsensus: Record<string, {
      creators: Set<string>;
      establishedDate: Date | null;
      type: string;
    }> = {};

    // Dynamic threshold: 10% of active creators, minimum 2
    const activeCreators = new Set(videos?.map((v: any) => (v.creators as any)?.id).filter(Boolean) || []);
    const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

    // First Pass: Determine Established Dates
    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags) continue;
      
      const creatorId = (v.creators as any)?.id;
      if (!creatorId) continue;

      const publishedDate = new Date(v.published_at);

      const DOMAIN_WEIGHTS: Record<string, number> = {
        gearset: 1.0,
        exotic_weapon: 1.0,
        exotic_armor: 1.0,
        skill: 0.6,
        brand_set: 0.5,
        named_item: 0.5
      };

      // First Pass: Determine Established Dates
      const processTags = (tagType: string, arr: any[]) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
          if (!buildConsensus[item.slug]) {
            buildConsensus[item.slug] = { creators: new Set(), establishedDate: null, type: tagType };
          }
          const state = buildConsensus[item.slug];
          if (!state.establishedDate) {
            state.creators.add(creatorId);
            if (state.creators.size >= consensusThreshold) {
              state.establishedDate = publishedDate; // Hit Established!
            }
          }
        }
      };

      Object.entries(tags).forEach(([type, tagArray]: [string, any]) => processTags(type, tagArray));
    }

    // Creator Stats Tracking
    interface CreatorStats {
      totalCallsLifetime: Set<string>;
      successfulLifetime: Set<string>;
      emergingLifetime: Set<string>;
      totalCalls90d: Set<string>;
      successful90d: Set<string>;
      emerging90d: Set<string>;
      leadTimeSum: number;
      leadTimeCount: number;
      weightedScoreLifetime: number;
      weightedScore90d: number;
    }

    const creatorStats: Record<string, CreatorStats> = {};

    // Second Pass: Attribute Emerging & Successful calls
    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags) continue;
      
      const creatorId = (v.creators as any)?.id;
      if (!creatorId) continue;

      if (!creatorStats[creatorId]) {
        creatorStats[creatorId] = {
          totalCallsLifetime: new Set(),
          successfulLifetime: new Set(),
          emergingLifetime: new Set(),
          totalCalls90d: new Set(),
          successful90d: new Set(),
          emerging90d: new Set(),
          leadTimeSum: 0,
          leadTimeCount: 0,
          weightedScoreLifetime: 0,
          weightedScore90d: 0
        };
      }

      const stats = creatorStats[creatorId];
      const publishedDate = new Date(v.published_at);
      const is90d = (nowTime - publishedDate.getTime()) <= ninetyDaysMs;

      const DOMAIN_WEIGHTS: Record<string, number> = {
        gearset: 1.0,
        exotic_weapon: 1.0,
        exotic_armor: 1.0,
        skill: 0.6,
        brand_set: 0.5,
        named_item: 0.5
      };

      const processAttribution = (tagType: string, arr: any[]) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
          const state = buildConsensus[item.slug];
          if (!state) continue;

          const isEarly = !state.establishedDate || publishedDate < state.establishedDate;
          const weight = DOMAIN_WEIGHTS[tagType] || 0.1; // fallback weight

          // Every post is a "Call"
          stats.totalCallsLifetime.add(item.slug);
          if (is90d) stats.totalCalls90d.add(item.slug);
          
          if (isEarly) {
            stats.emergingLifetime.add(item.slug);
            if (is90d) stats.emerging90d.add(item.slug);
          }

          // Did it eventually become established?
          if (state.establishedDate) {
            if (!stats.successfulLifetime.has(item.slug)) {
               stats.successfulLifetime.add(item.slug);
               stats.weightedScoreLifetime += weight;
            }
            if (is90d && !stats.successful90d.has(item.slug)) {
               stats.successful90d.add(item.slug);
               stats.weightedScore90d += weight;
            }
            
            // Only give Lead Time credit if they were early!
            if (isEarly) {
              const daysLead = (state.establishedDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
              stats.leadTimeSum += Math.max(0, daysLead);
              stats.leadTimeCount += 1;
            }
          }
        }
      };

      Object.entries(tags).forEach(([type, tagArray]: [string, any]) => processAttribution(type, tagArray));
    }

    // Third Pass: Compute Final Scores and Save to DB
    const updates = [];
    for (const [creatorId, stats] of Object.entries(creatorStats)) {
      const emergingLT = stats.emergingLifetime.size;
      const totalLT = stats.totalCallsLifetime.size;
      const successfulLT = stats.successfulLifetime.size;
      const accLT = totalLT > 0 ? (successfulLT / totalLT) * 100 : 0;

      const emerging90d = stats.emerging90d.size;
      const total90d = stats.totalCalls90d.size;
      const successful90d = stats.successful90d.size;
      const acc90d = total90d > 0 ? (successful90d / total90d) * 100 : 0;

      const hybridAcc = (acc90d * 0.7) + (accLT * 0.3);
      const avgLeadTime = stats.leadTimeCount > 0 ? stats.leadTimeSum / stats.leadTimeCount : 0;

      // Trust Score Calculation
      // We use the weightedScoreLifetime instead of raw count to enforce domain weighting
      const participationScore = Math.min(100, (stats.weightedScoreLifetime / 10) * 100);
      const sourceRel = 80;
      const recencyScore = stats.emerging90d.size > 0 ? 100 : 0;

      const rawTrust = (hybridAcc * 0.4) + (participationScore * 0.3) + (sourceRel * 0.2) + (recencyScore * 0.1);
      const finalTrust = Math.round(rawTrust);

      let tier = "LOW";
      if (finalTrust >= 80) tier = "ELITE";
      else if (finalTrust >= 60) tier = "HIGH";
      else if (finalTrust >= 40) tier = "MEDIUM";

      updates.push({
        creator_id: creatorId,
        emerging_calls_90d: emerging90d,
        successful_calls_90d: successful90d,
        accuracy_90d: Math.round(acc90d),
        emerging_calls_lifetime: emergingLT,
        successful_calls_lifetime: successfulLT,
        accuracy_lifetime: Math.round(accLT),
        hybrid_accuracy: Math.round(hybridAcc),
        average_lead_time_days: Math.round(avgLeadTime),
        trust_score: finalTrust,
        trust_tier: tier,
        last_calculated_at: new Date().toISOString()
      });
    }

    if (updates.length > 0) {
      console.log("Sample update payload:", updates[0]);
      const maxLeadTime = Math.max(...updates.map(u => u.average_lead_time_days));
      const maxScore = Math.max(...updates.map(u => u.trust_score));
      console.log("Max values:", { maxLeadTime, maxScore });
      
      // Filter out any crazy values
      const safeUpdates = updates.map(u => ({
        ...u,
        average_lead_time_days: Math.min(999, Math.max(0, u.average_lead_time_days)),
        trust_score: Math.min(100, Math.max(0, u.trust_score)),
        hybrid_accuracy: Math.min(100, Math.max(0, u.hybrid_accuracy)),
        accuracy_90d: Math.min(100, Math.max(0, u.accuracy_90d)),
        accuracy_lifetime: Math.min(100, Math.max(0, u.accuracy_lifetime))
      }));

      const { error: upsertError } = await (db as any)
        .from("creator_trust_scores")
        .upsert(safeUpdates, { onConflict: "creator_id" });
      if (upsertError) throw new Error(`Failed to save trust scores: ${upsertError.message}`);
    }

    return updates.length;
  }

  static async getTopForecasters(limit = 10) {
    const { data, error } = await (db as any)
      .from("creator_trust_scores")
      .select(`
        *,
        creators(name, is_verified, channel_id, thumbnail_url)
      `)
      .order("trust_score", { ascending: false })
      .limit(limit);
    
    if (error) return [];
    
    return data.map((d: any) => {
      const leadTime = Math.round(d.average_lead_time_days);
      const acc = Math.round(d.hybrid_accuracy);
      const calls = d.successful_calls_lifetime;
      const emerging = d.emerging_calls_lifetime;
      
      const peakMetaScore = (calls * 15) + (emerging * 5);
      const avgMetaScore = Math.round(peakMetaScore * 0.7);
      const buildCount = calls + emerging;

      const trustScoreState = buildCount >= 2 
        ? { status: "AVAILABLE" as const, trustScore: d.trust_score }
        : { status: "INSUFFICIENT_EVIDENCE" as const, evidenceCount: buildCount };

      const accuracyState = buildCount >= 2 
        ? { status: "AVAILABLE" as const, accuracy: acc }
        : { status: "INSUFFICIENT_EVIDENCE" as const, evidenceCount: buildCount };

      const leadTimeState = d.leadTimeCount > 0
        ? { status: "AVAILABLE" as const, leadTime }
        : { status: "NO_DATA" as const };

      return {
        id: d.creator_id,
        name: d.creators.name,
        isVerified: d.creators.is_verified,
        trustScoreState,
        trustTier: d.trust_tier,
        hybridAccuracyState: accuracyState,
        successfulCalls: calls,
        avgLeadTimeState: leadTimeState,
        emergingCalls: emerging,
        accuracy90dState: { status: "AVAILABLE" as const, accuracy: Math.round(d.accuracy_90d) },
        accuracyLifetimeState: { status: "AVAILABLE" as const, accuracy: Math.round(d.accuracy_lifetime) },
        avgMetaScore,
        peakMetaScore,
        buildCount,
        omegaBuilds: Math.floor(calls * 0.2) // Just a visual proxy for now
      };
    });
  }

  static async getEarlyAdopters(slug: string, type: "gearset" | "weapons") {
    const filter = type === "gearset" ? { gearset: [{ slug }] } : { weapons: [{ slug }] };
    
    const { data: videos } = await (db as any)
      .from("creator_videos")
      .select("published_at, creators(id, name, is_verified)")
      .contains("content_tags", filter)
      .order("published_at", { ascending: true });

    if (!videos || videos.length === 0) return { adopters: [], daysToConsensus: 0 };

    const uniqueCreators = new Set<string>();
    let establishedDate: Date | null = null;

    // Find the date it hit 5 creators
    for (const v of videos) {
      const creatorId = (v.creators as any)?.id;
      if (!creatorId) continue;
      uniqueCreators.add(creatorId);
      if (uniqueCreators.size >= 5 && !establishedDate) {
        establishedDate = new Date(v.published_at);
        break;
      }
    }

    // Now find who posted before that date
    const earlyAdoptersMap = new Map<string, any>();
    for (const v of videos) {
      const published = new Date(v.published_at);
      if (establishedDate && published >= establishedDate) break; // Reached consensus point
      
      const c = v.creators as any;
      if (c && !earlyAdoptersMap.has(c.id)) {
        earlyAdoptersMap.set(c.id, {
          id: c.id,
          name: c.name,
          isVerified: c.is_verified,
          date: published
        });
      }
    }

    let daysToConsensus = 0;
    if (establishedDate && earlyAdoptersMap.size > 0) {
      const firstDate = Array.from(earlyAdoptersMap.values())[0].date;
      daysToConsensus = Math.round((establishedDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      adopters: Array.from(earlyAdoptersMap.values()),
      daysToConsensus,
      establishedDate
    };
  }
}
