import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: latestPatch } = await db.from("game_patches").select("id").order("release_date", { ascending: false }).limit(1).single();
  if (!latestPatch) return console.log("No patch found");

  await db.from("patch_changes").delete().eq("patch_id", latestPatch.id);

  const changes = [
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'true-patriot', change_type: 'BUFF', description: 'Massive rework increasing group utility and debuff application speed.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'ongoing-directive', change_type: 'BUFF', description: 'Hollow-point ammo damage multiplier increased.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'future-initiative', change_type: 'BUFF', description: 'Ground control repair aura range increased by 25%.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'heartbreaker', change_type: 'BUFF', description: 'Bonus armor decay rate significantly reduced.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'strikers-battlegear', change_type: 'BUFF', description: 'Base damage per stack slightly increased.' },
    
    // Some nerfs to correlate with our old videos drop
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'eclipse-protocol', change_type: 'NERF', description: 'Status effect spread range reduced by 15%.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'rigger', change_type: 'NERF', description: 'Skill cooldown reduction from cancellation nerfed.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'cavalier', change_type: 'NERF', description: 'Hazard protection bonuses capped at 70%.' },
    { patch_id: latestPatch.id, target_type: 'gearset', target_slug: 'system-corruption', change_type: 'NERF', description: 'Armor repair cooldown increased by 2 seconds.' }
  ];

  await db.from("patch_changes").insert(changes);
  console.log("Successfully seeded patch changes for the latest patch!");
}
main();
