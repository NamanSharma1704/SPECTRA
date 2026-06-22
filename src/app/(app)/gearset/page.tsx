import { db } from "@/server/db";
import taxonomy from "@/server/data/division2_taxonomy.json";
import { GearsetClientList } from "./GearsetClientList";

export default async function GearsetsPage() {
  // 1. Get all gearsets from taxonomy
  const allGearsets = taxonomy.filter((item) => item.type === "gearset");

  // 2. Fetch the latest snapshot for each gearset to show live data
  const { data: snapshots, error } = await db
    .from("meta_consensus_snapshots")
    .select("slug, stage, meta_score, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gearsets:", error.message || JSON.stringify(error));
  }

  // Deduplicate by slug to get the latest state
  const latestBySlug: Record<string, { stage?: string; meta_score?: number }> = {};
  if (snapshots) {
    for (const snap of snapshots) {
      const lowerSlug = snap.slug.toLowerCase();
      if (!latestBySlug[lowerSlug]) {
        latestBySlug[lowerSlug] = { stage: snap.stage || undefined, meta_score: snap.meta_score || undefined };
      }
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto pt-6 pb-20">
      <GearsetClientList gearsets={allGearsets} liveDataMap={latestBySlug} />
    </div>
  );
}
