import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Pin, Search, Bell, X, User, Loader2, MessageCircle, Heart, Activity, Radio } from "lucide-react";
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


/* Sovereign Status Bar — slim glassmorphism strip with live metrics */
function SovereignStatusBar() {
  const [pulse, setPulse] = useState(74.2);
  const [conns, setConns] = useState(8142);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date());
      setPulse((p) => {
        const drift = (Math.random() - 0.5) * 3.6;
        const next = Math.max(60, Math.min(96, p + drift));
        return Math.round(next * 10) / 10;
      });
      setConns((c) => c + (Math.random() < 0.42 ? 1 : 0));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-xl px-4 py-2.5 flex items-center justify-between gap-x-5 gap-y-2 flex-wrap"
      style={{
        background: "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(212,175,55,0.35)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.18)",
      }}
    >
      {/* Active Sovereign Connections */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
        </span>
        <Activity className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(244,206,69,0.85)" }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] whitespace-nowrap" style={{ color: "rgba(212,175,55,0.7)" }}>
          OKBOND Holders Active
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "#F4CE45" }}>
          {conns.toLocaleString()}
        </span>
      </div>

      <div className="hidden md:block h-4 w-px" style={{ background: "rgba(212,175,55,0.25)" }} />

      {/* Grid Pulse */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
        <Radio className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(244,206,69,0.85)" }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] flex-shrink-0" style={{ color: "rgba(212,175,55,0.7)" }}>
          Grid Pulse
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pulse}%`,
              background: "linear-gradient(90deg, #F4CE45, #D4AF37, #A07A1F)",
              boxShadow: "0 0 12px rgba(212,175,55,0.7)",
            }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums w-12 text-right" style={{ color: "#F4CE45" }}>
          {pulse.toFixed(1)}%
        </span>
      </div>

      <div className="hidden md:block h-4 w-px" style={{ background: "rgba(212,175,55,0.25)" }} />

      {/* Sync clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "rgba(212,175,55,0.7)" }}>
          Sync
        </span>
        <span className="text-xs font-mono tabular-nums" style={{ color: "#F4CE45" }}>
          {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </span>
      </div>
    </div>
  );
}

/* Main Component */
export default function Community() {
  const [adminPosts] = useState<AdminPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_posts") || "[]"); } catch { return []; }
  });

  // Founder Dispatch auto-read: when a new pinned dispatch is detected
  // (newer than the last one Marcus has already read aloud), hand it to
  // Marcus so he can announce + read the full text.
  useEffect(() => {
    if (!adminPosts || adminPosts.length === 0) return;
    const pinned = [...adminPosts]
      .filter((p) => p.pinned)
      .sort((a, b) => b.ts - a.ts);
    const latest = pinned[0];
    if (!latest) return;

    let lastTs = 0;
    try { lastTs = Number(localStorage.getItem("okbond_last_dispatch_announced_ts") || "0") || 0; } catch { /* ignore */ }
    if (latest.ts <= lastTs) return; // already announced

    const fullText = (latest.title ? latest.title.trim() + ". " : "") + (latest.body || "").trim();
    if (!fullText.trim()) return;

    const t = window.setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent("marcus:announce-dispatch", {
          detail: { text: fullText, author: "the Founder", ts: latest.ts, id: latest.id },
        }));
        localStorage.setItem("okbond_last_dispatch_announced_ts", String(latest.ts));
      } catch { /* ignore */ }
    }, 1800); // give voices a moment to load + page to settle

    return () => window.clearTimeout(t);
  }, [adminPosts]);

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
    <section className="relative pt-2 pb-4 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* SOVEREIGN COMMUNITY — Executive Header */}
        <header className="relative z-30 mb-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              {/* OKBOND brand mark */}
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{
                  width: 56,
                  height: 56,
                  border: "1.5px solid rgba(212,175,55,0.55)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.35), inset 0 0 12px rgba(0,0,0,0.6)",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                <img src="/okbond-logo.png" alt="OKBOND" className="w-full h-full object-cover" />
              </div>
              {/* Wordmark */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(212,175,55,0.75)" }}>
                  OKBOND · Command Center
                </p>
                <h1
                  className="leading-none tracking-tight truncate"
                  style={{
                    color: "#F4CE45",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem, 4.2vw, 2.3rem)",
                    textShadow: "0 0 24px rgba(212,175,55,0.4)",
                    letterSpacing: "0.005em",
                  }}
                >
                  Orakzai Bond Community
                </h1>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: "rgba(212,175,55,0.5)" }}>
                    Sovereign Network
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative group" ref={searchRef}>
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button
                onClick={() => { setSearchOpen(o => !o); setNotifOpen(false); }}
                className="relative p-2 rounded-full transition-all duration-300 overflow-hidden"
                style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.4)", color: "#F4CE45", boxShadow: "0 0 14px rgba(212,175,55,0.15)" }}
                aria-label="Search users"
              >
                <Search size={18} className="relative z-10 drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
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
              <div className="relative group" ref={notifRef}>
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button
                onClick={() => { setNotifOpen(o => !o); setSearchOpen(false); }}
                className="relative p-2 rounded-full transition-all duration-300 overflow-hidden"
                style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.4)", color: "#F4CE45", boxShadow: "0 0 14px rgba(212,175,55,0.15)" }}
                aria-label="Notifications"
              >
                <Bell size={18} className="relative z-10 drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
                {!notifSeen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black animate-pulse z-20" style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.9)" }}></span>
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

          {/* Slim glassmorphism status bar */}
          <div className="mt-3">
            <SovereignStatusBar />
          </div>
        </header>

        {/* Orakzai Social Hub (feed only — profile card removed) */}
        <SocialHub />

        {/* ── Official Announcements ─────────────────────────────── */}
        {adminPosts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-5 mb-8">
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
