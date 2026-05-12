/**
 * OKBONDHeatmap — Global Investor Distribution
 *
 * Chairman's Directive:
 *   Dark Mode. Low-opacity borders. Glowing gold pulses.
 *   Luxury data visualization — not a geography lesson.
 *
 * Design:
 *   • Near-black void background (#050505)
 *   • Continent silhouettes at 4% opacity — suggestion, not map
 *   • Gold (#D4AF37) pulse rings on investor hub cities
 *   • Hairline gold border, no fills, no labels on map
 *   • Premium stat row below — understated, confident
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useHolderCount } from "@/hooks/useHolderCount";

const GOLD = "#D4AF37";

// Investor hubs — equirectangular coords on 1000×500 viewport
// Format: [cx, cy, size, delay, city, region]
const HUBS = [
  [220, 192, 1.2, 0.0,  "New York",   "Americas"],
  [208, 178, 0.9, 0.4,  "Toronto",    "Americas"],
  [305, 218, 0.7, 0.8,  "Miami",      "Americas"],
  [490, 165, 1.4, 0.2,  "London",     "Europe"],
  [510, 168, 1.0, 0.6,  "Frankfurt",  "Europe"],
  [524, 178, 0.8, 1.1,  "Paris",      "Europe"],
  [556, 200, 1.1, 0.3,  "Istanbul",   "ME"],
  [618, 238, 1.6, 0.0,  "Dubai",      "ME"],
  [624, 246, 0.8, 0.9,  "Riyadh",     "ME"],
  [548, 246, 0.9, 0.5,  "Cairo",      "Africa"],
  [682, 240, 2.0, 0.1,  "Karachi",    "Asia"],
  [696, 228, 1.1, 0.7,  "Islamabad",  "Asia"],
  [710, 232, 0.9, 1.3,  "Lahore",     "Asia"],
  [728, 260, 1.0, 0.4,  "Mumbai",     "Asia"],
  [756, 290, 1.2, 0.2,  "Singapore",  "Asia"],
  [744, 285, 0.8, 0.8,  "KL",         "Asia"],
  [834, 365, 0.8, 1.0,  "Sydney",     "Pacific"],
  [500, 290, 0.7, 0.6,  "Nairobi",    "Africa"],
] as const;

export default function OKBONDHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();
  const { count: holderCount, loading: holderLoading } = useHolderCount();

  const STAT_ROWS = [
    { label: "Active Regions",  value: "18",                                                    suffix: "" },
    { label: "Token Holders",   value: holderLoading ? "Syncing…" : (holderCount ?? "On-Chain"), suffix: "" },
    { label: "Network",         value: "Polygon PoS",                                           suffix: "" },
    { label: "Reserve Backing", value: "100",                                                   suffix: "%" },
    { label: "Founder",         value: "F. Orakzai",                                           suffix: "" },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #050505 0%, #080808 50%, #050505 100%)",
        borderTop: `1px solid ${GOLD}18`,
        borderBottom: `1px solid ${GOLD}18`,
      }}
      className="relative overflow-hidden py-24 md:py-32 px-4 md:px-6"
    >
      {/* Subtle radial ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${GOLD}07, transparent 70%)`,
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-4"
            style={{
              border: `1px solid ${GOLD}30`,
              background: `${GOLD}08`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: GOLD }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: `${GOLD}cc` }}
            >
              Live Global Distribution
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl font-extrabold"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#f8f4ed",
              letterSpacing: "0.01em",
            }}
          >
            {t("map.title")}
          </h2>
          <p
            className="text-xs mt-2 max-w-sm mx-auto"
            style={{ color: "#555", letterSpacing: "0.04em" }}
          >
            {t("map.subtitle")}
          </p>
        </motion.div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative max-w-4xl mx-auto"
        style={{
          borderRadius: "4px",
          border: `1px solid ${GOLD}12`,
          background: "#030303",
          overflow: "hidden",
        }}
      >
        {/* Corner engravings */}
        {[
          "top-0 left-0 border-t border-l",
          "top-0 right-0 border-t border-r",
          "bottom-0 left-0 border-b border-l",
          "bottom-0 right-0 border-b border-r",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 ${cls} pointer-events-none z-20`}
            style={{ borderColor: `${GOLD}50` }}
          />
        ))}

        <svg
          viewBox="0 0 1000 500"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", display: "block" }}
        >
          <defs>
            {/* Vignette mask */}
            <radialGradient id="hm-vignette" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="55%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="hm-mask">
              <rect x="0" y="0" width="1000" height="500" fill="url(#hm-vignette)" />
            </mask>

            {/* Gold glow filter */}
            <filter id="gold-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix in="blur" type="matrix"
                values="1 0.68 0.14 0 0  1 0.68 0.14 0 0  0.4 0.27 0.06 0 0  0 0 0 1 0"
                result="goldBlur" />
              <feMerge>
                <feMergeNode in="goldBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="gold-glow-large" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feColorMatrix in="blur" type="matrix"
                values="1 0.68 0.14 0 0  1 0.68 0.14 0 0  0.4 0.27 0.06 0 0  0 0 0 0.8 0"
                result="goldBlur" />
              <feMerge>
                <feMergeNode in="goldBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Graticule — ghost grid ─────────────────────────────── */}
          <g mask="url(#hm-mask)" stroke={`${GOLD}14`} fill="none" strokeWidth="0.5">
            {Array.from({ length: 11 }, (_, i) => {
              const x = (i + 1) * (1000 / 12);
              return <line key={`lon-${i}`} x1={x} y1="0" x2={x} y2="500" />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const y = (i + 1) * (500 / 6);
              return <line key={`lat-${i}`} x1="0" y1={y} x2="1000" y2={y} />;
            })}
            {/* Equator + Prime Meridian — hairline brighter */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke={`${GOLD}25`} strokeWidth="0.7" />
            <line x1="500" y1="0" x2="500" y2="500" stroke={`${GOLD}25`} strokeWidth="0.7" />
          </g>

          {/* ── Continents — 4% gold suggestion ───────────────────── */}
          <g
            mask="url(#hm-mask)"
            stroke={`${GOLD}40`}
            fill={`${GOLD}06`}
            strokeWidth="0.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* North America */}
            <path d="M130 95 Q175 78 220 88 L270 100 Q305 112 322 138 L332 178 Q332 210 318 232 L296 252 Q268 262 240 258 L218 248 L230 268 L218 282 L200 270 L188 248 Q162 230 146 200 Q132 168 130 132Z" />
            {/* Greenland */}
            <path d="M360 78 Q388 70 412 82 L422 105 Q415 122 396 124 L372 116 Q360 102 360 88Z" />
            {/* South America */}
            <path d="M270 270 Q295 268 318 278 L340 298 Q352 322 350 350 L340 388 Q326 420 308 438 L296 444 L286 432 L286 408 Q280 380 274 350 L268 318 Q264 292 270 278Z" />
            {/* Europe */}
            <path d="M470 158 Q498 152 528 158 L552 168 Q562 178 558 188 L540 198 Q518 202 498 200 L478 192 L472 178 L484 174 L478 168Z" />
            {/* Scandinavia */}
            <path d="M490 130 Q506 122 520 132 L524 152 L510 156 L500 148 L494 140Z" />
            {/* Africa */}
            <path d="M498 210 Q528 208 552 220 L572 240 Q582 268 580 296 L572 330 Q558 365 540 388 L522 408 L510 408 L502 392 L498 360 L490 328 Q486 300 490 272 L496 248Z" />
            {/* Middle East / Arabia */}
            <path d="M558 220 Q580 218 600 228 L618 248 Q622 268 612 280 L596 284 L580 278 L568 260 L556 244Z" />
            {/* Central Asia / South Asia */}
            <path d="M628 198 Q660 190 700 198 L720 210 Q740 222 742 242 L736 260 Q720 272 700 270 L680 262 L662 248 L648 228 L636 212Z" />
            {/* East Asia */}
            <path d="M730 168 Q768 160 800 170 L820 188 Q828 210 820 228 L802 238 Q780 242 760 236 L742 222 L736 204 L742 188Z" />
            {/* Southeast Asia */}
            <path d="M738 268 Q758 264 778 272 L788 288 Q784 304 770 308 L752 304 L742 290Z" />
            {/* Australia */}
            <path d="M780 335 Q820 328 852 340 L868 360 Q872 388 858 408 L834 420 Q810 418 796 402 L786 378 Q778 356 780 340Z" />
            {/* Japan */}
            <path d="M832 188 Q840 182 850 186 L854 200 Q850 210 842 212 L836 204Z" />
            {/* UK */}
            <path d="M476 152 Q484 146 490 152 L492 164 L482 168 L476 160Z" />
            {/* Iceland */}
            <path d="M428 120 Q440 116 448 122 L450 132 Q444 138 436 136 L430 128Z" />
          </g>

          {/* ── Gold Pulse Dots — Investor Hubs ───────────────────── */}
          {HUBS.map(([cx, cy, scale, delay, city], i) => {
            const s = scale as number;
            const d = delay as number;
            const baseR = 3 * s;

            return (
              <g key={i} filter="url(#gold-glow)">
                {/* Outer pulse ring — CSS animation via style */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={baseR * 2.5}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="0.5"
                  style={{
                    opacity: 0,
                    animation: `hm-pulse 3s ease-out ${d}s infinite`,
                  }}
                />
                {/* Middle ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={baseR * 1.6}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="0.6"
                  style={{
                    opacity: 0,
                    animation: `hm-pulse 3s ease-out ${d + 0.5}s infinite`,
                  }}
                />
                {/* Core dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={baseR}
                  fill={GOLD}
                  fillOpacity="0.9"
                />
                {/* City label — only for major hubs */}
                {s >= 1.4 && (
                  <text
                    x={cx}
                    y={cy - baseR - 3}
                    textAnchor="middle"
                    fontSize="5"
                    fill={GOLD}
                    fillOpacity="0.7"
                    fontFamily="'Space Grotesk', monospace"
                    letterSpacing="0.05em"
                  >
                    {city as string}
                  </text>
                )}
              </g>
            );
          })}

          {/* Karachi special — founder city, brighter */}
          <circle cx={682} cy={240} r={8} fill={GOLD} fillOpacity="0.15" filter="url(#gold-glow-large)" />
        </svg>

        {/* CSS keyframes injected inline */}
        <style>{`
          @keyframes hm-pulse {
            0%   { opacity: 0.8; transform-origin: center; transform: scale(0.4); }
            60%  { opacity: 0.2; }
            100% { opacity: 0;   transform: scale(1.8); }
          }
        `}</style>

        {/* Bottom left watermark */}
        <div
          className="absolute bottom-3 left-4 text-[8px] font-mono uppercase tracking-[0.15em] pointer-events-none"
          style={{ color: `${GOLD}35` }}
        >
          OKBOND · POLYGON MAINNET · LIVE
        </div>
        {/* Bottom right coordinate */}
        <div
          className="absolute bottom-3 right-4 text-[8px] font-mono pointer-events-none"
          style={{ color: `${GOLD}25` }}
        >
          EQ-RECT 1000×500
        </div>
      </motion.div>

      {/* ── Stats Row ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto mt-8 flex items-center justify-center gap-0 flex-wrap"
        style={{
          borderTop: `1px solid ${GOLD}15`,
          borderBottom: `1px solid ${GOLD}15`,
          padding: "14px 0",
        }}
      >
        {STAT_ROWS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="px-6 md:px-8 text-center">
              <p
                className="text-[9px] uppercase tracking-[0.18em] mb-0.5"
                style={{ color: "#444" }}
              >
                {s.label}
              </p>
              <p
                className="text-sm font-bold font-mono"
                style={{ color: GOLD }}
              >
                {s.value}{s.suffix}
              </p>
            </div>
            {i < STAT_ROWS.length - 1 && (
              <div
                className="w-px h-6 flex-shrink-0"
                style={{ background: `${GOLD}18` }}
              />
            )}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
