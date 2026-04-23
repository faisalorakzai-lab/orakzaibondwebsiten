import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// Premium 3D SVG Icons for each phase
const PhaseIcon = ({ type }: { type: "rocket" | "building" | "chart" | "globe" }) => {
  const iconMap = {
    rocket: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="rocket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="rocket-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="rocket-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Rocket body */}
        <path d="M 32 8 L 28 24 L 36 24 Z" fill="url(#rocket-grad)" filter="url(#rocket-glow)" />
        <rect x="26" y="24" width="12" height="24" rx="2" fill="url(#rocket-blue)" stroke="url(#rocket-grad)" strokeWidth="1.5" filter="url(#rocket-glow)" />
        {/* Windows */}
        <circle cx="32" cy="28" r="2" fill="#fbbf24" />
        <circle cx="32" cy="34" r="2" fill="#fbbf24" />
        {/* Fins */}
        <path d="M 26 40 L 20 48 L 24 40 Z" fill="url(#rocket-grad)" filter="url(#rocket-glow)" />
        <path d="M 38 40 L 44 48 L 40 40 Z" fill="url(#rocket-grad)" filter="url(#rocket-glow)" />
        {/* Flame */}
        <path d="M 28 48 Q 32 56 36 48" fill="url(#rocket-grad)" opacity="0.6" filter="url(#rocket-glow)" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="building-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="building-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="building-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Main building */}
        <rect x="18" y="16" width="28" height="36" rx="2" fill="url(#building-blue)" stroke="url(#building-grad)" strokeWidth="2" filter="url(#building-glow)" />
        {/* Windows grid */}
        <rect x="22" y="20" width="4" height="4" fill="#fbbf24" />
        <rect x="30" y="20" width="4" height="4" fill="#fbbf24" />
        <rect x="38" y="20" width="4" height="4" fill="#fbbf24" />
        <rect x="22" y="28" width="4" height="4" fill="#fbbf24" />
        <rect x="30" y="28" width="4" height="4" fill="#fbbf24" />
        <rect x="38" y="28" width="4" height="4" fill="#fbbf24" />
        <rect x="22" y="36" width="4" height="4" fill="#fbbf24" />
        <rect x="30" y="36" width="4" height="4" fill="#fbbf24" />
        <rect x="38" y="36" width="4" height="4" fill="#fbbf24" />
        {/* Roof */}
        <path d="M 18 16 L 32 8 L 46 16" fill="url(#building-grad)" stroke="url(#building-grad)" strokeWidth="1.5" filter="url(#building-glow)" />
        {/* Door */}
        <rect x="29" y="44" width="6" height="8" fill="url(#building-grad)" stroke="#fbbf24" strokeWidth="1" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="chart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="chart-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="chart-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Bars */}
        <rect x="16" y="36" width="6" height="16" fill="url(#chart-blue)" stroke="url(#chart-grad)" strokeWidth="1.5" filter="url(#chart-glow)" />
        <rect x="26" y="24" width="6" height="28" fill="url(#chart-grad)" stroke="url(#chart-grad)" strokeWidth="1.5" filter="url(#chart-glow)" />
        <rect x="36" y="12" width="6" height="40" fill="url(#chart-blue)" stroke="url(#chart-grad)" strokeWidth="1.5" filter="url(#chart-glow)" />
        <rect x="46" y="28" width="6" height="24" fill="url(#chart-grad)" stroke="url(#chart-grad)" strokeWidth="1.5" filter="url(#chart-glow)" />
        {/* Axis */}
        <line x1="14" y1="52" x2="54" y2="52" stroke="url(#chart-grad)" strokeWidth="2" filter="url(#chart-glow)" />
        <line x1="14" y1="8" x2="14" y2="52" stroke="url(#chart-grad)" strokeWidth="2" filter="url(#chart-glow)" />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="globe-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="globe-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Globe sphere */}
        <circle cx="32" cy="32" r="18" fill="url(#globe-blue)" opacity="0.3" stroke="url(#globe-grad)" strokeWidth="2" filter="url(#globe-glow)" />
        {/* Continents */}
        <path d="M 20 28 Q 24 24 28 26" stroke="url(#globe-grad)" strokeWidth="2" fill="none" filter="url(#globe-glow)" />
        <path d="M 36 20 Q 40 22 42 28" stroke="url(#globe-grad)" strokeWidth="2" fill="none" filter="url(#globe-glow)" />
        <path d="M 24 38 Q 28 40 32 38" stroke="url(#globe-grad)" strokeWidth="2" fill="none" filter="url(#globe-glow)" />
        {/* Latitude lines */}
        <ellipse cx="32" cy="32" rx="18" ry="6" fill="none" stroke="url(#globe-grad)" strokeWidth="1" opacity="0.5" filter="url(#globe-glow)" />
        {/* Stand */}
        <rect x="30" y="50" width="4" height="8" fill="url(#globe-grad)" stroke="url(#globe-grad)" strokeWidth="1" filter="url(#globe-glow)" />
      </svg>
    ),
  };
  return iconMap[type];
};

