import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer the powerful Service Role Key for backend tasks to bypass RLS.
// Fallback to the public anon key if it's not configured.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for server-side operations
export const db = createClient<Database>(supabaseUrl, supabaseKey);
