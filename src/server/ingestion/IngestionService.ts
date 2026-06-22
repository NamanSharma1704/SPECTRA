/**
 * IngestionService — orchestrates the full pipeline:
 * Fetch → Extract → Stage → (Review) → Commit
 * Now fully backed by Supabase persistent queue.
 */

import { revalidateTag } from "next/cache";
import { scanYouTube } from "./YouTubeParser";
import { scanAllSubreddits } from "./RedditParser";
import { scanOfficialPatches } from "./PatchParser";
import type { ExtractedBuild } from "./BuildExtractor";
import { verifyBuilds, type VerifiedBuild } from "./VerificationEngine";
import { db } from "../db";

export interface StagedBuild extends VerifiedBuild {
  id: string;
  stagedAt: string;
  status: "PENDING" | "COMMITTED" | "REJECTED" | "ERROR";
  attemptCount: number;
  lastError: string | null;
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

// Map database row to StagedBuild interface
function mapDbToStagedBuild(row: any): StagedBuild {
  return {
    rawTitle: row.raw_title,
    inferredName: row.inferred_name,
    archetype: row.archetype,
    gearKeywords: row.gear_keywords || [],
    weaponKeywords: row.weapon_keywords || [],
    activityKeywords: row.activity_keywords || [],
    confidence: row.confidence,
    source: row.source as any,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    sourceRole: row.source_role as any,
    creatorName: row.creator_name,
    publishedAt: new Date(row.published_at).getTime(),
    fingerprint: row.fingerprint,
    integrityStatus: row.integrity_status as any,
    channelId: row.channel_id,
    verificationStatus: row.verification_status as any,
    isAppend: row.is_append,
    trustMetrics: row.trust_metrics,
    id: row.id,
    stagedAt: row.created_at,
    status: row.status,
    attemptCount: row.attempt_count,
    lastError: row.last_error,
  };
}

export async function getStagingQueue(): Promise<StagedBuild[]> {
  const { data, error } = await (db as any)
    .from("ingestion_staged_builds")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapDbToStagedBuild);
}

export async function getIngestionLog(): Promise<IngestionJob[]> {
  const { data, error } = await (db as any)
    .from("ingestion_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    source: row.source,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    stats: row.stats,
    errors: row.errors,
  }));
}

export async function getIngestionStats() {
  const [queue, log] = await Promise.all([getStagingQueue(), getIngestionLog()]);
  return {
    totalStaged: queue.length,
    pending: queue.filter((b) => b.status === "PENDING" || b.status === "ERROR").length,
    committed: queue.filter((b) => b.status === "COMMITTED").length,
    rejected: queue.filter((b) => b.status === "REJECTED").length,
    lastRun: log.length > 0 ? log[0].completedAt : null,
    jobCount: log.length,
  };
}

async function createLogEntry(source: string): Promise<string> {
  const { data } = await (db as any).from("ingestion_logs").insert({
    source,
    status: "RUNNING"
  }).select("id").single();
  return data?.id || "";
}

async function updateLogEntry(id: string, job: IngestionJob) {
  if (!id) return;
  await (db as any).from("ingestion_logs").update({
    completed_at: job.completedAt,
    status: job.status,
    stats: job.stats,
    errors: job.errors
  }).eq("id", id);
}

async function stageBuilds(builds: ExtractedBuild[], job: IngestionJob): Promise<number> {
  const existingStaged = await getStagingQueue();
  const verifiedBuilds = verifyBuilds(builds, existingStaged);
  
  let added = 0;
  for (const build of verifiedBuilds) {
    if (build.integrityStatus === "FAILED") {
      job.errors.push(`Integrity Check Failed for build: ${build.sourceTitle || build.rawTitle}`);
      continue;
    }

    if (existingStaged.some((s) => s.sourceUrl === build.sourceUrl)) continue;

    const { error } = await (db as any).from("ingestion_staged_builds").insert({
      source: build.source,
      source_url: build.sourceUrl,
      source_title: build.sourceTitle,
      source_role: build.sourceRole,
      creator_name: build.creatorName,
      published_at: new Date(build.publishedAt).toISOString(),
      channel_id: build.channelId || null,
      raw_title: build.rawTitle,
      inferred_name: build.inferredName,
      archetype: build.archetype,
      fingerprint: build.fingerprint,
      gear_keywords: build.gearKeywords,
      weapon_keywords: build.weaponKeywords,
      activity_keywords: build.activityKeywords,
      confidence: build.confidence,
      integrity_status: build.integrityStatus,
      verification_status: build.verificationStatus,
      is_append: build.isAppend,
      trust_metrics: build.trustMetrics,
      status: "PENDING"
    });

    if (error) {
      console.error("Failed to stage build:", error);
      job.errors.push(`Failed to stage build ${build.sourceUrl}: ${error.message}`);
    } else {
      added++;
    }
  }
  return added;
}

