import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Edit2, Camera, Send, Image as ImageIcon, 
  BadgeCheck, Shield, Crown, MessageSquare, 
  Loader2, X, Globe, Lock
} from "lucide-react";
import { supabase, Profile, Post } from "@/lib/supabase";
import { useWallet } from "@/hooks/useWallet";

const BADGE_CONFIG = {
  blue: { icon: BadgeCheck, color: "text-blue-400", label: "Verified Investor" },
  green: { icon: Shield, color: "text-emerald-400", label: "Trusted Leader" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Profile Form State
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  useEffect(() => {
    fetchPosts();
    if (address) {
      fetchProfile(address);
    } else {
      setProfile(null);
    }
  }, [address]);

  async function fetchProfile(walletAddr: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('address', walletAddr.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // Auto-create lazy profile
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
  }

  async function fetchPosts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setPosts(data);
    } catch (err) {
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    if (!address || !profile) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editUsername,
          bio: editBio,
          avatar_url: editAvatar,
        })
        .eq('address', address.toLowerCase())
        .select()
        .single();

      if (data) {
        setProfile(data);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Update profile error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreatePost() {
    if (!address || !newPost.trim()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          address: address.toLowerCase(),
          content: newPost,
        })
        .select('*, profiles(*)')
        .single();

      if (data) {
        setPosts([data, ...posts]);
        setNewPost("");
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-12 space-y-8 max-w-4xl mx-auto">
      {/* Profile Section */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-black/40">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40">
                  <User size={48} />
                </div>
              )}
            </div>
            {address && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-black hover:scale-110 transition-transform shadow-lg"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h3 className="text-2xl font-black text-foreground">
                {profile?.username || (address ? "Loading..." : "Guest Investor")}
              </h3>
              {profile?.badge && BADGE_CONFIG[profile.badge] && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${BADGE_CONFIG[profile.badge].color}`}>
                  {(() => {
                    const Icon = BADGE_CONFIG[profile.badge].icon;
                    return <Icon size={14} />;
                  })()}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {BADGE_CONFIG[profile.badge].label}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet to participate"}
            </p>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground/80 max-w-xl italic">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Post Creation */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 bg-white/5">
        {!address ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
            <Lock className="text-primary/40" size={32} />
            <div>
              <p className="font-bold text-foreground">Social Hub is Restricted</p>
              <p className="text-xs text-muted-foreground">Connect your wallet to share ideas and posts</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with the Orakzai community..."
              className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-primary transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-primary transition-colors">
                  <Globe size={20} />
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newPost.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Post Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feed Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h4 className="text-sm font-black text-foreground uppercase tracking-widest">ThinkTank Live Feed</h4>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl border border-white/5 p-5 bg-white/3 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/20">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground truncate max-w-[150px]">
                        {post.profiles?.username || "Investor"}
                      </span>
                      {post.profiles?.badge && BADGE_CONFIG[post.profiles.badge] && (
                        <div className={`${BADGE_CONFIG[post.profiles.badge].color}`}>
                          {(() => {
                            const Icon = BADGE_CONFIG[post.profiles.badge].icon;
                            return <Icon size={12} />;
                          })()}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground/40 font-mono">
                        {post.address.slice(0, 6)}...{post.address.slice(-4)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 ml-auto">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
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
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avatar URL</label>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                    />
                  </div>
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
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
