import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wallet, Copy, Check, TrendingUp, TrendingDown, Users, Gift,
  Shield, LogOut, Coins, BarChart3, Clock, ChevronRight,
  ExternalLink, Star, Zap, Activity, RefreshCw, Lock,
  CheckCircle2, XCircle, ArrowUpRight, Bell, Globe, Loader2, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Contract, formatEther, formatUnits, JsonRpcProvider, EventLog, Log } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import LOTTERY_ABI from "@/lib/contractABI.json";

/* ── Live Contract Addresses (Polygon Mainnet) ───────────────────────── */
const TOKEN_ADDRESS    = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const ICO_ADDRESS      = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
const REFERRAL_ADDRESS = "0x66471251A19D7A862e931340998cADFa9a411E9B";
const LOTTERY_ADDRESS  = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const ICO_PRICE_USD    = 0.15;
const POL_USD          = 0.50;
const EXPLORER         = "https://polygonscan.com";
const TX_EXPLORER      = `${EXPLORER}/token/${TOKEN_ADDRESS}`;
const QUICKSWAP        = `https://dapp.quickswap.exchange/swap?type=v3&from=${TOKEN_ADDRESS}&to=ETH`;

const FALLBACK_RPC = "https://polygon-rpc.com";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

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

/* ── Tx classification ───────────────────────────────────────────────── */
type TxItem = {
  id: string;
  date: string;
  ts: number;
  type: string;
  amount: string;
  value: string;
  status: "completed";
  hash: string;
  direction: "in" | "out";
};

function classifyTransfer(from: string, to: string, userAddr: string): { type: string; direction: "in" | "out" } {
  const ico = ICO_ADDRESS.toLowerCase();
  const lot = LOTTERY_ADDRESS.toLowerCase();
  const ref = REFERRAL_ADDRESS.toLowerCase();
  const u   = userAddr.toLowerCase();
  const f   = from.toLowerCase();
  const t   = to.toLowerCase();

  if (t === u) {
    if (f === ico) return { type: "Buy", direction: "in" };
    if (f === lot) return { type: "Lottery Refund", direction: "in" };
    if (f === ref) return { type: "Referral Bonus", direction: "in" };
    if (f === "0x0000000000000000000000000000000000000000") return { type: "Mint", direction: "in" };
    return { type: "Received", direction: "in" };
  }
  if (f === u) {
    if (t === lot) return { type: "Lottery Entry", direction: "out" };
    if (t === ico) return { type: "Refund Sent", direction: "out" };
    return { type: "Sent", direction: "out" };
  }
  return { type: "Transfer", direction: "in" };
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortHash(h: string): string {
  return h.slice(0, 6) + "…" + h.slice(-4);
}

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
  icon, label, value, sub, trend, color, glow, delay = 0, loading = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  trend?: "up" | "down" | "neutral"; color: string; glow: string; delay?: number; loading?: boolean;
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
            {trend === "up" ? "Live" : trend === "down" ? "—" : "Live"}
          </div>
        )}
      </div>

      <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: color + "aa" }}>{label}</p>
      <p className="text-2xl font-extrabold text-foreground mb-1 font-mono flex items-center gap-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin opacity-70" /> : value}
      </p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </motion.div>
  );
}

