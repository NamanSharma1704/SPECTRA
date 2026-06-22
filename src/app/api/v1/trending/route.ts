import { NextResponse } from "next/server";
import { TrendingService } from "@/server/services/TrendingService";

export const dynamic = "force-dynamic"; // Bypass caching for trending

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 14;

    const trending = await TrendingService.getTrending(days);

    return NextResponse.json({
      success: true,
      data: trending
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
