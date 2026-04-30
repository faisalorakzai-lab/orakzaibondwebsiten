/**
 * AIBriefingTicker — Daily OKBOND Intelligence Briefing
 *
 * Chairman's Directive:
 *   Transparent background. Gold text. Premium financial terminal.
 *   Looks like a $100M project — not a website widget.
 *
 * Behavior:
 *   • Gemini 2.0 Flash generates a daily briefing at first load
 *   • Cached in localStorage (date-keyed) — one API call per day per visitor
 *   • Falls back to curated premium briefings if API unavailable
 *   • Scrolls right-to-left like Reuters / Bloomberg Live Feed
 *   • Zero background — floats on whatever surface is beneath it
 */

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const GOLD        = "#D4AF37";
const GOLD_DIM    = "#8a6e1a";
const GOLD_BRIGHT = "#F4CE45";

// ── Fallback briefings (curated — Chairman-approved tone) ─────────────────
const FALLBACK_BRIEFINGS = [
  "OKBOND Phase 1 ICO active at $0.15 · 75,000 tokens available · Polygon PoS · Reserve backing confirmed at 100% · Smart Lottery round live · Early investors secure lowest entry point before Phase 2 at $0.25",
  "Orakzai Bond ecosystem expanding · OTC Hub, OreC Credit, TinkTak, and Smart Lottery operational on Polygon Mainnet · Staking pool (28% of supply — 2.8M OKBOND) activating at launch · Referral rewards: L1 +5% · L2 +3% · L3 +2%",
  "Capital Preservation Model fully backed · $1.85M sovereign reserve confirmed · 1,248 verified OKBOND holders globally · Phase 1 closes before Phase 2 unlocks · Listing target: $1.00 USDT · Current entry: $0.15",
  "Marcus Intelligence Network online · OKBOND Smart Calculator live on Investment page · Staking APY controlled by Chairman's directive · Zero speculation — structured sovereign digital bond on Polygon",
  "Orakzai Bond — Chairman Faisal Orakzai's sovereign digital asset · 10M total supply · 28% reserved for staking rewards · ICO Phase 1 at $0.15 · Phase 3 listing at $0.50 · Target listing price $1.00 · Network: Polygon PoS Mainnet",
];

// ── Gemini prompt for daily briefing ─────────────────────────────────────
const BRIEFING_PROMPT = `You are Marcus, the intelligence AI of Orakzai Bond ($OKBOND) — a sovereign digital bond on Polygon Network.

Generate a single, flowing financial news ticker line for OKBOND. It must:
- Sound like a Bloomberg or Reuters terminal feed
- Be one continuous sentence, ~80-120 words
- Include factual OKBOND data: Phase 1 ICO at $0.15, Polygon network, 100% reserve backing, staking pool (28% = 2.8M OKBOND), listing target $1.00, Smart Lottery live
- Tone: institutional, confident, sovereign — NOT promotional or casual
- Do NOT use bullet points, line breaks, or markdown
- Do NOT start with "Marcus" or any name
- Just output the ticker text directly`;

const CACHE_KEY = "okbond_briefing_";

function getTodayKey() {
  return CACHE_KEY + new Date().toISOString().slice(0, 10);
}

function getRandomFallback() {
  return FALLBACK_BRIEFINGS[Math.floor(Math.random() * FALLBACK_BRIEFINGS.length)];
}

// ── Live clock — UTC ──────────────────────────────────────────────────────
// Hidden below the `md` breakpoint so the briefing has room to breathe on
// phones. The chairman's directive: briefing text is the priority, not the
// chrome around it.
function UtcClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums hidden md:inline" style={{ color: GOLD_DIM, fontSize: "10px" }}>
      {t.toUTCString().replace("GMT", "UTC").slice(0, 25)}
    </span>
  );
}

