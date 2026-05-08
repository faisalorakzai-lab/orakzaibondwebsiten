import { motion } from "framer-motion";
import { useProtocolMetrics } from "@/hooks/useProtocolMetrics";
import { useWallet } from "@/hooks/useWallet";
import {
  TrendingUp, Lock, Flame, Landmark, Shield, Ticket,
  Users, Rocket, Activity, Wifi, RefreshCw, ExternalLink, Circle,
  DollarSign, BarChart3, Zap,
} from "lucide-react";
import { useICO } from "@/hooks/useICO";

function fmt(val: string, decimals = 2): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(decimals);
}

function MetricCard({
  icon, label, value, sub, glow, live, delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  glow?: boolean;
  live?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`relative rounded-2xl border p-5 overflow-hidden group hover:border-primary/40 transition-all duration-300
        ${glow
          ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-[0_0_24px_rgba(234,179,8,0.08)]"
          : "bg-card/60 border-border/40 backdrop-blur-sm"
        }`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(234,179,8,0.06) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${glow ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
          {icon}
        </div>
        {live && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold leading-none ${glow ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </motion.div>
  );
}

function NetworkBadge({ status }: { status: "online" | "degraded" | "offline" }) {
  const colors = { online: "text-emerald-400", degraded: "text-amber-400", offline: "text-red-400" };
  const labels = { online: "POLYGON MAINNET LIVE", degraded: "DEGRADED", offline: "OFFLINE" };
  return (
    <span className={`flex items-center gap-1.5 text-xs font-mono font-bold ${colors[status]}`}>
      <Wifi className="w-3 h-3" />
      {labels[status]}
    </span>
  );
}

export default function DashboardPage() {
  const { metrics, loading, refresh } = useProtocolMetrics(30_000);
  const { provider, address } = useWallet();
  const { stats: icoStats } = useICO(provider, address);

  const raised   = icoStats?.totalRaisedPOL  || metrics.icoRaised;
  const hardCap  = icoStats?.hardCap         || metrics.icoHardCap;
  const progress = icoStats
    ? (parseFloat(raised) / parseFloat(hardCap || "1")) * 100
    : metrics.icoProgress;

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-primary font-mono tracking-widest uppercase">Protocol Command Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Ecosystem Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Live Polygon Mainnet · Real-time protocol intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <NetworkBadge status={metrics.networkStatus} />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:border-primary/30"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Primary metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<TrendingUp className="w-5 h-5" />}  label="Total Value Locked"    value={`${fmt(metrics.totalValueLocked)} POL`} sub="Staking + Vault + ICO" glow live delay={0.05} />
        <MetricCard icon={<Lock className="w-5 h-5" />}        label="Total Staked"           value={`${fmt(metrics.totalStaked)} OKBOND`}  sub={`${metrics.totalStakers} stakers`} live delay={0.1} />
        <MetricCard icon={<Flame className="w-5 h-5" />}       label="Tokens Burned"          value={`${fmt(metrics.tokensBurned)} OKBOND`} sub="Permanent deflation" delay={0.15} />
        <MetricCard icon={<Landmark className="w-5 h-5" />}    label="Treasury Balance"       value={`${fmt(metrics.treasuryBalance)} POL`} sub="Protocol treasury" delay={0.2} />
        <MetricCard icon={<Shield className="w-5 h-5" />}      label="Vault Reserves"         value={`${fmt(metrics.vaultReserves)} POL`}  sub="Reserve backing" live delay={0.25} />
        <MetricCard icon={<Ticket className="w-5 h-5" />}      label="Lottery Pool"           value={`${fmt(metrics.lotteryPool)} OKBOND`} sub="Active prize pool" delay={0.3} />
        <MetricCard icon={<Zap className="w-5 h-5" />}         label="Base APY"               value={`${metrics.apy}%`}                    sub="Up to 24% max APY" glow delay={0.35} />
        <MetricCard icon={<DollarSign className="w-5 h-5" />}  label="Rewards Distributed"   value={`${fmt(metrics.rewardsDistributed)} OKBOND`} sub="All time" delay={0.4} />
      </div>

      {/* ICO Progress + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* ICO Progress */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">ICO Progress</span>
              {(icoStats?.icoActive || metrics.icoActive) && (
                <span className="text-[10px] bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono font-bold">ACTIVE</span>
              )}
            </div>
            <a
              href="/ico"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Participate <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Raised</span>
              <span className="text-foreground font-semibold">{fmt(raised, 4)} POL</span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-yellow-400 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(2)}% Complete</span>
              <span>Hard Cap: {fmt(hardCap, 0)} POL</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-border/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tokens Sold</p>
              <p className="text-lg font-bold text-foreground">{fmt(metrics.tokensSold)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
              <p className="text-lg font-bold text-foreground">{fmt(metrics.totalSupply)}</p>
            </div>
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Network Status</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Polygon RPC",       ok: metrics.networkStatus === "online" },
              { label: "OKBOND Token",      ok: parseFloat(metrics.totalSupply) > 0 },
              { label: "ICO Contract",      ok: metrics.icoProgress >= 0 },
              { label: "Staking Contract",  ok: parseFloat(metrics.totalStaked) >= 0 },
              { label: "Vault Contract",    ok: parseFloat(metrics.vaultReserves) >= 0 },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-mono font-bold ${ok ? "text-emerald-400" : "text-red-400"}`}>
                  <Circle className={`w-2 h-2 fill-current ${ok ? "text-emerald-400" : "text-red-400"}`} />
                  {ok ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            ))}
          </div>

          {metrics.lastUpdated && (
            <p className="text-[10px] text-muted-foreground/50 mt-4 font-mono">
              Last sync: {metrics.lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </motion.div>
      </div>

      {/* Contract Addresses */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Verified Contract Addresses</span>
          <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-mono">Polygon Mainnet</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "OKBOND Token",      addr: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F" },
            { label: "ICO Contract",      addr: "0x7BB2458740c4F491277973212309d831385Ab9D7" },
            { label: "Vault",             addr: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08" },
            { label: "Staking",           addr: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e" },
            { label: "Notebook Registry", addr: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3" },
          ].map(({ label, addr }) => (
            <a
              key={label}
              href={`https://polygonscan.com/address/${addr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-xs font-mono text-foreground">{addr.slice(0, 10)}…{addr.slice(-8)}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
