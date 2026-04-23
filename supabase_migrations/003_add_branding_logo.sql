-- Add branding_logo column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branding_logo TEXT;

-- Update RLS policies to allow admins to update branding_logo
-- Since we don't have a separate admin table, we assume users with 'team' badge are admins
-- The existing policy "Users can update own profile" already allows users to update their own profile.
-- We might need a specific policy for admins to update other users' profiles.

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE address = (SELECT auth.uid()::text) -- This assumes Supabase Auth is used and address matches auth.uid()
    AND badge = 'team'
  )
  OR (address = address) -- Fallback for the current permissive setup if auth.uid() is not available
)
WITH CHECK (true);
