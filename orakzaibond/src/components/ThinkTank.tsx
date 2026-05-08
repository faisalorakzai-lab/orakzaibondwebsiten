import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, Heart, X, Send, ShieldCheck, Clock,
  Sparkles, ChevronUp, BadgeCheck, Flame, Plus,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = ["Tokenomics", "Product", "Community", "DeFi", "Real Estate", "Marketing", "Other"] as const;
type Category = typeof CATEGORIES[number];
type Status = "approved" | "review" | "pending" | "rejected";

interface Idea {
  id: string;
  title: string;
  category: Category;
  description: string;
  author: string;
  timestamp: number;
  upvotes: number;
  upvotedBy: string[];
  status: Status;
}

const SESSION_KEY = "okbond_tt_session";
const IDEAS_KEY   = "okbond_tt_ideas";
const SPAM_KEY    = "okbond_tt_last_submit";
const SPAM_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/* ── Seeded ideas ──────────────────────────────────────────────────── */
const SEED_IDEAS: Idea[] = [
  {
    id: "seed-1",
    title: "Monthly Token Burn Mechanism",
    category: "Tokenomics",
    description: "Burn 0.5% of unsold ICO tokens monthly to increase scarcity and drive price appreciation for holders.",
    author: "0xA3F2…8Cd7",
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    upvotes: 47,
    upvotedBy: [],
    status: "approved",
  },
  {
    id: "seed-2",
    title: "OKBOND Mobile App with Push Alerts",
    category: "Product",
    description: "A dedicated iOS/Android app for tracking Lottery entries, staking rewards, and ICO phases — with push notifications.",
    author: "0x7c44…F921",
    timestamp: Date.now() - 1000 * 60 * 60 * 14,
    upvotes: 38,
    upvotedBy: [],
    status: "review",
  },
  {
    id: "seed-3",
    title: "Property NFTs for Orakzai Real Estate",
    category: "Real Estate",
    description: "Tokenize Orakzai property assets as NFTs on Polygon, allowing fractional ownership and easy transfer of shares.",
    author: "0x1eB5…4D30",
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
    upvotes: 31,
    upvotedBy: [],
    status: "review",
  },
  {
    id: "seed-4",
    title: "Referral Hall of Fame on Dashboard",
    category: "Community",
    description: "Show the top 10 referrers live on the main dashboard with a real-time leaderboard and monthly bonus rewards.",
    author: "0x9b21…1Ab3",
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    upvotes: 22,
    upvotedBy: [],
    status: "pending",
  },
  {
    id: "seed-5",
    title: "Auto-Compound Staking Option",
    category: "DeFi",
    description: "Let holders opt in to automatically reinvest staking rewards back into the pool for compound growth without manual claiming.",
    author: "0xaA92…7F10",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    upvotes: 19,
    upvotedBy: [],
    status: "approved",
  },
];

function getSession(): string {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem(SESSION_KEY, s); }
  return s;
}

function loadIdeas(): Idea[] {
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    if (raw) return JSON.parse(raw) as Idea[];
  } catch { /**/ }
  localStorage.setItem(IDEAS_KEY, JSON.stringify(SEED_IDEAS));
  return SEED_IDEAS;
}

function saveIdeas(ideas: Idea[]) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const STATUS_CFG: Record<Status, { label: string; cls: string; icon: typeof BadgeCheck; glow: string }> = {
  approved: {
    label: "Approved",
    cls: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    icon: BadgeCheck,
    glow: "0 0 12px rgba(52,211,153,0.5)",
  },
  review: {
    label: "Under Review",
    cls: "bg-amber-500/15 border-amber-500/35 text-amber-300",
    icon: Clock,
    glow: "0 0 10px rgba(245,158,11,0.4)",
  },
  pending: {
    label: "Pending",
    cls: "bg-muted/20 border-border text-muted-foreground/60",
    icon: Clock,
    glow: "none",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-red-500/10 border-red-500/25 text-red-400/70",
    icon: AlertCircle,
    glow: "none",
  },
};

const CAT_COLORS: Record<Category, string> = {
  Tokenomics:  "bg-primary/15 text-primary border-primary/30",
  Product:     "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Community:   "bg-violet-500/15 text-violet-300 border-violet-500/30",
  DeFi:        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Real Estate":"bg-orange-500/15 text-orange-300 border-orange-500/30",
  Marketing:   "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Other:       "bg-muted/20 text-muted-foreground border-border",
};

