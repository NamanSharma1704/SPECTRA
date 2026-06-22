import { MetaRepository } from "@/server/repositories/MetaRepository";
import { MetaLeaderboardClient } from "./MetaLeaderboardClient";
import { db } from "@/server/db";
import taxonomy from "@/server/data/division2_taxonomy.json";
import { GearsetClientList } from "../gearset/GearsetClientList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SPECTRA | Meta Leaderboard",
  description: "Live Division 2 meta leaderboard. See the top builds ranked by meta score, threat level, and activity performance.",
};

export default async function MetaLeaderboard() {
  const leaderboardData = await MetaRepository.getGlobalLeaderboard();
  
  // Fetch Gearset data
  const allGearsets = taxonomy.filter((item) => item.type === "gearset");
  const { data: snapshots, error } = await db
    .from("meta_consensus_snapshots")
    .select("slug, stage, meta_score, created_at")
    .order("created_at", { ascending: false });

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
    <div className="max-w-[1600px] mx-auto pt-6 pb-20 space-y-16">
      <MetaLeaderboardClient leaderboardData={leaderboardData} />
      <div className="border-t border-white/10 pt-16">
        <GearsetClientList gearsets={allGearsets} liveDataMap={latestBySlug} />
      </div>
    </div>
  );
}
