import { Client } from 'pg';

async function run() {
  const connectionString = "postgresql://postgres:[DiViSiOn2019050]@db.spzlrhqfcjmdflevlufl.supabase.co:5432/postgres";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS comparison_snapshots (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
        score NUMERIC NOT NULL,
        rank INTEGER NOT NULL,
        tier TEXT NOT NULL,
        lead_time_score NUMERIC DEFAULT 0,
        consensus_score NUMERIC DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS forecast_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
        entity_slug TEXT NOT NULL,
        forecast_type TEXT NOT NULL,
        predicted_direction TEXT NOT NULL,
        predicted_confidence NUMERIC DEFAULT 0,
        source_id TEXT,
        status TEXT DEFAULT 'OPEN',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS forecast_resolutions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        forecast_id UUID REFERENCES forecast_events(id) ON DELETE CASCADE,
        outcome TEXT NOT NULL,
        trust_delta NUMERIC DEFAULT 0,
        resolution_reason TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS forecast_resolution_metrics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        forecast_id UUID REFERENCES forecast_events(id) ON DELETE CASCADE,
        meta_score_growth NUMERIC DEFAULT 0,
        consensus_growth NUMERIC DEFAULT 0,
        creator_adoption_growth NUMERIC DEFAULT 0,
        evaluation_window_days INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Sprint 13 Tables created!");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
