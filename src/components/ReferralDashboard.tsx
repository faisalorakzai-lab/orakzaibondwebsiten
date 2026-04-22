/**
 * ReferralDashboard — Multi-Level MLM Referral Dashboard
 * Fetches real-time data from the backend which queries ICO smart-contract events.
 * Shows L1/L2/L3 team stats + lottery referral rewards.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, Gift, Trophy, RefreshCw, ExternalLink,
  ChevronDown, ChevronUp, Zap, Activity, Loader2, AlertTriangle,
  CheckCircle2, Clock, Ticket,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LevelSummary {
  level:           number;
  ratePercent:     number;
  count:           number;
  activeCount:     number;
  commissionPOL:   string;
  commissionOKBND: string;
  totalPOLRaised:  string;
}

interface LotteryData {
  referredUsersEntered: number;
  totalEarnedOKBND:     number;
  pendingUsers:         number;
  rewards: {
    buyer:        string;
    rewardTxHash: string;
    okbond:       string;
    timestamp:    number;
  }[];
}

interface DashboardData {
  ok:            boolean;
  address:       string;
  icoPurchases: {
    totalRaisedPOL:   string;
    totalOKBNDEarned: string;
    purchaseCount:    number;
  };
  levels:  LevelSummary[];
  totals: {
    downlineUsers:      number;
    totalCommissionPOL: string;
  };
  lottery:   LotteryData;
  cachedAt:  number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const EXPLORER = "https://polygonscan.com";

function fmt(val: string | number, dp = 4): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "0";
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000)  return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

const LEVEL_META = [
  { color: "amber",   label: "L1 Direct",  icon: "🥇", bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400"  },
  { color: "sky",     label: "L2 Network", icon: "🥈", bg: "bg-sky-500/10",    border: "border-sky-500/25",    text: "text-sky-400"    },
  { color: "purple",  label: "L3 Deep",    icon: "🥉", bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400" },
] as const;

// ── Sub-components ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, sub, highlight = false, color = "primary",
}: { label: string; value: string; unit: string; sub?: string; highlight?: boolean; color?: string }) {
  const textColor = color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-primary";
  const bgColor   = color === "emerald" ? "bg-emerald-500/8 border-emerald-500/20" : color === "amber" ? "bg-amber-500/8 border-amber-500/20" : "bg-primary/8 border-primary/20";
  return (
    <div className={`text-center p-4 rounded-2xl border ${highlight ? bgColor : "bg-muted/15 border-border"}`}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">{label}</p>
      <p className={`text-xl font-extrabold font-mono leading-none ${highlight ? textColor : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{unit}</p>
      {sub && <p className="text-[9px] text-muted-foreground/50 mt-1">{sub}</p>}
    </div>
  );
}

function LevelCard({ level, meta }: { level: LevelSummary; meta: typeof LEVEL_META[number] }) {
  const [open, setOpen] = useState(false);
  const inactive = level.count - level.activeCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: level.level * 0.07 }}
      className={`rounded-2xl border ${meta.border} ${meta.bg} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <span className="text-lg leading-none">{meta.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-extrabold ${meta.text}`}>{meta.label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} border ${meta.border} ${meta.text}`}>
              {level.ratePercent}% Commission
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {level.count} users &nbsp;·&nbsp; {level.activeCount} active
          </p>
        </div>
        <div className="text-right mr-1">
          <p className={`text-base font-extrabold font-mono ${meta.text}`}>
            {fmt(level.commissionOKBND, 3)}
          </p>
          <p className="text-[10px] text-muted-foreground">OKBOND earned</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Expanded stats */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-white/5 pt-3">
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Total Users</p>
                <p className={`text-lg font-extrabold font-mono ${meta.text}`}>{level.count}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Active</p>
                <p className="text-lg font-extrabold font-mono text-emerald-400">{level.activeCount}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Inactive</p>
                <p className="text-lg font-extrabold font-mono text-red-400">{inactive}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">POL Raised</p>
                <p className={`text-base font-extrabold font-mono ${meta.text}`}>{fmt(level.totalPOLRaised, 2)}</p>
                <p className="text-[9px] text-muted-foreground">POL</p>
              </div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-muted/15 border border-border flex items-center gap-3">
                <TrendingUp className={`w-4 h-4 ${meta.text} flex-shrink-0`} />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">Commission (OKBOND)</p>
                  <p className={`text-sm font-extrabold font-mono ${meta.text}`}>{fmt(level.commissionOKBND, 4)}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/15 border border-border flex items-center gap-3">
                <Zap className={`w-4 h-4 ${meta.text} flex-shrink-0`} />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">Commission (POL)</p>
                  <p className={`text-sm font-extrabold font-mono ${meta.text}`}>{fmt(level.commissionPOL, 4)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  address: string;
}

