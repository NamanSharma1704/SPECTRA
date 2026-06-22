import { MetaRepository } from "@/server/repositories/MetaRepository";
import { MetaLeaderboardClient } from "./MetaLeaderboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SPECTRA | Meta Leaderboard",
  description: "Live Division 2 meta leaderboard. See the top builds ranked by meta score, threat level, and activity performance.",
};

export default async function MetaLeaderboard() {
  const leaderboardData = await MetaRepository.getGlobalLeaderboard();
  
  return (
    <div className="max-w-[1600px] mx-auto pt-6 pb-20">
      <MetaLeaderboardClient leaderboardData={leaderboardData} />
    </div>
  );
}
