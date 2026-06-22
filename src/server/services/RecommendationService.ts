import { db } from "../db";
import { TrendingService } from "./TrendingService";
import { ValidationService } from "./ValidationService";
import { TrustService } from "./TrustService";
import { PatchService } from "./PatchService";

export interface RecommendationBuild {
  id: string;
  gearset: { slug: string; displayName: string };
  weapon: { slug: string; displayName: string };
  metaScore: number;
  confidence: number;
  stability: number;
  consensus: number;
  creators: string[];
  daysOld: number;
  lastVerifiedDays: number;
  lifecycle: string;
}

export class RecommendationService {
  private static calculateRecommendationScore(build: RecommendationBuild, type: string): number {
    let score = 0;
    
    // Normalize metrics to 0-100 range first
    const normMeta = Math.min(100, build.metaScore / 5); // Assuming max meta is around 500ish, we normalize
    const normConf = build.confidence;
    const normStab = build.stability;
    const normCons = Math.min(100, (build.consensus / 12) * 100);

    if (type === "Meta Pick") {
      score = (normMeta * 0.40) + (normCons * 0.25) + (normConf * 0.20) + (normStab * 0.15);
    } else if (type === "Safe Pick") {
      // Hardcode survivability bump for now
      const survivability = build.gearset.slug.includes("foundry") || build.gearset.slug.includes("vanguard") || build.gearset.slug.includes("gila") ? 100 : 50;
      score = (normConf * 0.40) + (normStab * 0.30) + (normCons * 0.20) + (survivability * 0.10);
    } else if (type === "Emerging Pick") {
      const trustScore = 80; // Default placeholder for trust, could be dynamic based on creator trust tiers
      const growthScore = 80; // Placeholder for growth
      score = (trustScore * 0.35) + (growthScore * 0.30) + (normConf * 0.20) + (normCons * 0.15);
    } else if (type === "Returning Agent Pick") {
      const easeOfUse = build.gearset.slug.includes("striker") || build.gearset.slug.includes("hunters") ? 90 : 50;
      score = (easeOfUse * 0.40) + (normConf * 0.30) + (normStab * 0.30);
    } else if (type === "Alternative Pick") {
      score = (normMeta * 0.35) + (normConf * 0.25) + (normCons * 0.25) + (normStab * 0.15);
    }

    return Math.round(score);
  }

  private static calculateProfileMatchScore(build: RecommendationBuild, activity: string, playstyle?: string, groupSize?: string) {
    if (!playstyle && !groupSize) return 0; // No profile configured

    // 40% Activity Match
    let activityMatch = 40; // Assume we already filtered videos by activity to get these builds, so they match inherently. But let's verify.
    // If we wanted strict activity parsing: e.g. Raid builds vs Legendary. We assume if it's in the activity fetch, it's viable.

    // 35% Playstyle Match
    let playstyleMatch = 0;
    const gSlug = build.gearset.slug;
    
    // DPS
    if (playstyle === "Aggressive DPS") {
      if (gSlug.includes("striker") || gSlug.includes("hunters") || gSlug.includes("heartbreaker") || gSlug.includes("ongoing")) playstyleMatch = 40;
      else if (gSlug.includes("future") || gSlug.includes("foundry")) playstyleMatch = 0; // Penalize healer/tank for DPS player
      else playstyleMatch = 15;
    }
    // Healer
    else if (playstyle === "Support / Healer") {
      if (gSlug.includes("future") || gSlug.includes("eclipse") || gSlug.includes("true-patriot")) playstyleMatch = 40;
      else if (gSlug.includes("striker") || gSlug.includes("hunters")) playstyleMatch = 0;
      else playstyleMatch = 15;
    }
    // Tank
    else if (playstyle === "Tank / Bruiser") {
      if (gSlug.includes("foundry") || gSlug.includes("vanguard") || gSlug.includes("gila")) playstyleMatch = 40;
      else if (gSlug.includes("hotshot") || gSlug.includes("aces")) playstyleMatch = 0;
      else playstyleMatch = 15;
    }
    // Sniper
    else if (playstyle === "Sniper / Marksman") {
      if (gSlug.includes("hotshot") || gSlug.includes("aces") || gSlug.includes("mantis")) playstyleMatch = 40;
      else if (gSlug.includes("foundry") || gSlug.includes("striker")) playstyleMatch = 0;
      else playstyleMatch = 15;
    }
    // Default
    else {
      playstyleMatch = 15;
    }

    // 25% Group Size Match
    let groupSizeMatch = 0;
    if (groupSize === "Solo") {
      if (build.stability >= 80 || playstyleMatch === 35) groupSizeMatch = 25; // Good for solo
      else groupSizeMatch = 10;
    } else if (groupSize === "Raid (8)") {
      if (playstyleMatch === 35 || build.consensus > 5) groupSizeMatch = 25;
      else groupSizeMatch = 10;
    } else {
      groupSizeMatch = 25; // Duo / 4-man is generally flexible
    }

    return activityMatch + playstyleMatch + groupSizeMatch;
  }

