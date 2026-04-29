-- =============================================================================
-- 006_marcus_defense.sql
-- Marcus Auto-Defense Layer — 24/7 sentry tables.
--
-- Two tables:
--   1. marcus_defense_state   (singleton row, id=1) — what Marcus saw last run
--   2. chairman_alerts        — high-priority items awaiting Chairman judgment
--
-- Marcus runs as a serverless cron (api/marcus-watch.ts) using the project's
-- anon key — there is NO service-role secret in this app. Therefore both
-- tables permit anon INSERT/UPDATE; reads are public so the AdminGate-protected
-- Defense console can render them. The data is non-sensitive (block numbers,
-- public on-chain owners, public tx hashes) so this is safe.
-- =============================================================================

-- ── 1. Singleton state row ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marcus_defense_state (
    id                       INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_block_checked       BIGINT,
    last_known_owner         TEXT,
    last_run_at              TIMESTAMPTZ DEFAULT NOW(),
    total_runs               BIGINT DEFAULT 0,
    total_threats_detected   BIGINT DEFAULT 0,
    last_run_summary         JSONB DEFAULT '{}'::jsonb
);

INSERT INTO marcus_defense_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE marcus_defense_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marcus_state_public_read"   ON marcus_defense_state;
DROP POLICY IF EXISTS "marcus_state_anon_upsert"   ON marcus_defense_state;
DROP POLICY IF EXISTS "marcus_state_anon_update"   ON marcus_defense_state;

CREATE POLICY "marcus_state_public_read"  ON marcus_defense_state FOR SELECT USING (true);
CREATE POLICY "marcus_state_anon_upsert"  ON marcus_defense_state FOR INSERT WITH CHECK (id = 1);
CREATE POLICY "marcus_state_anon_update"  ON marcus_defense_state FOR UPDATE USING (id = 1) WITH CHECK (id = 1);

-- ── 2. Chairman Alerts ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chairman_alerts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level             TEXT NOT NULL CHECK (level IN ('watch','alert','critical')),
    kind              TEXT NOT NULL,                 -- 'whale_transfer' | 'ownership_change' | 'manual'
    summary           TEXT NOT NULL,
    detail            JSONB DEFAULT '{}'::jsonb,
    action_required   TEXT,                          -- e.g. 'KILL_SWITCH', 'REVIEW'
    acknowledged_at   TIMESTAMPTZ,
    acknowledged_by   TEXT,                          -- wallet address
    chairman_command  TEXT,                          -- 'CONFIRM_KILL_SWITCH' | 'STAND_DOWN' | NULL
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chairman_alerts_pending_idx
    ON chairman_alerts (created_at DESC)
    WHERE acknowledged_at IS NULL;

CREATE INDEX IF NOT EXISTS chairman_alerts_recent_idx
    ON chairman_alerts (created_at DESC);

ALTER TABLE chairman_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chairman_alerts_public_read"   ON chairman_alerts;
DROP POLICY IF EXISTS "chairman_alerts_anon_insert"   ON chairman_alerts;
DROP POLICY IF EXISTS "chairman_alerts_anon_update"   ON chairman_alerts;

-- Public read so the protected Defense console (AdminGate) can render it
CREATE POLICY "chairman_alerts_public_read" ON chairman_alerts FOR SELECT USING (true);

-- Anon (the Marcus cron) can record new alerts
CREATE POLICY "chairman_alerts_anon_insert" ON chairman_alerts FOR INSERT WITH CHECK (true);

-- Anon can acknowledge (the AdminGate UI is the only writer in practice; we trust
-- the wallet-gated client). Tightening with SIWE JWTs is a future step.
CREATE POLICY "chairman_alerts_anon_update" ON chairman_alerts FOR UPDATE USING (true) WITH CHECK (true);
