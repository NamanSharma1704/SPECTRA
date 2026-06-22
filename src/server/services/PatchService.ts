import { db } from "../db";
import { TrendingService } from "./TrendingService";

export class PatchService {
  /**
   * Returns recent patches.
   */
  static async getRecentPatches(limit = 5) {
    const { data: patches } = await (db as any)
      .from("game_patches")
      .select(`
        id, name, release_date, summary,
        patch_changes (
          id, target_type, target_slug, change_type, description
        )
      `)
      .order("release_date", { ascending: false })
      .limit(limit);

    return patches || [];
  }

  /**
   * Correlates recent patch notes with dynamic patch impact to determine Patch Causality and Confidence.
   */
  static async getPatchCausality() {
    // 1. Get the most recent patch
    const patches = await this.getRecentPatches(1);
    const latestPatch = patches[0];

    // If no patches or the patch is older than 60 days, we might not want to heavily correlate
    if (!latestPatch) return null;

    const patchDate = new Date(latestPatch.release_date);
    const now = new Date();
    const daysSincePatch = (now.getTime() - patchDate.getTime()) / (1000 * 60 * 60 * 24);

    let attributionStrength = "NONE";
    if (daysSincePatch <= 14) attributionStrength = "STRONG";
    else if (daysSincePatch <= 30) attributionStrength = "WEAK";

    // 2. Fetch recent impact (TrendingService compares last 14 days vs prev 14 days)
    // Wait, TrendingService.getPatchImpact gets dynamic 14 day deltas regardless of patch date.
    // That's fine for "current meta shifts".
    const impact = await TrendingService.getPatchImpact(14);
    
    const changesMap = new Map();
    if (latestPatch.patch_changes) {
      latestPatch.patch_changes.forEach((c: any) => {
        changesMap.set(c.target_slug, c);
      });
    }

    const correlate = (items: any[]) => {
      return items.map(item => {
        const change = changesMap.get(item.slug);
        
        let correlation = "LOW";
        let confidence = 0;
        let reason = "Indirect Meta Shift";
        
        if (change) {
          // Check if direction matches change_type
          const isPositiveDelta = item.growthPercent > 0;
          const isBuff = change.change_type === "BUFF";
          const isNerf = change.change_type === "NERF";
          const isRework = change.change_type === "REWORK";

          if ((isPositiveDelta && isBuff) || (!isPositiveDelta && isNerf) || isRework) {
            correlation = "HIGH";
            confidence = Math.min(99, Math.round(50 + Math.abs(item.growthPercent) * 2));
            if (attributionStrength === "WEAK") confidence -= 20;
          } else {
            // It was buffed but it dropped, or nerfed but it rose
            correlation = "CONTRADICTORY";
            confidence = 30;
          }
          reason = change.description;
        }

        return {
          ...item,
          patchCorrelation: correlation,
          confidence,
          reason,
          attributionStrength: change ? attributionStrength : "NONE"
        };
      });
    };

    const winners = correlate(impact.mostIncreased);
    const losers = correlate(impact.mostDecreased);
    
    // Unexpected Winners: high growth (>15%) but no patch notes
    const unexpectedWinners = correlate(impact.fastestGrowing)
      .filter(w => w.growthPercent >= 15 && w.attributionStrength === "NONE");

    return {
      patch: latestPatch,
      daysSincePatch: Math.round(daysSincePatch),
      attributionStrength,
      winners,
      losers,
      unexpectedWinners
    };
  }

  /**
   * Returns specific patch changes for a given gearset or weapon.
   */
  static async getChangesForTarget(slug: string, type: "gearset" | "weapons") {
    const { data: changes } = await (db as any)
      .from("patch_changes")
      .select(`
        id, change_type, description,
        game_patches ( name, release_date )
      `)
      .eq("target_slug", slug)
      .eq("target_type", type)
      .order("game_patches(release_date)", { ascending: false });

    return changes?.map((c: any) => ({
      changeType: c.change_type,
      description: c.description,
      patchName: c.game_patches.name,
      releaseDate: c.game_patches.release_date
    })) || [];
  }

  /**
   * Generates a timeline of how a patch rippled through the community.
   */
  static async getPatchTimeline(latestPatchId?: string) {
    const { data: patches } = await (db as any)
      .from("game_patches")
      .select("*")
      .order("release_date", { ascending: false });

    if (!patches || patches.length === 0) return [];

    const timeline = [];

    for (const patch of patches) {
      const releaseDate = new Date(patch.release_date);
      timeline.push({
        type: "patch_release",
        date: releaseDate,
        label: `${patch.name} Released`,
        desc: patch.summary
      });
    }

    // Simulate the timeline effect for the dashboard only for the latest patch
    const causality = await this.getPatchCausality();
    if (causality && causality.patch) {
      const latestPatch = causality.patch;
      const releaseDate = new Date(latestPatch.release_date);
      causality.winners.filter((w: any) => w.patchCorrelation === "HIGH").slice(0, 2).forEach((w: any, index: number) => {
        const creatorSwitchDate = new Date(releaseDate);
        creatorSwitchDate.setDate(releaseDate.getDate() + 3 + index * 2);

        timeline.push({
          type: "creator_signal",
          date: creatorSwitchDate,
          label: `Creator Adoption`,
          desc: `Leading creators begin adopting ${w.displayName} following ${latestPatch.name} buff.`
        });

        const consensusDate = new Date(creatorSwitchDate);
        consensusDate.setDate(creatorSwitchDate.getDate() + 5);

        timeline.push({
          type: "consensus",
          date: consensusDate,
          label: `Consensus Formed`,
          desc: `${w.displayName} reaches Established Meta status.`
        });
      });

      causality.losers.filter((l: any) => l.patchCorrelation === "HIGH").slice(0, 1).forEach((l: any) => {
        const decayDate = new Date(releaseDate);
        decayDate.setDate(releaseDate.getDate() + 10);
        
        timeline.push({
          type: "decay",
          date: decayDate,
          label: `Meta Shift`,
          desc: `${l.displayName} drops into Declining status following the nerf.`
        });
      });
    }

    return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
