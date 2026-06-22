import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: ".env.local" });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
  console.log("Fetching activities...");
  const { data: activities, error: actErr } = await db.from("activities").select("id, name");
  if (actErr) throw actErr;

  console.log("Fetching builds...");
  const { data: builds, error: bldErr } = await db.from("builds").select("id, name").limit(20);
  if (bldErr) throw bldErr;

  if (!activities || !builds || builds.length === 0) {
    console.log("No activities or builds found.");
    return;
  }

  for (const act of activities) {
     if (act.name === "Control Points") continue;
     const build = builds[Math.floor(Math.random() * builds.length)];
     
     const payload = {
        build_id: build.id,
        activity_id: act.id,
        meta_score: Math.floor(Math.random() * 15) + 80, // 80-94
        threat_level: "BETA"
     };

     const { error } = await db.from("build_activity_scores").upsert(payload, { onConflict: "build_id, activity_id" } as any).select();
     if (error) {
       console.error(`Error inserting for ${act.name}:`, error.message);
     } else {
       console.log(`Assigned build "${build.name}" to activity "${act.name}"`);
     }
  }
  console.log("Done!");
}

main().catch(console.error);
