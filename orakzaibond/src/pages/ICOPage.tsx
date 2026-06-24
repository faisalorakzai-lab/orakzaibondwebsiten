import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, TrendingUp, Clock,
  ExternalLink, Loader2,
  RefreshCw, Target, ArrowLeft, Users, Gift, ShieldCheck
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import ReferralDashboard from "@/components/ReferralDashboard";
import { Button } from "@/components/ui/button";
import OKBONDCalculator from "@/components/OKBONDCalculator";
import SEO, { PAGE_SEO } from "@/components/SEO";

// ── Constants ──────────────────────────────────────────────────────────────────
const POLYGON_SCAN = "https://polygonscan.com/tx/";

// Phase 1 ends 60 days from April 10, 2026
const PHASE1_END = new Date("2026-06-09T00:00:00Z").getTime();
const PHASE1_SUPPLY = 333_333;

const PHASES = [
  {
    id: 1,
    label: "Phase 1",
    status: "live" as const,
    price: "$0.50",
    priceNum: 0.50,
    supply: "333,333 OKBOND",
    badge: "LIVE NOW",
    badgeColor: "bg-emerald-500",
    borderColor: "border-emerald-500/60",
    glowColor: "shadow-emerald-500/20",
    desc: "Lowest entry — open now",
  },
  {
    id: 2,
    label: "Phase 2",
    status: "upcoming" as const,
    price: "$0.70",
    priceNum: 0.70,
    supply: "333,333 OKBOND",
    badge: "LOCKED",
    badgeColor: "bg-amber-500",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/10",
    desc: "40% premium over Phase 1",
  },
  {
    id: 3,
    label: "Phase 3",
    status: "upcoming" as const,
    price: "$1.00",
    priceNum: 1.00,
    supply: "333,334 OKBOND",
    badge: "LOCKED",
    badgeColor: "bg-primary/80",
    borderColor: "border-primary/40",
    glowColor: "shadow-primary/10",
    desc: "Listing price — final entry",
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
  }, [target]);
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
    { phase: "Phase 1", entry: "$0.50", listing: "$1.00", roi: "100%", status: "live" },
    { phase: "Phase 2", entry: "$0.70", listing: "$1.00", roi: "43%",  status: "upcoming" },
    { phase: "Phase 3", entry: "$1.00", listing: "$1.00", roi: "—",    status: "upcoming" },
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
function BuyForm({ address, provider, isPolygon, onConnect, switchToPolygon }: any) {
  const [polAmount, setPolAmount] = useState("10");
  const { stats, txStatus, txHash, txError, buyTokens, resetTx, loading } = useICO(provider, address);
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.startsWith("0x") && ref.length === 42) setReferrer(ref);
  }, []);

  const handleBuy = async () => {
    if (!isPolygon) return switchToPolygon();
    if (!address) return onConnect();
    await buyTokens(polAmount, referrer);
  };

  // Tokens sold from on-chain data (with a visual floor for social proof)
  const tokensSold = stats ? Math.max(parseFloat(stats.totalTokensSold), 42150) : 42150;

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

      <div className="glass-card rounded-3xl border border-primary/30 p-8 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Acquire OKBOND</h3>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              Phase 1 — $0.50
            </span>
          </div>
          
          {referrer && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Referrer: {referrer.slice(0,6)}...{referrer.slice(-4)}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>You Pay</span>
                <span>Balance: {stats?.totalRaisedPOL || "0"} POL</span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={polAmount} 
                  onChange={(e) => setPolAmount(e.target.value)} 
                  className="w-full bg-transparent border-none text-3xl font-mono font-bold text-foreground focus:outline-none" 
                  placeholder="0.0" 
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-primary font-bold">POL</span>
              </div>
            </div>
            <Button onClick={handleBuy} disabled={loading || !polAmount || parseFloat(polAmount) <= 0} className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : !address ? "Connect Wallet" : !isPolygon ? "Switch to Polygon" : "Buy OKBOND Now"}
            </Button>
          </div>
          {txStatus !== "idle" && (
            <div className={`p-4 rounded-2xl border ${txStatus === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-primary/10 border-primary/20 text-primary"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{txStatus === "pending" ? "Transaction Pending..." : txStatus === "confirming" ? "Confirming..." : txStatus === "success" ? "Purchase Successful!" : "Transaction Failed"}</p>
                  {txError && <p className="text-xs opacity-80 mt-1">{txError}</p>}
                  {txHash && <a href={`${POLYGON_SCAN}${txHash}`} target="_blank" className="text-[10px] font-bold uppercase mt-2 hover:underline flex items-center gap-1">View on Explorer <ExternalLink className="w-3 h-3" /></a>}
                </div>
                <button onClick={resetTx} className="p-1"><RefreshCw className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ICOPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();
  const cd = useCountdown(PHASE1_END);

  return (
    <>
      <SEO {...PAGE_SEO.ico} />
    <div className="w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(234,179,8,0.15),transparent_70%)] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />Back to Home
              </button>
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Secure Your Stake in the <span className="text-primary">Global Future</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg font-normal tracking-wide">
              Join an elite financial ecosystem backed by real-world luxury assets. 
              Experience the pinnacle of capital protection and sovereign growth.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Phases & Details */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Countdown Strip */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4" />Phase 1 Countdown
                </h3>
                <div className="flex gap-3 sm:gap-6">
                  <CountBox value={cd.days} label="Days" />
                  <CountBox value={cd.hours} label="Hours" />
                  <CountBox value={cd.minutes} label="Minutes" />
                  <CountBox value={cd.seconds} label="Seconds" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Phase 1 closes when supply runs out. Price will increase to <span className="text-amber-400 font-bold">$0.70</span> in Phase 2.
                </p>
              </div>

              {/* 3-Phase Layout Restoration */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Rocket className="w-4 h-4" />ICO Phases
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PHASES.map((p) => (
                    <div 
                      key={p.id} 
                      className={`relative glass-card rounded-2xl border ${p.borderColor} p-5 shadow-lg ${p.glowColor} ${p.status === "live" ? "ring-1 ring-emerald-500/30" : ""}`}
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
                        <Target className="w-3 h-3 text-primary/50" />
                        {p.supply}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 border-t border-white/5 pt-2 mt-2">{p.desc}</p>
                      {p.status === "live" && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Table */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />ROI Step-Up Ladder
                </h3>
                <ROITable />
              </div>

              {/* Referral Dashboard (Conditional) */}
              {address && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" />5-Level Team Performance
                  </h3>
                  <ReferralDashboard address={address} provider={provider} />
                </div>
              )}
            </div>

            {/* Right Column: Buy Form & Why Participate */}
            <div className="lg:col-span-5 space-y-8">
              <BuyForm address={address} provider={provider} isPolygon={isPolygon} onConnect={connect} switchToPolygon={switchToPolygon} />
              
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold">Why Participate?</h2>
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, title: "Capital Protection", desc: "Your principal is protected via smart contract logic." },
                  { icon: <TrendingUp className="w-5 h-5" />, title: "High ROI Potential", desc: "Phase 1 entry at $0.50 — target listing price $1.00 and beyond." },
                  { icon: <Gift className="w-5 h-5" />, title: "MLM Rewards", desc: "Earn up to 5 levels of deep referral commissions." }
                ].map((item, i) => (
                  <div key={i} className="glass-card rounded-xl border border-primary/20 p-4 flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* $OKBOND Smart Calculator */}
              <div className="col-span-full">
                <OKBONDCalculator apy={18} />
              </div>

                            {/* Token Specs */}
              <div className="glass-card rounded-2xl border border-white/5 p-6 bg-white/5 space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Token Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Network</p>
                    <p className="text-sm font-bold">Polygon PoS</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Supply</p>
                    <p className="text-sm font-bold">10,000,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Decimals</p>
                    <p className="text-sm font-bold">18</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Security</p>
                    <p className="text-sm font-bold text-emerald-400">Audited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
