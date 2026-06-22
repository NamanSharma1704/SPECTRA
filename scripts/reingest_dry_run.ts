import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Thresholds for families
const EMERGING_THRESHOLD = 2;
const ESTABLISHED_THRESHOLD = 5;
const DOMINANT_THRESHOLD = 15;

function categorizeFamily(count: number) {
  if (count >= DOMINANT_THRESHOLD) return "Dominant";
  if (count >= ESTABLISHED_THRESHOLD) return "Established";
  if (count >= EMERGING_THRESHOLD) return "Emerging";
  return "None";
}

async function run() {
  const { db } = await import("../src/server/db");
  const { classifyVideo } = await import("../src/server/ingestion/YouTubeParser");
  
  const { data: videos, error } = await (db as any).from("creator_videos").select("*");
  if (error) throw error;

  const beforeFamilies: Record<string, number> = {};
  const afterFamilies: Record<string, number> = {};

  for (const v of videos) {
    const text = (v.title + " " + (v.description||"")).toLowerCase();
    // Simulate old logic
    if (text.includes("striker")) beforeFamilies["striker"] = (beforeFamilies["striker"] || 0) + 1;
    if (text.includes("heartbreaker")) beforeFamilies["heartbreaker"] = (beforeFamilies["heartbreaker"] || 0) + 1;
    if (text.includes("eclipse")) beforeFamilies["eclipse-protocol"] = (beforeFamilies["eclipse-protocol"] || 0) + 1;
    if (text.includes("umbra")) beforeFamilies["umbra-initiative"] = (beforeFamilies["umbra-initiative"] || 0) + 1;
    // Hotshot was broken in old logic so it wasn't added to gearsets

    // After: Run the new parser logic
    const { content_tags: newTags } = classifyVideo(v.title, v.description, ""); // Assume no transcript for now
    if (newTags && newTags.gearset) {
      newTags.gearset.forEach((t: any) => {
        afterFamilies[t.slug] = (afterFamilies[t.slug] || 0) + 1;
      });
    }
  }

  // Calculate metrics
  let beforeEmerging = 0, beforeEstablished = 0, beforeDominant = 0;
  for (const count of Object.values(beforeFamilies)) {
    const cat = categorizeFamily(count);
    if (cat === "Emerging") beforeEmerging++;
    if (cat === "Established") beforeEstablished++;
    if (cat === "Dominant") beforeDominant++;
  }

  let afterEmerging = 0, afterEstablished = 0, afterDominant = 0;
  for (const count of Object.values(afterFamilies)) {
    const cat = categorizeFamily(count);
    if (cat === "Emerging") afterEmerging++;
    if (cat === "Established") afterEstablished++;
    if (cat === "Dominant") afterDominant++;
  }

  const beforeTotal = Object.keys(beforeFamilies).length;
  const afterTotal = Object.keys(afterFamilies).length;

  console.log("=== RE-INGESTION DRY RUN REPORT ===");
  console.log(`Build Families Before:      ${beforeTotal}`);
  console.log(`Build Families After:       ${afterTotal}`);
  console.log("");
  console.log("=== TRUST LAYER DELTAS ===");
  console.log(`Emerging Count Delta:       ${beforeEmerging} -> ${afterEmerging} (+${afterEmerging - beforeEmerging})`);
  console.log(`Established Count Delta:    ${beforeEstablished} -> ${afterEstablished} (+${afterEstablished - beforeEstablished})`);
  console.log(`Dominant Count Delta:       ${beforeDominant} -> ${afterDominant} (+${afterDominant - beforeDominant})`);
  
  const beforeConsensus = beforeEmerging + beforeEstablished + beforeDominant;
  const afterConsensus = afterEmerging + afterEstablished + afterDominant;
  console.log(`Consensus Events Delta:     ${beforeConsensus} -> ${afterConsensus} (+${afterConsensus - beforeConsensus})`);

  console.log("");
  console.log("=== NEW FAMILIES IDENTIFIED ===");
  const newFamilies = Object.keys(afterFamilies).filter(k => !beforeFamilies[k]);
  newFamilies.forEach(f => console.log(`- ${f} (Count: ${afterFamilies[f]})`));
}

run().catch(console.error);
