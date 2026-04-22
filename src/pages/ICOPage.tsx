/**
 * ICOPage — Dedicated ICO dashboard at /ico
 * Full 3-phase structure, 60-day countdown, buy form, progress bar, ROI table
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Wallet, Shield, TrendingUp, Lock, Zap, Clock,
  ChevronRight, Copy, Check, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, ArrowRight, Star, Target, ArrowLeft,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import Navbar from "@/components/Navbar";
import SiteSidebar, { SidebarHandle } from "@/components/SiteSidebar";
import Footer from "@/components/Footer";

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
  const estimatedUSD    = estimatedTokens * 0.15;

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
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">POL</span>
              </div>
              {/* Quick picks */}
              <div className="flex gap-2 flex-wrap">
                {["10", "25", "50", "100"].map(v => (
                  <button
                    key={v}
                    onClick={() => setPolAmount(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      polAmount === v
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-black/30 border-primary/20 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {v} POL
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            {parseFloat(polAmount) > 0 && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You receive</span>
                  <span className="font-bold text-primary font-mono">{estimatedTokens.toFixed(2)} OKBOND</span>
                </div>

                {/* ── Profit highlight row ────────────────────────────────── */}
                <motion.div
                  key={estimatedTokens}
                  initial={{ scale: 0.97, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/40"
                  style={{ boxShadow: "0 0 12px rgba(34,197,94,0.15)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-emerald-400" style={{ fontSize: "0.95rem" }}>
                      Value at listing ($1.00)
                    </span>
                  </div>
                  <span
                    className="font-extrabold font-mono text-emerald-400"
                    style={{ fontSize: "1.1rem", color: "#22c55e" }}
                  >
                    ${(estimatedTokens * 1).toFixed(2)}
                  </span>
                </motion.div>

                <div className="flex justify-between text-xs border-t border-primary/20 pt-1.5">
                  <span className="text-muted-foreground">You pay (USD approx.)</span>
                  <span className="text-muted-foreground font-mono">${estimatedUSD.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Buy button */}
            <AnimatePresence mode="wait">
              {txStatus === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Purchase Successful!
                  <button onClick={resetTx} className="ml-2 text-xs underline text-emerald-400/70">Buy again</button>
                </motion.div>
              ) : txStatus === "error" ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="w-full py-3 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive text-sm text-center flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {txError || "Transaction failed"}
                  </div>
                  <button onClick={resetTx} className="w-full py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-bold flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="buy"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuy}
                  disabled={txStatus === "pending" || txStatus === "confirming"}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {txStatus === "pending" || txStatus === "confirming" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />{txStatus === "pending" ? "Awaiting Wallet..." : "Confirming..."}</>
                  ) : (
                    <><Zap className="w-5 h-5" />Buy OKBOND Now</>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Tx hash */}
            {txHash && (
              <a
                href={`${POLYGON_SCAN}${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary font-mono justify-center"
              >
                <ExternalLink className="w-3 h-3" />
                View on PolygonScan
              </a>
            )}

            {/* Referral link */}
            <div className="rounded-xl border border-primary/20 bg-black/30 p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Your Referral Link (Earn 5%)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-primary/70 truncate">
                  orakzaibond.com?ref={address?.slice(0, 8)}…{address?.slice(-4)}
                </code>
                <button
                  onClick={copyRef}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ICOPage ───────────────────────────────────────────────────────────────
export default function ICOPage() {
  const { address, provider, isPolygon, connect, switchToPolygon } = useWallet();
  const countdown = useCountdown(PHASE1_END);
  const sidebarRef = useRef<SidebarHandle>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  const handleMenuToggle = () => {
    if (sidebarRef.current) {
      sidebarRef.current.toggleMobile();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} onMenuToggle={handleMenuToggle} />
      <SiteSidebar ref={sidebarRef} />

      <main className="flex-1 lg:pl-[60px]">
        {/* ── Exit Button ───────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-12 pt-6">
          <motion.a
            href="/"
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.a>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden">
          {/* bg glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ICO Phase 1 is LIVE on Polygon PoS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            >
              Orakzai Bond{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Token Sale
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Buy OKBOND at the lowest ever price of{" "}
              <strong className="text-primary">$0.15</strong> before it lists at{" "}
              <strong className="text-emerald-400">$1.00</strong>.{" "}
              <span className="text-emerald-400 font-bold">567% ROI</span> potential. 100% Capital Protected.
            </motion.p>

            {/* Listing target pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/40 bg-primary/10"
            >
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Target Listing Price</span>
              <span className="text-2xl font-extrabold text-primary font-mono">$1.00</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                +567% from Phase 1
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── Countdown ─────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-12 pb-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-3xl border border-primary/30 p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 text-center space-y-5"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                <Clock className="w-4 h-4" />
                Phase 1 Closes In
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
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

      <div className="lg:pl-[60px]">
        <Footer />
      </div>
    </div>
  );
}
