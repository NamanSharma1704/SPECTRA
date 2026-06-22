export type IntelligenceContribution = {
  sourceId: string;
  creatorId: string;
  buildId: string;
  buildName: string; // The archetype name
  
  role: 'ORIGINATOR' | 'VALIDATOR' | 'EVOLVER';

  sourceTitle: string;
  sourceUrl: string;
  publishedAt: Date | string;

  metaImpact: string;
  consensusReach: number;
  forecastAccuracy: string; // 'Successful', 'Pending', etc.
  
  contributionStrength: number;
};

export type CreatorComparisonSnapshot = {
  creatorId: string;
  name: string;
  trustScoreState: any;
  influenceScore: number;
  influenceEfficiency: number;
  forecastAccuracyState: any;
  leadTimeScoreState: any;
  consensusParticipation: number; // percentage
  consensusInfluence: number; // average reach
  evidenceCount: number; // evaluated forecasts
  originations: number;
  validations: number;
  evolutions: number;
  confidenceScore: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  comparisonRank: number;
};


export type IntelligenceState<T> = 
  | ({ status: "AVAILABLE" } & T)
  | { status: "NO_DATA" }
  | { 
      status: "INSUFFICIENT_EVIDENCE";
      evidenceCount: number;
    }
  | {
      status: "STALE";
      lastSupportingEvidenceDays: number;
    };

export type FreshnessState = "FRESH" | "AGING" | "STALE";

export type GrowthState = "NEW_ENTRY" | "ESTABLISHED" | "NO_BASELINE";

export type IntelligenceResult<T> = {
  state: IntelligenceState<T>;
  freshness: FreshnessState;
  sourceCount: number;
  lastUpdatedAt: string;
};