export default function AIBriefingTicker() {
  const [briefing, setBriefing]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const containerRef              = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const todayKey = getTodayKey();
    const cached   = localStorage.getItem(todayKey);

    if (cached) {
      setBriefing(cached);
      setLoading(false);
      return;
    }

    const fetchBriefing = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
        if (!apiKey) throw new Error("no key");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: BRIEFING_PROMPT }] }],
            generationConfig: { maxOutputTokens: 160, temperature: 0.65 },
          }),
        });

        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (text && text.length > 20) {
          localStorage.setItem(todayKey, text);
          setBriefing(text);
        } else {
          throw new Error("empty");
        }
      } catch {
        const fallback = getRandomFallback();
        setBriefing(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefing();
  }, []);

  // Ticker scroll speed — chars per second feel
  const tickerDuration = briefing ? Math.max(28, briefing.length * 0.22) : 30;

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        borderTop:    `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
        background:   "transparent",
        backdropFilter: "blur(0px)",
      }}
    >
      {/* ── Left badge — "MARCUS BRIEFING" ────────────────────────
          On mobile we collapse to a tiny pulsing gold dot + "M" so the
          briefing line gets the full screen width. On md+ we restore the
          full label and the comfortable 160px gutter. */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
        <div
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 h-full briefing-badge-left"
          style={{
            background: `linear-gradient(to right, #050505 70%, transparent)`,
            borderRight: `1px solid ${GOLD}20`,
          }}
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full animate-ping"
              style={{ background: GOLD, opacity: 0.5 }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: GOLD }}
            />
          </span>
          <span
            className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.18em] md:tracking-[0.22em] whitespace-nowrap"
            style={{
              color: GOLD,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <span className="md:hidden">Marcus</span>
            <span className="hidden md:inline">Marcus · Briefing</span>
          </span>
        </div>
      </div>

      {/* ── Right badge — UTC clock (desktop only) ────────────────── */}
      <div className="absolute right-0 top-0 bottom-0 z-20 hidden md:flex items-center pointer-events-none">
        <div
          className="flex items-center gap-2 px-4 h-full"
          style={{
            background: `linear-gradient(to left, #050505 70%, transparent)`,
            borderLeft: `1px solid ${GOLD}15`,
            minWidth: "190px",
            justifyContent: "flex-end",
          }}
        >
          <UtcClock />
        </div>
      </div>

      {/* ── Scrolling content ─────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="overflow-hidden ticker-content-wrap"
        style={{ overflow: "hidden" }}
      >
        <div className="py-2 md:py-2.5" style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
          {loading ? (
            <span
              className="text-[10px] font-mono uppercase tracking-[0.15em] animate-pulse"
              style={{ color: `${GOLD}50` }}
            >
              Generating intelligence briefing…
            </span>
          ) : (
            <motion.div
              className="inline-flex items-center gap-10 md:gap-16"
              animate={{ x: ["100%", "-100%"] }}
              transition={{
                duration: tickerDuration,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }}
              style={{ willChange: "transform" }}
            >
              {/* Repeat text 3x for seamless loop */}
              {[0, 1, 2].map((rep) => (
                <span
                  key={rep}
                  className="text-[12px] md:text-[11px] tracking-[0.04em] md:tracking-[0.06em] whitespace-nowrap"
                  style={{
                    color: GOLD_BRIGHT,
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {briefing}
                  <span
                    className="mx-6 md:mx-10 inline-block"
                    style={{ color: `${GOLD}40`, fontSize: "8px" }}
                  >
                    ◆
                  </span>
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      {/* Reserve space for the badges so the scrolling text never slides
          underneath them. We do this in CSS rather than inline style so the
          gutter can vary across breakpoints. */}
      <style>{`
        .ticker-content-wrap { margin-left: 70px; margin-right: 14px; }
        @media (min-width: 768px) {
          .ticker-content-wrap { margin-left: 160px; margin-right: 200px; }
        }
      `}</style>
    </div>
  );
}
