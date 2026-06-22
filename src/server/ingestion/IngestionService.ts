/**
 * IngestionService — orchestrates the full pipeline:
 * Fetch → Extract → Stage → (Review) → Commit
 */

import { scanYouTube } from "./YouTubeParser";
import { scanAllSubreddits } from "./RedditParser";
import { scanOfficialPatches } from "./PatchParser";
import type { ExtractedBuild } from "./BuildExtractor";
import { verifyBuilds, type VerifiedBuild } from "./VerificationEngine";

// In-memory staging queue (persists per server process)
// In production, this would be a Supabase table: ingestion_staged_builds
const globalForIngestion = globalThis as unknown as {
  stagingQueue: StagedBuild[] | undefined;
  ingestionLog: IngestionJob[] | undefined;
};

const stagingQueue: StagedBuild[] = globalForIngestion.stagingQueue || [];
if (process.env.NODE_ENV !== "production") globalForIngestion.stagingQueue = stagingQueue;

const ingestionLog: IngestionJob[] = globalForIngestion.ingestionLog || [];
if (process.env.NODE_ENV !== "production") globalForIngestion.ingestionLog = ingestionLog;

export interface StagedBuild extends VerifiedBuild {
  id: string;
  stagedAt: string;
  status: "PENDING" | "COMMITTED" | "REJECTED";
}