export async function commitBuild(id: string): Promise<boolean> {
  const { data: row, error: fetchErr } = await (db as any)
    .from("ingestion_staged_builds")
    .select("*")
    .eq("id", id)
    .single();
    
  if (fetchErr || !row || (row.status !== "PENDING" && row.status !== "ERROR")) return false;
  
  const build = mapDbToStagedBuild(row);

  try {
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
          published_at: new Date(build.publishedAt).toISOString()
        });
        
        await (db as any).from("ingestion_staged_builds").update({ status: "COMMITTED", updated_at: new Date().toISOString() }).eq("id", id);
        // @ts-ignore
        revalidateTag("meta-leaderboard");
        return true;
      }
    }

    if (build.archetype === "PATCH") {
      const { error: insertError } = await (db as any)
        .from("game_patches")
        .insert({
          id: crypto.randomUUID(), 
          name: build.inferredName,
          release_date: new Date(build.publishedAt).toISOString(),
          summary: "Official Update details extracted from Steam News API."
        });

      if (insertError) throw insertError;
      await (db as any).from("ingestion_staged_builds").update({ status: "COMMITTED", updated_at: new Date().toISOString() }).eq("id", id);
      // @ts-ignore
      revalidateTag("meta-leaderboard");
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
      stability_score: Math.min(100, Math.max(0, Math.round(build.trustMetrics.communityValidation))),
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
      published_at: new Date(build.publishedAt).toISOString()
    });
    
    const { data: activities } = await db.from("activities").select("id").limit(1);
    if (activities && activities.length > 0) {
      await (db as any).from("build_activity_scores").insert({
        build_id: buildId,
        activity_id: activities[0].id,
        meta_score: build.confidence,
        confidence_score: build.confidence,
        threat_level: build.confidence >= 85 ? "OMEGA" : build.confidence >= 65 ? "ALPHA" : "GAMMA"
      });
    }
    
    await (db as any).from("ingestion_staged_builds").update({ status: "COMMITTED", updated_at: new Date().toISOString() }).eq("id", id);
    // @ts-ignore
    revalidateTag("meta-leaderboard");
    return true;
  } catch (err: any) {
    console.error("Failed to commit build:", err);
    await (db as any).from("ingestion_staged_builds").update({ 
      status: "ERROR", 
      last_error: err.message,
      attempt_count: build.attemptCount + 1,
      updated_at: new Date().toISOString() 
    }).eq("id", id);
    throw err;
  }
}

export async function rejectBuild(id: string): Promise<boolean> {
  const { error } = await (db as any).from("ingestion_staged_builds").update({ status: "REJECTED", updated_at: new Date().toISOString() }).eq("id", id);
  return !error;
}

export async function runYouTubeIngestion(): Promise<IngestionJob> {
  const logId = await createLogEntry("youtube");
  const job: IngestionJob = {
    id: logId,
    source: "youtube",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };

  const apiKey = process.env.YOUTUBE_API_KEY;
  const result = await scanYouTube(apiKey);
  job.stats.scanned = result.videosScanned;
  job.stats.extracted = result.buildsExtracted.length;
  job.errors.push(...result.errors);
  job.stats.errors = result.errors.length;

  job.stats.staged = await stageBuilds(result.buildsExtracted, job);
  job.completedAt = new Date().toISOString();
  job.status = job.stats.errors > 0 && job.stats.scanned === 0 ? "ERROR" : "COMPLETE";
  
  await updateLogEntry(logId, job);
  return job;
}

export async function runRedditIngestion(): Promise<IngestionJob> {
  const logId = await createLogEntry("reddit");
  const job: IngestionJob = {
    id: logId,
    source: "reddit",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };

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
    job.stats.staged = await stageBuilds(allBuilds, job);
    job.status = "COMPLETE";
  } catch (err: any) {
    job.status = "ERROR";
    job.errors.push(err.message);
  }

  job.completedAt = new Date().toISOString();
  await updateLogEntry(logId, job);
  return job;
}

export async function runPatchIngestion(): Promise<IngestionJob> {
  const logId = await createLogEntry("patches");
  const job: IngestionJob = {
    id: logId,
    source: "patches",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 20, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };

  try {
    const result = await scanOfficialPatches();
    job.stats.extracted = result.patchesExtracted.length;
    job.errors.push(...result.errors);
    job.stats.errors = result.errors.length;
    
    // Stage patches directly bypassing verification
    let added = 0;
    const existingStaged = await getStagingQueue();
    
    for (const p of result.patchesExtracted) {
      if (!existingStaged.some((s) => s.fingerprint === p.fingerprint)) {
        await (db as any).from("ingestion_staged_builds").insert({
          source: p.source,
          source_url: p.sourceUrl,
          source_title: p.sourceTitle,
          source_role: p.sourceRole,
          creator_name: p.creatorName,
          published_at: new Date(p.publishedAt).toISOString(),
          raw_title: p.rawTitle,
          inferred_name: p.inferredName,
          archetype: p.archetype,
          fingerprint: p.fingerprint,
          confidence: p.confidence,
          integrity_status: p.integrityStatus,
          verification_status: "Verified",
          is_append: false,
          trust_metrics: {
             creatorReliability: 100,
             patchFreshness: 100,
             sourceDiversity: 100,
             communityValidation: 100,
             similarityScore: 0
          },
          status: "PENDING"
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
  await updateLogEntry(logId, job);
  return job;
}

export async function runFullIngestion(): Promise<IngestionJob> {
  const logId = await createLogEntry("full");
  const job: IngestionJob = {
    id: logId,
    source: "full",
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "RUNNING",
    stats: { scanned: 0, extracted: 0, staged: 0, errors: 0 },
    errors: [],
  };

  const [ytJob, rdJob, patchJob] = await Promise.all([
    runYouTubeIngestion(),
    runRedditIngestion(),
    runPatchIngestion()
  ]);

  job.stats.scanned = ytJob.stats.scanned + rdJob.stats.scanned + patchJob.stats.scanned;
  job.stats.extracted = ytJob.stats.extracted + rdJob.stats.extracted + patchJob.stats.extracted;
  job.stats.staged = ytJob.stats.staged + rdJob.stats.staged + patchJob.stats.staged;
  job.stats.errors = ytJob.stats.errors + rdJob.stats.errors + patchJob.stats.errors;
  job.errors = [...ytJob.errors, ...rdJob.errors, ...patchJob.errors];
  
  job.completedAt = new Date().toISOString();
  job.status = job.stats.errors > 0 && job.stats.staged === 0 ? "ERROR" : "COMPLETE";
  
  await updateLogEntry(logId, job);
  return job;
}
