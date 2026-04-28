-- Orakzai Bond Social Hub Schema (Updated with RLS & Storage)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    address TEXT PRIMARY KEY, -- Wallet address in lowercase
    username TEXT DEFAULT 'Orakzai Investor',
    bio TEXT,
    avatar_url TEXT,
    badge TEXT DEFAULT NULL, -- 'blue', 'green', 'yellow', 'team'
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Likes Table
CREATE TABLE IF NOT EXISTS likes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, address)
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Follows Table
CREATE TABLE IF NOT EXISTS follows (
    follower_address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
    following_address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_address, following_address)
);

-- ── ROW LEVEL SECURITY (RLS) ──

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile (excluding badge)" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (address = address);

-- Likes Policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can toggle likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove likes" ON likes FOR DELETE USING (true);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can post comments" ON comments FOR INSERT WITH CHECK (true);

-- Follows Policies
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (true);

-- ── STORAGE BUCKET SETUP ──
-- Note: Run these in the Supabase Dashboard SQL Editor to ensure 'social_hub' bucket exists
-- INSERT INTO storage.buckets (id, name, public) VALUES ('social_hub', 'social_hub', true);

-- Storage Policies
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'social_hub');
-- CREATE POLICY "Users can upload avatar images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'social_hub');

-- ── AUTOMATION TRIGGERS ──

-- Update Likes Count
CREATE OR REPLACE FUNCTION update_post_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_change ON likes;
CREATE TRIGGER on_like_change AFTER INSERT OR DELETE ON likes FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update Comments Count
CREATE OR REPLACE FUNCTION update_post_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_change ON comments;
CREATE TRIGGER on_comment_change AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update Follower/Following Counts
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles SET following_count = following_count + 1 WHERE address = NEW.follower_address;
        UPDATE profiles SET followers_count = followers_count + 1 WHERE address = NEW.following_address;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles SET following_count = following_count - 1 WHERE address = OLD.follower_address;
        UPDATE profiles SET followers_count = followers_count - 1 WHERE address = OLD.following_address;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change AFTER INSERT OR DELETE ON follows FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
