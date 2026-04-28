-- =============================================================================
-- 004_admin_wallet_rls.sql
-- Wallet-gated Row Level Security: only the admin wallet can mutate sensitive
-- columns / rows. Read access stays public (this is a public investor site).
--
-- HOW IT WORKS
-- ------------
-- Postgres has no native ECDSA verifier, so RLS cannot directly check a SIWE
-- signature. The end-to-end flow is:
--
--   1. Client signs SIWE message with the admin wallet (already implemented in
--      src/lib/adminAuth.ts).
--   2. Client posts the signed message to a Supabase Edge Function
--      (`supabase/functions/siwe-verify`) that:
--         a. Recovers the signer with ethers.verifyMessage()
--         b. Confirms the signer is in the `admin_wallets` table
--         c. Mints a Supabase JWT with `wallet_address` claim using the project
--            JWT secret.
--   3. Client uses that JWT as its Supabase session token.
--   4. RLS policies below check the JWT claim via `current_admin_wallet()` and
--      only allow writes when the claim matches an admin wallet.
--
-- Until the Edge Function is deployed, anon writes to admin-only operations
-- are DENIED, which is the safe default.
-- =============================================================================

-- ── 1. Admin wallet registry ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_wallets (
    address TEXT PRIMARY KEY,
    label   TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_wallets (address, label)
VALUES ('0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7', 'Founder / OSG Root')
ON CONFLICT (address) DO NOTHING;

ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_wallets readable" ON admin_wallets;
CREATE POLICY "admin_wallets readable" ON admin_wallets FOR SELECT USING (true);
-- No INSERT/UPDATE/DELETE policies → only the service-role key can modify it.

-- ── 2. Helper: read wallet claim from current JWT ──────────────────────────
CREATE OR REPLACE FUNCTION current_admin_wallet()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(
    current_setting('request.jwt.claims', true)::jsonb ->> 'wallet_address',
    ''
  ));
$$;

CREATE OR REPLACE FUNCTION is_admin_caller()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_wallets
    WHERE lower(address) = current_admin_wallet()
      AND current_admin_wallet() <> ''
  );
$$;

-- ── 3. Lock down PROFILES ──────────────────────────────────────────────────
-- Reads stay public. Inserts: a wallet may only insert a profile row keyed
-- to its own address (claim must match). Updates: only the row's owner OR
-- the admin can update; only the admin can change `badge` or `branding_logo`.

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    lower(address) = current_admin_wallet()
    OR is_admin_caller()
  );

DROP POLICY IF EXISTS "Users can update own profile (excluding badge)" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Owner can update their own row (claim must match the row's address)
CREATE POLICY "Owner can update own profile" ON profiles
  FOR UPDATE
  USING (lower(address) = current_admin_wallet())
  WITH CHECK (lower(address) = current_admin_wallet());

-- Admin can update any profile (badges, branding_logo, etc.)
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE
  USING (is_admin_caller())
  WITH CHECK (is_admin_caller());

-- ── 4. Lock down POSTS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Wallet can create own posts" ON posts
  FOR INSERT WITH CHECK (
    lower(address) = current_admin_wallet()
    AND current_admin_wallet() <> ''
  );

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Owner or admin can delete posts" ON posts
  FOR DELETE USING (
    lower(address) = current_admin_wallet()
    OR is_admin_caller()
  );

-- Only admin may approve / reject ThinkTank posts (status updates)
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Admin can moderate posts" ON posts
  FOR UPDATE
  USING (is_admin_caller())
  WITH CHECK (is_admin_caller());

-- ── 5. Lock down LIKES ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can toggle likes" ON likes;
CREATE POLICY "Wallet can like as self" ON likes
  FOR INSERT WITH CHECK (
    lower(address) = current_admin_wallet()
    AND current_admin_wallet() <> ''
  );

DROP POLICY IF EXISTS "Users can remove likes" ON likes;
CREATE POLICY "Wallet can unlike own" ON likes
  FOR DELETE USING (lower(address) = current_admin_wallet());

-- ── 6. Lock down COMMENTS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can post comments" ON comments;
CREATE POLICY "Wallet can comment as self" ON comments
  FOR INSERT WITH CHECK (
    lower(address) = current_admin_wallet()
    AND current_admin_wallet() <> ''
  );

CREATE POLICY "Owner or admin can delete comments" ON comments
  FOR DELETE USING (
    lower(address) = current_admin_wallet()
    OR is_admin_caller()
  );

-- ── 7. Lock down FOLLOWS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Wallet can follow as self" ON follows
  FOR INSERT WITH CHECK (
    lower(follower_address) = current_admin_wallet()
    AND current_admin_wallet() <> ''
  );

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Wallet can unfollow own" ON follows
  FOR DELETE USING (lower(follower_address) = current_admin_wallet());

-- ── DONE ───────────────────────────────────────────────────────────────────
-- Apply via the Supabase SQL editor or `supabase db push`.
-- After applying, deploy the SIWE→JWT Edge Function (see
-- supabase/functions/siwe-verify/README.md) and switch the frontend Supabase
-- client to use the minted JWT as its session token before performing any
-- write operations from the admin panel.
