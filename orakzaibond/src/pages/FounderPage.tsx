import { useRef, useMemo, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  Network,
  BrainCircuit,
  Globe2,
  Quote,
  ChevronDown,
  ShieldCheck,
  Linkedin,
  Facebook,
  Instagram,
  Send,
} from "lucide-react";

/* =============================================================================
   FAISAL ORAKZAI — FOUNDER PAGE
   Deep Midnight Black + 24K Gold Linear Gradient
   Self-contained: no external component dependencies beyond framer-motion + lucide-react
   ========================================================================== */

const GOLD_GRADIENT =
  "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)";
const MIDNIGHT = "#05060A";
const PORTRAIT_SRC = "/faisal-orakzai-smiling.jpg";

const PILLARS = [
  {
    icon: Network,
    name: "OSG Infrastructure",
    description: "Proprietary Layer-1 grid for absolute digital autonomy.",
  },
  {
    icon: BrainCircuit,
    name: "OrakzaiX (Marcus AI)",
    description:
      "Level-9 autonomous intelligence engine governing global liquidity and risk management.",
  },
  {
    icon: Globe2,
    name: "The Global Super-Ecosystem",
    description:
      "A multi-sector portfolio spanning Smart-City Development (OPC) and Autonomous Transport (OTC).",
  },
];

