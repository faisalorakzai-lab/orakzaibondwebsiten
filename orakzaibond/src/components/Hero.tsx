import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, Zap, TrendingUp, Lock, ExternalLink, ArrowDown, Users, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";

const ICO_URL = "/ico";

interface HeroProps {
  onConnect: () => void;
  address: string | null;
}

// Floating orb background
function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Ambient orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 700, height: 700,
          top: "-20%", left: "-15%",
          background: "radial-gradient(circle, rgba(7,17,31,0.95) 0%, rgba(212,175,55,0.07) 60%, transparent 80%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          bottom: "-10%", right: "-10%",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: "30%", right: "10%",
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }}
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(5,5,5,0.7) 100%)"
      }} />
    </div>
  );
}

// Live metric pill
function LivePill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl border border-[#D4AF37]/20 bg-[#07111F]/60 backdrop-blur-md min-w-[120px]">
      <span className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest font-mono mb-1">{label}</span>
      <span className="text-lg font-bold text-white font-mono leading-none">{value}</span>
      {sub && <span className="text-[10px] text-white/40 mt-0.5">{sub}</span>}
    </div>
  );
}

const CONTRACTS = [
  { name: "OKBOND Token",     addr: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F" },
  { name: "ICO",              addr: "0x7BB2458740c4F491277973212309d831385Ab9D7" },
  { name: "Staking",          addr: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e" },
  { name: "Vault",            addr: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08" },
  { name: "Notebook Registry",addr: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3" },
];

const TRUST_BADGES = [
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Audited Smart Contracts" },
  { icon: <Globe className="w-4 h-4" />,       label: "Polygon Mainnet" },
  { icon: <Lock className="w-4 h-4" />,         label: "Chainlink VRF" },
  { icon: <Users className="w-4 h-4" />,        label: "Capital Protected" },
];

export default function Hero({ onConnect, address }: HeroProps) {
  const { provider } = useWallet();
  const { stats } = useICO(provider, address);

  const tokensSold = stats ? parseFloat(stats.totalTokensSold) : 0;
  const totalRaised = stats ? parseFloat(stats.totalRaisedPOL) : 0;
  const progress = Math.min((tokensSold / 75000) * 100, 100);

  return (
    <>
      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
        style={{ paddingTop: "80px", paddingBottom: "60px" }}>
        <CinematicBackground />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

          {/* ── Live ICO banner ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">ICO Phase 1 Live · $0.50 per OKBOND</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
          </motion.div>

          {/* ── Main headline ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 max-w-4xl"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-white"
              style={{ fontFamily: "'Sora', 'Inter', sans-serif", letterSpacing: "-0.02em" }}
            >
              Capital Protection<br />
              <span style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 40%, #B8942A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Meets Blockchain Sovereignty.
              </span>
            </h1>
          </motion.div>

          {/* ── Sub headline ── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl text-white/55 max-w-2xl mb-10 leading-relaxed font-light"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            The world's first cashback-protected decentralized bond ecosystem.
            Built on Polygon. Audited. Sovereign-grade.
          </motion.p>

          {/* ── CTA Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full max-w-sm sm:max-w-none sm:justify-center"
          >
            <motion.a
              href={ICO_URL}
              whileHover={{ scale: 1.03, boxShadow: "0 0 60px rgba(212,175,55,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 rounded-2xl font-bold text-base relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 40%, #B8942A 100%)",
                color: "#050505",
                boxShadow: "0 0 40px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
                fontFamily: "'Sora', 'Inter', sans-serif",
              }}
            >
              <Rocket className="w-5 h-5" />
              Buy OKBOND Now
            </motion.a>
            {!address ? (
              <Button
                onClick={onConnect}
                variant="outline"
                className="w-full sm:w-auto h-14 px-10 rounded-2xl font-bold text-base border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all"
                style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}
              >
                Connect Wallet
              </Button>
            ) : (
              <a
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl font-bold text-base border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}
              >
                Open Dashboard
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </motion.div>

          {/* ── Live metrics strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-3 flex-wrap justify-center mb-14 w-full max-w-2xl"
          >
            <LivePill label="ICO Price"  value="$0.50"        sub="Phase 1 Live" />
            <LivePill label="Base APY"   value="12-24%"       sub="Staking yield" />
            <LivePill label="Network"    value="Polygon"      sub="137 Mainnet" />
            <LivePill
              label="Tokens Sold"
              value={`${tokensSold.toLocaleString()}`}
              sub="of 1M total"
            />
          </motion.div>

          {/* ── ICO Progress Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="w-full max-w-2xl mb-12"
          >
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#07111F]/50 backdrop-blur-md p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/60 font-mono uppercase tracking-widest">Phase 1 ICO Progress</span>
                <span className="text-xs font-mono text-[#D4AF37]">{progress.toFixed(1)}%</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.7 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #B8942A, #D4AF37, #F5E27D)",
                    boxShadow: "0 0 12px rgba(212,175,55,0.6)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-mono">{totalRaised.toFixed(2)} POL raised</span>
                <span className="text-white/40 font-mono">Hard Cap: 75,000 POL</span>
              </div>
            </div>
          </motion.div>

          {/* ── Trust badges ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-4"
          >
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3 text-white/50 text-xs font-medium"
              >
                <span className="text-[#D4AF37]/60">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <ArrowDown className="w-4 h-4 text-white/25" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ VERIFIED SMART CONTRACTS ═══════════════════════════════ */}
      <section className="relative bg-[#07111F] border-t border-[#D4AF37]/10 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(212,175,55,0.05) 0%, transparent 70%)"
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">On-Chain Transparency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
              Verified Smart Contracts
            </h2>
            <p className="text-white/45 text-sm max-w-xl mx-auto">
              Every contract is publicly verified on Polygon Mainnet. Full transparency. No back doors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTRACTS.map((c, idx) => (
              <motion.a
                key={c.addr}
                href={`https://polygonscan.com/address/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.5)" }}
                className="group flex flex-col gap-3 p-5 rounded-2xl border border-[#D4AF37]/15 bg-[#050505]/60 backdrop-blur-sm transition-all duration-300"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">{c.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                </div>
                <p className="text-white/40 text-[11px] font-mono break-all leading-relaxed">{c.addr}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>View on PolygonScan</span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Document Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <p className="text-white/35 text-xs font-mono uppercase tracking-widest mb-2">Official Documents</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Whitepaper",    href: "https://drive.google.com/uc?export=download&id=1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh" },
                { label: "Marketing PDF", href: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr" },
                { label: "Audit Report",  href: "https://drive.google.com/uc?export=download&id=1uvONnEDac-Z06mrth6TT94N9bRGecyhN" },
              ].map((doc) => (
                <a
                  key={doc.label}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#D4AF37]/25 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {doc.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PILLARS ════════════════════════════════════════════ */}
      <section className="bg-[#050505] border-t border-white/5 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
              Why Orakzai Bond?
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              Four sovereign pillars of protection that no other DeFi ecosystem offers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Lottery Cashback",
                desc: "Non-winners receive 100% capital return. Your participation is never at a loss.",
                color: "#3B82F6",
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Liquidity Protection",
                desc: "Liquidity-backed capital retention model ensures reserve backing at all times.",
                color: "#D4AF37",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Verified Contracts",
                desc: "All smart contracts are publicly verified on Polygon. No hidden logic.",
                color: "#10B981",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "60-Day Vesting",
                desc: "Secure token vesting schedule protects holders and stabilises ecosystem value.",
                color: "#8B5CF6",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-2xl border border-white/6 bg-[#07111F]/50 overflow-hidden transition-all duration-300"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 0 0, ${p.color}0d 0%, transparent 60%)` }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  {p.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2" style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
                  {p.title}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
