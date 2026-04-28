-- =============================================================================
-- 005_real_data_tables.sql
-- Real-data backing tables for the public site:
--   1. holders          -> drives the Elite Leaderboard (Wall of Fame)
--   2. welfare_metrics  -> drives the live numbers on the About page
--
-- Both are public-read, admin-only-write — they piggyback on the
-- is_admin_caller() helper from 004_admin_wallet_rls.sql, so make sure that
-- migration is applied first.
-- =============================================================================

-- ── 1. HOLDERS (Elite Leaderboard) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holders (
    address       TEXT PRIMARY KEY,                         -- wallet, lowercase
    display_name  TEXT,                                     -- optional vanity name
    balance       NUMERIC(36,4) NOT NULL DEFAULT 0,         -- OKBOND balance
    rank          INT,                                      -- 1 = top holder
    badge         TEXT CHECK (badge IN ('champion','sovereign','elite','distinguished','honoured')),
    avatar_url    TEXT,
    tx_hash       TEXT,                                     -- proof / latest tx
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS holders_rank_idx    ON holders (rank)             WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS holders_balance_idx ON holders (balance DESC);

ALTER TABLE holders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "holders_public_read" ON holders;
CREATE POLICY "holders_public_read"  ON holders FOR SELECT USING (true);

DROP POLICY IF EXISTS "holders_admin_insert" ON holders;
CREATE POLICY "holders_admin_insert" ON holders FOR INSERT WITH CHECK (is_admin_caller());

DROP POLICY IF EXISTS "holders_admin_update" ON holders;
CREATE POLICY "holders_admin_update" ON holders FOR UPDATE USING (is_admin_caller()) WITH CHECK (is_admin_caller());

DROP POLICY IF EXISTS "holders_admin_delete" ON holders;
CREATE POLICY "holders_admin_delete" ON holders FOR DELETE USING (is_admin_caller());

-- ── 2. WELFARE METRICS (About page numbers) ──────────────────────────────
CREATE TABLE IF NOT EXISTS welfare_metrics (
    key         TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    value       NUMERIC NOT NULL,
    suffix      TEXT DEFAULT '',
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE welfare_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "welfare_public_read" ON welfare_metrics;
CREATE POLICY "welfare_public_read"  ON welfare_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "welfare_admin_insert" ON welfare_metrics;
CREATE POLICY "welfare_admin_insert" ON welfare_metrics FOR INSERT WITH CHECK (is_admin_caller());

DROP POLICY IF EXISTS "welfare_admin_update" ON welfare_metrics;
CREATE POLICY "welfare_admin_update" ON welfare_metrics FOR UPDATE USING (is_admin_caller()) WITH CHECK (is_admin_caller());

DROP POLICY IF EXISTS "welfare_admin_delete" ON welfare_metrics;
CREATE POLICY "welfare_admin_delete" ON welfare_metrics FOR DELETE USING (is_admin_caller());

-- Seed with the current placeholder values so the About page renders the same
-- numbers it has today; the admin can edit them via the panel afterwards.
INSERT INTO welfare_metrics (key, label, value, suffix) VALUES
  ('youth_empowered',       'Youth Empowered',         3247,  '+'),
  ('free_tech_education',   'Free Tech Education Hrs', 18500, '+'),
  ('community_grants',      'Community Grants',        142,   '')
ON CONFLICT (key) DO NOTHING;
