/**
 * Build Extractor — parses video/post titles and descriptions
 * to extract Division 2 build signals using keyword matching.
 */

export interface ExtractedBuild {
  rawTitle: string;
  inferredName: string;
  archetype: string | null;
  gearKeywords: string[];
  weaponKeywords: string[];
  activityKeywords: string[];
  confidence: number; // 0-100
  source: "youtube" | "reddit" | "community" | "steam";
  sourceUrl: string;
  sourceTitle: string;
  sourceRole: "origin" | "validation" | "discussion" | "community";
  creatorName: string;
  publishedAt: number;
  fingerprint: string;
  integrityStatus: "VERIFIED" | "WARNING" | "FAILED";
  channelId?: string;
}

const ARCHETYPE_SIGNALS: Record<string, string[]> = {
  DPS: ["dps", "damage", "striker", "headhunter", "elmo", "one shot", "glass cannon", "ar build", "lmg build"],
  SKILL: ["skill", "skill power", "skill damage", "eclipse", "technician", "skill tier", "pulse", "turret", "drone"],
  TANK: ["tank", "armor", "bulwark", "foundry", "shield", "cover", "survivability", "unkillable"],
  SUPPORT: ["support", "healer", "repair", "group", "team", "resto", "buffer"],
  HYBRID: ["hybrid", "balanced", "all-around", "versatile", "flex", "hotshot", "heartbreaker"],
};

const GEAR_SIGNALS = [
  "striker", "heartbreaker", "eclipse protocol", "foundry bulwark", "alps summit",
  "negotiator's", "negotiators", "imperial dynasty", "Providence defense",
  "hotshot", "groups signature", "covered in darkness", "firewalla",
  "hard wired", "hardwired", "ongoing directive", "true patriot", "future initiative",
  "Pork n' Beans", "BTSUs"
];

const EXOTIC_SIGNALS = [
  "St. Elmo's", "st elmos", "pestilence", "capacitor", "ouroboros", 
  "eagle bearer", "nemesis", "diamondback", "coyote", "memento", "catharsis", "scorpio"
];

const WEAPON_SIGNALS = [
  "ar", "lmg", "mmr", "smg", "shotgun", "pistol", "vector", "p416",
  "aug", "famas", "scar", "m60", "pkm", "m249", "rpk",
  "m44", "heritage", "carbine", "police smg",
];

const ACTIVITY_SIGNALS: Record<string, string[]> = {
  LEGENDARY: ["legendary", "legend", "dark zone legendary"],
  INCURSION: ["incursion", "iron horse", "paradise lost"],
  RAID: ["raid", "operation iron horse", "eagle bearer raid"],
  SUMMIT: ["summit", "floor", "solo summit"],
  COUNTDOWN: ["countdown", "cd", "solo cd"],
  HEROIC: ["heroic", "solo heroic", "heroic mission"],
  PVP: ["pvp", "dark zone", "dz", "conflict"],
};

function cleanTitle(title: string): string {
  return title
    .replace(/\[(.*?)\]/g, "")
    .replace(/\((.*?)\)/g, "")
    .replace(/season \d+/gi, "")
    .replace(/tu\d+/gi, "")
    .replace(/title update \d+/gi, "")
    .replace(/division 2/gi, "")
    .replace(/the division/gi, "")
    .replace(/best/gi, "")
    .replace(/insane/gi, "")
    .replace(/\|.*/g, "")
    .trim();
}

function inferArchetype(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [archetype, signals] of Object.entries(ARCHETYPE_SIGNALS)) {
    if (signals.some((s) => lower.includes(s))) return archetype;
  }
  return null;
}

function extractGearKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return GEAR_SIGNALS.filter((g) => lower.includes(g.toLowerCase()));
}

function extractExoticKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return EXOTIC_SIGNALS.filter((e) => lower.includes(e.toLowerCase()));
}

function extractWeaponKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return WEAPON_SIGNALS.filter((w) => lower.includes(w.toLowerCase()));
}

function generateFingerprint(archetype: string | null, gear: string[], exotics: string[], weapons: string[]): string {
  const arc = archetype ? archetype.toUpperCase() : "UNK";
  const g1 = gear[0] ? gear[0].toUpperCase().replace(/[^A-Z]/g, '') : "NOGEAR";
  const e1 = exotics[0] ? exotics[0].toUpperCase().replace(/[^A-Z]/g, '') : "NOEXO";
  const w1 = weapons[0] ? weapons[0].toUpperCase().replace(/[^A-Z]/g, '') : "NOWPN";
  
  // Creates a stable hash string e.g. "DPS-STRIKER-OUROBOROS-SMG"
  return `${arc}-${g1}-${e1}-${w1}`;
}

function extractActivityKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [activity, signals] of Object.entries(ACTIVITY_SIGNALS)) {
    if (signals.some((s) => lower.includes(s))) found.push(activity);
  }
  return found;
}

function computeConfidence(extracted: Omit<ExtractedBuild, "confidence">): number {
  let score = 40; // base
  if (extracted.archetype) score += 20;
  if (extracted.gearKeywords.length > 0) score += Math.min(extracted.gearKeywords.length * 10, 25);
  if (extracted.weaponKeywords.length > 0) score += 10;
  if (extracted.activityKeywords.length > 0) score += 5;
  return Math.min(score, 100);
}

export function extractBuild(
  title: string,
  description: string,
  source: "youtube" | "reddit",
  sourceUrl: string,
  creatorName: string,
  publishedAt: number,
  channelId?: string
): ExtractedBuild | null {
  const fullText = `${title} ${description}`;

  // Must look like a build guide
  const buildIndicators = [
    "build", "loadout", "gear", "setup", "beginner", "endgame", "guide", "best",
  ];
  const lower = fullText.toLowerCase();
  const isBuildContent = buildIndicators.some((b) => lower.includes(b));
  if (!isBuildContent) return null;

  const archetype = inferArchetype(fullText);
  const gearKeywords = extractGearKeywords(fullText);
  const exoticKeywords = extractExoticKeywords(fullText);
  const weaponKeywords = extractWeaponKeywords(fullText);
  const activityKeywords = extractActivityKeywords(fullText);
  const inferredName = cleanTitle(title).slice(0, 80) || "Unnamed Build";

  const fingerprint = generateFingerprint(archetype, gearKeywords, exoticKeywords, weaponKeywords);
  
  let sourceRole: "origin" | "validation" | "discussion" | "community" = "discussion";
  if (source === "youtube") {
    sourceRole = "origin"; // By default assume YT video is the origin of the fingerprint, to be validated later
  }

  let integrityStatus: "VERIFIED" | "WARNING" | "FAILED" = "VERIFIED";
  
  if (!sourceUrl || !title || !creatorName || !publishedAt) {
    integrityStatus = "WARNING";
  }

  if (source === "youtube") {
    const videoIdMatch = sourceUrl.match(/v=([A-Za-z0-9_-]{11})/);
    if (!videoIdMatch || !videoIdMatch[1].match(/^[A-Za-z0-9_-]{11}$/)) {
      integrityStatus = "FAILED";
    }
  }

  const partial = { 
    rawTitle: title, 
    inferredName, 
    archetype, 
    gearKeywords: [...gearKeywords, ...exoticKeywords], 
    weaponKeywords, 
    activityKeywords, 
    source, 
    sourceUrl, 
    sourceTitle: title,
    sourceRole,
    creatorName, 
    publishedAt,
    fingerprint,
    integrityStatus,
    channelId
  };
  
  const confidence = computeConfidence(partial as any);

  // Minimum 50% confidence to be considered valid
  if (confidence < 50) return null;

  return { ...partial, confidence };
}
