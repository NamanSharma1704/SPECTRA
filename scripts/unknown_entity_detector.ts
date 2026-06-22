import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";

async function run() {
  const { db } = await import("../src/server/db");
  const taxonomyPath = path.join(process.cwd(), "src", "server", "data", "division2_taxonomy.json");
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));

  // Build a set of known aliases to filter out
  const knownAliases = new Set<string>();
  taxonomy.forEach((item: any) => {
    item.aliases.forEach((a: string) => knownAliases.add(a.toLowerCase()));
  });

  const { data: videos } = await (db as any).from("creator_videos").select("title, description");

  console.log(`Analyzing ${videos?.length || 0} videos for unknown entities...`);

  const entityCounts: Record<string, number> = {};

  // Simple heuristic: look for Capitalized Words or Phrases
  const regex = /([A-Z][a-zA-Z0-9']+(?:\s+[A-Z][a-zA-Z0-9']+)*)/g;

  // Words to ignore that are common but capitalized in titles
  const stopwords = new Set([
    "The", "Division", "PTS", "Build", "Setup", "Solo", "Group", "Update",
    "New", "Best", "Meta", "Guide", "Review", "Gameplay", "PVE", "PVP", "TU",
    "Title", "Year", "Season", "How", "To", "Get", "Is", "Are", "Will", "Change",
    "Your", "Play", "Powerful", "Amazing", "Over", "Armor", "DPS", "Skill", "Efficiency",
    "Easily", "Cores", "Tokens", "Tips", "Tricks", "Full", "Escalation", "Run", "Exotic",
    "Mask", "Unlocked", "Potential", "Builds", "Dominates", "Current", "Refactor",
    "Got", "Lot", "Better", "My", "Retaliation", "Farm", "This", "Now", "And", "Don't",
    "Miss", "Out", "Ultimate", "Immortal", "Tier", "Review", "Do", "Free", "God", "Roll",
    "Version", "Obtain", "Added", "Cache", "Vendor", "LMG", "AR", "SMG", "Absolutely",
    "Shreds", "Back", "Showcase", "Of", "All", "Items", "Coming", "Big", "Changes", "Tomorrow",
    "For", "Gear", "Retention", "More", "Right", "Million", "Damage", "Crit", "Perfect",
    "Global", "Event", "We", "I", "You", "It", "They", "What", "When", "Where", "Why",
    "Which", "Who", "A", "An", "In", "On", "At", "By", "With", "About", "Against",
    "Between", "Into", "Through", "During", "Before", "After", "Above", "Below",
    "From", "Up", "Down", "In", "Out", "On", "Off", "Over", "Under", "Again", "Further",
    "Then", "Once"
  ]);

  for (const v of videos ?? []) {
    const text = (v.title + " " + (v.description || "")).replace(/[^\w\s']/g, ' ');
    let match;
    while ((match = regex.exec(text)) !== null) {
      let phrase = match[1].trim();
      
      // Try to clean up leading/trailing stopwords
      const words = phrase.split(/\s+/);
      let cleaned = words.filter(w => !stopwords.has(w)).join(" ");
      
      if (!cleaned || cleaned.length < 3) continue;

      // Filter if it's already a known alias
      if (knownAliases.has(cleaned.toLowerCase())) continue;

      entityCounts[cleaned] = (entityCounts[cleaned] || 0) + 1;
    }
  }

  // Sort by frequency
  const sorted = Object.entries(entityCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  console.log("\n=== Unknown Entity Report ===");
  sorted.slice(0, 30).forEach(([entity, count]) => {
    console.log(`${entity} (${count})`);
  });
}

run().catch(console.error);
