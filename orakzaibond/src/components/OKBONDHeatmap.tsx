import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const GOLD = "#d4af37";

export default function OKBONDHeatmap() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  return (
    <section
      ref={ref}
      aria-labelledby="global-network-heading"
      className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28"
      style={{
        background: "radial-gradient(ellipse at 50% 48%, #17140b 0%, #090909 48%, #050505 100%)",
        borderTop: `1px solid ${GOLD}30`,
        borderBottom: `1px solid ${GOLD}30`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(${GOLD}0b 1px, transparent 1px), linear-gradient(90deg, ${GOLD}0b 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="mb-8 text-center md:mb-12"
        >
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: "#f1d77a", border: `1px solid ${GOLD}55`, background: `${GOLD}12` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
            Orakzai Bond · Worldwide Vision
          </span>
          <h2
            id="global-network-heading"
            className="text-3xl font-bold tracking-tight md:text-5xl"
            style={{ color: "#f7f4ec", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t("map.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 md:text-base" style={{ color: "#b2aa96" }}>
            A world-connected vision, grounded in Orakzai Bond&apos;s Pakistani roots.
          </p>
        </motion.header>

        <motion.figure
          initial={{ opacity: 0, scale: 0.985 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.85, delay: 0.12 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl"
          style={{
            border: `1px solid ${GOLD}70`,
            background: "#030303",
            boxShadow: `0 0 0 1px ${GOLD}15, 0 26px 90px #000, 0 0 64px ${GOLD}16`,
          }}
        >
          <img
            src="/orakzai-global-network.webp"
            alt="Orakzai Bond gold-and-black global network artwork, featuring its emblem, a world globe, and national flags."
            className="block h-auto w-full"
            width={1920}
            height={1920}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="border-t px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] md:py-4 md:text-xs" style={{ color: "#d8c587", borderColor: `${GOLD}45`, background: "#080706" }}>
            Orakzai Bond · Global Network
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