const TIMELINE = [
  {
    year: "2018",
    title: "The Foundation",
    body: "Entered the Real Estate sector, building the initial vision for asset-backed wealth.",
  },
  {
    year: "2021",
    title: "The Test of Character",
    body: "Amidst a global market crash, Faisal chose Character over Capital. To ensure his investors faced zero loss, he paused operations and returned to professional employment to personally stabilize financial obligations.",
  },
  {
    year: "2023",
    title: "The Rise of an Empire",
    body: "Armed with raw grit and a decade of experience, Faisal laid the cornerstone of the Orakzai Group — a global conglomerate designed to be unshakeable.",
  },
  {
    year: "2026",
    title: "$OKBOND Launch",
    body: "The culmination of a 12-year vision, launching the world's first Capital-Protected Decentralized Bond.",
  },
];


  const PAGE_SEO = {
    founder: {
      title: "Faisal Orakzai — Founder & Chairman | Orakzai Bond (OKBOND)",
      description:
        "Muhammad Faisal Orakzai (فیصل اورکزئی) — Pakistani blockchain entrepreneur, Founder & Chairman of Orakzai Group and Orakzai Bond (OKBOND) on Polygon Layer-2. Born 30 April 2006, Orakzai Agency, KPK, Pakistan.",
    },
  };

  function useSEO(seo: { title: string; description: string }) {
    useEffect(() => {
      if (seo?.title) document.title = seo.title;
      // Set canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link') as HTMLLinkElement;
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = 'https://orakzaibond.com/founder';

      const meta = document.querySelector('meta[name="description"]');
      if (meta && seo?.description) meta.setAttribute("content", seo.description);
      // Inject Person structured data for Google Knowledge Panel
      const existing = document.getElementById("founder-seo-jsonld");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "founder-seo-jsonld";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://faisalorakzai.com/#person",
        name: "Faisal Orakzai",
        alternateName: ["Muhammad Faisal Orakzai", "فیصل اورکزئی", "Faisal Orakzai Pakistan", "Faisal Orakzai Blockchain", "Chairman Faisal Orakzai", "Malak Faisal Orakzai"],
        birthDate: "2006-04-30",
        birthPlace: { "@type": "Place", name: "Orakzai Agency, Tirah, Khyber Pakhtunkhwa, Pakistan" },
        nationality: "Pakistani",
        jobTitle: "Founder & Chairman",
        worksFor: [
          { "@type": "Organization", name: "Orakzai Group", url: "https://faisalorakzai.com" },
          { "@type": "Organization", name: "Orakzai Bond", url: "https://orakzaibond.com" },
          { "@type": "Organization", name: "Shamim Forever", url: "https://www.shamimforever.com" },
        ],
        url: "https://orakzaibond.com/founder",
        image: [
          { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-smiling.jpg", "width": 800, "height": 800, "caption": "Faisal Orakzai — Founder & Chairman, smiling portrait", "representativeOfPage": true },
          { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-kurta.jpg", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai, shalwar qameez" },
          { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-formal.png", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai Group, formal suit" }
        ],
        sameAs: [
          "https://faisalorakzai.com/founder",
          "https://www.shamimforever.com/founder",
          "https://orakzaibond.com/faisal-orakzai",
          "https://www.linkedin.com/in/faisalorakzaii",
          "https://x.com/faisalorakzaii",
          "https://www.instagram.com/faisalorakzaii",
          "https://www.wikidata.org/wiki/Q140264666",
          "https://www.crunchbase.com/person/faisal-orakzai",
          "https://en.everybodywiki.com/Faisal_Orakzai",
        ],
        description:
          "Pakistani blockchain entrepreneur, Founder of Orakzai Bond (OKBOND) on Polygon Layer-2, Shamim Forever luxury brand. Pioneer in real estate tokenization and AI automation in Pakistan.",
        knowsAbout: ["Blockchain", "Artificial Intelligence", "Real Estate", "Polygon", "DeFi", "Luxury Brands", "Tokenization", "OKBOND"],
      });
      document.head.appendChild(script);
      return () => { const s = document.getElementById("founder-seo-jsonld"); if (s) s.remove(); };
    }, []);
  }

  export default function FounderPage() {
  useSEO(PAGE_SEO.founder);
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: MIDNIGHT,
        color: "#f3ecd1",
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <FontInjector />
      <BackgroundAtmosphere />
      <GoldDust count={26} />

      <div className="relative z-10">
        <Hero />
        <SectionDivider />
        <MissionSection />
        <SectionDivider />
        <TimelineSection />
        <SectionDivider />
        <PillarsSection />
        <SectionDivider />
        <ClosingSection />
        <PageFooter />
      </div>
    </div>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Chairman's directive: parallax must be extremely slow — frosted glass
  // should never distract from OKBOND content. Travel reduced ~3.2×, scale
  // change reduced ~3.2×, overlay drift halved.
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.025]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.7]);

  return (
    <header
      ref={heroRef}
      data-testid="section-hero"
      className="relative isolate min-h-[100svh] w-full overflow-hidden pt-16 pb-20 md:pt-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-12 md:gap-12 md:px-10">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-7"
        >
          <p
            className="mb-6 inline-flex items-center gap-3 text-[11px] uppercase"
            style={{ letterSpacing: "0.34em", color: "rgba(201,184,122,0.85)" }}
          >
            <span
              className="block h-px w-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #FCF6BA, transparent)",
              }}
            />
            Founder Profile
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <IntegrityBadge />
            <CrunchbaseBadge />
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
            }}
            className="text-[2.5rem] md:text-[4.6rem]"
          >
            <span style={{ color: "#f3ecd1", display: "block" }}>
              Faisal Orakzai:
            </span>
            <span style={goldTextStyle()} className="mt-2 block italic">
              The Architect of
            </span>
            <span style={goldTextStyle()} className="mt-1 block italic">
              Orakzai Bond Futures
            </span>
          </h1>

          <p
            className="mt-7 text-lg italic md:text-xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#d8caa1",
            }}
          >
            Founder &amp; Chairman, Orakzai Group
          </p>

          <div
            className="my-7 h-px w-24"
            style={{
              background:
                "linear-gradient(90deg, #BF953F, #FCF6BA, transparent)",
            }}
          />

          <p
            className="max-w-2xl text-[15px] md:text-[17px]"
            style={{ lineHeight: 1.85, color: "rgba(201,194,169,0.92)" }}
          >
            Faisal Orakzai is a global industrialist and the visionary behind
            the <span style={{ color: "#FCF6BA" }}>Orakzai Bond Grid (OKBOND)</span>.
            Integrating Institutional Finance with Autonomous Infrastructure,
            Faisal has engineered a borderless economic ecosystem built on the
            principles of digital sovereignty.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <GoldButton href="/roadmap" testId="button-roadmap-hero">
              View the OKBOND Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </GoldButton>
            <a
              href="#mission"
              data-testid="link-explore"
              className="group inline-flex items-center gap-2 text-[12px] uppercase"
              style={{
                letterSpacing: "0.28em",
                color: "#c9b87a",
                transition: "color 240ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FCF6BA")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#c9b87a")}
            >
              Explore the Vision
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </motion.div>

        {/* Portrait column with parallax */}
        <div className="relative md:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.4,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto aspect-[4/5] w-full max-w-[440px]"
          >
            {/* Outer halo */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-[22px]"
              style={{
                background: GOLD_GRADIENT,
                filter: "blur(22px)",
                opacity: 0.5,
              }}
            />

            {/* Gold frame border */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[18px]"
              style={{ background: GOLD_GRADIENT, padding: "1.5px" }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-[16px]"
                style={{ background: MIDNIGHT }}
              >
                <motion.img
                  src={PORTRAIT_SRC}
                  alt="Faisal Orakzai — Founder & Chairman of the Orakzai Group"
                  data-testid="img-founder-portrait"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    y: portraitY,
                    scale: portraitScale,
                    transformOrigin: "center center",
                  }}
                  draggable={false}
                  onError={(e) => {
                    // Fallback: hide image gracefully if portrait not yet uploaded
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                {/* Cinematic overlay */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: overlayOpacity,
                    background:
                      "linear-gradient(180deg, transparent 50%, rgba(5,6,10,0.85) 100%), radial-gradient(120% 80% at 30% 30%, transparent 0%, rgba(5,6,10,0.4) 80%)",
                  }}
                />
                <CornerOrnaments />
              </div>
            </div>

            {/* Caption plate */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,18,12,0.92) 0%, rgba(10,9,6,0.96) 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <span aria-hidden="true" style={goldRingStyle("9999px")} />
              <span
                className="relative text-xs italic"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#FCF6BA",
                  letterSpacing: "0.06em",
                }}
              >
                EST. 2018 · Orakzai Group
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase"
        style={{ letterSpacing: "0.4em", color: "rgba(201,184,122,0.6)" }}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        Scroll
      </motion.div>
    </header>
  );
}

