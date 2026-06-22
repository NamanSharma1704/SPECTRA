import { NextResponse } from "next/server";
import { runYouTubeIngestion } from "@/server/ingestion/IngestionService";
import { requireAdmin } from "../auth";

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const job = await runYouTubeIngestion();
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
