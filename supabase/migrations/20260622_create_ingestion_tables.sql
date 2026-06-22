-- Migration: Create Serverless Ingestion Tables
-- Description: Migrates the in-memory stagingQueue and ingestionLog arrays into persistent database tables to support Vercel Serverless environment timeouts and scale.

-- 1. Create Ingestion Logs Table
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    completed_at timestamp with time zone,
    status text NOT NULL,
    stats jsonb NOT NULL DEFAULT '{"scanned": 0, "extracted": 0, "staged": 0, "errors": 0}'::jsonb,
    errors text[] NOT NULL DEFAULT '{}'::text[]
);

-- 2. Create Staged Builds Queue Table (State Machine)
CREATE TABLE IF NOT EXISTS public.ingestion_staged_builds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    source_url text NOT NULL UNIQUE,
    source_title text NOT NULL,
    source_role text NOT NULL,
    creator_name text NOT NULL,
    published_at timestamp with time zone NOT NULL,
    channel_id text,
    
    raw_title text NOT NULL,
    inferred_name text NOT NULL,
    archetype text,
    fingerprint text NOT NULL,
    
    gear_keywords text[] NOT NULL DEFAULT '{}'::text[],
    weapon_keywords text[] NOT NULL DEFAULT '{}'::text[],
    activity_keywords text[] NOT NULL DEFAULT '{}'::text[],
    
    confidence integer NOT NULL,
    integrity_status text NOT NULL,
    verification_status text NOT NULL,
    is_append boolean NOT NULL DEFAULT false,
    trust_metrics jsonb NOT NULL,
    
    -- State Machine Queue Fields
    status text NOT NULL DEFAULT 'PENDING', -- PENDING, COMMITTED, REJECTED, ERROR
    attempt_count integer NOT NULL DEFAULT 0,
    last_error text,
    
    -- Timestamps
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for efficient querying of the queue
CREATE INDEX IF NOT EXISTS idx_staged_builds_status ON public.ingestion_staged_builds(status);
CREATE INDEX IF NOT EXISTS idx_staged_builds_fingerprint ON public.ingestion_staged_builds(fingerprint);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_started_at ON public.ingestion_logs(started_at DESC);

-- RLS (Disable for internal backend table or require Service Role)
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_staged_builds ENABLE ROW LEVEL SECURITY;

-- Allow only service role to access these tables (bypassing RLS inherently)
-- No public policies created to ensure maximum security.
