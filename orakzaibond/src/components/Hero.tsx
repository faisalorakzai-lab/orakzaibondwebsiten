import { motion } from "framer-motion";
import { Rocket, ShieldCheck, Zap, Lock, ExternalLink, ArrowDown, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useICO } from "@/hooks/useICO";
import { useTokenPrice } from "@/hooks/useTokenPrice";

const ICO_URL = "/ico";

interface HeroProps {
  onConnect: () => void;
  address: string | null;
}

function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.015) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 50%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(5,5,5,0.8) 100%)"
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
  { icon: <Globe className="w-3.5 h-3.5" />,       label: "Polygon" },
  { icon: <Lock className="w-3.5 h-3.5" />,         label: "Audited" },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Verified Contracts" },
];

export default function Hero({ onConnect, address }: HeroProps) {
  const { provider } = useWallet();
  const { stats } = useICO(provider, address);
  const tokenPrice = useTokenPrice();

  const tokensSold = stats ? parseFloat(stats.totalTokensSold) : 0;
  const progress = Math.min((tokensSold / 75000) * 100, 100);

  return (
    <>
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
        style={{ paddingTop: "120px", paddingBottom: "80px", minHeight: "100svh" }}
      >
        <CinematicBackground />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">

          {/* ── 1. Trust indicators row ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 flex-wrap justify-center mb-8 md:mb-10"
          >
            {TRUST_BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider border"
                style={{
                  borderColor: "rgba(212,175,55,0.2)",
                  color: "rgba(212,175,55,0.8)",
                  background: "rgba(212,175,55,0.05)",
                }}
              >
                {b.icon}
                <span>{b.label}</span>
              </span>
            ))}
          </motion.div>

          {/* ── 2. ICO live badge with live price ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-8 md:mb-10 flex items-center gap-2.5 px-4 md:px-5 py-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-wider">
              ICO Phase 1 · {tokenPrice.isLoading ? "Syncing Price…" : tokenPrice.displayPrice} per OKBOND
            </span>
            {tokenPrice.isLive && (
              <span className="text-emerald-400/60 text-[10px] font-mono">LIVE</span>
            )}
          </motion.div>

          {/* ── 3. Main headline ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mb-6 md:mb-8 max-w-4xl w-full"
          >
            <h1
              className="font-black tracking-tight leading-[1.08] text-white"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                letterSpacing: "-0.02em",
                fontSize: "clamp(36px, 7vw, 72px)",
                fontWeight: 900,
              }}
            >
              Capital Protection
              <br />
              <span style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 35%, #B8942A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Meets Blockchain Sovereignty
              </span>
            </h1>
          </motion.div>

          {/* ── 4. Subtitle ── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/55 max-w-2xl mb-10 md:mb-14 leading-relaxed font-light"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(15px, 2.2vw, 18px)" }}
          >
            The world's first cashback-protected decentralized bond ecosystem.
            Built on Polygon. Audited. Sovereign-grade.
          </motion.p>

          {/* ── 5. CTA buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-5 mb-12 md:mb-16 w-full max-w-sm sm:max-w-none sm:justify-center"
          >
            <motion.a
              href={ICO_URL}
              whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(212,175,55,0.4)" }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl font-bold relative overflow-hidden"
              style={{
                height: "56px",
                padding: "0 32px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5E27D 40%, #B8942A 100%)",
                color: "#050505",
                boxShadow: "0 0 32px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
                fontFamily: "'Sora', 'Inter', sans-serif",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              <Rocket className="w-5 h-5" />
              Buy OKBOND Now
            </motion.a>

            {!address ? (
              <Button
                onClick={onConnect}
                variant="outline"
                className="h-14 rounded-2xl font-bold border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/50 transition-all"
                style={{ 
                  fontFamily: "'Sora', 'Inter', sans-serif", 
                  padding: "0 32px", 
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Connect Wallet
              </Button>
            ) : (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl font-bold border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/50 transition-all border"
                style={{ 
                  fontFamily: "'Sora', 'Inter', sans-serif", 
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Dashboard
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </motion.div>

          {/* ── 6. Scroll indicator ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-xs md:text-sm uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.5)" }}>
                Scroll to explore
              </p>
              <ArrowDown className="w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
