import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Edit2, Camera, Send, Image as ImageIcon, 
  BadgeCheck, Shield, Crown, MessageSquare, 
  Loader2, X, Globe, Lock, Heart, UserPlus, UserCheck, MessageCircle,
  AlertCircle, Upload
} from "lucide-react";
import { supabase, Profile, Post, Comment } from "@/lib/supabase";
import { useWallet } from "@/hooks/useWallet";

const BADGE_CONFIG = {
  blue: { icon: BadgeCheck, color: "text-blue-400", label: "Verified" },
  green: { icon: Shield, color: "text-emerald-400", label: "Leader" },
  yellow: { icon: Crown, color: "text-amber-400", label: "VIP" },
  team: { icon: BadgeCheck, color: "text-primary", label: "Official Team", isLogo: true },
};

export default function SocialHub() {
  const { address } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Edit Profile Form State
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async (walletAddr: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('address', walletAddr.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile = {
          address: walletAddr.toLowerCase(),
          username: "Orakzai Investor",
          bio: "",
          avatar_url: null,
        };
        const { data: createdData, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (!createError) {
          setProfile(createdData);
          setEditUsername(createdData.username);
          setEditBio(createdData.bio || "");
        }
      } else if (data) {
        setProfile(data);
        setEditUsername(data.username);
        setEditBio(data.bio || "");
        setEditAvatar(data.avatar_url || "");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  }, []);

  const fetchFollowing = useCallback(async (walletAddr: string) => {
    const { data } = await supabase
      .from('follows')
      .select('following_address')
      .eq('follower_address', walletAddr.toLowerCase());
    if (data) setFollowingList(data.map(f => f.following_address));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      if (data) {
        if (address) {
          const { data: likedPosts } = await supabase
            .from('likes')
            .select('post_id')
            .eq('address', address.toLowerCase());
          
          const likedSet = new Set(likedPosts?.map(l => l.post_id));
          const enrichedPosts = data.map(p => ({
            ...p,
            user_has_liked: likedSet.has(p.id)
          }));
          setPosts(enrichedPosts);
        } else {
          setPosts(data);
        }
      }
    } catch (err: any) {
      console.error("Posts fetch error:", err);
      setError("Failed to load feed. Check database connection.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPosts();
    if (address) {
      fetchProfile(address);
      fetchFollowing(address);
    } else {
      setProfile(null);
      setFollowingList([]);
    }
  }, [address, fetchPosts, fetchProfile, fetchFollowing]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !address) return;

    setIsSavingProfile(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${address.toLowerCase()}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('social_hub')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('social_hub')
        .getPublicUrl(filePath);

      setEditAvatar(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdateProfile() {
    if (!address || !profile) return;
    setIsSavingProfile(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          username: editUsername,
          bio: editBio,
          avatar_url: editAvatar,
        })
        .eq('address', address.toLowerCase())
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setProfile(data);
        setShowEditModal(false);
      }
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to save profile. Check RLS policies.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleCreatePost() {
    if (!address || !newPost.trim()) return;
    setIsSubmittingPost(true);
    setError(null);
    try {
      const { data, error: postError } = await supabase
        .from('posts')
        .insert({
          address: address.toLowerCase(),
          content: newPost,
        })
        .select('*, profiles(*)')
        .single();

      if (postError) throw postError;

      if (data) {
        setPosts([{...data, user_has_liked: false}, ...posts]);
        setNewPost("");
      }
    } catch (err: any) {
      console.error("Create post error:", err);
      setError(err.message || "Failed to share post. Check RLS policies.");
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleLike(postId: string, hasLiked: boolean) {
    if (!address) return;
    try {
      if (hasLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('address', address.toLowerCase());
        setPosts(posts.map(p => p.id === postId ? { ...p, user_has_liked: false, likes_count: Math.max(0, p.likes_count - 1) } : p));
      } else {
        await supabase.from('likes').insert({ post_id: postId, address: address.toLowerCase() });
        setPosts(posts.map(p => p.id === postId ? { ...p, user_has_liked: true, likes_count: p.likes_count + 1 } : p));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  }

  async function fetchComments(postId: string) {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) setComments(prev => ({ ...prev, [postId]: data }));
  }

  async function handleAddComment(postId: string) {
    if (!address || !newComment.trim()) return;
    try {
      const { data } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          address: address.toLowerCase(),
          content: newComment
        })
        .select('*, profiles(*)')
        .single();
      
      if (data) {
        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
        setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
        setNewComment("");
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  }

  async function handleFollow(targetAddress: string) {
    if (!address || address.toLowerCase() === targetAddress.toLowerCase()) return;
    const isFollowing = followingList.includes(targetAddress.toLowerCase());
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_address', address.toLowerCase()).eq('following_address', targetAddress.toLowerCase());
        setFollowingList(followingList.filter(a => a !== targetAddress.toLowerCase()));
      } else {
        await supabase.from('follows').insert({ follower_address: address.toLowerCase(), following_address: targetAddress.toLowerCase() });
        setFollowingList([...followingList, targetAddress.toLowerCase()]);
      }
      fetchProfile(address);
    } catch (err) {
      console.error("Follow error:", err);
    }
  }

  return (
    <div className="mt-12 space-y-8 max-w-4xl mx-auto">
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3"
          >
            <AlertCircle size={16} />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Section */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-black/40">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : <User size={48} className="m-auto mt-6 text-primary/20" />}
            </div>
            {address && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-black shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <h2 className="text-2xl font-black text-foreground">{profile?.username || 'Orakzai Investor'}</h2>
              {profile?.badge && BADGE_CONFIG[profile.badge] && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {BADGE_CONFIG[profile.badge].isLogo ? (
                    <img src="/son-of-orakzai-logo.jpg" className="w-3 h-3 rounded-full" />
                  ) : (
                    <BadgeCheck size={12} className={BADGE_CONFIG[profile.badge].color} />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${BADGE_CONFIG[profile.badge].color}`}>
                    {BADGE_CONFIG[profile.badge].label}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{profile?.bio || 'Proud member of the Orakzai Bond community.'}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="text-center md:text-left">
                <span className="block text-lg font-black text-foreground">{profile?.followers_count || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-lg font-black text-foreground">{profile?.following_count || 0}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="space-y-6">
        {address && (
          <div className="glass-card rounded-3xl border border-primary/20 p-6">
            <textarea 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind, Investor?"
              className="w-full h-24 bg-transparent border-none focus:ring-0 text-foreground resize-none text-sm"
            />
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex gap-4">
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <ImageIcon size={18} />
                </button>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Globe size={18} />
                </button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={isSubmittingPost || !newPost.trim()}
                className="px-6 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingPost ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Share
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
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
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                    ) : <User size={24} className="m-auto mt-3 text-primary/10" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-foreground">{post.profiles?.username || 'Investor'}</span>
                        {post.profiles?.badge && BADGE_CONFIG[post.profiles.badge] && (
                          <BadgeCheck size={14} className={BADGE_CONFIG[post.profiles.badge].color} />
                        )}
                        <span className="text-[10px] text-muted-foreground/40 font-mono hidden sm:inline">{post.address.slice(0,6)}...{post.address.slice(-4)}</span>
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
                      <button 
                        onClick={() => {
                          setActivePostId(activePostId === post.id ? null : post.id);
                          if (activePostId !== post.id) fetchComments(post.id);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle size={16} />
                        {post.comments_count}
                      </button>
                      {address && address.toLowerCase() !== post.address.toLowerCase() && (
                        <button 
                          onClick={() => handleFollow(post.address)}
                          className={`flex items-center gap-2 text-xs font-bold transition-colors ${followingList.includes(post.address.toLowerCase()) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          {followingList.includes(post.address.toLowerCase()) ? <UserCheck size={16} /> : <UserPlus size={16} />}
                          {followingList.includes(post.address.toLowerCase()) ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {activePostId === post.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 space-y-4">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full border border-white/5 overflow-hidden flex-shrink-0 bg-black/40">
                                  {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                  ) : <User size={16} className="m-auto mt-2 text-primary/10" />}
                                </div>
                                <div className="flex-1 bg-white/5 rounded-2xl p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-foreground">{comment.profiles?.username || 'Investor'}</span>
                                    <span className="text-[9px] text-muted-foreground/40 font-mono">{comment.address.slice(0,6)}...</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground/80">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {address && (
                            <div className="flex gap-2 pt-4">
                              <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-foreground focus:border-primary/50 outline-none"
                              />
                              <button 
                                onClick={() => handleAddComment(post.id)}
                                className="p-2 rounded-xl bg-primary text-black"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl border border-primary/30 p-8 bg-[#0a0c20]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-foreground">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-black/40">
                      {editAvatar ? (
                        <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : <User size={48} className="m-auto mt-6 text-primary/20" />}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
                    >
                      <Camera size={24} className="text-white" />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold hover:bg-primary/20 transition-colors"
                  >
                    {isSavingProfile ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                    Tap to Upload Photo
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isSavingProfile}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
