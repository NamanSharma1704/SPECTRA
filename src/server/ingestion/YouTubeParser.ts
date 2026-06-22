/**
 * YouTubeParser — fetches Division 2 build videos using YouTube Data API v3.
 * Strategy: dynamic database fetch using playlistItems API for incremental sync.
 *
 * Requires: YOUTUBE_API_KEY in environment variables.
 * Falls back to demo mode if key is absent.
 */

import { extractBuild, type ExtractedBuild } from "./BuildExtractor";
import { db } from "../db";

export interface YouTubeScanResult {
  channelName: string;
  videosScanned: number;
  buildsExtracted: ExtractedBuild[];
  errors: string[];
  demoMode: boolean;
}

// Demo builds shown when no API key is configured
const DEMO_VIDEOS = [
  { videoId: "demo1", title: "BEST Striker DPS Build Season 3 - Division 2", description: "Striker Battlegear AR build for Legendary content. Full St. Elmo's Engine setup.", url: "https://www.youtube.com/watch?v=demo1", channelTitle: "Widdz", publishedAt: Date.now() - 86400000, channelId: "UCsn68SJBDSnmZRdrHg-b3Mw", thumbnailUrl: "" },
  { videoId: "demo2", title: "Heartbreaker Hybrid Build - PvP and PvE Endgame", description: "Heartbreaker + Hotshot hybrid loadout. Works for Dark Zone and Countdown.", url: "https://www.youtube.com/watch?v=demo2", channelTitle: "NothingButSkillz", publishedAt: Date.now() - 172800000, channelId: "UCNXnxSB6IwJqRLJR5cRKe9A", thumbnailUrl: "" },
  { videoId: "demo3", title: "Eclipse Protocol Skill Build GUIDE - Division 2", description: "Eclipse Protocol gear set with Skill Power. Best for Heroic missions.", url: "https://www.youtube.com/watch?v=demo3", channelTitle: "Kamikazevondoom", publishedAt: Date.now() - 259200000, channelId: "UCjfxR2QyQlCYaLbBU7ePgWg", thumbnailUrl: "" },
  { videoId: "demo4", title: "Foundry Bulwark TANK Build - Unkillable in Legendary", description: "Full armor tank build using Foundry Bulwark gear set for group play.", url: "https://www.youtube.com/watch?v=demo4", channelTitle: "PatrickWolf", publishedAt: Date.now() - 345600000, channelId: "UCZ4jOKTLQ3RNQhLbNH4jMeA", thumbnailUrl: "" },
  { videoId: "demo6", title: "Best Division 2 DPS Build | Legendary Guide 2024", description: "Full AR DPS build using Striker gear. St. Elmo's Engine recommended.", url: "https://www.youtube.com/watch?v=demo6", channelTitle: "Aculite", publishedAt: Date.now() - 518400000, channelId: "UCEglbQV0eTMX3HBwq5KxeKA", thumbnailUrl: "" },
];

// Keyword scoring logic
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

import fs from "fs";
import path from "path";

export function classifyVideo(title: string, description: string, transcript: string = ""): { primary_category: string, content_tags: Record<string, {displayName: string, slug: string, match_source?: string}[]> } {
  const titleLow = (title || "").toLowerCase();
  const descLow = (description || "").toLowerCase();
  const transLow = (transcript || "").toLowerCase();
  const text = `${titleLow} ${descLow} ${transLow}`;
  
  // Find primary category
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

  // Derive standardized tags using taxonomy
  const tags: Record<string, {displayName: string, slug: string, match_source?: string, forecastable?: boolean}[]> = {};
  
  const addTag = (type: string, name: string, slug: string, source: string, forecastable: boolean) => {
    if (!tags[type]) tags[type] = [];
    const existing = tags[type].find(t => t.slug === slug);
    if (!existing) {
      tags[type].push({ displayName: name, slug, match_source: source, forecastable });
    } else {
      // Append source if not already present
      if (existing.match_source && !existing.match_source.includes(source)) {
        existing.match_source += `, ${source}`;
      }
    }
  };

  // Load taxonomy
  const taxonomyPath = path.join(process.cwd(), "src", "server", "data", "division2_taxonomy.json");
  let taxonomy: any[] = [];
  try {
    taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
  } catch (err) {
    console.error("Failed to load division2_taxonomy.json", err);
  }

  // Iterate taxonomy and match against text
  for (const item of taxonomy) {
    for (const alias of item.aliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&')}\\b`, "i");
      
      let matchedSources = [];
      if (regex.test(titleLow) || titleLow.includes(alias)) matchedSources.push("Title");
      if (regex.test(descLow) || descLow.includes(alias)) matchedSources.push("Description");
      if (regex.test(transLow) || transLow.includes(alias)) matchedSources.push("Transcript");

      if (matchedSources.length > 0) {
        addTag(item.type, item.canonical, item.slug, matchedSources.join(", "), item.forecastable || false);
        break; // matched this item, skip checking other aliases for this item
      }
    }
  }

  // Activities (Keeping these hardcoded for now)
  const checkActivity = (keyword: string, name: string, slug: string) => {
    let matchedSources = [];
    if (titleLow.includes(keyword)) matchedSources.push("Title");
    if (descLow.includes(keyword)) matchedSources.push("Description");
    if (transLow.includes(keyword)) matchedSources.push("Transcript");
    if (matchedSources.length > 0) {
      addTag("activity", name, slug, matchedSources.join(", "), false);
    }
  };

  checkActivity("legendary", "Legendary", "legendary");
  checkActivity("incursion", "Incursion", "incursion");
  checkActivity("countdown", "Countdown", "countdown");
  checkActivity("summit", "The Summit", "summit");
  
  return { primary_category: primaryCategory, content_tags: tags };
}

