import { motion } from "framer-motion";
import { Shield, Zap, Globe, MapPin } from "lucide-react";

const features = [
  { icon: Shield, title: "Decentralized Security",
    description: "Built on immutable blockchain technology. No central authority controls your assets — your keys, your wealth." },
  { icon: Zap, title: "Staking & Yield",
    description: "Lock your OKBOND tokens in high-yield staking pools and earn passive income. Power your portfolio while you sleep." },
  { icon: Globe, title: "Global Investment Pools",
    description: "Participate in community-governed investment pools spanning global markets, open to anyone, anywhere." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" as any } }),
};

// World map dots: [cx%, cy%, label, isHQ]
const LOCATIONS: [number, number, string, boolean][] = [
  [58.5, 41,   "Karachi — Global HQ", true],
  [47.5, 28,   "London",              false],
  [24,   33,   "New York",            false],
  [55.5, 40,   "Dubai",               false],
  [68,   54,   "Singapore",           false],
  [77,   32,   "Tokyo",               false],
  [79,   68,   "Sydney",              false],
  [48,   45,   "Frankfurt",           false],
  [34,   60,   "Toronto",             false],
  [50,   57,   "Moscow",              false],
  [62,   29,   "New Delhi",           false],
  [40,   55,   "Istanbul",            false],
];

// Simplified continent SVG paths (Mercator-like, 0-100 viewBox)
const CONTINENTS = [
  // North America
  "M 14 22 L 28 18 L 36 22 L 38 30 L 34 40 L 26 44 L 18 42 L 12 36 L 10 28 Z",
  // South America
  "M 24 46 L 32 44 L 36 52 L 34 64 L 28 72 L 22 68 L 18 58 L 20 50 Z",
  // Europe
  "M 44 20 L 56 18 L 58 24 L 54 30 L 48 32 L 42 28 L 42 22 Z",
  // Africa
  "M 44 32 L 56 30 L 60 38 L 58 52 L 54 62 L 48 64 L 42 58 L 40 46 L 42 36 Z",
  // Asia
  "M 56 18 L 82 16 L 84 24 L 80 32 L 72 38 L 64 40 L 58 36 L 54 28 L 56 20 Z",
  // Australia
  "M 72 60 L 84 58 L 86 66 L 80 70 L 72 68 L 70 62 Z",
  // Greenland
  "M 30 8 L 42 6 L 44 14 L 36 16 L 28 14 Z",
];

export default function About() {
  return (
    <section id="about" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,179,8,0.07),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }} className="text-center mb-16">
          <span className="inline-block mb-3 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            About OKBOND
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5 leading-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              Orakzai Global Network
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
            Orakzai Bond is a decentralized financial platform engineered for staking, investment pools, and token utilities — empowering global investors with blockchain-based opportunities.
          </p>
        </motion.div>

        {/* ── WORLD MAP ────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-3xl border border-primary/20 bg-black/60 backdrop-blur overflow-hidden mb-20 p-4"
          style={{ minHeight: 340 }}>
          {/* Glow from Karachi */}
          <div className="absolute" style={{ left: "58.5%", top: "41%", transform: "translate(-50%,-50%)", width: 260, height: 260,
            background: "radial-gradient(circle, rgba(234,179,8,0.18) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(8px)", pointerEvents: "none" }} />

          <svg viewBox="0 0 100 80" className="w-full" style={{ maxHeight: 400 }}>
            {/* Grid lines */}
            {[20, 40, 60].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />
            ))}
            {[25, 50, 75].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />
            ))}

            {/* Continents */}
            {CONTINENTS.map((d, i) => (
              <path key={i} d={d} fill="rgba(234,179,8,0.07)" stroke="rgba(234,179,8,0.18)" strokeWidth="0.4" />
            ))}

            {/* Connection lines from Karachi to other dots */}
            {LOCATIONS.filter(l => !l[3]).map(([cx, cy], i) => (
              <motion.line key={i}
                x1={58.5} y1={41} x2={cx} y2={cy}
                stroke="rgba(234,179,8,0.18)" strokeWidth="0.25" strokeDasharray="1 1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 + i * 0.1 }}
              />
            ))}

            {/* Location dots */}
            {LOCATIONS.map(([cx, cy, label, isHQ], i) => (
              <g key={label}>
                {/* Pulse ring (HQ only) — use scale so SVG r stays fixed */}
                {isHQ && (
                  <motion.circle cx={cx} cy={cy} r={4}
                    fill="none" stroke="rgba(234,179,8,0.5)" strokeWidth="0.4"
                    style={{ originX: `${cx}px`, originY: `${cy}px` }}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                )}
                {/* Dot */}
                <motion.circle
                  cx={cx} cy={cy}
                  r={isHQ ? 1.4 : 0.85}
                  fill={isHQ ? "hsl(43,96%,56%)" : "rgba(234,179,8,0.7)"}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  style={{ filter: isHQ ? "drop-shadow(0 0 2px rgba(234,179,8,0.9))" : "drop-shadow(0 0 1px rgba(234,179,8,0.5))" }}
                />
                {/* Label */}
                <motion.text
                  x={cx} y={cy - (isHQ ? 2.2 : 1.8)}
                  textAnchor="middle"
                  fontSize={isHQ ? "2.2" : "1.6"}
                  fill={isHQ ? "hsl(43,96%,56%)" : "rgba(234,179,8,0.7)"}
                  fontFamily="monospace"
                  fontWeight={isHQ ? "bold" : "normal"}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  {isHQ ? "★ " : ""}{label}
                </motion.text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
              <span className="text-primary font-mono font-bold">Global HQ — Karachi, PK</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/60" />
              <span className="text-muted-foreground font-mono">Project Presence</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary/50" />
              <span className="text-muted-foreground font-mono">250+ Worldwide Projects</span>
            </div>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Founder bio + mission/vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-primary/20 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">The Founder</h3>
            </div>
            <p className="text-primary font-semibold mb-3 text-sm uppercase tracking-wide">
              Faisal Orakzai
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              A Global Visionary and Architect of the Orakzai Group — Faisal Orakzai has built a multi-industry conglomerate from the ground up in Karachi, Pakistan, expanding its reach to international blockchain innovation. His journey reflects the leap from local leadership to building a decentralized global ecosystem designed for the next generation.
            </p>
            <a href="/founder"
              className="inline-flex items-center gap-2 mt-5 text-sm text-primary font-semibold hover:underline">
              Read Full Story →
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become a leading Web3 financial ecosystem — where OKBOND is the currency of power, and every holder is a sovereign participant in a future built on trust, transparency, and unstoppable code.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
