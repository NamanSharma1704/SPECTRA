import { NextResponse } from "next/server";
import { RecommendationService } from "@/server/services/RecommendationService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activity = searchParams.get("activity");
  const playstyle = searchParams.get("playstyle") || undefined;
  const groupSize = searchParams.get("groupSize") || undefined;

  if (!activity) {
    return NextResponse.json({ error: "Activity is required" }, { status: 400 });
  }

  try {
    const recommendations = await RecommendationService.getRecommendations(activity, playstyle, groupSize);
    if (!recommendations) {
      return NextResponse.json({ error: "No data available for this activity" }, { status: 404 });
    }
    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
