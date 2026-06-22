import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const patches = [
    { name: "TU1", release_date: "2019-04-05T12:00:00Z", summary: "Invasion: Battle for D.C. & Tidal Basin" },
    { name: "TU2", release_date: "2019-05-14T12:00:00Z", summary: "Operation Dark Hours 8-Player Raid" },
    { name: "TU3", release_date: "2019-05-14T12:00:00Z", summary: "Title Update 3 - Balance Pass" },
    { name: "TU4", release_date: "2019-06-18T12:00:00Z", summary: "Gunner Specialization Introduced" },
    { name: "TU5", release_date: "2019-07-23T12:00:00Z", summary: "Episode 1: D.C. Outskirts" },
    { name: "TU6", release_date: "2019-10-15T12:00:00Z", summary: "Episode 2: Pentagon: The Last Castle" }
  ];

  for (const patch of patches) {
    // Check if it exists
    const { data: existing } = await db.from("game_patches").select("id").eq("name", patch.name).single();
    if (!existing) {
      await db.from("game_patches").insert([patch]);
      console.log(`Inserted ${patch.name}`);
    } else {
      console.log(`${patch.name} already exists`);
    }
  }
}

main();