function CornerOrnaments() {
  const positions = [
    { top: 12, left: 12, borders: "border-t border-l" },
    { top: 12, right: 12, borders: "border-t border-r" },
    { bottom: 12, left: 12, borders: "border-b border-l" },
    { bottom: 12, right: 12, borders: "border-b border-r" },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute h-6 w-6 ${p.borders}`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            borderColor: "rgba(252,246,186,0.55)",
          }}
        />
      ))}
    </>
  );
}

/* ----------------------------- MISSION ----------------------------- */

function MissionSection() {
  return (
    <section
      id="mission"
      data-testid="section-mission"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32"
    >
      <div className="mb-12 text-center md:mb-16">
        <p style={chapterLabelStyle()} className="mb-3">
          Chapter I
        </p>
        <h2 style={headingStyle()} className="text-4xl md:text-6xl">
          The <span style={goldTextStyle()} className="italic">$OKBOND</span>{" "}
          Mission
        </h2>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        data-testid="card-mission"
        className="mx-auto max-w-4xl p-9 md:p-14"
        style={glassCardStyle()}
      >
        <span aria-hidden="true" style={goldRingStyle("18px")} />
        <div className="relative">
          <div className="mb-8 flex items-center gap-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: GOLD_GRADIENT,
                boxShadow:
                  "inset 0 0 0 2px rgba(5,6,10,0.6), 0 0 28px rgba(252,246,186,0.4)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  color: MIDNIGHT,
                }}
                className="text-lg"
              >
                $OK
              </span>
            </div>
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, #BF953F, #FCF6BA, transparent)",
              }}
            />
          </div>

          <p
            className="mb-7 text-xl tracking-wide md:text-3xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#FCF6BA",
            }}
          >
            Zero-Loss Paradigm
            <span className="mx-3" style={{ color: "#8a6a1c" }}>
              |
            </span>
            <span className="italic">'Character over Capital'</span>
          </p>

          <p
            className="text-[15px] md:text-[17px]"
            style={{ lineHeight: 1.85, color: "rgba(212,203,168,0.92)" }}
          >
            Faisal is the architect behind{" "}
            <span style={{ color: "#FCF6BA", fontWeight: 500 }}>$OKBOND</span> —
            the world's premier capital-protected decentralized bond protocol.
            This mission synthesizes high-value{" "}
            <span style={{ color: "#FCF6BA" }}>Real World Assets (RWA)</span>{" "}
            with the immutable transparency of the{" "}
            <span style={{ color: "#FCF6BA" }}>Polygon blockchain</span>,
            establishing a new standard for wealth preservation.
          </p>

          {/* Metric strip */}
          <div
            className="mt-10 grid grid-cols-3 gap-4 pt-7"
            style={{ borderTop: "1px solid rgba(191,149,63,0.22)" }}
          >
            {[
              { label: "Capital Protection", value: "100%" },
              { label: "Network", value: "Polygon" },
              { label: "Asset Class", value: "RWA-Backed" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p
                  className="text-2xl md:text-3xl"
                  style={{
                    ...goldTextStyle(),
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {m.value}
                </p>
                <p
                  className="mt-2 text-[10px] uppercase"
                  style={{
                    letterSpacing: "0.22em",
                    color: "rgba(201,184,122,0.7)",
                  }}
                >
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </section>
  );
}

/* ----------------------------- TIMELINE ----------------------------- */

function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 25%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const glowTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const glowOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.95, 1],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      data-testid="section-timeline"
      className="relative mx-auto w-full max-w-5xl px-6 py-24 md:py-32"
    >
      <header className="mb-16 text-center md:mb-20">
        <p style={chapterLabelStyle()} className="mb-3">
          Chapter II
        </p>
        <h2 style={headingStyle()} className="text-4xl md:text-6xl">
          <span style={goldTextStyle()}>Journey of Resilience</span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-xl text-sm md:text-base"
          style={{ lineHeight: 1.7, color: "rgba(201,194,169,0.7)" }}
        >
          Twelve years. Four turning points. One unshakeable principle.
        </p>
      </header>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-6 top-0 bottom-0 w-px md:left-1/2 md:-translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(191,149,63,0.18) 8%, rgba(191,149,63,0.18) 92%, transparent 100%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute left-6 top-0 md:left-1/2 md:-translate-x-1/2"
          style={{
            width: "2px",
            height: lineHeight,
            background:
              "linear-gradient(180deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)",
            boxShadow:
              "0 0 8px rgba(252,246,186,0.55), 0 0 22px rgba(191,149,63,0.35)",
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute left-6 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full md:left-1/2"
          style={{
            top: glowTop,
            opacity: glowOpacity,
            background:
              "radial-gradient(circle, rgba(252,246,186,0.55) 0%, rgba(191,149,63,0.25) 40%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        <ol className="relative space-y-16 md:space-y-24">
          {TIMELINE.map((event, i) => (
            <TimelineItem key={event.year} event={event} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({
  event,
  index,
}: {
  event: (typeof TIMELINE)[number];
  index: number;
}) {
  const isLeft = index % 2 === 0;
  return (
    <motion.li
      data-testid={`timeline-item-${event.year}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-2"
    >
      <span
        aria-hidden="true"
        className="absolute left-6 top-2 z-20 flex h-5 w-5 -translate-x-1/2 items-center justify-center md:left-1/2"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: GOLD_GRADIENT,
            boxShadow:
              "0 0 0 4px " +
              MIDNIGHT +
              ", 0 0 0 5px rgba(191,149,63,0.45), 0 0 22px rgba(252,246,186,0.55)",
          }}
        />
        <span
          className="relative h-2 w-2 rounded-full"
          style={{
            background: MIDNIGHT,
            boxShadow: "inset 0 0 4px rgba(252,246,186,0.4)",
          }}
        />
      </span>

      <div
        className={`pl-16 md:pl-0 ${
          isLeft ? "md:pr-16 md:text-right" : "md:order-2 md:pl-16"
        }`}
      >
        <span
          className="inline-block text-5xl md:text-6xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 500,
            lineHeight: 1,
            background:
              "linear-gradient(135deg, #BF953F 0%, #FCF6BA 40%, #B38728 60%, #AA771C 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          {event.year}
        </span>
        <h3
          className="mt-3 text-2xl md:text-3xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#f3ecd1",
          }}
        >
          {event.title}
        </h3>
      </div>

      <div
        className={`pl-16 md:pl-0 ${
          isLeft ? "md:pl-16" : "md:order-1 md:pr-16 md:text-right"
        }`}
      >
        <p
          className="text-[15px] md:text-base"
          style={{ lineHeight: 1.75, color: "rgba(201,194,169,0.85)" }}
        >
          {event.body}
        </p>
      </div>
    </motion.li>
  );
}

