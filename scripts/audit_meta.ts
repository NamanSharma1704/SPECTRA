import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos, error: videoError } = await (db as any).from("creator_videos").select("id, creators(id), content_tags");

  if (videoError) throw videoError;

  const activeCreators = new Set(videos?.map((v: any) => v.creators?.id).filter(Boolean) || []);
  const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

  const tagStats: Record<string, Set<string>> = {};

  for (const v of videos || []) {
    const creatorId = v.creators?.id;
    if (!creatorId) continue;
    
    const tags = v.content_tags;
    if (!tags) continue;

    const processTags = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!tagStats[item.slug]) {
          tagStats[item.slug] = new Set();
        }
        tagStats[item.slug].add(creatorId);
      }
    };

    processTags(tags.gearset);
    processTags(tags.weapons);
  }

  let emerging = 0;
  let established = 0;
  let dominant = 0;
  let dead = 0;

  for (const [slug, creators] of Object.entries(tagStats)) {
    const size = creators.size;
    if (size >= consensusThreshold * 3) {
      dominant++;
    } else if (size >= consensusThreshold) {
      established++;
    } else if (size > 0) {
      emerging++;
    } else {
      dead++;
    }
  }

  console.log("=== Meta Lifecycle Audit ===");
  console.log(`Active Creators: ${activeCreators.size}`);
  console.log(`Consensus Threshold: ${consensusThreshold}`);
  console.log(`Total Unique Build Families (Tags): ${Object.keys(tagStats).length}`);
  console.log(`- Emerging (1 to ${consensusThreshold - 1} creators): ${emerging}`);
  console.log(`- Established (${consensusThreshold} to ${consensusThreshold * 3 - 1} creators): ${established}`);
  console.log(`- Dominant (${consensusThreshold * 3}+ creators): ${dominant}`);
  console.log(`- Dead (0 creators): ${dead}`);

  console.log("\nDetails:");
  for (const [slug, creators] of Object.entries(tagStats)) {
      console.log(`  ${slug}: ${creators.size} creators`);
  }
}

run().catch(console.error);
