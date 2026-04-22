import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Lock, Rocket, Globe,
  ShieldCheck, Coins, Ticket, ArrowUpRight, Layers,
  Flame, Heart, TrendingUp, Zap, Building2,
} from "lucide-react";

const PHASES = [
  {
    id: 1,
    phase: "Phase 1",
    title: "Foundation",
    subtitle: "Building the bedrock of trust",
    status: "active" as const,
    year: "2024–2025",
    items: [
      { label: "Smart Contract Audit", icon: ShieldCheck, done: true },
      { label: "ICO Phase 1 Launch ($0.15)", icon: Coins, done: false, active: true },
      { label: "Whitepaper Release", icon: Layers, done: true },
    ],
    nodeColor: "#EAB308",
    glowColor: "rgba(234,179,8,0.45)",
    accentBg: "from-primary/12 via-primary/6 to-transparent",
    borderActive: "border-primary/50",
    badgeBg: "bg-primary text-black",
    badgeText: "In Progress",
  },
  {
    id: 2,
    phase: "Phase 2",
    title: "Utility",
    subtitle: "Delivering real-world Web3 tools",
    status: "upcoming" as const,
    year: "2025–2026",
    items: [
      { label: "Live Lottery Dashboard", icon: Ticket, done: false },
      { label: "3-Level Referral System", icon: ArrowUpRight, done: false },
      { label: "OTC Mobility App Beta Integration", icon: Rocket, done: false },
    ],
    nodeColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.3)",
    accentBg: "from-amber-500/8 via-amber-500/4 to-transparent",
    borderActive: "border-amber-500/30",
    badgeBg: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    badgeText: "Upcoming",
  },
  {
    id: 3,
    phase: "Phase 3",
    title: "Expansion",
    subtitle: "Scaling into the real economy",
    status: "upcoming" as const,
    year: "2026",
    items: [
      { label: "Orakzai Properties Digital Shares", icon: Building2, done: false },
      { label: "Staking Rewards Launch", icon: TrendingUp, done: false },
      { label: "$1.00 Listing Target", icon: Zap, done: false },
    ],
    nodeColor: "#FB923C",
    glowColor: "rgba(251,146,60,0.3)",
    accentBg: "from-orange-500/8 via-orange-500/4 to-transparent",
    borderActive: "border-orange-500/30",
    badgeBg: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
    badgeText: "Upcoming",
  },
  {
    id: 4,
    phase: "Phase 4",
    title: "Legacy",
    subtitle: "Building generational impact",
    status: "upcoming" as const,
    year: "2027+",
    items: [
      { label: "Global Welfare Initiatives", icon: Heart, done: false },
      { label: "Token Buy-Back & Burn Program", icon: Flame, done: false },
      { label: "Orakzai Super App Launch", icon: Globe, done: false },
    ],
    nodeColor: "#EAB308",
    glowColor: "rgba(234,179,8,0.25)",
    accentBg: "from-primary/8 via-primary/4 to-transparent",
    borderActive: "border-primary/25",
    badgeBg: "bg-primary/10 text-primary/70 border border-primary/20",
    badgeText: "Future",
  },
];

