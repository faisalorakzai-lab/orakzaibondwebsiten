/*
 * AIBriefingTicker — Daily OKBOND Intelligence Briefing
 *
 * Chairman's Directive:
 *   Transparent background. Gold text. Premium financial terminal.
 *   Looks like a $100M project — not a website widget.
 *
 * Behavior:
 *   • Gemini 2.0 Flash generates a daily briefing at first load
 *   • Cached in localStorage (date-keyed) — one API call per day per visitor
 *   • Falls back to live-only briefings if API unavailable
 *   • Scrolls right-to-left like Reuters / Bloomberg Live Feed
 *   • Zero background — floats on whatever surface is beneath it
 */

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const GOLD        = "#D4AF37";
const GOLD_DIM    = "#8a6e1a";
const GOLD_BRIGHT = "#F4CE45";

// ── Only live briefings from Gemini — no fake fallbacks ──────────────────────────────
const FALLBACK_BRIEFINGS = [
  "Live Data Initializing — Briefing feed connecting to Gemini Intelligence Network...",
];

// ── Gemini prompt for daily briefing ───────────────────────────────────
const BRIEFING_PROMPT = `You are Marcus, the intelligence AI of Orakzai Bond ($OKBOND) — a sovereign digital bond on Polygon Network.

Generate a single, flowing financial news ticker line for OKBOND. It must:
- Sound like a Bloomberg or Reuters terminal feed
- Be one continuous sentence, ~80-120 words
- Tone: institutional, confident, sovereign — NOT promotional or casual
- Do NOT use bullet points, line breaks, or markdown
- Do NOT start with "Marcus" or any name
- Do NOT include fake numbers or speculative data
- Just output the ticker text directly`;

const CACHE_KEY = "okbond_briefing_";

function getTodayKey() {
  return CACHE_KEY + new Date().toISOString().slice(0, 10);
}

function getRandomFallback() {
  return FALLBACK_BRIEFINGS[0]; // Only live briefing state
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

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || getRandomFallback();
        localStorage.setItem(todayKey, text);
        setBriefing(text);
      } catch {
        setBriefing(getRandomFallback());
      } finally {
        setLoading(false);
      }
    };

    fetchBriefing();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-3 md:py-2.5"
      style={{
        borderTop: `1px solid ${GOLD}15`,
        borderBottom: `1px solid ${GOLD}15`,
        background: "transparent",
      }}
    >
      {/* Edge fade — left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #050505, transparent)" }}
      />
      {/* Edge fade — right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #050505, transparent)" }}
      />

      {/* Ticker container */}
      <div className="flex items-center justify-between px-4 md:px-6 gap-6 relative z-0">
        {/* UTC Clock (hidden on mobile) */}
        <div className="flex-shrink-0">
          <UtcClock />
        </div>

        {/* Scrolling briefing text */}
        <motion.div
          className="flex-1 overflow-hidden"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: briefing ? 45 : 20, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          <span
            className="inline-block whitespace-nowrap text-sm md:text-base font-mono px-8"
            style={{ color: GOLD }}
          >
            {loading ? "Initializing..." : briefing || getRandomFallback()}
          </span>
        </motion.div>

        {/* Status indicator */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: loading ? "#f59e0b" : "#22c55e",
              animation: loading ? "pulse 2s infinite" : "none",
            }}
          />
          <span className="text-[10px] font-mono hidden sm:inline" style={{ color: GOLD_DIM }}>
            {loading ? "CONNECTING" : "LIVE"}
          </span>
        </div>
      </div>
    </div>
  );
}
