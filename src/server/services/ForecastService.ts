import { db } from "../db";
import taxonomy from "../data/division2_taxonomy.json";

export class ForecastService {
  /**
   * Generates forecasts for all items in the taxonomy based on video mentions,
   * stages them, and persists them to the meta_forecasts table.
   */
  static async generateAndPersistForecasts() {
    // 1. Fetch videos
    const d2LaunchDate = new Date("2019-03-01T00:00:00Z").getTime();
    const { data: rawVideos, error } = await (db as any)
      .from("creator_videos")
      .select("id, published_at, creators(id, name, is_verified), content_tags")
      .order("published_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch videos: ${error.message}`);
    const videos = rawVideos?.filter((v: any) => new Date(v.published_at).getTime() >= d2LaunchDate) || [];

    // Also fetch creator trust scores to identify Elite analysts
    const { data: trustScores } = await (db as any)
      .from("creator_trust_scores")
      .select("creator_id, trust_tier, trust_score");

    const trustMap = new Map();
    trustScores?.forEach((ts: any) => trustMap.set(ts.creator_id, ts));

    const buildConsensus: Record<string, {
      type: string;
      creators: Set<string>;
      establishedDate: Date | null;
      lastMentionedDate: Date | null;
      mentions30d: number;
      mentions60d: number;
      mentionsPrev30d: number;
      supportingCreators: any[];
    }> = {};

    const activeCreators = new Set(videos.map((v: any) => v.creators?.id).filter(Boolean));
    const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

    const nowTime = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    // 2. Compute metrics
    for (const v of videos) {
      const tags = v.content_tags;
      if (!tags) continue;
      
      const creatorId = (v.creators as any)?.id;
      if (!creatorId) continue;
      
      const publishedDate = new Date(v.published_at);
      const is30d = (nowTime - publishedDate.getTime()) <= thirtyDaysMs;
      const is60d = (nowTime - publishedDate.getTime()) <= sixtyDaysMs;
      const isPrev30d = (nowTime - publishedDate.getTime()) > thirtyDaysMs && (nowTime - publishedDate.getTime()) <= sixtyDaysMs;

      const processTags = (type: string, arr: any[]) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
          if (!buildConsensus[item.slug]) {
            buildConsensus[item.slug] = {
              type,
              creators: new Set(),
              establishedDate: null,
              lastMentionedDate: null,
              mentions30d: 0,
              mentions60d: 0,
              mentionsPrev30d: 0,
              supportingCreators: []
            };
          }
          
          const state = buildConsensus[item.slug];
          
          if (!state.creators.has(creatorId)) {
            state.creators.add(creatorId);
            const ts = trustMap.get(creatorId);
            state.supportingCreators.push({
              id: creatorId,
              name: (v.creators as any).name,
              trustTier: ts?.trust_tier || "MEDIUM",
              trustScoreState: ts 
                ? { status: "AVAILABLE" as const, trustScore: ts.trust_score }
                : { status: "NO_DATA" as const }
            });
          }

          if (!state.establishedDate && state.creators.size >= consensusThreshold) {
            state.establishedDate = publishedDate;
          }

          if (!state.lastMentionedDate || publishedDate > state.lastMentionedDate) {
            state.lastMentionedDate = publishedDate;
          }

          if (is30d) state.mentions30d++;
          if (is60d) state.mentions60d++;
          if (isPrev30d) state.mentionsPrev30d++;
        }
      };

      Object.entries(tags).forEach(([type, tagArray]: [string, any]) => processTags(type, tagArray));
    }

    // 3. Evaluate Forecasts
    const forecastsToUpsert: any[] = [];

