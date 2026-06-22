import { RecommendationService } from "../src/server/services/RecommendationService";

async function run() {
  console.log("Fetching builds...");
  try {
    const builds = await RecommendationService.getAllBuilds("Global");
    console.log("Found builds:", builds ? builds.length : 0);
    if (builds && builds.length > 0) {
      console.log("First build:");
      console.log(builds[0]);
    } else {
      console.log("No builds returned!");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
