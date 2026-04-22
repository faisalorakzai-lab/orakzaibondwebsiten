import { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, ShieldCheck, Gift } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const coinImage = "/okbond-logo.png";
const ICO_URL = "/ico";

interface HeroProps {
  onConnect: () => void;
  address: string | null;
}

const SLOGANS = [
  "Beyond Borders. Beyond Limits.",
  "The Sovereign Currency of Power.",
  "One Ecosystem. Infinite Potential.",
];

const PILLARS = [
  {
    icon: Gift,
    title: "Lottery Non-Winner Cashback",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    icon: ShieldCheck,
    title: "100% Capital Protection",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    icon: CheckCircle2,
    title: "Verified Smart Contract",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    icon: Clock,
    title: "60-Day Secure Vesting",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.13),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <ParticleBackground />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        
        {/* Premium Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-1 rounded-3xl bg-gradient-to-r from-primary/50 via-yellow-500/60 to-primary/50 shadow-[0_0_40px_rgba(234,179,8,0.4)]"
        >
          <div className="bg-background/95 backdrop-blur-2xl rounded-[22px] px-10 py-8 flex flex-col items-center border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-primary font-mono text-sm font-black uppercase tracking-[0.3em]">ICO PHASE 1 STARTING IN</span>
            </div>
            <div className="flex gap-8 md:gap-14">
              {[
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl font-black font-mono text-foreground tabular-nums tracking-tighter leading-none">
                    {String(unit.value || 0).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 mt-2">{unit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-5xl"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground mb-8 leading-[0.85]">
            Orakzai Bond<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-yellow-200 drop-shadow-[0_0_50px_rgba(234,179,8,0.7)]">
              OKBOND
            </span>
          </h1>

          <div className="h-12 mb-10">
            <motion.p
              key={sloganIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-2xl md:text-3xl font-bold text-primary/85 italic"
            >
              "{SLOGANS[sloganIdx]}"
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-14">
            {!address && (
              <Button
                onClick={onConnect}
                size="lg"
                className="w-full sm:w-auto text-lg h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-[0_0_40px_rgba(234,179,8,0.5)] hover:shadow-[0_0_60px_rgba(234,179,8,0.8)] transition-all duration-300"
              >
                Connect Wallet
              </Button>
            )}
            <motion.a
              href={ICO_URL}
              whileHover={{ scale: 1.05 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-lg h-16 px-12 rounded-full font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]"
            >
              <CheckCircle2 className="w-6 h-6" />
              BUY ICO NOW
            </motion.a>
          </div>

          {/* 4 Pillars Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border ${pillar.borderColor} ${pillar.bgColor} backdrop-blur-sm transition-all hover:shadow-[0_0_20px_${pillar.color.replace('text-', 'rgba').replace('-400', ',0.2)')}]`}
                >
                  <div className={`w-10 h-10 rounded-lg ${pillar.bgColor} border ${pillar.borderColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug">{pillar.title}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-xs text-muted-foreground/50 uppercase tracking-widest font-mono">Explore</span>
        <motion.div className="w-px h-14 bg-gradient-to-b from-primary/60 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}
