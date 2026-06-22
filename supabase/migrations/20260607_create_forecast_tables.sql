-- Create ENUMs for Forecast States
CREATE TYPE forecast_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'EXPIRED');
CREATE TYPE forecast_direction AS ENUM ('BUFF', 'NERF', 'META', 'OBSOLETE', 'EMERGING');
CREATE TYPE forecast_outcome AS ENUM ('SUCCESS', 'FAILURE', 'PARTIAL', 'UNRESOLVED', 'EXPIRED');

-- Table 1: forecast_events
CREATE TABLE forecast_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  entity_slug TEXT NOT NULL,
  forecast_type TEXT NOT NULL,
  predicted_direction forecast_direction NOT NULL,
  predicted_confidence NUMERIC CHECK (predicted_confidence >= 0 AND predicted_confidence <= 100) NOT NULL,
  status forecast_status NOT NULL DEFAULT 'OPEN',
  source_id UUID REFERENCES build_sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: forecast_resolutions
CREATE TABLE forecast_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES forecast_events(id) ON DELETE CASCADE,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  outcome forecast_outcome NOT NULL DEFAULT 'UNRESOLVED',
  resolution_confidence NUMERIC CHECK (resolution_confidence >= 0 AND resolution_confidence <= 100),
  resolution_reason TEXT,
  trust_delta NUMERIC -- exact impact this resolution had on the creator's trust score
);

-- Table 3: forecast_resolution_metrics
CREATE TABLE forecast_resolution_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES forecast_events(id) ON DELETE CASCADE,
  meta_score_growth NUMERIC,
  consensus_growth NUMERIC,
  creator_adoption_growth NUMERIC,
  evaluation_window_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_forecast_events_creator_id ON forecast_events(creator_id);
CREATE INDEX idx_forecast_events_status ON forecast_events(status);
CREATE INDEX idx_forecast_resolutions_forecast_id ON forecast_resolutions(forecast_id);
CREATE INDEX idx_forecast_resolutions_outcome ON forecast_resolutions(outcome);

-- Trigger to update updated_at on forecast_events
CREATE OR REPLACE FUNCTION update_forecast_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forecast_events_updated_at
BEFORE UPDATE ON forecast_events
FOR EACH ROW
EXECUTE FUNCTION update_forecast_events_updated_at();
