import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Wallet, Shield, TrendingUp, Lock, Zap, Clock,
  Copy, Check, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, ArrowRight, Star, Target, ArrowLeft, Users, Gift, ShieldCheck
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import ReferralDashboard from "@/components/ReferralDashboard";

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

// ── Referral Profit Calculator ────────────────────────────────────────────────
function ReferralCalculator() {
  const [investors, setInvestors] = useState("10");
  const [result, setResult]       = useState<{ l1: number; l2: number; l3: number; total: number } | null>({
    l1: 5, l2: 3, l3: 2, total: 10
  });

  const INVESTMENT = 10; // base investment per person in POL (approximate for calculation)

  const calculate = () => {
    const n = parseFloat(investors);
    if (!n || n <= 0) return;
    const l1 = n * INVESTMENT * 0.05;
    const l2 = n * INVESTMENT * 0.03;
    const l3 = n * INVESTMENT * 0.02;
    setResult({ l1, l2, l3, total: l1 + l2 + l3 });
  };

  useEffect(() => {
    calculate();
  }, [investors]);

  return (
    <div className="glass-card rounded-2xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-foreground">Profit Calculator</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">3-Level MLM Earnings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-2">Number of Referrals (L1)</label>
          <input
            type="number"
            value={investors}
            onChange={(e) => setInvestors(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            placeholder="e.g. 10"
          />
          <p className="text-[9px] text-muted-foreground mt-1.5">* Assumes each referral contributes 10 POL</p>
        </div>

        {result && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[9px] text-muted-foreground uppercase font-bold">L1 (5%)</p>
              <p className="text-sm font-bold text-foreground">{result.l1.toFixed(1)} POL</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[9px] text-muted-foreground uppercase font-bold">L2 (3%)</p>
              <p className="text-sm font-bold text-foreground">{result.l2.toFixed(1)} POL</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[9px] text-muted-foreground uppercase font-bold">L3 (2%)</p>
              <p className="text-sm font-bold text-foreground">{result.l3.toFixed(1)} POL</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-[9px] text-primary uppercase font-bold">Total</p>
              <p className="text-sm font-bold text-primary">{result.total.toFixed(1)} POL</p>
            </div>
          </div>
        )}
      </div>
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
  const estimatedUSD    = parseFloat(polAmount || "0") * 0.45; // Approx

  const handleBuy = async () => {
    const val = parseFloat(polAmount);
    if (isNaN(val) || val < 10) return;
    await buyTokens(polAmount);
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
                  max="10000"
                  step="1"
                  value={polAmount}
                  onChange={e => setPolAmount(e.target.value)}
                  className="w-full bg-black/50 border border-primary/30 rounded-xl px-4 py-3 text-lg font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  placeholder="Min 10 POL"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">POL</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Min: 10 POL</span>
                <span>Max: 10,000 POL</span>
              </div>
            </div>

            {/* Estimates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">You Receive</p>
                <p className="text-lg font-extrabold text-foreground">{estimatedTokens.toLocaleString()} <span className="text-primary text-xs">OKBOND</span></p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Est. Value</p>
                <p className="text-lg font-extrabold text-foreground">${estimatedUSD.toLocaleString()}</p>
              </div>
            </div>

            {/* Action button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={txStatus === "pending" || txStatus === "confirming" || parseFloat(polAmount) < 10 || parseFloat(polAmount) > 10000}
              onClick={handleBuy}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {txStatus === "pending" || txStatus === "confirming" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Buy OKBOND Now
                </>
              )}
            </motion.button>
          </>
        )}

        {/* Tx Feedback */}
        <AnimatePresence>
          {txStatus === "success" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Purchase Successful!</p>
                <p className="text-xs opacity-80 mb-2">Your OKBOND tokens have been secured on-chain.</p>
                <a href={`${POLYGON_SCAN}${txHash}`} target="_blank" rel="noreferrer" className="text-xs font-bold underline flex items-center gap-1">
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={resetTx} className="mt-3 text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors">Dismiss</button>
              </div>
            </motion.div>
          )}
          {txStatus === "error" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Transaction Failed</p>
                <p className="text-xs opacity-80 mb-3">{txError || "Something went wrong."}</p>
                <button onClick={resetTx} className="text-xs font-bold px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">Try Again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Referral widget */}
      <div className="glass-card rounded-2xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Referral Program</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Earn 5% in POL Instantly</p>
          </div>
        </div>
        
        {address ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share your link and earn <span className="text-primary font-bold">5% commission</span> on every purchase made by your referrals.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                https://orakzaibond.com?ref={address.slice(0, 6)}...
              </div>
              <button
                onClick={copyRef}
                className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Connect your wallet to generate your unique referral link.</p>
        )}
      </div>
    </div>
  );
}