/* ----------------------------- PILLARS ----------------------------- */

function PillarsSection() {
  return (
    <section
      data-testid="section-pillars"
      className="relative mx-auto w-full max-w-7xl px-6 py-24 md:py-32"
    >
      <header className="mb-14 text-center md:mb-20">
        <p style={chapterLabelStyle()} className="mb-3">
          Chapter III
        </p>
        <h2 style={headingStyle()} className="text-4xl md:text-6xl">
          The <span style={goldTextStyle()} className="italic">Strategic Pillars</span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-2xl text-sm md:text-base"
          style={{ lineHeight: 1.7, color: "rgba(201,194,169,0.7)" }}
        >
          Three Orakzai Bond systems engineered to operate as one borderless
          economic engine.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.article
              key={pillar.name}
              data-testid={`card-pillar-${i}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.85,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6 }}
              className="group flex flex-col p-8 md:p-10"
              style={glassCardStyle()}
            >
              <span aria-hidden="true" style={goldRingStyle("18px")} />
              <div className="relative flex flex-col">
                <div className="mb-7 flex items-center justify-between">
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(191,149,63,0.18) 0%, rgba(170,119,28,0.08) 100%)",
                    }}
                  >
                    <span aria-hidden="true" style={goldRingStyle("9999px")} />
                    <Icon
                      className="relative h-6 w-6 transition-transform duration-500 group-hover:scale-110"
                      strokeWidth={1.5}
                      style={{ color: "#FCF6BA" }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      letterSpacing: "0.3em",
                      color: "#8a6a1c",
                    }}
                    className="text-[11px]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3
                  className="mb-4 text-2xl md:text-[1.65rem]"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: "#f3ecd1",
                  }}
                >
                  {pillar.name}
                </h3>

                <div
                  className="mb-5 h-px w-12"
                  style={{
                    background:
                      "linear-gradient(90deg, #BF953F, transparent)",
                  }}
                />

                <p
                  className="text-[14px] md:text-[15px]"
                  style={{ lineHeight: 1.75, color: "rgba(201,194,169,0.85)" }}
                >
                  {pillar.description}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------- CLOSING ----------------------------- */

function ClosingSection() {
  return (
    <section
      data-testid="section-closing"
      className="relative mx-auto w-full max-w-5xl px-6 py-28 text-center md:py-36"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <Quote
          className="mx-auto mb-8 h-10 w-10"
          strokeWidth={1.5}
          style={{ color: "#BF953F" }}
        />

        <blockquote className="mx-auto max-w-3xl">
          <p
            className="text-2xl italic md:text-[2.25rem]"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.45,
              color: "#f3ecd1",
            }}
          >
            <span
              style={{
                ...goldTextStyle(),
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
              className="text-5xl md:text-7xl"
            >
              "
            </span>
            Sovereign empires are not built on capital alone; they are forged in
            the fires of resilience and enduring character.
            <span
              style={{
                ...goldTextStyle(),
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
              className="text-5xl md:text-7xl"
            >
              "
            </span>
          </p>
        </blockquote>

        <div className="mt-14 flex flex-col items-center">
          <Signature />
          <p
            className="mt-3 text-[10px] uppercase"
            style={{ letterSpacing: "0.4em", color: "#8a6a1c" }}
          >
            Founder &amp; Chairman
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <p
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.32em", color: "#8a6a1c" }}
          >
            Connect with the Founder
          </p>
          <SocialBar />
        </div>

        <div className="mt-14">
          <GoldButton href="/roadmap" testId="button-roadmap-cta" large>
            View the OKBOND Roadmap
            <ArrowRight className="ml-2.5 h-5 w-5" />
          </GoldButton>
        </div>
      </motion.div>
    </section>
  );
}

/* ----------------------------- FOOTER STRIP ----------------------------- */

function PageFooter() {
  return (
    <div
      data-testid="footer-strip"
      className="relative mx-auto w-full max-w-7xl px-6 pb-12 pt-6"
    >
      <div
        className="mb-8 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(191,149,63,0.55), transparent)",
          opacity: 0.55,
        }}
      />
      <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <p
          className="text-sm"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.04em",
            color: "#c9b87a",
          }}
        >
          Orakzai Group{" "}
          <span className="mx-2" style={{ color: "#8a6a1c" }}>
            ·
          </span>{" "}
          Powered by OKBOND
        </p>
        <p
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.32em", color: "#8a6a1c" }}
        >
          © {new Date().getFullYear()} · All Rights Reserved
        </p>
      </div>
    </div>
  );
}

/* ----------------------------- BUILDING BLOCKS ----------------------------- */

function GoldButton({
  children,
  href,
  testId,
  large = false,
}: {
  children: React.ReactNode;
  href?: string;
  testId?: string;
  large?: boolean;
}) {
  const Tag: any = href ? "a" : "button";
  return (
    <Tag
      href={href}
      type={href ? undefined : "button"}
      data-testid={testId}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full ${
        large ? "px-10 py-5 text-[14px]" : "px-7 py-3.5 text-[13px]"
      }`}
      style={{
        fontWeight: 500,
        background: GOLD_GRADIENT,
        color: MIDNIGHT,
        boxShadow:
          "0 12px 32px -8px rgba(191,149,63,0.55), 0 0 0 1px rgba(252,246,186,0.3) inset",
        transition: "transform 360ms cubic-bezier(0.22,1,0.36,1)",
        textDecoration: "none",
      }}
      onMouseEnter={(e: any) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
      }
      onMouseLeave={(e: any) => (e.currentTarget.style.transform = "")}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
        }}
      />
      <span
        className="relative inline-flex items-center uppercase"
        style={{ letterSpacing: "0.18em" }}
      >
        {children}
      </span>
    </Tag>
  );
}

