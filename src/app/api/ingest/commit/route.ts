import { NextResponse } from "next/server";
import { commitBuild, rejectBuild, runFullIngestion } from "@/server/ingestion/IngestionService";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { action, buildId } = body as { action?: string; buildId?: string };

  if (action === "run_full") {
    const job = await runFullIngestion();
    
    // Auto-commit everything to avoid dev server memory separation issues
    const { getStagingQueue } = await import("@/server/ingestion/IngestionService");
    const queue = getStagingQueue();
    const pending = queue.filter(b => b.status === "PENDING");
    let count = 0;
    const errors: any[] = [];
    for (const b of pending) {
      try {
        if (await commitBuild(b.id)) {
          count++;
        } else {
          errors.push({ id: b.id, reason: "commitBuild returned false" });
        }
      } catch (err: any) {
         errors.push({ id: b.id, error: err.message || err });
      }
    }
    
    return NextResponse.json({ success: true, job, committedCount: count, commitErrors: errors });
  }

  if (action === "commit" && buildId) {
    const ok = await commitBuild(buildId); // commitBuild is async
    return NextResponse.json({ success: ok });
  }

  if (action === "commit_all") {
    const { getStagingQueue } = await import("@/server/ingestion/IngestionService");
    const queue = getStagingQueue();
    const pending = queue.filter(b => b.status === "PENDING" && b.verificationStatus !== "Filtered");
    let count = 0;
    for (const b of pending) {
      if (await commitBuild(b.id)) count++;
    }
    return NextResponse.json({ success: true, count });
  }

  if (action === "reject" && buildId) {
    const ok = rejectBuild(buildId);
    return NextResponse.json({ success: ok });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
