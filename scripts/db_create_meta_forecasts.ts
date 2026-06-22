import { Client } from 'pg';

async function run() {
  const connectionString = "postgresql://postgres:[DiViSiOn2019050]@db.spzlrhqfcjmdflevlufl.supabase.co:5432/postgres";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS meta_forecasts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        domain_type TEXT NOT NULL,
        stage TEXT NOT NULL,
        confidence_score INTEGER DEFAULT 0,
        reason_text TEXT,
        supporting_creators JSONB DEFAULT '[]'::jsonb,
        growth_metric INTEGER DEFAULT 0,
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Table meta_forecasts created (or already exists).");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
