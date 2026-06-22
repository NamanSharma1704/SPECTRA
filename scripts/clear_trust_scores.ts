import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { error } = await (db as any).from("creator_trust_scores").delete().neq("creator_id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("Failed to delete scores:", error);
  } else {
    console.log("Deleted all old trust scores");
  }
}

run().catch(console.error);