/* ── Idea Card ──────────────────────────────────────────────────────── */
function IdeaCard({ idea, session, onUpvote }: { idea: Idea; session: string; onUpvote: (id: string) => void }) {
  const voted = idea.upvotedBy.includes(session);
  const sc = STATUS_CFG[idea.status];
  const StatusIcon = sc.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl p-5 group transition-all duration-300 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-cyan-400/30"
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(0,255,255,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>

      {/* Cyan left accent line */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-cyan-400/60 via-cyan-400/30 to-transparent" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2.5 pl-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Category */}
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${CAT_COLORS[idea.category]}`}>
              {idea.category}
            </span>
            {/* Status badge */}
            {idea.status !== "pending" && (
              <motion.span
                animate={{ boxShadow: [sc.glow, sc.glow.replace("0.5", "0.9").replace("0.4", "0.7"), sc.glow] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${sc.cls}`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {sc.label}
              </motion.span>
            )}
          </div>
          <h4 className="font-extrabold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
            {idea.title}
          </h4>
        </div>

        {/* Upvote button */}
        <motion.button
          onClick={() => onUpvote(idea.id)}
          whileTap={{ scale: 0.88 }}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-300 flex-shrink-0 ${
            voted
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border bg-white/3 text-muted-foreground/60 hover:border-primary/30 hover:text-primary hover:bg-primary/8"
          }`}
          style={{ boxShadow: voted ? "0 0 14px rgba(234,179,8,0.35)" : "none" }}>
          <motion.div animate={voted ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={`w-3.5 h-3.5 ${voted ? "fill-primary" : ""}`} />
          </motion.div>
          <span className="text-[10px] font-extrabold font-mono leading-none">{idea.upvotes}</span>
        </motion.button>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground/70 leading-relaxed pl-3 mb-3">{idea.description}</p>

      {/* Footer */}
      <div className="flex items-center gap-3 pl-3">
        <span className="text-[10px] text-muted-foreground/40 font-mono">{idea.author}</span>
        <span className="text-primary/20">·</span>
        <span className="text-[10px] text-muted-foreground/40">{timeAgo(idea.timestamp)}</span>
      </div>
    </motion.div>
  );
}

/* ── Submit Modal ───────────────────────────────────────────────────── */
function SubmitModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (idea: Omit<Idea, "id" | "timestamp" | "upvotes" | "upvotedBy" | "status" | "author">) => void }) {
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState<Category>("Tokenomics");
  const [desc, setDesc]         = useState("");
  const [error, setError]       = useState("");

  function handleSubmit() {
    if (!title.trim() || title.length < 5) { setError("Idea title must be at least 5 characters."); return; }
    if (!desc.trim() || desc.length < 20) { setError("Description must be at least 20 characters."); return; }
    onSubmit({ title: title.trim(), category, description: desc.trim() });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
        className="w-full max-w-md rounded-3xl border border-primary/30 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,rgba(10,12,32,0.97) 0%,rgba(6,8,22,0.97) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(234,179,8,0.15), 0 40px 80px rgba(0,0,0,0.6)",
        }}>

        {/* Gold top line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        {/* Gold corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse,rgba(234,179,8,0.1),transparent_70%)] pointer-events-none" />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"
                style={{ boxShadow: "0 0 16px rgba(234,179,8,0.3)" }}>
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">Submit Your Idea</h3>
                <p className="text-[10px] text-muted-foreground/60 font-mono">Orakzai Think Tank</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 block">
                Idea Title <span className="text-primary">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(""); }}
                maxLength={80}
                placeholder="e.g. Monthly Token Burn Mechanism"
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 block">
                Category <span className="text-primary">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-white/10 bg-[#0a0c22] px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 block">
                Description <span className="text-primary">*</span>
              </label>
              <textarea
                value={desc}
                onChange={(e) => { setDesc(e.target.value); setError(""); }}
                maxLength={400}
                rows={4}
                placeholder="Describe your idea in detail. How does it benefit OKBOND holders?"
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-all resize-none leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground/35 text-right mt-1 font-mono">{desc.length}/400</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button onClick={handleSubmit}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-primary hover:bg-primary/90 text-black transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              <Send className="w-4 h-4" />
              Submit to Think Tank
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function ThinkTank() {
  const [ideas, setIdeas]       = useState<Idea[]>(() => loadIdeas());
  const [session]               = useState(() => getSession());
  const [showModal, setShowModal] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [sortBy, setSortBy]     = useState<"votes" | "recent">("votes");
  const [submitted, setSubmitted] = useState(false);

  /* Check cooldown on mount */
  useEffect(() => {
    const last = parseInt(localStorage.getItem(SPAM_KEY) || "0", 10);
    const remaining = last + SPAM_COOLDOWN_MS - Date.now();
    if (remaining > 0) setCooldown(remaining);
  }, []);

  /* Cooldown countdown */
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => {
      setCooldown((c) => {
        if (!c || c <= 1000) { clearInterval(t); return null; }
        return c - 1000;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function handleUpvote(id: string) {
    setIdeas((prev) => {
      const updated = prev.map((idea) => {
        if (idea.id !== id) return idea;
        const alreadyVoted = idea.upvotedBy.includes(session);
        return {
          ...idea,
          upvotes: alreadyVoted ? idea.upvotes - 1 : idea.upvotes + 1,
          upvotedBy: alreadyVoted
            ? idea.upvotedBy.filter((s) => s !== session)
            : [...idea.upvotedBy, session],
        };
      });
      saveIdeas(updated);
      return updated;
    });
  }

  function handleSubmit(data: Omit<Idea, "id" | "timestamp" | "upvotes" | "upvotedBy" | "status" | "author">) {
    const now = Date.now();
    const last = parseInt(localStorage.getItem(SPAM_KEY) || "0", 10);
    if (now - last < SPAM_COOLDOWN_MS) {
      setCooldown(last + SPAM_COOLDOWN_MS - now);
      setShowModal(false);
      return;
    }
    const newIdea: Idea = {
      id: `user-${now}`,
      title: data.title,
      category: data.category,
      description: data.description,
      author: "0x" + session.slice(0, 4).toUpperCase() + "…" + session.slice(-4).toUpperCase(),
      timestamp: now,
      upvotes: 1,
      upvotedBy: [session],
      status: "pending",
    };
    setIdeas((prev) => {
      const updated = [newIdea, ...prev];
      saveIdeas(updated);
      return updated;
    });
    localStorage.setItem(SPAM_KEY, String(now));
    setCooldown(SPAM_COOLDOWN_MS);
    setShowModal(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const sorted = [...ideas]
    .filter((i) => i.status !== "rejected")
    .sort((a, b) => sortBy === "votes" ? b.upvotes - a.upvotes : b.timestamp - a.timestamp);

  const cooldownMins = cooldown ? Math.ceil(cooldown / 60000) : 0;

  return (
    <>
      <AnimatePresence>
        {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="mt-10 rounded-3xl border border-primary/20 overflow-hidden relative"
        style={{
          background: "rgba(6,8,24,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 60px rgba(234,179,8,0.06), inset 0 0 80px rgba(234,179,8,0.02)",
        }}>

        {/* Gold top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(234,179,8,0.05),transparent)] pointer-events-none" />

        <div className="relative z-10 p-7">

          {/* ── Incentive Banner ── */}
          <motion.div
            animate={{ boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 20px rgba(234,179,8,0.2)", "0 0 0px rgba(234,179,8,0)"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex items-center gap-3 mb-7 px-5 py-3.5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/6 to-primary/10">
            <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <Flame className="w-5 h-5 text-primary" />
            </motion.div>
            <p className="text-sm font-bold text-foreground flex-1">
              Your ideas shape our future.{" "}
              <span className="text-primary">Best ideas win OKBOND rewards!</span>
            </p>
            <span className="flex-shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 font-mono">
              REWARDED
            </span>
          </motion.div>

          {/* ── Section Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  animate={{ boxShadow: ["0 0 6px rgba(234,179,8,0.4)","0 0 18px rgba(234,179,8,0.7)","0 0 6px rgba(234,179,8,0.4)"] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70">Innovation Hub</span>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground neon-heading">
                Orakzai{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-200 to-cyan-400">
                  Think Tank
                </span>
              </h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {ideas.length} ideas submitted · Community-driven innovation
              </p>
            </div>

            {/* Sort + Submit */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex rounded-xl border border-border overflow-hidden text-xs font-bold">
                {(["votes", "recent"] as const).map((s) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-2 transition-all ${sortBy === s ? "bg-primary/15 text-primary" : "text-muted-foreground/60 hover:text-foreground"}`}>
                    {s === "votes" ? "Top" : "New"}
                  </button>
                ))}
              </div>
              <motion.button
                onClick={() => cooldown ? null : setShowModal(true)}
                whileTap={{ scale: cooldown ? 1 : 0.95 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-300 ${
                  cooldown
                    ? "bg-muted/20 border border-border text-muted-foreground/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-black hover:shadow-[0_0_25px_rgba(234,179,8,0.45)]"
                }`}
                title={cooldown ? `Cooldown: ${cooldownMins}m remaining` : "Submit an idea"}>
                <Plus className="w-4 h-4" />
                {cooldown ? `Wait ${cooldownMins}m` : "Submit Idea"}
              </motion.button>
            </div>
          </div>

          {/* ── Success toast ── */}
          <AnimatePresence>
            {submitted && (
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="mb-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                Your idea has been submitted! The team will review it shortly.
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Legend ── */}
          <div className="flex flex-wrap items-center gap-3 mb-5 text-[10px] font-bold text-muted-foreground/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              Approved by Team
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              Under Review
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 fill-primary text-primary" />
              Click to support an idea
            </span>
          </div>

          {/* ── Idea Feed ── */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(234,179,8,0.2) transparent" }}>
            <AnimatePresence mode="popLayout">
              {sorted.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} session={session} onUpvote={handleUpvote} />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Anti-spam notice ── */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-muted-foreground/35 font-mono">
            <ShieldCheck className="w-3 h-3" />
            Anti-spam: One idea per 30 minutes per session. Ideas reviewed before approval.
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>
    </>
  );
}
