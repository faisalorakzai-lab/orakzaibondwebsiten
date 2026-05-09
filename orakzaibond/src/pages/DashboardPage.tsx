import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProtocolMetrics } from "@/hooks/useProtocolMetrics";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import { useStaking } from "@/hooks/useStaking";
import {
  TrendingUp, Lock, Landmark, Shield, Ticket, Users, Rocket, Activity,
  RefreshCw, ExternalLink, DollarSign, BarChart3, Zap, BookMarked,
  Trophy, Star, Globe, Cpu, PieChart, ChevronRight, Copy, CheckCheck,
  ArrowUpRight, Wifi, Circle, Coins,
} from "lucide-react";
import { Link } from "wouter";

const GOLD = "#D4AF37";
const NAVY = "#07111F";

function fmt(val: string | number, decimals = 2): string {
  const n = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(decimals);
}

const TABS = [
  { id: "portfolio",  label: "Portfolio",  icon: <PieChart    className="w-4 h-4" /> },
  { id: "ico",        label: "ICO",        icon: <Rocket      className="w-4 h-4" /> },
  { id: "staking",    label: "Staking",    icon: <Lock        className="w-4 h-4" /> },
  { id: "lottery",    label: "Lottery",    icon: <Ticket      className="w-4 h-4" /> },
  { id: "vault",      label: "Vault",      icon: <Landmark    className="w-4 h-4" /> },
  { id: "governance", label: "Governance", icon: <Globe       className="w-4 h-4" /> },
  { id: "notebook",   label: "Notebook",   icon: <BookMarked  className="w-4 h-4" /> },
  { id: "rewards",    label: "Rewards",    icon: <Star        className="w-4 h-4" /> },
  { id: "ambassador", label: "Ambassador", icon: <Users       className="w-4 h-4" /> },
  { id: "analytics",  label: "Analytics",  icon: <BarChart3   className="w-4 h-4" /> },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, accent, delay = 0,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  accent?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="relative rounded-2xl p-5 overflow-hidden group"
      style={{
        background: accent
          ? `linear-gradient(135deg, ${GOLD}18 0%, ${GOLD}08 100%)`
          : `rgba(7,17,31,0.7)`,
        border: `1px solid ${accent ? GOLD + "40" : "rgba(212,175,55,0.12)"}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${GOLD}08 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: accent ? `${GOLD}22` : "rgba(255,255,255,0.04)", color: accent ? GOLD : "rgba(255,255,255,0.4)" }}>
          {icon}
        </div>
      </div>
      <p className="text-[11px] text-white/40 uppercase tracking-widest font-mono mb-1.5">{label}</p>
      <p className="text-2xl font-black leading-none mb-1.5"
        style={{ color: accent ? GOLD : "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/35">{sub}</p>}
    </motion.div>
  );
}

// ── Contract Row ─────────────────────────────────────────────────────────────
function ContractRow({ label, addr }: { label: string; addr: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 gap-3">
      <div className="min-w-0">
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-xs font-mono text-white/70 truncate">{addr.slice(0, 10)}…{addr.slice(-8)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={copy}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          aria-label="Copy address">
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <a href={`https://polygonscan.com/address/${addr}`} target="_blank" rel="noopener noreferrer"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ── Portfolio Tab ─────────────────────────────────────────────────────────────
function PortfolioTab({ metrics, icoStats, stakingStats, address }: any) {
  const hasWallet = !!address;
  return (
    <div className="space-y-6">
      {!hasWallet && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-6 text-center border border-[#D4AF37]/20 bg-[#07111F]/60">
          <Coins className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD, opacity: 0.6 }} />
          <p className="text-white/60 text-sm mb-4">Connect your wallet to see your personal portfolio</p>
          <Link href="/ico">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505" }}>
              Connect & Invest
            </button>
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5" />}  label="Total Value Locked"  value={`${fmt(metrics.totalValueLocked)} POL`} sub="Ecosystem TVL" accent delay={0} />
        <StatCard icon={<Lock className="w-5 h-5" />}        label="Total Staked"         value={`${fmt(metrics.totalStaked)} OKBOND`} sub={`${metrics.totalStakers} stakers`} delay={0.05} />
        <StatCard icon={<Landmark className="w-5 h-5" />}    label="Vault Reserves"       value={`${fmt(metrics.vaultReserves)} POL`} sub="Reserve pool" delay={0.1} />
        <StatCard icon={<Zap className="w-5 h-5" />}         label="Max APY"              value={`${metrics.apy}%`} sub="Sovereign 365d lock" accent delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ICO Snapshot */}
        <div className="rounded-2xl p-6 border border-[#D4AF37]/12 bg-[#07111F]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" style={{ color: GOLD }} />
              <span className="font-bold text-white text-sm">ICO Phase 1</span>
              <span className="text-[10px] bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono">LIVE</span>
            </div>
            <Link href="/ico">
              <button className="text-xs text-[#D4AF37] flex items-center gap-1 hover:underline">
                Participate <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Price</span>
              <span className="text-white font-mono font-bold">$0.50 / OKBOND</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Phase Supply</span>
              <span className="text-white font-mono">1,000,000 OKBOND</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #B8942A, ${GOLD})`, boxShadow: `0 0 10px ${GOLD}60` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.icoProgress, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/35 font-mono">
              <span>{metrics.icoProgress.toFixed(1)}% sold</span>
              <span>{fmt(metrics.icoRaised, 2)} POL raised</span>
            </div>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="rounded-2xl p-6 border border-[#D4AF37]/12 bg-[#07111F]/60">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: GOLD }} />
            <span className="font-bold text-white text-sm">Verified Contracts</span>
            <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded-full font-mono">Polygon</span>
          </div>
          <ContractRow label="OKBOND Token"      addr="0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F" />
          <ContractRow label="ICO Contract"      addr="0x7BB2458740c4F491277973212309d831385Ab9D7" />
          <ContractRow label="Staking"           addr="0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e" />
          <ContractRow label="Vault"             addr="0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08" />
          <ContractRow label="Notebook Registry" addr="0xa6a1C3D97e629326ad812e97e927622A8dA711a3" />
        </div>
      </div>
    </div>
  );
}

