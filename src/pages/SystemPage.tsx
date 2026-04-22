import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Wallet, Copy, Check, TrendingUp, TrendingDown, Users, Gift,
  Shield, LogOut, Coins, BarChart3, Clock, ChevronRight,
  ExternalLink, Star, Zap, Activity, RefreshCw, Lock,
  CheckCircle2, XCircle, ArrowUpRight, Bell,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";

/* ── Constants ────────────────────────────────────────────────────────── */
const ICO_PRICE_USD   = 0.15;
const TARGET_PRICE    = 1.00;
const ROI_PCT         = ((TARGET_PRICE - ICO_PRICE_USD) / ICO_PRICE_USD) * 100; // 566.7%
const POL_USD         = 0.50;   // 1 POL ≈ $0.50
const OKBOND_POL      = ICO_PRICE_USD / POL_USD; // 0.30 POL
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const EXPLORER        = "https://polygonscan.com/token/" + TOKEN_ADDRESS;
const QUICKSWAP       = "https://dapp.quickswap.exchange/swap?type=v3&from=0x6F539e4232c045cCAc08e2009d97BdC72815472a&to=ETH";

/* ── News Ticker data ─────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "🚀 Faisal Orakzai just launched the Orakzai Think Tank — submit your ideas and win OKBOND rewards!",
  "🎰 New Jackpot of 10,000 OKBOND is LIVE — Enter before June 9, 2026!",
  "📈 OKBOND Phase 1 ICO: $0.15 — Target Listing Price $1.00 (+567% ROI)",
  "🏆 Lottery Draw scheduled for June 9, 2026 at 10:00 PM PKT — Don't miss it!",
  "💡 Orakzai Think Tank is LIVE — Best community ideas win OKBOND bounties!",
  "🌐 Orakzai Bond now live on Polygon PoS — Low fees, instant finality",
  "🔥 Phase 2 ICO at $0.25 coming soon — Buy Phase 1 before it locks!",
  "👥 10,000+ investors joined the Orakzai Movement — Join the community!",
];

/* ── Generate 30-day price chart data ────────────────────────────────── */
function generateChartData() {
  const data: { date: string; price: number; volume: number }[] = [];
  let price = 0.28;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const change = (Math.random() - 0.46) * 0.015;
    price = Math.max(0.24, Math.min(0.38, price + change));
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(4)),
      volume: Math.floor(Math.random() * 80000 + 20000),
    });
  }
  // Ensure last price is close to current 0.30
  data[data.length - 1].price = OKBOND_POL;
  return data;
}

/* ── Mock transactions ────────────────────────────────────────────────── */
const MOCK_TXS = [
  { id: "tx1",  date: "May 10, 2026", type: "Buy",            amount: "500 OKBOND",  value: "$75.00",  status: "completed", hash: "0xab12..." },
  { id: "tx2",  date: "May 08, 2026", type: "Lottery Entry",  amount: "50 OKBOND",   value: "$7.50",   status: "completed", hash: "0xcd34..." },
  { id: "tx3",  date: "May 05, 2026", type: "Referral Bonus", amount: "2.5 POL",     value: "$1.25",   status: "completed", hash: "0xef56..." },
  { id: "tx4",  date: "Apr 29, 2026", type: "Lottery Entry",  amount: "50 OKBOND",   value: "$7.50",   status: "refunded",  hash: "0x7890..." },
  { id: "tx5",  date: "Apr 22, 2026", type: "Buy",            amount: "200 OKBOND",  value: "$30.00",  status: "completed", hash: "0xabc1..." },
  { id: "tx6",  date: "Apr 15, 2026", type: "Referral Bonus", amount: "1.2 POL",     value: "$0.60",   status: "completed", hash: "0xdef2..." },
];

/* ── Referral tiers ───────────────────────────────────────────────────── */
const REF_TIERS = [
  { level: "L1", label: "Direct Referrals",   pct: 10, partners: 4,  earned: "18.4 POL", color: "#eab308", glow: "rgba(234,179,8,0.3)"    },
  { level: "L2", label: "Second-Level",        pct: 5,  partners: 11, earned: "6.2 POL",  color: "#22d3ee", glow: "rgba(34,211,238,0.3)"   },
  { level: "L3", label: "Third-Level",         pct: 2,  partners: 27, earned: "2.1 POL",  color: "#a78bfa", glow: "rgba(167,139,250,0.3)"  },
];

/* ── Custom chart tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-[#060c1f]/95 px-4 py-3 shadow-xl">
      <p className="text-[10px] font-mono text-muted-foreground/70 mb-1">{label}</p>
      <p className="text-sm font-extrabold text-cyan-300 font-mono">
        {payload[0].value.toFixed(4)} <span className="text-muted-foreground font-normal">POL</span>
      </p>
      <p className="text-[10px] text-primary/70 font-mono">
        ≈ ${(payload[0].value * POL_USD).toFixed(4)} USD
      </p>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────── */
