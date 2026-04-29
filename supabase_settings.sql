-- ============================================================
-- OKBOND Settings Table Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_timestamp();

-- 3. Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public can READ all settings (needed for calculator, Marcus, etc.)
CREATE POLICY "settings_public_read" ON settings
  FOR SELECT USING (true);

-- Only authenticated writes (anon key allowed for admin UI — UI-gated by wallet)
CREATE POLICY "settings_admin_update" ON settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "settings_admin_insert" ON settings
  FOR INSERT WITH CHECK (true);

-- 4. Seed default values
INSERT INTO settings (key, value) VALUES
  ('marcus_enabled',    'false'),
  ('staking_apy',       '18'),
  ('ico_stage',         '1'),
  ('ico_price',         '0.60'),
  ('referral_enabled',  'true'),
  ('staking_pool_size', '2800000'),
  ('total_supply',      '10000000')
ON CONFLICT (key) DO NOTHING;

-- 5. Marcus AI Profile (required for comments FK — inserts as 'marcus-ai')
INSERT INTO profiles (address, username, bio, badge) VALUES
  ('marcus-ai', 'Marcus | OKBOND AI', 'Official AI Assistant of the Orakzai Bond ecosystem. Powered by Google Gemini.', 'team')
ON CONFLICT (address) DO NOTHING;
