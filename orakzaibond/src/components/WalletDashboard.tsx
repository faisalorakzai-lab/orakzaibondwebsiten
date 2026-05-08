import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { useStaking } from "@/hooks/useStaking";
import { useICO } from "@/hooks/useICO";
import {
  Wallet, Coins, Lock, Zap, Ticket, Gift, Users,
  TrendingUp, ExternalLink, ChevronRight, Copy, CheckCheck,
} from "lucide-react";
import { useState, useCallback } from "react";

function fmt(val: string | number, d = 2): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(d);
}

function shortenAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function StatRow({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
        </div>
      </div>
      <p className={`text-sm font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

interface WalletDashboardProps {
  compact?: boolean;
}

export default function WalletDashboard({ compact = false }: WalletDashboardProps) {
  const { address, provider, okbondBalance, chainId, connect } = useWallet();
  const { stats: stakingStats } = useStaking(provider, address);
  const { userStats, stats: icoStats } = useICO(provider, address);
  const [copied, setCopied] = useState(false);

  const POLYGON_CHAIN_ID = 137;
  const isPolygon = chainId === POLYGON_CHAIN_ID;

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [address]);

  if (!address) {
    return (
      <div className={`rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 ${compact ? "" : "max-w-md"}`}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Connect Your Wallet</h3>
          <p className="text-xs text-muted-foreground mb-5">See your OKBOND portfolio, staking positions, rewards, and more</p>
          <button
            onClick={connect}
            className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const pendingRewards = stakingStats?.userStakes.reduce((sum, s) => sum + parseFloat(s.pendingReward || "0"), 0) || 0;
  const activeLocks    = stakingStats?.userStakes.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-sm overflow-hidden ${compact ? "" : "max-w-md"}`}
    >
      {/* Address Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Connected Wallet</p>
              <p className="text-sm font-bold text-foreground">{shortenAddr(address)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted-foreground hover:text-primary">
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a href={`https://polygonscan.com/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted-foreground hover:text-primary">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${isPolygon
            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
            : "text-amber-400 border-amber-400/20 bg-amber-400/10"}`}>
            {isPolygon ? "POLYGON MAINNET" : `CHAIN ${chainId}`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4">
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold mb-1">Portfolio Intelligence</p>

        <StatRow icon={<Coins className="w-3.5 h-3.5" />}     label="OKBOND Balance"      value={`${fmt(okbondBalance || "0")} OKBOND`}              accent />
        <StatRow icon={<Lock className="w-3.5 h-3.5" />}      label="Total Staked"         value={`${fmt(stakingStats?.userStaked || "0")} OKBOND`}   />
        <StatRow icon={<Zap className="w-3.5 h-3.5" />}       label="Claimable Rewards"    value={`${pendingRewards.toFixed(4)} OKBOND`}              accent={pendingRewards > 0} />
        <StatRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Active Lock Positions" value={`${activeLocks} position${activeLocks !== 1 ? "s" : ""}`} />
        <StatRow icon={<Gift className="w-3.5 h-3.5" />}      label="ICO Contributed"      value={`${fmt(userStats?.contribution || "0")} POL`}        />
        <StatRow icon={<Coins className="w-3.5 h-3.5" />}     label="Tokens Purchased"     value={`${fmt(userStats?.earnedTokens || "0")} OKBOND`}    />
        <StatRow icon={<Users className="w-3.5 h-3.5" />}     label="Referral Earnings"    value={`${fmt(userStats?.referralEarnings || "0")} OKBOND`} />
        <StatRow icon={<Ticket className="w-3.5 h-3.5" />}    label="Total Rewards Earned" value={`${fmt(stakingStats?.userRewards || "0")} OKBOND`}  />
      </div>

      {/* Quick Actions */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-2">
        <a href="/staking" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold hover:bg-primary/20 transition-all">
          <Lock className="w-3.5 h-3.5" />
          Stake OKBOND
        </a>
        <a href="/ico" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/40 border border-border/40 text-foreground text-xs font-semibold hover:border-primary/30 transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
          Buy OKBOND
        </a>
      </div>
    </motion.div>
  );
}
