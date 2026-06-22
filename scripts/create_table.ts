import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const query = `
    CREATE TABLE IF NOT EXISTS public.division2_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        aliases TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_division2_items_type ON public.division2_items(type);
    CREATE INDEX IF NOT EXISTS idx_division2_items_slug ON public.division2_items(slug);
  `;

  await client.query(query);
  console.log("Table division2_items created successfully!");

  await client.end();
}

run().catch(console.error);
