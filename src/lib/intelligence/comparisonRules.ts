import { CreatorComparisonSnapshot } from "@/types/intelligence";

export type VerdictResult = {
  winner: CreatorComparisonSnapshot;
  loser: CreatorComparisonSnapshot;
  score: number;
  reasons: string[];
};

export const COMPARISON_WEIGHTS = {
  trustScore: 0.30,
  forecastAccuracy: 0.25,
  influenceScore: 0.20,
  leadTimeScore: 0.15,
  consensusParticipation: 0.10,
};

export const VERDICT_RULES = {
  getBestDiscoverer: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    const aLead = a.leadTimeScoreState?.status === "AVAILABLE" ? a.leadTimeScoreState.score : 0;
    const bLead = b.leadTimeScoreState?.status === "AVAILABLE" ? b.leadTimeScoreState.score : 0;
    const scoreA = a.originations * 2 + aLead;
    const scoreB = b.originations * 2 + bLead;
    
    const isAWinner = scoreA >= scoreB;
    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    const score = isAWinner ? scoreA : scoreB;
    
    const winnerLead = winner.leadTimeScoreState?.status === "AVAILABLE" ? winner.leadTimeScoreState.score : 0;
    const loserLead = loser.leadTimeScoreState?.status === "AVAILABLE" ? loser.leadTimeScoreState.score : 0;

    const reasons = [
      winnerLead > loserLead ? `Earlier lead time score (${winnerLead} vs ${loserLead})` : `Comparable or lower lead time score (${winnerLead} vs ${loserLead})`,
      winner.originations > loser.originations ? `Higher number of originations (${winner.originations} vs ${loser.originations})` : `Fewer originations (${winner.originations} vs ${loser.originations})`
    ];

    return { winner, loser, score, reasons };
  },

  getBestValidator: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    const aAccuracy = a.forecastAccuracyState?.status === "AVAILABLE" ? a.forecastAccuracyState.accuracy : 0;
    const bAccuracy = b.forecastAccuracyState?.status === "AVAILABLE" ? b.forecastAccuracyState.accuracy : 0;
    const scoreA = a.validations + aAccuracy * 0.5;
    const scoreB = b.validations + bAccuracy * 0.5;
    
    const isAWinner = scoreA >= scoreB;
    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    const score = isAWinner ? scoreA : scoreB;

    const winnerAccuracy = winner.forecastAccuracyState?.status === "AVAILABLE" ? winner.forecastAccuracyState.accuracy : 0;
    const loserAccuracy = loser.forecastAccuracyState?.status === "AVAILABLE" ? loser.forecastAccuracyState.accuracy : 0;

    const reasons = [
      winner.validations > loser.validations ? `More validation contributions (${winner.validations} vs ${loser.validations})` : `Fewer validation contributions (${winner.validations} vs ${loser.validations})`,
      winnerAccuracy > loserAccuracy ? `Higher forecast accuracy (${winnerAccuracy}% vs ${loserAccuracy}%)` : `Lower forecast accuracy (${winnerAccuracy}% vs ${loserAccuracy}%)`
    ];

    return { winner, loser, score, reasons };
  },

  getBestForecaster: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    const aAccuracy = a.forecastAccuracyState?.status === "AVAILABLE" ? a.forecastAccuracyState.accuracy : 0;
    const bAccuracy = b.forecastAccuracyState?.status === "AVAILABLE" ? b.forecastAccuracyState.accuracy : 0;
    
    let isAWinner = true;
    if (aAccuracy > bAccuracy) isAWinner = true;
    else if (bAccuracy > aAccuracy) isAWinner = false;
    else isAWinner = a.confidenceScore >= b.confidenceScore;
    
    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    
    const winnerAccuracy = winner.forecastAccuracyState?.status === "AVAILABLE" ? winner.forecastAccuracyState.accuracy : 0;
    const loserAccuracy = loser.forecastAccuracyState?.status === "AVAILABLE" ? loser.forecastAccuracyState.accuracy : 0;
    
    const score = winnerAccuracy;

    const reasons = [
      winnerAccuracy > loserAccuracy ? `Higher forecast accuracy (${winnerAccuracy}% vs ${loserAccuracy}%)` : `Equal accuracy (${winnerAccuracy}%)`,
      winner.evidenceCount > loser.evidenceCount ? `More evaluated forecasts (${winner.evidenceCount} vs ${loser.evidenceCount})` : `Fewer evaluated forecasts (${winner.evidenceCount} vs ${loser.evidenceCount})`,
      winner.confidenceScore > loser.confidenceScore ? `Stronger confidence score (${winner.confidenceScore} vs ${loser.confidenceScore})` : `Lower confidence score (${winner.confidenceScore} vs ${loser.confidenceScore})`
    ];

    return { winner, loser, score, reasons };
  },

  getMostInfluential: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    let isAWinner = true;
    if (a.influenceScore > b.influenceScore) isAWinner = true;
    else if (b.influenceScore > a.influenceScore) isAWinner = false;
    else isAWinner = a.influenceEfficiency >= b.influenceEfficiency;

    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    const score = winner.influenceScore;

    const reasons = [
      winner.influenceScore > loser.influenceScore ? `Higher overall influence score (${winner.influenceScore} vs ${loser.influenceScore})` : `Equal influence score (${winner.influenceScore})`,
      winner.influenceEfficiency > loser.influenceEfficiency ? `Better influence efficiency (${winner.influenceEfficiency} vs ${loser.influenceEfficiency})` : `Lower influence efficiency (${winner.influenceEfficiency} vs ${loser.influenceEfficiency})`,
      winner.consensusInfluence > loser.consensusInfluence ? `Higher average consensus reach (${winner.consensusInfluence} vs ${loser.consensusInfluence})` : `Lower average consensus reach (${winner.consensusInfluence} vs ${loser.consensusInfluence})`
    ];

    return { winner, loser, score, reasons };
  },

  getHighestConfidence: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    // Negative test logic: evaluate based on evidence count rather than raw accuracy if accuracy is high but evidence is low
    let isAWinner = a.confidenceScore >= b.confidenceScore;
    
    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    const score = winner.confidenceScore;
    
    const winnerAccuracy = winner.forecastAccuracyState?.status === "AVAILABLE" ? winner.forecastAccuracyState.accuracy : 0;
    const loserAccuracy = loser.forecastAccuracyState?.status === "AVAILABLE" ? loser.forecastAccuracyState.accuracy : 0;

    const reasons = [
      winner.evidenceCount > loser.evidenceCount ? `Significantly more evaluated forecasts (${winner.evidenceCount} vs ${loser.evidenceCount})` : `Fewer evaluated forecasts (${winner.evidenceCount} vs ${loser.evidenceCount})`,
      winnerAccuracy < loserAccuracy ? `Maintained high confidence score despite lower raw accuracy (${winnerAccuracy}% vs ${loserAccuracy}%)` : `Higher or equal raw accuracy (${winnerAccuracy}% vs ${loserAccuracy}%)`
    ];

    return { winner, loser, score, reasons };
  },

  getBestOverall: (a: CreatorComparisonSnapshot, b: CreatorComparisonSnapshot): VerdictResult => {
    const aTrust = a.trustScoreState?.status === "AVAILABLE" ? a.trustScoreState.score : 0;
    const aAccuracy = a.forecastAccuracyState?.status === "AVAILABLE" ? a.forecastAccuracyState.accuracy : 0;
    const aLead = a.leadTimeScoreState?.status === "AVAILABLE" ? a.leadTimeScoreState.score : 0;
    
    const bTrust = b.trustScoreState?.status === "AVAILABLE" ? b.trustScoreState.score : 0;
    const bAccuracy = b.forecastAccuracyState?.status === "AVAILABLE" ? b.forecastAccuracyState.accuracy : 0;
    const bLead = b.leadTimeScoreState?.status === "AVAILABLE" ? b.leadTimeScoreState.score : 0;

    const scoreA = 
      (aTrust * COMPARISON_WEIGHTS.trustScore) +
      (aAccuracy * COMPARISON_WEIGHTS.forecastAccuracy) +
      (a.influenceScore * COMPARISON_WEIGHTS.influenceScore) +
      (aLead * COMPARISON_WEIGHTS.leadTimeScore) +
      (a.consensusParticipation * COMPARISON_WEIGHTS.consensusParticipation);

    const scoreB = 
      (bTrust * COMPARISON_WEIGHTS.trustScore) +
      (bAccuracy * COMPARISON_WEIGHTS.forecastAccuracy) +
      (b.influenceScore * COMPARISON_WEIGHTS.influenceScore) +
      (bLead * COMPARISON_WEIGHTS.leadTimeScore) +
      (b.consensusParticipation * COMPARISON_WEIGHTS.consensusParticipation);

    const isAWinner = scoreA >= scoreB;
    const winner = isAWinner ? a : b;
    const loser = isAWinner ? b : a;
    const score = Math.round(isAWinner ? scoreA : scoreB);

    const winnerTrust = winner.trustScoreState?.status === "AVAILABLE" ? winner.trustScoreState.score : 0;
    const loserTrust = loser.trustScoreState?.status === "AVAILABLE" ? loser.trustScoreState.score : 0;

    const reasons = [
      winnerTrust > loserTrust ? `Higher Trust Score (${winnerTrust} vs ${loserTrust})` : `Lower Trust Score (${winnerTrust} vs ${loserTrust})`,
      winner.influenceScore > loser.influenceScore ? `Stronger influence within meta` : `Weaker influence within meta`,
      winner.consensusParticipation > loser.consensusParticipation ? `Higher consensus participation (${winner.consensusParticipation}% vs ${loser.consensusParticipation}%)` : `Lower consensus participation (${winner.consensusParticipation}% vs ${loser.consensusParticipation}%)`
    ];

    return { winner, loser, score, reasons };
  }
};
