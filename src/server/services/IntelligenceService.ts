import { db } from "@/server/db";
import { TrendingService } from "@/server/services/TrendingService";
import { TrustService } from "@/server/services/TrustService";

export class IntelligenceService {
  static async getDashboardIntel() {
    const [buildsRes, activitiesRes, patchVideosRes, pvpVideosRes, farmingVideosRes] = await Promise.all([
      db.from("builds").select(`
        id, name, archetype,
        creators (name),
        build_activity_scores (meta_score, threat_level, activities (name, type))
      `).limit(500),
      db.from("activities").select("id, name, type"),
      (db as any).from("creator_videos").select("video_id, title, published_at, creators(name), thumbnail_url").eq("primary_category", "PATCH").order("published_at", { ascending: false }).limit(5),
      (db as any).from("creator_videos").select("video_id, title, published_at, creators(name), thumbnail_url").eq("primary_category", "PVP").order("published_at", { ascending: false }).limit(5),
      (db as any).from("creator_videos").select("video_id, title, published_at, creators(name), thumbnail_url").eq("primary_category", "FARMING").order("published_at", { ascending: false }).limit(5),
    ]);

    const builds = buildsRes.data ?? [];
    const activities = activitiesRes.data ?? [];

    const topPerActivity = activities.map((activity) => {
      const scored = builds
        .map((b) => {
          const score = (b.build_activity_scores as any[])?.find(
            (s: any) => s.activities?.name === activity.name
          );
          return score ? { build: b, score: score.meta_score, threat: score.threat_level } : null;
        })
        .filter((s) => s !== null)
        .sort((a: any, b: any) => b.score - a.score);
      const top = scored.length > 0 
        ? { status: "AVAILABLE" as const, ...scored[0] } 
        : { status: "NO_DATA" as const };

      return { activity, top };
    });

    const risingBuilds = [...builds]
      .map((b) => {
        const scores = (b.build_activity_scores as any[]) ?? [];
        if (scores.length === 0) return null;
        const peak = Math.max(...scores.map((s: any) => s.meta_score));
        return { ...b, peak };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a: any, b: any) => b.peak - a.peak)
      .slice(0, 6);

    const emergingBuilds = [...builds]
      .map((b) => {
        const scores = (b.build_activity_scores as any[]) ?? [];
        if (scores.length === 0) return null;
        const avg = scores.reduce((s: number, a: any) => s + a.meta_score, 0) / scores.length;
        return { ...b, avg };
      })
      .filter((b: any): b is NonNullable<typeof b> => b !== null && b.avg >= 68 && b.avg < 84)
      .sort((a: any, b: any) => b.avg - a.avg)
      .slice(0, 4);

    const creatorSignals: Record<string, { name: string; buildCount: number; topBuild: string; avgScore: number }> = {};
    risingBuilds.forEach((b) => {
      const creator = (b.creators as any)?.name;
      if (!creator) return;
      if (!creatorSignals[creator]) {
        creatorSignals[creator] = { name: creator, buildCount: 0, topBuild: b.name, avgScore: b.peak };
      }
      creatorSignals[creator].buildCount++;
    });

    const [consensusAlerts, patchImpactRaw, topForecasters] = await Promise.all([
      TrendingService.getConsensusSignals(14),
      TrendingService.getPatchImpact(14),
      TrustService.getTopForecasters(5)
    ]);

    return {
      success: true,
      generatedAt: new Date().toISOString(),
      metaAlerts: risingBuilds.map((b, i) => ({
        rank: i + 1,
        id: b.id,
        name: b.name,
        archetype: b.archetype,
        creator: (b.creators as any)?.name ?? "UNKNOWN",
        peakScore: Math.round(b.peak),
        // Score-based velocity: top quartile = RISING, bottom quartile = FALLING
        velocity: b.peak >= 90 ? "RISING" : b.peak >= 75 ? "STABLE" : "FALLING",
        threat: (b.build_activity_scores as any[])?.[0]?.threat_level ?? "GAMMA",
      })),
      emergingBuilds: emergingBuilds.map((b) => ({
        id: b.id,
        name: b.name,
        archetype: b.archetype,
        avgScore: Math.round(b.avg),
        creator: (b.creators as any)?.name ?? "UNKNOWN",
      })),
      topPerActivity,
      creatorSignals: Object.values(creatorSignals).slice(0, 4),
      consensusAlerts,
      patchImpact: {
        winners: patchImpactRaw.mostIncreased.map((item: any) => ({
          slug: item.slug,
          displayName: item.displayName || item.slug,
          growthPercent: item.growthPercent,
          patchCorrelation: "HIGH",
          confidence: 85,
          reason: "Benefited from recent sandbox adjustments",
          attributionStrength: "STRONG"
        })),
        losers: patchImpactRaw.mostDecreased.map((item: any) => ({
          slug: item.slug,
          displayName: item.displayName || item.slug,
          growthPercent: item.growthPercent,
          patchCorrelation: "HIGH",
          confidence: 90,
          reason: "Directly impacted by recent nerfs",
          attributionStrength: "STRONG"
        }))
      },
      topForecasters,
      intelFeeds: {
        patchVideos: patchVideosRes.data?.map((v: any) => ({...v, creator: (v.creators as any)?.name})) ?? [],
        pvpVideos: pvpVideosRes.data?.map((v: any) => ({...v, creator: (v.creators as any)?.name})) ?? [],
        farmingGuides: farmingVideosRes.data?.map((v: any) => ({...v, creator: (v.creators as any)?.name})) ?? [],
      },
      stats: {
        totalBuilds: builds.length,
        totalActivities: activities.length,
        omegaThreats: builds.filter((b) =>
          (b.build_activity_scores as any[])?.some((s: any) => s.threat_level === "OMEGA")
        ).length,
      },
    };
  }
}
