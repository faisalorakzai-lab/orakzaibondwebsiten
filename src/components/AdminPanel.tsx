import { useState, useEffect, useCallback } from "react";
import { supabase, Profile, Post } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, Award, UserCheck, Building2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";

const BADGE_OPTIONS = [
  { value: null, label: "None" },
  { value: "blue", label: "Blue (Verified)", icon: Award },
  { value: "green", label: "Green (Leader)", icon: UserCheck },
  { value: "team", label: "Official Team", icon: Building2 },
];

export default function AdminPanel() {
  const { address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingThinkTankPosts, setPendingThinkTankPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStatus = useCallback(async () => {
    if (!address) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("badge")
        .eq("address", address.toLowerCase())
        .single();
      if (error) throw error;
      setIsAdmin(data?.badge === "team");
    } catch (err) {
      console.error("Error fetching admin status:", err);
      setIsAdmin(false);
    }
  }, [address]);

  const fetchPendingThinkTankPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles:address(*)")
        .eq("type", "think_tank")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPendingThinkTankPosts(data || []);
    } catch (err) {
      console.error("Error fetching pending ThinkTank posts:", err);
      setError("Failed to load pending ThinkTank posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username", { ascending: true });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError("Failed to load profiles for badge management.");
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStatus();
    if (address) {
      fetchPendingThinkTankPosts();
      fetchProfiles();
    }
  }, [address, fetchAdminStatus, fetchPendingThinkTankPosts, fetchProfiles]);

  const handlePostApproval = async (postId: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: newStatus })
        .eq("id", postId);
      if (error) throw error;
      fetchPendingThinkTankPosts(); // Refresh the list
    } catch (err) {
      console.error(`Error ${newStatus} post:`, err);
      setError(`Failed to ${newStatus} post.`);
    }
  };

  const handleBadgeUpdate = async (profileAddress: string, newBadge: Profile["badge"]) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ badge: newBadge })
        .eq("address", profileAddress);
      if (error) throw error;
      fetchProfiles(); // Refresh the list
    } catch (err) {
      console.error("Error updating badge:", err);
      setError("Failed to update badge.");
    }
  };

  if (!address) {
    return (
      <div className="mt-12 space-y-8 max-w-4xl mx-auto text-center text-red-400">
        <p>Please connect your wallet to access the Admin Panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mt-12 space-y-8 max-w-4xl mx-auto text-center text-red-400">
        <p>You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-foreground mb-8">Admin Panel</h1>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <XCircle size={16} />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)}><XCircle size={14} /></button>
        </div>
      )}

      {/* ThinkTank Approval */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6">
        <h2 className="text-xl font-black text-foreground mb-4">ThinkTank Post Approval</h2>
        {loadingPosts ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : pendingThinkTankPosts.length === 0 ? (
          <p className="text-muted-foreground">No pending ThinkTank posts.</p>
        ) : (
          <div className="space-y-4">
            {pendingThinkTankPosts.map((post) => (
              <div key={post.id} className="p-4 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{post.content}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">by {post.profiles?.username || 'Unknown'} ({post.address.slice(0, 6)}...{post.address.slice(-4)})</p>
                    {post.profiles?.username && (
                      <Link href={`/profile/${post.profiles.username}`}>
                        <a className="text-primary hover:text-primary/80 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePostApproval(post.id, "approved")}
                    className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"
                  ><CheckCircle size={16} /></button>
                  <button 
                    onClick={() => handlePostApproval(post.id, "rejected")}
                    className="p-2 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-colors"
                  ><XCircle size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified User Management */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6">
        <h2 className="text-xl font-black text-foreground mb-4">Verified User Management</h2>
        {loadingProfiles ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.address} className="p-4 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">{profile.username} ({profile.address.slice(0, 6)}...{profile.address.slice(-4)})</p>
                    {profile.username && (
                      <Link href={`/profile/${profile.username}`}>
                        <a className="text-primary hover:text-primary/80 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Current Badge: {profile.badge || 'None'}</p>
                </div>
                <select
                  value={profile.badge || "null"}
                  onChange={(e) => handleBadgeUpdate(profile.address, e.target.value === "null" ? null : e.target.value as Profile["badge"])}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-foreground focus:border-primary/50 outline-none"
                >
                  {BADGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value || "null"}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
