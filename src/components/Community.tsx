import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Pin, Search, Bell, X, User, Loader2, MessageCircle, Heart } from "lucide-react";
import { Link } from "wouter";
import LiveParticipationFeed from "@/components/LiveParticipationFeed";
import ThinkTank from "@/components/ThinkTank";
import SocialHub from "@/components/SocialHub";
import { supabase, Profile, Post } from "@/lib/supabase";

/* ── Admin data types ────────────────────────────────────────────── */
interface AdminPost {
  id: string; title: string; body: string;
  color: "gold" | "green" | "blue" | "red" | "purple";
  pinned: boolean; ts: number;
}

const POST_COLORS: Record<AdminPost["color"], { bg: string; border: string; text: string; icon: string }> = {
  gold:   { bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.25)",   text: "#EAB308",  icon: "text-yellow-400"  },
  green:  { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   text: "#22c55e",  icon: "text-emerald-400" },
  blue:   { bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)",  text: "#60a5fa",  icon: "text-blue-400"    },
  red:    { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   text: "#f87171",  icon: "text-red-400"     },
  purple: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", text: "#a78bfa",  icon: "text-purple-400"  },
};

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s`;
  if (d < 3600) return `${Math.floor(d/60)}m`;
  if (d < 86400) return `${Math.floor(d/3600)}h`;
  return `${Math.floor(d/86400)}d`;
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function Community() {
  const [adminPosts] = useState<AdminPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_posts") || "[]"); } catch { return []; }
  });

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Post[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSeen, setNotifSeen] = useState<boolean>(() => {
    try { return localStorage.getItem("okbond_notif_seen") === "1"; } catch { return false; }
  });
  const notifRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced username search
  useEffect(() => {
    if (!searchOpen) return;
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", `%${q}%`)
          .limit(10);
        setSearchResults(data || []);
      } catch (e) {
        console.error("Search error:", e);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, searchOpen]);

  // Fetch notifications when opened
  useEffect(() => {
    if (!notifOpen) return;
    setNotifLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from("posts")
          .select("*, profiles:address(*)")
          .order("created_at", { ascending: false })
          .limit(10);
        setNotifications(data || []);
      } catch (e) {
        console.error("Notifications error:", e);
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    })();
    // mark as seen
    setNotifSeen(true);
    try { localStorage.setItem("okbond_notif_seen", "1"); } catch {}
  }, [notifOpen]);

  return (
    <section className="relative py-8 px-4 overflow-hidden bg-black/30">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ── YEAR 2100 TOP BAR ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 px-2 relative z-30">
          <div className="flex items-center gap-4">
            <div className="relative group" ref={searchRef}>
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button
                onClick={() => { setSearchOpen(o => !o); setNotifOpen(false); }}
                className="relative p-2.5 rounded-full bg-white/10 border border-cyan-400/40 text-cyan-400 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] overflow-hidden"
                aria-label="Search users"
              >
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl group-hover:bg-cyan-400/20 transition-colors"></div>
                <Search size={20} className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full mt-3 w-[320px] sm:w-[380px] rounded-2xl bg-black/95 backdrop-blur-xl border border-primary/40 shadow-[0_0_30px_rgba(234,179,8,0.2)] z-50 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20">
                      <Search size={16} className="text-primary/70" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search username..."
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                      />
                      <button onClick={() => setSearchOpen(false)} className="text-muted-foreground/60 hover:text-foreground">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 size={18} className="text-primary animate-spin" />
                        </div>
                      ) : searchQuery.trim() === "" ? (
                        <p className="text-xs text-muted-foreground/70 text-center py-6 px-4">
                          Start typing to find members by username.
                        </p>
                      ) : searchResults.length === 0 ? (
                        <p className="text-xs text-muted-foreground/70 text-center py-6 px-4">
                          No users found for "{searchQuery}".
                        </p>
                      ) : (
                        <ul className="py-1">
                          {searchResults.map((p) => (
                            <li key={p.address}>
                              <Link href={`/profile/${p.username || p.address}`}>
                                <div
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                                >
                                  <div className="w-9 h-9 rounded-full border border-primary/30 overflow-hidden flex-shrink-0 bg-black/40">
                                    {p.avatar_url ? (
                                      <img src={p.avatar_url} alt={p.username || ''} className="w-full h-full object-cover" />
                                    ) : (
                                      <User size={18} className="m-auto mt-2 text-primary/40" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{p.username || 'Investor'}</p>
                                    <p className="text-[11px] text-muted-foreground/70 truncate">
                                      @{(p.username || p.address.slice(2, 8)).toLowerCase()}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group" ref={notifRef}>
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button
                onClick={() => { setNotifOpen(o => !o); setSearchOpen(false); }}
                className="relative p-2.5 rounded-full bg-white/10 border border-cyan-400/40 text-cyan-400 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] overflow-hidden"
                aria-label="Notifications"
              >
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl group-hover:bg-cyan-400/20 transition-colors"></div>
                <Bell size={20} className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                {!notifSeen && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(0,255,255,1)] z-20"></span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-3 w-[320px] sm:w-[380px] rounded-2xl bg-black/95 backdrop-blur-xl border border-primary/40 shadow-[0_0_30px_rgba(234,179,8,0.2)] z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Recent Activity</span>
                      </div>
                      <button onClick={() => setNotifOpen(false)} className="text-muted-foreground/60 hover:text-foreground">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 size={18} className="text-primary animate-spin" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <p className="text-xs text-muted-foreground/70 text-center py-6 px-4">
                          No recent activity yet.
                        </p>
                      ) : (
                        <ul className="py-1">
                          {notifications.map((n) => {
                            const username = n.profiles?.username || 'Investor';
                            return (
                              <li key={n.id} className="border-b border-primary/5 last:border-0">
                                <a
                                  href={`#post-${n.id}`}
                                  onClick={() => setNotifOpen(false)}
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden flex-shrink-0 bg-black/40 mt-0.5">
                                    {n.profiles?.avatar_url ? (
                                      <img src={n.profiles.avatar_url} alt={username} className="w-full h-full object-cover" />
                                    ) : (
                                      <User size={16} className="m-auto mt-2 text-primary/40" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground/90">
                                      <span className="font-bold text-foreground">{username}</span>
                                      <span className="text-muted-foreground/70"> shared a new post</span>
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/70 line-clamp-2 mt-0.5">{n.content}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/60">
                                      <span>{timeAgo(n.created_at)} ago</span>
                                      <span className="flex items-center gap-1"><Heart size={9} /> {n.likes_count || 0}</span>
                                      <span className="flex items-center gap-1"><MessageCircle size={9} /> {n.comments_count || 0}</span>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Orakzai Social Hub (Contains Profile Card) ────────── */}
        <SocialHub />

        {/* ── Official Announcements ─────────────────────────────── */}
        {adminPosts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="my-14">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60">
                Official Announcements
              </p>
            </div>
            <div className="space-y-3">
              {[...adminPosts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts).map((post) => {
                const c = POST_COLORS[post.color];
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                    className="rounded-2xl px-5 py-4 relative overflow-hidden"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <div className="absolute top-0 left-0 w-0.5 h-full" style={{ background: c.text }} />
                    <div className="flex items-start gap-3 pl-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {post.pinned && (
                          <Pin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.text }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white mb-1">{post.title}</p>
                          <p className="text-xs text-foreground/70 leading-relaxed">{post.body}</p>
                          <p className="text-[10px] font-mono mt-1.5" style={{ color: c.text + "80" }}>
                            {new Date(post.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · Orakzai Admin
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Orakzai Think Tank ───────────────────────────────── */}
        <ThinkTank />

        {/* ── Live Activity Feed ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }} className="mt-10">
          <div className="text-center mb-5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Live Activity</p>
            <h3 className="text-xl font-extrabold text-foreground neon-heading">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-200">Live Feed</span>
            </h3>
          </div>
          <LiveParticipationFeed />
        </motion.div>

      </div>
    </section>
  );
}
