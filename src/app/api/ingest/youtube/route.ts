import { NextResponse } from "next/server";
import { runYouTubeIngestion } from "@/server/ingestion/IngestionService";

export async function POST() {
  try {
    const job = await runYouTubeIngestion();
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
