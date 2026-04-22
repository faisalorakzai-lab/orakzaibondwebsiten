import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
const coinImage = "/okbond-logo.png";
const QUICKSWAP_URL = "https://dapp.quickswap.exchange/swap?type=v3&from=0x6F539e4232c045cCAc08e2009d97BdC72815472a&to=ETH";
import ParticleBackground from "@/components/ParticleBackground";

interface HeroProps {
  onConnect: () => void;
  address: string | null;
}

const SLOGANS = [
  "Beyond Borders. Beyond Limits.",
  "The Sovereign Currency of Power.",
  "One Ecosystem. Infinite Potential.",
];

export default function Hero({ onConnect, address }: HeroProps) {
  const [coinSpunIn, setCoinSpunIn] = useState(false);
  const [sloganIdx, setSloganIdx] = useState(0);
  const floatControls = useAnimation();

  async function onCoinAnimationComplete() {
    if (coinSpunIn) return;
    setCoinSpunIn(true);
    floatControls.start({
      y: [0, -22, 0],
      rotateZ: [0, 2.5, 0, -2.5, 0],
      transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
    });
    const cycle = setInterval(() => {
      setSloganIdx((i) => (i + 1) % SLOGANS.length);
    }, 3200);
    return () => clearInterval(cycle);
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
      {/* Layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.13),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <ParticleBackground />

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Text block */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="flex-1 text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm font-semibold uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.25)]"
          >
            <motion.span className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            World's Most Unique Crypto Bond
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            Orakzai Bond{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-yellow-200 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]">
              OKBOND
            </span>
          </h1>

          {/* Animated rotating slogan */}
          <div className="h-14 flex items-center justify-center lg:justify-start mb-6 overflow-hidden">
            <motion.p
              key={sloganIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl font-bold text-primary/90"
            >
              {SLOGANS[sloganIdx]}
            </motion.p>
          </div>

          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            The sovereign financial layer of the Orakzai Group — where serious ambition meets raw blockchain power on Polygon.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {!address && (
              <Button
                onClick={onConnect}
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_25px_rgba(234,179,8,0.55)] hover:shadow-[0_0_50px_rgba(234,179,8,0.85)] hover:-translate-y-1 transition-all duration-300"
              >
                Connect to Vault
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-primary/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              Explore OKBOND
            </Button>
            <motion.a
              href={QUICKSWAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-lg h-14 px-8 rounded-full font-bold bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400 hover:text-emerald-300 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]"
            >
              <ArrowLeftRight className="w-5 h-5" />
              Buy / Sell on QuickSwap
            </motion.a>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8">
            {[
              { label: "Polygon PoS" },
              { label: "Smart Contract Verified" },
              { label: "250+ Projects" },
              { label: "Military-Grade Security" },
            ].map((p) => (
              <span key={p.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary/70 text-xs font-mono">
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                {p.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Coin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 flex justify-center lg:justify-end relative"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96" style={{ perspective: "1000px" }}>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(234,179,8,0.45) 0%, rgba(234,179,8,0.15) 40%, transparent 70%)", filter: "blur(30px)" }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div className="absolute inset-4 rounded-full border border-primary/20"
              animate={{ rotateZ: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ borderStyle: "dashed" }} />
            <motion.div className="absolute inset-8 rounded-full border border-primary/10"
              animate={{ rotateZ: -360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              style={{ borderStyle: "dashed" }} />
            <motion.div
              initial={{ rotateY: -540, scale: 0.7, opacity: 0 }}
              animate={coinSpunIn ? floatControls : { rotateY: 0, scale: 1, opacity: 1 }}
              transition={coinSpunIn ? undefined : { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              onAnimationComplete={onCoinAnimationComplete}
              className="relative z-10 w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img src={coinImage} alt="Orakzai Bond Coin" className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(234,179,8,0.7)) drop-shadow(0 0 80px rgba(234,179,8,0.35))" }} />
            </motion.div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(234,179,8,0.25) 0%, transparent 70%)", filter: "blur(8px)" }} />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground/50 uppercase tracking-widest font-mono">Scroll</span>
        <motion.div className="w-px h-10 bg-gradient-to-b from-primary/40 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
    </section>
  );
}
