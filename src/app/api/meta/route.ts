import { NextResponse } from "next/server";
import { IntelligenceService } from "@/server/services/IntelligenceService";

export async function GET() {
  const intel = await IntelligenceService.getDashboardIntel();
  return NextResponse.json(intel);
}
