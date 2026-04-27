import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, Zap, Globe, ArrowRight, Users, Target,
  TrendingUp, Lock, Layers, CheckCircle, ExternalLink, ArrowLeft,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Shield, title: "Decentralized Security",
    description: "Built on immutable Polygon blockchain. No central authority controls your assets — your keys, your wealth." },
  { icon: Zap,    title: "Staking & Yield",
    description: "Lock OKBOND tokens in high-yield staking pools and earn passive income. Power your portfolio while you sleep." },
  { icon: Globe,  title: "Global Investment Pools",
    description: "Participate in community-governed investment pools spanning global markets, open to anyone, anywhere." },
  { icon: Lock,   title: "Liquidity-Backed Capital Retention Model",
    description: "Every entry in the OKBOND lottery is fully refundable. Your $10 is safe — always." },
  { icon: Layers, title: "Multi-Industry Ecosystem",
    description: "250+ real-world projects across energy, media, tech and finance — all powered by a single token." },
  { icon: TrendingUp, title: "567% ROI Potential",
    description: "Buy at $0.15 ICO Phase 1, list at $1.00 — that's a 567% return for early believers." },
];

const LOCATIONS: [number, number, string, boolean][] = [
  [58.5, 41,   "Karachi — Global HQ", true],
  [47.5, 28,   "London",              false],
  [24,   33,   "New York",            false],
  [55.5, 40,   "Dubai",               false],
  [68,   54,   "Singapore",           false],
  [77,   32,   "Tokyo",               false],
  [79,   68,   "Sydney",              false],
  [48,   45,   "Frankfurt",           false],
  [34,   60,   "Toronto",             false],
  [50,   57,   "Moscow",              false],
  [62,   29,   "New Delhi",           false],
  [40,   55,   "Istanbul",            false],
];

const CONTINENTS = [
  "M 14 22 L 28 18 L 36 22 L 38 30 L 34 40 L 26 44 L 18 42 L 12 36 L 10 28 Z",
  "M 24 46 L 32 44 L 36 52 L 34 64 L 28 72 L 22 68 L 18 58 L 20 50 Z",
  "M 44 20 L 56 18 L 58 24 L 54 30 L 48 32 L 42 28 L 42 22 Z",
  "M 44 32 L 56 30 L 60 38 L 58 52 L 54 62 L 48 64 L 42 58 L 40 46 L 42 36 Z",
  "M 56 18 L 82 16 L 84 24 L 80 32 L 72 38 L 64 40 L 58 36 L 54 28 L 56 20 Z",
  "M 72 60 L 84 58 L 86 66 L 80 70 L 72 68 L 70 62 Z",
  "M 30 8 L 42 6 L 44 14 L 36 16 L 28 14 Z",
];

const values = [
  { icon: CheckCircle, label: "Transparency", desc: "All contracts are open-source and verified on PolygonScan." },
  { icon: Users,       label: "Community First", desc: "Token holders vote on major decisions via on-chain governance." },
  { icon: Target,      label: "Real Utility",    desc: "OKBOND is the fuel for 250+ projects — not just speculation." },
  { icon: Shield,      label: "Protection",      desc: "Capital protection is hardcoded into the lottery smart contract." },
];

export default function AboutPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <main className="flex-1">
        {/* ── Exit Button ───────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-12 pt-6">
          <Link href="/">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.span>
          </Link>
        </div>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(234,179,8,0.09),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary/10 animate-pulse"
              style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            About Orakzai Bond
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
              Orakzai Global
            </span>
            <br />Network
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Orakzai Bond is a decentralized financial platform engineered for staking, investment pools, and token
            utilities — empowering global investors with blockchain-based opportunities on Polygon PoS.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center">
            <Link href="/ico">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer">
                Join ICO Now <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/founder">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                Meet the Founder <ExternalLink className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ROW (4 Pillars Update) ────────────────────────────────────────────── */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "250+",   label: "Future Projects" },
            { value: "10M",    label: "Total Supply" },
            { value: "$0.15",  label: "ICO Phase 1 Price" },
            { value: "567%",   label: "Target ROI" },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-primary/20 bg-card p-5 text-center">
              <p className="text-3xl font-extrabold text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WORLD MAP ──────────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full rounded-3xl border border-primary/20 bg-black/60 backdrop-blur overflow-hidden p-4">
            <div className="absolute" style={{ left: "58.5%", top: "41%", transform: "translate(-50%,-50%)", width: 260, height: 260,
              background: "radial-gradient(circle, rgba(234,179,8,0.18) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(8px)", pointerEvents: "none" }} />
            <svg viewBox="0 0 100 80" className="w-full" style={{ maxHeight: 380 }}>
              {[20, 40, 60].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />)}
              {[25, 50, 75].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />)}
              {CONTINENTS.map((d, i) => <path key={i} d={d} fill="rgba(234,179,8,0.07)" stroke="rgba(234,179,8,0.18)" strokeWidth="0.4" />)}
              {LOCATIONS.filter(l => !l[3]).map(([cx, cy], i) => (
                <motion.line key={i} x1={58.5} y1={41} x2={cx} y2={cy}
                  stroke="rgba(234,179,8,0.18)" strokeWidth="0.25" strokeDasharray="1 1.5"
                  initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3 + i * 0.1 }} />
              ))}
              {LOCATIONS.map(([cx, cy, label, isHQ], i) => (
                <g key={label}>
                  {isHQ && (
                    <motion.circle cx={cx} cy={cy} r={4} fill="none" stroke="rgba(234,179,8,0.5)" strokeWidth="0.4"
                      style={{ originX: `${cx}px`, originY: `${cy}px` }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                  )}
                  <motion.circle cx={cx} cy={cy} r={isHQ ? 1.4 : 0.85}
                    fill={isHQ ? "hsl(43,96%,56%)" : "rgba(234,179,8,0.7)"}
                    initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}
                    style={{ filter: isHQ ? "drop-shadow(0 0 2px rgba(234,179,8,0.9))" : "drop-shadow(0 0 1px rgba(234,179,8,0.5))" }} />
                </g>
              ))}
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDER & MISSION (Restored Content) ────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-primary/20 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">The Founder</h3>
            </div>
            <p className="text-primary font-semibold mb-3 text-sm uppercase tracking-wide">
              Faisal Orakzai
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              A Global Visionary and Architect of the Orakzai Group — Faisal Orakzai has built a multi-industry conglomerate from the ground up in Karachi, Pakistan, expanding its reach to international blockchain innovation. His journey reflects the leap from local leadership to building a decentralized global ecosystem designed for the next generation.
            </p>
            <Link href="/founder">
              <span className="inline-flex items-center gap-2 mt-5 text-sm text-primary font-semibold hover:underline cursor-pointer">
                Read Full Story →
              </span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become a leading Web3 financial ecosystem — where OKBOND is the currency of power, and every holder is a sovereign participant in a future built on trust, transparency, and unstoppable code.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="p-6 rounded-2xl border border-border bg-card/50 hover:border-primary/30 transition-all">
                <v.icon className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">{v.label}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
