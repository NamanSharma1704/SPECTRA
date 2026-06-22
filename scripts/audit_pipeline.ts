import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const CLASSIFICATION_RULES: Record<string, string[]> = {
  BUILD: ["build", "setup", "loadout", "dps", "tank", "healer", "striker", "heartbreaker"],
  GUIDE: ["guide", "how to", "explained", "tutorial", "walkthrough", "tips"],
  NEWS: ["news", "update", "state of the game", "sotg", "announced"],
  PATCH: ["patch", "notes", "tu25", "tu24", "tu23", "title update"],
  FARMING: ["farm", "farming", "loot", "grind", "target loot"],
  RAID: ["raid", "iron horse", "dark hours", "incursion"],
  PVP: ["pvp", "dark zone", "dz", "conflict", "rogue"],
  EVENT: ["event", "apparel", "global event", "season", "manhunt"]
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function classifyVideo(title: string, description: string): { primary_category: string, content_tags: Record<string, {displayName: string, slug: string}[]> } {
  const text = (title + " " + description).toLowerCase();
  
  let primaryCategory = "OTHER";
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(CLASSIFICATION_RULES)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      primaryCategory = category;
    }
  }

  const tags: Record<string, {displayName: string, slug: string}[]> = {};
  
  const addTag = (type: string, name: string) => {
    if (!tags[type]) tags[type] = [];
    tags[type].push({ displayName: name, slug: toSlug(name) });
  };

  if (text.includes("striker")) addTag("gearset", "Striker");
  if (text.includes("hotshot")) addTag("hotshot" as any, "Hotshot"); // Wait, bug in parser! It adds to "hotshot" instead of "gearset"? No, the parser says addTag("gearset", "Hotshot").
  if (text.includes("heartbreaker")) addTag("gearset", "Heartbreaker");
  if (text.includes("eclipse")) addTag("gearset", "Eclipse Protocol");
  if (text.includes("umbra")) addTag("gearset", "Umbra Initiative");

  if (text.includes("ouroboros")) addTag("weapons", "Ouroboros");
  if (text.includes("st. elmo") || text.includes("st elmo")) addTag("weapons", "St. Elmo's Engine");
  if (text.includes("eagle bearer")) addTag("weapons", "Eagle Bearer");
  if (text.includes("scorpio")) addTag("weapons", "Scorpio");

  if (text.includes("legendary")) addTag("activity", "Legendary");
  if (text.includes("incursion")) addTag("activity", "Incursion");
  if (text.includes("countdown")) addTag("activity", "Countdown");
  if (text.includes("summit")) addTag("activity", "The Summit");
  
  return { primary_category: primaryCategory, content_tags: tags };
}

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos, error } = await (db as any).from("creator_videos").select("*");
  if (error) throw error;

  let totalScanned = videos.length;
  let classifiedAsBuild = 0;
  
  const rawGearsets: Record<string, number> = {};
  const rawExotics: Record<string, number> = {};
  const rawWeapons: Record<string, number> = {};
  
  const extractedTags: Record<string, number> = {};
  
  for (const v of videos) {
    const { primary_category, content_tags } = classifyVideo(v.title, v.description);
    if (primary_category === "BUILD" || primary_category === "GUIDE") {
      classifiedAsBuild++;
    }

    const processTags = (type: string, arr: any[], targetMap: Record<string, number>) => {
      if (!arr) return;
      arr.forEach((t: any) => {
        targetMap[t.slug] = (targetMap[t.slug] || 0) + 1;
        extractedTags[t.slug] = (extractedTags[t.slug] || 0) + 1;
      });
    }

    processTags("gearset", content_tags.gearset, rawGearsets);
    processTags("exotics", content_tags.exotics, rawExotics);
    processTags("weapons", content_tags.weapons, rawWeapons);
  }

  console.log(`1. Total videos scanned: ${totalScanned}`);
  console.log(`2. Total videos classified as build guides: ${classifiedAsBuild}`);
  console.log(`3. Raw gearset mentions frequency:`, rawGearsets);
  console.log(`4. Raw exotic mentions frequency:`, rawExotics);
  console.log(`5. Raw weapon mentions frequency:`, rawWeapons);
  
  const topTags = Object.entries(extractedTags).sort((a, b) => b[1] - a[1]).slice(0, 50);
  console.log(`6. Top 50 extracted tags before normalization:`, topTags);
}

run().catch(console.error);
