import { useState, useEffect, useCallback } from "react";
import { supabase, Profile } from "@/lib/supabase";
import { Loader2, XCircle, Award, UserCheck, Building2, Upload, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";

const ADMIN_WALLET = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";

const BADGE_OPTIONS = [
  { value: null, label: "None", icon: null },
  { value: "blue", label: "Blue (Verified)", icon: Award },
  { value: "green", label: "Green (Leader)", icon: UserCheck },
  { value: "yellow", label: "Yellow (Companies & Elite)", icon: Building2 },
];

interface ProfileWithBranding extends Profile {
  branding_logo?: string | null;
}

export default function CommunityHub() {
  const { address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<ProfileWithBranding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (address && address.toLowerCase() === ADMIN_WALLET.toLowerCase()) { /* fix: case-insensitive check */
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [address]);

  const fetchProfiles = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username", { ascending: true });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError("Failed to load profiles for community management.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin, fetchProfiles]);

  const handleBadgeUpdate = async (profileAddress: string, newBadge: Profile["badge"]) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ badge: newBadge })
        .eq("address", profileAddress);
      if (error) throw error;
      setProfiles(profiles.map(p => p.address === profileAddress ? { ...p, badge: newBadge } : p));
    } catch (err) {
      console.error("Error updating badge:", err);
      setError("Failed to update badge.");
    }
  };

  const handleLogoUpload = async (profileAddress: string, file: File) => {
    if (!file) return;
    
    setUploadingLogo(profileAddress);
    try {
      const fileName = `${profileAddress}-${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("social_hub")
        .upload(`logos/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("social_hub")
        .getPublicUrl(`logos/${fileName}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ branding_logo: publicUrl.publicUrl })
        .eq("address", profileAddress);

      if (updateError) throw updateError;

      setProfiles(profiles.map(p => 
        p.address === profileAddress 
          ? { ...p, branding_logo: publicUrl.publicUrl } 
          : p
      ));
      setError(null);
    } catch (err) {
      console.error("Error uploading logo:", err);
      setError("Failed to upload logo.");
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleRemoveLogo = async (profileAddress: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ branding_logo: null })
        .eq("address", profileAddress);

      if (error) throw error;

      setProfiles(profiles.map(p => 
        p.address === profileAddress 
          ? { ...p, branding_logo: null } 
          : p
      ));
    } catch (err) {
      console.error("Error removing logo:", err);
      setError("Failed to remove logo.");
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!address || !isAdmin) {
    return null;
  }

  return (
    <div className="mt-12 space-y-8 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-black text-foreground mb-8">Community Hub - Admin Control</h1>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <XCircle size={16} />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)}><XCircle size={14} /></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6">
        <input
          type="text"
          placeholder="Search by username or wallet address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-foreground placeholder-muted-foreground focus:border-primary/50 outline-none"
        />
      </div>

      {/* User Branding Management */}
      <div className="glass-card rounded-3xl border border-primary/20 p-6">
        <h2 className="text-xl font-black text-foreground mb-4">User Branding Management</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : filteredProfiles.length === 0 ? (
          <p className="text-muted-foreground">No users found.</p>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <div key={profile.address} className="p-4 border border-white/10 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground font-bold">{profile.username || 'Unnamed'} ({profile.address.slice(0, 6)}...{profile.address.slice(-4)})</p>
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

                {/* Logo Management */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-muted-foreground font-bold mb-3">Company Logo / Branding</p>
                  <div className="flex items-center gap-3">
                    {profile.branding_logo ? (
                      <>
                        <img 
                          src={profile.branding_logo} 
                          alt="Branding Logo" 
                          className="w-12 h-12 rounded-lg object-cover border border-primary/20"
                        />
                        <button
                          onClick={() => handleRemoveLogo(profile.address)}
                          disabled={uploadingLogo === profile.address}
                          className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer">
                        <Upload size={14} />
                        <span className="text-xs font-bold">Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(profile.address, file);
                          }}
                          disabled={uploadingLogo === profile.address}
                          className="hidden"
                        />
                      </label>
                    )}
                    {uploadingLogo === profile.address && (
                      <Loader2 className="animate-spin text-primary" size={14} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
