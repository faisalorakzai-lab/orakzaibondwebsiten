import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Rocket, Wallet, Shield, TrendingUp, Lock, Zap, Clock,
  ExternalLink, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Star, ArrowLeft, Users, Gift, ShieldCheck
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import ReferralDashboard from "@/components/ReferralDashboard";
import { Button } from "@/components/ui/button";

const POLYGON_SCAN = "https://polygonscan.com/tx/";
const PHASE1_END = new Date("2026-06-09T00:00:00Z").getTime();

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
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return tick;
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 sm:w-20 h-14 sm:h-16 flex items-center justify-center rounded-xl bg-black/60 border border-primary/30 font-mono font-extrabold text-2xl sm:text-3xl text-primary">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
    </div>
  );
}

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

  return (
    <div className="glass-card rounded-3xl border border-primary/30 p-8 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        <h3 className="text-2xl font-black text-foreground">Buy OKBOND</h3>
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
            <input type="number" value={polAmount} onChange={(e) => setPolAmount(e.target.value)} className="w-full bg-transparent border-none text-3xl font-mono font-bold text-foreground focus:outline-none" placeholder="0.0" />
          </div>
          <Button onClick={handleBuy} disabled={loading || !polAmount || parseFloat(polAmount) <= 0} className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-lg font-black">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : !address ? "Connect Wallet" : !isPolygon ? "Switch to Polygon" : "Buy OKBOND Now"}
          </Button>
        </div>
        {txStatus !== "idle" && (
          <div className={`p-4 rounded-2xl border ${txStatus === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-primary/10 border-primary/20 text-primary"}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{txStatus === "pending" ? "Transaction Pending..." : txStatus === "success" ? "Purchase Successful!" : "Transaction Failed"}</p>
                {txError && <p className="text-xs opacity-80 mt-1">{txError}</p>}
                {txHash && <a href={`${POLYGON_SCAN}${txHash}`} target="_blank" className="text-[10px] font-bold uppercase mt-2 hover:underline">View on Explorer</a>}
              </div>
              <button onClick={resetTx} className="p-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
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
      <main className="flex-1">
        <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"><ArrowLeft className="w-4 h-4" />Back to Home</button>
            </Link>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Secure Your Stake in the <span className="text-primary">Orakzai Future</span></h1>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{ label: "Price", value: "$0.15", icon: <TrendingUp className="w-4 h-4" /> }, { label: "Network", value: "Polygon", icon: <Zap className="w-4 h-4" /> }, { label: "Min Buy", value: "10 POL", icon: <Wallet className="w-4 h-4" /> }, { label: "Security", value: "Audited", icon: <Shield className="w-4 h-4" /> }].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5"><div className="text-primary mb-2">{stat.icon}</div><p className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</p><p className="text-lg font-black">{stat.value}</p></div>
                ))}
              </div>
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" />Phase 1 Countdown</h3>
                <div className="flex gap-3 sm:gap-6"><CountBox value={cd.days} label="Days" /><CountBox value={cd.hours} label="Hours" /><CountBox value={cd.minutes} label="Minutes" /><CountBox value={cd.seconds} label="Seconds" /></div>
              </div>
              {address && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" />5-Level Team Performance</h3>
                  <ReferralDashboard address={address} provider={provider} />
                </div>
              )}
            </div>
            <div className="lg:col-span-5 space-y-8">
              <BuyForm address={address} provider={provider} isPolygon={isPolygon} onConnect={connect} switchToPolygon={switchToPolygon} />
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold">Why Participate?</h2>
                {[{ icon: <ShieldCheck className="w-5 h-5" />, title: "Capital Protection", desc: "Your principal is protected via smart contract logic." }, { icon: <TrendingUp className="w-5 h-5" />, title: "High ROI Potential", desc: "Phase 1 price $0.15 vs target listing price $1.00." }, { icon: <Gift className="w-5 h-5" />, title: "MLM Rewards", desc: "Earn up to 5 levels of deep referral commissions." }].map((item, i) => (
                  <div key={i} className="glass-card rounded-xl border border-primary/20 p-4 flex gap-4 items-start"><div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">{item.icon}</div><div><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
