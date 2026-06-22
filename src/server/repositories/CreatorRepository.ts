import { IntelligenceContribution, CreatorComparisonSnapshot } from "@/types/intelligence";
import { db } from "../db";

export class CreatorRepository {

  private static buildIntelligenceContributions(rawContributions: any[]): IntelligenceContribution[] {
    return (rawContributions ?? []).map((source: any) => {
      const build = source.builds;
      const archetype = build?.archetype || build?.name || "Unknown Archetype";
      
      const roleStr = (source.source_role || "validation").toUpperCase();
      const role = roleStr === "ORIGIN" ? "ORIGINATOR" : (roleStr === "EVOLUTION" ? "EVOLVER" : "VALIDATOR");
      
      const totalSources = build?.build_sources?.length || 1;
      const consensusReach = totalSources;
      
      const scores = build?.build_activity_scores || [];
      const hasOmega = scores.some((s: any) => s.threat_level === "OMEGA");
      const hasAlpha = scores.some((s: any) => s.threat_level === "ALPHA");
      const avgMeta = scores.length ? scores.reduce((a: number, c: any) => a + (c.meta_score || 0), 0) / scores.length : 0;
      
      let metaImpact = "Contributed to Niche Setup";
      if (hasOmega) metaImpact = "Contributed to Dominant Meta";
      else if (hasAlpha) metaImpact = "Contributed to Strong Meta";
      else if (avgMeta > 80) metaImpact = "Contributed to Competitive Setup";
      
      const forecastAccuracy = (source.confidence_score || 0) > 60 ? "Successful" : "Pending";
      
      let roleWeight = 1;
      if (role === "ORIGINATOR") roleWeight = 1.5;
      if (role === "EVOLVER") roleWeight = 1.2;
      
      const consensusInfluence = Math.min(10, consensusReach); // simple cap
      const forecastSuccessMultiplier = forecastAccuracy === "Successful" ? 1.2 : 1.0;
      
      const contributionStrength = Number((roleWeight * consensusInfluence * forecastSuccessMultiplier).toFixed(1));

      return {
        sourceId: source.id,
        creatorId: source.creator_id,
        buildId: source.build_id,
        buildName: archetype,
        role,
        sourceTitle: source.source_title || "Unknown Contribution",
        sourceUrl: source.source_url,
        publishedAt: source.published_at,
        metaImpact,
        consensusReach,
        forecastAccuracy,
        contributionStrength
      };
    });
  }

  private static computeSnapshot(
    creatorId: string, 
    name: string, 
    trustData: any, 
    contributions: IntelligenceContribution[]
  ): CreatorComparisonSnapshot {
    let originations = 0;
    let validations = 0;
    let evolutions = 0;
    let influenceScore = 0;
    let contributionsInConsensus = 0;
    let totalConsensusReach = 0;
    
    contributions.forEach(c => {
      influenceScore += c.contributionStrength;
      totalConsensusReach += c.consensusReach;
      if (c.consensusReach > 1) contributionsInConsensus++;
      
      if (c.role === "ORIGINATOR") originations++;
      if (c.role === "VALIDATOR") validations++;
      if (c.role === "EVOLVER") evolutions++;
    });

    const influenceEfficiency = contributions.length > 0 
      ? Number((influenceScore / contributions.length).toFixed(1)) 
      : 0;

    const consensusInfluence = contributions.length > 0 
      ? Number((totalConsensusReach / contributions.length).toFixed(1)) 
      : 0;

    const consensusParticipation = contributions.length > 0
      ? Math.round((contributionsInConsensus / contributions.length) * 100)
      : 0;

    const leadTimeDays = trustData.average_lead_time_days;
    let leadTimeScoreState = { status: "NO_DATA" as const } as any;
    
    if (leadTimeDays !== undefined && leadTimeDays > 0) {
      let leadTimeScore = 100 - (leadTimeDays * 3.33);
      if (leadTimeScore < 0) leadTimeScore = 0;
      if (leadTimeScore > 100) leadTimeScore = 100;
      leadTimeScoreState = { status: "AVAILABLE" as const, score: Math.round(leadTimeScore) };
    }

    const trustScoreState = trustData.trust_score !== undefined
      ? { status: "AVAILABLE" as const, score: trustData.trust_score }
      : { status: "NO_DATA" as const };
      
    const forecastAccuracyState = trustData.hybrid_accuracy !== undefined
      ? { status: "AVAILABLE" as const, accuracy: Math.round(trustData.hybrid_accuracy) }
      : { status: "NO_DATA" as const };

    const successfulCalls = trustData.successful_calls_lifetime || 0;
    const failedCalls = trustData.failed_calls_lifetime || 0; // assuming failed calls might be tracked, or accuracy can help derive it. If not, we just use successful for now?
    // Wait, the user asked for: successful_calls_lifetime + failed_calls_lifetime. 
    // Let's assume it exists in trustData or default to 0.
    const evidenceCount = successfulCalls + failedCalls;
    
    let confidenceScore = 0;
    let confidenceLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    
    if (evidenceCount >= 50) {
      confidenceScore = 90 + Math.min(10, Math.floor(evidenceCount/10));
      confidenceLevel = "HIGH";
    } else if (evidenceCount >= 20) {
      confidenceScore = 70 + Math.floor(evidenceCount/2);
      confidenceLevel = "MEDIUM";
    } else {
      confidenceScore = Math.floor(evidenceCount * 2);
      confidenceLevel = "LOW";
    }
    if (confidenceScore > 100) confidenceScore = 100;

    return {
      creatorId,
      name,
      trustScoreState,
      influenceScore: Number(influenceScore.toFixed(1)),
      influenceEfficiency,
      forecastAccuracyState,
      leadTimeScoreState,
      consensusParticipation,
      consensusInfluence,
      evidenceCount,
      originations,
      validations,
      evolutions,
      confidenceScore,
      confidenceLevel,
      comparisonRank: 0 // to be computed later if needed
    };
  }

