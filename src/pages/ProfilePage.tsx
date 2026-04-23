import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase, Profile, Post } from "@/lib/supabase";
import { 
  User, Loader2, BadgeCheck, Shield, Crown, 
  Heart, MessageCircle, UserPlus, UserCheck, 
  ArrowLeft, AlertCircle, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";

const BADGE_CONFIG = {
  blue: { icon: BadgeCheck, color: "text-blue-400", label: "Verified" },
  green: { icon: Shield, color: "text-emerald-400", label: "Leader" },
  yellow: { icon: Crown, color: "text-amber-400", label: "Companies & Elite" },
  team: { icon: BadgeCheck, color: "text-primary", label: "Official Team", isLogo: true },
};

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:username");
  const [, setLocation] = useLocation();
  const { address: currentUserAddress } = useWallet();
  const username = params?.username;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError("Profile not found.");
        } else {
          throw profileError;
        }
      } else if (data) {
        setProfile(data);
        // Fetch posts for this profile
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*, profiles:address(*)')
          .eq('address', data.address.toLowerCase())
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        if (postsData) {
          if (currentUserAddress) {
            const { data: likedPosts } = await supabase
              .from('likes')
              .select('post_id')
              .eq('address', currentUserAddress.toLowerCase());
            
            const likedSet = new Set(likedPosts?.map(l => l.post_id));
            const enrichedPosts = postsData.map(p => ({
              ...p,
              user_has_liked: likedSet.has(p.id)
            }));
            setPosts(enrichedPosts);
          } else {
            setPosts(postsData);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [username, currentUserAddress]);

  const fetchFollowing = useCallback(async () => {
    if (!currentUserAddress) return;
    const { data } = await supabase
      .from('follows')
      .select('following_address')
      .eq('follower_address', currentUserAddress.toLowerCase());
    if (data) setFollowingList(data.map(f => f.following_address));
  }, [currentUserAddress]);

  useEffect(() => {
    fetchProfile();
    fetchFollowing();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProfile, fetchFollowing]);

  const handleFollow = async (targetAddress: string) => {
    if (!currentUserAddress || currentUserAddress.toLowerCase() === targetAddress.toLowerCase()) return;
    const isFollowing = followingList.includes(targetAddress.toLowerCase());
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_address', currentUserAddress.toLowerCase()).eq('following_address', targetAddress.toLowerCase());
        setFollowingList(followingList.filter(a => a !== targetAddress.toLowerCase()));
      } else {
        await supabase.from('follows').insert({ follower_address: currentUserAddress.toLowerCase(), following_address: targetAddress.toLowerCase() });
        setFollowingList([...followingList, targetAddress.toLowerCase()]);
      }
      // Refresh profile to update follower count
      const { data } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('address', targetAddress.toLowerCase())
        .single();
      if (data && profile) {
        setProfile({ ...profile, ...data });
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleLike = async (postId: string, hasLiked: boolean) => {
    if (!currentUserAddress) return;
    try {
      if (hasLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('address', currentUserAddress.toLowerCase());
        setPosts(posts.map(p => p.id === postId ? { ...p, user_has_liked: false, likes_count: Math.max(0, p.likes_count - 1) } : p));
      } else {
        await supabase.from('likes').insert({ post_id: postId, address: currentUserAddress.toLowerCase() });
        setPosts(posts.map(p => p.id === postId ? { ...p, user_has_liked: true, likes_count: p.likes_count + 1 } : p));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <h2 className="text-2xl font-black text-foreground mb-2">{error || "Profile not found"}</h2>
        <button 
          onClick={() => setLocation("/community")}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to Community
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => setLocation("/community")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Community
        </button>

        {/* Profile Header */}
        <div className="glass-card rounded-3xl border border-primary/20 p-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/30 overflow-hidden bg-black/40 shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : <User size={64} className="m-auto mt-8 text-primary/20" />}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl font-black text-foreground">{profile.username}</h1>
                {(profile.branding_logo || (profile.badge && BADGE_CONFIG[profile.badge])) && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    {profile.branding_logo ? (
                      <img src={profile.branding_logo} alt="Company Logo" className="w-5 h-5 rounded-full object-cover" />
                    ) : profile.badge && BADGE_CONFIG[profile.badge] ? (
                      <>
                        {BADGE_CONFIG[profile.badge].isLogo ? (
                          <img src="/son-of-orakzai-logo.jpg" className="w-4 h-4 rounded-full" />
                        ) : (
                          <BadgeCheck size={14} className={BADGE_CONFIG[profile.badge].color} />
                        )}
                      </>
                    ) : null}
                    <span className={`text-xs font-bold uppercase tracking-wider ${profile.badge && BADGE_CONFIG[profile.badge] ? BADGE_CONFIG[profile.badge].color : 'text-primary'}`}>
                      {profile.branding_logo ? 'Branded' : (profile.badge && BADGE_CONFIG[profile.badge] ? BADGE_CONFIG[profile.badge].label : '')}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                {profile.bio || 'Proud member of the Orakzai Bond community.'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mb-8">
                <div className="text-center md:text-left">
                  <span className="block text-2xl font-black text-foreground">{profile.followers_count || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Followers</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-2xl font-black text-foreground">{profile.following_count || 0}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Following</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-xs font-mono text-muted-foreground/60 mt-2">{profile.address}</span>
                </div>
              </div>

              {currentUserAddress && currentUserAddress.toLowerCase() !== profile.address.toLowerCase() && (
                <button 
                  onClick={() => handleFollow(profile.address)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    followingList.includes(profile.address.toLowerCase()) 
                    ? 'bg-muted text-foreground border border-white/10' 
                    : 'bg-primary text-black hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                  }`}
                >
                  {followingList.includes(profile.address.toLowerCase()) ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  {followingList.includes(profile.address.toLowerCase()) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <Globe className="text-primary" size={24} />
            Recent Activity
          </h2>
          
          {posts.length === 0 ? (
            <div className="glass-card rounded-3xl border border-white/5 p-12 text-center">
              <p className="text-muted-foreground">No posts yet from this investor.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-3xl border border-white/5 p-6 hover:border-primary/20 transition-all group"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary/20 overflow-hidden flex-shrink-0 bg-black/40">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                      ) : <User size={24} className="m-auto mt-3 text-primary/10" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">{profile.username}</span>
                          {profile.branding_logo ? (
                            <img src={profile.branding_logo} alt="Company Logo" className="w-4 h-4 rounded-full object-cover" />
                          ) : profile.badge && BADGE_CONFIG[profile.badge] ? (
                            <BadgeCheck size={14} className={BADGE_CONFIG[profile.badge].color} />
                          ) : null}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground/90 leading-relaxed mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => handleLike(post.id, !!post.user_has_liked)}
                          className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.user_has_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                        >
                          <Heart size={16} fill={post.user_has_liked ? "currentColor" : "none"} />
                          {post.likes_count}
                        </button>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <MessageCircle size={16} />
                          {post.comments_count}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
