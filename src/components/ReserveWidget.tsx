/**
 * ReserveWidget — Reserve Transparency widget for the SiteSidebar.
 *
 * Surfaces the four backing-asset classes of the OKBOND treasury together
 * with a rotating Orakzai Group holographic seal. Designed to read as
 * institutional collateral disclosure — Swiss-bank statement, not crypto fluff.
 *
 * Two modes:
 *  • compact (sidebar collapsed) — seal only, micro footprint
 *  • full (sidebar expanded / mobile) — seal + asset breakdown + backed badge
 */

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const GOLD       = "#d4af37";
const GOLD_BRIGHT = "#f4ce45";
const GOLD_DEEP  = "#a07a14";

interface BackingAsset {
  label: string;
  pct: number;
  hint: string;
}

const ASSETS: BackingAsset[] = [
  { label: "Real Estate",      pct: 38, hint: "Orakzai Group land bank" },
  { label: "On-Chain Reserve", pct: 27, hint: "Multisig treasury wallet" },
  { label: "Liquidity Pools",  pct: 18, hint: "QuickSwap V3 + Uniswap" },
  { label: "Treasury POL",     pct: 17, hint: "Liquid POL reserves" },
];

export function HolographicSeal({ size = 96 }: { size?: number }) {
  const r = size / 2;
  // Outer text path: a closed circle starting at the top, going clockwise.
  const innerR = r - 6;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow halo */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}25 0%, transparent 70%)`, filter: "blur(8px)" }} />

      {/* Rotating outer ring with circular text */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        className="absolute inset-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          <defs>
            <path id={`reserve-arc-${size}`}
              d={`M ${r},${r - innerR + 3} a ${innerR - 3},${innerR - 3} 0 1,1 -0.01,0`}
              fill="none" />
            <linearGradient id={`gold-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stopColor={GOLD_BRIGHT} />
              <stop offset="50%" stopColor={GOLD} />
              <stop offset="100%" stopColor={GOLD_DEEP} />
            </linearGradient>
            <radialGradient id={`core-grad-${size}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%"   stopColor="#1a1408" />
              <stop offset="60%"  stopColor="#0a0805" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>
          {/* Outer gold ring */}
          <circle cx={r} cy={r} r={r - 1} fill="none" stroke={`url(#gold-grad-${size})`} strokeWidth="1" />
          <circle cx={r} cy={r} r={r - 4} fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.55" />
          {/* Rotating circular text */}
          <text fill={GOLD_BRIGHT}
            style={{ fontSize: size * 0.085, fontWeight: 800, letterSpacing: size * 0.025, fontFamily: "ui-monospace, Menlo, monospace" }}>
            <textPath href={`#reserve-arc-${size}`} startOffset="0">
              ORAKZAI GROUP · OKBOND RESERVE · 100% BACKED ·
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Static inner core */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="rounded-full flex items-center justify-center"
          style={{
            width: size * 0.52,
            height: size * 0.52,
            background: `radial-gradient(circle at 35% 30%, ${GOLD_BRIGHT}30, #0a0805 70%)`,
            border: `0.5px solid ${GOLD}aa`,
            boxShadow: `inset 0 0 8px ${GOLD}33, 0 0 12px ${GOLD}33`,
          }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: size * 0.22,
            fontStyle: "italic",
            fontWeight: 800,
            color: GOLD_BRIGHT,
            textShadow: `0 0 6px ${GOLD}88`,
            letterSpacing: -1,
          }}>O</span>
        </div>
      </div>

      {/* Subtle scanning sweep */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${GOLD}22 25deg, transparent 60deg, transparent 360deg)`,
          mask: `radial-gradient(circle, transparent ${innerR - 8}px, black ${innerR - 7}px, black ${r - 1}px, transparent ${r}px)`,
          WebkitMask: `radial-gradient(circle, transparent ${innerR - 8}px, black ${innerR - 7}px, black ${r - 1}px, transparent ${r}px)`,
        }} />
    </div>
  );
}

export default function ReserveWidget({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-2"
        title="Reserve Transparency · 100% Backed">
        <HolographicSeal size={42} />
        <span className="text-[8px] font-extrabold tracking-widest" style={{ color: GOLD }}>100%</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(8,8,15,0.4))",
        border: `0.5px solid ${GOLD}55`,
        boxShadow: `inset 0 1px 0 ${GOLD}22`,
      }}>
      {/* Subtle grain inside the widget */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #d4af37 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 relative">
        <ShieldCheck className="w-3 h-3" style={{ color: GOLD }} />
        <p className="text-[9px] font-extrabold tracking-[0.22em] uppercase" style={{ color: GOLD }}>
          Reserve Transparency
        </p>
      </div>

      {/* Holographic Seal */}
      <div className="flex items-center justify-center mb-3 relative">
        <HolographicSeal size={104} />
      </div>

      {/* Backing Assets */}
      <div className="space-y-1.5 mb-3 relative">
        {ASSETS.map((a) => (
          <div key={a.label} className="group" title={a.hint}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-semibold text-foreground/85 leading-none">{a.label}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: GOLD_BRIGHT }}>{a.pct}%</span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.10)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${a.pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${GOLD_DEEP}, ${GOLD_BRIGHT})`, boxShadow: `0 0 6px ${GOLD}55` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Backed badge */}
      <div className="flex items-center justify-between pt-2 relative" style={{ borderTop: `0.5px solid ${GOLD}33` }}>
        <div className="flex items-center gap-1.5">
          <motion.span className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10b981", boxShadow: "0 0 6px #10b98199" }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }} />
          <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-400">Live</span>
        </div>
        <span className="text-[9px] font-extrabold tracking-widest uppercase" style={{ color: GOLD }}>
          100% Backed
        </span>
      </div>
    </div>
  );
}
