import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Globe, Rocket, Building, LayoutGrid, Cpu, Landmark, ShoppingCart, Truck } from "lucide-react";

const GridAnimation = () => (
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    <motion.div 
      animate={{ 
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1),transparent_50%)]" 
    />
  </div>
);

const RoadmapPhase = ({ phase, title, description, period, milestones, isLast, icon: Icon }: any) => {
  return (
    <div className="relative flex flex-col md:flex-row gap-8 mb-16 last:mb-0 group">
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.2 }}
          className="w-12 h-12 rounded-full glass-gold flex items-center justify-center z-10 relative shadow-[0_0_20px_rgba(234,179,8,0.3)] border-primary/40 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all duration-500"
        >
          <Icon className="w-6 h-6 text-primary" />
        </motion.div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 via-primary/20 to-transparent mt-4" />
        )}
      </div>

      {/* Content Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="flex-1 glass-gold p-8 rounded-2xl relative overflow-hidden group-hover:border-primary/60 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="w-24 h-24 text-primary" />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Phase {phase}
          </span>
          <span className="text-primary/80 font-mono text-sm font-semibold">
            {period}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed italic">
          {description}
        </p>

        <ul className="space-y-3">
          {milestones.map((milestone: string, idx: number) => (
            <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>{milestone}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default function Roadmap() {
  const stage1 = [
    {
      phase: "1.1",
      title: "2026 Q2 - Foundation & Transparency",
      description: "Is stage ka maqsad OKBOND ko market mein ek stable aur trustable asset ke taur par establish karna hai.",
      period: "2026 Q2",
      icon: Rocket,
      milestones: [
        "Official OKBOND Launch on Polygon network.",
        "Security Audit & Smart Contract Verification.",
        "Activation of the 60% Liquidity Injection Model for market stability."
      ]
    },
    {
      phase: "1.2",
      title: "2026 Q3 - Utility Expansion",
      description: "Expanding the ecosystem utility and introducing unique participation mechanisms.",
      period: "2026 Q3",
      icon: Zap,
      milestones: [
        "Launch of the Mega Lottery & Staking Dashboard.",
        "Implementation of the Zero-Loss Participation Mechanism (100% Cashback for non-winners via contract)."
      ]
    },
    {
      phase: "1.3",
      title: "2026 Q4 - Global Community",
      description: "Building a robust global presence and integrating with fintech solutions.",
      period: "2026 Q4",
      icon: Globe,
      milestones: [
        "Ambassador programs and fintech integrations.",
        "Growth target: 50,000+ verified community members."
      ]
    },
    {
      phase: "1.4",
      title: "2027 - Market Integration",
      description: "Achieving major exchange listings and ecosystem-wide payment adoption.",
      period: "2027",
      icon: Landmark,
      milestones: [
        "Listing on Tier-1 Centralized Exchanges (CEX).",
        "Integration of OKBOND as a payment standard across Orakzai Group's initial digital services."
      ]
    }
  ];

  const stage2 = [
    {
      phase: "2.1",
      title: "2028 - Infrastructure Deployment (OSG & AI)",
      description: "Ye stage aapke vision ko \"Global Leader\" ke taur par pesh karegi.",
      period: "2028",
      icon: LayoutGrid,
      milestones: [
        "Orakzai Sovereign Grid (OSG): Launching the master blockchain layer and OSG Explorer.",
        "OrakzaiX AI: Deployment of 15 autonomous intelligence models for ecosystem management.",
        "OreC (Real Estate Chain): Transitioning physical stock assets (Pakistan & Global) onto the OSG network."
      ]
    },
    {
      phase: "2.2",
      title: "2029 - The Global Super-Ecosystem",
      description: "Full realization of the Orakzai vision with a multi-sector super-app and global commerce.",
      period: "2029",
      icon: Cpu,
      milestones: [
        "OTC (Transport Chain): Launch of the OrakzaiX-supported Super-App for Ride-hailing, Hotel Booking, and Logistics.",
        "OPC (Properties Chain): Full launch of fractionalized real estate (ownership starting from $1).",
        "Orakzai Mart: Global e-commerce engine with 100k+ products, fully integrated with OTC logistics and OSG payments."
      ]
    }
  ];

  return (
    <section id="roadmap" className="relative py-24 bg-background overflow-hidden">
      <GridAnimation />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6 uppercase">
            Strategic <span className="text-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">Roadmap</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            The professional evolution of the Orakzai Group ecosystem, from OKBOND dominance to a sovereign global grid.
          </p>
        </motion.div>

        {/* Stage 1 */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <h3 className="text-3xl font-bold text-primary px-6 py-2 glass-gold rounded-full">
              Stage 1: The OKBOND Dominance (2026 - 2027)
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          
          <div className="relative">
            {stage1.map((item, idx) => (
              <RoadmapPhase 
                key={idx} 
                {...item} 
                isLast={idx === stage1.length - 1} 
              />
            ))}
          </div>
        </div>

        {/* Stage 2 */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <h3 className="text-3xl font-bold text-primary px-6 py-2 glass-gold rounded-full">
              Stage 2: The Sovereign Grid Expansion (2028 - 2029)
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          
          <div className="relative">
            {stage2.map((item, idx) => (
              <RoadmapPhase 
                key={idx} 
                {...item} 
                isLast={idx === stage2.length - 1} 
              />
            ))}
          </div>
        </div>

        {/* Bottom Call to Action or Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-block glass-gold p-6 rounded-2xl border-primary/20">
            <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Sovereign Grid Status</p>
            <p className="text-foreground/60 text-xs">All phases are subject to strategic optimization for maximum ecosystem value.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
