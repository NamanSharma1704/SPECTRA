import { NextResponse } from "next/server";
import { getStagingQueue, getIngestionLog, getIngestionStats } from "@/server/ingestion/IngestionService";

export async function GET() {
  return NextResponse.json({
    stats: getIngestionStats(),
    queue: getStagingQueue(),
    log: getIngestionLog().slice(0, 20),
    apiKeyConfigured: !!process.env.YOUTUBE_API_KEY,
  });
}
