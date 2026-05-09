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

// Lightweight ambient background — reduced blur for mobile perf
function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.025) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          top: "-10%", left: "-10%",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          bottom: "0%", right: "-5%",
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, -20, 0], y: [0, -25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(5,5,5,0.65) 100%)"
      }} />
    </div>
  );
}

const CONTRACTS = [
  { name: "OKBOND Token",      addr: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F" },
  { name: "ICO",               addr: "0x7BB2458740c4F491277973212309d831385Ab9D7" },
  { name: "Staking",           addr: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e" },
  { name: "Vault",             addr: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08" },
  { name: "Notebook Registry", addr: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3" },
];

const TRUST_BADGES = [
  { icon: <ShieldCheck className="w-3 h-3" />, label: "SECP Registered" },
  { icon: <Globe className="w-3 h-3" />,       label: "Polygon" },
  { icon: <Lock className="w-3 h-3" />,         label: "Audited" },
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
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
        style={{ paddingTop: "88px", paddingBottom: "48px", minHeight: "100svh" }}
      >
        <CinematicBackground />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-5 flex flex-col items-center text-center">

          {/* ── 1. Trust indicators row ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 flex-wrap justify-center mb-5"
          >
            {TRUST_BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                style={{
                  borderColor: "rgba(212,175,55,0.25)",
                  color: "rgba(212,175,55,0.75)",
                  background: "rgba(212,175,55,0.06)",
                }}
              >
                {b.icon}
                {b.label}
              </span>
            ))}
          </motion.div>

          {/* ── 2. ICO live badge ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5 flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">ICO Phase 1 · $0.50 per OKBOND</span>
          </motion.div>

          {/* ── 3. Main headline — MAX 48px mobile ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-4 max-w-3xl w-full"
          >
            <h1
              className="font-black tracking-tight leading-[1.05] text-white"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                letterSpacing: "-0.02em",
                fontSize: "clamp(32px, 6.5vw, 64px)",
              }}
            >
              Capital Protection
              <br />
              <span style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 40%, #B8942A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Meets Blockchain Sovereignty.
              </span>
            </h1>
          </motion.div>

          {/* ── 4. Short subtitle ── */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 max-w-xl mb-7 leading-relaxed font-light"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(14px, 2vw, 17px)" }}
          >
            The world's first cashback-protected decentralized bond ecosystem.
            Built on Polygon. Audited. Sovereign-grade.
          </motion.p>

          {/* ── 5. Two clean CTA buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 w-full max-w-xs sm:max-w-none sm:justify-center sm:w-auto"
          >
            <motion.a
              href={ICO_URL}
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(212,175,55,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl font-bold relative overflow-hidden"
              style={{
                height: "52px",
                padding: "0 28px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 40%, #B8942A 100%)",
                color: "#050505",
                boxShadow: "0 0 28px rgba(212,175,55,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                fontFamily: "'Sora', 'Inter', sans-serif",
                fontSize: "15px",
              }}
            >
              <Rocket className="w-4 h-4" />
              Buy OKBOND Now
            </motion.a>

            {!address ? (
              <Button
                onClick={onConnect}
                variant="outline"
                className="h-[52px] rounded-2xl font-bold border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/55 transition-all"
                style={{ fontFamily: "'Sora', 'Inter', sans-serif", padding: "0 28px", fontSize: "15px" }}
              >
                Connect Wallet
              </Button>
            ) : (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-[52px] rounded-2xl font-bold border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                style={{ fontFamily: "'Sora', 'Inter', sans-serif", padding: "0 28px", fontSize: "15px" }}
              >
                Open Dashboard
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </motion.div>

          {/* ── 6. ICO Progress Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="w-full max-w-lg mb-6"
          >
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#07111F]/50 backdrop-blur-md p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Phase 1 ICO Progress</span>
                <span className="text-[10px] font-mono text-[#D4AF37]">{progress.toFixed(1)}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/5 overflow-hidden mb-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #B8942A, #D4AF37, #F5E27D)",
                    boxShadow: "0 0 8px rgba(212,175,55,0.5)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/35 font-mono">{totalRaised.toFixed(2)} POL raised</span>
                <span className="text-white/35 font-mono">Hard Cap: 75,000 POL</span>
              </div>
            </div>
          </motion.div>

          {/* ── 7. Ecosystem stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44 }}
            className="flex items-center justify-center gap-6 flex-wrap"
          >
            {[
              { label: "ICO Price",  value: "$0.50" },
              { label: "Base APY",   value: "12–24%" },
              { label: "Network",    value: "Polygon" },
              { label: "Supply",     value: "10M Fixed" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-base font-bold text-white font-mono">{s.value}</span>
                <span className="text-[9px] text-white/35 uppercase tracking-widest font-mono">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <ArrowDown className="w-3.5 h-3.5 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ VERIFIED SMART CONTRACTS ═══════════════════════════════ */}
      <section className="relative bg-[#07111F] border-t border-[#D4AF37]/10 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(212,175,55,0.04) 0%, transparent 70%)"
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">On-Chain Transparency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
              Verified Smart Contracts
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              Every contract is publicly verified on Polygon Mainnet. Full transparency. No back doors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTRACTS.map((c, idx) => (
              <motion.a
                key={c.addr}
                href={`https://polygonscan.com/address/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -3, borderColor: "rgba(212,175,55,0.45)" }}
                className="group flex flex-col gap-2.5 p-4 rounded-2xl border border-[#D4AF37]/15 bg-[#050505]/60 backdrop-blur-sm transition-all duration-300"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">{c.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                </div>
                <p className="text-white/35 text-[11px] font-mono break-all leading-relaxed">{c.addr}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37]/55 group-hover:text-[#D4AF37] transition-colors">
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
            transition={{ delay: 0.25 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1">Official Documents</p>
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D4AF37]/25 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/45 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {doc.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PILLARS ════════════════════════════════════════════ */}
      <section className="bg-[#050505] border-t border-white/5 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
              Why Orakzai Bond?
            </h2>
            <p className="text-white/35 text-sm max-w-lg mx-auto">
              Four sovereign pillars of protection that no other DeFi ecosystem offers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "Lottery Cashback",
                desc: "Non-winners receive 100% capital return. Your participation is never at a loss.",
                color: "#3B82F6",
              },
              {
                icon: <Lock className="w-5 h-5" />,
                title: "Liquidity Protection",
                desc: "Liquidity-backed capital retention model ensures reserve backing at all times.",
                color: "#D4AF37",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Verified Contracts",
                desc: "All smart contracts are publicly verified on Polygon. No hidden logic.",
                color: "#10B981",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "60-Day Vesting",
                desc: "Secure token vesting schedule protects holders and stabilises ecosystem value.",
                color: "#8B5CF6",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative p-5 rounded-2xl border border-white/6 bg-[#07111F]/50 overflow-hidden transition-all duration-300"
                style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.25)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 0 0, ${p.color}0d 0%, transparent 60%)` }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  {p.icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
                  {p.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