/* ── Build chart data from current ICO price + localStorage history ────────── */
function buildChartData(currentPolPerOkbond: number | null): { date: string; price: number }[] {
  const KEY = "okbond_price_history_v1";
  const now = Date.now();
  let history: { ts: number; price: number }[] = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch { /* ignore */ }

  // Append current sample (max 1 per hour)
  if (currentPolPerOkbond && currentPolPerOkbond > 0) {
    const lastSample = history[history.length - 1];
    if (!lastSample || now - lastSample.ts > 60 * 60 * 1000) {
      history.push({ ts: now, price: currentPolPerOkbond });
      if (history.length > 60) history = history.slice(-60);
      try { localStorage.setItem(KEY, JSON.stringify(history)); } catch { /* ignore */ }
    }
  }

  // If we have no history and no current sample, nothing to draw
  if (history.length === 0 && !currentPolPerOkbond) return [];

  // If only one sample, synthesize a flat line so the chart renders gracefully
  if (history.length < 2 && currentPolPerOkbond) {
    const base = currentPolPerOkbond;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400000);
      return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), price: base };
    });
  }

  return history.map(h => ({
    date: new Date(h.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: parseFloat(h.price.toFixed(4)),
  }));
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
export default function SystemPage() {
  const { address, provider } = useWallet();
  const { stats, userStats, loading: icoLoading, refresh: refreshIco } = useICO(provider, address);

  const [copied, setCopied]       = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"7D" | "14D" | "30D">("30D");
  const tickerRef = useRef<HTMLDivElement>(null);

  // Live wallet state
  const [okbondBalance, setOkbondBalance] = useState<string | null>(null);
  const [polBalance, setPolBalance]       = useState<string | null>(null);
  const [balLoading, setBalLoading]       = useState(false);

  // Lottery state
  const [hasEntered, setHasEntered]       = useState<boolean | null>(null);
  const [protectedDeposit, setProtectedDeposit] = useState<string | null>(null);
  const [isLotteryWinner, setIsLotteryWinner]   = useState<boolean>(false);

  // Activity (real on-chain transfers)
  const [activity, setActivity]           = useState<TxItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Refresh trigger
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const displayAddress = address || "0x0000…0000";
  const shortAddress   = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect Wallet";
  const refLink        = address ? `https://orakzaibond.com/?ref=${address}` : "Connect wallet to get your link";

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function copyRef() {
    if (!address) return;
    navigator.clipboard.writeText(refLink).catch(() => {});
    setRefCopied(true); setTimeout(() => setRefCopied(false), 2000);
  }

  /* ── Fetch real balances ─────────────────────────────────────────────── */
  const fetchBalances = useCallback(async () => {
    if (!address) {
      setOkbondBalance(null);
      setPolBalance(null);
      return;
    }
    setBalLoading(true);
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const [tokenBal, decimals, native] = await Promise.all([
        token.balanceOf(address).catch(() => BigInt(0)),
        token.decimals().catch(() => 18),
        rpc.getBalance(address).catch(() => BigInt(0)),
      ]);
      setOkbondBalance(formatUnits(tokenBal, Number(decimals)));
      setPolBalance(formatEther(native));
    } catch (err) {
      console.warn("Balance fetch error:", err);
    } finally {
      setBalLoading(false);
    }
  }, [address, provider]);

  /* ── Fetch lottery state ─────────────────────────────────────────────── */
  const fetchLottery = useCallback(async () => {
    if (!address) {
      setHasEntered(null);
      setProtectedDeposit(null);
      setIsLotteryWinner(false);
      return;
    }
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const lot = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, rpc);
      const [entered, deposit, winner] = await Promise.all([
        lot.hasEntered(address).catch(() => false),
        lot.deposits(address).catch(() => BigInt(0)),
        lot.isWinner(address).catch(() => false),
      ]);
      setHasEntered(Boolean(entered));
      setProtectedDeposit(formatUnits(deposit, 18));
      setIsLotteryWinner(Boolean(winner));
    } catch (err) {
      console.warn("Lottery fetch error:", err);
    }
  }, [address, provider]);

  /* ── Fetch on-chain transfer history (real activity) ─────────────────── */
  const fetchActivity = useCallback(async () => {
    if (!address) {
      setActivity([]);
      return;
    }
    setActivityLoading(true);
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const head = await rpc.getBlockNumber();
      // Polygon ~2s per block → 200k blocks ≈ ~5 days. Adjust for coverage.
      const fromBlock = Math.max(0, head - 250_000);
      const [outLogs, inLogs] = await Promise.all([
        token.queryFilter(token.filters.Transfer(address, null), fromBlock).catch(() => []),
        token.queryFilter(token.filters.Transfer(null, address), fromBlock).catch(() => []),
      ]);
      const all: Log[] = [...outLogs, ...inLogs];
      // Resolve block timestamps in batch (cap to most recent 25 to limit RPC load)
      const sorted = all.sort((a, b) => (b.blockNumber - a.blockNumber)).slice(0, 25);
      const blockCache: Record<number, number> = {};
      const items: TxItem[] = [];
      for (const log of sorted) {
        try {
          let evt: EventLog | null = null;
          if (log instanceof EventLog) evt = log;
          else {
            const parsed = token.interface.parseLog({ topics: [...log.topics], data: log.data });
            if (!parsed) continue;
            evt = { ...log, args: parsed.args, fragment: parsed.fragment, eventName: parsed.name } as unknown as EventLog;
          }
          const from = String(evt.args?.[0] || "");
          const to   = String(evt.args?.[1] || "");
          const valueRaw = evt.args?.[2] ? BigInt(evt.args[2]) : BigInt(0);
          if (!blockCache[log.blockNumber]) {
            const blk = await rpc.getBlock(log.blockNumber);
            blockCache[log.blockNumber] = blk?.timestamp || 0;
          }
          const ts = blockCache[log.blockNumber];
          const cls = classifyTransfer(from, to, address);
          const amount = parseFloat(formatUnits(valueRaw, 18));
          items.push({
            id: `${log.transactionHash}-${log.index}`,
            date: ts ? formatDate(ts) : "—",
            ts: ts || 0,
            type: cls.type,
            amount: `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} OKBOND`,
            value: `$${(amount * ICO_PRICE_USD).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
            status: "completed",
            hash: log.transactionHash,
            direction: cls.direction,
          });
        } catch (err) {
          console.warn("Activity log parse error:", err);
        }
      }
      items.sort((a, b) => b.ts - a.ts);
      setActivity(items.slice(0, 10));
    } catch (err) {
      console.warn("Activity fetch error:", err);
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [address, provider]);

  /* ── Fetch all data ──────────────────────────────────────────────────── */
  useEffect(() => {
    fetchBalances();
    fetchLottery();
    fetchActivity();
    setLastRefresh(new Date());
  }, [fetchBalances, fetchLottery, fetchActivity, refreshTick]);

  function refreshAll() {
    setRefreshTick(t => t + 1);
    refreshIco();
  }

  /* ── Derived values ──────────────────────────────────────────────────── */
  const okbondUsd = okbondBalance ? parseFloat(okbondBalance) * ICO_PRICE_USD : 0;
  const polUsd    = polBalance ? parseFloat(polBalance) * POL_USD : 0;
  const protectedUsd = protectedDeposit ? parseFloat(protectedDeposit) * ICO_PRICE_USD : 0;
  const refEarningsPol = userStats?.referralEarnings ? parseFloat(userStats.referralEarnings) : 0;
  const refEarningsUsd = refEarningsPol * POL_USD;

  // Live POL→OKBOND price from ICO (tokensPerPOL is scaled, e.g. 600000 means 0.6 OKBOND/POL after div by 1e6)
  // Per the buy logic in useICO: tokenAmount = value * rate / 1e6
  // So 1 POL → (rate/1e6) OKBOND, meaning 1 OKBOND = 1e6/rate POL
  const polPerOkbond = useMemo(() => {
    if (!stats?.tokensPerPOL) return null;
    const rate = parseFloat(stats.tokensPerPOL);
    if (!rate) return null;
    return 1_000_000 / rate;
  }, [stats?.tokensPerPOL]);

  const chartFull = useMemo(() => buildChartData(polPerOkbond), [polPerOkbond, refreshTick]);
  const chartFiltered = selectedRange === "7D" ? chartFull.slice(-7) : selectedRange === "14D" ? chartFull.slice(-14) : chartFull;

  const refTiers = useMemo(() => {
    const counts = userStats?.levelCounts || ["0", "0", "0", "0", "0"];
    const earnings = userStats?.levelEarnings || ["0", "0", "0", "0", "0"];
    return [
      { level: "L1", label: "Direct Referrals", pct: 10, partners: parseInt(counts[0] || "0"), earned: `${parseFloat(earnings[0] || "0").toFixed(2)} POL`, color: "#eab308", glow: "rgba(234,179,8,0.3)"   },
      { level: "L2", label: "Second-Level",      pct: 5,  partners: parseInt(counts[1] || "0"), earned: `${parseFloat(earnings[1] || "0").toFixed(2)} POL`, color: "#22d3ee", glow: "rgba(34,211,238,0.3)"  },
      { level: "L3", label: "Third-Level",       pct: 2,  partners: parseInt(counts[2] || "0"), earned: `${parseFloat(earnings[2] || "0").toFixed(2)} POL`, color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
    ];
  }, [userStats]);

  useEffect(() => {
    document.title = "Dashboard | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  const isConnected = !!address;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden" style={{ background: "#04060f" }}>
      {/* ── News Ticker ─────────────────────────────────────────────── */}
      <div className="sticky top-0 left-0 right-0 z-30 border-b overflow-hidden"
        style={{ background: "rgba(4,6,15,0.97)", borderColor: "rgba(0,212,255,0.15)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-r"
            style={{ borderColor: "rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.08)" }}>
            <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-[10px] font-extrabold text-cyan-400 font-mono tracking-widest">LIVE</span>
          </div>
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
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h1 className="text-4xl font-black tracking-tight">User <span className="text-primary">Dashboard</span></h1>
              </motion.div>
              <p className="text-muted-foreground font-medium">
                {isConnected ? <>Welcome back, <span className="text-foreground font-bold">{shortAddress}</span></> : "Connect your wallet to view live data"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isConnected ? "text-emerald-400" : "text-amber-400"}`}>
                  {isConnected ? "Polygon Mainnet" : "Wallet Disconnected"}
                </span>
              </div>
              <button
                onClick={refreshAll}
                disabled={!isConnected}
                title="Refresh live data"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(balLoading || activityLoading || icoLoading) ? "animate-spin" : ""}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Refresh</span>
              </button>
              <button onClick={copyAddress} disabled={!isConnected}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 transition-all">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-xs font-bold uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Connect prompt */}
          {!isConnected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-300 mb-1">Wallet not connected</p>
                <p className="text-xs text-amber-200/70">
                  Connect your wallet via the navbar to load real-time OKBOND balance, POL balance, lottery status, referral earnings, and on-chain transaction history.
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats Grid — REAL on-chain data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={<Coins className="w-5 h-5" />}
              label="OKBOND Balance"
              value={isConnected && okbondBalance !== null
                ? parseFloat(okbondBalance).toLocaleString("en-US", { maximumFractionDigits: 2 })
                : "—"}
              sub={isConnected && okbondBalance !== null
                ? `≈ $${okbondUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`
                : "Connect wallet"}
              trend="up" color="#eab308" glow="rgba(234,179,8,0.25)"
              loading={isConnected && balLoading && okbondBalance === null}
            />
            <StatCard
              icon={<Wallet className="w-5 h-5" />}
              label="POL Balance"
              value={isConnected && polBalance !== null
                ? parseFloat(polBalance).toLocaleString("en-US", { maximumFractionDigits: 4 })
                : "—"}
              sub={isConnected && polBalance !== null
                ? `≈ $${polUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`
                : "Connect wallet"}
              trend="neutral" color="#a78bfa" glow="rgba(167,139,250,0.25)"
              loading={isConnected && balLoading && polBalance === null}
            />
            <StatCard
              icon={<Gift className="w-5 h-5" />}
              label="Lottery Entry"
              value={isConnected && hasEntered !== null
                ? (hasEntered ? "1 Entry" : "0 Entries")
                : "—"}
              sub={isConnected && hasEntered
                ? (isLotteryWinner ? "🏆 Winner — claim reward" : "Active — awaiting draw")
                : (isConnected ? "Not entered yet" : "Connect wallet")}
              trend={isLotteryWinner ? "up" : "neutral"} color="#22d3ee" glow="rgba(34,211,238,0.25)"
              loading={isConnected && hasEntered === null}
            />
            <StatCard
              icon={<Shield className="w-5 h-5" />}
              label="Protected Capital"
              value={isConnected && protectedDeposit !== null
                ? `${parseFloat(protectedDeposit).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                : "—"}
              sub={isConnected && protectedDeposit !== null
                ? `≈ $${protectedUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} (60% refundable)`
                : "Locked OKBOND in lottery"}
              trend="neutral" color="#10b981" glow="rgba(16,185,129,0.25)"
              loading={isConnected && protectedDeposit === null}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Chart & Transactions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chart Card */}
              <div className="rounded-3xl border border-primary/20 bg-[#060818]/60 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      OKBOND / POL
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {polPerOkbond
                        ? <>Current rate: <span className="text-primary font-mono">1 OKBOND ≈ {polPerOkbond.toFixed(4)} POL</span> · Live from ICO contract</>
                        : "Fetching live rate from ICO contract..."}
                    </p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(["7D", "14D", "30D"] as const).map((r) => (
                      <button key={r} onClick={() => setSelectedRange(r)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedRange === r ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  {chartFiltered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60">
                      <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
                      <p className="text-xs">Building price history…</p>
                      <p className="text-[10px] mt-1 opacity-70">Each visit captures a fresh sample</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartFiltered}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} dy={10} />
                        <YAxis hide domain={["dataMin - 0.01", "dataMax + 0.01"]} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="price" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" animationDuration={1500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Transactions — REAL on-chain Transfer events */}
              <div className="rounded-3xl border border-primary/20 bg-[#060818]/60 backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                    {activityLoading && <Loader2 className="w-4 h-4 animate-spin text-primary/60" />}
                  </h3>
                  <a href={address ? `${EXPLORER}/address/${address}` : TX_EXPLORER}
                     target="_blank" rel="noopener noreferrer"
                     className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                    View All ↗
                  </a>
                </div>
                <div className="overflow-x-auto">
                  {!isConnected ? (
                    <div className="px-6 py-12 text-center text-sm text-muted-foreground/60">
                      Connect wallet to view your on-chain history.
                    </div>
                  ) : activity.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-muted-foreground/60">
                      {activityLoading ? "Loading recent transactions…" : "No recent activity for this wallet."}
                    </div>
                  ) : (
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
                        {activity.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${tx.direction === "in" ? "bg-emerald-400" : "bg-amber-400"}`} />
                                {tx.type}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">{tx.date}</p>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm font-bold text-foreground">{tx.amount}</td>
                            <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{tx.value}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <a href={`${EXPLORER}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
                                 className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                                 title={tx.hash}>
                                {shortHash(tx.hash)}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {lastRefresh && (
                  <div className="px-6 py-3 border-t border-white/5 text-[10px] font-mono text-muted-foreground/60">
                    Last refreshed: {lastRefresh.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Referral & Quick Actions */}
            <div className="space-y-8">
              {/* Referral Card — REAL data from contract */}
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-xl font-black mb-2">Refer & Earn</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Invite friends and earn up to <span className="text-primary font-bold">10% commission</span> on their purchases.
                </p>
                {isConnected && userStats && (
                  <div className="mb-6 pb-4 border-b border-primary/10">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">Total Earnings</p>
                    <p className="text-2xl font-black text-primary font-mono">
                      {refEarningsPol.toFixed(4)} <span className="text-sm font-bold text-muted-foreground">POL</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">≈ ${refEarningsUsd.toFixed(2)} USD</p>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {refTiers.map((t) => (
                    <div key={t.level} className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: t.color + "20", color: t.color, border: `1px solid ${t.color}40` }}>{t.level}</div>
                        <div>
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {isConnected ? `${t.partners} ${t.partners === 1 ? "Partner" : "Partners"}` : "Connect wallet"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black" style={{ color: t.color }}>{isConnected ? t.earned : "—"}</p>
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
                    <button onClick={copyRef} disabled={!isConnected}
                      className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
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

                <a href={`${EXPLORER}/token/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
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
