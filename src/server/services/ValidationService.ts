import { db } from "../db";

export interface ValidationStats {
  targetId: string;
  totalVotes: number;
  voteVelocity: number; // Votes in the last 48 hours
  approvalPercent: number;
  breakdown: {
    worksGreat: number;
    currentPatchViable: number;
    requiresUpdate: number;
    outdated: number;
  };
  hasEnoughData: boolean;
}

export class ValidationService {
  static async getValidationStats(targetId: string, targetType: string): Promise<ValidationStats> {
    const { data: votes, error } = await (db as any)
      .from("community_votes")
      .select("vote_type, created_at")
      .eq("target_id", targetId)
      .eq("target_type", targetType);

    if (error) {
      console.error("Failed to fetch community votes:", error);
      return this.getEmptyStats(targetId);
    }

    if (!votes || votes.length === 0) {
      return this.getEmptyStats(targetId);
    }

    const now = Date.now();
    const velocityThreshold = now - (48 * 60 * 60 * 1000); // 48 hours ago

    let worksGreat = 0;
    let currentPatchViable = 0;
    let requiresUpdate = 0;
    let outdated = 0;
    let voteVelocity = 0;

    votes.forEach((v: any) => {
      const voteTime = new Date(v.created_at).getTime();
      if (voteTime >= velocityThreshold) {
        voteVelocity++;
      }

      switch (v.vote_type) {
        case "WORKS_GREAT": worksGreat++; break;
        case "CURRENT_PATCH_VIABLE": currentPatchViable++; break;
        case "REQUIRES_UPDATE": requiresUpdate++; break;
        case "OUTDATED": outdated++; break;
      }
    });

    const totalVotes = votes.length;
    const positiveVotes = worksGreat + currentPatchViable;
    const approvalPercent = totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0;
    const hasEnoughData = totalVotes >= 10;

    // *Future Consideration*: We can check if (totalVotes >= 50 && uniqueUsers >= 20 && dataAge >= 30 days) here to flag Reliability

    return {
      targetId,
      totalVotes,
      voteVelocity,
      approvalPercent,
      breakdown: {
        worksGreat,
        currentPatchViable,
        requiresUpdate,
        outdated
      },
      hasEnoughData
    };
  }

  static async submitVote(targetId: string, targetType: string, voteType: string, ipHash: string) {
    // Check for recent duplicate vote from this IP for this target
    const { data: existing, error: checkError } = await (db as any)
      .from("community_votes")
      .select("id")
      .eq("target_id", targetId)
      .eq("target_type", targetType)
      .eq("ip_hash", ipHash)
      .limit(1);

    if (checkError) throw new Error("Failed to verify existing votes.");
    
    // We allow them to change their vote, so let's delete existing
    if (existing && existing.length > 0) {
      await (db as any)
        .from("community_votes")
        .delete()
        .eq("id", existing[0].id);
    }

    const { error } = await (db as any)
      .from("community_votes")
      .insert([
        {
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType,
          ip_hash: ipHash
        }
      ]);

    if (error) throw new Error("Failed to submit vote.");
    
    return { success: true };
  }

  private static getEmptyStats(targetId: string): ValidationStats {
    return {
      targetId,
      totalVotes: 0,
      voteVelocity: 0,
      approvalPercent: 0,
      breakdown: { worksGreat: 0, currentPatchViable: 0, requiresUpdate: 0, outdated: 0 },
      hasEnoughData: false
    };
  }
}
