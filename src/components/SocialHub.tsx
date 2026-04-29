import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  User, Edit2, Camera, Send, Image as ImageIcon, 
  BadgeCheck, Shield, Crown,
  Loader2, X, Globe, Heart, UserPlus, UserCheck, MessageCircle,
  AlertCircle, Repeat2, Share2, TrendingUp, Trophy, Flame, CornerDownRight,
  Sparkles, Pin
} from "lucide-react";
import SovereignGrid from "./SovereignGrid";
import ImageLightbox from "./ImageLightbox";
import { supabase, Profile, Post, Comment } from "@/lib/supabase";
import { useWallet } from "@/hooks/useWallet";

const BADGE_CONFIG = {
  blue: { icon: BadgeCheck, color: "text-blue-400", label: "Verified" },
  green: { icon: Shield, color: "text-emerald-400", label: "Leader" },
  yellow: { icon: Crown, color: "text-amber-400", label: "Companies & Elite" },
  team: { icon: BadgeCheck, color: "text-primary", label: "Official Team", isLogo: true },
};

/* ── Chairman / Founder display boost ─────────────────────────────────
 * Posts authored by the Chairman wallet are visually endorsed by the
 * community: a gold "ENDORSED BY COMMUNITY" badge sits in the identity
 * row, and the displayed like count is floored at FOUNDER_LIKE_FLOOR
 * (purely a display layer — never writes to the DB).
 * ────────────────────────────────────────────────────────────────────── */
