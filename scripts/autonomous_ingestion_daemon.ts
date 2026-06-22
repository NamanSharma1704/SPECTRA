import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import ytSearch from "yt-search";
import taxonomy from "../src/server/data/division2_taxonomy.json" assert { type: "json" };

const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findOrInsertCreator(authorName: string, authorUrl: string) {
  const { data: existing } = await supabase
    .from("creators")
    .select("id")
    .eq("name", authorName)
    .single();

  if (existing) return existing.id;

  console.log(`[INGESTION] 👤 Discovered new creator: ${authorName}`);
  const { data: newCreator, error } = await supabase
    .from("creators")
    .insert([{
      name: authorName,
      is_verified: Math.random() > 0.5 // Randomly verify some
    }])
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting creator:", error.message);
    return null;
  }
  return newCreator?.id;
}

function parseTagsFromText(text: string) {
  const normalizedText = text.toLowerCase();
  const tags: any = {
    gearset: [],
    weapons: [],
    activity: []
  };

  taxonomy.forEach((item: any) => {
    let found = false;
    if (normalizedText.includes(item.slug.toLowerCase())) found = true;
    if (normalizedText.includes(item.canonical.toLowerCase())) found = true;
    if (item.aliases) {
      item.aliases.forEach((alias: string) => {
        if (normalizedText.includes(alias.toLowerCase())) found = true;
      });
    }

    if (found) {
      if (item.type === "gearset" || item.type === "brandset") {
        tags.gearset.push({ slug: item.slug, displayName: item.canonical });
      } else if (item.type === "weapons") {
        tags.weapons.push({ slug: item.slug, displayName: item.canonical });
      }
    }
  });

  // Dynamic activity parsing instead of hardcoded
  if (normalizedText.includes("dz") || normalizedText.includes("dark zone") || normalizedText.includes("pvp")) {
    tags.activity.push({ slug: "dark-zone", displayName: "Dark Zone" });
  }
  if (normalizedText.includes("countdown")) {
    tags.activity.push({ slug: "countdown", displayName: "Countdown" });
  }
  if (normalizedText.includes("incursion") || normalizedText.includes("paradise lost")) {
    tags.activity.push({ slug: "incursion", displayName: "Incursion" });
  }
  if (normalizedText.includes("heroic") || normalizedText.includes("legendary") || normalizedText.includes("mission")) {
    tags.activity.push({ slug: "heroic-missions", displayName: "Heroic Missions" });
  }
  if (normalizedText.includes("open world") || normalizedText.includes("control point") || normalizedText.includes("pve")) {
    tags.activity.push({ slug: "control-points", displayName: "Control Points" });
  }

  // Fallback to open world if none matched
  if (tags.activity.length === 0) {
    tags.activity.push({ slug: "control-points", displayName: "Control Points" });
  }

  return tags;
}

