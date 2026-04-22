/**
 * ICOModule — Isolated ICO + MLM Referral widget
 * Drop-in component: <ICOModule provider={...} address={...} onConnect={...}
 *                                referrer={...} isPolygon={...} switchToPolygon={...} />
 * Does NOT modify any existing component. Reads useICO hook only.
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider } from "ethers";
import {
  Rocket, Wallet, Copy, Check, ExternalLink, AlertTriangle,
  Loader2, TrendingUp, Users, Gift, ShieldCheck, ArrowRight,
  RefreshCw, CheckCircle2, XCircle,
  Zap, Clock, Lock, Target,
} from "lucide-react";
import { useICO } from "@/hooks/useICO";
import ReferralDashboard from "@/components/ReferralDashboard";

const SITE_URL = "https://orakzaibond.com";
const POLYGON_SCAN = "https://polygonscan.com/tx/";
const ICO_CONTRACT_ADDRESS = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
const TOKEN_PRICE_USD = 0.15;
const TOKENS_PER_POL  = 0.6;

// Phase 1 closes 60 days from April 10, 2026
const PHASE1_END = new Date("2026-06-09T00:00:00Z").getTime();
const PHASE1_SUPPLY = 75_000;

const ICO_PHASES = [
  { id: 1, label: "Phase 1", status: "live",     price: "$0.15", supply: "75,000 OKBOND", badge: "LIVE NOW",
    badgeColor: "bg-emerald-500", borderColor: "border-emerald-500/50", glow: "shadow-emerald-500/20", desc: "Lowest entry — open now" },
  { id: 2, label: "Phase 2", status: "upcoming", price: "$0.25", supply: "75,000 OKBOND", badge: "LOCKED",
    badgeColor: "bg-amber-500/80",  borderColor: "border-amber-500/30",  glow: "shadow-amber-500/10",  desc: "67% premium over Phase 1" },
  { id: 3, label: "Phase 3", status: "upcoming", price: "$0.50", supply: "Remaining",     badge: "LOCKED",
    badgeColor: "bg-primary/70",    borderColor: "border-primary/30",    glow: "shadow-primary/10",    desc: "Final sale before listing" },
] as const;

// ── Countdown helpers ──────────────────────────────────────────────────────────
function useCountdown(target: number) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1_000);
    return () => clearInterval(id);
  });
  return tick;
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: 60, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-12 sm:w-14 h-11 sm:h-12 flex items-center justify-center rounded-xl bg-black/60 border border-primary/30 font-mono font-extrabold text-xl sm:text-2xl text-primary"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
    </div>
  );
}

interface ICOModuleProps {
  provider:        BrowserProvider | null;
  address:         string | null;
  onConnect:       () => void;
  referrer:        string | null;
  isPolygon:       boolean;
  switchToPolygon: () => void;
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function fmt(n: string, dp = 4): string {
  const f = parseFloat(n);
  if (isNaN(f)) return "0";
  if (f === 0) return "0";
  return f.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: dp });
}

function pct(raised: string, cap: string): number {
  const r = parseFloat(raised);
  const c = parseFloat(cap);
  if (!c || !r) return 0;
  return Math.min((r / c) * 100, 100);
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color = "primary",
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color?: "primary" | "emerald" | "purple" | "blue";
}) {
  const colours = {
    primary: "from-primary/15 to-primary/5 border-primary/20 text-primary",
    emerald: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    purple:  "from-purple-500/15 to-purple-500/5 border-purple-500/20 text-purple-400",
    blue:    "from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-400",
  };
  return (
    <div className={`glass-card rounded-2xl border p-4 bg-gradient-to-br ${colours[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{label}</span>
        <span className={colours[color].split(" ").pop()}>{icon}</span>
      </div>
      <p className="text-xl font-extrabold text-foreground leading-none">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1 font-mono">{sub}</p>}
    </div>
  );
}

// ── ICO Countdown strip ───────────────────────────────────────────────────────
function ICOCountdown() {
  const cd = useCountdown(PHASE1_END);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl border border-primary/30 p-5 mb-5 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 text-center"
    >
      <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-4">
        <Clock className="w-3.5 h-3.5" />
        Phase 1 Closes In
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <CountBox value={cd.days}    label="Days" />
        <span className="text-xl font-bold text-primary/50 pb-4">:</span>
        <CountBox value={cd.hours}   label="Hours" />
        <span className="text-xl font-bold text-primary/50 pb-4">:</span>
        <CountBox value={cd.minutes} label="Mins" />
        <span className="text-xl font-bold text-primary/50 pb-4">:</span>
        <CountBox value={cd.seconds} label="Secs" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        After Phase 1 closes, price moves to <strong className="text-amber-400">$0.25</strong>
      </p>
    </motion.div>
  );
}

// ── 3-Phase cards ─────────────────────────────────────────────────────────────
function ICOPhaseCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
    >
      {ICO_PHASES.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 * i }}
          className={`relative glass-card rounded-2xl border ${p.borderColor} p-5 shadow-lg ${p.glow} ${p.status === "live" ? "ring-1 ring-emerald-500/30" : ""}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.label}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${p.badgeColor} ${p.status === "live" ? "text-black" : "text-foreground/80"}`}>
              {p.badge}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-foreground font-mono">{p.price}</p>
          <p className="text-[10px] text-muted-foreground mb-2">per OKBOND</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Rocket className="w-3 h-3 text-primary/50" />
            {p.supply}
          </div>
          {p.status === "upcoming" && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Lock className="w-3 h-3" /> Unlocks after Phase {p.id - 1}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/70 border-t border-white/5 pt-2 mt-2">{p.desc}</p>
          {p.status === "live" && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Referral Profit Calculator ────────────────────────────────────────────────
function ReferralCalculator() {
  const [investors, setInvestors] = useState("");
  const [result, setResult]       = useState<{ l1: number; l2: number; l3: number; total: number } | null>(null);

  const INVESTMENT = 10; // base investment per person in USD

  const calculate = () => {
    const n = parseFloat(investors);
    if (!n || n <= 0) return;
    const l1 = n * INVESTMENT * 0.05;
    const l2 = n * INVESTMENT * 0.03;
    const l3 = n * INVESTMENT * 0.02;
    setResult({ l1, l2, l3, total: l1 + l2 + l3 });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") calculate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-3xl border border-primary/20 p-6 bg-gradient-to-br from-primary/6 to-transparent"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-extrabold text-foreground">Referral Profit Calculator</h3>
          <p className="text-xs text-muted-foreground">Estimate your 3-level MLM earnings</p>
        </div>
        <div className="ml-auto px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/25 text-primary text-[10px] font-extrabold tracking-widest">
          📊 LIVE CALC
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input side */}
        <div className="space-y-4">
          {/* Commission levels info */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { level: "L1", pct: "5%", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
              { level: "L2", pct: "3%", color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
              { level: "L3", pct: "2%", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
            ].map((l) => (
              <div key={l.level} className={`text-center p-2.5 rounded-xl border ${l.bg}`}>
                <p className={`text-xs font-extrabold ${l.color}`}>{l.level}</p>
                <p className={`text-lg font-extrabold ${l.color}`}>{l.pct}</p>
                <p className="text-[9px] text-muted-foreground font-mono">commission</p>
              </div>
            ))}
          </div>

          {/* Investor input */}
          <div>
            <label className="text-xs text-muted-foreground font-semibold mb-2 block">
              How many investors can your team bring?
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={investors}
                onChange={(e) => setInvestors(e.target.value)}
                onKeyDown={handleKey}
                className="flex-1 px-4 py-3 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 focus:border-primary/50 outline-none text-foreground font-mono text-sm transition-all"
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={calculate}
                disabled={!investors || parseFloat(investors) <= 0}
                className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm
                  hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all
                  shadow-[0_0_16px_rgba(234,179,8,0.3)] hover:shadow-[0_0_28px_rgba(234,179,8,0.5)]"
              >
                Calculate
              </motion.button>
            </div>
            {/* Quick picks */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {["5", "10", "25", "50", "100"].map((v) => (
                <button
                  key={v}
                  onClick={() => { setInvestors(v); setResult(null); }}
                  className="px-3 py-1 rounded-lg bg-muted/30 border border-border hover:border-primary/30 hover:bg-primary/8 text-xs text-muted-foreground hover:text-primary transition-all font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 font-mono">
            * Based on $10 average investment per person · 3-level MLM structure
          </p>
        </div>

        {/* Result side */}
        <div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-7 h-7 text-primary/40" />
                </div>
                <p className="text-sm text-muted-foreground">Enter number of investors and press Calculate</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Level results */}
                {[
                  { label: "Level 1 (5%)", value: result.l1,  color: "text-yellow-400", bg: "from-yellow-400/12 border-yellow-400/20" },
                  { label: "Level 2 (3%)", value: result.l2,  color: "text-amber-400",  bg: "from-amber-400/12 border-amber-400/20" },
                  { label: "Level 3 (2%)", value: result.l3,  color: "text-orange-400", bg: "from-orange-400/12 border-orange-400/20" },
                ].map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border bg-gradient-to-r to-transparent ${row.bg}`}
                  >
                    <span className="text-sm text-muted-foreground font-medium">{row.label}</span>
                    <span className={`font-extrabold font-mono text-lg ${row.color}`}>
                      ${row.value.toFixed(2)}
                    </span>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="border-t border-primary/20 pt-3">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/8 border border-primary/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                  >
                    <div>
                      <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">Total Potential Profit</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">from {investors} investors</p>
                    </div>
                    <span className="text-2xl font-extrabold text-primary font-mono">
                      ${result.total.toFixed(2)}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ICOModule({
  provider, address, onConnect, referrer, isPolygon, switchToPolygon,
}: ICOModuleProps) {
  const { stats, userStats, loading, txStatus, txHash, txError, buyTokens, resetTx, refresh } = useICO(provider, address);

  const [polInput, setPolInput]     = useState("");
  const [refCopied, setRefCopied]   = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  // Computed token estimate — fixed rate: 1 POL = 0.6 OKBOND
  const tokensEst = (() => {
    const pol = parseFloat(polInput);
    if (!pol || isNaN(pol) || pol <= 0) return null;
    const tokens = pol * TOKENS_PER_POL;
    const usdValue = tokens * TOKEN_PRICE_USD;
    return { tokens: tokens.toFixed(4), usd: usdValue.toFixed(2) };
  })();

  // Referral link
  const referralLink = address
    ? `${SITE_URL}/?ref=${address}`
    : null;

  const copyReferral = useCallback(async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2500);
  }, [referralLink]);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setAddrCopied(true);
    setTimeout(() => setAddrCopied(false), 2000);
  }, [address]);

  const handleBuy = useCallback(async () => {
    const pol = parseFloat(polInput);
    if (!pol || pol <= 0) return;
    await buyTokens(polInput, referrer);
  }, [polInput, referrer, buyTokens]);

  // Progress bar values
  const raisedPct = pct(stats?.totalRaisedPOL ?? "0", stats?.hardCap ?? "0");
  const softPct   = pct(stats?.softCap ?? "0",        stats?.hardCap ?? "0");

  return (
    <section id="ico" className="py-20 px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(234,179,8,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(168,85,247,0.04),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-5">
            <Rocket className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold uppercase tracking-widest">Initial Coin Offering</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            OKBOND{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
              ICO
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Purchase OKBOND tokens directly from the smart contract on Polygon PoS. Earn referral rewards by sharing your unique link.
          </p>

          {/* Price ticker — always visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-5 inline-flex flex-wrap items-center justify-center gap-3"
          >
            {/* Main price pill */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <div className="text-center">
                <p className="text-[9px] text-primary/70 uppercase tracking-widest font-bold">Token Price</p>
                <p className="text-2xl font-extrabold text-primary leading-none">$0.15</p>
                <p className="text-[9px] text-primary/60 font-mono">per OKBOND</p>
              </div>
              <div className="w-px h-10 bg-primary/20" />
              <div className="text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Fixed Rate</p>
                <p className="text-lg font-extrabold text-foreground leading-none">1 POL</p>
                <p className="text-[9px] text-muted-foreground font-mono">=</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-primary/70 uppercase tracking-widest font-bold">You Get</p>
                <p className="text-lg font-extrabold text-primary leading-none">0.6 OKBOND</p>
                <p className="text-[9px] text-primary/60 font-mono">tokens</p>
              </div>
            </div>

            {/* Network badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-purple-300 font-semibold">Polygon PoS</span>
            </div>
          </motion.div>

          {/* ICO status badge */}
          {!loading && stats && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold
                ${stats.icoActive
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-red-500/15 border-red-500/40 text-red-400"
                }`}>
                <span className={`w-2 h-2 rounded-full ${stats.icoActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                ICO {stats.icoActive ? "Active — Open for Investment" : "Paused"}
              </span>
              <button
                onClick={refresh}
                className="p-2 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                title="Refresh stats"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Target listing price pill ──────────────────────────────────── */}
          <div className="mt-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-primary/40 bg-primary/10">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Target Listing Price</span>
              <span className="text-xl font-extrabold text-primary font-mono">$1.00</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                +567% from Phase 1
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Countdown Timer ──────────────────────────────────────────────── */}
        <ICOCountdown />

        {/* ── 3 Phase Cards ────────────────────────────────────────────────── */}
        <ICOPhaseCards />

        {/* ── View Full Dashboard CTA ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <a
            href="/ico"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/40 text-primary font-bold text-sm hover:border-primary/70 hover:from-primary/30 hover:to-amber-500/30 transition-all shadow-[0_0_16px_rgba(234,179,8,0.15)] hover:shadow-[0_0_28px_rgba(234,179,8,0.3)]"
          >
            <Rocket className="w-4 h-4" />
            View Full ICO Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground text-sm">Loading ICO data from Polygon…</span>
          </div>
        )}

        {!loading && stats && (
          <>
            {/* ── Progress Section ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-3xl border border-border/60 p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Fundraising Progress</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {fmt(stats.totalRaisedPOL, 2)} POL raised of {fmt(stats.hardCap, 0)} POL hard cap
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">{raisedPct.toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground font-mono">funded</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 bg-muted/40 rounded-full overflow-hidden border border-border/40">
                {softPct > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/60 z-10"
                    style={{ left: `${softPct}%` }}
                    title={`Soft cap: ${fmt(stats.softCap, 0)} POL`}
                  />
                )}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${raisedPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-yellow-300 to-primary shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                <span>0 POL</span>
                {parseFloat(stats.softCap) > 0 && (
                  <span className="text-yellow-400">Soft Cap: {fmt(stats.softCap, 0)} POL</span>
                )}
                <span>Hard Cap: {fmt(stats.hardCap, 0)} POL</span>
              </div>

              {/* Phase 1 token progress */}
              {(() => {
                const sold   = Math.min(parseFloat(stats.totalTokensSold) || 0, PHASE1_SUPPLY);
                const p1pct  = Math.min((sold / PHASE1_SUPPLY) * 100, 100);
                return (
                  <div className="mt-5 pt-4 border-t border-primary/15">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-foreground">Phase 1 Token Sale</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 font-mono">{p1pct.toFixed(1)}% filled</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-black/40 border border-emerald-500/20 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p1pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 via-emerald-400 to-amber-400"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                      <span>{sold.toLocaleString()} OKBOND sold</span>
                      <span>{PHASE1_SUPPLY.toLocaleString()} total</span>
                    </div>
                  </div>
                );
              })()}

              {/* Quick stat row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <StatCard
                  label="Total Raised"
                  value={`${fmt(stats.totalRaisedPOL, 2)} POL`}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="primary"
                />
                <StatCard
                  label="Tokens Sold"
                  value={parseFloat(stats.totalTokensSold) > 0 ? `${fmt(stats.totalTokensSold, 0)} OKBOND` : "—"}
                  icon={<Zap className="w-4 h-4" />}
                  color="purple"
                />
                <StatCard
                  label="Rate (Fixed)"
                  value="0.6 / POL"
                  sub="$0.15 per OKBOND"
                  icon={<Gift className="w-4 h-4" />}
                  color="emerald"
                />
                <StatCard
                  label="Min Buy"
                  value={parseFloat(stats.minContribution) > 0 ? `${fmt(stats.minContribution, 4)} POL` : "—"}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  color="blue"
                />
              </div>
            </motion.div>

            {/* ── Buy + Referral Grid ───────────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">

              {/* ── Buy Tokens Card ───────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-3xl border border-primary/20 p-6 bg-gradient-to-br from-primary/8 to-transparent"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground">Buy OKBOND Tokens</h3>
                    <p className="text-xs text-muted-foreground">Pay with POL on Polygon PoS</p>
                  </div>
                </div>

                {/* Wallet not connected */}
                {!address && (
                  <div className="text-center py-6">
                    <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">Connect your wallet to buy OKBOND tokens</p>
                    <button
                      onClick={onConnect}
                      className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.35)] hover:-translate-y-0.5"
                    >
                      Connect MetaMask
                    </button>
                  </div>
                )}

                {/* Wrong network */}
                {address && !isPolygon && (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">Switch to Polygon network to participate in the ICO</p>
                    <button
                      onClick={switchToPolygon}
                      className="px-6 py-3 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-sm hover:bg-yellow-500/30 transition-all"
                    >
                      Switch to Polygon
                    </button>
                  </div>
                )}

                {/* Buy form — always shown when wallet connected on Polygon */}
                {address && isPolygon && txStatus === "idle" && (
                  <div className="space-y-4">
                    {/* Referrer indicator */}
                    {referrer && referrer.toLowerCase() !== address.toLowerCase() && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                        <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                        Referral active:{" "}
                        <span className="font-mono">{referrer.slice(0, 8)}…{referrer.slice(-6)}</span>
                      </div>
                    )}

                    {/* Fixed rate badge */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs">
                      <span className="text-muted-foreground">Fixed ICO Price</span>
                      <span className="font-extrabold text-emerald-400 font-mono">1 POL = 0.6 OKBOND = $0.15/token</span>
                    </div>

                    {/* POL amount input */}
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold mb-2 block">
                        Amount to spend (POL)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={`Min: ${parseFloat(stats.minContribution) > 0 ? stats.minContribution : "0"} POL`}
                          value={polInput}
                          onChange={(e) => setPolInput(e.target.value)}
                          className="w-full px-4 py-3 pr-16 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 focus:border-primary/50 outline-none text-foreground font-mono text-sm transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                          POL
                        </span>
                      </div>

                      {/* Quick amounts */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {["1", "5", "10", "50", "100"].map((v) => (
                          <button
                            key={v}
                            onClick={() => setPolInput(v)}
                            className="px-3 py-1 rounded-lg bg-muted/30 border border-border hover:border-primary/30 hover:bg-primary/8 text-xs text-muted-foreground hover:text-primary transition-all font-mono"
                          >
                            {v} POL
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Estimated tokens */}
                    {tokensEst && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-primary/8 border border-primary/20 overflow-hidden space-y-0"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-xs text-muted-foreground">You receive</span>
                          <span className="text-primary font-extrabold font-mono text-lg">
                            {parseFloat(tokensEst.tokens).toLocaleString()} OKBOND
                          </span>
                        </div>

                        {/* ── Profit highlight ── */}
                        <motion.div
                          key={tokensEst.tokens}
                          initial={{ scale: 0.97, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/10 border-t border-emerald-500/30"
                          style={{ boxShadow: "inset 0 0 12px rgba(34,197,94,0.08)" }}
                        >
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="font-bold text-emerald-400" style={{ fontSize: "0.82rem" }}>
                              Value at listing ($1.00)
                            </span>
                          </div>
                          <span
                            className="font-extrabold font-mono"
                            style={{ fontSize: "1.05rem", color: "#22c55e" }}
                          >
                            ${(parseFloat(tokensEst.tokens) * 1).toFixed(2)}
                          </span>
                        </motion.div>

                        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-t border-primary/10">
                          <span className="text-[10px] text-muted-foreground font-mono">You pay (USD approx.)</span>
                          <span className="text-[11px] text-primary/70 font-mono font-semibold">≈ ${tokensEst.usd} USD</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Buy button */}
                    <button
                      onClick={handleBuy}
                      disabled={!polInput || parseFloat(polInput) <= 0}
                      className="w-full py-4 rounded-2xl font-extrabold text-sm bg-primary text-primary-foreground
                        hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
                        transition-all shadow-[0_0_20px_rgba(234,179,8,0.35)] hover:shadow-[0_0_35px_rgba(234,179,8,0.6)]
                        flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Buy OKBOND Tokens
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-[10px] text-muted-foreground/60 font-mono">
                      Transaction signed via MetaMask · Polygon PoS Network
                    </p>
                  </div>
                )}

                {/* TX: Pending */}
                {txStatus === "pending" && (
                  <div className="text-center py-6 space-y-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-foreground font-bold">Awaiting MetaMask…</p>
                    <p className="text-xs text-muted-foreground">Please confirm the transaction in your wallet</p>
                  </div>
                )}

                {/* TX: Confirming */}
                {txStatus === "confirming" && (
                  <div className="text-center py-6 space-y-3">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                    <p className="text-foreground font-bold">Confirming on Polygon…</p>
                    {txHash && (
                      <a
                        href={`${POLYGON_SCAN}${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                      >
                        {txHash.slice(0, 12)}…{txHash.slice(-8)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* TX: Success */}
                {txStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <div>
                      <p className="text-foreground font-extrabold text-lg">Purchase Successful!</p>
                      <p className="text-xs text-muted-foreground mt-1">OKBOND tokens have been sent to your wallet</p>
                    </div>
                    {txHash && (
                      <a
                        href={`${POLYGON_SCAN}${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                      >
                        View on PolygonScan <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={resetTx}
                      className="w-full py-3 rounded-2xl bg-muted/30 border border-border text-sm font-bold hover:bg-muted/50 transition-all"
                    >
                      Buy More Tokens
                    </button>
                  </motion.div>
                )}

                {/* TX: Error */}
                {txStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <XCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-foreground font-bold">Transaction Failed</p>
                    <p className="text-xs text-red-400/80 font-mono px-4 break-words">{txError}</p>
                    <button
                      onClick={resetTx}
                      className="w-full py-3 rounded-2xl bg-muted/30 border border-border text-sm font-bold hover:bg-muted/50 transition-all"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* ── Referral Card ─────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-3xl border border-purple-500/20 p-6 bg-gradient-to-br from-purple-500/8 to-transparent"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground">Referral Program</h3>
                    <p className="text-xs text-muted-foreground">Earn rewards for every referral</p>
                  </div>
                  {parseFloat(stats.referralBonusPercent) > 0 && (
                    <span className="ml-auto px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold">
                      {stats.referralBonusPercent}% Bonus
                    </span>
                  )}
                </div>

                {/* How it works */}
                <div className="space-y-2.5 mb-5">
                  {[
                    { step: "1", text: "Copy your unique referral link below" },
                    { step: "2", text: "Share it with your network" },
                    { step: "3", text: "Earn on-chain rewards for every purchase" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {item.step}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Referral link generator */}
                {!address ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-3">Connect your wallet to generate your referral link</p>
                    <button
                      onClick={onConnect}
                      className="px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/30 transition-all"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold mb-2 block">Your Referral Link</label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-xs font-mono text-muted-foreground overflow-hidden">
                          <span className="truncate block">{referralLink}</span>
                        </div>
                        <button
                          onClick={copyReferral}
                          className="px-3 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 transition-all flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
                        >
                          {refCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {refCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Connected address */}
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold mb-2 block">Connected Wallet</label>
                      <div className="flex gap-2">
                        <code className="flex-1 px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-xs font-mono text-primary overflow-hidden">
                          <span className="truncate block">{address}</span>
                        </code>
                        <button
                          onClick={copyAddress}
                          className="px-3 py-2.5 rounded-xl border border-border hover:border-primary/30 bg-muted/20 hover:bg-primary/8 text-muted-foreground hover:text-primary transition-all"
                        >
                          {addrCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* ── Referral Dashboard (always visible when wallet connected) ── */}
                    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/6 to-transparent overflow-hidden">
                      {/* Dashboard header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
                        <span className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          Referral Dashboard
                        </span>
                        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>

                      {/* Stats grid */}
                      {userStats ? (
                        <div className="p-3 space-y-3">

                          {/* Row 1: Earned Tokens + Pending Rewards */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Earned Tokens — from TokensPurchased events */}
                            <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/25">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 font-bold">Earned Tokens</p>
                              <p className="text-lg font-extrabold text-primary font-mono leading-none">
                                {fmt(userStats.earnedTokens, 2)}
                              </p>
                              <p className="text-[9px] text-primary/60 font-mono mt-0.5">OKBOND</p>
                              <p className="text-[8px] text-muted-foreground/50 mt-1">from purchases</p>
                            </div>
                            {/* Pending Rewards — POL referral commission */}
                            <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 font-bold">Pending Rewards</p>
                              <p className="text-lg font-extrabold text-emerald-400 font-mono leading-none">
                                {fmt(userStats.referralEarnings, 4)}
                              </p>
                              <p className="text-[9px] text-emerald-400/60 font-mono mt-0.5">POL</p>
                              <p className="text-[8px] text-muted-foreground/50 mt-1">referral commission</p>
                            </div>
                          </div>

                          {/* Row 2: Contributed + Referrals */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2.5 rounded-xl bg-muted/20 border border-border">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 font-bold">Contributed</p>
                              <p className="text-sm font-extrabold text-foreground font-mono leading-none">
                                {fmt(userStats.contribution, 3)}
                              </p>
                              <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">POL</p>
                            </div>
                            <div className="text-center p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 font-bold">Referrals Made</p>
                              <p className="text-sm font-extrabold text-purple-400 font-mono leading-none">
                                {userStats.referralCount}
                              </p>
                              <p className="text-[9px] text-purple-400/60 font-mono mt-0.5">users</p>
                            </div>
                          </div>

                          {/* MLM Tier breakdown when referrals exist */}
                          {parseInt(userStats.referralCount) > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/15 border border-border">
                              <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-foreground uppercase tracking-wider mb-0.5">MLM Tiers Active</p>
                                <div className="flex gap-3 text-[9px] font-mono text-muted-foreground">
                                  <span className="text-amber-400 font-bold">L1 5%</span>
                                  <span className="text-sky-400 font-bold">L2 3%</span>
                                  <span className="text-purple-400 font-bold">L3 2%</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                                Earning
                              </span>
                            </div>
                          )}

                          {/* Referred-by indicator */}
                          {referrer && referrer.toLowerCase() !== address.toLowerCase() && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                              <Gift className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Referred by</p>
                                <p className="text-[10px] font-mono text-foreground/60 truncate">
                                  {referrer.slice(0, 10)}…{referrer.slice(-8)}
                                </p>
                              </div>
                              <span className="flex-shrink-0 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">Active</span>
                            </div>
                          )}

                          {/* Self-referral warning */}
                          {referrer && referrer.toLowerCase() === address.toLowerCase() && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              <p className="text-[10px] text-red-400/80 font-semibold">Self-referral blocked — you cannot refer yourself</p>
                            </div>
                          )}

                          {/* No activity hint */}
                          {parseFloat(userStats.earnedTokens) === 0 && parseInt(userStats.referralCount) === 0 && (
                            <p className="text-center text-[10px] text-muted-foreground/50 font-mono pb-1">
                              Purchase OKBOND or share your referral link to start earning
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted-foreground">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          Loading your stats from chain…
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Referral Profit Calculator ───────────────────────────────── */}
            <ReferralCalculator />

            {/* ── Multi-Level Referral Dashboard (wallet connected only) ──────── */}
            {address && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-3xl border border-primary/15 p-5 sm:p-7"
              >
                <ReferralDashboard address={address} />
              </motion.div>
            )}

            {/* ── Info / Security note ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl border border-border/40 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Smart Contract Verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ICO Contract:{" "}
                  <a
                    href={`https://polygonscan.com/address/${ICO_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    0x0134F0…adD16
                  </a>
                  {" "}· Polygon PoS · Fixed price $0.15/OKBOND · 1 POL = 0.6 OKBOND
                </p>
              </div>
              <a
                href={`https://polygonscan.com/address/${ICO_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/30 text-xs text-muted-foreground hover:text-primary transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                PolygonScan
              </a>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
