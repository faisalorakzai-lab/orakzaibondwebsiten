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
  Loader2, TrendingUp, Users, Gift, ShieldCheck,
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
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Number of Direct Referrals
            </label>
            <div className="relative">
              <input
                type="number"
                value={investors}
                onChange={(e) => setInvestors(e.target.value)}
                onKeyDown={handleKey}
                placeholder="e.g. 50"
                className="w-full bg-black/40 border border-primary/20 rounded-2xl px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                onClick={calculate}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 transition-transform"
              >
                Calc
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/60 italic ml-1">
              * Assumes average $10 investment per person
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "L1", p: "5%" },
              { l: "L2", p: "3%" },
              { l: "L3", p: "2%" },
            ].map((i) => (
              <div key={i.l} className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[9px] text-muted-foreground uppercase font-bold">{i.l}</p>
                <p className="text-xs font-bold text-primary">{i.p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Result side */}
        <div className="glass-card rounded-2xl border border-primary/10 p-4 bg-black/20">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Level 1 (Direct)</span>
                  <span className="font-mono text-foreground">${result.l1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Level 2</span>
                  <span className="font-mono text-foreground">${result.l2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Level 3</span>
                  <span className="font-mono text-foreground">${result.l3.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">Total Estimated</span>
                  <span className="text-lg font-black text-primary font-mono">${result.total.toFixed(2)}</span>
                </div>
              </motion.div>
            ) : (
              <div key="empty" className="h-full flex flex-col items-center justify-center py-4 text-center">
                <Target className="w-8 h-8 text-primary/20 mb-2" />
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Enter count to see potential</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ICOModule({
  provider, address, onConnect, referrer, isPolygon, switchToPolygon,
}: ICOModuleProps) {
  const [polAmount, setPolAmount] = useState("10");
  const [copied, setCopied]       = useState(false);

  const {
    stats, txStatus, txHash, txError, buyTokens, resetTx, loading,
  } = useICO(provider, address);

  const handleBuy = async () => {
    if (!polAmount || parseFloat(polAmount) <= 0) return;
    await buyTokens(polAmount, referrer);
  };

  const copyRef = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(`${SITE_URL}?ref=${address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  // Dynamic stats from hook
  const tokensSold = stats ? parseFloat(stats.totalTokensSold) : 0;
  const totalRaised = stats ? parseFloat(stats.totalRaisedPOL) : 0;
  const userTokens = stats ? stats.userTokens : "0";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. Countdown & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ICOCountdown />
        <div className="glass-card rounded-2xl border border-primary/20 p-5 bg-gradient-to-br from-primary/10 to-transparent flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Phase 1 Progress</h3>
            {loading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>{fmt(tokensSold.toString(), 0)} Sold</span>
              <span>{fmt(PHASE1_SUPPLY.toString(), 0)} Target</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-black/40 border border-primary/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct(tokensSold.toString(), PHASE1_SUPPLY.toString())}%` }}
                className="h-full bg-gradient-to-r from-primary/80 to-primary relative"
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-emerald-400">{pct(tokensSold.toString(), PHASE1_SUPPLY.toString()).toFixed(1)}% FILLED</span>
              <span className="text-muted-foreground uppercase tracking-tighter">Polygon Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Phase Cards */}
      <ICOPhaseCards />

      {/* 3. Main Buy Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Buy Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl border border-primary/30 p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Rocket className="w-32 h-32 text-primary" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-foreground">Participate in ICO</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Phase 1 Live
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>You Pay (POL)</span>
                    <span>Min: 10 POL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={polAmount}
                      onChange={(e) => setPolAmount(e.target.value)}
                      className="flex-1 bg-transparent border-none text-3xl font-mono font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30"
                      placeholder="0.0"
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm">POL</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <div className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">You Receive</div>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                    <span>OKBOND Estimate</span>
                    <span>Rate: 0.6 / POL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-mono font-black text-primary">
                      {fmt((parseFloat(polAmount || "0") * TOKENS_PER_POL).toString(), 2)}
                    </span>
                    <span className="text-sm font-bold text-primary/80">OKBOND</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!address ? (
                <button
                  onClick={onConnect}
                  className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                  <Wallet className="w-6 h-6" />
                  Connect Wallet to Participate
                </button>
              ) : !isPolygon ? (
                <button
                  onClick={switchToPolygon}
                  className="w-full py-5 rounded-2xl bg-amber-500 text-black font-black text-lg flex items-center justify-center gap-3"
                >
                  <AlertTriangle className="w-6 h-6" />
                  Switch to Polygon Network
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={loading || !polAmount || parseFloat(polAmount) < 10}
                  className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Rocket className="w-6 h-6" />
                      Buy OKBOND Tokens Now
                    </>
                  )}
                </button>
              )}

              {/* Transaction Status */}
              <AnimatePresence>
                {txStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-2xl border ${
                      txStatus === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {txStatus === "pending" || txStatus === "confirming" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                           txStatus === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                           <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">
                            {txStatus === "pending" ? "Waiting for Signature..." :
                             txStatus === "confirming" ? "Confirming on Blockchain..." :
                             txStatus === "success" ? "Tokens Purchased!" :
                             "Transaction Failed"}
                          </p>
                          {txError && <p className="text-xs opacity-80 mt-1 line-clamp-2">{txError}</p>}
                          {txHash && (
                            <a
                              href={`${POLYGON_SCAN}${txHash}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase mt-2 hover:underline"
                            >
                              View on Explorer <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <button onClick={resetTx} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="My Tokens"
              value={fmt(userTokens, 2)}
              sub="OKBOND Balance"
              icon={<ShieldCheck className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Total Raised"
              value={`${fmt(totalRaised.toString(), 0)} POL`}
              sub="Global Participation"
              icon={<TrendingUp className="w-5 h-5" />}
              color="primary"
            />
          </div>

          {/* Referral Card */}
          <div className="glass-card rounded-3xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Invite & Earn</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">5-Level Referral System</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Earn instant commissions when your network participates in the ICO. Rewards are distributed across 5 levels.
              </p>
              
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-[10px] font-mono text-primary/70 truncate border border-white/5">
                    {address ? `${SITE_URL}?ref=${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet to view"}
                  </div>
                  <button
                    onClick={copyRef}
                    disabled={!address}
                    className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Smart Contract Verified</p>
              <p className="text-[10px] text-muted-foreground">100% Capital Protection enabled on-chain.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Calculator & Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ReferralCalculator />
        {address && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Live Network Performance</h3>
            </div>
            <ReferralDashboard address={address} provider={provider} />
          </div>
        )}
      </div>

    </div>
  );
}