const FOUNDER_ADDRESS = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";
const FOUNDER_LIKE_FLOOR = 247;
function isFounder(address?: string): boolean {
  return !!address && address.toLowerCase() === FOUNDER_ADDRESS;
}
function endorsedLikeCount(post: { address: string; likes_count?: number | null }): number {
  const raw = post.likes_count || 0;
  if (isFounder(post.address)) return Math.max(raw, FOUNDER_LIKE_FLOOR + raw);
  return raw;
}
function endorsedHasLiked(post: { address: string; user_has_liked?: boolean }): boolean {
  return isFounder(post.address) ? true : !!post.user_has_liked;
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function toHandle(name?: string | null, address?: string): string {
  const base = (name || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (base) return `@${base}`;
  if (address) return `@${address.slice(2, 8).toLowerCase()}`;
  return "@investor";
}

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

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
  const [repostedIds, setRepostedIds] = useState<Set<string>>(new Set());
  const [repostCounts, setRepostCounts] = useState<Record<string, number>>({});
  const [sharedToast, setSharedToast] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem('okbond_liked_comments') || '[]')); } catch { return new Set(); }
  });
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('okbond_comment_like_counts') || '{}'); } catch { return {}; }
  });
  const [replyTarget, setReplyTarget] = useState<Record<string, string | null>>({});
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
        .select('*, profiles:address(*)')
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

  function handlePickPostImage() {
    postImageInputRef.current?.click();
  }

  function handlePostImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setError(null);
    setPostImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPostImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearPostImage() {
    setPostImageFile(null);
    setPostImagePreview(null);
  }

  async function uploadPostImage(file: File): Promise<string | null> {
    if (!address) return null;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `posts/${address.toLowerCase()}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("social_hub")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from("social_hub").getPublicUrl(path);
    return publicUrl;
  }

  async function handleCreatePost() {
    if (!address || (!newPost.trim() && !postImageFile)) return;
    setIsSubmittingPost(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (postImageFile) {
        setIsUploadingPostImage(true);
        imageUrl = await uploadPostImage(postImageFile);
        setIsUploadingPostImage(false);
      }

      const insertPayload: Record<string, any> = {
        address: address.toLowerCase(),
        content: newPost,
      };
      if (imageUrl) insertPayload.image_url = imageUrl;

      const { data, error: postError } = await supabase
        .from('posts')
        .insert(insertPayload)
        .select('*, profiles:address(*)')
        .single();

      if (postError) throw postError;

      if (data) {
        setPosts([{...data, user_has_liked: false}, ...posts]);
        setNewPost("");
        clearPostImage();
      }
    } catch (err: any) {
      console.error("Create post error:", err);
      setError(err.message || "Failed to share post. Check RLS policies.");
      setIsUploadingPostImage(false);
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
      .select('*, profiles:address(*)')
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
        .select('*, profiles:address(*)')
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

  function handleToggleCommentLike(commentId: string) {
    setLikedComments(prev => {
      const next = new Set(prev);
      const wasLiked = next.has(commentId);
      if (wasLiked) next.delete(commentId); else next.add(commentId);
      try { localStorage.setItem('okbond_liked_comments', JSON.stringify(Array.from(next))); } catch {}
      setCommentLikeCounts(c => {
        const updated = { ...c, [commentId]: Math.max(0, (c[commentId] || 0) + (wasLiked ? -1 : 1)) };
        try { localStorage.setItem('okbond_comment_like_counts', JSON.stringify(updated)); } catch {}
        return updated;
      });
      return next;
    });
  }

  function handleStartReply(postId: string, username: string) {
    setReplyTarget(prev => ({ ...prev, [postId]: username }));
    setNewComment(`@${username} `);
    setActivePostId(postId);
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`#post-${postId} input[type="text"]`);
      input?.focus();
    }, 50);
  }

  function handleRepost(postId: string) {
    setRepostedIds(prev => {
      const next = new Set(prev);
      const isRe = next.has(postId);
      if (isRe) next.delete(postId); else next.add(postId);
      setRepostCounts(c => ({ ...c, [postId]: (c[postId] || 0) + (isRe ? -1 : 1) }));
      return next;
    });
  }

  async function handleShare(post: Post) {
    const url = `${window.location.origin}/community#post-${post.id}`;
    const text = `${post.profiles?.username || 'Investor'} on Orakzai Bond: ${post.content.slice(0, 140)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Orakzai Bond', text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setSharedToast('Link copied to clipboard');
        setTimeout(() => setSharedToast(null), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setSharedToast('Link copied to clipboard');
        setTimeout(() => setSharedToast(null), 2000);
      } catch {
        /* ignore */
      }
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

  // Sidebar widget data — derived from posts, no extra API call
  const trendingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count))
      .slice(0, 5);
  }, [posts]);

  // ─── Chairman's Pinned Dispatch ─────────────────────────────────────
  // The Founder's single newest post is always pinned to the top of the
  // Sovereign Grid with a gold "PINNED DISPATCH" ribbon. Identified by
  // post.id so it is removed from the chronological list to avoid a
  // visible duplicate.
  const pinnedFounderPost = useMemo(() => {
    const founderPosts = posts.filter((p) => isFounder(p.address));
    if (!founderPosts.length) return null;
    return founderPosts.reduce((latest, p) =>
      new Date(p.created_at).getTime() > new Date(latest.created_at).getTime() ? p : latest
    );
  }, [posts]);

  const displayPosts = useMemo(() => {
    if (!pinnedFounderPost) return posts;
    return [pinnedFounderPost, ...posts.filter((p) => p.id !== pinnedFounderPost.id)];
  }, [posts, pinnedFounderPost]);

  const topHolders = useMemo(() => {
    const seen = new Set<string>();
    const list: Profile[] = [];
    for (const p of posts) {
      if (!p.profiles) continue;
      const key = p.profiles.address?.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(p.profiles);
    }
    return list
      .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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

      {/* Share toast */}
      <AnimatePresence>
        {sharedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.5)]"
          >
            {sharedToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* USER PROFILE CARD - SECONDARY FOCUS */}
      <div className="glass-card-deep-space rounded-3xl p-8 mb-8 relative overflow-hidden">
        {/* OSG 3D Sphere Integration */}
        <div className="absolute top-4 right-4 opacity-80 hover:opacity-100 transition-opacity">
          <SovereignGrid />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden bg-black/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : <User size={40} className="m-auto mt-5 text-primary/20" />}
            </div>
            {address && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-black shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h2 className="text-xl font-black text-foreground tracking-tight neon-heading">{profile?.username || 'Orakzai Investor'}</h2>
              {profile?.branding_logo && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 branded-tag-pulse">
                  <img src={profile.branding_logo} alt="Company Logo" className="w-3 h-3 rounded-full object-cover" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-primary">Branded</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3 max-w-md line-clamp-2">{profile?.bio || 'Proud member of the Orakzai Bond community.'}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="text-center md:text-left">
                <span className="block text-base font-black text-foreground">{profile?.followers_count || 0}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-base font-black text-foreground">{profile?.following_count || 0}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT: Feed (left) + Trending widget (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">

        {/* LEFT / CENTER — Feed */}
        <div className="space-y-5 min-w-0">
          {address && (
            <div
              className="rounded-xl p-5 bg-black/60 border border-primary/40 shadow-[0_0_20px_rgba(234,179,8,0.08)]"
            >
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind, Investor?"
                className="w-full h-20 bg-transparent border-none focus:ring-0 text-foreground resize-none text-sm placeholder:text-muted-foreground/60"
              />

              {/* Hidden file input for post image */}
              <input
                ref={postImageInputRef}
                type="file"
                accept="image/*"
                onChange={handlePostImageChange}
                className="hidden"
              />

              {/* Image preview */}
              {postImagePreview && (
                <div className="relative mt-2 mb-1 rounded-xl overflow-hidden border border-primary/30 bg-black/40 max-w-md">
                  <img src={postImagePreview} alt="Selected media" className="w-full max-h-72 object-contain" />
                  <button
                    type="button"
                    onClick={clearPostImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 border border-primary/40 text-primary hover:bg-black hover:shadow-[0_0_12px_rgba(234,179,8,0.5)] transition-all"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                  {isUploadingPostImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" size={26} />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-primary/15">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePickPostImage}
                    disabled={isSubmittingPost}
                    className={`transition-colors ${postImagePreview ? 'text-primary' : 'text-muted-foreground hover:text-primary'} disabled:opacity-50`}
                    aria-label="Add image"
                    title="Add image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button type="button" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Audience" title="Public">
                    <Globe size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={isSubmittingPost || (!newPost.trim() && !postImageFile)}
                  className="px-5 py-2 rounded-xl bg-transparent border-2 border-primary text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300 active:scale-95"
                >
                  {isSubmittingPost ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Post
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl p-8 bg-black/60 border border-primary/40 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Be the first to share something with the community.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayPosts.map((post) => {
                const username = post.profiles?.username || 'Investor';
                const handle = toHandle(post.profiles?.username, post.address);
                const isReposted = repostedIds.has(post.id);
                const repostCount = repostCounts[post.id] || 0;
                const isPinned = pinnedFounderPost?.id === post.id;
                return (
                  <motion.article 
                    key={post.id}
                    id={`post-${post.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-xl p-5 bg-black/60 border transition-all duration-300 ${
                      isPinned
                        ? "border-primary/70 shadow-[0_0_28px_rgba(234,179,8,0.22)] hover:shadow-[0_0_36px_rgba(234,179,8,0.32)]"
                        : "border-primary/40 hover:border-primary/70 hover:shadow-[0_0_24px_rgba(234,179,8,0.15)]"
                    }`}
                  >
                    {/* ─── Chairman's Pinned Dispatch ribbon ─── */}
                    {isPinned && (
                      <div
                        className="flex items-center justify-between -mx-5 -mt-5 mb-4 px-4 py-2 rounded-t-xl"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.08) 50%, rgba(234,179,8,0.18) 100%)",
                          borderBottom: "1px solid rgba(234,179,8,0.45)",
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "#fde68a" }}>
                          <Pin size={11} className="-rotate-45" />
                          Pinned Dispatch
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "rgba(253,230,138,0.7)" }}>
                          From the Founder
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {/* Avatar */}
                      <Link href={`/profile/${post.profiles?.username || 'investor'}`}>
                        <div className="w-11 h-11 rounded-full border border-primary/40 overflow-hidden flex-shrink-0 bg-black/40 cursor-pointer hover:border-primary transition-all">
                          {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt={username} className="w-full h-full object-cover" />
                          ) : <User size={22} className="m-auto mt-2.5 text-primary/30" />}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Identity row: name • verified gold tick • gray @handle • • • time */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <Link href={`/profile/${post.profiles?.username || 'investor'}`}>
                            <span className="font-bold text-[15px] text-foreground hover:underline transition-all cursor-pointer truncate">{username}</span>
                          </Link>

                          {/* Brand logo (verified ticks are admin-managed; not shown by default) */}
                          {post.profiles?.branding_logo && (
                            <img src={post.profiles.branding_logo} alt="Brand" className="w-4 h-4 rounded-full object-cover" />
                          )}

                          {/* Gray handle */}
                          <span className="text-[13px] text-muted-foreground/70 truncate">{handle}</span>

                          {/* Separator + time */}
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-[12px] text-muted-foreground/70" title={new Date(post.created_at).toLocaleString()}>
                            {timeAgo(post.created_at)}
                          </span>

                          {/* Chairman endorsement badge */}
                          {isFounder(post.address) && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
                              style={{
                                color: "#fde68a",
                                background: "rgba(234,179,8,0.12)",
                                border: "1px solid rgba(234,179,8,0.45)",
                              }}
                              title="Endorsed by the Orakzai Community"
                            >
                              <Sparkles size={9} />
                              Endorsed by Community
                            </span>
                          )}
                        </div>

                        {/* Wallet snippet */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] text-muted-foreground/50 font-mono">
                            {post.address.slice(0,6)}…{post.address.slice(-4)}
                          </span>
                          {address && address.toLowerCase() !== post.address.toLowerCase() && (
                            <button 
                              onClick={() => handleFollow(post.address)}
                              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${followingList.includes(post.address.toLowerCase()) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                            >
                              {followingList.includes(post.address.toLowerCase()) ? <UserCheck size={11} /> : <UserPlus size={11} />}
                              {followingList.includes(post.address.toLowerCase()) ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <p className="text-[15px] text-foreground/90 leading-relaxed mb-3 whitespace-pre-wrap break-words">{post.content}</p>

                        {/* Optional image */}
                        {post.image_url && (
                          <button
                            type="button"
                            onClick={() => setLightboxImage(post.image_url!)}
                            className="block w-full rounded-xl overflow-hidden border border-primary/20 mb-3 group/img relative cursor-zoom-in hover:border-primary/50 hover:shadow-[0_0_18px_rgba(234,179,8,0.18)] transition-all"
                            aria-label="View image full screen"
                          >
                            <img src={post.image_url} alt="Post media" className="w-full max-h-96 object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                          </button>
                        )}

                        {/* Interactive bar: Like • Comment • Repost • Share */}
                        <div className="flex items-center justify-between pt-3 border-t border-primary/15 max-w-md">
                          <button 
                            type="button"
                            onClick={() => {
                              setActivePostId(activePostId === post.id ? null : post.id);
                              if (activePostId !== post.id) fetchComments(post.id);
                            }}
                            className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Comments"
                          >
                            <span className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                              <MessageCircle size={16} />
                            </span>
                            <span>{formatCount(post.comments_count || 0)}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleRepost(post.id)}
                            className={`group flex items-center gap-1.5 text-xs font-medium transition-colors ${isReposted ? 'text-emerald-400' : 'text-muted-foreground hover:text-emerald-400'}`}
                            aria-label="Repost"
                            aria-pressed={isReposted}
                          >
                            <span className="p-1.5 rounded-full group-hover:bg-emerald-400/10 transition-colors">
                              <Repeat2 size={16} />
                            </span>
                            <span>{formatCount(repostCount)}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleLike(post.id, !!post.user_has_liked)}
                            className={`group flex items-center gap-1.5 text-xs font-medium transition-colors ${endorsedHasLiked(post) ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                            aria-label="Like"
                            aria-pressed={endorsedHasLiked(post)}
                          >
                            <span className="p-1.5 rounded-full group-hover:bg-rose-500/10 transition-colors">
                              <Heart size={16} fill={endorsedHasLiked(post) ? "currentColor" : "none"} />
                            </span>
                            <span>{formatCount(endorsedLikeCount(post))}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleShare(post)}
                            className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Share"
                          >
                            <span className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                              <Share2 size={16} />
                            </span>
                          </button>
                        </div>

                        {/* Discuss with Marcus — gold-bordered concierge handoff */}
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              window.dispatchEvent(
                                new CustomEvent("marcus:discuss", {
                                  detail: {
                                    text: post.content,
                                    author: username,
                                    handle,
                                  },
                                })
                              );
                            } catch { /* ignore */ }
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5"
                          style={{
                            color: "#fde68a",
                            background: "linear-gradient(180deg, rgba(234,179,8,0.10), rgba(234,179,8,0.04))",
                            border: "1px solid rgba(234,179,8,0.55)",
                            boxShadow: "0 0 0 1px rgba(234,179,8,0.10), 0 0 14px rgba(234,179,8,0.18)",
                          }}
                          aria-label="Discuss this dispatch with Marcus AI"
                        >
                          <Sparkles size={12} />
                          <span>Discuss with Marcus</span>
                        </button>

                        {/* Comments panel */}
                        <AnimatePresence>
                          {activePostId === post.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-5 space-y-4">
                                {comments[post.id]?.map((comment) => {
                                  const isReply = /^@\w+\s/.test(comment.content || '');
                                  const liked = likedComments.has(comment.id);
                                  const likeCount = commentLikeCounts[comment.id] ?? 0;
                                  const cUser = comment.profiles?.username || 'investor';
                                  return (
                                    <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-10 pl-3 border-l-2 border-primary/20' : ''}`}>
                                      <Link href={`/profile/${cUser}`}>
                                        <div className="w-8 h-8 rounded-full border border-primary/20 overflow-hidden flex-shrink-0 bg-black/40 cursor-pointer hover:border-primary/50 transition-all">
                                          {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                          ) : <User size={16} className="m-auto mt-2 text-primary/30" />}
                                        </div>
                                      </Link>
                                      <div className="flex-1 bg-white/5 border border-primary/10 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                          {isReply && <CornerDownRight size={11} className="text-primary/60" />}
                                          <Link href={`/profile/${cUser}`}>
                                            <span className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer">{comment.profiles?.username || 'Investor'}</span>
                                          </Link>
                                          <span className="text-[11px] text-muted-foreground/70">{toHandle(comment.profiles?.username, comment.address)}</span>
                                          <span className="text-muted-foreground/40 text-[10px]">·</span>
                                          <span className="text-[10px] text-muted-foreground/60">{timeAgo(comment.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-foreground/85 whitespace-pre-wrap break-words">{comment.content}</p>
                                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-primary/5">
                                          <button
                                            onClick={() => handleToggleCommentLike(comment.id)}
                                            className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${liked ? 'text-red-400' : 'text-muted-foreground/70 hover:text-red-400'}`}
                                            aria-label="Like comment"
                                          >
                                            <Heart size={11} className={liked ? 'fill-current' : ''} />
                                            <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                                          </button>
                                          {address && (
                                            <button
                                              onClick={() => handleStartReply(post.id, cUser)}
                                              className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/70 hover:text-primary transition-colors"
                                              aria-label="Reply to comment"
                                            >
                                              <CornerDownRight size={11} />
                                              <span>Reply</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {address && (
                                <div className="pt-4">
                                  {replyTarget[post.id] && (
                                    <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                      <span className="text-[10px] text-primary/90 font-semibold">Replying to @{replyTarget[post.id]}</span>
                                      <button onClick={() => { setReplyTarget(p => ({ ...p, [post.id]: null })); setNewComment(''); }} className="text-primary/70 hover:text-primary">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder={replyTarget[post.id] ? `Reply to @${replyTarget[post.id]}...` : "Write a comment..."}
                                      className="flex-1 bg-black/40 border border-primary/20 rounded-xl px-4 py-2 text-xs text-foreground focus:border-primary/60 outline-none"
                                    />
                                    <button 
                                      onClick={() => { handleAddComment(post.id); setReplyTarget(p => ({ ...p, [post.id]: null })); }}
                                      className="p-2 rounded-xl bg-primary text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-shadow"
                                      aria-label="Send comment"
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Sidebar (Trending + Top Holders) */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Trending */}
          <div className="rounded-xl p-5 bg-black/60 border border-primary/40">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">Trending Now</h3>
            </div>
            {trendingPosts.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/70">No trending posts yet.</p>
            ) : (
              <ul className="space-y-3">
                {trendingPosts.map((p, idx) => {
                  const username = p.profiles?.username || 'Investor';
                  const handle = toHandle(p.profiles?.username, p.address);
                  return (
                    <li key={p.id}>
                      <a 
                        href={`#post-${p.id}`}
                        className="group block rounded-lg p-2 -m-2 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-[11px] font-black text-primary/60 w-4 mt-0.5">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap mb-0.5">
                              <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{username}</span>
                              {p.profiles?.branding_logo && (
                                <img src={p.profiles.branding_logo} alt="Brand" className="w-3 h-3 rounded-full object-cover flex-shrink-0" />
                              )}
                              <span className="text-[10px] text-muted-foreground/60 truncate">{handle}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-snug">{p.content}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60">
                              <span className="flex items-center gap-1"><Heart size={9} /> {formatCount(p.likes_count || 0)}</span>
                              <span className="flex items-center gap-1"><MessageCircle size={9} /> {formatCount(p.comments_count || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Top Holders */}
          <div className="rounded-xl p-5 bg-black/60 border border-primary/40">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">Top Holders</h3>
            </div>
            {topHolders.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/70">Top holders will appear here.</p>
            ) : (
              <ul className="space-y-3">
                {topHolders.map((p, idx) => {
                  const username = p.username || 'Investor';
                  const handle = toHandle(p.username, p.address);
                  const isFollowing = followingList.includes(p.address.toLowerCase());
                  const isSelf = address?.toLowerCase() === p.address.toLowerCase();
                  return (
                    <li key={p.address} className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-primary/60 w-4 flex-shrink-0">{idx + 1}</span>
                      <Link href={`/profile/${username}`}>
                        <div className="w-9 h-9 rounded-full border border-primary/40 overflow-hidden flex-shrink-0 bg-black/40 cursor-pointer hover:border-primary transition-all">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={username} className="w-full h-full object-cover" />
                          ) : <User size={18} className="m-auto mt-1.5 text-primary/30" />}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Link href={`/profile/${username}`}>
                            <span className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate">{username}</span>
                          </Link>
                          {p.branding_logo && (
                            <img src={p.branding_logo} alt="Brand" className="w-3 h-3 rounded-full object-cover flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 truncate block">{handle}</span>
                      </div>
                      {!isSelf && address && (
                        <button
                          onClick={() => handleFollow(p.address)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${isFollowing ? 'border-primary/40 text-primary bg-primary/10' : 'border-primary text-primary hover:bg-primary hover:text-black'}`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer note */}
          <div className="rounded-xl p-4 bg-black/40 border border-primary/20 flex items-start gap-2">
            <Flame size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              Powered by Orakzai Bond community. Be respectful — every post represents the brotherhood.
            </p>
          </div>
        </aside>
      </div>

      {/* Full-screen Image Viewer */}
      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-md rounded-3xl border border-primary/20 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-black/40">
                      {editAvatar ? (
                        <img src={editAvatar} className="w-full h-full object-cover" />
                      ) : <User size={48} className="m-auto mt-6 text-primary/20" />}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    >
                      <Camera className="text-white" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Click to change avatar</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-primary font-bold uppercase tracking-widest">Username</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-primary font-bold uppercase tracking-widest">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/50 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleUpdateProfile}
                  disabled={isSavingProfile}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingProfile && <Loader2 className="animate-spin" size={18} />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
