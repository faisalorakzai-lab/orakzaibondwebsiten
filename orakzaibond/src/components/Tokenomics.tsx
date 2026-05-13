import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, TrendingUp, ArrowLeft, Zap, Shield, Repeat, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

// Midnight Gold — full 24K gold family palette (no blue/cyan/pink)
const TOKENOMICS_DATA = [
  {
    name: "Staking Rewards",
    value: 28,
    amount: "2,800,000",
    color: "#FCF6BA",
    description: "Long-term staking incentives · APY ecosystem · Holder retention",
  },
  {
    name: "Community & Ecosystem",
    value: 20,
    amount: "2,000,000",
    color: "#F5C518",
    description: "Ambassador program · Partnerships · Airdrops & campaigns",
  },
  {
    name: "Liquidity Reserves",
    value: 20,
    amount: "2,000,000",
    color: "#D4A017",
    description: "DEX liquidity · CEX preparation · Market depth & stability",
  },
  {
    name: "Development Fund",
    value: 12,
    amount: "1,200,000",
    color: "#BF953F",
    description: "AI infrastructure · Smart contracts · Security audits",
  },
  {
    name: "Team & Advisors",
    value: 10,
    amount: "1,000,000",
    color: "#B38728",
    description: "1 Year Cliff · 2 Year Vesting · Long-term alignment",
  },
  {
    name: "Public Sale (ICO)",
    value: 10,
    amount: "1,000,000",
    color: "#AA771C",
    description: "Round 1 $0.50 · Round 2 $0.70 · Round 3 $1.00",
  },
];

const UTILITY_DRIVERS = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Limited Supply, Massive Ecosystem",
    description: "With only 10 Million tokens and Global Sovereign Infrastructure using OKBOND, the scarcity will drive long-term value.",
  },
  {
    icon: <Repeat className="w-6 h-6" />,
    title: "Buy-Back & Burn Mechanism",
    description: "A portion of profits from the Orakzai Group’s integrated projects will be used to buy back and stabilize the token value.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "High-Utility Staking",
    description: "Holding OKBOND gives exclusive access to the Mega Lottery, Staking Rewards, and priority investment in Orakzai Properties.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Capital Protection",
    description: "Unlike other volatile coins, OKBOND is backed by a Capital-Retention Model, making it a safer haven for long-term holders.",
  },
];

const TRANSPARENCY_POINTS = [
  {
    icon: "📉",
    title: "Scarcity Drives Value",
    description: "With only 10M total supply and exclusive public allocation, OKBOND maintains extreme scarcity for sustained demand.",
  },
  {
    icon: "🔒",
    title: "12-Month Team Lock-up",
    description: "A significant portion of team tokens is locked for 12 months via smart contract, ensuring zero market flooding.",
  },
  {
    icon: "💰",
    title: "Liquidity Assurance",
    description: "20% of tokens are dedicated to the Liquidity Pool, providing a stable foundation for all traders and investors.",
  },
  {
    icon: "🌱",
    title: "Sustainable Growth",
    description: "20% dedicated to community and ecosystem ensures continuous development and real-world utility.",
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background/95 backdrop-blur-xl border border-primary/30 rounded-lg p-4 shadow-lg"
      >
        <p className="font-bold text-foreground">{payload[0].name}</p>
        <p className="text-sm text-primary font-mono">{payload[0].value}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {TOKENOMICS_DATA[payload[0].payload.index]?.amount} OKBOND
        </p>
      </motion.div>
    );
  }
  return null;
};