    for (const [slug, state] of Object.entries(buildConsensus)) {
      const creatorCount = state.creators.size;
      
      let stage = "";
      if (creatorCount >= consensusThreshold * 2 && state.mentions30d >= 3) {
        stage = "Dominant";
      } else if (creatorCount >= consensusThreshold) {
        if (state.mentions60d === 0 && (nowTime - (state.lastMentionedDate?.getTime() || 0)) > 120 * 24 * 60 * 60 * 1000) {
          stage = "Dead";
        } else if (state.mentions60d === 0) {
          stage = "Declining";
        } else {
          stage = "Established";
        }
      } else if (creatorCount > 0) {
        stage = "Emerging";
      } else {
        continue; // Shouldn't happen if we only process mapped tags
      }

      // Compute MoM Growth
      // If previous month had 0 mentions, but this month has > 0, that's infinite growth. Let's cap it or just use raw difference.
      let growthPercent: number | null = null;
      if (state.mentionsPrev30d === 0 && state.mentions30d > 0) {
        growthPercent = null; // NO_BASELINE
      } else if (state.mentionsPrev30d > 0) {
        growthPercent = Math.round(((state.mentions30d - state.mentionsPrev30d) / state.mentionsPrev30d) * 100);
      }

      // Confidence Score (0-100)
      let confidence = 0;
      const eliteCount = state.supportingCreators.filter(c => c.trustTier === "ELITE" || c.trustTier === "HIGH").length;
      
      // 40% Supporting Creators, 35% Elite Analyst Support, 25% Growth Velocity
      const creatorScore = Math.min(40, (creatorCount / 10) * 40); // Maxes out at 10 creators
      const eliteScore = Math.min(35, (eliteCount / 4) * 35); // Maxes out at 4 elite analysts
      
      let growthScore = 0;
      if (growthPercent !== null && growthPercent > 0) {
        growthScore = Math.min(25, (growthPercent / 100) * 25);
      } else if (stage === "Established" || stage === "Dominant") {
        growthScore = 15; // Baseline for holding steady
      }
      
      confidence = creatorScore + eliteScore + growthScore;
      
      if (stage === "Declining" || stage === "Dead") {
        // High confidence that it's dead if nobody has talked about it
        confidence = Math.min(100, 50 + (120 - Math.min(120, (nowTime - (state.lastMentionedDate?.getTime() || 0))/(1000*60*60*24))));
      }

      confidence = Math.min(100, Math.max(0, Math.round(confidence)));

      // Calculate Forecast Direction
      let direction = "→ Stable";
      if (growthPercent !== null) {
        if (growthPercent > 10) {
          direction = "↑ Accelerating";
        } else if (growthPercent < -10) {
          direction = "↓ Slowing";
        }
      }

      // Sort supporting creators by trust score descending, putting NO_DATA at the end
      const sortedCreators = state.supportingCreators.sort((a, b) => {
        const aScore = a.trustScoreState.status === "AVAILABLE" ? a.trustScoreState.trustScore : -1;
        const bScore = b.trustScoreState.status === "AVAILABLE" ? b.trustScoreState.trustScore : -1;
        return bScore - aScore;
      });

      forecastsToUpsert.push({
        slug,
        domain_type: state.type,
        confidenceState: creatorCount >= consensusThreshold 
          ? { status: "AVAILABLE" as const, confidenceScore: confidence }
          : { status: "INSUFFICIENT_EVIDENCE" as const, evidenceCount: creatorCount },
        supporting_creators_count: creatorCount,
        elite_analyst_count: eliteCount,
        forecast_direction: direction,
        supporting_creators: sortedCreators,
        growth_state: growthPercent !== null ? "ESTABLISHED" : "NO_BASELINE",
        growth_metric: growthPercent !== null ? growthPercent : 0
      });
    }

    // 4. Persist to DB
    if (forecastsToUpsert.length > 0) {
      const { error: upsertError } = await (db as any)
        .from("meta_forecasts")
        .upsert(forecastsToUpsert, { onConflict: "slug" });
        
      if (upsertError) {
        console.error("Failed to upsert forecasts:", upsertError);
      }
    }

    return forecastsToUpsert.length;
  }
}