function StatCard({
  icon, label, value, sub, trend, color, glow, delay = 0,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  trend?: "up" | "down" | "neutral"; color: string; glow: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl border p-6 relative overflow-hidden group transition-all duration-300"
      style={{
        background: "rgba(6,8,32,0.85)",
        backdropFilter: "blur(14px)",
        borderColor: color + "30",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${glow}`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>

      {/* Corner ambient */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, transform: "translate(30%,-30%)" }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color + "18", border: `1px solid ${color}40` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            trend === "up" ? "bg-emerald-500/15 text-emerald-400" : trend === "down" ? "bg-red-500/15 text-red-400" : "bg-muted/20 text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
            {trend === "up" ? "+567%" : trend === "down" ? "-0.8%" : "Live"}
          </div>
        )}
      </div>

      <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: color + "aa" }}>{label}</p>
      <p className="text-2xl font-extrabold text-foreground mb-1 font-mono">{value}</p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </motion.div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
export default function SystemPage() {
  const { address, connect } = useWallet();
  const [copied, setCopied]       = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [chartData]               = useState(() => generateChartData());
  const [selectedRange, setSelectedRange] = useState<"7D" | "14D" | "30D">("30D");
  const tickerRef = useRef<HTMLDivElement>(null);
  const displayAddress = address || "0x9b02...8Cd7";
  const shortAddress   = `${displayAddress.slice(0, 6)}…${displayAddress.slice(-4)}`;
  const refLink        = `https://orakzaibond.com/?ref=${displayAddress.slice(0, 10)}`;

  const chartFiltered = selectedRange === "7D" ? chartData.slice(-7) : selectedRange === "14D" ? chartData.slice(-14) : chartData;
  const priceChange   = chartFiltered.length > 1
    ? ((chartFiltered[chartFiltered.length - 1].price - chartFiltered[0].price) / chartFiltered[0].price * 100)
    : 0;

  function copyAddress() {
    navigator.clipboard.writeText(displayAddress).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function copyRef() {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setRefCopied(true); setTimeout(() => setRefCopied(false), 2000);
  }

  function handleDisconnect() {
    window.location.reload();
  }

  useEffect(() => {
    document.title = "Dashboard | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden" style={{ background: "#04060f" }}>
      <Navbar address={address} onConnect={connect} />

      {/* ── News Ticker ─────────────────────────────────────────────── */}
      <div className="fixed top-[64px] left-0 right-0 z-30 border-b overflow-hidden"
        style={{ background: "rgba(4,6,15,0.97)", borderColor: "rgba(0,212,255,0.15)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center">
          {/* LIVE badge */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-r"
            style={{ borderColor: "rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.08)" }}>
            <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-[10px] font-extrabold text-cyan-400 font-mono tracking-widest">LIVE</span>
          </div>
          {/* Scrolling text */}
          <div className="overflow-hidden flex-1" ref={tickerRef}>
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 38, ease: "linear", repeat: Infinity }}
              className="flex whitespace-nowrap gap-0">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="text-xs font-semibold px-8 py-2 inline-block"
                  style={{ color: i % 3 === 0 ? "#eab308" : i % 3 === 1 ? "#22d3ee" : "#94a3b8" }}>
                  {item}
                  <span className="text-muted-foreground/20 ml-8">|</span>
                </span>
              ))}
            </motion.div>
          </div>
          {/* Bell */}
          <div className="flex-shrink-0 px-3">
            <Bell className="w-3.5 h-3.5 text-muted-foreground/40" />
          </div>
        </div>
      </div>

      <main className="flex-1 pt-[112px] pb-20">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* ── Dashboard Header ──────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ boxShadow: ["0 0 4px #34d399", "0 0 12px #34d399", "0 0 4px #34d399"] }}
                  transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Live Dashboard</span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground">
                Orakzai{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-cyan-400">
                  User Portal
                </span>
              </h1>
              <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">Polygon PoS · Chain ID 137 · Real-time</p>
            </div>

            {/* Connected wallet indicator */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
              style={{ background: "rgba(6,8,32,0.9)", borderColor: "rgba(0,212,255,0.2)", backdropFilter: "blur(12px)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
                <Wallet className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">Connected</p>
                <p className="text-xs font-bold font-mono text-cyan-300">{shortAddress}</p>
              </div>
              <button onClick={copyAddress}
                className="w-7 h-7 rounded-lg border border-border bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <div className="w-px h-6 bg-border" />
              <button onClick={handleDisconnect}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </motion.div>
          </div>

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              delay={0}
              icon={<Coins className="w-5 h-5" />}
              label="Token Balance"
              value="750 OKBOND"
              sub={`≈ $${(750 * ICO_PRICE_USD).toFixed(2)} USD at current ICO price`}
              color="#eab308"
              glow="rgba(234,179,8,0.2)"
            />
            <StatCard
              delay={0.08}
              icon={<TrendingUp className="w-5 h-5" />}
              label="Potential Profit"
              value={`$${(750 * TARGET_PRICE).toFixed(2)}`}
              sub={`Entry $0.15 → Target $1.00 · +${ROI_PCT.toFixed(0)}% ROI`}
              trend="up"
              color="#22d3ee"
              glow="rgba(34,211,238,0.2)"
            />
            <StatCard
              delay={0.16}
              icon={<Gift className="w-5 h-5" />}
              label="Referral Rewards"
              value="26.7 POL"
              sub={`≈ $${(26.7 * POL_USD).toFixed(2)} USD · 42 total referrals`}
              trend="neutral"
              color="#a78bfa"
              glow="rgba(167,139,250,0.2)"
            />
          </div>

          {/* ── Middle Row: Chart + Referral ──────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* Live Price Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl border p-6"
              style={{
                background: "rgba(6,8,32,0.85)",
                backdropFilter: "blur(14px)",
                borderColor: "rgba(0,212,255,0.15)",
              }}>

              {/* Chart header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Live Chart</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold font-mono text-foreground">
                      {OKBOND_POL.toFixed(4)} <span className="text-sm text-muted-foreground font-normal">POL</span>
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${priceChange >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">OKBOND / POL · ≈ ${ICO_PRICE_USD} USD</p>
                </div>

                {/* Range selector */}
                <div className="flex rounded-xl border border-border overflow-hidden text-xs font-bold">
                  {(["7D", "14D", "30D"] as const).map((r) => (
                    <button key={r} onClick={() => setSelectedRange(r)}
                      className={`px-3 py-2 transition-all ${selectedRange === r ? "bg-cyan-500/15 text-cyan-400" : "text-muted-foreground/60 hover:text-foreground"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts area chart */}
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartFiltered} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 9, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false} interval={selectedRange === "7D" ? 0 : selectedRange === "14D" ? 1 : 4} />
                    <YAxis tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 9, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false} width={48}
                      tickFormatter={(v) => v.toFixed(3)}
                      domain={["auto", "auto"]} />
                    <Tooltip content={(props) => <ChartTooltip {...(props as { active?: boolean; payload?: { value: number }[]; label?: string })} />} />
                    <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2}
                      fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: "#22d3ee", stroke: "#04060f", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom info row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {[
                  { label: "Phase 1 Price", value: "$0.15",  color: "text-primary" },
                  { label: "Target Price",  value: "$1.00",  color: "text-emerald-400" },
                  { label: "Network",       value: "Polygon PoS", color: "text-purple-400" },
                  { label: "Contract",      value: TOKEN_ADDRESS.slice(0,10)+"…", color: "text-cyan-400", href: EXPLORER },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-0.5">{s.label}</p>
                    {s.href
                      ? <a href={s.href} target="_blank" rel="noreferrer"
                          className={`text-xs font-bold font-mono ${s.color} hover:underline flex items-center gap-0.5`}>
                          {s.value} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      : <p className={`text-xs font-bold font-mono ${s.color}`}>{s.value}</p>}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral Empire */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="rounded-2xl border p-6 flex flex-col"
              style={{
                background: "rgba(6,8,32,0.85)",
                backdropFilter: "blur(14px)",
                borderColor: "rgba(234,179,8,0.18)",
              }}>

              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70">Referral Empire</span>
              </div>
              <h3 className="text-lg font-extrabold text-foreground mb-4">Your Network</h3>

              {/* Referral link */}
              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-1.5">Your Referral Link</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: "rgba(234,179,8,0.25)", background: "rgba(234,179,8,0.05)" }}>
                  <span className="flex-1 text-xs font-mono text-primary/80 truncate">{refLink}</span>
                  <motion.button onClick={copyRef} whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
                    style={{ borderColor: refCopied ? "rgba(52,211,153,0.4)" : "rgba(234,179,8,0.3)", background: refCopied ? "rgba(52,211,153,0.1)" : "rgba(234,179,8,0.1)" }}>
                    {refCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-primary" />}
                  </motion.button>
                </div>
              </div>

              {/* Tier breakdown */}
              <div className="space-y-3 flex-1">
                {REF_TIERS.map((tier, i) => (
                  <motion.div key={tier.level} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-3.5 rounded-xl border transition-all"
                    style={{ borderColor: tier.color + "28", background: tier.color + "08" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${tier.glow}`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md"
                          style={{ background: tier.color + "20", color: tier.color, border: `1px solid ${tier.color}40` }}>
                          {tier.level}
                        </span>
                        <span className="text-xs text-muted-foreground/70">{tier.label}</span>
                      </div>
                      <span className="text-xs font-extrabold font-mono" style={{ color: tier.color }}>{tier.pct}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground/60 font-mono">{tier.partners} partners</span>
                      <span className="font-bold font-mono" style={{ color: tier.color }}>{tier.earned}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${tier.color}99, ${tier.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((tier.partners / 30) * 100, 100)}%` }}
                        transition={{ duration: 1.2, delay: 0.6 + i * 0.15 }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <a href="/community" className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all"
                style={{ background: "linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.08))", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(234,179,8,0.25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <Star className="w-3.5 h-3.5" />
                Grow Your Network
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          </div>

          {/* ── Transaction History ────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(6,8,32,0.85)",
              backdropFilter: "blur(14px)",
              borderColor: "rgba(255,255,255,0.06)",
            }}>

            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Transaction History</span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground">Activity Log</h3>
              </div>
              <a href={EXPLORER} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 hover:text-cyan-400 transition-colors">
                View All on Polygonscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["Date", "Type", "Amount", "USD Value", "Status", "Tx Hash"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50 font-mono px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TXS.map((tx, i) => (
                    <motion.tr key={tx.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="border-t transition-colors group cursor-pointer"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground/70">{tx.date}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            tx.type === "Buy" ? "bg-primary/15 text-primary" :
                            tx.type === "Lottery Entry" ? "bg-violet-500/15 text-violet-400" :
                            "bg-emerald-500/15 text-emerald-400"
                          }`}>
                            {tx.type === "Buy" ? <Coins className="w-3.5 h-3.5" /> :
                             tx.type === "Lottery Entry" ? <Zap className="w-3.5 h-3.5" /> :
                             <Gift className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-bold text-foreground">{tx.type}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold font-mono text-foreground">{tx.amount}</td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground/70">{tx.value}</td>

                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                          tx.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-sky-500/15 text-sky-400 border border-sky-500/25"
                        }`}>
                          {tx.status === "completed"
                            ? <CheckCircle2 className="w-2.5 h-2.5" />
                            : <RefreshCw className="w-2.5 h-2.5" />}
                          {tx.status === "completed" ? "Completed" : "Refunded"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50 hover:text-cyan-400 transition-colors">
                          {tx.hash} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
              <p className="text-[11px] text-muted-foreground/50 font-mono">
                Showing 6 of 6 transactions · Polygon PoS
              </p>
              <a href={QUICKSWAP} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Buy More OKBOND <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>

          {/* ── Quick Action Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Enter Lottery",   icon: <Zap className="w-4 h-4" />,        href: "/#lottery",  color: "#eab308", glow: "rgba(234,179,8,0.2)"   },
              { label: "Buy OKBOND",      icon: <Coins className="w-4 h-4" />,       href: "/ico",       color: "#22d3ee", glow: "rgba(34,211,238,0.2)"  },
              { label: "Community Hub",   icon: <Users className="w-4 h-4" />,       href: "/community", color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
              { label: "View on Chain",   icon: <Shield className="w-4 h-4" />,      href: EXPLORER,     color: "#34d399", glow: "rgba(52,211,153,0.2)"  },
            ].map((a, i) => (
              <motion.a key={a.label} href={a.href}
                target={a.href.startsWith("http") ? "_blank" : undefined}
                rel={a.href.startsWith("http") ? "noreferrer" : undefined}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl border font-bold text-sm transition-all"
                style={{ background: "rgba(6,8,32,0.85)", backdropFilter: "blur(10px)", borderColor: a.color + "22", color: a.color }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${a.glow}`; (e.currentTarget as HTMLElement).style.borderColor = a.color + "55"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = a.color + "22"; }}>
                {a.icon}
                {a.label}
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
              </motion.a>
            ))}
          </div>

          {/* ── Security Note ──────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-6 flex items-center gap-3 px-5 py-4 rounded-2xl border"
            style={{ borderColor: "rgba(52,211,153,0.15)", background: "rgba(52,211,153,0.04)" }}>
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-muted-foreground/60">
              <span className="font-bold text-emerald-400">Non-custodial & Secure</span> —
              Your OKBOND tokens are held by the smart contract only. Orakzai Bond never holds,
              manages, or has access to your wallet funds. Your keys, your wealth.
            </p>
            <a href="https://polygonscan.com/address/0x5bc55d4b347e39b986864e28604ddca5de6357b7"
              target="_blank" rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline">
              Verify <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