export default function ICOPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();
  const cd = useCountdown(PHASE1_END);

  return (
    <div className="w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* ── Background Effects ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Back button */}
          <Link href="/">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:animate-pulse" />
              Back to Home
            </motion.button>
          </Link>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* ── Left Column: Content ──────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  <Rocket className="w-3.5 h-3.5" />
                  ICO Phase 1 is Live
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                  Secure Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary animate-gradient">
                    Financial Future
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                  Join the Orakzai Bond ICO and acquire OKBOND tokens at the lowest possible price. 
                  Experience 100% capital protection and multi-level referral rewards.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Shield className="w-5 h-5 text-primary" />
                    Capital Protected
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    567% Target ROI
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Target className="w-5 h-5 text-primary" />
                    Polygon PoS
                  </div>
                </div>
              </motion.div>

              {/* Countdown Section */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Phase 1 Countdown
                </h3>
                <div className="flex gap-3 sm:gap-6">
                  <CountBox value={cd.days} label="Days" />
                  <CountBox value={cd.hours} label="Hours" />
                  <CountBox value={cd.minutes} label="Minutes" />
                  <CountBox value={cd.seconds} label="Seconds" />
                </div>
              </div>

              {/* Phase Cards */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  ICO Phases
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PHASES.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`relative glass-card rounded-2xl border ${p.borderColor} p-6 space-y-4 shadow-xl ${p.glowColor} ${p.status === "live" ? "ring-1 ring-emerald-500/30" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${p.badgeColor} ${p.status === "live" ? "text-black" : "text-foreground/80"}`}>
                          {p.badge}
                        </span>
                      </div>
                      <div>
                        <p className="text-4xl font-extrabold text-foreground font-mono">{p.price}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">per OKBOND</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Rocket className="w-4 h-4 text-primary/60" />
                        <span className="text-muted-foreground">{p.supply}</span>
                      </div>
                      {p.status === "upcoming" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                          <Lock className="w-3.5 h-3.5" />
                          Unlocks after Phase {p.id - 1}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground border-t border-white/5 pt-3">{p.desc}</p>
                      {p.status === "live" && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ROI Table */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  ICO Growth Potential
                </h3>
                <ROITable />
              </div>

              {/* Referral Dashboard (Only if connected) */}
              {address && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Performance
                  </h3>
                  <ReferralDashboard address={address} />
                </div>
              )}
            </div>

            {/* ── Right Column: Buy Widget ──────────────────────────────── */}
            <div className="lg:col-span-5 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28 space-y-8"
              >
                <BuyForm 
                  address={address} 
                  provider={provider} 
                  isPolygon={isPolygon} 
                  onConnect={connect} 
                  switchToPolygon={switchToPolygon} 
                />

                <ReferralCalculator />

                {/* Why Buy Now Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-foreground">Why Participate?</h2>
                  {[
                    { icon: <ShieldCheck className="w-5 h-5" />, title: "Capital Protection", desc: "Your principal is protected via smart contract logic." },
                    { icon: <TrendingUp className="w-5 h-5" />, title: "High ROI Potential", desc: "Phase 1 price $0.15 vs target listing price $1.00." },
                    { icon: <Gift className="w-5 h-5" />, title: "MLM Rewards", desc: "Earn up to 3 levels of deep referral commissions." },
                    { icon: <Zap className="w-5 h-5" />, title: "Polygon Network", desc: "Fast, secure, and near-zero gas fees." },
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
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
