import { NextResponse } from "next/server";
import { RecommendationService } from "@/server/services/RecommendationService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "Global";
  const buildAId = searchParams.get("buildA");
  const buildBId = searchParams.get("buildB");

  if (!buildAId && !buildBId) {
    // If no builds provided, just return all available builds for the scope so the UI can populate the dropdowns
    const allBuilds = await RecommendationService.getAllBuilds(scope);
    return NextResponse.json({ builds: allBuilds });
  }

  if (!buildAId || !buildBId) {
    return NextResponse.json({ error: "Both buildA and buildB are required for comparison" }, { status: 400 });
  }

  try {
    const allBuilds = await RecommendationService.getAllBuilds(scope);
    const buildA = allBuilds.find(b => b.id === buildAId);
    const buildB = allBuilds.find(b => b.id === buildBId);

    if (!buildA || !buildB) {
      return NextResponse.json({ error: "One or both builds not found in the current scope" }, { status: 404 });
    }

    return NextResponse.json({ buildA, buildB, scope });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