function CrunchbaseBadge() {
  return (
    <motion.a
      href="https://www.crunchbase.com/person/faisal-orakzai"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="badge-crunchbase"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="group relative inline-flex items-center gap-3 rounded-full px-4 py-2 no-underline"
      style={{
        background:
          "linear-gradient(135deg, rgba(20,18,12,0.78) 0%, rgba(10,9,6,0.92) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,215,0,0.55)",
        boxShadow:
          "0 0 18px rgba(255,215,0,0.25), 0 0 36px rgba(255,215,0,0.12), 0 6px 18px rgba(0,0,0,0.5)",
        textDecoration: "none",
      }}
      aria-label="Crunchbase Global Rank #988 — view profile"
    >
      <span
        className="relative flex h-6 w-6 items-center justify-center rounded-md"
        style={{
          background:
            "linear-gradient(135deg, #FFD700 0%, #FCF6BA 50%, #BF953F 100%)",
          boxShadow: "0 0 10px rgba(255,215,0,0.55)",
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 8.2c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8c1.3 0 2.4-.6 3.1-1.6l-1.6-.9c-.3.4-.9.7-1.5.7-1.1 0-2-.9-2-2s.9-2 2-2c.6 0 1.1.3 1.5.7l1.6-.9C11.9 8.8 10.8 8.2 9.5 8.2z M16.4 8.2c-.7 0-1.4.2-1.9.6V5.5h-1.8v10.1h1.8v-.4c.5.4 1.2.6 1.9.6 2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8z m-.2 5.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            fill="#05060A"
          />
        </svg>
      </span>

      <span className="relative flex flex-col leading-none">
        <span
          className="text-[8px] uppercase"
          style={{
            letterSpacing: "0.28em",
            color: "rgba(255,215,0,0.7)",
          }}
        >
          Crunchbase Global Rank
        </span>
        <span
          className="mt-1 text-sm font-semibold"
          style={{
            color: "#FFD700",
            letterSpacing: "0.04em",
            textShadow:
              "0 0 8px rgba(255,215,0,0.55), 0 0 16px rgba(255,215,0,0.3)",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          #988
        </span>
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full rounded-full transition-transform duration-1000 ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.18), transparent)",
        }}
      />
    </motion.a>
  );
}

function IntegrityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      data-testid="badge-integrity"
      className="relative inline-flex items-center gap-2.5 rounded-full px-4 py-2"
      style={{
        background:
          "linear-gradient(135deg, rgba(20,18,12,0.65) 0%, rgba(10,9,6,0.8) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span aria-hidden="true" style={goldRingStyle("9999px")} />
      <span className="relative flex h-5 w-5 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(252,246,186,0.2)" }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <ShieldCheck
          className="relative h-4 w-4"
          strokeWidth={2.5}
          style={{ color: "#FCF6BA" }}
        />
      </span>
      <span
        className="relative text-[11px] font-medium uppercase"
        style={{ ...goldTextStyle(), letterSpacing: "0.18em" }}
      >
        Admin-Controlled Integrity Verified
      </span>
    </motion.div>
  );
}

function Signature() {
  return (
    <motion.div
      data-testid="signature-faisal"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      role="img"
      aria-label="Faisal Orakzai — signature"
      className="relative inline-flex flex-col items-center"
      style={{ maxWidth: 620 }}
    >
      <FontInjectorSignature />
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        style={{
          fontFamily: "'Mr Dafoe', 'Allura', 'Dancing Script', cursive",
          fontWeight: 400,
          fontSize: "clamp(2.75rem, 7vw, 4.75rem)",
          lineHeight: 1,
          letterSpacing: "-0.005em",
          whiteSpace: "nowrap",
          background:
            "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          filter:
            "drop-shadow(0 0 10px rgba(252,246,186,0.45)) drop-shadow(0 0 22px rgba(191,149,63,0.35))",
          paddingBottom: "0.18em",
          transform: "rotate(-3deg)",
          transformOrigin: "center",
        }}
      >
        Faisal Orakzai
      </motion.span>

      <motion.svg
        viewBox="0 0 480 30"
        width="100%"
        style={{ marginTop: "-0.5rem", maxWidth: 480, height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="okSigUnderline" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BF953F" stopOpacity="0" />
            <stop offset="20%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="80%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" stopOpacity="0" />
          </linearGradient>
          <filter id="okSigUnderlineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d="M 14 18 Q 130 4, 260 14 T 460 10"
          fill="none"
          stroke="url(#okSigUnderline)"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#okSigUnderlineGlow)"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1.6, ease: "easeInOut", delay: 0.6 },
            },
          }}
        />

        <motion.path
          d="M 452 10 Q 466 6, 462 18 Q 456 24, 462 14"
          fill="none"
          stroke="url(#okSigUnderline)"
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#okSigUnderlineGlow)"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.8, ease: "easeInOut", delay: 1.6 },
            },
          }}
        />
      </motion.svg>
    </motion.div>
  );
}

