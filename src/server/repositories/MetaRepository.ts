import { db } from "../db";
import taxonomy from "../data/division2_taxonomy.json";

export class MetaRepository {
  static async getGlobalLeaderboard() {
    // 1. Fetch all snapshots, ordered by date descending
    const { data: allSnapshots } = await (db as any)
      .from("meta_consensus_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false });

    if (!allSnapshots) return [];

    // 2. Keep only the latest snapshot for each slug
    const latestSnapshotsMap = new Map<string, any>();
    
    // We also want to calculate trend, so we need the previous snapshot too.
    const previousSnapshotsMap = new Map<string, any>();

    allSnapshots.forEach((s: any) => {
      if (!latestSnapshotsMap.has(s.slug)) {
        latestSnapshotsMap.set(s.slug, s);
      } else if (!previousSnapshotsMap.has(s.slug)) {
        previousSnapshotsMap.set(s.slug, s);
      }
    });

    // 3. Map to Leaderboard format
    const leaderboard = Array.from(latestSnapshotsMap.values()).map((latest) => {
      const taxonomyEntry = taxonomy.find((t: any) => t.slug === latest.slug);
      const displayName = taxonomyEntry?.canonical || latest.slug;
      
      const prev = previousSnapshotsMap.get(latest.slug);
      let trendStr = "0";
      if (prev) {
        const delta = latest.meta_score - prev.meta_score;
        if (delta > 0) trendStr = `+${delta}`;
        else if (delta < 0) trendStr = `${delta}`;
      }

      // Calculate Tier based on score
      let tier = "D";
      if (latest.meta_score >= 90) tier = "S";
      else if (latest.meta_score >= 80) tier = "A";
      else if (latest.meta_score >= 60) tier = "B";
      else if (latest.meta_score >= 40) tier = "C";

      // Derive generalized role from type
      let role = "DPS / Hybrid";
      if (taxonomyEntry?.slug.includes("future") || taxonomyEntry?.slug.includes("eclipse")) role = "Support / Skill";
      if (taxonomyEntry?.slug.includes("foundry") || taxonomyEntry?.slug.includes("vanguard")) role = "Tank / Bruiser";
      if (taxonomyEntry?.slug.includes("hotshot") || taxonomyEntry?.slug.includes("aces")) role = "Marksman";

      return {
        id: latest.slug,
        name: displayName,
        role: role,
        weapon: "Adaptive (Live DB)",
        score: latest.meta_score,
        trend: trendStr,
        tier: tier
      };
    });

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Assign Rank
    return leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    })).slice(0, 15); // Top 15
  }
}
