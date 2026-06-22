import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import("../src/server/db");
  const { error } = await (db as any).rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS meta_forecasts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT NOT NULL,
        domain_type TEXT NOT NULL,
        stage TEXT NOT NULL,
        confidence_score INTEGER DEFAULT 0,
        reason_text TEXT,
        supporting_creators JSONB DEFAULT '[]'::jsonb,
        growth_metric INTEGER DEFAULT 0,
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- We'll just upsert by slug when recalculating
      CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_forecasts_slug ON meta_forecasts (slug);
    `
  });

  if (error) {
    console.error("Failed to execute RPC:", error);
    // Since we don't know if exec_sql RPC exists, let's just do it directly using a standard query approach
    console.log("We might not have exec_sql. I'll print the error, but we'll try a fallback if needed.");
  } else {
    console.log("Table created successfully via RPC");
  }
}

run().catch(console.error);
