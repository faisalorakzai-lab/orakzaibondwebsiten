import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, RotateCcw, Users, Zap, Trophy, ShieldCheck } from "lucide-react";

// ── Simulated activity templates ──────────────────────────────────────────────
const ACTIVITY_TEMPLATES = [
  { type: "enter",    icon: Ticket,      color: "text-primary",      bg: "bg-primary/10 border-primary/20",      label: "entered the Lottery" },
  { type: "refund",   icon: RotateCcw,   color: "text-emerald-400",  bg: "bg-emerald-500/10 border-emerald-500/20", label: "just claimed a refund" },
  { type: "referral", icon: Users,       color: "text-purple-400",   bg: "bg-purple-500/10 border-purple-500/20",   label: "joined the Referral program" },
  { type: "ico",      icon: Zap,         color: "text-amber-400",    bg: "bg-amber-500/10 border-amber-500/20",     label: "purchased OKBOND tokens" },
  { type: "phase1",   icon: Ticket,      color: "text-primary",      bg: "bg-primary/10 border-primary/20",      label: "entered Phase 1 ICO" },
  { type: "winner",   icon: Trophy,      color: "text-yellow-400",   bg: "bg-yellow-500/10 border-yellow-500/20",   label: "🏆 won the Lottery!" },
  { type: "vault",    icon: ShieldCheck, color: "text-blue-400",     bg: "bg-blue-500/10 border-blue-500/20",       label: "assets secured in vault" },
] as const;

// ── Pseudo-random wallet address generator ────────────────────────────────────
const HEX = "0123456789ABCDEFabcdef";
function fakeWallet(seed: number): string {
  let s = seed * 2654435761;
  const chars = Array.from({ length: 8 }, () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return HEX[Math.abs(s) % HEX.length];
  });
  return `0x${chars.slice(0, 4).join("")}…${chars.slice(4).join("")}`;
}

// ── Seeded time labels ────────────────────────────────────────────────────────
const TIME_LABELS = [
  "just now", "2s ago", "5s ago", "12s ago", "18s ago",
  "30s ago",  "45s ago", "1m ago", "2m ago",  "3m ago",
];

interface FeedEntry {
  id: number;
  wallet: string;
  template: typeof ACTIVITY_TEMPLATES[number];
  timeLabel: string;
}

let globalId = 0;
function makeEntry(seed: number): FeedEntry {
  const tpl = ACTIVITY_TEMPLATES[seed % ACTIVITY_TEMPLATES.length];
  return {
    id: ++globalId,
    wallet: fakeWallet(seed * 137 + globalId * 31),
    template: tpl,
    timeLabel: TIME_LABELS[seed % TIME_LABELS.length],
  };
}

// ── Seed the initial 10 entries ───────────────────────────────────────────────
function seedEntries(): FeedEntry[] {
  return Array.from({ length: 10 }, (_, i) => makeEntry(i + Date.now() % 1000));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveParticipationFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>(seedEntries);
  const seedRef = useRef(500);

  // Push a new entry every 2.8 seconds, keep max 12 in list
  useEffect(() => {
    const id = setInterval(() => {
      seedRef.current += 1;
      setEntries(prev => {
        const next = [makeEntry(seedRef.current), ...prev];
        return next.slice(0, 12);
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="glass-card-deep-space rounded-3xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
          <h3 className="text-base font-extrabold text-foreground">Participation Feed</h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono bg-muted/20 border border-border px-2.5 py-1 rounded-lg">
          Auto-updating
        </span>
      </div>

      {/* Feed list */}
      <div className="space-y-2 overflow-hidden" style={{ maxHeight: "340px" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map((entry) => {
            const Icon = entry.template.icon;
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto", marginBottom: 8 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${entry.template.bg}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-black/30`}>
                  <Icon className={`w-3.5 h-3.5 ${entry.template.color}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-tight">
                    <span className={`font-bold font-mono ${entry.template.color}`}>{entry.wallet}</span>
                    {" "}
                    <span className="text-muted-foreground">{entry.template.label}</span>
                  </p>
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-[10px] text-muted-foreground/60 font-mono whitespace-nowrap">
                  {entry.timeLabel}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-muted-foreground/50 mt-4 font-mono">
        Simulated activity feed for illustration · Real transactions on PolygonScan
      </p>
    </motion.div>
  );
}
