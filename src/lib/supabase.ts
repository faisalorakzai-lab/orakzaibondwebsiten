import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  address: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  badge: 'blue' | 'green' | 'yellow' | 'team' | null;
  followers_count: number;
  following_count: number;
  created_at: string;
};

export type Post = {
  id: string;
  address: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  address: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export type Follow = {
  follower_address: string;
  following_address: string;
  created_at: string;
};

export type Like = {
  post_id: string;
  address: string;
  created_at: string;
};