const PHASES = [
  {
    phase: 1,
    title: "Foundation & Launch",
    period: "April 2026",
    color: "from-yellow-500 to-orange-600",
    glowColor: "shadow-yellow-500/40",
    borderColor: "border-yellow-500/50",
    icon: "rocket" as const,
    milestones: [
      "Official Orakzai Bond (OKBOND) Launch on Polygon",
      "Smart Contract Audit & Security Report Publication",
      "Community Milestone: 31,000+ Verified Members",
      "Launch of the ICO Phase 1 with Capital Protection",
    ],
  },
  {
    phase: 2,
    title: "Ecosystem Integration",
    period: "May - Dec 2026",
    color: "from-blue-500 to-cyan-600",
    glowColor: "shadow-blue-500/40",
    borderColor: "border-blue-500/50",
    icon: "building" as const,
    milestones: [
      "Integration of the first 50+ Real Estate & Fintech projects",
      "Launch of the Mega Lottery & Staking Rewards Dashboard",
      "Strategic Partnerships with regional infrastructure developers",
    ],
  },
  {
    phase: 3,
    title: "Scaling & Innovation",
    period: "2027",
    color: "from-purple-500 to-pink-600",
    glowColor: "shadow-purple-500/40",
    borderColor: "border-purple-500/50",
    icon: "chart" as const,
    milestones: [
      "Expanding the ecosystem to 150+ projects",
      "Introduction of AI-driven investment analytics for OKBOND holders",
      "Expansion into global Web3 markets",
    ],
  },
  {
    phase: 4,
    title: "The 250+ Project Vision",
    period: "2028 & Beyond",
    color: "from-emerald-500 to-teal-600",
    glowColor: "shadow-emerald-500/40",
    borderColor: "border-emerald-500/50",
    icon: "globe" as const,
    milestones: [
      "Completion of the 250+ Integrated Project Ecosystem",
      "Full decentralization and governance transition",
      "Establishing Orakzai Group as a global leader in Blockchain-backed Real Estate",
    ],
  },
];

export default function Roadmap() {
  return (
    <section className="relative min-h-screen py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Our Journey
          </span>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[0.85]">
            Orakzai Bond<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary drop-shadow-[0_0_50px_rgba(234,179,8,0.7)]">
              Roadmap 2026+
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From foundation to global leadership — witness the evolution of blockchain-backed real estate innovation
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Glowing vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-blue-500 to-primary transform -translate-x-1/2 hidden lg:block">
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-primary via-blue-500 to-primary blur-md opacity-50"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Timeline items */}
          <div className="space-y-12 lg:space-y-16">
            {PHASES.map((phase, idx) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-stretch`}
              >
                {/* Content card */}
                <div className="flex-1 flex flex-col">
                  <motion.div
                    whileHover={{ y: -8, boxShadow: `0 0 40px ${phase.glowColor}` }}
                    className={`relative p-8 rounded-3xl backdrop-blur-xl border ${phase.borderColor} bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden group h-full flex flex-col`}
                    style={{
                      boxShadow: `0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    {/* Animated neon border glow */}
                    <div className={`absolute inset-0 rounded-3xl border ${phase.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-3xl`} />

                    {/* Phase number and period */}
                    <div className="relative z-10 mb-4 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${phase.color} text-white text-xs font-black uppercase tracking-wider`}>
                        Phase {phase.phase}
                      </span>
                      <span className="text-xs font-mono text-primary font-bold">{phase.period}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-black text-foreground mb-6 relative z-10 leading-tight">
                      {phase.title}
                    </h3>

                    {/* Milestones */}
                    <ul className="space-y-3 relative z-10 flex-1">
                      {phase.milestones.map((milestone, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.15 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground leading-relaxed">{milestone}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Timeline dot and icon */}
                <div className="flex flex-col items-center justify-start lg:justify-center flex-shrink-0 hidden lg:flex">
                  {/* Animated milestone dot */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0 0 rgba(234,179,8,0.4)", "0 0 0 12px rgba(234,179,8,0)", "0 0 0 0 rgba(234,179,8,0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${phase.color} border-4 border-background relative z-20 flex items-center justify-center`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>

                  {/* Icon container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 + 0.1 }}
                    className={`mt-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${phase.color} p-4 relative group cursor-pointer`}
                    style={{
                      boxShadow: `0 8px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-full h-full"
                    >
                      <PhaseIcon type={phase.icon} />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground text-lg mb-6">
            Join us on this transformative journey. Be part of the 250+ project ecosystem.
          </p>
          <motion.a
            href="/ico"
            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-3 text-lg h-16 px-12 rounded-full font-black bg-gradient-to-r from-primary via-yellow-400 to-primary text-primary-foreground transition-all duration-300 relative overflow-hidden group"
            style={{
              boxShadow: "0 0 30px rgba(234,179,8,0.5), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(234,179,8,0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">Join the Ecosystem</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