async function fetchPlaylistItems(playlistId: string, apiKey: string, maxResults = 15) {
  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    playlistId: playlistId,
    maxResults: String(maxResults),
  });

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`YouTube API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(`YouTube API error: ${json.error.message}`);

  return (json.items ?? []).map((item: any) => ({
    videoId: item.snippet?.resourceId?.videoId,
    title: item.snippet?.title ?? "",
    description: item.snippet?.description ?? "",
    url: `https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
    channelTitle: item.snippet?.channelTitle ?? "Unknown",
    channelId: item.snippet?.channelId ?? "",
    thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? "",
    publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).getTime() : Date.now(),
  }));
}

export async function scanYouTube(apiKey: string | undefined): Promise<YouTubeScanResult> {
  const demoMode = !apiKey;
  const errors: string[] = [];
  const allExtracted: ExtractedBuild[] = [];
  let totalScanned = 0;

  if (demoMode) {
    for (const v of DEMO_VIDEOS) {
      totalScanned++;
      const { primary_category, content_tags } = classifyVideo(v.title, v.description);
      
      // Attempt DB insert silently for demo
      try {
        // Fetch creator for the demo channel
        const { data: creator } = await (db as any).from("creators").select("id").eq("channel_id", v.channelId).single();
        if (creator) {
          await (db as any).from("creator_videos").insert({
            video_id: v.videoId,
            title: v.title,
            description: v.description,
            creator_id: creator.id,
            channel_id: v.channelId,
            published_at: new Date(v.publishedAt).toISOString(),
            thumbnail_url: v.thumbnailUrl,
            primary_category,
            content_tags,
            youtube_url: v.url
          }).select().single();
        }
      } catch (e) {
        // Ignore demo insert errors
      }

      if (primary_category === "BUILD" || primary_category === "GUIDE") {
        const b = extractBuild(v.title, v.description, "youtube", v.url, v.channelTitle, v.publishedAt, v.channelId);
        if (b) allExtracted.push(b);
      }
    }

    return {
      channelName: "DEMO MODE",
      videosScanned: totalScanned,
      buildsExtracted: allExtracted,
      errors: [],
      demoMode: true,
    };
  }

  try {
    const { data: creators, error } = await (db as any).from("creators").select("*").not("uploads_playlist_id", "is", null);
    if (error) throw error;

    for (const creator of creators) {
      try {
        const videos = await fetchPlaylistItems(creator.uploads_playlist_id, apiKey!);
        
        let newestPublishedAt = creator.latest_processed_published_at ? new Date(creator.latest_processed_published_at).getTime() : 0;
        let hasNewVideos = false;

        for (const v of videos) {
          if (v.publishedAt <= newestPublishedAt) continue; // Skip older videos
          
          totalScanned++;
          hasNewVideos = true;

          const { primary_category, content_tags } = classifyVideo(v.title, v.description);
          
          // Persist to creator_videos
          const { error: insertErr } = await (db as any).from("creator_videos").insert({
            video_id: v.videoId,
            title: v.title,
            description: v.description,
            creator_id: creator.id,
            channel_id: v.channelId,
            published_at: new Date(v.publishedAt).toISOString(),
            thumbnail_url: v.thumbnailUrl,
            primary_category,
            content_tags,
            youtube_url: v.url
          });
          if (insertErr && insertErr.code !== '23505') errors.push(`DB Insert Error: ${insertErr.message}`);

          // Differential Processing: only extract BUILD and GUIDE
          if (primary_category === "BUILD" || primary_category === "GUIDE") {
            const extracted = extractBuild(v.title, v.description, "youtube", v.url, v.channelTitle, v.publishedAt, v.channelId);
            if (extracted) allExtracted.push(extracted);
          }
        }

        if (hasNewVideos) {
          // Update watermark
          const newWatermark = videos.reduce((max: number, vid: any) => Math.max(max, vid.publishedAt), newestPublishedAt);
          await (db as any).from("creators").update({ latest_processed_published_at: new Date(newWatermark).toISOString() }).eq("id", creator.id);
        }

      } catch (err: any) {
        errors.push(`Failed to process creator ${creator.name}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Global Error: ${err.message}`);
  }

  // Deduplicate by inferred name
  const unique = allExtracted.filter(
    (b, i, arr) => arr.findIndex((x) => x.inferredName === b.inferredName) === i
  );

  return {
    channelName: "YouTube Incremental Sync",
    videosScanned: totalScanned,
    buildsExtracted: unique,
    errors,
    demoMode: false,
  };
}

// Keep old signature for backward compatibility with IngestionService
export async function scanCreatorChannel(_creator: any, apiKey: string | undefined): Promise<YouTubeScanResult> {
  return scanYouTube(apiKey);
}