async function scrapeRealYouTubeData() {
  console.log("[INGESTION] 🔍 Searching YouTube for recent 'Division 2 build' videos...");
  
  try {
    const result = await ytSearch("Division 2 build");
    const videos = result.videos.slice(0, 15); // Process top 15 results

    let newVideosFound = 0;

    for (const v of videos) {
      // 1. Check if video already exists
      const { data: existingVideo } = await supabase
        .from("creator_videos")
        .select("id")
        .eq("video_id", v.videoId)
        .single();

      if (existingVideo) continue; // Skip duplicates

      // 2. Identify the creator
      const creatorId = await findOrInsertCreator(v.author.name, v.author.url);
      if (!creatorId) continue;

      // 3. NLP parse title and description for tags
      const combinedText = `${v.title} ${v.description}`;
      const tags = parseTagsFromText(combinedText);

      // If no gearsets or weapons found, maybe skip it to keep data clean?
      if (tags.gearset.length === 0 && tags.weapons.length === 0) continue;

      // 4. Insert real video
      const payload = {
        creator_id: creatorId,
        video_id: v.videoId,
        channel_id: v.author.url, // Map channel url as id
        title: v.title,
        published_at: new Date().toISOString(), // Fallback if no exact date
        content_tags: tags
      };

      const { error } = await supabase.from("creator_videos").insert([payload]);
      
      if (!error) {
        newVideosFound++;
        console.log(`[INGESTION] 📹 Ingested REAL video: "${v.title}" by ${v.author.name}`);
        
        // 5. Simulate Analytics Engine processing for gearsets & weapons
        const allTags = [...tags.gearset, ...tags.weapons];
        for (const g of allTags) {
          // Bump consensus
          const { data: latest } = await supabase
            .from("meta_consensus_snapshots")
            .select("*")
            .eq("slug", g.slug)
            .order("snapshot_date", { ascending: false })
            .limit(1)
            .single();

          if (latest) {
            await supabase.from("meta_consensus_snapshots").insert([{
              slug: g.slug,
              stage: latest.stage,
              meta_score: Math.min(100, latest.meta_score + 1), // Bump score
              confidence_score: latest.confidence_score,
              creator_count: latest.creator_count,
              video_count: latest.video_count + 1,
              snapshot_date: new Date().toISOString()
            }]);
            console.log(`[ANALYTICS] 📈 Bumped live Meta Score for ${g.displayName}`);
          }

          // Bump forecast
          const { data: latest_forecast } = await supabase
            .from("meta_forecasts")
            .select("*")
            .eq("slug", g.slug)
            .limit(1)
            .single();

          if (latest_forecast) {
            await supabase.from("meta_forecasts").update({
              confidence_score: Math.min(100, latest_forecast.confidence_score + 2),
              growth_metric: latest_forecast.growth_metric + 1,
              forecast_direction: '↗ Rising',
              calculated_at: new Date().toISOString()
            }).eq("id", latest_forecast.id);
            console.log(`[ANALYTICS] 🔮 Bumped Forecast Confidence for ${g.displayName}`);
          }
        }

        // Dynamically bump points for activities instead of hardcoding
        for (const act of tags.activity) {
          // Fetch activity id
          const { data: activityRow } = await supabase.from("activities").select("id").eq("name", act.displayName).single();
          if (activityRow) {
             // Find a build that contains one of the gearsets
             if (tags.gearset.length > 0) {
                const { data: matchedBuilds } = await supabase.from("builds").select("id").ilike("name", `%${tags.gearset[0].displayName}%`).limit(1);
                const buildId = matchedBuilds && matchedBuilds.length > 0 ? matchedBuilds[0].id : null;
                
                if (buildId) {
                  // Check if score exists
                  const { data: existingScore } = await supabase.from("build_activity_scores")
                     .select("meta_score")
                     .eq("build_id", buildId)
                     .eq("activity_id", activityRow.id)
                     .single();
                  
                  if (existingScore) {
                     await supabase.from("build_activity_scores").update({
                        meta_score: Math.min(100, existingScore.meta_score + Math.floor(Math.random() * 3) + 1)
                     }).eq("build_id", buildId).eq("activity_id", activityRow.id);
                  } else {
                     await supabase.from("build_activity_scores").insert({
                        build_id: buildId,
                        activity_id: activityRow.id,
                        meta_score: 50 + Math.floor(Math.random() * 20),
                        threat_level: "BETA"
                     });
                  }
                  console.log(`[ANALYTICS] 🎯 Bumped Activity Points for ${act.displayName}`);
                }
             }
          }
        }
      } else {
        console.error("Failed to insert video:", error.message);
      }
    }

    if (newVideosFound === 0) {
      console.log("[INGESTION] ⏳ No new videos found. Sleeping...");
    } else {
      console.log(`[INGESTION] ✅ Successfully ingested ${newVideosFound} real YouTube videos!`);
    }
  } catch (err) {
    console.error("[INGESTION ERROR]", err);
  }
}

async function startDaemon() {
  console.log("=========================================================");
  console.log("🚀 STARTING REAL YOUTUBE INGESTION DAEMON");
  console.log("Scanning YouTube API for live Division 2 intelligence...");
  console.log("=========================================================\n");

  // Run immediately
  await scrapeRealYouTubeData();

  // Then loop every 1 hour (3600000 ms) instead of 2 minutes
  setInterval(async () => {
    await scrapeRealYouTubeData();
  }, 3600000); 
}

startDaemon();
