import { NextResponse } from "next/server";
import { runRedditIngestion } from "@/server/ingestion/IngestionService";

export async function POST() {
  try {
    const job = await runRedditIngestion();
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
