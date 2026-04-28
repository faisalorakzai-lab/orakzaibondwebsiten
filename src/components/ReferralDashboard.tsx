import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, RefreshCw, Copy, Check, ChevronDown, ChevronUp,
  Award, Star, Shield, Target, Trophy, Info, X, Lock,
  Sparkles, Layers, ShieldCheck, ArrowUpRight, Rocket,
} from "lucide-react";
import { useICO } from "@/hooks/useICO";
import { BrowserProvider } from "ethers";

interface Props {
  address: string;
  provider: BrowserProvider | null;
}

const TIER_CONFIG = [
  { level: 1, label: "Tier I",   commission: "5%",   icon: <Award className="w-4 h-4" />,  accent: "#F5C518" },
  { level: 2, label: "Tier II",  commission: "3%",   icon: <Star className="w-4 h-4" />,   accent: "#E0AE16" },
  { level: 3, label: "Tier III", commission: "2%",   icon: <Shield className="w-4 h-4" />, accent: "#C99A12" },
  { level: 4, label: "Tier IV",  commission: "1%",   icon: <Target className="w-4 h-4" />, accent: "#A8810E" },
  { level: 5, label: "Tier V",   commission: "0.5%", icon: <Trophy className="w-4 h-4" />, accent: "#8C6B0B" },
];

const ICO_PULSE = [
  { id: 1, label: "Phase 1", state: "Genesis Distribution",   status: "live" as const },
  { id: 2, label: "Phase 2", state: "Velocity Expansion",     status: "next" as const },
  { id: 3, label: "Phase 3", state: "Sovereign Lock",         status: "upcoming" as const },
];

// ── Custom Imperial Action Trigger ────────────────────────────────────────────
function ImperialTrigger({
  children, onClick, disabled, variant = "gold", className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "gold" | "ghost";
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === "gold"
          ? "bg-gradient-to-b from-[#F5C518] via-[#D4A017] to-[#9C7B0A] text-black shadow-[0_4px_20px_-4px_rgba(245,197,24,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_6px_28px_-4px_rgba(245,197,24,0.7),inset_0_1px_0_rgba(255,255,255,0.45)]"
          : "bg-black/60 text-[#F5C518] border border-[#F5C518]/30 hover:border-[#F5C518]/60 hover:bg-black/80"
      } ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {variant === "gold" && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </button>
  );
}

