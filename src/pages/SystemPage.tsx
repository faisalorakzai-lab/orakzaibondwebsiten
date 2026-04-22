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
  const { address } = useWallet();
  const [copied, setCopied]       = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [chartData]               = useState(() => generateChartData());
  const [selectedRange, setSelectedRange] = useState<"7D" | "14D" | "30D">("30D");
  const tickerRef = useRef<HTMLDivElement>(null);
  const displayAddress = address || "0x9b02...8Cd7";
  const shortAddress   = `${displayAddress.slice(0, 6)}…${displayAddress.slice(-4)}`;
  const refLink        = `https://orakzaibond.com/?ref=${displayAddress.slice(0, 10)}`;

  const chartFiltered = selectedRange === "7D" ? chartData.slice(-7) : selectedRange === "14D" ? chartData.slice(-14) : chartData;

  function copyAddress() {
    navigator.clipboard.writeText(displayAddress).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function copyRef() {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setRefCopied(true); setTimeout(() => setRefCopied(false), 2000);
  }

  useEffect(() => {
    document.title = "Dashboard | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden" style={{ background: "#04060f" }}>
      {/* ── News Ticker ─────────────────────────────────────────────── */}
      <div className="sticky top-0 left-0 right-0 z-30 border-b overflow-hidden"
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

      <main className="flex-1 pt-12 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-cyan-500 rounded-full" />
                <h1 className="text-4xl font-black tracking-tight">User <span className="text-cyan-400">Dashboard</span></h1>
              </motion.div>
              <p className="text-muted-foreground font-medium">Welcome back, <span className="text-foreground font-bold">{shortAddress}</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Polygon Mainnet</span>
              </div>
              <button onClick={copyAddress} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-xs font-bold uppercase tracking-wider">{copied ? "Copied" : "Copy Address"}</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={<Coins className="w-5 h-5" />} label="OKBOND Balance" value="1,250.00" sub="≈ $187.50 USD" trend="up" color="#eab308" glow="rgba(234,179,8,0.25)" />
            <StatCard icon={<Gift className="w-5 h-5" />} label="Lottery Entries" value="25 Tickets" sub="Next Draw: June 9" trend="neutral" color="#22d3ee" glow="rgba(34,211,238,0.25)" />
            <StatCard icon={<Users className="w-5 h-5" />} label="Referral Earnings" value="26.7 POL" sub="≈ $13.35 USD" trend="up" color="#a78bfa" glow="rgba(167,139,250,0.25)" />
            <StatCard icon={<Shield className="w-5 h-5" />} label="Protected Capital" value="$125.00" sub="100% Refundable" trend="neutral" color="#10b981" glow="rgba(16,185,129,0.25)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Chart & Transactions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chart Card */}
              <div className="rounded-3xl border border-white/5 bg-[#060818]/60 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      OKBOND / POL
                    </h3>
                    <p className="text-xs text-muted-foreground">Live price action on Polygon</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(["7D", "14D", "30D"] as const).map((r) => (
                      <button key={r} onClick={() => setSelectedRange(r)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedRange === r ? "bg-cyan-500 text-black" : "text-muted-foreground hover:text-foreground"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartFiltered}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} dy={10} />
                      <YAxis hide domain={["dataMin - 0.02", "dataMax + 0.02"]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transactions */}
              <div className="rounded-3xl border border-white/5 bg-[#060818]/60 backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.02] text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Value</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">TX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_TXS.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-foreground">{tx.type}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{tx.date}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-bold text-foreground">{tx.amount}</td>
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{tx.value}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                              tx.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {tx.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="w-4 h-4 ml-auto" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Referral & Quick Actions */}
            <div className="space-y-8">
              {/* Referral Card */}
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-xl font-black mb-2">Refer & Earn</h3>
                <p className="text-sm text-muted-foreground mb-6">Invite friends and earn up to <span className="text-primary font-bold">10% commission</span> on their purchases.</p>

                <div className="space-y-4 mb-8">
                  {REF_TIERS.map((t) => (
                    <div key={t.level} className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: t.color + "20", color: t.color, border: `1px solid ${t.color}40` }}>{t.level}</div>
                        <div>
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground">{t.partners} Partners</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black" style={{ color: t.color }}>{t.earned}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{t.pct}% Rate</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Your Referral Link</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground truncate">
                      {refLink}
                    </div>
                    <button onClick={copyRef} className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                      {refCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Quick Actions</h4>
                <a href={QUICKSWAP} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Swap on QuickSwap</p>
                      <p className="text-[10px] text-muted-foreground">Trade OKBOND instantly</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                </a>

                <a href={EXPLORER} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">View on Explorer</p>
                      <p className="text-[10px] text-muted-foreground">Verify on PolygonScan</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>

                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Disconnect Wallet</p>
                      <p className="text-[10px] text-muted-foreground">End current session</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
