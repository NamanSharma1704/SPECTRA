import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/server/db";

async function run() {
  console.log("Fetching creator_videos...");
  const { data, error } = await (db as any)
    .from("creator_videos")
    .select("published_at")
    .order("published_at", { ascending: false })
    .limit(1);

  console.log("Latest:", data);

  const { data: oldest } = await (db as any)
    .from("creator_videos")
    .select("published_at")
    .order("published_at", { ascending: true })
    .limit(1);

  console.log("Oldest:", oldest);
}

run();
