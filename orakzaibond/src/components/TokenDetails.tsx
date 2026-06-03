import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider } from "ethers";
import { useState } from "react";
import {
  Copy, ExternalLink, ArrowLeftRight, CheckCheck,
  Ticket, Car, Building2, Vote,
  Coins, Layers, Network, Hash, Database, TrendingUp,
  ChevronRight,
} from "lucide-react";

const TOKEN_ADDRESS = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const QUICKSWAP_URL =
  "https://dapp.quickswap.exchange/swap?type=v3&from=0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F&to=ETH";
const POLYGONSCAN_URL = `https://polygonscan.com/token/${TOKEN_ADDRESS}`;

interface TokenDetailsProps {
  provider: BrowserProvider | null;
}

// ── Utility cards ──────────────────────────────────────────────────────────────
const UTILITIES = [
  {
    icon: Ticket,
    title: "Lottery Entry",
    subtitle: "Capital Protected Participation",
    desc: "Buy Lottery entries with full capital protection. Every $10 ticket is 100% refundable via smart contract.",
    badge: "Live",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    glow: "hover:shadow-[0_0_28px_rgba(52,211,153,0.12)]",
  },
  {
    icon: Car,
    title: "OTC Mobility",
    subtitle: "Ride-Hailing & Transport",
    desc: "Future integration enabling OKBOND as the payment rail for OTC Transport — Orakzai's ride-hailing platform.",
    badge: "Soon",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    glow: "hover:shadow-[0_0_28px_rgba(96,165,250,0.12)]",
  },
  {
    icon: Building2,
    title: "Real Estate Shares",
    subtitle: "Orakzai Properties Backing",
    desc: "Token holders gain fractional digital backing by real estate assets under the Orakzai Properties portfolio.",
    badge: "Q3 2026",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
    glow: "hover:shadow-[0_0_28px_rgba(234,179,8,0.12)]",
  },
  {
    icon: Vote,
    title: "Welfare Governance",
    subtitle: "Community Voting Rights",
    desc: "OKBOND holders vote on community welfare projects, charitable distributions, and ecosystem development decisions.",
    badge: "Q4 2026",
    badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    glow: "hover:shadow-[0_0_28px_rgba(167,139,250,0.12)]",
  },
];

// ── Token specs ────────────────────────────────────────────────────────────────
const SPECS = [
  { icon: Coins,    label: "Name",         value: "Orakzai Bond" },
  { icon: Hash,     label: "Symbol",       value: "OKBOND",      mono: true },
  { icon: Network,  label: "Network",      value: "Polygon PoS" },
  { icon: Layers,   label: "Decimals",     value: "18",          mono: true },
  { icon: Database, label: "Total Supply", value: "10,000,000",  mono: true, tag: "Limited" },
];