  static async getRecommendations(activity: string, playstyle?: string, groupSize?: string) {
    // 1. Fetch videos for this activity in the last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const activityLower = activity.toLowerCase().replace(/\s+/g, '-');
    
    let { data: videos } = await (db as any)
      .from("creator_videos")
      .select("published_at, content_tags, creators(id, name, is_verified)")
      .contains("content_tags", { activity: [{ slug: activityLower }] })
      .gte("published_at", cutoffDate.toISOString());

    // If no videos found for specific activity, fallback to global to prevent empty state
    let isGlobalFallback = false;
    if (!videos || videos.length === 0) {
      const { data: globalVideos } = await (db as any)
        .from("creator_videos")
        .select("published_at, content_tags, creators(id, name, is_verified)")
        .gte("published_at", cutoffDate.toISOString());
      videos = globalVideos;
      isGlobalFallback = true;
    }

    const combinations = new Map<string, any>();
    const nowTime = Date.now();

    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags || !tags.gearset) continue;
      
      const allWeapons = [
        ...(tags.weapons || []),
        ...(tags.exotic_weapon || []),
        ...(tags.named_weapon || [])
      ];
      
      if (allWeapons.length === 0) continue;
      
      const creatorName = (v.creators as any)?.name;
      if (!creatorName) continue;
      
      const published = new Date(v.published_at);
      const daysAgo = Math.floor(Math.max(0, (nowTime - published.getTime()) / (1000 * 60 * 60 * 24)));

