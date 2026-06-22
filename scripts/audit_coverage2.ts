import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos, error } = await (db as any).from("creator_videos").select("*").limit(1);
  if (error) throw error;
  console.log("Columns:", Object.keys(videos[0]));
}

run().catch(console.error);
