export type TimelineEntityType = "gearset" | "weapon" | "skill";

export type ForecastOutcome =
  | "SUCCESS"
  | "FAILURE"
  | "PARTIAL"
  | "UNRESOLVED"
  | "EXPIRED";

export interface ForecastResolution {
  outcome: ForecastOutcome;
  trustDelta: number | null;
  reason: string | null;
  resolvedAt: string;
}

export type TimelineEvent =
  | {
      id: string;
      timestamp: string;
      type: "FORECAST";
      title: string;
      description: string;
      metadata: {
        creator: string;
        direction: string;
        confidence: number;
        forecastId: string;
        resolution: ForecastResolution | null;
      };
    }
  | {
      id: string;
      timestamp: string;
      type: "CONSENSUS";
      title: string;
      description: string;
      metadata: {
        stage: string;
        metaScore: number;
        confidenceScore: number;
        creatorCount: number;
        videoCount: number;
      };
    }
  | {
      id: string;
      timestamp: string;
      type: "PATCH";
      title: string;
      description: string;
      metadata: {
        version: string;
        changeType: string;
      };
    };

export interface MetaVelocity {
  daysToEmerging: number | null;
  daysFromEmergingToEstablished: number | null;
  daysFromEmergingToDominant: number | null;
}

export interface EntityTimeline {
  events: TimelineEvent[];
  velocity: MetaVelocity;
}
