import { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Clock } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const coinImage = "/okbond-logo.png";
const QUICKSWAP_URL = "https://dapp.quickswap.exchange/swap?type=v3&from=0x6F539e4232c045cCAc08e2009d97BdC72815472a&to=ETH";

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

  // ── Countdown Logic ──
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(12, 0, 0, 0);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
      return true;
    };

    updateTimer();
    const timer = setInterval(() => {
      if (!updateTimer()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onCoinAnimationComplete = useCallback(async () => {
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
  }, [coinSpunIn, floatControls]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.13),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <ParticleBackground />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        
        {/* Premium Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 p-1 rounded-2xl bg-gradient-to-r from-primary/40 via-yellow-500/50 to-primary/40 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
        >
          <div className="bg-background/90 backdrop-blur-xl rounded-[14px] px-8 py-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-primary font-mono text-sm font-bold uppercase tracking-[0.2em]">ICO Phase 1 Ending In</span>
            </div>
            <div className="flex gap-6 md:gap-10">
              {[
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <span className="text-4xl md:text-6xl font-black font-mono text-foreground tabular-nums tracking-tighter">
                    {String(unit.value || 0).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[0.9]">
            Orakzai Bond<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-yellow-200 drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]">
              OKBOND
            </span>
          </h1>

          <div className="h-10 mb-8">
            <motion.p
              key={sloganIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-bold text-primary/80 italic"
            >
              "{SLOGANS[sloganIdx]}"
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {!address && (
              <Button
                onClick={onConnect}
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all"
              >
                Connect Wallet
              </Button>
            )}
            <motion.a
              href={QUICKSWAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-lg h-14 px-10 rounded-full font-bold bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all"
            >
              <ArrowLeftRight className="w-5 h-5" />
              Trade on QuickSwap
            </motion.a>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {["Polygon PoS", "Smart Contract Verified", "250+ Projects", "Capital Protected"].map((p) => (
              <span key={p} className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div className="w-px h-12 bg-gradient-to-b from-primary to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}
