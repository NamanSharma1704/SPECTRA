import { db } from "../db";
import type {
  EntityTimeline,
  ForecastOutcome,
  TimelineEntityType,
  TimelineEvent,
} from "@/types/timeline";

type ForecastRow = {
  id: string;
  predicted_direction: string;
  predicted_confidence: number;
  created_at: string;
  creator_id: string;
};

type ResolutionRow = {
  forecast_id: string;
  outcome: string;
  trust_delta: number | null;
  resolution_reason: string | null;
  resolved_at: string;
};

type SnapshotRow = {
  id: string;
  slug: string;
  stage: string | null;
  snapshot_date: string;
  meta_score: number;
  confidence_score: number;
  creator_count: number;
  video_count: number;
};

type PatchRow = {
  id: string;
  change_type: string;
  description: string;
  game_patches: { name: string; release_date: string } | null;
};

const PATCH_TYPES: Record<TimelineEntityType, string> = {
  gearset: "gearset",
  weapon: "weapons",
  skill: "skill",
};

const FORECAST_OUTCOMES = new Set<ForecastOutcome>([
  "SUCCESS",
  "FAILURE",
  "PARTIAL",
  "UNRESOLVED",
  "EXPIRED",
]);

function normalizeOutcome(outcome: string): ForecastOutcome {
  return FORECAST_OUTCOMES.has(outcome as ForecastOutcome)
    ? outcome as ForecastOutcome
    : "UNRESOLVED";
}

function daysBetween(start: Date, end: Date): number | null {
  if (end <= start) return null;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function requireQuery<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (data === null) throw new Error(`${label}: query returned no data`);
  return data;
}

export class TimelineRepository {
  static async getEntityTimeline(entityType: TimelineEntityType, entitySlug: string): Promise<EntityTimeline> {
    const events: TimelineEvent[] = [];
    const patchSlugs = [...new Set([entitySlug, entitySlug.replaceAll("-", "_")])];

    const [forecastResult, snapshotResult, patchResult] = await Promise.all([
      db
        .from("forecast_events")
        .select("id, predicted_direction, predicted_confidence, created_at, creator_id")
        .eq("entity_slug", entitySlug),
      db
        .from("meta_consensus_snapshots")
        .select("id, slug, stage, snapshot_date, meta_score, confidence_score, creator_count, video_count")
        .eq("slug", entitySlug)
        .not("stage", "is", null)
        .order("snapshot_date", { ascending: true }),
      db
        .from("patch_changes")
        .select("id, change_type, description, game_patches(name, release_date)")
        .in("target_slug", patchSlugs)
        .eq("target_type", PATCH_TYPES[entityType]),
    ]);

    const forecastEvents = requireQuery<ForecastRow[]>(
      forecastResult.data,
      forecastResult.error,
      "Failed to fetch timeline forecasts",
    );
    const consensusSnapshots = requireQuery<SnapshotRow[]>(
      snapshotResult.data,
      snapshotResult.error,
      "Failed to fetch timeline consensus snapshots",
    );
    const patchChanges = requireQuery<PatchRow[]>(
      patchResult.data,
      patchResult.error,
      "Failed to fetch timeline patch changes",
    );

    const creatorIds = [...new Set(forecastEvents.map((forecast) => forecast.creator_id))];
    const forecastIds = forecastEvents.map((forecast) => forecast.id);

    const [creatorResult, resolutionResult] = await Promise.all([
      creatorIds.length > 0
        ? db.from("creators").select("id, name").in("id", creatorIds)
        : Promise.resolve({ data: [], error: null }),
      forecastIds.length > 0
        ? db
            .from("forecast_resolutions")
            .select("forecast_id, outcome, trust_delta, resolution_reason, resolved_at")
            .in("forecast_id", forecastIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const creators = requireQuery<Array<{ id: string; name: string }>>(
      creatorResult.data,
      creatorResult.error,
      "Failed to fetch timeline creators",
    );
    const resolutions = requireQuery<ResolutionRow[]>(
      resolutionResult.data,
      resolutionResult.error,
      "Failed to fetch timeline resolutions",
    );

    const creatorMap = new Map(creators.map((creator) => [creator.id, creator.name]));
    const resolutionMap = new Map(
      resolutions.map((resolution) => [
        resolution.forecast_id,
        {
          outcome: normalizeOutcome(resolution.outcome),
          trustDelta: resolution.trust_delta,
          reason: resolution.resolution_reason,
          resolvedAt: resolution.resolved_at,
        },
      ]),
    );

    for (const forecast of forecastEvents) {
      const creator = creatorMap.get(forecast.creator_id) ?? "Unknown Creator";
      events.push({
        id: `forecast-${forecast.id}`,
        timestamp: forecast.created_at,
        type: "FORECAST",
        title: "Intelligence Forecast",
        description: `${creator} predicted a ${forecast.predicted_direction} shift.`,
        metadata: {
          creator,
          direction: forecast.predicted_direction,
          confidence: forecast.predicted_confidence,
          forecastId: forecast.id,
          resolution: resolutionMap.get(forecast.id) ?? null,
        },
      });
    }

    const stageFirstSeen = new Map<string, Date>();
    for (const snapshot of consensusSnapshots) {
      if (!snapshot.stage || stageFirstSeen.has(snapshot.stage)) continue;

      const timestamp = `${snapshot.snapshot_date}T00:00:00Z`;
      stageFirstSeen.set(snapshot.stage, new Date(timestamp));
      events.push({
        id: `consensus-${snapshot.id}`,
        timestamp,
        type: "CONSENSUS",
        title: `Consensus Reaches ${snapshot.stage}`,
        description: `${snapshot.creator_count} creators across ${snapshot.video_count} videos moved the entity to ${snapshot.stage}.`,
        metadata: {
          stage: snapshot.stage,
          metaScore: snapshot.meta_score,
          confidenceScore: snapshot.confidence_score,
          creatorCount: snapshot.creator_count,
          videoCount: snapshot.video_count,
        },
      });
    }

    for (const patch of patchChanges) {
      if (!patch.game_patches) continue;
      events.push({
        id: `patch-${patch.id}`,
        timestamp: patch.game_patches.release_date,
        type: "PATCH",
        title: `Game Update ${patch.game_patches.name} (${patch.change_type})`,
        description: patch.description,
        metadata: {
          version: patch.game_patches.name,
          changeType: patch.change_type,
        },
      });
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const emerging = stageFirstSeen.get("Emerging");
    const established = stageFirstSeen.get("Established");
    const dominant = stageFirstSeen.get("Dominant");
    const firstSignal = events.length > 0
      ? new Date(Math.min(...events.map((event) => new Date(event.timestamp).getTime())))
      : null;

    return {
      events,
      velocity: {
        daysToEmerging: firstSignal && emerging ? daysBetween(firstSignal, emerging) : null,
        daysFromEmergingToEstablished: emerging && established ? daysBetween(emerging, established) : null,
        daysFromEmergingToDominant: emerging && dominant ? daysBetween(emerging, dominant) : null,
      },
    };
  }
}
