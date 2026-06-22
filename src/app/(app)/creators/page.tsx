import { CreatorRepository } from "@/server/repositories/CreatorRepository";
import { CreatorDashboard } from "@/components/creators/CreatorDashboard";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SPECTRA | Creator Network",
  description: "Verified SHD intelligence sources. Track creators, their builds, meta influence, and trust scores.",
};

export default async function CreatorDirectory() {
  let creators: any[] = [];
  let consensusCount = 0;
  
  try {
    creators = await CreatorRepository.getAllCreators();

    const { count } = await (db as any)
      .from("meta_consensus_snapshots")
      .select("*", { count: "exact", head: true })
      .in("stage", ["Dominant", "Established"]);
      
    consensusCount = count || 0;
  } catch {}

  return <CreatorDashboard initialCreators={creators} consensusCount={consensusCount} />;
}
