import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const GOLD = "#d4af37";
const COUNTRY_FLAGS = [
  { flag: "🇺🇸", country: "United States" },
  { flag: "🇪🇺", country: "European Union" },
  { flag: "🇬🇧", country: "United Kingdom" },
  { flag: "🇦🇪", country: "United Arab Emirates" },
  { flag: "🇨🇳", country: "China" },
  { flag: "🇮🇳", country: "India" },
  { flag: "🇿🇦", country: "South Africa" },
];

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
          className="mb-6 text-center md:mb-8"
        >
          <h2
            id="global-network-heading"
            className="text-3xl font-bold tracking-tight md:text-5xl"
            style={{ color: "#f7f4ec", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t("map.title")}
          </h2>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.85, delay: 0.12 }}
          className="mx-auto max-w-4xl"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="mt-7 text-center md:mt-9"
        >
          <p className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: "#f7f4ec" }}>
            <span style={{ color: "#f1d77a" }}>100+</span> Countries
          </p>
          <p className="mt-1 text-xs md:text-sm" style={{ color: "#9b9689" }}>
            Global network vision · Local availability may vary
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 md:gap-3" aria-label="Illustrative global country flags">
            {COUNTRY_FLAGS.map(({ flag, country }) => (
              <span
                key={country}
                role="img"
                aria-label={country}
                title={country}
                className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-md md:h-12 md:w-12 md:text-[27px]"
                style={{ background: "#f6f5f1", boxShadow: `0 3px 14px #0008, 0 0 0 1px ${GOLD}35` }}
              >
                {flag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
