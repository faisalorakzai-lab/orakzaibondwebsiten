/**
 * ICOPage — Dedicated ICO dashboard at /ico
 * Full 3-phase structure, 60-day countdown, buy form, progress bar, ROI table
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Rocket, Wallet, Shield, TrendingUp, Lock, Zap, Clock,
  Copy, Check, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Star, Target, ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";

// ── Constants ──────────────────────────────────────────────────────────────────
const POLYGON_SCAN = "https://polygonscan.com/tx/";

// Phase 1 ends 60 days from April 10, 2026
const PHASE1_END = new Date("2026-06-09T00:00:00Z").getTime();

const PHASE1_SUPPLY = 75_000;   // tokens in Phase 1

const PHASES = [
  {
    id: 1,
    label: "Phase 1",
    status: "live" as const,
    price: "$0.15",
    priceNum: 0.15,
    supply: "75,000 OKBOND",
    badge: "LIVE NOW",
    badgeColor: "bg-emerald-500",
    borderColor: "border-emerald-500/60",
    glowColor: "shadow-emerald-500/20",
    desc: "Early adopter price — lowest entry point",
  },
  {
    id: 2,
    label: "Phase 2",
    status: "upcoming" as const,
    price: "$0.25",
    priceNum: 0.25,
    supply: "75,000 OKBOND",
    badge: "LOCKED",
    badgeColor: "bg-amber-500",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/10",
    desc: "67% premium over Phase 1",
  },
  {
    id: 3,
    label: "Phase 3",
    status: "upcoming" as const,
    price: "$0.50",
    priceNum: 0.50,
    supply: "Remaining Supply",
    badge: "LOCKED",
    badgeColor: "bg-primary/80",
    borderColor: "border-primary/40",
    glowColor: "shadow-primary/10",
    desc: "Final sale before listing",
  },
];

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(target: number) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
      done:    diff === 0,
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1_000);
    return () => clearInterval(id);
  });
  return tick;
}

// ── Tiny countdown box ─────────────────────────────────────────────────────────
function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-16 sm:w-20 h-14 sm:h-16 flex items-center justify-center rounded-xl bg-black/60 border border-primary/30 font-mono font-extrabold text-2xl sm:text-3xl text-primary shadow-inner"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ sold, total }: { sold: number; total: number }) {
  const pct = Math.min((sold / total) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>{sold.toLocaleString()} OKBOND sold</span>
        <span>{total.toLocaleString()} total</span>
      </div>
      <div className="h-3 w-full rounded-full bg-black/40 border border-primary/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary/80 via-primary to-amber-400 relative"
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
        </motion.div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-emerald-400 font-semibold">{pct.toFixed(1)}% Filled</span>
        <span className="text-muted-foreground">{(total - sold).toLocaleString()} remaining</span>
      </div>
    </div>
  );
}

// ── ROI comparison table ───────────────────────────────────────────────────────
function ROITable() {
  const rows = [
    { phase: "Phase 1", entry: "$0.15", listing: "$1.00", roi: "567%", status: "live" },
    { phase: "Phase 2", entry: "$0.25", listing: "$1.00", roi: "300%", status: "upcoming" },
    { phase: "Phase 3", entry: "$0.50", listing: "$1.00", roi: "100%", status: "upcoming" },
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-primary/20 bg-black/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary/20 bg-primary/10">
            <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-primary font-bold">Phase</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest text-muted-foreground font-bold">Entry Price</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest text-muted-foreground font-bold">Target Listing</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest text-emerald-400 font-bold">ROI at Listing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-white/5 ${r.status === "live" ? "bg-emerald-500/5" : ""}`}>
              <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                {r.phase}
                {r.status === "live" && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-black font-bold uppercase">Live</span>
                )}
              </td>
              <td className="px-4 py-3 text-center font-mono text-foreground">{r.entry}</td>
              <td className="px-4 py-3 text-center font-mono text-primary font-bold">{r.listing}</td>
              <td className="px-4 py-3 text-center font-mono text-emerald-400 font-extrabold">{r.roi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Buy Form ───────────────────────────────────────────────────────────────────
function BuyForm({
  address, provider, isPolygon, onConnect, switchToPolygon,
}: {
  address: string | null;
  provider: import("ethers").BrowserProvider | null;
  isPolygon: boolean;
  onConnect: () => void;
  switchToPolygon: () => void;
}) {
  const [polAmount, setPolAmount]   = useState("10");
  const [copied, setCopied]         = useState(false);
  const { stats, txStatus, txHash, txError, buyTokens, resetTx, loading } = useICO(provider, address);

  const estimatedTokens = parseFloat(polAmount || "0") * 0.6;

  const handleBuy = async () => {
    if (!polAmount || parseFloat(polAmount) <= 0) return;
    await buyTokens(polAmount, null);
  };

  const copyRef = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(`https://orakzaibond.com?ref=${address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  // Tokens sold from on-chain data
  const tokensSold = stats ? parseFloat(stats.totalTokensSold) : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="glass-card rounded-2xl border border-primary/20 p-5 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Phase 1 Progress</h3>
          {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>
        <ProgressBar sold={tokensSold} total={PHASE1_SUPPLY} />
      </div>

      {/* Buy card */}
      <div className="glass-card rounded-2xl border border-primary/30 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Buy OKBOND</h3>
          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            Phase 1 — $0.15
          </span>
        </div>

        {/* Wallet state */}
        {!address ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConnect}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet to Buy
          </motion.button>
        ) : !isPolygon ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={switchToPolygon}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold text-base flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Switch to Polygon Network
          </motion.button>
        ) : (
          <>
            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">POL Amount</label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={polAmount}
                  onChange={e => setPolAmount(e.target.value)}
                  className="w-full bg-black/50 border border-primary/30 rounded-xl px-4 py-3 text-lg font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  placeholder="Min 10 POL"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">POL</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>You receive: ≈ {estimatedTokens.toLocaleString()} OKBOND</span>
                <span>Min: 10 POL</span>
              </div>
            </div>

            {/* Action button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBuy}
              disabled={loading || !polAmount || parseFloat(polAmount) < 10}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
              {loading ? "Processing..." : "Buy OKBOND Now"}
            </motion.button>

            {/* Referral link */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Your Referral Link</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-muted-foreground truncate">
                  https://orakzaibond.com?ref={address.slice(0, 6)}...
                </div>
                <button
                  onClick={copyRef}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Transaction status overlays */}
        <AnimatePresence>
          {txStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 rounded-xl border flex flex-col gap-3"
              style={{
                backgroundColor: txStatus === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                borderColor: txStatus === "error" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                {txStatus === "pending" && <RefreshCw className="w-5 h-5 text-primary animate-spin" />}
                {txStatus === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {txStatus === "error" && <XCircle className="w-5 h-5 text-red-400" />}
                <p className="text-sm font-bold">
                  {txStatus === "pending" && "Transaction Pending..."}
                  {txStatus === "success" && "Purchase Successful!"}
                  {txStatus === "error" && "Transaction Failed"}
                </p>
              </div>
              {txError && <p className="text-xs text-red-400/80 leading-relaxed">{txError}</p>}
              {txHash && (
                <a
                  href={`${POLYGON_SCAN}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
                >
                  View on PolygonScan <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {txStatus !== "pending" && (
                <button onClick={resetTx} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground">
                  Dismiss
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ICOPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();
  const countdown = useCountdown(PHASE1_END);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
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

        {/* ── HERO / COUNTDOWN ──────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(234,179,8,0.1),transparent_70%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ICO Phase 1 is Live
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Join the <span className="text-primary">Future</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Secure your OKBOND tokens at the lowest possible price. 100% capital protection, 
              military-grade security, and massive ROI potential on Polygon PoS.
            </p>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block p-8 rounded-[2.5rem] border border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl"
            >
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Phase 1 Ends In</p>
              <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
                <CountBox value={countdown.days}    label="Days" />
                <span className="text-2xl font-bold text-primary/60 pb-5">:</span>
                <CountBox value={countdown.hours}   label="Hours" />
                <span className="text-2xl font-bold text-primary/60 pb-5">:</span>
                <CountBox value={countdown.minutes} label="Mins" />
                <span className="text-2xl font-bold text-primary/60 pb-5">:</span>
                <CountBox value={countdown.seconds} label="Secs" />
              </div>
              <p className="text-xs text-muted-foreground">
                After Phase 1 closes, price moves to <strong className="text-amber-400">$0.25</strong>
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 3-Phase Cards ──────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-12 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-foreground">ICO Phases</h2>
              <p className="text-muted-foreground text-sm mt-1">Three phases — each at a higher price. Early = more ROI.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PHASES.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`relative glass-card rounded-2xl border ${p.borderColor} p-6 space-y-4 shadow-xl ${p.glowColor} ${p.status === "live" ? "ring-1 ring-emerald-500/30" : ""}`}
                >
                  {/* Phase badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${p.badgeColor} ${p.status === "live" ? "text-black" : "text-foreground/80"}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-4xl font-extrabold text-foreground font-mono">{p.price}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">per OKBOND</p>
                  </div>

                  {/* Supply */}
                  <div className="flex items-center gap-2 text-sm">
                    <Rocket className="w-4 h-4 text-primary/60" />
                    <span className="text-muted-foreground">{p.supply}</span>
                  </div>

                  {/* Lock icon for upcoming */}
                  {p.status === "upcoming" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <Lock className="w-3.5 h-3.5" />
                      Unlocks after Phase {p.id - 1}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-muted-foreground border-t border-white/5 pt-3">{p.desc}</p>

                  {/* Active glow dot */}
                  {p.status === "live" && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Buy Form + Stats (2-col on desktop) ───────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-12 pb-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buy form */}
            <div>
              <h2 className="text-xl font-extrabold text-foreground mb-4">Participate in Phase 1</h2>
              <BuyForm
                address={address}
                provider={provider}
                isPolygon={isPolygon}
                onConnect={connect}
                switchToPolygon={switchToPolygon}
              />
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-foreground">Why Buy Now?</h2>

              {[
                { icon: <Shield className="w-5 h-5" />, title: "100% Capital Protection", desc: "Your investment is protected via smart contract on Polygon PoS." },
                { icon: <TrendingUp className="w-5 h-5" />, title: "567% ROI at Listing", desc: "Phase 1 price $0.15 vs target listing price $1.00 — enter early, exit big." },
                { icon: <Star className="w-5 h-5" />, title: "MLM Referral Rewards", desc: "Earn 5% (L1) · 3% (L2) · 2% (L3) commissions on every referral." },
                { icon: <Zap className="w-5 h-5" />, title: "Polygon PoS — Near-Zero Gas", desc: "Fast transactions, minimal fees, military-grade smart contract security." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  className="glass-card rounded-xl border border-primary/20 p-4 flex gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI Table ──────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-foreground">ROI Comparison</h2>
              <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary text-xs font-bold">Target: $1.00 Listing</span>
            </div>
            <ROITable />
            <p className="text-xs text-muted-foreground text-center">
              * ROI figures are projections based on target listing price. Not financial advice.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