// ── Price ladder ───────────────────────────────────────────────────────────────
const PRICE_STEPS = [
  { label: "Phase 1",       price: "$0.50", note: "ICO Live Now",    active: true,  pct: null },
  { label: "Phase 2",       price: "$0.25", note: "Locked",          active: false, pct: "+67%" },
  { label: "Phase 3",       price: "$0.50", note: "Locked",          active: false, pct: "+100%" },
  { label: "Listing Target",price: "$1.00", note: "Target",          active: false, pct: "+100%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function TokenDetails({ provider: _provider }: TokenDetailsProps) {
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    navigator.clipboard.writeText(TOKEN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const shortAddr = TOKEN_ADDRESS.slice(0, 10) + "…" + TOKEN_ADDRESS.slice(-8);

  return (
    <section id="token" className="py-24 relative overflow-hidden">
      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-primary/4 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* ── HEADING ──────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
          className="text-center mb-16">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            OKBOND Token
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
              Power of OKBOND
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            One token. Multiple real-world utilities. Built on Polygon PoS with full
            transparency, on-chain governance, and capital protection.
          </p>
        </motion.div>

        {/* ── UTILITY CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {UTILITIES.map((u, i) => (
            <motion.div key={u.title} custom={i} initial="hidden" whileInView="visible"
              viewport={{ once: true }} variants={fadeUp}
              className={`group relative flex flex-col p-6 rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 ${u.glow}`}>
              {/* Top row: icon + badge */}
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <u.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${u.badgeColor}`}>
                  {u.badge}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-[15px] mb-0.5">{u.title}</h3>
              <p className="text-[11px] text-primary/70 font-mono uppercase tracking-wide mb-3">{u.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">{u.desc}</p>
              {/* Bottom accent line */}
              <div className="mt-5 h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:via-primary/60 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* ── MIDDLE ROW: contract box + specs ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">

          {/* Contract address box — takes 3 cols */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="lg:col-span-3 rounded-2xl border border-primary/25 bg-[#050d1a] overflow-hidden relative">
            {/* Top glow band */}
            <div className="h-px bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />
            <div className="p-7">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-primary font-mono font-semibold uppercase tracking-widest">
                  Token Contract · Polygon PoS
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 font-mono mb-5">
                Verified on PolygonScan · Chainlink price feed ready · Audited
              </p>

              {/* Address display */}
              <div className="rounded-xl border border-primary/15 bg-black/40 p-4 mb-5 relative group">
                <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest mb-2">
                  Contract Address (ERC-20 · Polygon)
                </p>
                {/* Full on desktop, short on mobile */}
                <code className="text-primary font-mono text-sm hidden sm:block break-all leading-relaxed">
                  {TOKEN_ADDRESS}
                </code>
                <code className="text-primary font-mono text-sm sm:hidden">
                  {shortAddr}
                </code>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={copyAddress}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/30 bg-primary/8 text-primary font-semibold text-sm hover:bg-primary/20 hover:border-primary/60 transition-all duration-200 group">
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="ok" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }} className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }} className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Address
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <a href={POLYGONSCAN_URL} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-violet-500/30 bg-violet-500/8 text-violet-300 font-semibold text-sm hover:bg-violet-500/20 hover:border-violet-400/60 transition-all duration-200">
                  <ExternalLink className="w-4 h-4" />
                  View on PolygonScan
                </a>
              </div>

              {/* QuickSwap button */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <a href={QUICKSWAP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/18 hover:border-emerald-400/50 transition-all duration-200 group">
                  <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/8206.png"
                    alt="QuickSwap" className="w-5 h-5 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  Buy / Sell OKBOND on QuickSwap
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
                <p className="text-center text-[10px] text-muted-foreground/40 mt-2 font-mono">
                  QuickSwap V3 · Polygon PoS Network · Low Fees
                </p>
              </div>
            </div>
          </motion.div>

          {/* Token specs — takes 2 cols */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="font-bold text-foreground text-lg">Token Specifications</h3>
            </div>
            <div className="space-y-3 flex-1">
              {SPECS.map((s, i) => (
                <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} variants={fadeUp}
                  className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-background/60 border border-border/60 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.tag && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary/80 border border-primary/20">
                        {s.tag}
                      </span>
                    )}
                    <span className={`text-sm font-bold text-foreground ${s.mono ? "font-mono" : ""}`}>
                      {s.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Polygon badge */}
            <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              </div>
              <span className="text-xs text-muted-foreground/70 font-mono">Deployed on Polygon PoS — Chain ID 137</span>
            </div>
          </motion.div>
        </div>

        {/* ── PRICE LADDER ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[#0d0a00] via-[#0a0800] to-[#000] overflow-hidden relative">
          <div className="h-px bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-extrabold text-foreground">Price Step-Up Ladder</h3>
              <span className="text-xs text-primary/70 font-mono border border-primary/20 px-2 py-0.5 rounded-full">
                Phase 1 Active
              </span>
            </div>

            {/* Desktop: horizontal step-up */}
            <div className="hidden sm:flex items-end justify-between gap-3 mb-6">
              {PRICE_STEPS.map((step, i) => {
                const heights = ["h-16", "h-24", "h-36", "h-52"];
                return (
                  <motion.div key={step.label} custom={i} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} variants={fadeUp}
                    className="flex-1 flex flex-col items-center gap-3">
                    {/* Percentage pill above bar */}
                    {step.pct && (
                      <span className="text-[10px] font-bold text-primary/70 font-mono">
                        {step.pct}
                      </span>
                    )}
                    {/* Bar */}
                    <div className={`w-full ${heights[i]} rounded-t-xl relative overflow-hidden ${
                      step.active
                        ? "bg-gradient-to-t from-primary/80 to-primary/30 border border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        : "bg-gradient-to-t from-primary/20 to-primary/5 border border-primary/15"
                    }`}>
                      {step.active && (
                        <motion.div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"
                          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      )}
                      {i < PRICE_STEPS.length - 1 && (
                        <div className="absolute top-2 right-2">
                          <ChevronRight className="w-3 h-3 text-primary/40" />
                        </div>
                      )}
                    </div>
                    {/* Price */}
                    <p className={`text-2xl font-extrabold font-mono ${
                      step.active
                        ? "text-primary drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]"
                        : "text-muted-foreground/60"
                    }`}>
                      {step.price}
                    </p>
                    {/* Label + note */}
                    <div className="text-center">
                      <p className={`text-xs font-bold uppercase tracking-wider ${step.active ? "text-primary/80" : "text-muted-foreground/50"}`}>
                        {step.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 font-mono ${step.active ? "text-emerald-400" : "text-muted-foreground/40"}`}>
                        {step.note}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile: vertical stack */}
            <div className="sm:hidden space-y-3 mb-6">
              {PRICE_STEPS.map((step, i) => (
                <div key={step.label} className={`flex items-center justify-between p-3 rounded-xl border ${
                  step.active
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                    : "border-border/40 bg-card/40"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${step.active ? "bg-primary shadow-[0_0_8px_rgba(234,179,8,0.7)]" : "bg-primary/20"}`}
                      style={{ height: `${16 + i * 8}px` }} />
                    <div>
                      <p className={`text-xs font-bold uppercase ${step.active ? "text-primary" : "text-muted-foreground/60"}`}>{step.label}</p>
                      <p className={`text-[10px] font-mono ${step.active ? "text-emerald-400" : "text-muted-foreground/40"}`}>{step.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-extrabold font-mono ${step.active ? "text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" : "text-muted-foreground/50"}`}>
                      {step.price}
                    </p>
                    {step.pct && <p className="text-[10px] text-primary/60 font-mono">{step.pct}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-primary/10 text-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                <span className="text-sm text-primary font-semibold">Phase 1 is LIVE — $0.50</span>
              </div>
              <span className="text-muted-foreground/40 text-sm hidden sm:block">·</span>
              <span className="text-sm text-muted-foreground/70">
                Early buyers lock in the lowest price. Each phase closes permanently.
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
