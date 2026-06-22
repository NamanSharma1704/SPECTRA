import { NextResponse } from "next/server";
import { BuildRepository } from "@/server/repositories/BuildRepository";

type ActivityScore = {
  meta_score: number;
  confidence_score: number;
  threat_level: string;
  activities: { id: string; name: string; type: string } | null;
};

function computeVerdict(scores: ActivityScore[]): "DEPLOY" | "SITUATIONAL" | "AVOID" {
  if (!scores || scores.length === 0) return "SITUATIONAL";
  const top3 = [...scores].sort((a, b) => b.meta_score - a.meta_score).slice(0, 3);
  const avg = top3.reduce((s, a) => s + a.meta_score, 0) / top3.length;
  if (avg >= 80) return "DEPLOY";
  if (avg >= 60) return "SITUATIONAL";
  return "AVOID";
}

function toTier(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const aId = searchParams.get("a");
  const bId = searchParams.get("b");

  if (!aId || !bId) {
    return NextResponse.json({ error: "Both ?a= and ?b= build IDs are required" }, { status: 400 });
  }

  try {
    const [buildA, buildB] = await Promise.all([
      BuildRepository.getBuildById(aId),
      BuildRepository.getBuildById(bId),
    ]);

    const scoresA = (buildA.build_activity_scores ?? []) as ActivityScore[];
    const scoresB = (buildB.build_activity_scores ?? []) as ActivityScore[];

    const verdictA = computeVerdict(scoresA);
    const verdictB = computeVerdict(scoresB);

    const stateAvgA = scoresA.length
      ? { status: "AVAILABLE" as const, metaScore: Math.round(scoresA.reduce((s, a) => s + a.meta_score, 0) / scoresA.length) }
      : { status: "NO_DATA" as const };
    const stateAvgB = scoresB.length
      ? { status: "AVAILABLE" as const, metaScore: Math.round(scoresB.reduce((s, a) => s + a.meta_score, 0) / scoresB.length) }
      : { status: "NO_DATA" as const };

    // Activity-by-activity diff aligned by activity name
    const activityNames = Array.from(
      new Set([
        ...scoresA.map((s) => s.activities?.name ?? ""),
        ...scoresB.map((s) => s.activities?.name ?? ""),
      ].filter(Boolean))
    );

    const activityDiff = activityNames.map((name) => {
      const sA = scoresA.find((s) => s.activities?.name === name);
      const sB = scoresB.find((s) => s.activities?.name === name);
      const stateA = sA ? { status: "AVAILABLE" as const, metaScore: Math.round(sA.meta_score), tier: toTier(sA.meta_score) } : { status: "NO_DATA" as const };
      const stateB = sB ? { status: "AVAILABLE" as const, metaScore: Math.round(sB.meta_score), tier: toTier(sB.meta_score) } : { status: "NO_DATA" as const };

      let delta = null;
      let winner = "TIE";
      
      if (stateA.status === "AVAILABLE" && stateB.status === "AVAILABLE") {
        delta = Math.round(stateB.metaScore - stateA.metaScore);
        winner = delta > 2 ? "B" : delta < -2 ? "A" : "TIE";
      } else if (stateA.status === "AVAILABLE") {
        winner = "A";
      } else if (stateB.status === "AVAILABLE") {
        winner = "B";
      }

      return {
        activity: name,
        type: sA?.activities?.type ?? sB?.activities?.type ?? "",
        stateA,
        stateB,
        delta,
        winner,
      };
    });

    // DNA structural diff — compare archetype nodes
    const ARCHETYPE_TRAITS: Record<string, string[]> = {
      DPS:     ["WEAPON DMG", "CHC + CHD", "GUNNER", "BURST", "OVERFLOW"],
      SKILL:   ["SKILL PWR", "SKILL DMG", "SKILL HASTE", "TECHNICIAN", "PULSE"],
      TANK:    ["ARMOR", "ARMOR REGEN", "HAZARD PROT", "FIREWALL", "BULWARK"],
      SUPPORT: ["REPAIR SKL", "BUFF AURA", "TECHNICIAN", "HEALER", "GROUP UTIL"],
      HYBRID:  ["BALANCED", "ADAPTIVE", "MIXED SETS", "FLEX ROLE", "GUNNER"],
    };

    const traitsA = ARCHETYPE_TRAITS[buildA.archetype ?? "HYBRID"] ?? ARCHETYPE_TRAITS.HYBRID;
    const traitsB = ARCHETYPE_TRAITS[buildB.archetype ?? "HYBRID"] ?? ARCHETYPE_TRAITS.HYBRID;
    const allTraits = Array.from(new Set([...traitsA, ...traitsB]));

    const dnaDiff = allTraits.map((trait) => ({
      trait,
      inA: traitsA.includes(trait),
      inB: traitsB.includes(trait),
      shared: traitsA.includes(trait) && traitsB.includes(trait),
    }));

    let overallWinner = "TIE";
    if (stateAvgA.status === "AVAILABLE" && stateAvgB.status === "AVAILABLE") {
      overallWinner = stateAvgA.metaScore > stateAvgB.metaScore + 2 ? "A" : stateAvgB.metaScore > stateAvgA.metaScore + 2 ? "B" : "TIE";
    } else if (stateAvgA.status === "AVAILABLE") {
      overallWinner = "A";
    } else if (stateAvgB.status === "AVAILABLE") {
      overallWinner = "B";
    }

    return NextResponse.json({
      buildA: { ...buildA, verdict: verdictA, avgMetaState: stateAvgA },
      buildB: { ...buildB, verdict: verdictB, avgMetaState: stateAvgB },
      activityDiff,
      dnaDiff,
      winner: overallWinner,
      stats: {
        activitiesWonByA: activityDiff.filter((d) => d.winner === "A").length,
        activitiesWonByB: activityDiff.filter((d) => d.winner === "B").length,
        ties: activityDiff.filter((d) => d.winner === "TIE").length,
      },
    });
  } catch (error: any) {
    console.error("API Error (/api/v1/compare):", error);
    return NextResponse.json({ error: "Comparison failed", details: error.message }, { status: 500 });
  }
}
