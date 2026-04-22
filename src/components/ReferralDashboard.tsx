import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, RefreshCw, Copy, Check,
  ChevronDown, ChevronUp, Zap, Loader2, AlertTriangle,
  Target, Award, Star, Shield, Trophy
} from "lucide-react";
import { useICO } from "@/hooks/useICO";
import { BrowserProvider } from "ethers";

interface Props {
  address: string;
  provider: BrowserProvider | null;
}

const LEVEL_CONFIG = [
  { level: 1, label: "Level 1", commission: "5%", icon: <Award className="w-4 h-4" />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { level: 2, label: "Level 2", commission: "3%", icon: <Star className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { level: 3, label: "Level 3", commission: "2%", icon: <Shield className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { level: 4, label: "Level 4", commission: "1%", icon: <Target className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { level: 5, label: "Level 5", commission: "1%", icon: <Trophy className="w-4 h-4" />, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
];

export default function ReferralDashboard({ address, provider }: Props) {
  const { userStats, loading, refresh } = useICO(provider, address);
  const [copied, setCopied] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

  const referralLink = `${window.location.origin}/ico?ref=${address}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelData = (level: number) => {
    if (!userStats) return { count: "0", earnings: "0" };
    switch (level) {
      case 1: return { count: userStats.level1Count, earnings: userStats.level1Earnings };
      case 2: return { count: userStats.level2Count, earnings: userStats.level2Earnings };
      case 3: return { count: userStats.level3Count, earnings: userStats.level3Earnings };
      case 4: return { count: userStats.level4Count, earnings: userStats.level4Earnings };
      case 5: return { count: userStats.level5Count, earnings: userStats.level5Earnings };
      default: return { count: "0", earnings: "0" };
    }
  };

  if (loading && !userStats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl border border-primary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading your network data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <div className="glass-card rounded-3xl border border-primary/30 p-6 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Your Referral Link</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Share to earn 5-level commissions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10">
          <input 
            readOnly 
            value={referralLink}
            className="flex-1 bg-transparent border-none text-xs font-mono text-muted-foreground px-3 focus:outline-none truncate"
          />
          <button 
            onClick={copyReferral}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl border border-white/5 p-4 bg-white/5">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Referrals</p>
          <p className="text-2xl font-black text-foreground">{userStats?.referralCount || "0"}</p>
        </div>
        <div className="glass-card rounded-2xl border border-primary/20 p-4 bg-primary/5">
          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Total Earnings</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-primary">{parseFloat(userStats?.referralEarnings || "0").toFixed(2)}</p>
            <span className="text-xs font-bold text-primary/70">POL</span>
          </div>
        </div>
      </div>

      {/* 5-Level Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Network Breakdown</h4>
          <button onClick={() => refresh()} className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {LEVEL_CONFIG.map((cfg) => {
          const data = getLevelData(cfg.level);
          const isExpanded = expandedLevel === cfg.level;
          
          return (
            <div 
              key={cfg.level}
              className={`rounded-2xl border transition-all duration-300 ${isExpanded ? `${cfg.border} ${cfg.bg}` : "border-white/5 bg-white/5"}`}
            >
              <button 
                onClick={() => setExpandedLevel(isExpanded ? null : cfg.level)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{cfg.label}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.commission} Commission</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{data.count}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Users</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/20">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Earnings from this level</span>
                        </div>
                        <p className={`text-sm font-bold font-mono ${cfg.color}`}>{parseFloat(data.earnings).toFixed(4)} POL</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {userStats?.referralCount === "0" && (
        <div className="p-6 rounded-3xl border border-dashed border-white/10 text-center space-y-2">
          <p className="text-sm text-muted-foreground">You don't have any referrals yet.</p>
          <p className="text-xs text-primary font-bold">Share your link to start building your 5-level network!</p>
        </div>
      )}
    </div>
  );
}
