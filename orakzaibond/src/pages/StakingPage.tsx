import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStaking } from "@/hooks/useStaking";
import { useWallet } from "@/hooks/useWallet";
import {
import { useSEO, PAGE_SEO } from "@/components/SEO";
  Lock, Unlock, TrendingUp, Zap, Users, RefreshCw, CheckCircle,
  AlertCircle, Loader2, ExternalLink, Calculator, ArrowRight,
} from "lucide-react";

const GOLD = "#D4AF37";

function fmt(val: string, d = 2): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(d);
}

const POOLS = [
  { days: 30,  apy: 12, label: "Starter",   badge: "12% APY",  accent: "#64748B", popular: false },
  { days: 90,  apy: 15, label: "Growth",    badge: "15% APY",  accent: "#3B82F6", popular: false },
  { days: 180, apy: 18, label: "Premium",   badge: "18% APY",  accent: GOLD,      popular: true  },
  { days: 365, apy: 24, label: "Sovereign", badge: "24% APY",  accent: "#F59E0B", popular: false },
];

export default function StakingPage() {
  const { provider, address, connect } = useWallet();
  const { stats, loading, txStatus, txHash, txError, approveAndStake, unstake, claimRewards, resetTx, refresh } = useStaking(provider, address);

  const [selectedPool, setSelectedPool] = useState(POOLS[2]);
  const [amount, setAmount]             = useState("");
  const [compoundYears, setCompoundYears] = useState(1);

  const parsedAmount    = parseFloat(amount) || 0;
  const estimatedReward = parsedAmount * (selectedPool.apy / 100) * (selectedPool.days / 365);
  const compoundFinal   = parsedAmount * Math.pow(1 + selectedPool.apy / 100, compoundYears);
  const isPending       = ["approving", "staking", "unstaking", "claiming"].includes(txStatus);

  useSEO(PAGE_SEO.staking);
  return (
    <div className="min-h-screen pb-24 lg:pb-10" style={{ background: "#050505" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20` }}>
              <Lock className="w-4.5 h-4.5" style={{ color: GOLD }} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: GOLD }}>Staking Terminal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2"
            style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
            Stake OKBOND
          </h1>
          <p className="text-white/40 text-sm">Institutional-grade yields · Polygon Mainnet · Up to 24% APY</p>
        </motion.div>

        {/* ── Protocol Stats ── */}
        {!loading && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Total Staked",   value: `${fmt(stats.totalStaked)} OKBOND`, icon: <Lock    className="w-4 h-4" /> },
              { label: "Total Stakers",  value: stats.totalStakers,                  icon: <Users   className="w-4 h-4" /> },
              { label: "Rewards Given",  value: `${fmt(stats.rewardsDistributed)}`,  icon: <Zap     className="w-4 h-4" /> },
            ].map(({ label, value, icon }) => (
              <div key={label}
                className="rounded-2xl border border-white/6 p-4 flex items-center gap-3"
                style={{ background: "rgba(7,17,31,0.7)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}18`, color: GOLD }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/35 uppercase font-mono tracking-widest truncate">{label}</p>
                  <p className="text-sm font-black text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Pool Selection ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
              Choose Staking Pool
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {POOLS.map((pool) => {
                const active = selectedPool.days === pool.days;
                return (
                  <motion.button
                    key={pool.days}
                    onClick={() => setSelectedPool(pool)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full rounded-2xl p-5 text-left transition-all duration-200"
                    style={{
                      border: `1px solid ${active ? pool.accent + "70" : pool.accent + "20"}`,
                      background: active ? `${pool.accent}12` : "rgba(7,17,31,0.6)",
                      boxShadow: active ? `0 0 24px ${pool.accent}20` : "none",
                    }}
                  >
                    {pool.popular && (
                      <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full"
                        style={{ background: GOLD, color: "#050505" }}>
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-bold text-sm" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>{pool.label}</span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                        style={{ color: pool.accent, borderColor: `${pool.accent}40`, background: `${pool.accent}15` }}>
                        {pool.badge}
                      </span>
                    </div>
                    <p className="text-3xl font-black mb-1" style={{ color: pool.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                      {pool.apy}%
                    </p>
                    <p className="text-white/40 text-xs">{pool.days} day lock · Annual Percentage Yield</p>
                    {active && (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: pool.accent }}>
                        <CheckCircle className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* ── Stake Form ── */}
            <div className="rounded-2xl border border-white/6 p-6" style={{ background: "rgba(7,17,31,0.7)" }}>
              <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                Stake Amount
              </h3>

              {!address ? (
                <div className="text-center py-6">
                  <p className="text-white/40 text-sm mb-4">Connect wallet to stake OKBOND</p>
                  <button onClick={connect}
                    className="px-6 py-3 rounded-xl font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505" }}>
                    Connect Wallet
                  </button>
                </div>
              ) : (
                  <div className="relative mb-4">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl px-4 py-3.5 text-right text-lg font-mono font-bold pr-24 focus:outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${amount ? GOLD + "40" : "rgba(255,255,255,0.08)"}`,
                        color: "#F5F5F5",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: GOLD }}>
                      OKBOND
                    </span>
                  </div>

                  {parsedAmount > 0 && (
                    <div className="rounded-xl p-4 mb-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/40">Estimated reward ({selectedPool.days}d)</span>
                        <span className="font-bold" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>
                          +{estimatedReward.toFixed(2)} OKBOND
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Lock expires</span>
                        <span className="text-white/60 font-mono text-xs">
                          {new Date(Date.now() + selectedPool.days * 86400000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tx Status */}
                  <AnimatePresence>
                    {txStatus !== "idle" && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-4 rounded-xl flex items-start gap-3"
                        style={{
                          background: txStatus === "success" ? "rgba(16,185,129,0.1)" : txStatus === "error" ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.08)",
                          border: `1px solid ${txStatus === "success" ? "#10B98130" : txStatus === "error" ? "#EF444430" : GOLD + "30"}`,
                        }}>
                        {isPending && <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" style={{ color: GOLD }} />}
                        {txStatus === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                        {txStatus === "error"   && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"    />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {txStatus === "approving" ? "Approving OKBOND…"
                              : txStatus === "staking"    ? "Staking in progress…"
                              : txStatus === "unstaking"  ? "Unstaking…"
                              : txStatus === "claiming"   ? "Claiming rewards…"
                              : txStatus === "success"    ? "Transaction successful!"
                              : "Transaction failed"}
                          </p>
                          {txHash && (
                            <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 mt-1" style={{ color: GOLD }}>
                              View on PolygonScan <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {txError && <p className="text-xs text-red-400 mt-1 break-words">{txError}</p>}
                        </div>
                        {(txStatus === "success" || txStatus === "error") && (
                          <button onClick={resetTx} className="text-xs text-white/30 hover:text-white/60 shrink-0">✕</button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => approveAndStake(amount, selectedPool.days)}
                      disabled={isPending || !amount || parsedAmount <= 0}
                      className="col-span-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505" }}>
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Stake
                    </button>
                    <button
                      onClick={() => unstake(0)}
                      disabled={isPending || !stats?.userStaked || parseFloat(stats.userStaked) <= 0}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                      <Unlock className="w-4 h-4" />
                      Unstake
                    </button>
                    <button
                      onClick={() => claimRewards(0)}
                      disabled={isPending || !stats?.userRewards || parseFloat(stats.userRewards) <= 0}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderColor: GOLD + "30", color: GOLD }}>
                      <Zap className="w-4 h-4" />
                      Claim
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* ── Sidebar: Compound Calculator + Your Position ── */}
          <div className="space-y-4">

            {/* Your Position */}
            {address && stats && (
              <div className="rounded-2xl border border-white/6 p-5" style={{ background: "rgba(7,17,31,0.7)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Your Position</span>
                  <button onClick={refresh} className="text-white/30 hover:text-white/60 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                {[
                  { label: "Staked",          value: `${fmt(stats.userStaked || "0")} OKBOND` },
                  { label: "Claimable Rewards", value: `${fmt(stats.userRewards || "0")} OKBOND` },
                  { label: "Active Stakes",    value: stats.userStakes?.filter(s => s.active).length.toString() || "0" },
                  { label: "Allowance",        value: `${fmt(stats.allowance || "0")} OKBOND` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-white/5 last:border-0 text-sm">
                    <span className="text-white/40">{label}</span>
                    <span className="text-white font-mono font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Compound Calculator */}
            <div className="rounded-2xl border border-white/6 p-5" style={{ background: "rgba(7,17,31,0.7)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-white font-bold text-sm" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Compound Calculator</span>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Years to compound</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((y) => (
                      <button key={y}
                        onClick={() => setCompoundYears(y)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: compoundYears === y ? `${GOLD}20` : "rgba(255,255,255,0.04)",
                          color: compoundYears === y ? GOLD : "rgba(255,255,255,0.35)",
                          border: `1px solid ${compoundYears === y ? GOLD + "40" : "transparent"}`,
                        }}>
                        {y}Y
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-white/40">Input</span>
                    <span className="text-white font-mono">{parsedAmount > 0 ? parsedAmount.toLocaleString() : "1,000"} OKBOND</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-white/40">APY</span>
                    <span style={{ color: selectedPool.accent }} className="font-bold">{selectedPool.apy}%</span>
                  </div>
                  <div className="h-px bg-white/8 my-3" />
                  <div className="flex justify-between text-base">
                    <span className="text-white/60 font-semibold">After {compoundYears}Y</span>
                    <span className="font-black" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>
                      {((parsedAmount > 0 ? parsedAmount : 1000) * Math.pow(1 + selectedPool.apy / 100, compoundYears)).toFixed(0)} OKBOND
                    </span>
                  </div>
                </div>
              </div>
              <a href="https://polygonscan.com/address/0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#D4AF37] transition-colors">
                <ExternalLink className="w-3 h-3" />
                Verify contract on PolygonScan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
