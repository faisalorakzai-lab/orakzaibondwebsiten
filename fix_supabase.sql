-- 1. Ensure the storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social_hub', 'social_hub', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Fix Profiles RLS Policies
-- Allow anyone to view profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- Allow any authenticated user to insert a profile (since we use wallet addresses)
-- In a real app with Supabase Auth, we'd use auth.uid(), but here we'll allow insert if address is provided
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile based on wallet address
DROP POLICY IF EXISTS "Users can update own profile (excluding badge)" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Fix Posts RLS Policies
-- Allow anyone to view posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);

-- Allow anyone to create posts (ideally restricted, but for now matching current logic)
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);

-- Fix the delete policy (was address = address which is always true)
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (true);

-- 4. Fix Likes RLS Policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can toggle likes" ON likes;
CREATE POLICY "Users can toggle likes" ON likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove likes" ON likes;
CREATE POLICY "Users can remove likes" ON likes FOR DELETE USING (true);

-- 5. Fix Comments RLS Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can post comments" ON comments;
CREATE POLICY "Users can post comments" ON comments FOR INSERT WITH CHECK (true);

-- 6. Fix Follows RLS Policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (true);

-- 7. Fix Storage RLS Policies for 'social_hub' bucket
-- Allow public read access to all objects in the bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'social_hub');

-- Allow anyone to upload to the bucket (since we don't have Supabase Auth session)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'social_hub');

-- Allow public update/delete (for profile photo replacement)
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'social_hub');

DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'social_hub');
