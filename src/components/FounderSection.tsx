/**
 * FounderSection — Cinematic Homepage Block
 * Chairman's Directive: Mirror the FounderPage's parallax + gold DNA.
 * Deep Black (#05060A) + 24K Gold Gradient. No white. No grey. No cyan.
 */

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Quote, BadgeCheck, Building2, Globe, Network, Linkedin, Twitter, Send } from "lucide-react";
import { useLocation } from "wouter";

/* ── Design tokens — exact mirror of FounderPage ─────────────────────────── */
const GOLD_GRADIENT =
  "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)";
const MIDNIGHT = "#05060A";
const PORTRAIT_SRC = "/founder-portrait.png";

function goldTextStyle(): React.CSSProperties {
  return {
    background: GOLD_GRADIENT,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const PILLARS = [
  { icon: Building2, value: "12+",    label: "Companies Founded"   },
  { icon: Network,   value: "#988",   label: "Crunchbase Global"   },
  { icon: Globe,     value: "Global", label: "Sovereign Infra"     },
];

const SOCIALS = [
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/orakzaifaisal", icon: <Linkedin className="w-4 h-4" /> },
  { label: "X Twitter", href: "https://x.com/faisalorakzai",               icon: <Twitter  className="w-4 h-4" /> },
  { label: "Telegram",  href: "https://t.me/orakzaibond",                  icon: <Send     className="w-4 h-4" /> },
];

/* ── Gold dust particles — identical to FounderPage ──────────────────────── */
function GoldDust({ count = 20 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left:     Math.random() * 100,
        size:     Math.random() * 2.2 + 0.6,
        delay:    Math.random() * 18,
        duration: 18 + Math.random() * 22,
        opacity:  0.2 + Math.random() * 0.5,
      })),
    [count]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes founder-section-dust {
          0%   { transform: translateY(0) translateX(0);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-115vh) translateX(18px); opacity: 0; }
        }
      `}</style>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            bottom:     "-8vh",
            left:       `${p.left}%`,
            width:      `${p.size}px`,
            height:     `${p.size}px`,
            background: "radial-gradient(circle, rgba(252,246,186,1) 0%, rgba(191,149,63,0.7) 50%, transparent 100%)",
            boxShadow:  "0 0 6px rgba(252,246,186,0.8)",
            opacity:    p.opacity,
            animation:  `founder-section-dust ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function FounderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();

  /* Parallax scroll — target the section itself */
  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset:  ["start end", "end start"],
  });

  /* Portrait parallax — slow cinematic drift */
  const portraitY     = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const portraitYSpr  = useSpring(portraitY, { stiffness: 55, damping: 18, mass: 0.4 });
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);

  /* Content parallax — slight counter-drift */
  const contentY    = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const contentYSpr = useSpring(contentY, { stiffness: 75, damping: 22, mass: 0.4 });

  return (
    <section
      ref={sectionRef}
      id="founder"
      className="relative overflow-hidden"
      style={{
        background:    MIDNIGHT,
        paddingTop:    "7rem",
        paddingBottom: "7rem",
      }}
    >
      {/* ── Atmospheric background ────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 65% at 20% 50%, rgba(191,149,63,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.025,
            backgroundImage:
              "linear-gradient(rgba(252,246,186,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(252,246,186,0.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <GoldDust count={22} />

      {/* Gold hairline top */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0"
        style={{
          height:     "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(191,149,63,0.45), rgba(252,246,186,0.6), rgba(191,149,63,0.45), transparent)",
        }}
      />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-6 max-w-7xl">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{
              background:     "linear-gradient(135deg, rgba(20,18,12,0.75) 0%, rgba(10,9,6,0.92) 100%)",
              border:         "1px solid rgba(191,149,63,0.35)",
              color:          "rgba(191,149,63,0.9)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            Chairman · Orakzai Group
          </span>
        </motion.div>

        {/* Portrait + content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── LEFT: Parallax Portrait ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: portraitYSpr }}
          >
            <div className="relative mx-auto lg:ml-0" style={{ maxWidth: "440px" }}>
              {/* Portrait */}
              <motion.div
                style={{ scale: portraitScale }}
                className="relative overflow-hidden"
                // @ts-ignore — inline borderRadius needed for scale animation
                css={{ borderRadius: "24px" }}
              >
                {/* Gold ring hairline */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    borderRadius:           "24px",
                    padding:                "1.5px",
                    background:             GOLD_GRADIENT,
                    WebkitMask:             "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite:    "xor",
                    maskComposite:          "exclude",
                  }}
                />

                <div
                  style={{
                    borderRadius: "24px",
                    overflow:     "hidden",
                    boxShadow:    "0 40px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(191,149,63,0.22)",
                  }}
                >
                  <img
                    src={PORTRAIT_SRC}
                    alt="Faisal Orakzai — Chairman, Orakzai Group"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src !== window.location.origin + "/faisal-orakzai.jpg") {
                        img.src = "/faisal-orakzai.jpg";
                      }
                    }}
                    className="w-full object-cover object-top block"
                    style={{ height: "520px" }}
                  />
                  {/* Bottom gradient fade */}
                  <div
                    className="absolute bottom-0 left-0 right-0 pointer-events-none"
                    style={{
                      height:     "130px",
                      background: `linear-gradient(to top, ${MIDNIGHT} 0%, transparent 100%)`,
                    }}
                  />
                </div>
              </motion.div>

              {/* Name plate */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-7 text-center"
              >
                <p
                  style={{
                    fontFamily:    "'Playfair Display', Georgia, serif",
                    fontWeight:    500,
                    fontSize:      "1.35rem",
                    color:         "#f3ecd1",
                    letterSpacing: "0.02em",
                  }}
                >
                  Faisal Orakzai
                </p>
                <p
                  className="mt-1 text-[10px] uppercase tracking-[0.34em]"
                  style={{ color: "rgba(191,149,63,0.7)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Founder &amp; Chairman
                </p>

                {/* Social icons */}
                <div className="flex items-center justify-center gap-3.5 mt-5">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="flex items-center justify-center w-9 h-9 rounded-full"
                      style={{
                        color:      "rgba(191,149,63,0.65)",
                        border:     "1px solid rgba(191,149,63,0.2)",
                        background: "rgba(10,9,6,0.6)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.color       = "#FCF6BA";
                        el.style.borderColor = "rgba(191,149,63,0.6)";
                        el.style.boxShadow   = "0 0 18px rgba(191,149,63,0.38)";
                        el.style.transform   = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.color       = "rgba(191,149,63,0.65)";
                        el.style.borderColor = "rgba(191,149,63,0.2)";
                        el.style.boxShadow   = "";
                        el.style.transform   = "";
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── RIGHT: Cinematic biography ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            style={{ y: contentYSpr }}
          >
            {/* Chapter label */}
            <p
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ color: "rgba(191,149,63,0.75)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              The Visionary
            </p>

            {/* Headline */}
            <h2
              className="mb-6 text-4xl md:text-5xl xl:text-6xl"
              style={{
                fontFamily:    "'Playfair Display', Georgia, serif",
                fontWeight:    500,
                lineHeight:    1.08,
                letterSpacing: "-0.015em",
                color:         "#f3ecd1",
              }}
            >
              A Sovereign{" "}
              <span style={goldTextStyle()} className="italic">Empire</span>
              {" "}Built on Character
            </h2>

            {/* Gold hairline */}
            <div
              className="mb-8 h-px w-20"
              style={{ background: "linear-gradient(90deg, #BF953F, rgba(191,149,63,0))" }}
            />

            {/* Bio paragraph */}
            <p
              className="mb-8 text-base"
              style={{ color: "rgba(201,194,169,0.75)", lineHeight: 1.82 }}
            >
              Over twelve years, Faisal Orakzai built and tested an empire — proving that sovereign
              wealth is forged not through speculation, but through character, resilience, and
              unshakeable principle. Today, Orakzai Bond is the financial instrument that
              institution builders trust.
            </p>

            {/* Quote block */}
            <div
              className="mb-10 relative pl-6"
              style={{ borderLeft: "2px solid rgba(191,149,63,0.4)" }}
            >
              <Quote
                className="absolute -top-1 -left-0.5 w-4 h-4"
                style={{ color: "rgba(191,149,63,0.5)" }}
              />
              <blockquote
                className="text-base italic"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color:      "#f3ecd1",
                  lineHeight: 1.65,
                }}
              >
                "Sovereign empires are not built on capital alone — they are forged in the fires of
                resilience and enduring character."
              </blockquote>
            </div>

            {/* Stats pills */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.label}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background:     "linear-gradient(135deg, rgba(15,13,8,0.75) 0%, rgba(8,7,4,0.92) 100%)",
                      border:         "1px solid rgba(191,149,63,0.18)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      transition:     "all 0.35s ease",
                      boxShadow:      "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: "rgba(191,149,63,0.7)" }} />
                    <p
                      className="text-lg font-bold leading-none"
                      style={{
                        ...goldTextStyle(),
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {p.value}
                    </p>
                    <p
                      className="mt-1 text-[9px] uppercase tracking-[0.18em] leading-tight"
                      style={{
                        color:       "rgba(191,149,63,0.55)",
                        fontFamily:  "'Space Grotesk', sans-serif",
                        fontWeight:  700,
                      }}
                    >
                      {p.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.button
              onClick={() => setLocation("/founder")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full relative overflow-hidden"
              style={{
                padding:     "0.875rem 2rem",
                background:  GOLD_GRADIENT,
                color:       MIDNIGHT,
                fontSize:    "13px",
                fontFamily:  "'Space Grotesk', sans-serif",
                fontWeight:  600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                boxShadow:   "0 12px 32px -8px rgba(191,149,63,0.55), 0 0 0 1px rgba(252,246,186,0.3) inset",
                border:      "none",
                cursor:      "pointer",
                transition:  "transform 360ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <span className="relative z-10 inline-flex items-center gap-3">
                Meet the Chairman
                <ArrowRight className="w-4 h-4" />
              </span>
              {/* Shimmer sweep */}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:  "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)",
                  transform:   "translateX(-100%)",
                  transition:  "transform 1.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateX(100%)"; }}
              />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Gold hairline bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0"
        style={{
          height:     "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(191,149,63,0.45), rgba(252,246,186,0.6), rgba(191,149,63,0.45), transparent)",
        }}
      />
    </section>
  );
}
