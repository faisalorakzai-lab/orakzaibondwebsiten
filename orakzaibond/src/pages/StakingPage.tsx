import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStaking } from "@/hooks/useStaking";
import { useWallet } from "@/hooks/useWallet";
import { Lock, Unlock, TrendingUp, Zap, Users, RefreshCw, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";

function fmt(val: string, d = 2): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(d);
}

const POOLS = [
  { days: 30,  apy: 12, label: "Starter",    badge: "12% APY",  color: "border-slate-400/30 hover:border-slate-400/60" },
  { days: 90,  apy: 15, label: "Growth",     badge: "15% APY",  color: "border-blue-400/30 hover:border-blue-500/60" },
  { days: 180, apy: 18, label: "Premium",    badge: "18% APY",  color: "border-primary/30 hover:border-primary/60", popular: true },
  { days: 365, apy: 24, label: "Sovereign",  badge: "24% APY",  color: "border-amber-400/30 hover:border-amber-400/60" },
];

export default function StakingPage() {
  const { provider, address, connect } = useWallet();
  const { stats, loading, txStatus, txHash, txError, approveAndStake, unstake, claimRewards, resetTx, refresh } = useStaking(provider, address);

  const [selectedPool, setSelectedPool] = useState(POOLS[2]);
  const [amount, setAmount]             = useState("");
  const [compoundYears, setCompoundYears] = useState(1);

  const parsedAmount   = parseFloat(amount) || 0;
  const estimatedReward = parsedAmount * (selectedPool.apy / 100) * (selectedPool.days / 365);
  const compoundFinal  = parsedAmount * Math.pow(1 + selectedPool.apy / 100, compoundYears);

  const isPending = ["approving", "staking", "unstaking", "claiming"].includes(txStatus);

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-primary font-mono tracking-widest uppercase">Advanced Staking</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Stake OKBOND</h1>
        <p className="text-muted-foreground text-sm mt-1">Lock OKBOND tokens and earn institutional-grade yields · Polygon Mainnet</p>
      </motion.div>

      {/* Protocol Stats Strip */}
      {!loading && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Value Staked", value: `${fmt(stats.totalStaked)} OKBOND`, icon: <Lock className="w-4 h-4" /> },
            { label: "Total Stakers",      value: stats.totalStakers,                 icon: <Users className="w-4 h-4" /> },
            { label: "Rewards Given",      value: `${fmt(stats.rewardsDistributed)} OKBOND`, icon: <Zap className="w-4 h-4" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 flex items-center gap-3">
              <div className="text-primary">{icon}</div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Pool selector + form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Pool Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Select Lock Period</p>
            <div className="grid grid-cols-2 gap-3">
              {POOLS.map((pool) => (
                <button
                  key={pool.days}
                  onClick={() => setSelectedPool(pool)}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200
                    ${selectedPool.days === pool.days
                      ? "bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : `bg-card/40 ${pool.color}`
                    }`}
                >
                  {pool.popular && (
                    <span className="absolute top-2 right-2 text-[9px] bg-primary text-black px-1.5 py-0.5 rounded-full font-bold">POPULAR</span>
                  )}
                  <p className="text-xs text-muted-foreground mb-1">{pool.label}</p>
                  <p className="text-2xl font-bold text-primary">{pool.apy}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">APY · {pool.days} day lock</p>
                  {selectedPool.days === pool.days && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stake form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
          >
            <p className="text-sm font-semibold text-foreground mb-4">Stake OKBOND Tokens</p>

            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Amount (OKBOND)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount…"
                  min="0"
                  className="w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button onClick={() => setAmount((parseFloat(amount || "0") / 2).toString())} className="text-[10px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded bg-muted/50">½</button>
                  <button className="text-[10px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded bg-muted/50">MAX</button>
                </div>
              </div>
            </div>

            {parsedAmount > 0 && (
              <div className="bg-muted/20 rounded-xl border border-border/30 p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lock Period</span>
                  <span className="text-foreground font-medium">{selectedPool.days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="text-primary font-bold">{selectedPool.apy}%</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border/30 pt-2">
                  <span className="text-muted-foreground">Est. Reward</span>
                  <span className="text-emerald-400 font-bold">{estimatedReward.toFixed(2)} OKBOND</span>
                </div>
              </div>
            )}

            {/* TX Status feedback */}
            <AnimatePresence>
              {txStatus === "success" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Transaction successful!</span>
                  {txHash && (
                    <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  )}
                </motion.div>
              )}
              {txStatus === "error" && txError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-xl bg-red-400/10 border border-red-400/20 p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-400">{txError}</span>
                  <button onClick={resetTx} className="ml-auto text-[10px] text-red-400 hover:underline">Dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>

            {address ? (
              <button
                onClick={() => approveAndStake(amount, selectedPool.days)}
                disabled={isPending || !amount || parsedAmount <= 0}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {txStatus === "approving" ? "Approving…"
                  : txStatus === "staking"   ? "Staking…"
                  : isPending               ? "Processing…"
                  : `Stake OKBOND · ${selectedPool.days}d Lock`}
              </button>
            ) : (
              <button
                onClick={connect}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all"
              >
                Connect Wallet to Stake
              </button>
            )}
          </motion.div>
        </div>

        {/* Right: Compound calculator + active stakes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Compound Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Compound Estimator</p>
            </div>
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">Years to compound</label>
              <input
                type="range" min="1" max="10" value={compoundYears}
                onChange={e => setCompoundYears(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 year</span><span>{compoundYears} yr</span><span>10 years</span>
              </div>
            </div>
            {parsedAmount > 0 ? (
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">After {compoundYears} year{compoundYears > 1 ? "s" : ""} at {selectedPool.apy}% APY</p>
                <p className="text-2xl font-bold text-primary">{fmt(compoundFinal.toFixed(2))} OKBOND</p>
                <p className="text-xs text-emerald-400 mt-1">+{fmt((compoundFinal - parsedAmount).toFixed(2))} profit</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Enter an amount to see compound projections</p>
            )}
          </motion.div>

          {/* Active Stakes */}
          {address && stats && stats.userStakes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Active Stakes</p>
                </div>
                <button onClick={refresh} className="text-muted-foreground hover:text-primary transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {stats.userStakes.map(stake => {
                  const unlockDate = new Date((stake.startTime + stake.lockPeriod * 86400) * 1000);
                  const isUnlocked = Date.now() > unlockDate.getTime();
                  return (
                    <div key={stake.id} className="rounded-xl border border-border/30 bg-muted/20 p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{fmt(stake.amount)} OKBOND</span>
                        <span className="text-xs text-primary font-bold">{stake.apy}% APY</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>Pending: {parseFloat(stake.pendingReward).toFixed(4)} OKBOND</span>
                        <span>{isUnlocked ? "Unlocked" : `Unlocks ${unlockDate.toLocaleDateString()}`}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => claimRewards(stake.id)}
                          disabled={isPending || parseFloat(stake.pendingReward) === 0}
                          className="flex-1 py-1.5 text-xs rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 disabled:opacity-40 transition-all"
                        >
                          Claim
                        </button>
                        <button
                          onClick={() => unstake(stake.id)}
                          disabled={isPending || !isUnlocked}
                          className="flex-1 py-1.5 text-xs rounded-lg bg-muted/40 text-foreground border border-border/40 hover:border-primary/30 disabled:opacity-40 transition-all"
                        >
                          Unstake
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* User summary when connected */}
          {address && stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Your Position</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Staked</span><span className="font-bold text-foreground">{fmt(stats.userStaked)} OKBOND</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Rewards</span><span className="font-bold text-emerald-400">{fmt(stats.userRewards)} OKBOND</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Locks</span><span className="font-bold text-foreground">{stats.userStakes.length}</span></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