// ── OSG Verified Badge ────────────────────────────────────────────────────────
function OSGBadge() {
  const [tip, setTip] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        onClick={() => setTip((v) => !v)}
        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black border border-[#F5C518]/40 hover:border-[#F5C518] transition-all"
      >
        <span className="absolute inset-0 rounded-md bg-gradient-to-b from-[#F5C518]/10 to-transparent" />
        <ShieldCheck className="relative w-3 h-3 text-[#F5C518]" strokeWidth={2.5} />
        <span className="relative text-[9px] font-black uppercase tracking-[0.15em] text-[#F5C518]">Verified by OSG</span>
        <span className="relative w-1 h-1 rounded-full bg-[#F5C518] animate-pulse" />
      </button>
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full mt-2 right-0 z-50 w-64 p-3 rounded-xl backdrop-blur-xl bg-black/90 border border-[#F5C518]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          >
            <p className="text-[10px] font-bold text-[#F5C518] uppercase tracking-widest mb-1">On-Chain Settlement</p>
            <p className="text-[10px] text-white/70 leading-relaxed">
              Rewards are pre-locked inside the OSG (Orakzai Sovereign Guard) smart contract and distributed automatically — no human approval required.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 3-Stage Pulse Roadmap ─────────────────────────────────────────────────────
function ICOPulseBar() {
  return (
    <div className="relative rounded-2xl border border-[#F5C518]/15 bg-gradient-to-b from-black to-[#0a0a0a] p-5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,197,24,0.08),transparent_50%)] pointer-events-none" />
      <div className="relative flex items-center gap-2 mb-4">
        <Rocket className="w-3.5 h-3.5 text-[#F5C518]" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5C518]">SGI Lifecycle</p>
        <div className="ml-auto px-2 py-0.5 rounded bg-[#F5C518]/10 border border-[#F5C518]/30">
          <p className="text-[8px] font-black uppercase tracking-widest text-[#F5C518]">Bound to ICO Only</p>
        </div>
      </div>

      <div className="relative">
        {/* Connector rail */}
        <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-[#F5C518] via-[#F5C518]/40 to-[#F5C518]/10" />

        <div className="relative grid grid-cols-3 gap-2">
          {ICO_PULSE.map((p) => (
            <div key={p.id} className="flex flex-col items-center text-center">
              <div className="relative">
                {p.status === "live" && (
                  <span className="absolute inset-0 rounded-full bg-[#F5C518] animate-ping opacity-50" />
                )}
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] border-2 ${
                    p.status === "live"
                      ? "bg-[#F5C518] border-[#F5C518] text-black shadow-[0_0_20px_rgba(245,197,24,0.6)]"
                      : p.status === "next"
                      ? "bg-black border-[#F5C518]/60 text-[#F5C518]"
                      : "bg-black border-[#F5C518]/20 text-[#F5C518]/40"
                  }`}
                >
                  {p.status === "upcoming" ? <Lock className="w-3 h-3" /> : p.id}
                </div>
              </div>
              <p className={`mt-2 text-[10px] font-black uppercase tracking-wider ${p.status === "upcoming" ? "text-white/30" : "text-[#F5C518]"}`}>
                {p.label}
              </p>
              <p className={`text-[9px] mt-0.5 ${p.status === "upcoming" ? "text-white/20" : "text-white/50"}`}>
                {p.state}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative mt-4 pt-3 border-t border-[#F5C518]/10 text-[9px] text-white/40 leading-relaxed text-center">
        SGI distributions terminate at the close of <span className="text-[#F5C518]/80 font-bold">Phase 3</span>. No incentive payouts post-listing.
      </p>
    </div>
  );
}

// ── Glassmorphic Transparency Modal ───────────────────────────────────────────
function SourcingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20,18,10,0.85) 0%, rgba(8,8,8,0.85) 100%)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(245,197,24,0.25)",
              boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(245,197,24,0.15)",
            }}
          >
            {/* Top sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C518]/60 to-transparent" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#F5C518]/10 blur-3xl pointer-events-none" />

            <div className="relative p-7">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5C518]/30 to-[#F5C518]/5 border border-[#F5C518]/40 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#F5C518]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5C518]/70">Transparency Ledger</p>
                    <h3 className="text-lg font-black text-[#F5C518]">SGI Sourcing — 50 / 50</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#F5C518] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-6">
                Every SGI payout is sourced from two on-chain reserves in equal measure. No new tokens are minted, and no project treasury is drained.
              </p>

              <div className="space-y-3">
                {/* 50% Founder's Equity */}
                <div className="rounded-2xl border border-[#F5C518]/20 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#F5C518]">Founder's Equity</p>
                    </div>
                    <p className="text-2xl font-black text-[#F5C518]">50%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-black overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "50%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-[#F5C518] to-[#D4A017]"
                    />
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Half of every commission is paid from the founder's vested allocation — a personal stake aligning the team with growth, not dilution.
                  </p>
                </div>

                {/* 50% Staking Reserve */}
                <div className="rounded-2xl border border-[#F5C518]/20 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#F5C518]" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#F5C518]">Staking Reserve</p>
                    </div>
                    <p className="text-2xl font-black text-[#F5C518]">50%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-black overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "50%" }}
                      transition={{ duration: 0.8, delay: 0.35 }}
                      className="h-full bg-gradient-to-r from-[#9C7B0A] to-[#F5C518]"
                    />
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    The other half is drawn from a pre-locked staking reserve that yields throughout the ICO lifecycle, settling commissions without inflation.
                  </p>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl border border-[#F5C518]/15 bg-gradient-to-r from-[#F5C518]/5 to-transparent flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5C518] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-white/60 leading-relaxed">
                  Both reserves are governed by the OSG smart contract. Disbursements are public, immutable, and verifiable on Polygonscan.
                </p>
              </div>

              <div className="mt-5">
                <ImperialTrigger onClick={onClose} className="w-full">
                  Acknowledged
                </ImperialTrigger>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ReferralDashboard({ address, provider }: Props) {
  const { userStats, refresh } = useICO(provider, address);
  const [copied, setCopied] = useState(false);
  const [expandedTier, setExpandedTier] = useState<number | null>(1);
  const [modalOpen, setModalOpen] = useState(false);

  const sgiLink = typeof window !== 'undefined' ? `${window.location.origin}/ico?ref=${address}` : "";

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && sgiLink) {
      navigator.clipboard.writeText(sgiLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* ── Header — SGI Identity ──────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden p-6"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #141008 100%)",
            border: "1px solid rgba(245,197,24,0.25)",
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(245,197,24,0.12)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C518]/70 to-transparent" />
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-[#F5C518]/8 blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between mb-5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5C518]/25 to-[#F5C518]/5 border border-[#F5C518]/40 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#F5C518]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F5C518]/70">Strategic Growth Incentive</p>
                <h3 className="text-lg font-black text-[#F5C518] tracking-tight truncate">SGI Network Console</h3>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="group flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-[#F5C518]/25 hover:border-[#F5C518] hover:bg-black transition-all"
            >
              <Info className="w-3 h-3 text-[#F5C518]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C518]">Sourcing</span>
            </button>
          </div>

          {/* Link row + OSG badge */}
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-[#F5C518]/60 uppercase tracking-[0.2em]">Your SGI Invite Link</p>
              <OSGBadge />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-black border border-[#F5C518]/15">
              <input
                readOnly
                value={sgiLink}
                className="flex-1 bg-transparent border-none text-xs font-mono text-[#F5C518]/80 px-3 focus:outline-none truncate"
              />
              <ImperialTrigger onClick={copyLink}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </ImperialTrigger>
            </div>
          </div>
        </div>

        {/* ── 3-Stage Pulse Roadmap ──────────────────────────────────────── */}
        <ICOPulseBar />

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-2xl border border-[#F5C518]/15 bg-gradient-to-br from-black to-[#0a0a0a] p-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C518]/40 to-transparent" />
            <p className="text-[10px] text-[#F5C518]/60 uppercase font-black tracking-widest mb-1">Network Size</p>
            <p className="text-2xl font-black text-[#F5C518]">{userStats?.referralCount || "0"}</p>
            <p className="text-[9px] text-white/40 mt-0.5">Total SGI invites</p>
          </div>
          <div className="relative rounded-2xl border border-[#F5C518]/30 bg-gradient-to-br from-[#F5C518]/10 to-black p-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent" />
            <p className="text-[10px] text-[#F5C518] uppercase font-black tracking-widest mb-1">SGI Yield</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-[#F5C518]">{parseFloat(userStats?.referralEarnings || "0").toFixed(2)}</p>
              <span className="text-xs font-black text-[#F5C518]/70">OKBOND</span>
            </div>
            <p className="text-[9px] text-white/40 mt-0.5">Settled on-chain</p>
          </div>
        </div>

        {/* ── Tier Breakdown ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-[#F5C518] uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#F5C518] animate-pulse" />
              Tier Architecture
            </h4>
            <button
              onClick={() => refresh()}
              className="group p-1.5 rounded-lg bg-black/60 border border-[#F5C518]/15 hover:border-[#F5C518]/50 transition-all"
            >
              <RefreshCw className="w-3 h-3 text-[#F5C518] group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {TIER_CONFIG.map((cfg, idx) => {
            const count = userStats?.levelCounts?.[idx] || "0";
            const earnings = userStats?.levelEarnings?.[idx] || "0";
            const isExpanded = expandedTier === cfg.level;

            return (
              <div
                key={cfg.level}
                className="relative rounded-2xl border bg-black overflow-hidden transition-all duration-300"
                style={{
                  borderColor: isExpanded ? `${cfg.accent}66` : "rgba(245,197,24,0.12)",
                  boxShadow: isExpanded ? `0 8px 30px -10px ${cfg.accent}40, inset 0 1px 0 ${cfg.accent}20` : undefined,
                }}
              >
                {isExpanded && (
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)` }}
                  />
                )}
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : cfg.level)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center border"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.accent}25, ${cfg.accent}05)`,
                        borderColor: `${cfg.accent}40`,
                        color: cfg.accent,
                      }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black" style={{ color: cfg.accent }}>{cfg.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                        {cfg.commission} SGI Commission
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black" style={{ color: cfg.accent }}>{count}</p>
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-wider">Members</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" style={{ color: cfg.accent }} />
                      : <ChevronDown className="w-4 h-4 text-white/40" />}
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
                      <div className="px-4 pb-4 pt-2 space-y-2 border-t" style={{ borderColor: `${cfg.accent}20` }}>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/5">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Yield Settled</span>
                          <p className="text-sm font-black font-mono" style={{ color: cfg.accent }}>
                            {parseFloat(earnings || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} OKBOND
                          </p>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/5">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Source
                          </span>
                          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: cfg.accent }}>
                            50% Equity · 50% Reserve
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#F5C518]/15 bg-gradient-to-r from-[#F5C518]/5 via-black to-black p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F5C518]">Verify Sourcing Logic</p>
            <p className="text-[10px] text-white/50 mt-0.5">Open the transparency ledger to inspect the 50/50 split.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="group flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F5C518] hover:text-white transition-colors"
          >
            View Ledger <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <SourcingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
