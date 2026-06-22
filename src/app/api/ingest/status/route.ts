import { NextResponse, NextRequest } from "next/server";
import { getStagingQueue, getIngestionLog, getIngestionStats } from "@/server/ingestion/IngestionService";

export async function GET(request: NextRequest) {
  const [queue, log, stats] = await Promise.all([
    getStagingQueue(),
    getIngestionLog(),
    getIngestionStats()
  ]);

  return NextResponse.json({
    stats,
    queue,
    log: log.slice(0, 20),
    apiKeyConfigured: !!process.env.YOUTUBE_API_KEY,
  });
}