function SocialBar() {
  const SOCIALS: {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    highlight?: boolean;
  }[] = [
    {
      name: "X",
      href: "https://x.com/orakzaifaisal",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: "https://t.me/FaisalOrakzai1",
      icon: <Send style={{ width: 20, height: 20 }} strokeWidth={1.6} aria-hidden="true" />,
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/faisalorakzaiofficial",
      icon: <Facebook style={{ width: 20, height: 20 }} strokeWidth={1.6} aria-hidden="true" />,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/orakzaifaisal",
      icon: <Instagram style={{ width: 20, height: 20 }} strokeWidth={1.6} aria-hidden="true" />,
    },
    {
      name: "Crunchbase",
      href: "https://www.crunchbase.com/person/faisal-orakzai",
      badge: "Rank #988",
      highlight: true,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M9.5 8.2c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8c1.3 0 2.4-.6 3.1-1.6l-1.6-.9c-.3.4-.9.7-1.5.7-1.1 0-2-.9-2-2s.9-2 2-2c.6 0 1.1.3 1.5.7l1.6-.9C11.9 8.8 10.8 8.2 9.5 8.2zM16.4 8.2c-.7 0-1.4.2-1.9.6V5.5h-1.8v10.1h1.8v-.4c.5.4 1.2.6 1.9.6 2.1 0 3.8-1.7 3.8-3.8s-1.7-3.8-3.8-3.8zm-.2 5.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/orakzaifaisal",
      badge: "Premium",
      icon: <Linkedin style={{ width: 20, height: 20 }} strokeWidth={1.6} aria-hidden="true" />,
    },
  ];

  return (
    <motion.div
      data-testid="social-bar"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto inline-flex flex-wrap items-center justify-center gap-2 rounded-full px-5 py-3"
      style={{
        background:
          "linear-gradient(135deg, rgba(20,18,12,0.78) 0%, rgba(10,9,6,0.92) 100%)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        border: "1px solid rgba(252,246,186,0.22)",
        boxShadow:
          "0 12px 36px -12px rgba(191,149,63,0.35), 0 0 0 1px rgba(252,246,186,0.04) inset",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 50%, #FBF5B7 70%, #AA771C 100%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0.55,
        }}
      />
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`social-link-${s.name.toLowerCase()}`}
          aria-label={`${s.name}${s.badge ? " — " + s.badge : ""}`}
          className="group relative inline-flex items-center gap-2 rounded-full px-3 py-2"
          style={{
            color: "#c9b87a",
            transition: "all 300ms ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = "scale(1.08)";
            el.style.color = "#FCF6BA";
            el.style.boxShadow =
              "0 0 18px rgba(252,246,186,0.55), 0 0 36px rgba(191,149,63,0.35), inset 0 0 0 1px rgba(252,246,186,0.4)";
            el.style.background =
              "radial-gradient(circle at center, rgba(252,246,186,0.08), transparent 70%)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = "";
            el.style.color = "#c9b87a";
            el.style.boxShadow = "";
            el.style.background = "";
          }}
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
            {s.icon}
          </span>
          {s.badge && (
            <span
              className="hidden text-[10px] font-medium uppercase sm:inline"
              style={{
                letterSpacing: "0.16em",
                color: s.highlight ? "#FFD700" : "#c9b87a",
                textShadow: s.highlight
                  ? "0 0 8px rgba(255,215,0,0.55)"
                  : "none",
              }}
            >
              {s.badge}
            </span>
          )}
        </a>
      ))}
    </motion.div>
  );
}

