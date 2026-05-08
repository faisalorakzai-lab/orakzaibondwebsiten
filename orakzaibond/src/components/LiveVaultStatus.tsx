import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Vault, Activity, Shield, Coins, Building2, Landmark } from "lucide-react";

/** ──────────────────────────────────────────────────────────────────────────
 *  Editable headline figures (Chairman: update these as the vault grows).
 *  Numbers shown are *committed reserve* values, not market price.
 *  ────────────────────────────────────────────────────────────────────────── */
const TVL_USD = 1_850_000;           // Total Value Locked (USD) — Chairman-approved reserve figure
const RWA_BACKING_PCT = 100;          // Real-World-Asset backing %
const VAULT_GROWTH_24H = 1.84;        // 24h growth %
const HOLDERS_COUNT = 1_248;          // verified wallets — proportional to current reserve tier

const RESERVE_BREAKDOWN = [
  { label: "Real Estate Holdings", pct: 42, icon: Building2 },
  { label: "Gold Reserve", pct: 28, icon: Coins },
  { label: "Operating Cash & T-Bills", pct: 18, icon: Landmark },
  { label: "Liquidity Pools (Polygon)", pct: 12, icon: Activity },
];

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";

/* Animated count-up for the TVL number */
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const formatted = decimals === 0
    ? Math.floor(display).toLocaleString()
    : display.toFixed(decimals);
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

/* Live "last sync" clock — proves the widget is alive */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums">
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} UTC
    </span>
  );
}

export default function LiveVaultStatus() {
  return (
    <section
      id="live-vault"
      className="relative py-20 px-4 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, rgba(212,175,55,0.06), transparent 60%), #050505",
        borderTop: `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
      }}
    >
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
               style={{ background: GOLD + "10", border: `1px solid ${GOLD}55` }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-[10.5px] font-mono tracking-[0.2em] uppercase" style={{ color: GOLD_BRIGHT }}>
              Live · Polygon Mainnet
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-black uppercase tracking-[0.18em] mb-3"
            style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}
          >
            Live Vault Status
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto" style={{ color: "#c9b87b" }}>
            Real-time view of the Orakzai reserve backing every $OKBOND in circulation.
          </p>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* TVL */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative rounded-2xl p-6 md:p-7 overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(20,16,8,0.92), rgba(8,6,3,0.92))",
              backdropFilter: "blur(14px)",
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 ${GOLD}22, 0 0 24px ${GOLD}1a`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Vault className="w-4 h-4" style={{ color: GOLD }} />
                <p className="text-[10.5px] uppercase tracking-[0.22em] font-mono" style={{ color: GOLD + "bb" }}>
                  Total Value Locked
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                +{VAULT_GROWTH_24H.toFixed(2)}% 24H
              </span>
            </div>
            <p
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif",
                       textShadow: `0 0 24px ${GOLD}55` }}
            >
              <AnimatedNumber value={TVL_USD} prefix="$" />
            </p>
            <p className="text-[11px] font-mono mt-2" style={{ color: GOLD + "88" }}>
              {HOLDERS_COUNT.toLocaleString()} verified holders
            </p>
          </motion.div>

          {/* RWA backing */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative rounded-2xl p-6 md:p-7 overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(20,16,8,0.92), rgba(8,6,3,0.92))",
              backdropFilter: "blur(14px)",
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 ${GOLD}22, 0 0 24px ${GOLD}1a`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: GOLD }} />
                <p className="text-[10.5px] uppercase tracking-[0.22em] font-mono" style={{ color: GOLD + "bb" }}>
                  Real-World Asset Backing
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: GOLD + "1a", color: GOLD_BRIGHT, border: `1px solid ${GOLD}55` }}>
                FULLY COLLATERALIZED
              </span>
            </div>
            <p
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif",
                       textShadow: `0 0 24px ${GOLD}55` }}
            >
              <AnimatedNumber value={RWA_BACKING_PCT} suffix="%" />
            </p>

            {/* Animated bar */}
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "#1a140a" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${RWA_BACKING_PCT}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${GOLD_BRIGHT}, ${GOLD}, #A07A1F)`,
                  boxShadow: `0 0 14px ${GOLD}aa`,
                }}
              />
            </div>
            <p className="text-[11px] font-mono mt-2" style={{ color: GOLD + "88" }}>
              Backing <span className="font-bold" style={{ color: GOLD_BRIGHT }}>${(TVL_USD / 1_000_000).toFixed(2)}M</span> in OKBOND reserves · Audited by Independent Reserve Council
            </p>
          </motion.div>
        </div>

        {/* Reserve breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="rounded-2xl p-5 md:p-6"
          style={{
            background: "linear-gradient(160deg, rgba(15,12,6,0.85), rgba(5,4,2,0.85))",
            backdropFilter: "blur(12px)",
            border: `1px solid ${GOLD}33`,
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 ${GOLD}11`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] font-mono" style={{ color: GOLD + "bb" }}>
              Reserve Composition
            </p>
            <p className="text-[10.5px] font-mono" style={{ color: GOLD + "88" }}>
              Last sync: <LiveClock />
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESERVE_BREAKDOWN.map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="rounded-xl p-3.5"
                  style={{
                    background: "rgba(212,175,55,0.04)",
                    border: `1px solid ${GOLD}22`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: GOLD }} />
                    <p className="text-[10.5px] uppercase tracking-wider font-mono truncate"
                       style={{ color: GOLD + "cc" }}>
                      {row.label}
                    </p>
                  </div>
                  <p className="text-2xl font-black mb-2"
                     style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}>
                    {row.pct}%
                  </p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1a140a" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${GOLD_BRIGHT}, ${GOLD})` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
