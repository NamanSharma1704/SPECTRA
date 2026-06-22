import { MetaRepository } from "@/server/repositories/MetaRepository";
import { MetaLeaderboardClient } from "./MetaLeaderboardClient";

export const dynamic = "force-dynamic";

export default async function MetaLeaderboard() {
  const leaderboardData = await MetaRepository.getGlobalLeaderboard();
  
  return (
    <div className="max-w-[1600px] mx-auto pt-6 pb-20">
      <MetaLeaderboardClient leaderboardData={leaderboardData} />
    </div>
  );
}
