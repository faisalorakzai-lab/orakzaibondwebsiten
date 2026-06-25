import { motion } from "framer-motion";
import { ShieldCheck, Trophy, Sparkles, Zap, Clock, ExternalLink, Users, ArrowRight, CheckCircle } from "lucide-react";
import Lottery from "@/components/Lottery";
import { useWallet } from "@/hooks/useWallet";

const GOLD = "#D4AF37";

export default function LotteryPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();

  useSEO(PAGE_SEO.lottery);
  return (
    <div className="min-h-screen pb-24 lg:pb-10" style={{ background: "#050505" }}>

      {/* ── Cinematic Header ── */}
      <div className="relative overflow-hidden border-b border-white/5"
        style={{
          background: "linear-gradient(135deg, #050505 0%, #07111F 50%, #050505 100%)",
          paddingTop: "80px",
          paddingBottom: "60px",
        }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${GOLD}0a 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 mb-6"
          >
            <Trophy className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>OKBOND Smart Lottery</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-mono">LIVE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: "'Sora','Inter',sans-serif", letterSpacing: "-0.02em" }}
          >
            Win Big.<br />
            <span style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #F5E27D 40%, #B8942A 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Risk Nothing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mb-10"
          >
            The world's only capital-protected lottery. Winners claim the prize.
            Non-winners receive 100% of their deposit back. Powered by Chainlink VRF.
          </motion.p>

          {/* ── Trust strip ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "100% Capital Return" },
              { icon: <Zap         className="w-3.5 h-3.5" />, label: "Chainlink VRF" },
              { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Audited Contract" },
              { icon: <Users       className="w-3.5 h-3.5" />, label: "On-Chain Transparent" },
            ].map((b) => (
              <span key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3 text-white/45 text-xs font-medium">
                <span style={{ color: GOLD + "99" }}>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2"
            style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
            How It Works
          </h2>
          <p className="text-white/40 text-sm">Three steps to participate in the sovereign lottery</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            {
              step: "01",
              icon: <Sparkles className="w-6 h-6" />,
              title: "Enter the Draw",
              desc: "Purchase lottery tickets with OKBOND tokens. Each ticket gives you an equal chance to win.",
              color: "#3B82F6",
            },
            {
              step: "02",
              icon: <Clock className="w-6 h-6" />,
              title: "Wait for Draw",
              desc: "The smart contract draws a winner using Chainlink VRF — provably fair, tamper-proof randomness.",
              color: GOLD,
            },
            {
              step: "03",
              icon: <Trophy className="w-6 h-6" />,
              title: "Win or Get Refunded",
              desc: "Winner takes the prize. Non-winners receive 100% of their ticket deposit back. No one loses capital.",
              color: "#10B981",
            },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl p-6 border border-white/6"
              style={{ background: "rgba(7,17,31,0.7)" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${step.color}18`, color: step.color }}>
                  {step.icon}
                </div>
                <div className="absolute top-5 right-5 text-5xl font-black leading-none select-none"
                  style={{ color: step.color + "12", fontFamily: "'JetBrains Mono', monospace" }}>
                  {step.step}
                </div>
              </div>
              <h3 className="text-white font-bold text-base mt-4 mb-2"
                style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main Lottery Component ── */}
        <div className="rounded-3xl border overflow-hidden" style={{ borderColor: `${GOLD}25` }}>
          <div className="px-6 py-5 border-b flex items-center justify-between"
            style={{ borderColor: `${GOLD}15`, background: `${GOLD}08` }}>
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5" style={{ color: GOLD }} />
              <span className="font-bold text-white" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                Live Lottery Terminal
              </span>
            </div>
            <a
              href={`https://polygonscan.com/address/0x7BB2458740c4F491277973212309d831385Ab9D7`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-[#D4AF37] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify Contract
            </a>
          </div>
          <div style={{ background: "#050505" }}>
            <Lottery
              provider={provider}
              address={address}
              onConnect={connect}
              isPolygon={isPolygon}
              switchToPolygon={switchToPolygon}
            />
          </div>
        </div>

        {/* ── VRF Transparency Note ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl p-5 border border-white/6 flex items-start gap-4"
          style={{ background: "rgba(7,17,31,0.5)" }}
        >
          <Zap className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
          <div>
            <p className="text-white text-sm font-semibold mb-1">Chainlink VRF Verified Randomness</p>
            <p className="text-white/40 text-xs leading-relaxed">
              Winners are selected using Chainlink's Verifiable Random Function (VRF). This cryptographic proof
              ensures the lottery outcome is truly random and cannot be manipulated by any party — including
              the contract owner. Every draw is fully verifiable on-chain.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
