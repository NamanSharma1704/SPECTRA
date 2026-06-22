import { db } from "../src/server/db";

async function main() {
  const { data: activities } = await db.from("activities").select("*");
  console.log("ACTIVITIES IN DB:");
  console.dir(activities);

  const { data: scores } = await db.from("build_activity_scores").select("activity_id, meta_score").limit(10);
  console.log("SCORES IN DB (sample):");
  console.dir(scores);
}

main().catch(console.error);
