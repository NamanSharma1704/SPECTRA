import { NextResponse } from "next/server";
import { runPatchIngestion } from "@/server/ingestion/IngestionService";
import { requireAdmin } from "../auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const job = await runPatchIngestion();
    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