function FontInjectorSignature() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Mr+Dafoe&family=Allura&display=swap');
    `}</style>
  );
}

function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-5xl px-6"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(191,149,63,0.5) 50%, transparent 100%)",
        opacity: 0.4,
      }}
    />
  );
}

function BackgroundAtmosphere() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[60vh] w-[120vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(191,149,63,0.10) 0%, rgba(252,246,186,0.04) 30%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(252,246,186,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(252,246,186,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </>
  );
}

function GoldDust({ count = 24 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: Math.random() * 2.2 + 0.6,
        delay: Math.random() * 18,
        duration: 18 + Math.random() * 22,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    [count]
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <style>{`
        @keyframes ok-dust-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) translateX(20px); opacity: 0; }
        }
      `}</style>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            bottom: "-10vh",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background:
              "radial-gradient(circle, rgba(252,246,186,1) 0%, rgba(191,149,63,0.7) 50%, transparent 100%)",
            boxShadow: "0 0 6px rgba(252,246,186,0.8)",
            opacity: p.opacity,
            animation: `ok-dust-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function FontInjector() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap');
    `}</style>
  );
}

/* ----------------------------- STYLE HELPERS ----------------------------- */

function goldTextStyle(): React.CSSProperties {
  return {
    background: GOLD_GRADIENT,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent" as any,
  };
}

function goldRingStyle(radius: string): React.CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    padding: "1px",
    background: GOLD_GRADIENT,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none",
  };
}

function glassCardStyle(): React.CSSProperties {
  return {
    position: "relative",
    background:
      "linear-gradient(155deg, rgba(20,18,12,0.72) 0%, rgba(10,9,6,0.85) 100%)",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 30px 60px -30px rgba(191,149,63,0.25), 0 0 0 1px rgba(252,246,186,0.04) inset",
    transition:
      "transform 400ms cubic-bezier(0.22,1,0.36,1), box-shadow 400ms cubic-bezier(0.22,1,0.36,1)",
  };
}

function chapterLabelStyle(): React.CSSProperties {
  return {
    ...goldTextStyle(),
    fontSize: "11px",
    letterSpacing: "0.32em",
    textTransform: "uppercase",
  };
}

function headingStyle(): React.CSSProperties {
  return {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.015em",
  };
}