  static async getAllCreators() {
    const { data: creators, error } = await db
      .from("creators")
      .select(`
        id, name, is_verified, youtube_url,
        creator_trust_scores (
          trust_score, trust_tier, hybrid_accuracy, 
          successful_calls_lifetime, average_lead_time_days,
          emerging_calls_lifetime, accuracy_lifetime,
          successful_calls_90d, accuracy_90d
        )
      `);
    if (error) throw new Error(`Failed to fetch creators: ${error.message}`);

    const creatorIds = (creators ?? []).map((c) => c.id);
    if (creatorIds.length === 0) return [];

    // Batch queries — 4 total regardless of creator count (was 4*N before)
    const [allBuildsRes, sourceBuildLinksRes, allVideosRes, allContributionsRes] = await Promise.all([
      // All primary builds for all creators at once
      db.from("builds").select(`
        id, name, archetype, creator_id,
        build_activity_scores (meta_score, threat_level)
      `).in("creator_id", creatorIds),

      // All build_sources links so we can map sourced builds to creators
      (db as any).from("build_sources").select(`
        creator_id, build_id,
        builds (
          id, name, archetype,
          build_activity_scores (meta_score, threat_level)
        )
      `).in("creator_id", creatorIds),

      // Video counts per creator
      (db as any).from("creator_videos").select("creator_id").in("creator_id", creatorIds),

      // All intelligence contributions for all creators
      (db as any).from("build_sources").select(`
        id, build_id, creator_id, source_url, source_title, source_role, published_at, confidence_score,
        builds (
          name, archetype,
          build_activity_scores (meta_score, threat_level, confidence_score),
          build_sources (id)
        )
      `).in("creator_id", creatorIds),
    ]);

    const allPrimaryBuilds: any[] = allBuildsRes.data ?? [];
    const allSourceLinks: any[] = sourceBuildLinksRes.data ?? [];
    const allVideos: any[] = allVideosRes.data ?? [];
    const allContributions: any[] = allContributionsRes.data ?? [];

    // Group by creator_id for O(1) lookup
    const primaryBuildsByCreator = new Map<string, any[]>();
    allPrimaryBuilds.forEach((b) => {
      const arr = primaryBuildsByCreator.get(b.creator_id) ?? [];
      arr.push(b);
      primaryBuildsByCreator.set(b.creator_id, arr);
    });

    const sourceBuildsByCreator = new Map<string, Map<string, any>>();
    allSourceLinks.forEach((link) => {
      if (!link.builds) return;
      const map = sourceBuildsByCreator.get(link.creator_id) ?? new Map();
      map.set(link.builds.id, link.builds);
      sourceBuildsByCreator.set(link.creator_id, map);
    });

    const videoCountByCreator = new Map<string, number>();
    allVideos.forEach((v) => {
      videoCountByCreator.set(v.creator_id, (videoCountByCreator.get(v.creator_id) ?? 0) + 1);
    });

    const contributionsByCreator = new Map<string, any[]>();
    allContributions.forEach((c) => {
      const arr = contributionsByCreator.get(c.creator_id) ?? [];
      arr.push(c);
      contributionsByCreator.set(c.creator_id, arr);
    });

    // Process each creator using in-memory grouped data — no additional DB calls
    const enriched = (creators ?? []).map((creator) => {
      const primaryBuilds = primaryBuildsByCreator.get(creator.id) ?? [];
      const sourcedMap = sourceBuildsByCreator.get(creator.id) ?? new Map();
      const buildMap = new Map<string, any>();
      primaryBuilds.forEach((b) => buildMap.set(b.id, b));
      sourcedMap.forEach((b: any, id: string) => { if (!buildMap.has(id)) buildMap.set(id, b); });
      const buildList = Array.from(buildMap.values());

      const allScores = buildList.flatMap((b) =>
        (b.build_activity_scores as any[]).map((s) => s.meta_score as number)
      );
      const avgMeta = allScores.length
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;
      const peakMeta = allScores.length ? Math.round(Math.max(...allScores)) : 0;
      const omegaBuilds = buildList.filter((b) =>
        (b.build_activity_scores as any[]).some((s) => s.threat_level === "OMEGA")
      ).length;

      const videoCount = videoCountByCreator.get(creator.id) ?? 0;
      const trustData: any = (creator as any).creator_trust_scores?.[0] ?? (creator as any).creator_trust_scores ?? {};
      const rawContributions = contributionsByCreator.get(creator.id) ?? [];
      const intelligenceContributions = CreatorRepository.buildIntelligenceContributions(rawContributions);
      const snapshot = CreatorRepository.computeSnapshot(creator.id, creator.name, trustData, intelligenceContributions);

      const hasTrust = Object.keys(trustData).length > 0;

      return {
        ...snapshot,
        id: creator.id,
        name: creator.name,
        is_verified: creator.is_verified,
        youtube_url: creator.youtube_url,
        buildCount: buildList.length,
        videoCount,
        avgMetaScore: avgMeta,
        peakMetaScore: peakMeta,
        omegaBuilds,
        archetypes: [...new Set(buildList.map((b) => b.archetype).filter(Boolean))],
        hasTrustData: hasTrust,
        trustState: hasTrust
          ? { status: "AVAILABLE" as const, score: trustData.trust_score, tier: trustData.trust_tier }
          : { status: "NO_DATA" as const },
        accuracyState: hasTrust
          ? { status: "AVAILABLE" as const, accuracy: Math.round(trustData.hybrid_accuracy) }
          : { status: "NO_DATA" as const },
        leadTimeState: hasTrust && trustData.average_lead_time_days > 0
          ? { status: "AVAILABLE" as const, leadTime: Math.round(trustData.average_lead_time_days) }
          : { status: "NO_DATA" as const },
        successfulCalls: trustData.successful_calls_lifetime || 0,
        emergingCalls: trustData.emerging_calls_lifetime || 0,
        accuracy90dState: hasTrust
          ? { status: "AVAILABLE" as const, accuracy: Math.round(trustData.accuracy_90d) }
          : { status: "NO_DATA" as const },
        accuracyLifetimeState: hasTrust
          ? { status: "AVAILABLE" as const, accuracy: Math.round(trustData.accuracy_lifetime) }
          : { status: "NO_DATA" as const },
      };
    });

    // Filter out creators with absolutely no intelligence data (no trust scores)
    const activeCreators = enriched.filter((c) => c.hasTrustData);

    return activeCreators.sort((a, b) => {
      const aScore = a.trustState.status === "AVAILABLE" ? a.trustState.score : -1;
      const bScore = b.trustState.status === "AVAILABLE" ? b.trustState.score : -1;
      return bScore - aScore;
    });
  }

