export type ResolutionRuleOutput = {
  rule: string;
  observed: number;
  threshold: number;
  passed: boolean;
};

export type ResolutionEvaluation = {
  outcome: "SUCCESS" | "FAILURE" | "PARTIAL" | "UNRESOLVED" | "EXPIRED";
  confidence: number;
  outputs: ResolutionRuleOutput[];
};

export const RESOLUTION_THRESHOLDS = {
  // A forecast expires if it is older than 180 days and hasn't met any condition
  MAX_EVALUATION_WINDOW_DAYS: 180,
  
  // Growth targets to classify as 'SUCCESS'
  SUCCESS_MIN_META_GROWTH: 25,
  SUCCESS_MIN_CONSENSUS_GROWTH: 15,
  SUCCESS_MIN_ADOPTION_GROWTH: 10,
  
  // Drop targets to classify as 'FAILURE'
  FAILURE_MAX_META_GROWTH: 5,
  FAILURE_MAX_CONSENSUS_GROWTH: 5,
  
  // Weights for computing resolution confidence
  WEIGHT_META: 0.5,
  WEIGHT_CONSENSUS: 0.3,
  WEIGHT_ADOPTION: 0.2,
};

/**
 * Evaluates a set of growth metrics against the resolution thresholds.
 */
export function evaluateForecast(
  metaGrowth: number,
  consensusGrowth: number,
  adoptionGrowth: number,
  daysElapsed: number
): ResolutionEvaluation {
  
  const outputs: ResolutionRuleOutput[] = [
    { rule: "META_GROWTH_SUCCESS", observed: metaGrowth, threshold: RESOLUTION_THRESHOLDS.SUCCESS_MIN_META_GROWTH, passed: metaGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_META_GROWTH },
    { rule: "CONSENSUS_GROWTH_SUCCESS", observed: consensusGrowth, threshold: RESOLUTION_THRESHOLDS.SUCCESS_MIN_CONSENSUS_GROWTH, passed: consensusGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_CONSENSUS_GROWTH },
    { rule: "ADOPTION_GROWTH_SUCCESS", observed: adoptionGrowth, threshold: RESOLUTION_THRESHOLDS.SUCCESS_MIN_ADOPTION_GROWTH, passed: adoptionGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_ADOPTION_GROWTH },
    
    { rule: "META_GROWTH_FAILURE", observed: metaGrowth, threshold: RESOLUTION_THRESHOLDS.FAILURE_MAX_META_GROWTH, passed: metaGrowth <= RESOLUTION_THRESHOLDS.FAILURE_MAX_META_GROWTH },
    { rule: "CONSENSUS_GROWTH_FAILURE", observed: consensusGrowth, threshold: RESOLUTION_THRESHOLDS.FAILURE_MAX_CONSENSUS_GROWTH, passed: consensusGrowth <= RESOLUTION_THRESHOLDS.FAILURE_MAX_CONSENSUS_GROWTH },
  ];

  // Calculate resolution confidence based on the margin by which thresholds are passed
  // (Simplified confidence model: 0-100 based on how strong the growth signals are)
  let confidence = 0;
  
  if (metaGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_META_GROWTH) confidence += 50;
  else if (metaGrowth <= RESOLUTION_THRESHOLDS.FAILURE_MAX_META_GROWTH) confidence += 50;
  else confidence += 20; // Ambiguous zone lowers confidence
  
  if (consensusGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_CONSENSUS_GROWTH) confidence += 30;
  else if (consensusGrowth <= RESOLUTION_THRESHOLDS.FAILURE_MAX_CONSENSUS_GROWTH) confidence += 30;
  else confidence += 10;
  
  if (adoptionGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_ADOPTION_GROWTH) confidence += 20;
  else confidence += 5;
  
  // Cap confidence
  confidence = Math.min(100, Math.max(0, confidence));

  // Determine outcome
  const isSuccess = metaGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_META_GROWTH && consensusGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_CONSENSUS_GROWTH;
  const isFailure = metaGrowth <= RESOLUTION_THRESHOLDS.FAILURE_MAX_META_GROWTH && daysElapsed > 30; // Must give it at least 30 days to fail
  const isPartial = metaGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_META_GROWTH || consensusGrowth >= RESOLUTION_THRESHOLDS.SUCCESS_MIN_CONSENSUS_GROWTH;

  let outcome: "SUCCESS" | "FAILURE" | "PARTIAL" | "UNRESOLVED" | "EXPIRED" = "UNRESOLVED";

  if (isSuccess) {
    outcome = "SUCCESS";
  } else if (isFailure) {
    outcome = "FAILURE";
  } else if (isPartial && daysElapsed > 60) {
    // If we've hit partial metrics but haven't achieved full success after 60 days
    outcome = "PARTIAL";
  } else if (daysElapsed > RESOLUTION_THRESHOLDS.MAX_EVALUATION_WINDOW_DAYS) {
    outcome = "EXPIRED";
  }

  return {
    outcome,
    confidence,
    outputs
  };
}

export function formatResolutionReason(outputs: ResolutionRuleOutput[], outcome: string): string {
  if (outcome === "EXPIRED") {
    return "Forecast evaluation window expired (180 days) without crossing validation thresholds.";
  }
  
  const reasons = outputs
    .filter(o => o.rule.includes(outcome === "SUCCESS" ? "SUCCESS" : "FAILURE"))
    .map(o => {
      const metricName = o.rule.replace("_SUCCESS", "").replace("_FAILURE", "").replace("_", " ");
      const verb = o.passed ? "exceeded" : "failed to meet";
      return `${metricName} ${verb} threshold of ${o.threshold} (observed: ${o.observed.toFixed(1)})`;
    });
    
  return reasons.join(". ") + ".";
}
