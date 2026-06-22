import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data: videos } = await (db as any)
    .from("creator_videos")
    .select("published_at, title, creators(name), content_tags")
    .eq("creators.name", "Patrick Wolf")
    .order("published_at", { ascending: true });

  const { data: allVideos } = await (db as any)
    .from("creator_videos")
    .select("published_at, creators(id, name), content_tags")
    .order("published_at", { ascending: true });

  const buildConsensus: Record<string, {
    creators: Set<string>;
    establishedDate: Date | null;
  }> = {};

  const activeCreators = new Set(allVideos?.map((v: any) => v.creators?.id).filter(Boolean));
  const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

  for (const v of allVideos ?? []) {
    const publishedDate = new Date(v.published_at);
    const tags = v.content_tags;
    if (!tags) continue;
    const processTags = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!buildConsensus[item.slug]) {
          buildConsensus[item.slug] = { creators: new Set(), establishedDate: null };
        }
        const state = buildConsensus[item.slug];
        if (!state.establishedDate) {
          state.creators.add(v.creators?.id);
          if (state.creators.size >= consensusThreshold) {
            state.establishedDate = publishedDate;
          }
        }
      }
    };
    processTags(tags.gearset);
  }

  // Now check Patrick Wolf's videos
  console.log("Patrick Wolf Videos:");
  for (const v of videos ?? []) {
    if (!v.creators) continue;
    const pubDate = new Date(v.published_at);
    console.log(`- "${v.title}" (${pubDate.toISOString()})`);
    const tags = v.content_tags?.gearset || [];
    for (const tag of tags) {
      const state = buildConsensus[tag.slug];
      if (!state) continue;
      const isEarly = !state.establishedDate || pubDate < state.establishedDate;
      const diffDays = state.establishedDate ? (state.establishedDate.getTime() - pubDate.getTime()) / 86400000 : 0;
      console.log(`  -> Tag: ${tag.slug} | Est: ${state.establishedDate?.toISOString()} | Early? ${isEarly} | Lead: ${diffDays.toFixed(1)} days`);
    }
  }
}

run().catch(console.error);
