import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { classifyVideo } = await import("../src/server/ingestion/YouTubeParser");
  
  console.log("Fetching all videos...");
  const { data: videos, error: fetchErr } = await (db as any).from("creator_videos").select("id, title, description");
  if (fetchErr) throw fetchErr;

  console.log(`Found ${videos.length} videos. Re-classifying and updating...`);

  let updatedCount = 0;
  for (const v of videos) {
    const { primary_category, content_tags } = classifyVideo(v.title, v.description);
    
    const { error: updateErr } = await (db as any).from("creator_videos")
      .update({ primary_category, content_tags })
      .eq("id", v.id);

    if (updateErr) {
      console.error(`Failed to update video ${v.id}:`, updateErr.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount}/${videos.length} videos.`);
}

run().catch(console.error);
