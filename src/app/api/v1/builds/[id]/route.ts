import { NextResponse } from "next/server";
import { BuildRepository } from "@/server/repositories/BuildRepository";

type ActivityScore = {
  meta_score: number;
  confidence_score: number;
  threat_level: string;
  activities: { id: string; name: string; type: string; difficulty: string | null } | null;
};

function computeVerdict(scores: ActivityScore[]): "DEPLOY" | "SITUATIONAL" | "AVOID" {
  if (!scores || scores.length === 0) return "SITUATIONAL";
  const sorted = [...scores].sort((a, b) => b.meta_score - a.meta_score);
  const top3 = sorted.slice(0, 3);
  const avg = top3.reduce((sum, s) => sum + s.meta_score, 0) / top3.length;
  if (avg >= 80) return "DEPLOY";
  if (avg >= 60) return "SITUATIONAL";
  return "AVOID";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const build = await BuildRepository.getBuildById(id);
    const scores = (build.build_activity_scores ?? []) as ActivityScore[];
    const verdict = computeVerdict(scores);

    const rawBuild = build as any;
    rawBuild.build_sources = rawBuild.build_sources ?? [];

    // Compute per-activity tier ratings
    const scoredActivities = scores.map((s) => {
      const score = s.meta_score;
      const tier =
        score >= 90 ? "S" :
        score >= 80 ? "A" :
        score >= 70 ? "B" :
        score >= 60 ? "C" : "D";
      return { ...s, tier };
    }).sort((a, b) => b.meta_score - a.meta_score);

    return NextResponse.json({
      build,
      verdict,
      scoredActivities,
      topActivity: scoredActivities[0] ?? null,
      avgMetaScore: scores.length
        ? Math.round(scores.reduce((s, a) => s + a.meta_score, 0) / scores.length)
        : 0,
    });
  } catch (error: any) {
    console.error("API Error (/api/v1/builds/[id]):", error);
    return NextResponse.json({ error: "Build not found", details: error.message }, { status: 404 });
  }
}
