import { BuildRepository } from "@/server/repositories/BuildRepository";
import { CreatorRepository } from "@/server/repositories/CreatorRepository";
import { db } from "@/server/db";
import { IntelligenceService } from "@/server/services/IntelligenceService";

export class ServerSDK {
  static async getBuilds() {
    const builds = await BuildRepository.getAllBuilds();
    return { data: builds };
  }

  static async getBuild(id: string) {
    const build = await BuildRepository.getBuildById(id);
    const scores = (build.build_activity_scores ?? []) as any[];
    
    // Compute verdict
    let verdict = "SITUATIONAL";
    if (scores.length > 0) {
      const sorted = [...scores].sort((a, b) => b.meta_score - a.meta_score);
      const top3 = sorted.slice(0, 3);
      const avg = top3.reduce((sum, s) => sum + s.meta_score, 0) / top3.length;
      if (avg >= 80) verdict = "DEPLOY";
      else if (avg < 60) verdict = "AVOID";
    }

    const rawBuild = build as any;
    rawBuild.build_sources = rawBuild.build_sources ?? [];

    const scoredActivities = scores.map((s) => {
      const score = s.meta_score;
      const tier = score >= 90 ? "S" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
      return { ...s, tier };
    }).sort((a, b) => b.meta_score - a.meta_score);

    return {
      build,
      verdict,
      scoredActivities,
      topActivity: scoredActivities[0] ?? null,
      avgMetaScore: scores.length ? Math.round(scores.reduce((s, a) => s + a.meta_score, 0) / scores.length) : 0,
    };
  }

  static async getActivities() {
    const { data } = await db.from("activities").select("*").order("name");
    return { data };
  }

  static async getActivityBuilds(activityId: string) {
    const { data } = await db
      .from("build_activity_scores")
      .select(`
        meta_score,
        threat_level,
        confidence_score,
        popularity_index,
        success_rate,
        builds (
          id,
          name,
          archetype,
          creators (name)
        )
      `)
      .eq("activity_id", activityId)
      .order("meta_score", { ascending: false });

    return { data };
  }

  static async getIntel() {
    return await IntelligenceService.getDashboardIntel();
  }

  static async getCreators() {
    const creators = await CreatorRepository.getAllCreators();
    return { data: creators };
  }

  static async getCreatorProfile(id: string) {
    return await CreatorRepository.getCreatorById(id);
  }
}
