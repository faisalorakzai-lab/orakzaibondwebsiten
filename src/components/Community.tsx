import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Pin, Search, Bell } from "lucide-react";
import LiveParticipationFeed from "@/components/LiveParticipationFeed";
import ThinkTank from "@/components/ThinkTank";
import SocialHub from "@/components/SocialHub";

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

/* ── Main Component ─────────────────────────────────────────────────── */
export default function Community() {
  const [adminPosts] = useState<AdminPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_posts") || "[]"); } catch { return []; }
  });

  return (
    <section className="relative py-8 px-4 overflow-hidden bg-black/30">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* ── YEAR 2100 TOP BAR ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button className="relative p-2.5 rounded-full bg-white/10 border border-cyan-400/40 text-cyan-400 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl group-hover:bg-cyan-400/20 transition-colors"></div>
                <Search size={20} className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <button className="relative p-2.5 rounded-full bg-white/10 border border-cyan-400/40 text-cyan-400 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl group-hover:bg-cyan-400/20 transition-colors"></div>
                <Bell size={20} className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(0,255,255,1)] z-20"></span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Orakzai Social Hub (Contains Profile Card) ────────── */}
        {/* SocialHub is modified to show profile card at top */}
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
