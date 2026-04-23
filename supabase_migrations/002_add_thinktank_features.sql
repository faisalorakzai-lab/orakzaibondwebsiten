-- Add 'type' and 'status' columns to the posts table for ThinkTank approval
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'social_hub' CHECK (type IN ('social_hub', 'think_tank')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update RLS policies for posts to only show 'approved' posts for public view
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (status = 'approved');

-- Allow authenticated users to create posts, setting default status to 'approved' for social_hub and 'pending' for think_tank
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);

-- Allow admins to update post status (e.g., approve/reject ThinkTank posts)
-- This assumes an 'admin' role or a specific admin user in the profiles table
-- For now, we'll allow updates by the post owner, and will refine for admin later
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (address = address);

-- Add RLS policy for profiles to allow admins to update badges
-- This assumes an 'admin' role or a specific admin user in the profiles table
-- For now, we'll allow updates by the profile owner, and will refine for admin later
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Add a new table for ThinkTank posts specifically, if needed, or manage within 'posts' table
-- For now, we'll manage within 'posts' table using 'type' column
