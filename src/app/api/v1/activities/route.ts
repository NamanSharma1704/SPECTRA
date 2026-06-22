import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId");

    if (activityId) {
      // Get builds for a specific activity
      const { data, error } = await db
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

      if (error) throw error;
      return NextResponse.json({ data });
    }

    // Get all activities
    const { data, error } = await db
      .from("activities")
      .select("*");

    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("API Error (/api/v1/activities):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
