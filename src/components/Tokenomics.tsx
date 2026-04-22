import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, TrendingUp, ArrowLeft, Zap, Shield, Repeat, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const TOKENOMICS_DATA = [
  {
    name: "Public Sale (ICO)",
    value: 40,
    amount: "4,000,000",
    color: "#eab308",
    description: "Available for public purchase during ICO phases",
  },
  {
    name: "Staking Rewards",
    value: 20,
    amount: "2,000,000",
    color: "#f59e0b",
    description: "Distributed to active stakers and liquidity providers",
  },
  {
    name: "Ecosystem & 250+ Projects",
    value: 20,
    amount: "2,000,000",
    color: "#3b82f6",
    description: "Allocated for ecosystem development and partner projects",
  },
  {
    name: "Marketing & Community",
    value: 10,
    amount: "1,000,000",
    color: "#10b981",
    description: "Used for marketing initiatives and community engagement",
  },
  {
    name: "Team & Development",
    value: 10,
    amount: "1,000,000",
    color: "#8b5cf6",
    description: "Reserved for core team with 60-day security lock-up",
  },
];

const UTILITY_DRIVERS = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Limited Supply, Massive Ecosystem",
    description: "With only 10 Million tokens and 250+ upcoming projects using OKBOND, the scarcity will drive long-term value.",
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
    description: "With only 10M total supply and 40% in public sale, OKBOND maintains extreme scarcity. This proven mechanism ensures sustained demand and price appreciation.",
  },
  {
    icon: "🔒",
    title: "Security Lock-up",
    description: "Team and development tokens are locked for 60 days via smart contract, preventing sudden market flooding and ensuring long-term commitment.",
  },
  {
    icon: "💰",
    title: "Investor Protection",
    description: "60% of tokens are allocated to public sale, staking, and ecosystem growth, ensuring fair distribution and reducing concentration risk.",
  },
  {
    icon: "🌱",
    title: "Sustainable Growth",
    description: "20% dedicated to ecosystem and 250+ projects ensures continuous development and real-world utility for token holders.",
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
            Token Distribution
          </span>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[0.85]">
            OKBOND<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary drop-shadow-[0_0_50px_rgba(234,179,8,0.7)]">
              Tokenomics
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 Million fixed supply. Fair distribution. Engineered for scarcity and sustainable value growth.
          </p>
        </motion.div>

        {/* Chart and Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Premium Donut Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 flex items-center justify-center overflow-hidden group"
            style={{
              boxShadow: "0 0 40px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(234,179,8,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Chart container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={TOKENOMICS_DATA.map((item, index) => ({
                      ...item,
                      index,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={150}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
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
                              ? `drop-shadow(0 0 20px ${entry.color})`
                              : "none",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                    formatter={(value, entry) => (
                      <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {entry.payload.name}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center text for donut */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-mono">Total Supply</p>
                <p className="text-3xl font-black text-primary">10M</p>
                <p className="text-xs text-muted-foreground mt-1">OKBOND</p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown List */}
          <div className="space-y-4">
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
                  className="relative p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 overflow-hidden cursor-pointer"
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
                  {/* Animated neon border glow */}
                  <div
                    className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                    style={{ borderColor: item.color }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{
                            scale: activeIndex === idx ? 1.2 : 1,
                          }}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <h4 className="font-black text-foreground">
                          {item.name}
                        </h4>
                      </div>
                      <motion.span
                        animate={{
                          scale: activeIndex === idx ? 1.1 : 1,
                        }}
                        className="text-lg font-black"
                        style={{ color: item.color }}
                      >
                        {item.value}%
                      </motion.span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.amount} OKBOND
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {item.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="relative z-10 mt-4 h-2 rounded-full bg-muted/30 overflow-hidden">
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
                  whileHover={{ y: -8, boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}
                  className="relative p-8 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden h-full"
                  style={{
                    boxShadow: "0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
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
          className="relative p-12 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden mb-20"
          style={{
            boxShadow: "0 0 40px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Animated neon border glow */}
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
                  With only 40% of OKBOND available in the public sale and a fixed total supply of 10 million tokens, scarcity becomes the primary mechanism for price appreciation. This proven economic principle ensures that early investors benefit from sustained demand and limited supply. The remaining 60% is strategically allocated to staking rewards, ecosystem development, and team incentives — all designed to create long-term value for token holders.
                </p>
                <p className="text-primary font-semibold">
                  ✓ Fixed supply ensures no inflation
                  <br />✓ 60-day security lock-up prevents market flooding
                  <br />✓ 60% allocation to growth and rewards
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
                  whileHover={{ y: -8, boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}
                  className="relative p-8 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden h-full"
                  style={{
                    boxShadow: "0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Animated neon border glow */}
                  <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                  {/* Icon */}
                  <div className="relative z-10 text-5xl mb-4">
                    {point.icon}
                  </div>

                  {/* Content */}
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