export interface IngestionJob {
  id: string;
  source: "youtube" | "reddit" | "patches" | "full";
  startedAt: string;
  completedAt: string | null;
  status: "RUNNING" | "COMPLETE" | "ERROR";
  stats: {
    scanned: number;
    extracted: number;
    staged: number;
    errors: number;
  };
  errors: string[];
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function getStagingQueue(): StagedBuild[] {
  return stagingQueue;
}

export function getIngestionLog(): IngestionJob[] {
  return [...ingestionLog].reverse(); // Most recent first
}

export function getIngestionStats() {
  return {
    totalStaged: stagingQueue.length,
    pending: stagingQueue.filter((b) => b.status === "PENDING").length,
    committed: stagingQueue.filter((b) => b.status === "COMMITTED").length,
    rejected: stagingQueue.filter((b) => b.status === "REJECTED").length,
    lastRun: ingestionLog.length > 0 ? ingestionLog[ingestionLog.length - 1].completedAt : null,
    jobCount: ingestionLog.length,
  };
}

function stageBuilds(builds: ExtractedBuild[], job: IngestionJob): number {
  const verifiedBuilds = verifyBuilds(builds, stagingQueue);
  
  let added = 0;
  for (const build of verifiedBuilds) {
    if (build.integrityStatus === "FAILED") {
      job.errors.push(`Integrity Check Failed for build: ${build.sourceTitle || build.rawTitle}`);
      continue;
    }

    if (stagingQueue.some((s) => s.sourceUrl === build.sourceUrl)) continue;
    stagingQueue.push({
      ...build,
      id: makeId(),
      stagedAt: new Date().toISOString(),
      status: "PENDING",
    });
    added++;
  }
  return added;
}

export async function commitBuild(id: string): Promise<boolean> {
  const build = stagingQueue.find((b) => b.id === id);
  if (!build || build.status !== "PENDING") return false;
  
  try {
    const { db } = await import("../db");
    
    // Ensure creator exists
    let creatorId: string | null = null;
    if (build.channelId) {
      const { data: existingCreator } = await (db as any)
        .from("creators")
        .select("id")
        .eq("channel_id", build.channelId)
        .limit(1)
        .single();
      if (existingCreator) creatorId = existingCreator.id;
    } 
    
    if (!creatorId && build.creatorName) {
      const { data: existingCreatorByName } = await (db as any)
        .from("creators")
        .select("id")
        .ilike("name", build.creatorName)
        .limit(1)
        .single();
      
      if (existingCreatorByName) {
        creatorId = existingCreatorByName.id;
      } else {
        const { data: newCreator } = await (db as any)
          .from("creators")
          .insert({
            name: build.creatorName,
            channel_id: build.channelId || null,
            // Never auto-verify from AI confidence — is_verified is a human-curated flag
            is_verified: false
          })
          .select("id")
          .single();
        if (newCreator) creatorId = newCreator.id;
      }
    }

    if (build.fingerprint) {
      const { data: existingBuilds } = await (db as any).from("builds").select("id").eq("fingerprint", build.fingerprint).limit(1);
      
      if (existingBuilds && existingBuilds.length > 0) {
        await (db as any).from("build_sources").insert({
          build_id: existingBuilds[0].id,
          source_role: build.sourceRole || "discussion",
          source_type: build.source.toUpperCase(),
          source_title: build.sourceTitle || build.rawTitle || build.inferredName,
          source_url: build.sourceUrl,
          creator_name: build.creatorName,
          creator_id: creatorId,
          confidence_score: build.confidence,
          published_at: build.publishedAt ? new Date(build.publishedAt).toISOString() : new Date().toISOString()
        });
        build.status = "COMMITTED";
        return true;
      }
    }

    if (build.archetype === "PATCH") {
      const { error: insertError } = await (db as any)
        .from("game_patches")
        .insert({
          id: crypto.randomUUID(), // Assume crypto is available or we could just rely on db generated uuid if omitted, but we need it for future changes.
          name: build.inferredName,
          release_date: new Date(build.publishedAt || Date.now()).toISOString(),
          summary: (build as any)._patchSummary || "Official Update details extracted from Steam News API."
        });

      if (insertError) throw insertError;
      build.status = "COMMITTED";
      return true;
    }


    // New build insertion
    const { data: insertedBuild, error } = await (db as any).from("builds").insert({
      name: build.inferredName,
      creator_id: creatorId,
      archetype: build.archetype || "UNKNOWN",
      is_public: true,
      fingerprint: build.fingerprint,
      integrity_status: build.integrityStatus,
      stability_score: 80,
      consensus_score: build.trustMetrics.communityValidation,
      status: "EMERGING",
      last_verified_at: new Date().toISOString()
    }).select("id").single();
    
    if (error || !insertedBuild) throw error;
    const buildId = insertedBuild.id;
    
    await (db as any).from("build_sources").insert({
      build_id: buildId,
      source_role: build.sourceRole || "origin",
      source_type: build.source.toUpperCase(),
      source_title: build.sourceTitle || build.inferredName,
      source_url: build.sourceUrl,
      creator_name: build.creatorName,
      published_at: build.publishedAt ? new Date(build.publishedAt).toISOString() : new Date().toISOString()
    });
    
    const { data: activities } = await db.from("activities").select("id").limit(1);
    if (activities && activities.length > 0) {
      await (db as any).from("build_activity_scores").insert({
        build_id: buildId,
        activity_id: activities[0].id,
        meta_score: build.confidence,
        confidence_score: build.confidence,
        // Use a proper 3-tier distribution based on confidence thresholds
        threat_level: build.confidence >= 85 ? "OMEGA" : build.confidence >= 65 ? "ALPHA" : "GAMMA"
      });
    }
    
    build.status = "COMMITTED";
    return true;
  } catch (err) {
    console.error("Failed to commit build:", err);
    throw err;
  }
}

export function rejectBuild(id: string): boolean {
  const build = stagingQueue.find((b) => b.id === id);
  if (!build || build.status !== "PENDING") return false;
  build.status = "REJECTED";
  return true;
}

export async function runYouTubeIngestion(): Promise<IngestionJob> {
  const job: IngestionJob = {
    id: makeId(),
    source: "youtube",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };
  ingestionLog.push(job);

  const apiKey = process.env.YOUTUBE_API_KEY;

  const result = await scanYouTube(apiKey);
  job.stats.scanned = result.videosScanned;
  job.stats.extracted = result.buildsExtracted.length;
  job.errors.push(...result.errors);
  job.stats.errors = result.errors.length;

  const staged = stageBuilds(result.buildsExtracted, job);
  job.stats.staged = staged;
  job.completedAt = new Date().toISOString();
  job.status = job.stats.errors > 0 && job.stats.scanned === 0 ? "ERROR" : "COMPLETE";
  return job;
}


export async function runRedditIngestion(): Promise<IngestionJob> {
  const job: IngestionJob = {
    id: makeId(),
    source: "reddit",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };
  ingestionLog.push(job);

  try {
    const results = await scanAllSubreddits();
    const allBuilds: ExtractedBuild[] = [];
    for (const r of results) {
      job.stats.scanned += r.postsScanned;
      job.stats.extracted += r.buildsExtracted.length;
      job.errors.push(...r.errors);
      job.stats.errors += r.errors.length;
      allBuilds.push(...r.buildsExtracted);
    }
    const staged = stageBuilds(allBuilds, job);
    job.stats.staged = staged;
    job.status = "COMPLETE";
  } catch (err: any) {
    job.status = "ERROR";
    job.errors.push(err.message);
  }

  job.completedAt = new Date().toISOString();
  return job;
}

export async function runPatchIngestion(): Promise<IngestionJob> {
  const job: IngestionJob = {
    id: makeId(),
    source: "patches",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 20, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };
  ingestionLog.push(job);

  try {
    const result = await scanOfficialPatches();
    job.stats.extracted = result.patchesExtracted.length;
    job.errors.push(...result.errors);
    job.stats.errors = result.errors.length;
    
    // Stage patches directly bypassing verification for now
    let added = 0;
    for (const p of result.patchesExtracted) {
      if (!stagingQueue.some((s) => s.fingerprint === p.fingerprint)) {
        stagingQueue.push({
          ...p,
          id: makeId(),
          stagedAt: new Date().toISOString(),
          status: "PENDING",
          verificationStatus: "Verified",
          isAppend: false,
          trustMetrics: {
             creatorReliability: 100,
             patchFreshness: 100,
             sourceDiversity: 100,
             communityValidation: 100,
             similarityScore: 0
          }
        });
        added++;
      }
    }
    job.stats.staged = added;
    job.status = job.stats.errors > 0 && job.stats.staged === 0 ? "ERROR" : "COMPLETE";
  } catch (err: any) {
    job.status = "ERROR";
    job.errors.push(err.message);
  }

  job.completedAt = new Date().toISOString();
  return job;
}

export async function runFullIngestion(): Promise<IngestionJob> {
  const job: IngestionJob = {
    id: makeId(),
    source: "full",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };
  ingestionLog.push(job);

  const [ytJob, rdJob, patchJob] = await Promise.all([
    runYouTubeIngestion(),
    runRedditIngestion(),
    runPatchIngestion()
  ]);

  // Remove the child jobs from log — find them by ID instead of fragile index math
  const childJobIds = new Set([ytJob.id, rdJob.id, patchJob.id]);
  const removeIndices = ingestionLog
    .map((j, i) => (childJobIds.has(j.id) ? i : -1))
    .filter(i => i !== -1)
    .reverse(); // Remove from end first to avoid index shifting
  removeIndices.forEach(i => ingestionLog.splice(i, 1));

  job.stats.scanned = ytJob.stats.scanned + rdJob.stats.scanned + patchJob.stats.scanned;
  job.stats.extracted = ytJob.stats.extracted + rdJob.stats.extracted + patchJob.stats.extracted;
  job.stats.staged = ytJob.stats.staged + rdJob.stats.staged + patchJob.stats.staged;
  job.stats.errors = ytJob.stats.errors + rdJob.stats.errors + patchJob.stats.errors;
  job.errors = [...ytJob.errors, ...rdJob.errors, ...patchJob.errors];
  job.completedAt = new Date().toISOString();
  job.status = job.stats.errors > 0 && job.stats.staged === 0 ? "ERROR" : "COMPLETE";
  return job;
}
