/**
 * OKBOND Strategic Roadmap
 * Design: Identical to FounderPage cinematic timeline — same constants,
 * same scroll-driven line, same alternating layout, same goldTextStyle.
 * Chairman's Directive: Deep Black + Brushed Gold. No white. No grey borders.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ── Design tokens — exact mirror of FounderPage ─────────────────────────── */
const GOLD_GRADIENT =
  "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)";
const MIDNIGHT = "#05060A";

function goldTextStyle(): React.CSSProperties {
  return {
    background: GOLD_GRADIENT,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

function chapterLabelStyle(): React.CSSProperties {
  return {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: "rgba(191,149,63,0.75)",
  };
}

function headingStyle(): React.CSSProperties {
  return {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.015em",
    color: "#f3ecd1",
  };
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const PHASE_DATA = [
  {
    phase: "2026 Q2",
    stage: "I",
    title: "Foundation & Transparency",
    body: "Establishing OKBOND as a stable, audited, and trustworthy sovereign digital asset on Polygon Mainnet — the bedrock on which the entire ecosystem is built.",
    milestones: [
      "Official OKBOND Launch on Polygon Network",
      "Security Audit & Smart Contract Verification",
      "60% Liquidity Injection Model — market stability activated",
    ],
  },
  {
    phase: "2026 Q3",
    stage: "I",
    title: "Utility Expansion",
    body: "Expanding the ecosystem's utility with unique participation mechanics that protect every investor's capital absolutely.",
    milestones: [
      "Mega Lottery & Staking Dashboard launch",
      "Zero-Loss Participation Mechanism — 100% cashback for non-winners via smart contract",
    ],
  },
  {
    phase: "2026 Q4",
    stage: "I",
    title: "Global Community",
    body: "Building a robust global presence and integrating with the broader fintech landscape — 50,000 verified members as the minimum threshold.",
    milestones: [
      "Global Ambassador Program activation",
      "Fintech integration partnerships",
      "Growth target: 50,000+ verified community members",
    ],
  },
  {
    phase: "2027",
    stage: "I",
    title: "Market Integration",
    body: "Achieving Tier-1 exchange listings and establishing OKBOND as the payment standard across Orakzai Group's digital services.",
    milestones: [
      "Listing on Tier-1 Centralized Exchanges (CEX)",
      "OKBOND integrated as payment standard across Orakzai Group's digital services",
    ],
  },
  {
    phase: "2028",
    stage: "II",
    title: "Infrastructure Deployment — OSG & AI",
    body: "The Orakzai Group transitions from a financial asset to a global sovereign infrastructure provider — deploying its proprietary blockchain layer and autonomous intelligence.",
    milestones: [
      "Orakzai Sovereign Grid (OSG): Master blockchain layer + OSG Explorer launched",
      "OrakzaiX AI: 15 autonomous intelligence models deployed for ecosystem governance",
      "OreC (Real Estate Chain): Physical stock assets (Pakistan & Global) migrated to OSG",
    ],
  },
  {
    phase: "2029",
    stage: "II",
    title: "The Global Super-Ecosystem",
    body: "Full realization of the Orakzai vision — a self-sustaining, multi-sector sovereign super-app operating across transport, property, and commerce at global scale.",
    milestones: [
      "OTC (Transport Chain): Super-App — Ride-hailing, Hotel Booking, Logistics on OrakzaiX",
      "OPC (Properties Chain): Fractionalized real estate ownership from $1",
      "Orakzai Mart: Global e-commerce — 100k+ products, OSG payments, OTC logistics",
    ],
  },
];

/* ── Scroll-driven animated timeline line ────────────────────────────────── */
function AnimatedTimelineLine({ itemCount }: { itemCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const glowTop    = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="absolute left-6 top-0 bottom-0 md:left-1/2 md:-translate-x-1/2 w-px" aria-hidden="true">
      {/* Static rail */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(191,149,63,0.18) 8%, rgba(191,149,63,0.18) 92%, transparent 100%)" }}
      />
      {/* Scroll-driven gold fill */}
      <motion.div className="absolute left-0 top-0 w-[2px]"
        style={{
          height: lineHeight,
          background: "linear-gradient(180deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)",
          boxShadow: "0 0 8px rgba(252,246,186,0.55), 0 0 22px rgba(191,149,63,0.35)",
        }}
      />
      {/* Travelling glow */}
      <motion.div className="absolute left-0 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          top: glowTop,
          opacity: glowOpacity,
          background: "radial-gradient(circle, rgba(252,246,186,0.55) 0%, rgba(191,149,63,0.25) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}

/* ── Stage divider ───────────────────────────────────────────────────────── */
function StageBanner({ stage, label, years }: { stage: string; label: string; years: string }) {
  return (
    <div className="relative flex items-center justify-center my-12 md:my-16">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(191,149,63,0.25))" }} />
      <div className="mx-6 px-6 py-2.5 rounded-full relative"
        style={{
          background: "linear-gradient(135deg, rgba(20,18,12,0.82) 0%, rgba(10,9,6,0.95) 100%)",
          border: "1px solid rgba(191,149,63,0.4)",
          boxShadow: "0 0 24px rgba(191,149,63,0.12), 0 0 48px rgba(191,149,63,0.06)",
          backdropFilter: "blur(16px)",
        }}>
        <p style={chapterLabelStyle()}>Stage {stage} · {years}</p>
        <p className="text-center text-sm mt-0.5"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", ...goldTextStyle() }}>
          {label}
        </p>
      </div>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(191,149,63,0.25), transparent)" }} />
    </div>
  );
}

/* ── Gold dot marker on timeline ─────────────────────────────────────────── */
function TimelineDot() {
  return (
    <span className="absolute left-6 top-3 z-20 flex h-5 w-5 -translate-x-1/2 items-center justify-center md:left-1/2">
      <span className="absolute inset-0 rounded-full"
        style={{
          background: GOLD_GRADIENT,
          boxShadow: `0 0 0 4px ${MIDNIGHT}, 0 0 0 5px rgba(191,149,63,0.45), 0 0 22px rgba(252,246,186,0.55)`,
        }}
      />
      <span className="relative h-2 w-2 rounded-full"
        style={{ background: MIDNIGHT, boxShadow: "inset 0 0 4px rgba(252,246,186,0.4)" }}
      />
    </span>
  );
}

/* ── Single phase card ───────────────────────────────────────────────────── */
function PhaseItem({ item, index }: { item: typeof PHASE_DATA[number]; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.li
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 items-start gap-8 md:grid-cols-2"
    >
      <TimelineDot />

      {/* Phase label — year/quarter in large gold gradient text */}
      <div className={`pl-16 md:pl-0 ${isLeft ? "md:pr-16 md:text-right" : "md:order-2 md:pl-16"}`}>
        <span className="inline-block text-4xl md:text-5xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 500,
            lineHeight: 1,
            ...goldTextStyle(),
            letterSpacing: "-0.02em",
          }}>
          {item.phase}
        </span>
        <h3 className="mt-3 text-xl md:text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#f3ecd1" }}>
          {item.title}
        </h3>
      </div>

      {/* Content card */}
      <div className={`pl-16 md:pl-0 ${isLeft ? "md:order-2 md:pl-16" : "md:pr-16 md:text-left"}`}>
        <div className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(15,13,8,0.75) 0%, rgba(8,7,4,0.92) 100%)",
            border: "1px solid rgba(191,149,63,0.18)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(191,149,63,0.06) inset",
            backdropFilter: "blur(18px)",
          }}>
          <p className="text-sm leading-relaxed mb-5"
            style={{ color: "rgba(201,194,169,0.7)", fontStyle: "italic" }}>
            {item.body}
          </p>
          <ul className="space-y-3">
            {item.milestones.map((m, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: isLeft ? 12 : -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="flex items-start gap-3 text-sm"
                style={{ color: "rgba(228,218,190,0.85)" }}>
                {/* Gold diamond bullet */}
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-sm rotate-45"
                  style={{ background: GOLD_GRADIENT, boxShadow: "0 0 6px rgba(252,246,186,0.35)" }}
                />
                {m}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.li>
  );
}

/* ── Closing sovereign status plate ─────────────────────────────────────── */
function SovereignPlate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
      className="mt-24 flex justify-center">
      <div className="px-8 py-5 rounded-2xl text-center"
        style={{
          background: "linear-gradient(135deg, rgba(20,18,12,0.85) 0%, rgba(10,9,6,0.96) 100%)",
          border: "1px solid rgba(191,149,63,0.3)",
          boxShadow: "0 0 32px rgba(191,149,63,0.1), 0 0 64px rgba(191,149,63,0.05)",
          backdropFilter: "blur(20px)",
        }}>
        <p style={{ ...chapterLabelStyle(), color: "rgba(191,149,63,0.6)" }}>Sovereign Grid Status</p>
        <p className="mt-2 text-sm" style={{ color: "rgba(201,194,169,0.55)", fontStyle: "italic", maxWidth: "360px" }}>
          All phases are subject to strategic optimization for maximum ecosystem value.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Background atmospheric layer ───────────────────────────────────────── */
function Atmosphere() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #04060f 0%, #060a1a 35%, #050508 70%, #04060f 100%)" }}
      />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(191,149,63,0.04), transparent)" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(191,149,63,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(191,149,63,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}

