import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { TrustService } = await import("../src/server/services/TrustService");
  
  // Create a monkey-patch to log
  const originalUpsert = (TrustService as any).calculateCreatorTrust;
  
  // We can just modify TrustService temporarily or write a quick test script to pull data
  
  const { db } = await import("../src/server/db");
  const { data: creatorTrust } = await (db as any).from("creator_trust_scores").select("*").limit(1);
  console.log("Current DB trust score example:", creatorTrust);
}

run().catch(console.error);
