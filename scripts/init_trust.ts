import { TrustService } from "../src/server/services/TrustService";

async function run() {
  console.log("Calculating creator trust...");
  try {
    const count = await TrustService.calculateCreatorTrust();
    console.log(`Updated ${count} creator trust scores.`);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

run();
