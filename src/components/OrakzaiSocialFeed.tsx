import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MessageCircle, Repeat2, Heart, Share2, Sparkles } from "lucide-react";

// ─── Orakzai Signal — premium social feed ──────────────────────────────────
// X / LinkedIn-style timeline of authentic Orakzai Group dispatches.
// Pure presentation — no external API, content is curated to mirror the
// real-world cadence of the Group, the Founder, OKBOND, and the Sovereign Grid.

type Author = {
  name: string;
  handle: string;
  avatar: string;       // single-letter glyph (gold mark)
  verified: boolean;
  accent?: string;      // optional ring color override
};

type Post = {
  id: string;
  author: Author;
  time: string;
  content: string;
  tags?: string[];
  metrics: { reposts: number; likes: number; comments: number; views: string };
  badge?: { label: string; tone: "vision" | "ico" | "grid" | "founder" | "elite" };
};

const AUTHORS: Record<string, Author> = {
  founder:   { name: "Faisal Orakzai",   handle: "@faisalorakzai",  avatar: "F", verified: true,  accent: "#fde68a" },
  group:     { name: "Orakzai Group",    handle: "@orakzaigroup",   avatar: "O", verified: true },
  okbond:    { name: "OKBOND",           handle: "@okbond",         avatar: "K", verified: true },
  grid:      { name: "Sovereign Grid",   handle: "@sovereigngrid",  avatar: "S", verified: true },
  marcus:    { name: "Marcus AI",        handle: "@marcus_orakzai", avatar: "M", verified: true },
  vision:    { name: "Vision 2100",      handle: "@vision2100",     avatar: "∞", verified: true },
};

const POSTS: Post[] = [
  {
    id: "p1",
    author: AUTHORS.founder,
    time: "2h",
    badge: { label: "Founder", tone: "founder" },
    content:
      "Built brick by brick from the age of twelve. At nineteen, the Group stands across twelve mother companies. The horizon is Vision 2100 — capital that outlives generations, infrastructure that outlasts cycles. We are early. We are patient. We are sovereign.",
    tags: ["#Vision2100", "#OrakzaiGroup", "#OKBOND"],
    metrics: { reposts: 1284, likes: 9420, comments: 312, views: "186K" },
  },
  {
    id: "p2",
    author: AUTHORS.okbond,
    time: "5h",
    badge: { label: "ICO Live", tone: "ico" },
    content:
      "OKBOND ICO — Phase II window now open. Liquidity-backed capital retention model on Polygon, anchored by the Trust Trifecta and the Sovereign Guarantee. Institutional onboarding via concierge. Retail via the live ICO portal.",
    tags: ["#ICO", "#Polygon", "#OKBOND"],
    metrics: { reposts: 642, likes: 3870, comments: 128, views: "94K" },
  },
  {
    id: "p3",
    author: AUTHORS.grid,
    time: "12h",
    badge: { label: "Sovereign Grid", tone: "grid" },
    content:
      "Sovereign Grid status: all twelve mother companies report green. Active connections holding above 1,400. Vault telemetry stable. Marcus AI handling concierge and elite-priority routing without interruption.",
    metrics: { reposts: 188, likes: 1240, comments: 41, views: "38K" },
  },
  {
    id: "p4",
    author: AUTHORS.vision,
    time: "1d",
    badge: { label: "Vision 2100", tone: "vision" },
    content:
      "A hundred-year horizon is not a marketing line. It is a discipline. Every quarter is judged against the century. Every decision compounds. By 2100, the Group's footprint will be measured in continents — not quarters.",
    tags: ["#Vision2100", "#GenerationalCapital"],
    metrics: { reposts: 921, likes: 5610, comments: 217, views: "112K" },
  },
  {
    id: "p5",
    author: AUTHORS.group,
    time: "1d",
    content:
      "The twelve mother companies are not subsidiaries — they are pillars. Finance, Real Estate, Energy, Logistics, Telecom, AgriTech, Construction, Media, Hospitality, Digital, Holdings, and the Foundation. Each one self-financed. Each one accountable to the Founder.",
    tags: ["#OrakzaiGroup", "#TwelvePillars"],
    metrics: { reposts: 412, likes: 2860, comments: 94, views: "61K" },
  },
  {
    id: "p6",
    author: AUTHORS.marcus,
    time: "2d",
    badge: { label: "Concierge", tone: "elite" },
    content:
      "Marcus is now live across the Orakzai estate. Voice-to-action navigation, time-aware greetings, Chairman briefing on demand, and Elite Priority routing for institutional inquiries above the qualification threshold. Say 'Marcus' on any page.",
    tags: ["#MarcusAI", "#Concierge"],
    metrics: { reposts: 308, likes: 2104, comments: 76, views: "47K" },
  },
  {
    id: "p7",
    author: AUTHORS.founder,
    time: "3d",
    badge: { label: "Founder", tone: "founder" },
    content:
      "Trust is the only currency that compounds at the speed of reputation. We do not chase. We deliver. The Group's word is its bond — and OKBOND is the on-chain signature of that promise.",
    tags: ["#TrustTrifecta", "#SovereignGuarantee"],
    metrics: { reposts: 740, likes: 4980, comments: 182, views: "98K" },
  },
  {
    id: "p8",
    author: AUTHORS.okbond,
    time: "4d",
    content:
      "Whitepaper v1.4 published. Audit report attached. Tokenomics, vault mechanics, lottery distribution, and the Sovereign Guarantee — every line verifiable, every reserve disclosed.",
    tags: ["#Whitepaper", "#Audit", "#Transparency"],
    metrics: { reposts: 264, likes: 1620, comments: 58, views: "42K" },
  },
];