/* ── Root component ──────────────────────────────────────────────────────── */
export default function Roadmap() {
  const stage1 = PHASE_DATA.filter(p => p.stage === "I");
  const stage2 = PHASE_DATA.filter(p => p.stage === "II");

  return (
    <section id="roadmap" className="relative py-24 md:py-32 overflow-hidden" style={{ background: MIDNIGHT }}>
      <Atmosphere />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Section header ── */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-20 md:mb-28">
          <p style={chapterLabelStyle()} className="mb-4">Strategic Blueprint</p>
          <h2 className="text-4xl md:text-6xl mb-5" style={headingStyle()}>
            The OKBOND{" "}
            <span style={goldTextStyle()} className="italic">Roadmap</span>
          </h2>
          {/* Gold hairline */}
          <div className="mx-auto mb-6 h-px w-24"
            style={{ background: "linear-gradient(90deg, transparent, #BF953F, #FCF6BA, #BF953F, transparent)" }}
          />
          <p className="mx-auto max-w-2xl text-base"
            style={{ color: "rgba(201,194,169,0.65)", lineHeight: 1.8, fontStyle: "italic",
              fontFamily: "'Playfair Display', Georgia, serif" }}>
            From sovereign digital bond dominance to a global infrastructure empire —
            the precise evolution of the Orakzai Group ecosystem.
          </p>
        </motion.header>

        {/* ── Stage I ── */}
        <div className="max-w-5xl mx-auto">
          <StageBanner stage="I" label="OKBOND Dominance" years="2026 – 2027" />
          <div className="relative">
            <AnimatedTimelineLine itemCount={stage1.length} />
            <ol className="relative space-y-16 md:space-y-24">
              {stage1.map((item, i) => (
                <PhaseItem key={item.phase} item={item} index={i} />
              ))}
            </ol>
          </div>

          {/* ── Stage II ── */}
          <StageBanner stage="II" label="Sovereign Grid Expansion" years="2028 – 2029" />
          <div className="relative">
            <AnimatedTimelineLine itemCount={stage2.length} />
            <ol className="relative space-y-16 md:space-y-24">
              {stage2.map((item, i) => (
                <PhaseItem key={item.phase} item={item} index={i} />
              ))}
            </ol>
          </div>
        </div>

        <SovereignPlate />
      </div>
    </section>
  );
}
