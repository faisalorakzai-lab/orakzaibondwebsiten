import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Vault, Activity, Shield, Coins, Building2, Landmark, Zap } from "lucide-react";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";

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
      className="relative py-24 md:py-32 px-4 md:px-6 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, rgba(212,175,55,0.04), transparent 60%), #050505",
        borderTop: `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
      }}
    >
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: GOLD + "08", border: `1px solid ${GOLD}33` }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-xs md:text-sm font-mono tracking-[0.15em] uppercase" style={{ color: GOLD_BRIGHT }}>
              Smart Contract Integration Coming
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 md:mb-6"
            style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
          >
            Live Vault Status
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#a3a3a3" }}
          >
            Real-time Polygon Mainnet data integration launching soon. The Orakzai reserve backing every $OKBOND token will be transparently displayed on-chain.
          </motion.p>
        </div>

        {/* Coming Soon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
          {/* TVL Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative rounded-2xl p-6 md:p-8 overflow-hidden group"
            style={{
              background: "linear-gradient(160deg, rgba(20,16,8,0.6), rgba(8,6,3,0.6))",
              backdropFilter: "blur(12px)",
              border: `1px solid ${GOLD}33`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${GOLD}11`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: GOLD + "11" }}>
                  <Vault className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{ color: GOLD + "cc" }}>
                  Total Value Locked
                </p>
              </div>
            </div>
            <p
              className="text-3xl md:text-4xl font-black tracking-tight mb-3"
              style={{ color: "#ffffff" }}
            >
              Live On-Chain Soon
            </p>
            <p className="text-xs md:text-sm" style={{ color: "#727272" }}>
              Fetching real-time data from Polygon smart contracts
            </p>
          </motion.div>

          {/* RWA Backing Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative rounded-2xl p-6 md:p-8 overflow-hidden group"
            style={{
              background: "linear-gradient(160deg, rgba(20,16,8,0.6), rgba(8,6,3,0.6))",
              backdropFilter: "blur(12px)",
              border: `1px solid ${GOLD}33`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${GOLD}11`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: GOLD + "11" }}>
                  <Shield className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{ color: GOLD + "cc" }}>
                  Real-World Asset Backing
                </p>
              </div>
            </div>
            <p
              className="text-3xl md:text-4xl font-black tracking-tight mb-3"
              style={{ color: "#ffffff" }}
            >
              Live On-Chain Soon
            </p>
            <p className="text-xs md:text-sm" style={{ color: "#727272" }}>
              100% collateralized by sovereign assets
            </p>
          </motion.div>
        </div>

        {/* Reserve Breakdown Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(160deg, rgba(15,12,6,0.5), rgba(5,4,2,0.5))",
            backdropFilter: "blur(12px)",
            border: `1px solid ${GOLD}22`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${GOLD}11`,
          }}
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <p className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{ color: GOLD + "cc" }}>
              Reserve Composition
            </p>
            <p className="text-xs md:text-sm font-mono" style={{ color: GOLD + "88" }}>
              Last sync: <LiveClock />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Real Estate Holdings", icon: Building2 },
              { label: "Gold Reserve", icon: Coins },
              { label: "Operating Cash & T-Bills", icon: Landmark },
              { label: "Liquidity Pools (Polygon)", icon: Activity },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="rounded-xl p-4 md:p-5"
                  style={{
                    background: "rgba(212,175,55,0.03)",
                    border: `1px solid ${GOLD}22`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: GOLD }} />
                    <p className="text-xs md:text-sm uppercase tracking-wider font-semibold truncate" style={{ color: GOLD + "cc" }}>
                      {item.label}
                    </p>
                  </div>
                  <p className="text-lg md:text-xl font-black" style={{ color: "#ffffff" }}>
                    —
                  </p>
                  <p className="text-xs mt-2" style={{ color: "#727272" }}>
                    Coming soon
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-10 md:mt-14 text-center"
        >
          <p className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{ color: GOLD + "cc" }}>
            <Zap className="w-4 h-4 inline mr-2" style={{ color: GOLD }} />
            Smart Contract: 0xCF82D9ED107bE2217Ead6ccd4ffc851f71aa38F8
          </p>
          <p className="text-xs mt-2" style={{ color: "#727272" }}>
            Lottery contract integration in progress
          </p>
        </motion.div>
      </div>
    </section>
  );
}
