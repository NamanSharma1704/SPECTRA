import * as dotenv from "dotenv";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL in .env.local");
}

// Sprint 14 extends the existing snapshot table. Patch and forecast tables are
// intentionally reused so the timeline remains part of the existing data model.
const SQL = `
ALTER TABLE public.meta_consensus_snapshots
ADD COLUMN IF NOT EXISTS stage TEXT;

CREATE INDEX IF NOT EXISTS idx_meta_consensus_slug_stage
ON public.meta_consensus_snapshots(slug, stage);
`;

async function main() {
  console.log("Applying Sprint 14 timeline schema...");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Sprint 14 timeline schema applied.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
