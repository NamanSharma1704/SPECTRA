import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos } = await (db as any).from("creator_videos").select("id, content_tags");

  const populated = (videos || []).filter((v: any) => Object.keys(v.content_tags || {}).length > 0);
  
  const allKeys = new Set<string>();
  const slugCounts: Record<string, number> = {};

  for (const v of populated) {
    for (const key of Object.keys(v.content_tags)) {
      allKeys.add(key);
      const arr = v.content_tags[key];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && item.slug) {
            slugCounts[item.slug] = (slugCounts[item.slug] || 0) + 1;
          }
        }
      }
    }
  }

  console.log("Found keys in content_tags:", Array.from(allKeys));
  
  const sortedSlugs = Object.entries(slugCounts).sort((a, b) => b[1] - a[1]);
  console.log("Top 10 overall slugs:", sortedSlugs.slice(0, 10));
}

run().catch(console.error);