      tags.gearset.forEach((g: any) => {
        allWeapons.forEach((w: any) => {
          const key = `${g.slug}+${w.slug}`;
          if (!combinations.has(key)) {
            combinations.set(key, {
              id: key,
              gearset: g,
              weapon: w,
              metaScore: 0,
              creators: new Set(),
              oldestVideo: daysAgo,
              newestVideo: daysAgo
            });
          }
          
          const entry = combinations.get(key);
          entry.creators.add(creatorName);
          entry.oldestVideo = Math.max(entry.oldestVideo, daysAgo);
          entry.newestVideo = Math.min(entry.newestVideo, daysAgo);
        });
      });
    }

    // 2. Process combinations into RecommendationBuilds
    const builds: RecommendationBuild[] = [];
    let validCombinations = Array.from(combinations.entries()).filter(([_, c]) => c.creators.size >= 1);
    
    // If we couldn't form ANY valid combinations (e.g. videos had no weapons), fallback to Global!
    if (validCombinations.length === 0 && !isGlobalFallback) {
      const { data: globalVideos } = await (db as any)
        .from("creator_videos")
        .select("published_at, content_tags, creators(id, name, is_verified)")
        .gte("published_at", cutoffDate.toISOString());
        
      combinations.clear();
      
      for (const v of globalVideos ?? []) {
        const tags = v.content_tags;
        if (!tags || !tags.gearset) continue;
        
        const allWeapons = [
          ...(tags.weapons || []),
          ...(tags.exotic_weapon || []),
          ...(tags.named_weapon || [])
        ];
        
        if (allWeapons.length === 0) continue;
        
        const creatorName = (v.creators as any)?.name;
        if (!creatorName) continue;
        
        const published = new Date(v.published_at);
        const daysAgo = Math.floor(Math.max(0, (nowTime - published.getTime()) / (1000 * 60 * 60 * 24)));

        tags.gearset.forEach((g: any) => {
          allWeapons.forEach((w: any) => {
            const key = `${g.slug}+${w.slug}`;
            if (!combinations.has(key)) {
              combinations.set(key, {
                id: key,
                gearset: g,
                weapon: w,
                metaScore: 0,
                creators: new Set(),
                oldestVideo: daysAgo,
                newestVideo: daysAgo
              });
            }
            
            const entry = combinations.get(key);
            entry.creators.add(creatorName);
            entry.oldestVideo = Math.max(entry.oldestVideo, daysAgo);
            entry.newestVideo = Math.min(entry.newestVideo, daysAgo);
          });
        });
      }
      validCombinations = Array.from(combinations.entries()).filter(([_, c]) => c.creators.size >= 1);
    }
    
    // Extract unique gearsets
    const uniqueGearsets = Array.from(new Set(validCombinations.map(([_, c]) => c.gearset.slug)));
    
    // Fetch all lifecycle statuses in parallel
    const lifecycleStatuses = await Promise.all(
      uniqueGearsets.map(slug => TrendingService.getMetaLifecycleStatus(slug, "gearset"))
    );
    
    // Fetch dynamic meta scores from TrendingService
    const trendingData = await TrendingService.getTrending(30);
    const gearsetScores = new Map(trendingData.trendingGearsets.map(g => [g.slug, g.metaScore]));
    const weaponScores = new Map(trendingData.trendingWeapons.map(w => [w.slug, w.metaScore]));
    
    const lifecycleCache = new Map<string, string>();
    uniqueGearsets.forEach((slug, index) => {
      lifecycleCache.set(slug, lifecycleStatuses[index]);
    });
    
    for (const [key, c] of validCombinations) {
      const lifecycle = lifecycleCache.get(c.gearset.slug) || "Community Standard";
      
      // Use real dynamic meta scores from the database
      const gScore = gearsetScores.get(c.gearset.slug) || 10;
      const wScore = weaponScores.get(c.weapon.slug) || 10;
      const realMetaScore = Math.round((gScore + wScore) / 2);
      
      // Calculate derived metrics
      const confidence = Math.min(100, Math.round((c.creators.size / 5) * 50 + (realMetaScore / 50) * 50));
      const stability = lifecycle.includes("Standard") || lifecycle.includes("Dominant") ? 95 : lifecycle.includes("Established") ? 80 : 60;
      
      builds.push({
        id: key,
        gearset: c.gearset,
        weapon: c.weapon,
        metaScore: realMetaScore,
        confidence,
        stability,
        consensus: c.creators.size,
        creators: Array.from(c.creators),
        daysOld: c.oldestVideo || 1, // Use actual real-time oldest video age
        lastVerifiedDays: c.newestVideo || 0,
        lifecycle
      });
    }

    // Sort by base meta score first
    builds.sort((a, b) => b.metaScore - a.metaScore);

    if (builds.length === 0) return null;

    // 3. Select the 5 picks
    // Make sure we have enough distinct builds to avoid duplicates!
    const getDistinct = (excludeIds: string[], condition?: (b: RecommendationBuild) => boolean) => {
      const candidates = condition ? builds.filter(condition) : builds;
      return candidates.find(b => !excludeIds.includes(b.id));
    };

    const metaPickRaw = builds[0];
    const pickedIds = [metaPickRaw.id];
    
    // Alternative Pick: High meta, DIFFERENT gearset
    const altPickRaw = getDistinct(pickedIds, b => b.gearset.slug !== metaPickRaw.gearset.slug) || getDistinct(pickedIds) || builds[0];
    pickedIds.push(altPickRaw.id);
    
    // Safe Pick: Highest stability & confidence
    const sortedSafe = [...builds].sort((a, b) => (b.stability + b.confidence) - (a.stability + a.confidence));
    const safePickRaw = sortedSafe.find(b => !pickedIds.includes(b.id)) || getDistinct(pickedIds) || builds[0];
    pickedIds.push(safePickRaw.id);
    
    // Emerging Pick
    const emergingPickRaw = getDistinct(pickedIds, b => b.lifecycle === "Emerging Meta") || getDistinct(pickedIds) || builds[0];
    pickedIds.push(emergingPickRaw.id);
    
    // Returning Agent Pick
    const sortedReturning = [...builds].sort((a, b) => {
      const aEase = a.gearset.slug.includes("striker") ? 100 : 0;
      const bEase = b.gearset.slug.includes("striker") ? 100 : 0;
      return (bEase + b.stability) - (aEase + a.stability);
    });
    const returningPickRaw = sortedReturning.find(b => !pickedIds.includes(b.id)) || getDistinct(pickedIds) || builds[0];
    pickedIds.push(returningPickRaw.id);

    // Personalized Pick: Highest Profile Match
    let personalizedPickRaw = builds[0];
    let maxMatchScore = 0;

    if (playstyle || groupSize) {
      // Find the absolute highest match score
      builds.forEach(b => {
        const match = this.calculateProfileMatchScore(b, activity, playstyle, groupSize);
        if (match > maxMatchScore) {
          maxMatchScore = match;
          personalizedPickRaw = b;
        } else if (match === maxMatchScore && maxMatchScore > 0) {
          // Tie breaker: if scores are equal, prefer the one with highest meta score
          if (b.metaScore > personalizedPickRaw.metaScore) {
            personalizedPickRaw = b;
          }
        }
      });
      
      // If the personalized pick ended up being the EXACT SAME as the meta pick,
      // and there are other builds with the SAME match score, pick the next one to show variety!
      if (personalizedPickRaw.id === metaPickRaw.id) {
         const alternativeMatches = builds.filter(b => 
            b.id !== metaPickRaw.id && 
            this.calculateProfileMatchScore(b, activity, playstyle, groupSize) === maxMatchScore
         );
         if (alternativeMatches.length > 0) {
           personalizedPickRaw = alternativeMatches[0];
         }
      }
    }

    const formatPick = (pick: RecommendationBuild, type: string, title: string, reason: string) => {
      return {
        ...pick,
        recommendationScore: this.calculateRecommendationScore(pick, type),
        profileMatchScore: this.calculateProfileMatchScore(pick, activity, playstyle, groupSize),
        title,
        reason
      };
    };

    return {
      meta: formatPick(metaPickRaw, "Meta Pick", `Best Build For ${activity}`, "Mathematically optimal for clear speed and scaling."),
      personalized: (playstyle || groupSize) ? formatPick(personalizedPickRaw, "Safe Pick", "Best Build For You", "Perfectly matches your Agent Profile.") : null,
      alternative: formatPick(altPickRaw, "Alternative Pick", "Off-Meta Alternative", "High viability with a different core archetype."),
      safe: formatPick(safePickRaw, "Safe Pick", "Safe Pick", "Extreme survivability and consistency."),
      emerging: formatPick(emergingPickRaw, "Emerging Pick", "Emerging Pick", "Adopted heavily by Top Forecasters."),
      returning: formatPick(returningPickRaw, "Returning Agent Pick", "Returning Agent Pick", "Easy to Farm, Current Patch Viable, Low Complexity.")
    };
  }

  static async getAllBuilds(activityContext: string = "Global") {
    // 1. Fetch videos in the last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    let query = (db as any)
      .from("creator_videos")
      .select("published_at, content_tags, creators(id, name, is_verified)")
      .gte("published_at", cutoffDate.toISOString());

    if (activityContext !== "Global") {
      query = query.contains("content_tags", { activity: [{ slug: activityContext.toLowerCase() }] });
    }

    const { data: videos } = await query;

    const combinations = new Map<string, any>();
    const nowTime = Date.now();

    for (const v of videos ?? []) {
      const tags = v.content_tags;
      if (!tags || !tags.gearset) continue;
      
      const allWeapons = [
        ...(tags.weapons || []),
        ...(tags.exotic_weapon || []),
        ...(tags.named_weapon || [])
      ];

      if (allWeapons.length === 0) continue;
      
      const creatorName = (v.creators as any)?.name;
      if (!creatorName) continue;
      
      const published = new Date(v.published_at);
      const daysAgo = Math.floor(Math.max(0, (nowTime - published.getTime()) / (1000 * 60 * 60 * 24)));

      tags.gearset.forEach((g: any) => {
        allWeapons.forEach((w: any) => {
          const key = `${g.slug}+${w.slug}`;
          if (!combinations.has(key)) {
            combinations.set(key, {
              id: key,
              gearset: g,
              weapon: w,
              metaScore: 0,
              creators: new Set(),
              oldestVideo: daysAgo,
              newestVideo: daysAgo
            });
          }
          
          const entry = combinations.get(key);
          entry.creators.add(creatorName);
          entry.oldestVideo = Math.max(entry.oldestVideo, daysAgo);
          entry.newestVideo = Math.min(entry.newestVideo, daysAgo);
        });
      });
    }

    const builds: any[] = [];
    const validCombinations = Array.from(combinations.entries()).filter(([_, c]) => c.creators.size >= 1);
    
    // Extract unique gearsets
    const uniqueGearsets = Array.from(new Set(validCombinations.map(([_, c]) => c.gearset.slug)));
    
    // Fetch all lifecycle statuses in parallel
    const lifecycleStatuses = await Promise.all(
      uniqueGearsets.map(slug => TrendingService.getMetaLifecycleStatus(slug, "gearset"))
    );
    
    // Fetch dynamic meta scores from TrendingService
    const trendingData = await TrendingService.getTrending(30);
    const gearsetScores = new Map(trendingData.trendingGearsets.map(g => [g.slug, g.metaScore]));
    const weaponScores = new Map(trendingData.trendingWeapons.map(w => [w.slug, w.metaScore]));
    
    const lifecycleCache = new Map<string, string>();
    uniqueGearsets.forEach((slug, index) => {
      lifecycleCache.set(slug, lifecycleStatuses[index]);
    });
    
    // Fetch validation stats in parallel
    const validationStats = await Promise.all(
      validCombinations.map(([key, _]) => ValidationService.getValidationStats(key, "build"))
    );

    let statIndex = 0;
    for (const [key, c] of validCombinations) {
      const lifecycle = lifecycleCache.get(c.gearset.slug) || "Community Standard";
      
      // Use real dynamic meta scores from the database
      const gScore = gearsetScores.get(c.gearset.slug) || 10;
      const wScore = weaponScores.get(c.weapon.slug) || 10;
      const realMetaScore = Math.round((gScore + wScore) / 2);
      
      const confidence = Math.min(100, Math.round((c.creators.size / 5) * 50 + (realMetaScore / 50) * 50));
      const stability = lifecycle.includes("Standard") || lifecycle.includes("Dominant") ? 95 : lifecycle.includes("Established") ? 80 : 60;
      
      // Best For Tags Logic
      const bestFor = [];
      const gSlug = c.gearset.slug;
      if (gSlug.includes("striker") || gSlug.includes("hunters")) bestFor.push("Solo DPS", "Speed Runs");
      else if (gSlug.includes("future") || gSlug.includes("eclipse")) bestFor.push("Group Support", "Healing");
      else if (gSlug.includes("foundry") || gSlug.includes("vanguard")) bestFor.push("Tanking", "High Threat");
      else if (gSlug.includes("hotshot") || gSlug.includes("aces")) bestFor.push("Sniper", "Long Range");
      
      if (activityContext !== "Global") {
        bestFor.unshift(activityContext); // Put the exact activity at the front if scoped
      } else {
        if (gSlug.includes("striker") || gSlug.includes("hunters")) bestFor.push("Legendary", "Countdown");
        if (gSlug.includes("future") || gSlug.includes("foundry")) bestFor.push("Raid", "Incursion");
      }

      // Use actual community approval from ValidationService
      const stats = validationStats[statIndex++];
      const communityApproval = stats.hasEnoughData ? stats.approvalPercent : 0;

      builds.push({
        id: key,
        gearset: c.gearset,
        weapon: c.weapon,
        metaScore: realMetaScore,
        confidence,
        stability,
        consensus: c.creators.size,
        creators: Array.from(c.creators),
        communityApproval: Math.round(communityApproval),
        bestFor: Array.from(new Set(bestFor)).slice(0, 3), // Max 3 tags
        lifecycle
      });
    }

    builds.sort((a, b) => b.metaScore - a.metaScore);
    return builds;
  }
}
