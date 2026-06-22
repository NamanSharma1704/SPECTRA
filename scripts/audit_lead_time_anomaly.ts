import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");

  const { data: videos } = await (db as any)
    .from("creator_videos")
    .select("published_at, creators(id, name), content_tags")
    .order("published_at", { ascending: true });

  const buildConsensus: Record<string, {
    creators: Set<string>;
    establishedDate: Date | null;
  }> = {};

  const activeCreators = new Set(videos?.map((v: any) => v.creators?.id).filter(Boolean));
  const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

  // 1. Establish consensus
  for (const v of videos ?? []) {
    const tags = v.content_tags;
    if (!tags) continue;
    const creatorId = (v.creators as any)?.id;
    if (!creatorId) continue;
    const publishedDate = new Date(v.published_at);

    const processTags = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!buildConsensus[item.slug]) {
          buildConsensus[item.slug] = { creators: new Set(), establishedDate: null };
        }
        const state = buildConsensus[item.slug];
        if (!state.establishedDate) {
          state.creators.add(creatorId);
          if (state.creators.size >= consensusThreshold) {
            state.establishedDate = publishedDate;
          }
        }
      }
    };
    Object.values(tags).forEach((tagArray: any) => processTags(tagArray));
  }

  // 2. Find anomalous lead times
  console.log("=== Lead Time Anomaly Audit (> 365 Days) ===");

  for (const v of videos ?? []) {
    const tags = v.content_tags;
    if (!tags) continue;
    const creatorId = (v.creators as any)?.id;
    const creatorName = (v.creators as any)?.name;
    if (!creatorId) continue;
    
    const publishedDate = new Date(v.published_at);

    const processAttribution = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        const state = buildConsensus[item.slug];
        if (!state || !state.establishedDate) continue;

        const isEarly = publishedDate < state.establishedDate;
        if (isEarly) {
          const daysLead = (state.establishedDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysLead > 365) {
            console.log(`\nCreator: ${creatorName}`);
            console.log(`Build: ${item.slug}`);
            console.log(`First Mention Date: ${publishedDate.toISOString()}`);
            console.log(`Consensus Date:     ${state.establishedDate.toISOString()}`);
            console.log(`Computed Delta:     ${Math.round(daysLead)} days`);
          }
        }
      }
    };
    Object.values(tags).forEach((tagArray: any) => processAttribution(tagArray));
  }
}

run().catch(console.error);
