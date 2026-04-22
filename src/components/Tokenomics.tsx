import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from "recharts";
import { Lock, Info, TrendingUp, CheckCircle2, ShieldCheck } from "lucide-react";

const SLICES = [
  {
    label: "Staking Rewards",
    pct: 28,
    desc: "Yield for long-term holders",
    color: "#EAB308",
    glow: "rgba(234,179,8,0.55)",
    barFrom: "#EAB308",
    barTo: "#F59E0B",
    badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
    locked: false,
  },
  {
    label: "Community & Ecosystem",
    pct: 20,
    desc: "Marketing and partnerships",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.5)",
    barFrom: "#F59E0B",
    barTo: "#FB923C",
    badge: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    locked: false,
  },
  {
    label: "Liquidity Pool",
    pct: 20,
    desc: "Locked for price stability",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.45)",
    barFrom: "#FBBF24",
    barTo: "#F97316",
    badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    locked: false,
  },
  {
    label: "Development",
    pct: 12,
    desc: "Orakzai Group Tech & Infrastructure",
    color: "#FB923C",
    glow: "rgba(249,115,22,0.45)",
    barFrom: "#FB923C",
    barTo: "#EA580C",
    badge: "bg-orange-400/15 text-orange-300 border-orange-400/30",
    locked: false,
  },
  {
    label: "Team & Advisors",
    pct: 8,
    desc: "Core project management",
    color: "#F97316",
    glow: "rgba(249,115,22,0.4)",
    barFrom: "#F97316",
    barTo: "#C2410C",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    locked: false,
  },
  {
    label: "Team Lock-up",
    pct: 6,
    desc: "Frozen for 12 months",
    color: "#EA580C",
    glow: "rgba(234,88,12,0.4)",
    barFrom: "#EA580C",
    barTo: "#9A3412",
    badge: "bg-orange-600/15 text-orange-400 border-orange-600/30",
    locked: true,
  },
  {
    label: "Public Sale",
    pct: 6,
    desc: "Exclusive Phase 1-3 access",
    color: "#FDE68A",
    glow: "rgba(253,230,138,0.5)",
    barFrom: "#FDE68A",
    barTo: "#EAB308",
    badge: "bg-yellow-200/10 text-yellow-200 border-yellow-300/25",
    locked: false,
  },
];

const STATS = [
  { label: "Total Supply",    value: "10,000,000",  sub: "OKBOND" },
  { label: "Token Standard",  value: "ERC-20",       sub: "Polygon PoS" },
  { label: "Decimals",        value: "18",            sub: "precision" },
  { label: "Distribution",    value: "100%",          sub: "fully allocated" },
];

