-- =============================================================================
-- 007_reserve_allocations.sql
-- LIVE ASSET CONTROL — Reserve allocation registry mutated by the Chairman
-- from the Founder's Vault and surfaced site-wide via the ReserveWidget.
--
-- Design:
--   • One row per backing-asset class (Real Estate, On-Chain, Liquidity, POL).
--   • Public SELECT (this is investor-facing transparency data).
--   • INSERT/UPDATE gated by EITHER (a) the JWT-claim admin path
--     (`is_admin_caller()` from migration 004) OR (b) the row's own
--     `updated_by` column matching the Chairman wallet — defense-in-depth
--     consistent with how dispatchBus/broadcastDispatch operates today.
--   • DELETE has no policy → denied with RLS on (no row should ever vanish).
--   • Realtime publication so the ReserveWidget reflects edits with no
--     redeploy and no manual refresh.
--   • Append-only `reserve_allocation_history` audit trail of every snapshot.
-- =============================================================================

-- ── 1. Live allocation table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reserve_allocations (
    asset_key     TEXT PRIMARY KEY,
    label         TEXT NOT NULL,
    pct           NUMERIC(5,2) NOT NULL CHECK (pct >= 0 AND pct <= 100),
    hint          TEXT,
    display_order INT NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by    TEXT
);

CREATE INDEX IF NOT EXISTS idx_reserve_allocations_order
    ON reserve_allocations(display_order);

-- Seed the four asset classes (preserves prior hard-coded values).
INSERT INTO reserve_allocations (asset_key, label, pct, hint, display_order)
VALUES
  ('real_estate', 'Real Estate',      38, 'Orakzai Group land bank',   1),
  ('on_chain',    'On-Chain Reserve', 27, 'Multisig treasury wallet',  2),
  ('liquidity',   'Liquidity Pools',  18, 'QuickSwap V3 + Uniswap',    3),
  ('pol',         'Treasury POL',     17, 'Liquid POL reserves',       4)
ON CONFLICT (asset_key) DO NOTHING;

-- ── 2. Append-only audit history ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reserve_allocation_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot    JSONB NOT NULL,            -- e.g. {"real_estate":40,"on_chain":25,...}
    total_pct   NUMERIC(5,2) NOT NULL,
    updated_by  TEXT NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reserve_history_created
    ON reserve_allocation_history(created_at DESC);

-- ── 3. Row-Level Security ──────────────────────────────────────────────────
ALTER TABLE reserve_allocations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_allocation_history  ENABLE ROW LEVEL SECURITY;

-- Helper: the Chairman wallet (lowercased) — must match adminAuth.ts
CREATE OR REPLACE FUNCTION chairman_wallet()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7'::text;
$$;

-- Optional fallback when migration 004 (is_admin_caller) hasn't been applied.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin_caller'
  ) THEN
    CREATE OR REPLACE FUNCTION is_admin_caller()
    RETURNS BOOLEAN
    LANGUAGE sql
    STABLE
    AS $f$ SELECT FALSE; $f$;
  END IF;
END $$;

-- Public read — these figures are part of the transparency disclosure.
DROP POLICY IF EXISTS "reserve_allocations public read" ON reserve_allocations;
CREATE POLICY "reserve_allocations public read"
  ON reserve_allocations FOR SELECT USING (true);

DROP POLICY IF EXISTS "reserve_history public read" ON reserve_allocation_history;
CREATE POLICY "reserve_history public read"
  ON reserve_allocation_history FOR SELECT USING (true);

-- INSERT — Chairman only (either via JWT claim OR explicit updated_by claim).
DROP POLICY IF EXISTS "Chairman may insert allocation" ON reserve_allocations;
CREATE POLICY "Chairman may insert allocation"
  ON reserve_allocations FOR INSERT
  WITH CHECK (
    is_admin_caller()
    OR lower(coalesce(updated_by, '')) = chairman_wallet()
  );

-- UPDATE — same rule on both old and new row.
DROP POLICY IF EXISTS "Chairman may update allocation" ON reserve_allocations;
CREATE POLICY "Chairman may update allocation"
  ON reserve_allocations FOR UPDATE
  USING (
    is_admin_caller()
    OR lower(coalesce(updated_by, '')) = chairman_wallet()
    OR updated_by IS NULL              -- legacy seed rows (NULL by_) editable once
  )
  WITH CHECK (
    is_admin_caller()
    OR lower(coalesce(updated_by, '')) = chairman_wallet()
  );

-- INSERT into history — same rule, must record the Chairman as author.
DROP POLICY IF EXISTS "Chairman may insert history" ON reserve_allocation_history;
CREATE POLICY "Chairman may insert history"
  ON reserve_allocation_history FOR INSERT
  WITH CHECK (
    is_admin_caller()
    OR lower(coalesce(updated_by, '')) = chairman_wallet()
  );

-- (Intentionally no UPDATE/DELETE policies on history → append-only.)

-- ── 4. Realtime publication ────────────────────────────────────────────────
-- Make changes broadcast over Supabase Realtime so the ReserveWidget reflects
-- edits across every visitor's screen with no redeploy.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE reserve_allocations;
    EXCEPTION WHEN duplicate_object THEN
      -- already in publication
      NULL;
    END;
  END IF;
END $$;

-- ── 5. Convenience: bump updated_at on every UPDATE ────────────────────────
CREATE OR REPLACE FUNCTION touch_reserve_allocation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reserve_allocations_touch ON reserve_allocations;
CREATE TRIGGER trg_reserve_allocations_touch
  BEFORE UPDATE ON reserve_allocations
  FOR EACH ROW
  EXECUTE FUNCTION touch_reserve_allocation_updated_at();

-- ── DONE ───────────────────────────────────────────────────────────────────
-- Apply via the Supabase SQL editor or `supabase db push`.
