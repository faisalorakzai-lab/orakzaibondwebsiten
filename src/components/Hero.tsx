import { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
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

// Premium 3D Metallic Style Icons as SVG components
const PillarIcon = ({ type }: { type: "cashback" | "protection" | "verified" | "vesting" }) => {
  const iconMap = {
    cashback: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="cashback-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="cashback-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" floodColor="#3b82f6" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#cashback-grad)" opacity="0.15" />
        <rect x="16" y="20" width="32" height="24" rx="4" fill="url(#cashback-grad)" stroke="url(#cashback-grad)" strokeWidth="1.5" filter="url(#cashback-shadow)" />
        <circle cx="24" cy="32" r="3" fill="#60a5fa" />
        <circle cx="40" cy="32" r="3" fill="#60a5fa" />
        <path d="M 20 28 Q 32 35 44 28" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    protection: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="protection-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="protection-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" floodColor="#3b82f6" />
          </filter>
        </defs>
        <path d="M 32 14 L 20 20 L 20 32 Q 20 45 32 50 Q 44 45 44 32 L 44 20 Z" fill="url(#protection-grad)" opacity="0.15" stroke="url(#protection-grad)" strokeWidth="1.5" filter="url(#protection-shadow)" />
        <path d="M 28 32 L 32 36 L 40 26" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    verified: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="verified-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="verified-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" floodColor="#10b981" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="18" fill="url(#verified-grad)" opacity="0.15" stroke="url(#verified-grad)" strokeWidth="1.5" filter="url(#verified-shadow)" />
        <path d="M 26 32 L 30 36 L 38 28" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    vesting: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="vesting-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="vesting-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" floodColor="#3b82f6" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="16" fill="none" stroke="url(#vesting-grad)" strokeWidth="1.5" opacity="0.3" />
        <circle cx="32" cy="32" r="12" fill="url(#vesting-grad)" opacity="0.15" stroke="url(#vesting-grad)" strokeWidth="1.5" filter="url(#vesting-shadow)" />
        <path d="M 32 24 L 32 32 L 38 38" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return iconMap[type];
};

const PILLARS = [
  {
    type: "cashback" as const,
    title: "Lottery Non-Winner Cashback",
    color: "from-blue-500 to-blue-600",
    glowColor: "shadow-blue-500/40",
    borderColor: "border-blue-500/50",
  },
  {
    type: "protection" as const,
    title: "100% Capital Protection",
    color: "from-blue-500 to-blue-600",
    glowColor: "shadow-blue-500/40",
    borderColor: "border-blue-500/50",
  },
  {
    type: "verified" as const,
    title: "Verified Smart Contract",
    color: "from-emerald-500 to-emerald-600",
    glowColor: "shadow-emerald-500/40",
    borderColor: "border-emerald-500/50",
  },
  {
    type: "vesting" as const,
    title: "60-Day Secure Vesting",
    color: "from-blue-500 to-blue-600",
    glowColor: "shadow-blue-500/40",
    borderColor: "border-blue-500/50",
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
            
            {/* Premium "BUY ICO NOW" Button with Neon Glow */}
            <motion.a
              href={ICO_URL}
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(16,185,129,0.8), 0 0 100px rgba(16,185,129,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-lg h-16 px-12 rounded-full font-black bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 text-white transition-all duration-300 relative overflow-hidden group"
              style={{
                boxShadow: "0 0 30px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(16,185,129,0.3)",
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Checkmark SVG */}
              <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              
              <span className="relative z-10">BUY ICO NOW</span>
            </motion.a>
          </div>

          {/* 4 Pillars Section with Glass-Morphism & Neon Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {PILLARS.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ y: -6, boxShadow: `0 0 40px rgba(${pillar.type === 'verified' ? '16,185,129' : '59,130,246'}, 0.6)` }}
                className={`relative p-6 rounded-2xl backdrop-blur-xl border ${pillar.borderColor} bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden group`}
                style={{
                  boxShadow: `0 0 20px rgba(${pillar.type === 'verified' ? '16,185,129' : '59,130,246'}, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                {/* Animated neon border glow */}
                <div className={`absolute inset-0 rounded-2xl border ${pillar.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                
                {/* Animated gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${pillar.type === 'verified' ? 'emerald' : 'blue'}-500/0 to-${pillar.type === 'verified' ? 'emerald' : 'blue'}-500/0 group-hover:from-${pillar.type === 'verified' ? 'emerald' : 'blue'}-500/5 group-hover:to-${pillar.type === 'verified' ? 'emerald' : 'blue'}-500/5 transition-all duration-500 rounded-2xl`} />

                {/* Icon Container with 3D effect */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} mb-4 p-3 group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: `0 8px 16px rgba(${pillar.type === 'verified' ? '16,185,129' : '59,130,246'}, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <PillarIcon type={pillar.type} />
                </div>

                {/* Text with modern typography */}
                <p className="text-base font-black text-foreground leading-snug relative z-10 tracking-tight">{pillar.title}</p>
              </motion.div>
            ))}
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
