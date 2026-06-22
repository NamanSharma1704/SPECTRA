import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos, error } = await (db as any).from("creator_videos").select("*");
  if (error) throw error;

  console.log(`1. Total videos scanned: ${videos.length}`);
  const buildVideos = videos.filter((v: any) => v.is_build_video);
  console.log(`2. Total videos classified as build guides: ${buildVideos.length}`);

  const gearsetMentions: Record<string, number> = {};
  const exoticMentions: Record<string, number> = {};
  const weaponMentions: Record<string, number> = {};

  for (const v of videos) {
    const tags = v.content_tags;
    if (!tags) continue;
    if (tags.gearset) tags.gearset.forEach((g: any) => gearsetMentions[g.slug] = (gearsetMentions[g.slug] || 0) + 1);
    if (tags.exotics) tags.exotics.forEach((e: any) => exoticMentions[e.slug] = (exoticMentions[e.slug] || 0) + 1);
    if (tags.weapons) tags.weapons.forEach((w: any) => weaponMentions[w.slug] = (weaponMentions[w.slug] || 0) + 1);
  }

  console.log("3. Raw gearset mentions frequency:", JSON.stringify(gearsetMentions));
  console.log("4. Raw exotic mentions frequency:", JSON.stringify(exoticMentions));
  console.log("5. Raw weapon mentions frequency:", JSON.stringify(weaponMentions));

  console.log("Checking sample titles and descriptions to see if other families exist...");
  const targetFamilies = ["Future Initiative", "Heartbreaker", "Hotshot", "Hunter's Fury", "Negotiator's Dilemma", "Umbra Initiative", "Foundry Bulwark", "Eclipse Protocol", "Hard Wired"];
  
  const foundInText: Record<string, number> = {};
  targetFamilies.forEach(f => foundInText[f] = 0);

  for (const v of videos) {
    const text = ((v.title || "") + " " + (v.description || "")).toLowerCase();
    targetFamilies.forEach(f => {
      if (text.includes(f.toLowerCase()) || text.includes(f.replace("'", "").toLowerCase())) {
        foundInText[f]++;
      }
    });
  }

  console.log("9. Videos containing specific target families in text:", JSON.stringify(foundInText));
}

run().catch(console.error);