function toneColors(tone?: Post["badge"] extends infer T ? T extends { tone: infer U } ? U : never : never) {
  switch (tone) {
    case "founder": return { bg: "rgba(234,179,8,0.12)",   bd: "rgba(234,179,8,0.55)",   fg: "#fde68a" };
    case "ico":     return { bg: "rgba(34,197,94,0.12)",   bd: "rgba(34,197,94,0.55)",   fg: "#86efac" };
    case "grid":    return { bg: "rgba(59,130,246,0.12)",  bd: "rgba(59,130,246,0.55)",  fg: "#93c5fd" };
    case "vision":  return { bg: "rgba(168,85,247,0.12)",  bd: "rgba(168,85,247,0.55)",  fg: "#d8b4fe" };
    case "elite":   return { bg: "rgba(220,38,38,0.12)",   bd: "rgba(220,38,38,0.55)",   fg: "#fca5a5" };
    default:        return { bg: "rgba(234,179,8,0.10)",   bd: "rgba(234,179,8,0.45)",   fg: "#fde68a" };
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);

  const accent = post.author.accent || "#eab308";
  const badge = post.badge ? toneColors(post.badge.tone as any) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.36), ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border bg-background/60 backdrop-blur-md p-5 sm:p-6 transition-all"
      style={{
        borderColor: "rgba(234,179,8,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(234,179,8,0.05)",
      }}
    >
      {/* subtle gold halo on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: "0 0 0 1px rgba(234,179,8,0.35), 0 0 28px rgba(234,179,8,0.15)" }}
      />

      <header className="flex items-start gap-3">
        <div
          className="relative flex-shrink-0 w-11 h-11 rounded-full grid place-items-center font-bold text-base"
          style={{
            background: `radial-gradient(circle at 30% 30%, #fde68a 0%, ${accent} 40%, #a16207 100%)`,
            color: "#1a1a1a",
            boxShadow: `0 0 0 1px ${accent}66, 0 0 14px ${accent}55`,
          }}
        >
          {post.author.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-foreground text-[14.5px] truncate">{post.author.name}</span>
            {post.author.verified && (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#eab308", fill: "rgba(234,179,8,0.18)" }} />
            )}
            <span className="text-muted-foreground text-xs font-mono truncate">{post.author.handle}</span>
            <span className="text-muted-foreground/60 text-xs">·</span>
            <span className="text-muted-foreground text-xs">{post.time}</span>

            {badge && post.badge && (
              <span
                className="ml-auto px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest leading-none border"
                style={{ background: badge.bg, borderColor: badge.bd, color: badge.fg }}
              >
                {post.badge.label}
              </span>
            )}
          </div>

          <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-200 whitespace-pre-line">
            {post.content}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              {post.tags.map((t) => (
                <span key={t} className="text-[12.5px] font-medium" style={{ color: "#eab308" }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-1 text-muted-foreground text-xs">
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
              aria-label="Comments"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="font-mono">{formatNum(post.metrics.comments)}</span>
            </button>
            <button
              onClick={() => setReposted((r) => !r)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
              style={{ color: reposted ? "#4ade80" : undefined }}
              aria-label="Repost"
            >
              <Repeat2 className="w-3.5 h-3.5" />
              <span className="font-mono">{formatNum(post.metrics.reposts + (reposted ? 1 : 0))}</span>
            </button>
            <button
              onClick={() => setLiked((l) => !l)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              style={{ color: liked ? "#fb7185" : undefined }}
              aria-label="Like"
            >
              <Heart className="w-3.5 h-3.5" style={liked ? { fill: "#fb7185" } : undefined} />
              <span className="font-mono">{formatNum(post.metrics.likes + (liked ? 1 : 0))}</span>
            </button>
            <button
              className="ml-auto flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="font-mono hidden sm:inline">{post.metrics.views}</span>
            </button>
          </div>
        </div>
      </header>
    </motion.article>
  );
}

export default function OrakzaiSocialFeed() {
  const [filter, setFilter] = useState<"all" | "founder" | "okbond" | "grid" | "vision">("all");

  const filtered = POSTS.filter((p) => {
    if (filter === "all") return true;
    return p.author.handle.toLowerCase().includes(filter);
  });

  return (
    <section className="relative w-full py-20 sm:py-24 px-4">
      {/* Section header */}
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3 h-3" />
            <span>Orakzai Signal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Live from the Group
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Direct dispatches from the Founder, OKBOND, the Sovereign Grid, and the Vision 2100 desk —
            curated, verified, and updated in real time.
          </p>
        </motion.div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {([
            ["all",     "All Signal"],
            ["founder", "Founder"],
            ["okbond",  "OKBOND"],
            ["grid",    "Sovereign Grid"],
            ["vision",  "Vision 2100"],
          ] as const).map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3.5 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-widest transition-all"
                style={{
                  borderColor: active ? "rgba(234,179,8,0.65)" : "rgba(234,179,8,0.20)",
                  background:  active ? "rgba(234,179,8,0.10)" : "transparent",
                  color:       active ? "#fde68a" : "#a1a1aa",
                  boxShadow:   active ? "0 0 12px rgba(234,179,8,0.30)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Feed grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60 font-mono">
          The Signal continues — follow the Group across every channel
        </div>
      </div>
    </section>
  );
}
