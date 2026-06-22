import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import taxonomy from "../src/server/data/division2_taxonomy.json" assert { type: "json" };

const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding Full Historical Timeline Data for ALL Gearsets...");

  // Get a creator id to use for the forecasts
  const { data: creators, error: creatorError } = await supabase.from("creators").select("id").limit(1);
  if (creatorError || !creators || creators.length === 0) {
    console.error("No creators found. Please run earlier seeders to populate creators.");
    process.exit(1);
  }
  const creatorId = creators[0].id;

  const allGearsets = taxonomy.filter(t => t.type === "gearset");

  // Clean old DB data so we can build the master timeline
  for (const entity of allGearsets) {
    await supabase.from("forecast_events").delete().eq("entity_slug", entity.slug);
    await supabase.from("meta_consensus_snapshots").delete().eq("slug", entity.slug);
    await supabase.from("patch_changes").delete().eq("target_slug", entity.slug);
  }

  // Define patches spanning from the beginning of the game to 2026
  const patches = [
    { name: "TU8", date: "2020-03-03T12:00:00Z", summary: "Warlords of New York Expansion Launch" },
    { name: "TU10", date: "2020-06-16T12:00:00Z", summary: "Title Update 10 - Loot & Gear Balancing" },
    { name: "TU12", date: "2020-12-08T12:00:00Z", summary: "Title Update 12" },
    { name: "TU15", date: "2022-05-12T12:00:00Z", summary: "Title Update 15" },
    { name: "TU18", date: "2023-06-08T12:00:00Z", summary: "Title Update 18" },
    { name: "TU21", date: "2024-07-15T12:00:00Z", summary: "Title Update 21" },
    { name: "TU21.2", date: "2024-10-29T12:00:00Z", summary: "Title Update 21.2" },
    { name: "TU22", date: "2026-03-10T12:00:00Z", summary: "Title Update 22" }
  ];

  const patchIds: Record<string, string> = {};

  for (const p of patches) {
    const { data: existingPatch } = await supabase.from("game_patches").select("id").eq("name", p.name).single();
    if (existingPatch) {
      patchIds[p.name] = existingPatch.id;
    } else {
      const { data: newPatch } = await supabase.from("game_patches").insert([
        { name: p.name, release_date: p.date, summary: p.summary }
      ]).select("id").single();
      patchIds[p.name] = newPatch!.id;
    }
  }

  let index = 0;
  for (const entity of allGearsets) {
    console.log(`Seeding history for ${entity.slug}...`);
    
    // Distribute into 3 narrative arcs so the scores vary
    const arc = index % 3; 
    index++;

    // Base Introduction
    await supabase.from("patch_changes").insert([{
      patch_id: patchIds["TU8"], target_slug: entity.slug, target_type: entity.type, change_type: "BUFF",
      description: `Introduced into the new level 40 ecosystem.`, created_at: "2020-03-03T12:00:00Z"
    }]);

    await supabase.from("meta_consensus_snapshots").insert([
      { slug: entity.slug, stage: "Emerging", meta_score: 45, confidence_score: 50, creator_count: 3, video_count: 5, snapshot_date: "2020-04-10", created_at: "2020-04-10T12:00:00Z" },
      { slug: entity.slug, stage: "Established", meta_score: getRandomInt(65, 80), confidence_score: 70, creator_count: 6, video_count: 14, snapshot_date: "2020-06-05", created_at: "2020-06-05T12:00:00Z" }
    ]);

    if (arc === 0) {
      // The Meta Staple: Dominant and stays Dominant
      await supabase.from("patch_changes").insert([{
        patch_id: patchIds["TU21"], target_slug: entity.slug, target_type: entity.type, change_type: "BUFF",
        description: `Minor adjustments cementing its role in the meta.`, created_at: "2024-07-15T12:00:00Z"
      }]);

      await supabase.from("meta_consensus_snapshots").insert([
        { slug: entity.slug, stage: "Established", meta_score: 80, confidence_score: 85, creator_count: 8, video_count: 15, snapshot_date: "2024-08-01", created_at: "2024-08-01T12:00:00Z" },
        { slug: entity.slug, stage: "Dominant", meta_score: getRandomInt(90, 98), confidence_score: 95, creator_count: 15, video_count: 30, snapshot_date: "2026-05-15", created_at: "2026-05-15T12:00:00Z" }
      ]);
    } else if (arc === 1) {
      // The Fallen Hero: Got heavily nerfed
      await supabase.from("patch_changes").insert([{
        patch_id: patchIds["TU21.2"], target_slug: entity.slug, target_type: entity.type, change_type: "NERF",
        description: `Severe damage reductions applied due to overperformance.`, created_at: "2024-10-29T12:00:00Z"
      }]);

      await supabase.from("meta_consensus_snapshots").insert([
        { slug: entity.slug, stage: "Declining", meta_score: 55, confidence_score: 85, creator_count: 5, video_count: 10, snapshot_date: "2024-11-15", created_at: "2024-11-15T12:00:00Z" },
        { slug: entity.slug, stage: "Obsolete", meta_score: getRandomInt(15, 35), confidence_score: 90, creator_count: 1, video_count: 2, snapshot_date: "2026-05-15", created_at: "2026-05-15T12:00:00Z" }
      ]);
    } else {
      // The Rising Star: Just got buffed in TU22
      const { data: forecastData } = await supabase.from("forecast_events").insert([{
        creator_id: creatorId, entity_slug: entity.slug, forecast_type: "ITEM", predicted_direction: "DOMINANT",
        predicted_confidence: 85, status: "RESOLVED", created_at: "2026-02-15T12:00:00Z"
      }]).select("id").single();

      await supabase.from("patch_changes").insert([{
        patch_id: patchIds["TU22"], target_slug: entity.slug, target_type: entity.type, change_type: "BUFF",
        description: `Significant rework bringing it back into viability.`, created_at: "2026-03-10T12:00:00Z"
      }]);

      if (forecastData) {
        await supabase.from("forecast_resolutions").insert([{
          forecast_id: forecastData.id, outcome: "SUCCESS", trust_delta: 2.1,
          resolution_reason: `Usage spiked following the TU22 rework.`, resolved_at: "2026-04-10T12:00:00Z"
        }]);
      }

      await supabase.from("meta_consensus_snapshots").insert([
        { slug: entity.slug, stage: "Emerging", meta_score: 65, confidence_score: 60, creator_count: 4, video_count: 7, snapshot_date: "2026-04-01", created_at: "2026-04-01T12:00:00Z" },
        { slug: entity.slug, stage: "Established", meta_score: getRandomInt(65, 85), confidence_score: 80, creator_count: 8, video_count: 18, snapshot_date: "2026-05-15", created_at: "2026-05-15T12:00:00Z" }
      ]);
    }
  }

  console.log("\nTimeline Seeding Complete! All gearsets now have unique, rich histories.");
}

main().catch(console.error);
