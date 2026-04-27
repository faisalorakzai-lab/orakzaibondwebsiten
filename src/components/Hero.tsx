import { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, ShieldCheck, TrendingUp, ExternalLink } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { useICO } from "@/hooks/useICO";
import { useWallet } from "@/hooks/useWallet";

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

// Premium 3D Metallic Style Icons as SVG components with enhanced effects
const PillarIcon = ({ type }: { type: "cashback" | "protection" | "verified" | "vesting" }) => {
  const iconMap = {
    cashback: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="cashback-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="cashback-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="cashback-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.6" floodColor="#1e40af" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="cashback-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#cashback-grad)" opacity="0.2" filter="url(#cashback-glow)" />
        <circle cx="32" cy="28" r="26" fill="url(#cashback-grad)" opacity="0.1" />
        <rect x="16" y="20" width="32" height="24" rx="4" fill="url(#cashback-grad)" stroke="url(#cashback-gold)" strokeWidth="2" filter="url(#cashback-shadow)" />
        <rect x="16" y="20" width="32" height="6" rx="4" fill="url(#cashback-gold)" opacity="0.3" />
        <circle cx="24" cy="32" r="3" fill="#fbbf24" filter="url(#cashback-shadow)" />
        <circle cx="40" cy="32" r="3" fill="#fbbf24" filter="url(#cashback-shadow)" />
        <path d="M 20 28 Q 32 35 44 28" stroke="url(#cashback-gold)" strokeWidth="2" fill="none" strokeLinecap="round" filter="url(#cashback-glow)" />
      </svg>
    ),
    protection: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="protection-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="protection-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="protection-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.6" floodColor="#1e40af" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="protection-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M 32 14 L 20 20 L 20 32 Q 20 45 32 50 Q 44 45 44 32 L 44 20 Z" fill="url(#protection-grad)" opacity="0.2" stroke="url(#protection-gold)" strokeWidth="2" filter="url(#protection-glow)" />
        <path d="M 32 14 L 20 20 L 20 28 Q 20 35 32 38 Q 40 35 40 28 L 40 20 Z" fill="url(#protection-gold)" opacity="0.25" />
        <path d="M 28 32 L 32 36 L 40 26" stroke="url(#protection-gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#protection-glow)" />
      </svg>
    ),
    verified: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="verified-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="verified-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="verified-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.6" floodColor="#1e40af" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="verified-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="18" fill="url(#verified-grad)" opacity="0.2" stroke="url(#verified-gold)" strokeWidth="2" filter="url(#verified-glow)" />
        <circle cx="32" cy="26" r="16" fill="url(#verified-gold)" opacity="0.2" />
        <path d="M 26 32 L 30 36 L 38 28" stroke="url(#verified-gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#verified-glow)" />
      </svg>
    ),
    vesting: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="vesting-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="vesting-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="vesting-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.6" floodColor="#1e40af" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
          <filter id="vesting-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="16" fill="none" stroke="url(#vesting-grad)" strokeWidth="2" opacity="0.4" filter="url(#vesting-glow)" />
        <circle cx="32" cy="32" r="12" fill="url(#vesting-grad)" opacity="0.15" stroke="url(#vesting-gold)" strokeWidth="1.5" filter="url(#vesting-shadow)" />
        <circle cx="32" cy="26" r="10" fill="url(#vesting-gold)" opacity="0.2" />
        <path d="M 32 24 L 32 32 L 38 38" stroke="url(#vesting-gold)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#vesting-glow)" />
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
    color: "from-blue-500 to-blue-600",
    glowColor: "shadow-blue-500/40",
    borderColor: "border-blue-500/50",
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
  const [sloganIdx, setSloganIdx] = useState(0);
  
  const { provider } = useWallet();
  const { stats } = useICO(provider, address);

  // Phase 1 constants
  const PHASE1_SUPPLY = 75000;
  const tokensSold = stats ? parseFloat(stats.totalTokensSold) : 0;
  const progress = Math.min((tokensSold / PHASE1_SUPPLY) * 100, 100);

  useEffect(() => {
    const cycle = setInterval(() => {
      setSloganIdx((i) => (i + 1) % SLOGANS.length);
    }, 3200);
    return () => clearInterval(cycle);
  }, []);

  const contracts = [
    { name: "Token Contract", address: "0x6F539e4232c045cCAc08e2009d97BdC72815472a" },
    { name: "ICO Contract", address: "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16" },
    { name: "Lottery Contract", address: "0x5BC55d4b347e39B986864E28604Ddca5dE6357B7" }
  ];

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.13),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none mix-blend-overlay" />
      <ParticleBackground />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        
        {/* Phase 1 Live Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-12"
        >
          <div className="bg-background/95 backdrop-blur-2xl rounded-[28px] p-6 md:p-8 border border-white/10 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden group">
            {/* Animated background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.3em]">ICO Phase 1 is LIVE</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground flex items-baseline gap-2">
                  $0.15 <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">per OKBOND</span>
                </h2>
              </div>

              <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-2">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span>Polygon Network</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Audited</span>
                  </div>
                </div>
                
                <div className="w-full md:w-64 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary via-yellow-400 to-primary shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  />
                </div>
                <div className="flex justify-between w-full md:w-64 text-[10px] font-black uppercase tracking-tighter mt-1">
                  <span className="text-primary">{tokensSold.toLocaleString()} SOLD</span>
                  <span className="text-muted-foreground">{PHASE1_SUPPLY.toLocaleString()} TOTAL</span>
                </div>
              </div>
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
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-lg h-16 px-12 rounded-full font-black bg-gradient-to-r from-primary via-yellow-400 to-primary text-primary-foreground transition-all duration-300 relative overflow-hidden group"
              style={{
                boxShadow: "0 0 30px rgba(234,179,8,0.5), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(234,179,8,0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Rocket className="w-6 h-6 relative z-10" />
              
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
                whileHover={{ y: -6, boxShadow: `0 0 40px rgba(59,130,246,0.6)` }}
                className={`relative p-6 rounded-2xl backdrop-blur-xl border ${pillar.borderColor} bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden group`}
                style={{
                  boxShadow: `0 0 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <div className={`absolute inset-0 rounded-2xl border ${pillar.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl`} />

                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} mb-4 p-3 group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: `0 8px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <PillarIcon type={pillar.type} />
                </div>

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

    {/* Smart Contract Governance Section */}
    <section className="bg-black text-white py-16 px-4 border-t border-yellow-600/30 relative z-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-black text-primary mb-4 uppercase tracking-[0.2em]"
        >
          Verified Smart Contracts
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          Transparency is our core value. Verify our ecosystem on the Polygon Network.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contracts.map((contract, idx) => (
            <motion.div 
              key={contract.address}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-zinc-900/50 backdrop-blur-xl border border-yellow-700/30 rounded-3xl hover:border-primary/50 transition-all group"
            >
              <h3 className="text-primary font-black mb-4 uppercase tracking-wider">{contract.name}</h3>
              <p className="text-[10px] font-mono text-muted-foreground break-all mb-6 bg-black/40 p-3 rounded-xl border border-white/5">
                {contract.address}
              </p>
              <a 
                href={`https://polygonscan.com/address/${contract.address}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs bg-primary text-primary-foreground px-6 py-3 rounded-full font-black hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                View on PolygonScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Document Links */}
        <div className="mt-20 flex flex-wrap justify-center gap-4">
          <a 
            href="https://drive.google.com/file/d/1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh/view?usp=drivesdk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            Whitepaper
          </a>
          <a 
            href="https://drive.google.com/file/d/1ciuxocfbRbwENLaclrpey50EJMxF_pdr/view?usp=drivesdk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            OKBOND PDF
          </a>
          <a 
            href="https://drive.google.com/file/d/1uvONnEDac-Z06mrth6TT94N9bRGecyhN/view?usp=drivesdk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            Audit Report
          </a>
        </div>
      </div>
    </section>
    </>
  );
}