// ── ICO Tab ───────────────────────────────────────────────────────────────────
function ICOTab({ metrics, icoStats }: any) {
  const phases = [
    { id: 1, label: "Phase 1", price: "$0.50", supply: "333,333 OKBOND", status: "live",     roi: "2×",  roiAt: "$1" },
    { id: 2, label: "Phase 2", price: "$0.70", supply: "333,333 OKBOND", status: "upcoming", roi: "1.4×", roiAt: "$1" },
    { id: 3, label: "Phase 3", price: "$1.00", supply: "333,334 OKBOND", status: "upcoming", roi: "1×",  roiAt: "$1" },
  ];
  const mcScenarios = [
    { price: "$1",   mcap: "$1M",  x: "2×"   },
    { price: "$5",   mcap: "$5M",  x: "10×"  },
    { price: "$10",  mcap: "$10M", x: "20×"  },
    { price: "$50",  mcap: "$50M", x: "100×" },
    { price: "$100", mcap: "$100M",x: "200×" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((ph, i) => (
          <motion.div key={ph.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="relative rounded-2xl p-6 border overflow-hidden"
            style={{
              border: ph.status === "live" ? `1px solid ${GOLD}50` : "1px solid rgba(255,255,255,0.07)",
              background: ph.status === "live" ? `linear-gradient(135deg, ${GOLD}12, ${GOLD}06)` : "rgba(7,17,31,0.7)",
            }}>
            {ph.status === "live" && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>
            )}
            {ph.status === "upcoming" && (
              <div className="absolute top-3 right-3 text-[10px] text-white/30 font-mono bg-white/5 px-2 py-1 rounded-full">LOCKED</div>
            )}
            <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-3">{ph.label}</p>
            <p className="text-3xl font-black mb-1" style={{ color: ph.status === "live" ? GOLD : "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{ph.price}</p>
            <p className="text-white/50 text-xs mb-4">{ph.supply}</p>
            <div className="flex items-center justify-between text-xs border-t border-white/8 pt-3">
              <span className="text-white/40">ROI @ {ph.roiAt}</span>
              <span className="font-bold" style={{ color: GOLD }}>{ph.roi}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Cap Simulator */}
      <div className="rounded-2xl p-6 border border-[#D4AF37]/12 bg-[#07111F]/60">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4" style={{ color: GOLD }} />
          <span className="font-bold text-white text-sm">Market Cap Simulator</span>
          <span className="text-[10px] text-white/30 font-mono">1M OKBOND total supply</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {mcScenarios.map((s, i) => (
            <motion.div key={s.price}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl p-4 text-center border border-white/6 bg-white/2 hover:border-[#D4AF37]/30 transition-all">
              <p className="text-white font-black text-lg mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.price}</p>
              <p className="text-white/35 text-[10px] font-mono mb-2">{s.mcap} mcap</p>
              <p className="font-bold text-sm" style={{ color: GOLD }}>{s.x} from Phase 1</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/ico">
          <button className="px-8 py-3.5 rounded-2xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505", fontFamily: "'Sora','Inter',sans-serif" }}>
            Participate in ICO Phase 1 →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Staking Tab ───────────────────────────────────────────────────────────────
function StakingTab({ metrics }: any) {
  const pools = [
    { days: 30,  apy: 12, label: "Starter",   color: "#64748B" },
    { days: 90,  apy: 15, label: "Growth",    color: "#3B82F6" },
    { days: 180, apy: 18, label: "Premium",   color: GOLD },
    { days: 365, apy: 24, label: "Sovereign", color: "#F59E0B" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <StatCard icon={<Lock className="w-5 h-5" />}    label="Total Staked"    value={`${fmt(metrics.totalStaked)} OKBOND`} sub={`${metrics.totalStakers} active stakers`} />
        <StatCard icon={<Zap className="w-5 h-5" />}     label="Max APY"         value="24%" sub="Sovereign pool · 365d" accent />
        <StatCard icon={<DollarSign className="w-5 h-5"/>}label="Rewards Given"  value={`${fmt(metrics.rewardsDistributed)} OKBOND`} sub="All time distributed" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pools.map((p, i) => (
          <motion.div key={p.days}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-6 border transition-all duration-300 cursor-pointer hover:-translate-y-1"
            style={{ border: `1px solid ${p.color}25`, background: `${p.color}08` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-white/40 uppercase">{p.label}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                style={{ color: p.color, borderColor: `${p.color}40`, background: `${p.color}15` }}>
                {p.apy}% APY
              </span>
            </div>
            <p className="text-3xl font-black mb-1" style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.apy}%</p>
            <p className="text-white/40 text-xs mb-4">{p.days} day lock period</p>
            <div className="text-xs text-white/30 border-t border-white/8 pt-3">
              1000 OKBOND → <span style={{ color: p.color }} className="font-bold">
                {(1000 * (p.apy / 100) * (p.days / 365)).toFixed(0)} OKBOND/period
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/staking">
          <button className="px-8 py-3.5 rounded-2xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505", fontFamily: "'Sora','Inter',sans-serif" }}>
            Open Staking Terminal →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Lottery Tab ───────────────────────────────────────────────────────────────
function LotteryTab({ metrics }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl p-8 border text-center relative overflow-hidden"
          style={{ border: `1px solid ${GOLD}40`, background: `linear-gradient(135deg, ${GOLD}10, ${GOLD}05)` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${GOLD}08, transparent)` }} />
          <Trophy className="w-10 h-10 mx-auto mb-4" style={{ color: GOLD }} />
          <p className="text-xs text-white/40 uppercase font-mono tracking-widest mb-2">Active Prize Pool</p>
          <p className="text-4xl font-black mb-1" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(metrics.lotteryPool)} OKBOND
          </p>
          <p className="text-white/40 text-sm">+ Full capital return for non-winners</p>
        </div>
        <div className="space-y-4">
          {[
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Capital Protected", desc: "100% refund if you don't win" },
            { icon: <Zap className="w-5 h-5" />,         title: "Chainlink VRF",      desc: "Provably fair randomness" },
            { icon: <Trophy className="w-5 h-5" />,      title: "Instant Payout",     desc: "Winners paid on-chain immediately" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-[#07111F]/60">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${GOLD}18`, color: GOLD }}>{f.icon}</div>
              <div>
                <p className="text-white text-sm font-bold">{f.title}</p>
                <p className="text-white/40 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Link href="/lottery">
          <button className="px-8 py-3.5 rounded-2xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505", fontFamily: "'Sora','Inter',sans-serif" }}>
            Enter Lottery →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Vault Tab ─────────────────────────────────────────────────────────────────
function VaultTab({ metrics }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Landmark className="w-5 h-5" />}  label="Vault Reserves"    value={`${fmt(metrics.vaultReserves)} POL`}     sub="Liquidity backing" accent />
        <StatCard icon={<Shield className="w-5 h-5" />}    label="Treasury Balance"  value={`${fmt(metrics.treasuryBalance)} POL`}   sub="Protocol treasury" />
        <StatCard icon={<TrendingUp className="w-5 h-5"/>} label="Reserve Ratio"     value="100%"                                     sub="Full backing" />
      </div>
      <div className="rounded-2xl p-6 border border-[#D4AF37]/12 bg-[#07111F]/60">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4" style={{ color: GOLD }} />
          <span className="font-bold text-white text-sm">Vault Architecture</span>
        </div>
        {[
          { label: "Capital Protection Reserve", pct: 40, desc: "Backs lottery non-winner refunds" },
          { label: "Liquidity Pool Reserve",     pct: 35, desc: "DEX liquidity support" },
          { label: "Staking Rewards Pool",       pct: 15, desc: "APY distribution fund" },
          { label: "Emergency Fund",             pct: 10, desc: "Protocol security buffer" },
        ].map((r, i) => (
          <div key={r.label} className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-white/60 text-xs">{r.label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: GOLD }}>{r.pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #B8942A, ${GOLD})` }}
                initial={{ width: 0 }}
                animate={{ width: `${r.pct}%` }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
              />
            </div>
            <p className="text-white/25 text-[11px] mt-1">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Governance Tab ────────────────────────────────────────────────────────────
function GovernanceTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 border border-[#D4AF37]/15 bg-[#07111F]/60 text-center">
        <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD, opacity: 0.6 }} />
        <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Governance Portal</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
          OKBOND holders can participate in protocol governance. Vote on fee structures, reserve allocations, and ecosystem upgrades.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5" />
          Launching Q3 2026
        </span>
      </div>
      {[
        { title: "Reserve Allocation Vote",    status: "Upcoming", votes: "—" },
        { title: "Staking APY Adjustment",     status: "Upcoming", votes: "—" },
        { title: "Ecosystem Expansion Fund",   status: "Upcoming", votes: "—" },
      ].map((p) => (
        <div key={p.title} className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-[#07111F]/40">
          <div>
            <p className="text-white text-sm font-semibold">{p.title}</p>
            <p className="text-white/30 text-xs mt-0.5">{p.votes} votes</p>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">{p.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Notebook Tab ──────────────────────────────────────────────────────────────
function NotebookTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 border border-[#D4AF37]/15 bg-[#07111F]/60 text-center">
        <BookMarked className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD, opacity: 0.6 }} />
        <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Notebook Registry</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
          On-chain sovereign notebook. Register ideas, visions, and contributions permanently on Polygon.
          <br /><span className="font-mono text-xs text-[#D4AF37]/60">0xa6a1C3D97e629326ad812e97e927622A8dA711a3</span>
        </p>
        <Link href="/registry">
          <button className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505" }}>
            Open Registry →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Rewards Tab ───────────────────────────────────────────────────────────────
function RewardsTab({ metrics }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard icon={<Star className="w-5 h-5" />}      label="Total Rewards"    value={`${fmt(metrics.rewardsDistributed)} OKBOND`} sub="Distributed all time" accent />
        <StatCard icon={<Zap className="w-5 h-5" />}       label="Staking Rewards"  value={`${metrics.apy}% APY`}                        sub="Up to 24% annual" />
      </div>
      {[
        { title: "Staking Rewards",     desc: "Earn 12-24% APY by locking OKBOND in staking pools",                    status: "active" },
        { title: "Referral Program",    desc: "Earn commission on every investor you bring to the ecosystem",           status: "active" },
        { title: "Lottery Prizes",      desc: "Win the prize pool in our capital-protected lottery",                    status: "active" },
        { title: "Governance Rewards",  desc: "Earn tokens for participating in protocol governance votes",             status: "upcoming" },
        { title: "Ambassador Program",  desc: "Top ambassadors receive special allocations and recognition",            status: "active" },
      ].map((r) => (
        <div key={r.title} className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-[#07111F]/40 gap-4">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold">{r.title}</p>
            <p className="text-white/35 text-xs mt-0.5">{r.desc}</p>
          </div>
          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${
            r.status === "active"
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : "text-amber-400 bg-amber-400/10 border-amber-400/20"
          }`}>{r.status === "active" ? "● Active" : "Upcoming"}</span>
        </div>
      ))}
    </div>
  );
}

// ── Ambassador Tab ────────────────────────────────────────────────────────────
function AmbassadorTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 border border-[#D4AF37]/15 bg-[#07111F]/60 text-center">
        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD, opacity: 0.6 }} />
        <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Ambassador Program</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
          Represent Orakzai Bond in your region. Earn referral commissions, exclusive allocations, and sovereign recognition.
        </p>
        <Link href="/ambassador">
          <button className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #B8942A)`, color: "#050505" }}>
            Apply as Ambassador →
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { level: "Bronze",   threshold: "5 referrals",   commission: "5%" },
          { level: "Silver",   threshold: "20 referrals",  commission: "8%" },
          { level: "Gold",     threshold: "50 referrals",  commission: "12%" },
        ].map((tier) => (
          <div key={tier.level} className="rounded-2xl p-5 border border-white/6 bg-[#07111F]/40 text-center">
            <p className="text-white font-black text-lg mb-1">{tier.level}</p>
            <p className="text-white/40 text-xs mb-3">{tier.threshold}</p>
            <p className="font-bold text-xl" style={{ color: GOLD }}>{tier.commission}</p>
            <p className="text-white/30 text-xs">commission rate</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab({ metrics }: any) {
  const networkItems = [
    { label: "Polygon RPC",       ok: metrics.networkStatus === "online" },
    { label: "OKBOND Token",      ok: true },
    { label: "ICO Contract",      ok: metrics.icoProgress >= 0 },
    { label: "Staking Contract",  ok: parseFloat(metrics.totalStaked) >= 0 },
    { label: "Vault Contract",    ok: parseFloat(metrics.vaultReserves) >= 0 },
    { label: "Notebook Registry", ok: true },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity className="w-5 h-5" />}   label="Network"           value={metrics.networkStatus === "online" ? "Online" : "Degraded"} sub="Polygon Mainnet" accent={metrics.networkStatus === "online"} />
        <StatCard icon={<Users className="w-5 h-5" />}      label="Total Stakers"     value={metrics.totalStakers}  sub="Active positions" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Tokens Sold"       value={fmt(metrics.tokensSold)} sub="Phase 1 ICO" />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Supply"      value={fmt(metrics.totalSupply)} sub="OKBOND" />
      </div>
      <div className="rounded-2xl p-6 border border-[#D4AF37]/12 bg-[#07111F]/60">
        <div className="flex items-center gap-2 mb-5">
          <Wifi className="w-4 h-4" style={{ color: GOLD }} />
          <span className="font-bold text-white text-sm">Live Network Status</span>
        </div>
        <div className="space-y-2">
          {networkItems.map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-sm text-white/55">{label}</span>
              <span className={`flex items-center gap-2 text-xs font-mono font-bold ${ok ? "text-emerald-400" : "text-red-400"}`}>
                <Circle className={`w-2 h-2 fill-current`} />
                {ok ? "OPERATIONAL" : "OFFLINE"}
              </span>
            </div>
          ))}
        </div>
        {metrics.lastUpdated && (
          <p className="text-[10px] text-white/25 mt-4 font-mono">
            Last sync: {metrics.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");
  const { metrics, loading, refresh } = useProtocolMetrics(30_000);
  const { provider, address } = useWallet();
  const { stats: icoStats } = useICO(provider, address);
  const { stats: stakingStats } = useStaking(provider, address);

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                <BarChart3 className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: GOLD }}>Super App Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white"
              style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
              Ecosystem Command Center
            </h1>
            <p className="text-white/40 text-sm mt-1">Live Polygon Mainnet · {address ? `${address.slice(0,6)}…${address.slice(-4)}` : "No wallet"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-xs font-mono font-bold ${metrics.networkStatus === "online" ? "text-emerald-400" : "text-amber-400"}`}>
              <Wifi className="w-3.5 h-3.5" />
              {metrics.networkStatus === "online" ? "POLYGON LIVE" : "DEGRADED"}
            </span>
            <button onClick={refresh} disabled={loading}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#D4AF37] transition-colors px-3 py-2 rounded-xl border border-white/8 hover:border-[#D4AF37]/30">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* ── Tab Navigation ── */}
        <div className="mb-8 -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 sm:px-0 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  background: activeTab === tab.id ? `${GOLD}18` : "transparent",
                  color: activeTab === tab.id ? GOLD : "rgba(255,255,255,0.35)",
                  border: `1px solid ${activeTab === tab.id ? GOLD + "40" : "transparent"}`,
                  fontFamily: "'Sora','Inter',sans-serif",
                }}
              >
                <span className={activeTab === tab.id ? "" : "opacity-60"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Active indicator line */}
          <div className="h-px mt-1 mx-4 sm:mx-0" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "portfolio"  && <PortfolioTab  metrics={metrics} icoStats={icoStats}     stakingStats={stakingStats} address={address} />}
            {activeTab === "ico"        && <ICOTab        metrics={metrics} icoStats={icoStats} />}
            {activeTab === "staking"    && <StakingTab    metrics={metrics} />}
            {activeTab === "lottery"    && <LotteryTab    metrics={metrics} />}
            {activeTab === "vault"      && <VaultTab      metrics={metrics} />}
            {activeTab === "governance" && <GovernanceTab />}
            {activeTab === "notebook"   && <NotebookTab />}
            {activeTab === "rewards"    && <RewardsTab    metrics={metrics} />}
            {activeTab === "ambassador" && <AmbassadorTab />}
            {activeTab === "analytics"  && <AnalyticsTab  metrics={metrics} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
