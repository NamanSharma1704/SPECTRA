import { NextResponse } from "next/server";
import { runFullIngestion } from "@/server/ingestion/IngestionService";

export const maxDuration = 60; // Allow maximum Vercel pro execution time

export async function GET(request: Request) {
  // Validate authorization header against secure Vercel environment variable
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const job = await runFullIngestion();
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("CRON Ingestion Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
