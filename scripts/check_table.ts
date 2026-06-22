import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { data, error } = await (db as any).from("division2_items").select("*").limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Table exists! Data:", data);
  }
}

run().catch(console.error);
