import { db } from "../db";

export class TrendingService {
  private static computeMetricsFromVideos(videos: any[], days: number) {
    interface RawMetrics {
      slug: string;
      displayName: string;
      videoCount: number;
      creators: Set<string>;
      mentionScore: number;
      daysActive: Set<string>;
    }

    const gearsets: Record<string, RawMetrics> = {};
    const weapons: Record<string, RawMetrics> = {};
    const activities: Record<string, RawMetrics> = {};
    const creatorsObj: Record<string, RawMetrics> = {};

    const nowTime = Date.now();

    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags) continue;

      const creator = v.creators as any;
      if (!creator) continue;
      
      const creatorName = creator.name;
      const creatorId = creator.id;
      const isVerified = creator.is_verified === true;
      const creatorAuth = isVerified ? 1.5 : 1.0;
      
      const published = new Date(v.published_at);
      const daysAgo = Math.max(0, (nowTime - published.getTime()) / (1000 * 60 * 60 * 24));
      const recency = Math.max(0.1, 1.0 - (daysAgo / days)); // 1.0 today, ~0.1 at 14 days
      
      const baseScore = 1.0 * creatorAuth * recency;
      const dayKey = published.toISOString().split("T")[0];

      const addMetrics = (record: Record<string, RawMetrics>, slug: string, displayName: string) => {
        if (!record[slug]) {
          record[slug] = { slug, displayName, videoCount: 0, creators: new Set(), mentionScore: 0, daysActive: new Set() };
        }
        record[slug].videoCount++;
        record[slug].creators.add(creatorName);
        record[slug].mentionScore += baseScore;
        record[slug].daysActive.add(dayKey);
      };

      // Creators
      addMetrics(creatorsObj, creatorName, creatorName);

      // Gearsets
      if (Array.isArray(tags.gearset)) {
        tags.gearset.forEach((g: any) => addMetrics(gearsets, g.slug, g.displayName));
      }

      // Weapons
      if (Array.isArray(tags.weapons)) {
        tags.weapons.forEach((w: any) => addMetrics(weapons, w.slug, w.displayName));
      }

