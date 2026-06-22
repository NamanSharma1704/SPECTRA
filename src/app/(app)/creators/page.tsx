import { CreatorRepository } from "@/server/repositories/CreatorRepository";
import { CreatorDashboard } from "@/components/creators/CreatorDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DIP | Creator Network",
  description: "Verified SHD intelligence sources. Track creators, their builds, meta influence, and trust scores.",
};

export default async function CreatorDirectory() {
  let creators: any[] = [];
  let consensusCount = 0;
  
  try {
    creators = await CreatorRepository.getAllCreators();

    const { db } = await import("@/server/db");
    
    // We can count total consensus events natively by looking at TrustService output
    // or by counting the number of established/dominant snapshots.
    const { count } = await (db as any)
      .from("meta_consensus_snapshots")
      .select("*", { count: "exact", head: true })
      .in("stage", ["Dominant", "Established"]);
      
    consensusCount = count || 0;
  } catch {}

  return <CreatorDashboard initialCreators={creators} consensusCount={consensusCount} />;
}
