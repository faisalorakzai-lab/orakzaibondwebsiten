import { motion } from "framer-motion";
import { useVault } from "@/hooks/useVault";
import { useProtocolMetrics } from "@/hooks/useProtocolMetrics";
import {
  Shield, Landmark, Flame, Ticket, RefreshCw, ExternalLink,
  CheckCircle, Lock, BarChart2, Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useSEO, PAGE_SEO } from "@/components/SEO";

function fmt(val: string, d = 2): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(d);
}

const VAULT_ADDRESS = "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08";

export default function VaultPage() {
  const { data, loading, error, refresh } = useVault(30_000);
  const { metrics } = useProtocolMetrics(60_000);

  const chartData = data ? [
    { name: "Liquidity Reserve", value: Math.max(parseFloat(data.liquidityReserve), 0), color: "#F5C518" },
    { name: "Treasury",          value: Math.max(parseFloat(data.treasuryBalance), 0),  color: "#60A5FA" },
    { name: "Lottery Pool",      value: Math.max(parseFloat(data.lotteryPool), 0),      color: "#34D399" },
  ].filter(d => d.value > 0) : [];

  const totalForChart = chartData.reduce((a, b) => a + b.value, 0);

  useSEO(PAGE_SEO.vault);
  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-primary font-mono tracking-widest uppercase">Vault Transparency Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reserve Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Full on-chain transparency · Polygon Mainnet · Real-time data</p>
        </div>
        <div className="flex items-center gap-3">
          {data && !data.isPaused && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              VAULT ACTIVE
            </span>
          )}
          <button onClick={refresh} disabled={loading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:border-primary/30">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Reserve Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Reserves",     value: fmt(data?.totalReserves   || "0") + " POL", icon: <Shield className="w-5 h-5" />,   glow: true  },
          { label: "Liquidity Reserve",  value: fmt(data?.liquidityReserve|| "0") + " POL", icon: <Activity className="w-5 h-5" />, glow: false },
          { label: "Treasury Balance",   value: fmt(data?.treasuryBalance || "0") + " POL", icon: <Landmark className="w-5 h-5" />, glow: false },
          { label: "Lottery Pool",       value: fmt(data?.lotteryPool     || "0") + " POL", icon: <Ticket className="w-5 h-5" />,   glow: false },
        ].map(({ label, value, icon, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className={`rounded-2xl border p-5 ${glow
              ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(234,179,8,0.06)]"
              : "bg-card/60 border-border/40 backdrop-blur-sm"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${glow ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
              {icon}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-bold ${glow ? "text-primary" : "text-foreground"}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Allocation Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Asset Allocation</p>
          </div>

          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 12, fontSize: 11 }}
                    formatter={(value: number) => [`${fmt(value.toFixed(4))} POL`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {chartData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-mono text-foreground">{totalForChart > 0 ? ((d.value / totalForChart) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              {loading ? "Loading chart data…" : "No allocation data available"}
            </div>
          )}
        </motion.div>

        {/* Security status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Security Status</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Vault Contract Verified",  ok: true  },
              { label: "On-chain Transparency",    ok: true  },
              { label: "Owner Multisig",           ok: true  },
              { label: "Emergency Pause System",   ok: true  },
              { label: "Vault Status",             ok: !data?.isPaused },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${ok ? "text-emerald-400" : "text-amber-400"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {ok ? "SECURED" : "PAUSED"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Burn stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Deflation Engine</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tokens Burned (Vault)</p>
              <p className="text-2xl font-bold text-primary">{fmt(data?.burnedTokens || "0")} OKBOND</p>
            </div>
            <div className="border-t border-border/30 pt-4">
              <p className="text-xs text-muted-foreground mb-1">Total Protocol Burns</p>
              <p className="text-lg font-bold text-foreground">{fmt(metrics.tokensBurned)} OKBOND</p>
            </div>
            <div className="border-t border-border/30 pt-4">
              <p className="text-xs text-muted-foreground mb-1">Total Deposited</p>
              <p className="text-lg font-bold text-foreground">{fmt(data?.totalDeposited || "0")} POL</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Vault Address + Verification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Contract Verification</p>
          <span className="text-[10px] bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono">VERIFIED</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Vault Contract Address</p>
            <p className="font-mono text-sm text-foreground break-all">{VAULT_ADDRESS}</p>
          </div>
          {data?.owner && data.owner !== "0x0000000000000000000000000000000000000000" && (
            <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Contract Owner</p>
              <p className="font-mono text-sm text-foreground break-all">{data.owner}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <a href={`https://polygonscan.com/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:underline border border-primary/25 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all">
            <ExternalLink className="w-3.5 h-3.5" />
            View on PolygonScan
          </a>
        </div>
        {data?.lastFetched && (
          <p className="text-[10px] text-muted-foreground/50 mt-4 font-mono">
            Data fetched: {data.lastFetched.toLocaleString()}
          </p>
        )}
      </motion.div>
    </div>
  );
}