/* ── Active Pie Sector (expanded wedge on hover) ── */
function ActiveShape(props: Record<string, number | string>) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill,
  } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number;
    startAngle: number; endAngle: number; fill: string;
  };
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 10}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 12px ${fill})` }}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={(outerRadius as number) + 14}
        outerRadius={(outerRadius as number) + 18}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
}

/* ── Custom Tooltip ── */
function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: typeof SLICES[0] }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-primary/30 bg-[#0e1020] shadow-2xl px-4 py-3 min-w-[160px]">
      <p className="text-xs font-extrabold text-primary mb-1">{d.label}</p>
      <p className="text-2xl font-extrabold font-mono text-foreground">{d.pct}%</p>
      <p className="text-[10px] text-muted-foreground mt-1">{d.desc}</p>
      {d.locked && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-400">
          <Lock className="w-3 h-3" /> 12-month lock-up
        </div>
      )}
    </div>
  );
}

export default function Tokenomics() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section id="tokenomics" className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #07091a 0%, #050712 60%, #030510 100%)" }}>

      {/* ── Ambient glows ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_20%_0%,rgba(234,179,8,0.07),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_80%_100%,rgba(249,115,22,0.05),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(234,179,8,0.03),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-14">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            Token Distribution
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            OKBOND{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
              Tokenomics
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            A transparent, community-first token distribution engineered for long-term sustainability and institutional-grade trust.
          </p>
        </motion.div>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-primary/15 bg-[#0b0d22]/80 px-5 py-4 text-center hover:border-primary/30 hover:shadow-[0_0_18px_rgba(234,179,8,0.08)] transition-all">
              <p className="text-[10px] text-primary/50 uppercase tracking-widest font-bold mb-1">{s.label}</p>
              <p className="text-xl font-extrabold text-primary font-mono">{s.value}</p>
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{s.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Dashboard: Pie + Bars ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">

          {/* LEFT — Pie Chart ─────────────────────────────── */}
          <div className="rounded-3xl border border-primary/15 bg-[#0b0d22]/90 p-7 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
              <div>
                <p className="text-[10px] text-primary/50 uppercase tracking-widest font-bold mb-0.5">Distribution</p>
                <h3 className="font-extrabold text-foreground text-lg">Token Allocation</h3>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-mono">
                10M OKBOND
              </div>
            </div>

            {/* Recharts Pie */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SLICES}
                    cx="50%" cy="50%"
                    innerRadius="52%"
                    outerRadius="76%"
                    dataKey="pct"
                    nameKey="label"
                    activeIndex={activeIdx ?? undefined}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    activeShape={ActiveShape as any}
                    onMouseEnter={(_, idx) => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    strokeWidth={0}
                  >
                    {SLICES.map((s, i) => (
                      <Cell key={s.label} fill={s.color}
                        opacity={activeIdx === null || activeIdx === i ? 1 : 0.45}
                        style={{ cursor: "pointer", transition: "opacity 0.2s" }} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centre label overlay (absolute centering) */}
            <div className="relative -mt-[9rem] mb-8 flex flex-col items-center justify-center pointer-events-none h-0">
              <AnimatePresence mode="wait">
                {activeIdx !== null ? (
                  <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="text-center">
                    <p className="text-3xl font-extrabold font-mono" style={{ color: SLICES[activeIdx].color }}>
                      {SLICES[activeIdx].pct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {SLICES[activeIdx].label}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-3xl font-extrabold font-mono text-primary">100%</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Allocated</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Legend dots */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
              {SLICES.map((s, i) => (
                <button key={s.label} onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}
                  className="flex items-center gap-2 text-left group">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all group-hover:scale-125"
                    style={{ background: s.color, boxShadow: `0 0 6px ${s.glow}` }} />
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-mono">
                    {s.label} <span className="text-primary/60">{s.pct}%</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Progress Bars ────────────────────────── */}
          <div className="rounded-3xl border border-primary/15 bg-[#0b0d22]/90 p-7 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
              <div>
                <p className="text-[10px] text-primary/50 uppercase tracking-widest font-bold mb-0.5">Breakdown</p>
                <h3 className="font-extrabold text-foreground text-lg">Allocation Share</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                100% Verified
              </div>
            </div>

            <div className="space-y-5">
              {SLICES.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                  className={`transition-all duration-200 ${activeIdx !== null && activeIdx !== i ? "opacity-50" : "opacity-100"}`}>
                  {/* Label row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color, boxShadow: `0 0 6px ${s.glow}` }} />
                      <span className="text-sm font-semibold text-foreground">{s.label}</span>
                      {s.locked && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-[9px] font-bold text-orange-400">
                          <Lock className="w-2.5 h-2.5" /> LOCKED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground/60 hidden sm:block">{s.desc}</span>
                      <span className="text-sm font-extrabold font-mono" style={{ color: s.color }}>
                        {s.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Track */}
                  <div className="relative h-4 w-full rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Shimmer */}
                    <motion.div className="absolute inset-0 rounded-full"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)", width: "60%" }} />
                    {/* Fill bar */}
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${s.barFrom}, ${s.barTo})`, boxShadow: `0 0 10px ${s.glow}, 0 0 3px ${s.glow}` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }} />
                  </div>

                  {/* Token count */}
                  <p className="text-[9px] text-muted-foreground/45 font-mono mt-1 text-right">
                    {(10_000_000 * s.pct / 100).toLocaleString()} OKBOND
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Total row */}
            <div className="mt-5 pt-4 border-t border-primary/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Distributed</span>
              </div>
              <span className="text-base font-extrabold font-mono text-primary">100% / 100%</span>
            </div>
          </div>
        </motion.div>

        {/* ── Transparency Note ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.2 }}
          className="max-w-6xl mx-auto mt-6">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-[#0c0e22] via-[#0d1025] to-[#0c0e22] p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Transparency Note</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                <span className="font-extrabold text-primary">6% Public Sale</span> ensures a low circulating supply, driving{" "}
                <span className="font-semibold text-foreground">high demand and value</span> for early investors. With only{" "}
                <span className="font-bold text-primary font-mono">600,000 OKBOND</span> available at launch, Phase 1 buyers
                benefit from maximum scarcity — a proven mechanism for price appreciation in high-conviction token launches.
              </p>
            </div>
            {/* Badges */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 bg-primary/8 text-[10px] font-bold text-primary">
                <Info className="w-3 h-3" /> Low Circulating Supply
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 text-[10px] font-bold text-emerald-400">
                <TrendingUp className="w-3 h-3" /> High Demand Mechanism
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
