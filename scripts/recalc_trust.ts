import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { TrustService } = await import("../src/server/services/TrustService");
  
  console.log("Recalculating creator trust scores based on new taxonomy data...");
  const updatedCount = await TrustService.calculateCreatorTrust();
  console.log(`Success! Updated trust scores for ${updatedCount} creators.`);

  console.log("Generating and persisting Meta Forecasts...");
  const { ForecastService } = await import("../src/server/services/ForecastService");
  const forecastCount = await ForecastService.generateAndPersistForecasts();
  console.log(`Success! Persisted ${forecastCount} meta forecasts.`);
}

run().catch(console.error);