      // Activities
      if (Array.isArray(tags.activity)) {
        tags.activity.forEach((a: any) => addMetrics(activities, a.slug, a.displayName));
      }
    }

    const computeFinalScore = (metrics: RawMetrics) => {
      const creatorCount = metrics.creators.size;
      const videoCount = metrics.videoCount;
      const daysCount = metrics.daysActive.size;

      const diversityScore = Math.min(40, (creatorCount / 5) * 40);
      const volumeScore = Math.min(30, (videoCount / 10) * 30);
      const consistencyScore = Math.min(30, (daysCount / 7) * 30);
      
      const confidenceScore = Math.round(diversityScore + volumeScore + consistencyScore);
      const confidenceMultiplier = 0.5 + (confidenceScore / 200);

      const consensusMultiplier = 1 + Math.log2(Math.max(1, creatorCount));

      const metaScoreRaw = metrics.mentionScore * consensusMultiplier * confidenceMultiplier;
      const metaScore = Math.round(metaScoreRaw * 10);

      let confidenceLabel = "Low";
      if (confidenceScore >= 70) confidenceLabel = "High";
      else if (confidenceScore >= 40) confidenceLabel = "Medium";

      const creatorNames = Array.from(metrics.creators).map(name => name); // It's storing creatorName now, not id

      return {
        slug: metrics.slug,
        displayName: metrics.displayName,
        metaScore,
        confidenceScore,
        confidenceLabel,
        creatorCount,
        videoCount,
        creators: creatorNames,
        mentions: videoCount 
      };
    };

    const processMap = (record: Record<string, RawMetrics>) => {
      return Object.values(record)
        .map(computeFinalScore)
        .sort((a, b) => b.metaScore - a.metaScore)
        .slice(0, 10);
    };

    return {
      gearsets: processMap(gearsets),
      weapons: processMap(weapons),
      activities: processMap(activities),
      creators: processMap(creatorsObj),
    };
  }

  /**
   * Calculates trending items over a specific time window
   * @param days Window size (default 14 days)
   */
  static async getTrending(days = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { data: videos, error } = await (db as any)
      .from("creator_videos")
      .select("content_tags, published_at, creators(id, name, is_verified)")
      .gte("published_at", cutoffDate.toISOString());

    if (error) throw new Error(`Failed to fetch recent videos: ${error.message}`);

    const res = this.computeMetricsFromVideos(videos ?? [], days);

    return {
      timeframeDays: days,
      videosAnalyzed: videos ? videos.length : 0,
      trendingGearsets: res.gearsets,
      trendingWeapons: res.weapons,
      trendingActivities: res.activities,
      trendingCreators: res.creators,
    };
  }

  static async getConsensusSignals(days = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { data: videos } = await (db as any)
      .from("creator_videos")
      .select("content_tags, creators(id, name)")
      .gte("published_at", cutoffDate.toISOString());

    const combinations: Record<string, { display: string, creators: Set<string>, videos: number }> = {};

    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags || !tags.gearset || !tags.weapons) continue;
      const creatorId = (v.creators as any)?.id;
      if (!creatorId) continue;

      // Find overlapping gearsets and weapons in the same video
      tags.gearset.forEach((g: any) => {
        tags.weapons.forEach((w: any) => {
          const key = `${g.slug}+${w.slug}`;
          if (!combinations[key]) {
            combinations[key] = { display: `${g.displayName} + ${w.displayName}`, creators: new Set(), videos: 0 };
          }
          combinations[key].creators.add(creatorId);
          combinations[key].videos++;
        });
      });
    }

    return Object.values(combinations)
      .filter((c) => c.creators.size >= 2) // Minimum threshold for consensus
      .map((c) => ({
        display: c.display,
        creatorCount: c.creators.size,
        videoCount: c.videos
      }))
      .sort((a, b) => b.creatorCount - a.creatorCount)
      .slice(0, 10);
  }

  static async getPatchImpact(days = 14) {
    const now = new Date();
    const midDate = new Date();
    midDate.setDate(now.getDate() - days);
    const oldDate = new Date();
    oldDate.setDate(now.getDate() - (days * 2));

    const { data: currentVideos } = await (db as any)
      .from("creator_videos")
      .select("content_tags, published_at, creators(id, name, is_verified)")
      .gte("published_at", midDate.toISOString());

    const { data: oldVideos } = await (db as any)
      .from("creator_videos")
      .select("content_tags, published_at, creators(id, name, is_verified)")
      .gte("published_at", oldDate.toISOString())
      .lt("published_at", midDate.toISOString());

    const currentMetrics = this.computeMetricsFromVideos(currentVideos ?? [], days);
    const oldMetrics = this.computeMetricsFromVideos(oldVideos ?? [], days);

    const calculateDeltas = (current: any[], old: any[]) => {
      const oldMap = new Map(old.map((x) => [x.slug, x]));
      const currentMap = new Map(current.map((x) => [x.slug, x]));
      const allSlugs = new Set([...oldMap.keys(), ...currentMap.keys()]);
      
      const deltas = [];
      for (const slug of allSlugs) {
        const c = currentMap.get(slug) || { slug, metaScore: 0, creatorCount: 0 };
        const o = oldMap.get(slug);
        
        const displayName = currentMap.get(slug)?.displayName || oldMap.get(slug)?.displayName;
        const previousScore = o ? o.metaScore : undefined;
        
        let growthState: "ESTABLISHED" | "NEW_ENTRY" | "NO_BASELINE" = "ESTABLISHED";
        let delta = 0;
        let growthPercent = 0;
        
        if (previousScore === undefined) {
          growthState = "NEW_ENTRY";
          delta = c.metaScore;
          growthPercent = 100;
        } else if (previousScore === 0) {
          growthState = "NO_BASELINE";
          delta = c.metaScore;
          growthPercent = 100;
        } else {
          delta = c.metaScore - previousScore;
          growthPercent = Math.round((delta / previousScore) * 100);
          // Cap astronomically high percentages that look fake in small test environments
          if (growthPercent > 999) growthPercent = 999;
          if (growthPercent < -99) growthPercent = -100;
        }

        deltas.push({ ...c, displayName, delta, growthPercent, previousScore, growthState });
      }
      return deltas;
    };

    const gearsetDeltas = calculateDeltas(currentMetrics.gearsets, oldMetrics.gearsets);
    const weaponDeltas = calculateDeltas(currentMetrics.weapons, oldMetrics.weapons);
    
    const allDeltas = [...gearsetDeltas, ...weaponDeltas];

    const mostIncreased = [...allDeltas].sort((a, b) => b.delta - a.delta).filter(x => x.delta > 0).slice(0, 5);
    const mostDecreased = [...allDeltas].sort((a, b) => a.delta - b.delta).filter(x => x.delta < 0).slice(0, 5);
    const fastestGrowing = [...allDeltas]
      .filter(x => x.creatorCount >= 2 && x.growthState === "ESTABLISHED" && x.growthPercent > 0)
      .sort((a, b) => b.growthPercent - a.growthPercent)
      .slice(0, 5);

    return {
      mostIncreased,
      mostDecreased,
      fastestGrowing
    };
  }

  static async getMetaLifecycleStatus(slug: string, type: "gearset" | "weapons") {
    // Determine lifecycle state (Emerging, Established, Dominant, Standard, Declining, Dead)
    // 1. Fetch last 30 days of videos to check for Dead Meta
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const filter = type === "gearset" ? { gearset: [{ slug }] } : { weapons: [{ slug }] };

    const { data: videos30d } = await (db as any)
      .from("creator_videos")
      .select("published_at, creators(id)")
      .contains("content_tags", filter)
      .gte("published_at", thirtyDaysAgo.toISOString());

    const videosCount30d = videos30d ? videos30d.length : 0;

    // 2. Fetch patch impact to check for Declining
    const impact = await this.getPatchImpact(14);
    const allDeltas = type === "gearset" ? impact.mostDecreased.concat(impact.mostIncreased) : impact.mostDecreased.concat(impact.mostIncreased); // We need the specific item
    // Wait, getPatchImpact only returns top 5. We need to run the deltas for this specific item.
    
    const midDate = new Date();
    midDate.setDate(now.getDate() - 14);
    const oldDate = new Date();
    oldDate.setDate(now.getDate() - 28);

    const { data: currentVideos } = await (db as any)
      .from("creator_videos")
      .select("content_tags, published_at, creators(id, name, is_verified)")
      .contains("content_tags", filter)
      .gte("published_at", midDate.toISOString());

    const { data: oldVideos } = await (db as any)
      .from("creator_videos")
      .select("content_tags, published_at, creators(id, name, is_verified)")
      .contains("content_tags", filter)
      .gte("published_at", oldDate.toISOString())
      .lt("published_at", midDate.toISOString());

    const currentMetrics = this.computeMetricsFromVideos(currentVideos ?? [], 14);
    const oldMetrics = this.computeMetricsFromVideos(oldVideos ?? [], 14);

    const currentItem = type === "gearset" 
      ? currentMetrics.gearsets.find(g => g.slug === slug) 
      : currentMetrics.weapons.find(w => w.slug === slug);
      
    const oldItem = type === "gearset"
      ? oldMetrics.gearsets.find(g => g.slug === slug)
      : oldMetrics.weapons.find(w => w.slug === slug);

    const currentScore = currentItem?.metaScore;
    const oldScore = oldItem?.metaScore;
    const currentCreators = currentItem?.creatorCount ?? 0;
    const oldCreators = oldItem?.creatorCount ?? 0;

    // Check Dead Meta
    // 0 videos in 30 days and consensus below Established (< 5)
    // Wait, if 0 videos in 30 days, currentCreators is 0. 0 < 5.
    if (videosCount30d === 0) {
      return "Dead Meta";
    }

    // Check Declining
    // Score down > 25% and creator count decreasing
    if (oldScore !== undefined && currentScore !== undefined && oldScore > 0) {
      const dropPercent = ((oldScore - currentScore) / oldScore) * 100;
      if (dropPercent > 25 && currentCreators < oldCreators) {
        return "Declining";
      }
    }

    // Standard lifecycle based on current 14-day creator count
    if (currentCreators >= 12) return "Community Standard";
    if (currentCreators >= 8) return "Dominant Meta";
    if (currentCreators >= 5) return "Established Meta";
    if (currentCreators >= 3) return "Emerging Meta";
    
    return "Fringe";
  }
}
