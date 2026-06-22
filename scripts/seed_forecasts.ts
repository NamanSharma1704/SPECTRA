import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const db = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Seeding Forecasts Database...");

  const { data: creators, error } = await db.from("creators").select("id, name").limit(5);
  if (!creators || creators.length === 0) {
    console.log("No creators found!");
    return;
  }

  // Clear existing
  await db.from("forecast_resolutions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("forecast_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("comparison_snapshots").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const entities = ["Striker Battlegear", "Heartbreaker", "Ouroboros", "Hunter's Fury", "St. Elmo's Engine"];
  const directions = ["META", "OBSOLETE", "NERF", "BUFF"];
  const outcomes = ["SUCCESS", "SUCCESS", "SUCCESS", "FAILURE", "PARTIAL", "EXPIRED"]; // Weighted to success

  const months = [1, 2, 3, 4, 5, 6]; // Jan to Jun 2026

  let globalTrustScore = 55;

  for (const month of months) {
    console.log(`Seeding Month: ${month} (2026)`);
    const dateStr = `2026-0${month}-15T12:00:00Z`;

    // 1. Snapshot for trust evolution
    globalTrustScore += Math.floor(Math.random() * 5) + 1; // increase slightly
    for (const c of creators) {
      await db.from("comparison_snapshots").insert({
        creator_id: c.id,
        score: globalTrustScore + (Math.random() * 10 - 5),
        rank: 1,
        tier: "S",
        lead_time_score: 80,
        consensus_score: 70,
        created_at: dateStr
      });
    }

    // 2. Insert Events & Resolutions
    // About 10-20 events per month
    const eventCount = Math.floor(Math.random() * 10) + 10;
    for (let i = 0; i < eventCount; i++) {
      const creator = creators[Math.floor(Math.random() * creators.length)];
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      const { data: event, error: eventErr } = await db.from("forecast_events").insert({
        creator_id: creator.id,
        entity_slug: entity,
        forecast_type: "ITEM",
        predicted_direction: direction,
        predicted_confidence: Math.floor(Math.random() * 40) + 60,
        status: month === 6 && i > 5 ? "OPEN" : "RESOLVED", // some open in June
        created_at: dateStr
      }).select().single();
      
      if (eventErr) {
        console.error("Event Insert Error:", eventErr);
      }

      if (event && event.status === "RESOLVED") {
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let delta = 0;
        let reason = "";

        if (outcome === "SUCCESS") {
          delta = Math.round((Math.random() * 3 + 1) * 10) / 10;
          reason = `Meta growth exceeded validation threshold.`;
        } else if (outcome === "FAILURE") {
          delta = -Math.round((Math.random() * 2 + 1) * 10) / 10;
          reason = `Meta growth failed to meet threshold.`;
        } else if (outcome === "PARTIAL") {
          delta = Math.round((Math.random() * 1) * 10) / 10;
          reason = `Consensus shifted but meta adoption remained flat.`;
        } else {
          reason = `Forecast evaluation window expired (180 days).`;
        }

        const { error: resErr } = await db.from("forecast_resolutions").insert({
          forecast_id: event.id,
          outcome: outcome,
          trust_delta: delta,
          resolution_reason: reason,
          resolved_at: `2026-0${month}-25T12:00:00Z`
        });
        
        if (resErr) {
          console.error("Resolution Insert Error:", resErr);
        }
      }
    }
  }

  console.log("Seeding complete! Dashboard should now have data.");
}

main().catch(console.error);