export default function ReferralDashboard({ address }: Props) {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [showRewards, setShowRewards] = useState(false);

  const apiBase = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");

  const fetchData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${apiBase}/api/referral-dashboard?address=${address}`);
      const json = (await res.json()) as DashboardData;
      if (!json.ok) throw new Error("Dashboard API returned error");
      setData(json);
    } catch (e) {
      setError("Could not load dashboard — chain may be slow. Retrying…");
      // Auto-retry in 12s
      setTimeout(() => fetchData(), 12_000);
    } finally {
      setLoading(false);
    }
  }, [address, apiBase]);

  // Fetch on mount and when address changes
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">MLM Referral Dashboard</h3>
            <p className="text-[10px] text-muted-foreground">Live from blockchain events</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 px-3 py-1.5 rounded-lg border border-border hover:border-primary/30"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && !data && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/20 border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/8">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300/80">{error}</p>
        </motion.div>
      )}

      {/* ── Dashboard content ── */}
      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard
              label="Total Downline"
              value={data.totals.downlineUsers.toString()}
              unit="users (L1+L2+L3)"
              highlight color="primary"
            />
            <StatCard
              label="Total Commission"
              value={fmt(data.totals.totalCommissionPOL, 4)}
              unit="POL earned"
              highlight color="emerald"
            />
            <StatCard
              label="My ICO Investment"
              value={fmt(data.icoPurchases.totalRaisedPOL, 3)}
              unit="POL contributed"
              sub={`${data.icoPurchases.purchaseCount} purchase${data.icoPurchases.purchaseCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              label="OKBOND Earned"
              value={fmt(data.icoPurchases.totalOKBNDEarned, 2)}
              unit="OKBOND tokens"
              highlight color="amber"
            />
          </div>

          {/* ── 3-level table ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Team Levels</p>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Level</th>
                    <th className="px-4 py-2.5 text-center font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Rate</th>
                    <th className="px-4 py-2.5 text-center font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Users</th>
                    <th className="px-4 py-2.5 text-center font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Active</th>
                    <th className="px-4 py-2.5 text-right font-bold text-muted-foreground uppercase tracking-wide text-[10px]">POL Raised</th>
                    <th className="px-4 py-2.5 text-right font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Commission (OKBOND)</th>
                    <th className="px-4 py-2.5 text-right font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.levels.map((lvl, i) => {
                    const m = LEVEL_META[i];
                    return (
                      <tr key={lvl.level} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{m.icon}</span>
                            <div>
                              <p className={`font-extrabold ${m.text}`}>{m.label}</p>
                              <p className="text-[9px] text-muted-foreground">Level {lvl.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${m.bg} border ${m.border} ${m.text}`}>
                            {lvl.ratePercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-extrabold text-foreground font-mono">{lvl.count}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {lvl.activeCount > 0
                              ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              : <Clock className="w-3 h-3 text-muted-foreground" />}
                            <span className={`font-bold font-mono ${lvl.activeCount > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                              {lvl.activeCount}
                            </span>
                            {lvl.count - lvl.activeCount > 0 && (
                              <span className="text-muted-foreground/50 text-[9px]">+{lvl.count - lvl.activeCount} inactive</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-foreground/70">
                          {fmt(lvl.totalPOLRaised, 2)} POL
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-extrabold font-mono ${m.text}`}>
                            {fmt(lvl.commissionOKBND, 4)}
                          </span>
                          <span className="text-muted-foreground text-[10px] ml-1">OKBOND</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {lvl.count === 0 ? (
                            <span className="text-[10px] font-semibold text-muted-foreground/60 bg-muted/20 px-2 py-0.5 rounded-full border border-border">
                              Empty
                            </span>
                          ) : lvl.activeCount > 0 ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {data.levels.map((lvl, i) => (
                <LevelCard key={lvl.level} level={lvl} meta={LEVEL_META[i]} />
              ))}
            </div>
          </div>

          {/* ── Lottery Referral Section ── */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/6 to-transparent overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Lottery Referrals</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  5 OKBOND / entry
                </span>
              </div>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="p-4 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Entered Lottery</p>
                  <p className="text-xl font-extrabold text-primary font-mono">{data.lottery.referredUsersEntered}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">referred users</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Total Earned</p>
                  <p className="text-xl font-extrabold text-emerald-400 font-mono">{data.lottery.totalEarnedOKBND}</p>
                  <p className="text-[9px] text-emerald-400/60 mt-0.5">OKBOND</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold mb-1">Pending</p>
                  <p className="text-xl font-extrabold text-amber-400 font-mono">{data.lottery.pendingUsers}</p>
                  <p className="text-[9px] text-amber-400/60 mt-0.5">L1 not entered yet</p>
                </div>
              </div>

              {/* Info bar */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/15 border border-border">
                <Gift className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Each time one of your referrals enters the lottery, your wallet automatically receives
                  <span className="text-primary font-bold"> 5 OKBOND</span> as a referral reward.
                </p>
              </div>

              {/* Reward history */}
              {data.lottery.rewards.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowRewards((p) => !p)}
                    className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Reward History ({data.lottery.rewards.length})
                    {showRewards ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {showRewards && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                          {data.lottery.rewards.slice().reverse().map((r) => (
                            <div key={r.rewardTxHash}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20 border border-border">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-muted-foreground truncate">
                                  {r.buyer.slice(0, 8)}…{r.buyer.slice(-6)}
                                </p>
                                <p className="text-[9px] text-muted-foreground/50">{timeAgo(r.timestamp)}</p>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">+{r.okbond} OKBOND</span>
                              <a href={`${EXPLORER}/tx/${r.rewardTxHash}`} target="_blank" rel="noopener noreferrer"
                                className="text-primary/50 hover:text-primary transition-colors flex-shrink-0">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {data.lottery.rewards.length === 0 && (
                <p className="text-center text-[10px] text-muted-foreground/50 py-1">
                  No lottery referral rewards yet — share your link to start earning
                </p>
              )}
            </div>
          </div>

          {/* Last updated */}
          <p className="text-center text-[10px] text-muted-foreground/40 font-mono">
            Data from Polygon mainnet · refreshed {timeAgo(data.cachedAt)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
