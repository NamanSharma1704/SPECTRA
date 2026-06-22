import { db } from "../db";
import { evaluateForecast, formatResolutionReason } from "../../lib/intelligence/resolution_rules";
import { TrustService } from "./TrustService";

export class ForecastResolutionService {
  /**
   * Evaluates all OPEN or UNDER_REVIEW forecasts against current growth metrics.
   */
  static async resolveOpenForecasts() {
    // 1. Fetch open or under review forecasts
    const { data: openForecasts, error } = await (db as any)
      .from("forecast_events")
      .select("*")
      .in("status", ["OPEN", "UNDER_REVIEW"]);

    if (error) throw new Error(`Failed to fetch open forecasts: ${error.message}`);
    if (!openForecasts || openForecasts.length === 0) return 0;

    let resolvedCount = 0;

    for (const forecast of openForecasts) {
      // In a real production system with time-series data, we would query:
      // - Meta Score Growth (Current Meta Score - Meta Score at forecast.created_at)
      // - Consensus Growth
      // - Creator Adoption Growth
      // 
      // Since we don't have historical snapshots in this prototype, we'll simulate the evaluation
      // based on the entity's current stats vs a simulated baseline, or just mock the growth 
      // for the sake of the engine.
      
      const created_at = new Date(forecast.created_at).getTime();
      const now = Date.now();
      const daysElapsed = (now - created_at) / (1000 * 60 * 60 * 24);
      
      // MOCK: Generate some pseudo-random growth metrics for prototype demonstration
      // Ideally this would be fetched from `build_activity_scores` history.
      const pseudoRandomSeed = (forecast.id.charCodeAt(0) + forecast.id.charCodeAt(1)) % 100;
      let metaGrowth = pseudoRandomSeed - 20; // -20 to 80
      let consensusGrowth = (pseudoRandomSeed / 2) - 5; // -5 to 45
      let adoptionGrowth = (pseudoRandomSeed / 3); // 0 to 33
      
      // If it's a very new forecast, don't give it huge growth yet
      if (daysElapsed < 14) {
        metaGrowth = metaGrowth * (daysElapsed / 14);
        consensusGrowth = consensusGrowth * (daysElapsed / 14);
        adoptionGrowth = adoptionGrowth * (daysElapsed / 14);
      }

      const evaluation = evaluateForecast(metaGrowth, consensusGrowth, adoptionGrowth, daysElapsed);

      if (evaluation.outcome !== "UNRESOLVED") {
        // Record the resolution metrics
        const { error: metricsError } = await (db as any)
          .from("forecast_resolution_metrics")
          .insert({
            forecast_id: forecast.id,
            meta_score_growth: metaGrowth,
            consensus_growth: consensusGrowth,
            creator_adoption_growth: adoptionGrowth,
            evaluation_window_days: Math.floor(daysElapsed)
          });
          
        if (metricsError) console.error("Failed to insert resolution metrics", metricsError);

        // Generate the human-readable reason
        const reason = formatResolutionReason(evaluation.outputs, evaluation.outcome);
        
        // Calculate the trust delta
        // If SUCCESS, positive delta based on confidence.
        // If FAILURE, negative delta based on confidence.
        let trustDelta = 0;
        if (evaluation.outcome === "SUCCESS") {
           trustDelta = 1.0 + (forecast.predicted_confidence / 100) * 2; // +1.0 to +3.0
        } else if (evaluation.outcome === "FAILURE") {
           trustDelta = -1.0 - (forecast.predicted_confidence / 100) * 3; // -1.0 to -4.0
        } else if (evaluation.outcome === "PARTIAL") {
           trustDelta = 0.5;
        }

        // Record the resolution
        const { error: resolutionError } = await (db as any)
          .from("forecast_resolutions")
          .insert({
            forecast_id: forecast.id,
            outcome: evaluation.outcome,
            resolution_confidence: evaluation.confidence,
            resolution_reason: reason,
            trust_delta: trustDelta
          });

        if (resolutionError) console.error("Failed to insert resolution", resolutionError);

        // Update the event status
        await (db as any)
          .from("forecast_events")
          .update({ status: evaluation.outcome === "EXPIRED" ? "EXPIRED" : "RESOLVED" })
          .eq("id", forecast.id);

        resolvedCount++;
      }
    }
    
    // Trigger a trust score recalculation if any forecasts were resolved
    if (resolvedCount > 0) {
      await TrustService.calculateCreatorTrust();
    }

    return resolvedCount;
  }
}