export default function Roadmap() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="roadmap" className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#060818 0%,#04050f 60%,#060818 100%)" }}>

      {/* ── Ambient glows ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(234,179,8,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-20">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            The Journey Ahead
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Strategic{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
              Roadmap
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            A phased journey from foundation to global legacy — engineered for long-term value and community prosperity.
          </p>
        </motion.div>

        {/* ── Vertical Timeline ── */}
        <div className="relative max-w-3xl mx-auto">

          {/* ── Glowing vertical line ── */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px z-0">
            {/* Static dark line */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-amber-500/30 via-orange-500/20 to-primary/10" />
            {/* Animated glow pulse */}
            <motion.div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(234,179,8,0.7) 0%,rgba(245,158,11,0.5) 35%,rgba(249,115,22,0.3) 70%,rgba(234,179,8,0.1) 100%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          {/* ── Phase cards ── */}
          <div className="space-y-12 relative z-10">
            {PHASES.map((ph, i) => {
              const isHovered = hovered === ph.id;
              const isActive = ph.status === "active";
              return (
                <motion.div key={ph.id}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, delay: i * 0.12 }}
                  className="relative flex gap-0 md:gap-6 items-start">

                  {/* ── NODE dot ── */}
                  <div className="relative flex-shrink-0 w-12 md:w-1/2 flex justify-start md:justify-end md:pr-8">
                    {/* Node circle */}
                    <div className="relative z-20 mt-1.5">
                      <motion.div
                        animate={isActive
                          ? { boxShadow: [`0 0 10px ${ph.nodeColor}80`, `0 0 28px ${ph.nodeColor}cc`, `0 0 10px ${ph.nodeColor}80`] }
                          : { boxShadow: [`0 0 6px ${ph.nodeColor}40`, `0 0 14px ${ph.nodeColor}70`, `0 0 6px ${ph.nodeColor}40`] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${ph.nodeColor}30, ${ph.nodeColor}10)`,
                          borderColor: ph.nodeColor + (isActive ? "cc" : "66"),
                        }}>
                        {isActive ? (
                          <Clock className="w-5 h-5" style={{ color: ph.nodeColor }} />
                        ) : (
                          <Lock className="w-4 h-4" style={{ color: ph.nodeColor + "99" }} />
                        )}
                      </motion.div>
                      {/* Phase number badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold font-mono"
                        style={{ background: ph.nodeColor, color: "#000" }}>
                        {ph.id}
                      </div>
                    </div>
                    {/* Desktop: phase label to the left of node */}
                    <div className="hidden md:block absolute right-24 top-1 text-right">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/50">{ph.year}</p>
                    </div>
                  </div>

                  {/* ── Card ── */}
                  <div className="flex-1 md:pl-0 pl-4">
                    <motion.div
                      onMouseEnter={() => setHovered(ph.id)}
                      onMouseLeave={() => setHovered(null)}
                      animate={isHovered
                        ? { boxShadow: `0 0 40px ${ph.glowColor}, 0 0 80px ${ph.glowColor.replace("0.45", "0.15").replace("0.3", "0.1").replace("0.25", "0.08")}` }
                        : { boxShadow: isActive ? `0 0 20px ${ph.glowColor}` : "none" }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-2xl border bg-gradient-to-br ${ph.accentBg} p-6 transition-all duration-300 cursor-default
                        ${isActive ? ph.borderActive + " border" : "border " + ph.borderActive}
                        ${isHovered ? "border-opacity-100" : ""}
                      `}
                      style={{ borderColor: isHovered ? ph.nodeColor + "80" : undefined,
                               background: `linear-gradient(135deg, #0b0d22 0%, #080a1a 100%)`,
                               borderWidth: "1px",
                               borderStyle: "solid" }}>

                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                              style={{ color: ph.nodeColor }}>
                              {ph.phase}
                            </span>
                            <span className="text-muted-foreground/30 text-[10px]">·</span>
                            <span className="text-[10px] text-muted-foreground/50 font-mono">{ph.year}</span>
                          </div>
                          <h3 className="text-xl font-extrabold text-foreground leading-tight">{ph.title}</h3>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">{ph.subtitle}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${ph.badgeBg}`}>
                          {ph.status === "active" && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5 align-middle" />
                          )}
                          {ph.badgeText}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${ph.nodeColor}30, transparent)` }} />

                      {/* Items list */}
                      <ul className="space-y-3">
                        {ph.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isDone = item.done;
                          const isItemActive = "active" in item && item.active;
                          return (
                            <li key={item.label} className="flex items-center gap-3">
                              {/* Status icon */}
                              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{
                                  background: isDone
                                    ? `${ph.nodeColor}20`
                                    : isItemActive
                                    ? `${ph.nodeColor}15`
                                    : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${isDone ? ph.nodeColor + "50" : "rgba(255,255,255,0.06)"}`,
                                }}>
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" style={{ color: ph.nodeColor }} />
                                ) : isItemActive ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                                    <Clock className="w-3.5 h-3.5" style={{ color: ph.nodeColor + "cc" }} />
                                  </motion.div>
                                ) : (
                                  <ItemIcon className="w-3.5 h-3.5 text-muted-foreground/35" />
                                )}
                              </div>
                              {/* Label */}
                              <span className={`text-sm font-medium leading-tight ${
                                isDone
                                  ? "text-foreground"
                                  : isItemActive
                                  ? "text-foreground/80"
                                  : "text-muted-foreground/60"
                              }`}>
                                {item.label}
                                {isDone && (
                                  <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                    style={{ background: ph.nodeColor + "20", color: ph.nodeColor }}>
                                    Done
                                  </span>
                                )}
                                {isItemActive && (
                                  <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-amber-400 bg-amber-400/15">
                                    Active
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {/* Bottom hover glow line */}
                      <motion.div className="absolute bottom-0 left-4 right-4 h-px rounded-full"
                        style={{ background: `linear-gradient(90deg, transparent, ${ph.nodeColor}${isHovered ? "80" : "20"}, transparent)` }}
                        animate={{ opacity: isHovered ? 1 : 0.4 }}
                        transition={{ duration: 0.3 }} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Timeline end node ── */}
          <div className="relative flex justify-start md:justify-center ml-3 md:ml-0 mt-8 z-10">
            <motion.div
              animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.3)", "0 0 20px rgba(234,179,8,0.6)", "0 0 8px rgba(234,179,8,0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-6 h-6 rounded-full border-2 border-primary/50 bg-primary/15 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* ── Community disclaimer ── */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-muted-foreground/45 font-mono max-w-xl mx-auto mt-14 leading-relaxed">
          Roadmap is subject to community feedback and market conditions to ensure maximum profit for OKBOND holders.
        </motion.p>

      </div>
    </section>
  );
}
