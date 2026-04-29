/**
 * InstitutionalDataRain — "Falling Gold Data Nodes"
 * --------------------------------------------------------------------------
 * A canvas-based background layer of slowly descending gold data tokens
 * (price ticks, hashes, FX pairs, ISO codes) — the visual signature of a
 * Swiss-bank terminal. Designed to sit BEHIND the OKBOND Command Center
 * (the Marcus AI Live Log) at ~1.5% opacity so it never competes with the
 * foreground content.
 *
 * Pure <canvas> — zero DOM nodes per drop, gracefully respects
 * `prefers-reduced-motion`, pauses when off-screen.
 * --------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";

const GLYPHS = [
  // hex tokens
  "0xA1F2", "0xBE7C", "0xD9F0", "0x7C44", "0xFF02", "0x10A8", "0xC3F1",
  // price-tick style
  "+0.0042", "-0.0017", "+0.0091", "-0.0023", "+0.0156", "+0.0008",
  // FX / asset codes
  "USD/CHF", "EUR/JPY", "GBP/USD", "XAU/USD", "BTC/USD", "OKBOND/USD",
  "POL", "ETH", "USDC", "ISO 9362", "SWIFT", "ISIN",
  // OKBOND specific
  "OKBOND", "VAULT", "TVL Δ", "ORAKZAI", "VISION 2100", "OBG",
  // institutional
  "T+1", "L1", "L2", "ZK", "TRADE-EX", "BIS", "SETTLE",
];

interface Drop {
  x: number;
  y: number;
  speed: number;
  size: number;
  text: string;
  alpha: number;
  swap: number;
}

export default function InstitutionalDataRain({
  /** Foreground opacity (default 0.015 = 1.5%) */
  opacity = 0.015,
  /** Drops per 100,000 px² of viewport (controls density) */
  density = 1.4,
}: { opacity?: number; density?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let drops: Drop[] = [];
    let raf = 0;
    let lastT = 0;
    let visible = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? canvas.clientWidth;
      const h = parent?.clientHeight ?? canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.max(
        18,
        Math.min(120, Math.round((w * h) / 100_000 * density * 8))
      );
      drops = Array.from({ length: target }, () => spawn(w, h, true));
    };

    const spawn = (w: number, h: number, initial = false): Drop => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -Math.random() * 80,
      speed: 18 + Math.random() * 38, // px/sec — slow, institutional
      size: 9 + Math.random() * 4,
      text: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      alpha: 0.55 + Math.random() * 0.45,
      swap: Math.random() * 4 + 2, // seconds before glyph swap
    });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || reduced) {
        lastT = t;
        return;
      }
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
      lastT = t;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 11px ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace`;
      ctx.textBaseline = "top";

      for (const d of drops) {
        d.y += d.speed * dt;
        d.swap -= dt;
        if (d.swap <= 0) {
          d.text = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          d.swap = 2 + Math.random() * 3.5;
        }
        if (d.y > h + 24) {
          Object.assign(d, spawn(w, h, false));
        }
        // 24K gold gradient per drop — head bright, tail soft
        ctx.fillStyle = `rgba(252, 246, 186, ${d.alpha})`;
        ctx.fillText(d.text, d.x, d.y);
        ctx.fillStyle = `rgba(191, 149, 63, ${d.alpha * 0.55})`;
        ctx.fillText(d.text, d.x, d.y + 14);
      }
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting;
        },
        { threshold: 0.01 }
      );
      observer.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      observer?.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="institutional-data-rain"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
