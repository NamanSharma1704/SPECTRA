import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Check patches
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'forecast_events';");
    console.log("forecast_events columns:", res.rows.map(r => r.column_name).join(", "));
    if (res.rows.length === 0) {
      const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'patches';");
      console.log("patches columns:", res2.rows.map(r => r.column_name).join(", "));
    } else {
      console.log("game_patches columns:", res.rows.map(r => r.column_name).join(", "));
    }
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