export default function Tokenomics() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <section className="relative min-h-screen py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Exit Button */}
        <div className="mb-12">
          <Link href="/">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.span>
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            Strategic Allocation Model · Whitepaper
          </span>
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[0.95] font-heading" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            OKBOND<br />
            <span className="heading-midnight-gold drop-shadow-[0_0_50px_rgba(245,197,24,0.55)]">
              Tokenomics
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 Million fixed supply. Allocations reflect the whitepaper distribution model — live on-chain balances are available in the Ecosystem Metrics section.
          </p>
        </motion.div>

        {/* Chart and Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Premium Donut Chart — compact on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-5 sm:p-8 rounded-3xl glass-card-gold flex items-center justify-center overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(234,179,8,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={TOKENOMICS_DATA.map((item, index) => ({
                      ...item,
                      index,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={900}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {TOKENOMICS_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                        style={{
                          filter:
                            activeIndex === index
                              ? `drop-shadow(0 0 14px ${entry.color})`
                              : "none",
                          transition: "all 0.25s ease",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center" style={{ marginTop: "-20px" }}>
                <p className="text-xs text-muted-foreground font-mono">Total Supply</p>
                <p className="text-2xl font-black text-primary">10M</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">OKBOND</p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown List — stacked allocation cards */}
          <div className="space-y-2.5">
            {TOKENOMICS_DATA.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={() => handleMouseLeave()}
              >
                <motion.div
                  whileHover={{ x: 8 }}
                  className="relative p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 overflow-hidden cursor-pointer"
                  style={{
                    borderColor: activeIndex === null || activeIndex === idx ? item.color + "50" : item.color + "20",
                    background:
                      activeIndex === null || activeIndex === idx
                        ? `linear-gradient(135deg, ${item.color}08 0%, ${item.color}04 100%)`
                        : `linear-gradient(135deg, ${item.color}04 0%, ${item.color}02 100%)`,
                    boxShadow:
                      activeIndex === null || activeIndex === idx
                        ? `0 0 20px ${item.color}15, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : `0 0 10px ${item.color}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                    style={{ borderColor: item.color }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{
                            scale: activeIndex === idx ? 1.2 : 1,
                          }}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <h4 className="font-black text-foreground text-sm">
                          {item.name}
                        </h4>
                      </div>
                      <motion.span
                        animate={{
                          scale: activeIndex === idx ? 1.1 : 1,
                        }}
                        className="text-base font-black"
                        style={{ color: item.color }}
                      >
                        {item.value}%
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {item.amount} OKBOND
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-3 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Token Utility & Demand Drivers Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Token Utility & Demand Drivers
            </h3>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              OKBOND is engineered to be more than just a token; it's the fuel for a massive, multi-industry ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {UTILITY_DRIVERS.map((driver, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 0 40px rgba(245,197,24,0.4)" }}
                  className="relative p-8 rounded-3xl glass-card-gold transition-all duration-300 overflow-hidden h-full"
                >
                  <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  
                  <div className="relative z-10 mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                    {driver.icon}
                  </div>

                  <h4 className="relative z-10 text-xl font-black text-foreground mb-3">
                    {driver.title}
                  </h4>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                    {driver.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transparency Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-3xl glass-card-gold overflow-hidden mb-20"
          style={{
            boxShadow: "0 0 40px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-20 blur-sm" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground mb-3">
                  Transparency Note: Scarcity as a Value Driver
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  With a fixed total supply of 10 million tokens and strategic lock-ups, scarcity is the primary mechanism for value preservation. This proven economic principle ensures that early believers benefit from limited supply. The majority of tokens are strategically allocated to staking, ecosystem growth, and liquidity — all designed for sustainable long-term value.
                </p>
                <p className="text-primary font-semibold">
                  ✓ Fixed supply ensures zero inflation
                  <br />✓ 12-month Team Lock-up prevents market flooding
                  <br />✓ 20% Liquidity Pool for market stability
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transparency Points Grid */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-foreground mb-12 text-center"
          >
            Why OKBOND Tokenomics Matter
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TRANSPARENCY_POINTS.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 0 40px rgba(245,197,24,0.4)" }}
                  className="relative p-8 rounded-3xl glass-card-gold transition-all duration-300 overflow-hidden h-full"
                >
                  <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                  <div className="relative z-10 text-5xl mb-4">
                    {point.icon}
                  </div>

                  <h4 className="relative z-10 text-xl font-black text-foreground mb-3">
                    {point.title}
                  </h4>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-muted-foreground text-lg mb-6">
            Secure your position in the OKBOND ecosystem today.
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
            <span className="relative z-10">Join the ICO</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