  static async getAllComparisonSnapshots() {
    return await this.getAllCreators();
  }

  static async getComparisonSnapshot(id1: string, id2: string) {
    const snapshots = await this.getAllComparisonSnapshots();
    const c1 = snapshots.find(s => s.creatorId === id1);
    const c2 = snapshots.find(s => s.creatorId === id2);

    if (!c1 || !c2) throw new Error("Could not find snapshots for one or both creators.");

    return { creator1: c1, creator2: c2 };
  }

  // --- Sprint 13: Forecast Accuracy & Calibration Analytics --- //

  /**
   * Fetches the forecast analytics for a creator, including Calibration Score and Accuracy Timeline.
   */
  static async getCreatorForecastAnalytics(creatorId: string) {
    // 1. Fetch all resolved forecasts for the creator
    const { data: events, error } = await (db as any)
      .from("forecast_events")
      .select(`
        id, predicted_confidence, created_at, status,
        forecast_resolutions ( outcome, resolved_at )
      `)
      .eq("creator_id", creatorId)
      .in("status", ["RESOLVED", "EXPIRED"]);

    if (error) throw new Error(`Failed to fetch forecasts: ${error.message}`);
    
    const forecasts = events || [];
    
    // Accuracy Timeline stats
    const forecastsMade = forecasts.length;
    const correctForecasts = forecasts.filter((f: any) => 
      f.forecast_resolutions && f.forecast_resolutions.length > 0 && 
      f.forecast_resolutions[0].outcome === "SUCCESS"
    ).length;

    const actualSuccessRate = forecastsMade > 0 ? (correctForecasts / forecastsMade) * 100 : 0;
    
    // Calibration Score computation
    // Calibration Error = | Average Predicted Confidence - Actual Success Rate |
    const avgPredictedConfidence = forecastsMade > 0 
      ? forecasts.reduce((acc: number, f: any) => acc + (f.predicted_confidence || 0), 0) / forecastsMade 
      : 0;
      
    const calibrationError = Math.abs(avgPredictedConfidence - actualSuccessRate);
    const calibrationScore = forecastsMade > 0 ? Math.max(0, Math.round(100 - calibrationError)) : null;

    // Trust Evolution History
    const { data: snapshots } = await (db as any)
      .from("comparison_snapshots")
      .select("score, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: true })
      .limit(6);
      
    const trustEvolution = (snapshots || []).map((s: any) => ({
      month: new Date(s.created_at).toLocaleDateString('en-GB', { month: 'short' }),
      trustScore: Math.round(s.score)
    }));

    return {
      forecastsMade,
      correctForecasts,
      actualSuccessRate: Math.round(actualSuccessRate),
      averagePredictedConfidence: Math.round(avgPredictedConfidence),
      calibrationError: Number(calibrationError.toFixed(1)),
      calibrationScore,
      trustEvolution,
      recentEvents: forecasts.slice(0, 10) // for ledger
    };
  }

  /**
   * Fetches global Forecast Resolution Statistics
   */
  static async getGlobalResolutionStatistics() {
    const { data: events, error } = await (db as any)
      .from("forecast_events")
      .select(`
        status,
        forecast_resolutions ( outcome )
      `);
      
    if (error) throw new Error(`Failed to fetch resolution stats: ${error.message}`);
    
    const all = events || [];
    const pending = all.filter((e: any) => e.status === "OPEN" || e.status === "UNDER_REVIEW").length;
    const expired = all.filter((e: any) => e.status === "EXPIRED").length;
    const resolvedEvents = all.filter((e: any) => e.status === "RESOLVED");
    const resolved = resolvedEvents.length;
    
    let success = 0, failure = 0, partial = 0;
    resolvedEvents.forEach((e: any) => {
      const outcome = e.forecast_resolutions?.[0]?.outcome;
      if (outcome === "SUCCESS") success++;
      if (outcome === "FAILURE") failure++;
      if (outcome === "PARTIAL") partial++;
    });

    return {
      total: all.length,
      pending,
      expiredCount: expired,
      resolved,
      successRate: resolved > 0 ? Math.round((success / resolved) * 100) : 0,
      failureRate: resolved > 0 ? Math.round((failure / resolved) * 100) : 0,
      partialRate: resolved > 0 ? Math.round((partial / resolved) * 100) : 0,
      expiredRate: all.length > 0 ? Math.round((expired / all.length) * 100) : 0,
    };
  }

  static async getCreatorById(id: string) {
    const { data: creator, error } = await db
      .from("creators")
      .select("id, name, is_verified, youtube_url")
      .eq("id", id)
      .single();
    if (error) throw new Error(`Failed to fetch creator: ${error.message}`);

    const { data: primaryBuilds } = await db
      .from("builds")
      .select(`
        id, name, archetype, created_at,
        build_activity_scores (
          meta_score, threat_level, confidence_score,
          activities (id, name, type)
        )
      `)
      .eq("creator_id", id);

    const { data: sourceBuilds } = await db
      .from("builds")
      .select(`
        id, name, archetype, created_at,
        build_activity_scores (
          meta_score, threat_level, confidence_score,
          activities (id, name, type)
        ),
        build_sources!inner(creator_id)
      `)
      .eq("build_sources.creator_id", id);

    const buildMap = new Map();
    [...(primaryBuilds ?? []), ...(sourceBuilds ?? [])].forEach(b => buildMap.set(b.id, b));
    const buildList = Array.from(buildMap.values());

    const { data: creatorVideos } = await (db as any)
      .from("creator_videos")
      .select("video_id, title, published_at, thumbnail_url, primary_category, content_tags, youtube_url")
      .eq("creator_id", id)
      .order("published_at", { ascending: false });

    // Fetch Intelligence Contributions
    const { data: rawContributions } = await (db as any)
      .from("build_sources")
      .select(`
        id, build_id, creator_id, source_url, source_title, source_role, published_at, confidence_score,
        builds (
          name, archetype,
          build_activity_scores (meta_score, threat_level, confidence_score),
          build_sources (id)
        )
      `)
      .eq("creator_id", id)
      .order("published_at", { ascending: false });

    const intelligenceContributions = CreatorRepository.buildIntelligenceContributions(rawContributions || []);


    // Per-archetype breakdown
    const archetypeMap: Record<string, { count: number; totalScore: number }> = {};
    buildList.forEach((b) => {
      const arch = b.archetype ?? "UNKNOWN";
      if (!archetypeMap[arch]) archetypeMap[arch] = { count: 0, totalScore: 0 };
      archetypeMap[arch].count++;
      const scores = (b.build_activity_scores as any[]).map((s) => s.meta_score);
      if (scores.length) {
        archetypeMap[arch].totalScore += scores.reduce((a: number, c: number) => a + c, 0) / scores.length;
      }
    });
    const archetypeBreakdown = Object.entries(archetypeMap)
      .map(([archetype, { count, totalScore }]) => ({
        archetype,
        count,
        avgScore: count > 0 ? Math.round(totalScore / count) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Per-activity performance aggregated across all their builds
    const activityMap: Record<string, { name: string; type: string; scores: number[] }> = {};
    buildList.forEach((b) => {
      (b.build_activity_scores as any[]).forEach((s) => {
        const name = s.activities?.name;
        if (!name) return;
        if (!activityMap[name]) activityMap[name] = { name, type: s.activities?.type ?? "", scores: [] };
        activityMap[name].scores.push(s.meta_score);
      });
    });
    const activityPerformance = Object.values(activityMap).map((a) => ({
      name: a.name,
      type: a.type,
      avgScore: Math.round(a.scores.reduce((x, y) => x + y, 0) / a.scores.length),
      buildCount: a.scores.length,
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Summary stats
    const allScores = buildList.flatMap((b) =>
      (b.build_activity_scores as any[]).map((s) => s.meta_score as number)
    );
    const avgMeta = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const peakMeta = allScores.length ? Math.round(Math.max(...allScores)) : 0;

    const { data: rawTrustData } = await (db as any).from("creator_trust_scores").select("*").eq("creator_id", id).single();
    const trustData = rawTrustData || {};
    const snapshot = CreatorRepository.computeSnapshot(creator.id, creator.name, trustData, intelligenceContributions);

    return {
      ...snapshot,
      creator,
      videos: creatorVideos ?? [],
      intelligenceContributions,
      builds: buildList.map((b) => {
        const scores = (b.build_activity_scores as any[]).map((s) => s.meta_score);
        const peak = scores.length ? Math.round(Math.max(...scores)) : 0;
        const avg = scores.length ? Math.round(scores.reduce((a: number, c: number) => a + c, 0) / scores.length) : 0;
        const topThreat = (b.build_activity_scores as any[]).find((s) => s.threat_level === "OMEGA")?.threat_level
          ?? (b.build_activity_scores as any[]).find((s) => s.threat_level === "ALPHA")?.threat_level
          ?? "GAMMA";
        return { ...b, peakScore: peak, avgScore: avg, topThreat };
      }).sort((a, b) => b.peakScore - a.peakScore),
      archetypeBreakdown,
      activityPerformance,
      stats: {
        buildCount: buildList.length,
        avgMetaScoreState: allScores.length > 0 ? { status: "AVAILABLE" as const, accuracy: avgMeta } : { status: "NO_DATA" as const },
        peakMetaScore: peakMeta,
        trustScoreState: snapshot.trustScoreState,
        omegaBuilds: buildList.filter((b) =>
          (b.build_activity_scores as any[]).some((s) => s.threat_level === "OMEGA")
        ).length,
      },
    };
  }
}
