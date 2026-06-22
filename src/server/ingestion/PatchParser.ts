import { db } from "../db";
import crypto from "crypto";
import type { ExtractedBuild } from "./BuildExtractor";

const DIVISION2_APP_ID = "2221490";
const STEAM_NEWS_API = `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${DIVISION2_APP_ID}&count=20&format=json`;

export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number; // Unix timestamp
  feedname: string;
  feed_type: number;
  appid: number;
}

export async function scanOfficialPatches(): Promise<{ patchesExtracted: ExtractedBuild[], errors: string[] }> {
  const result = {
    patchesExtracted: [] as ExtractedBuild[],
    errors: [] as string[]
  };

  try {
    const response = await fetch(STEAM_NEWS_API, {
      headers: {
        "User-Agent": "DIP-Scanner/1.0 (Division Intelligence Platform patch scanner)"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Steam News API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const newsItems: SteamNewsItem[] = data?.appnews?.newsitems || [];

    const patchKeywords = ["title update", "patch notes", "season", "tu"];
    const patchAnnouncements = newsItems.filter(item => {
      const lowerTitle = item.title.toLowerCase();
      if (lowerTitle.includes("community highlights") || lowerTitle.includes("agent highlights")) {
        return false;
      }
      return patchKeywords.some(keyword => lowerTitle.includes(keyword));
    });

    if (patchAnnouncements.length === 0) {
      return result;
    }

    for (const item of patchAnnouncements) {
      let patchName = item.title.length > 50 ? item.title.substring(0, 47) + "..." : item.title;
      
      const tuMatch = item.title.match(/(?:title update|tu)\s*(\d+(?:\.\d+)?)/i);
      if (tuMatch) {
        patchName = `TU${tuMatch[1]}`;
      } else {
        const seasonMatch = item.title.match(/(?:year\s*\d+\s*)?season\s*\d+/i);
        if (seasonMatch) {
          patchName = seasonMatch[0].replace(/year\s*/i, "Y").replace(/\s*season\s*/i, "S");
        }
      }

      // Check if it already exists in the database
      const { data: existing } = await (db as any)
        .from("game_patches")
        .select("id")
        .ilike("name", patchName)
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // Already ingested this patch
      }

      const plainTextContent = item.contents
        .replace(/\[\/?.*?\]/g, "") 
        .replace(/<[^>]*>?/gm, "") 
        .replace(/\s+/g, " ")
        .trim();
      
      const summary = plainTextContent.length > 200 
        ? plainTextContent.substring(0, 197) + "..." 
        : plainTextContent;

      const mockPatchBuild: ExtractedBuild = {
        rawTitle: patchName,
        inferredName: patchName,
        archetype: "PATCH",
        gearKeywords: [],
        weaponKeywords: [],
        activityKeywords: [],
        confidence: 100,
        source: "steam",
        sourceUrl: item.url,
        sourceTitle: item.title,
        sourceRole: "origin",
        creatorName: "Ubisoft",
        publishedAt: item.date * 1000,
        fingerprint: `PATCH-${patchName.toUpperCase()}`,
        integrityStatus: "VERIFIED"
      };

      // We will attach the summary as a hidden field so commitBuild can use it
      (mockPatchBuild as any)._patchSummary = summary;

      result.patchesExtracted.push(mockPatchBuild);
    }

  } catch (error: any) {
    console.error("Patch ingestion error:", error);
    result.errors.push(error.message);
  }

  return result;
}
