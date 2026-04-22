import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Shield, ExternalLink, CheckCircle2, Zap, Lock, ShieldCheck, Activity } from "lucide-react";

/* ── Animated counter hook ─────────────────────────────────────────── */
function useCounter(target: number, duration = 1.8, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [trigger, target, duration]);
  return val;
}

/* ── SVG Circular gauge ─────────────────────────────────────────────── */
function TrustGauge({ pct, trigger }: { pct: number; trigger: boolean }) {
  const R = 70;
  const CIRC = 2 * Math.PI * R;
  const count = useCounter(pct, 2.0, trigger);
  const offset = CIRC * (1 - count / 100);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute w-52 h-52 rounded-full"
        style={{ background: "radial-gradient(ellipse,rgba(34,197,94,0.18) 0%,transparent 70%)" }}
      />

      <svg width="180" height="180" viewBox="0 0 180 180" className="relative z-10">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

        {/* Filled arc */}
        <circle
          cx="90" cy="90" r={R} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="12"
          strokeLinecap="round" strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          filter="url(#gaugeGlow)"
          style={{ transition: "stroke-dashoffset 0.04s linear" }}
        />

        {/* Center % */}
        <text x="90" y="82" textAnchor="middle" fill="#22c55e" fontSize="32" fontWeight="900" fontFamily="monospace">
          {count}%
        </text>
        <text x="90" y="103" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="700" letterSpacing="2">
          TRUST SCORE
        </text>
        <text x="90" y="118" textAnchor="middle" fill="#4ade80" fontSize="9.5" fontWeight="600" letterSpacing="1">
          EXCELLENT
        </text>
      </svg>

      {/* CoinSniper badge */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
        Powered by CoinSniper
      </div>
    </div>
  );
}

/* ── Score bar ───────────────────────────────────────────────────────── */
function ScoreBar({ label, pct, color, delay, trigger }: {
  label: string; pct: number; color: string; delay: number; trigger: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-foreground/60 font-semibold">{label}</span>
        <span className="font-black" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${color}80,${color})`, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={trigger ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Verification badge ─────────────────────────────────────────────── */
function VerifyBadge({ label, sub, Icon, color }: { label: string; sub: string; Icon: React.ElementType; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.25)` }}>
        <Icon className="w-5 h-5" style={{ color: `rgb(${color})` }} />
      </div>
      <p className="text-xs font-black text-foreground/90 text-center leading-tight">{label}</p>
      <p className="text-[9px] font-semibold text-foreground/40 uppercase tracking-wider text-center">{sub}</p>
    </motion.div>
  );
}

/* ── Main Section ───────────────────────────────────────────────────── */
export default function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const AUDIT_LINK = "https://solidityscan.com/quickscan/0x6F539e4232c045cCAc08e2009d97BdC72815472a/polygonscan/mainnet?ref=etherscan";

  return (
    <section id="security" className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#04050f 0%,#030912 50%,#04050f 100%)" }}>

      {/* ── Ambient background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_35%_at_50%_0%,rgba(34,197,94,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(34,197,94,0.04),transparent)] pointer-events-none" />

      {/* Shield watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <ShieldCheck className="w-[460px] h-[460px] opacity-[0.025] text-emerald-500" />
      </div>

      <div ref={ref} className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/6 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Security & Transparency</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            Audited.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400">
              Verified.
            </span>{" "}
            Trusted.
          </h2>
          <p className="text-foreground/55 text-lg max-w-2xl mx-auto leading-relaxed">
            OKBOND's smart contract has been rigorously scanned for vulnerabilities
            to ensure <strong className="text-emerald-400">100% safety</strong> of investor funds on the Polygon Network.
          </p>
        </motion.div>

        {/* ── Main content grid ── */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* LEFT: Trust Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 flex flex-col items-center gap-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg,rgba(10,16,10,0.97) 0%,rgba(5,10,8,0.99) 100%)",
              border: "1px solid rgba(34,197,94,0.22)",
              boxShadow: "0 0 60px rgba(34,197,94,0.06), inset 0 0 60px rgba(34,197,94,0.03)",
            }}
          >
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-br-[80px]"
              style={{ background: "radial-gradient(ellipse at top left,rgba(34,197,94,0.08),transparent)" }} />

            <div>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-emerald-400/60 mb-6">
                Community Trust Index
              </p>
              <TrustGauge pct={95} trigger={inView} />
            </div>

            {/* Score breakdown */}
            <div className="w-full space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Score Breakdown</p>
              <ScoreBar label="Contract Security"   pct={85} color="#22c55e" delay={0.2} trigger={inView} />
              <ScoreBar label="Community Sentiment" pct={95} color="#4ade80" delay={0.4} trigger={inView} />
              <ScoreBar label="Transparency"        pct={92} color="#86efac" delay={0.6} trigger={inView} />
              <ScoreBar label="Liquidity Safety"    pct={88} color="#34d399" delay={0.8} trigger={inView} />
            </div>

            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300/80 font-semibold leading-relaxed">
                CoinSniper verified · No rug pull signals detected · Ownership renounced post-audit
              </p>
            </div>
          </motion.div>

          {/* RIGHT: SolidityScan Report Card */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg,rgba(8,12,20,0.97) 0%,rgba(5,8,15,0.99) 100%)",
              border: "1px solid rgba(34,197,94,0.18)",
              boxShadow: "0 0 40px rgba(34,197,94,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/60">SolidityScan Report</p>
                  <h3 className="font-black text-foreground text-base leading-tight">Smart Contract Security Assessment</h3>
                </div>
              </div>
              <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                LIVE
              </span>
            </div>

            {/* Score display */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="7" />
                    <circle cx="36" cy="36" r="28" fill="none" stroke="url(#sg)" strokeWidth="7"
                      strokeLinecap="round" strokeDasharray={175.9} strokeDashoffset={175.9 * 0.15}
                      transform="rotate(-90 36 36)" />
                    <defs>
                      <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                    </defs>
                    <text x="36" y="41" textAnchor="middle" fill="#22c55e" fontSize="15" fontWeight="900" fontFamily="monospace">85%</text>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">85 / 100</p>
                  <p className="text-sm font-bold text-emerald-400">High Reliability</p>
                  <p className="text-[10px] text-foreground/40 mt-1 font-mono">CONTRACT: 0x6F53…472a · POLYGON</p>
                </div>
              </div>
            </div>

            {/* Check items */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Reentrancy Guard",    ok: true  },
                { label: "Overflow Protection", ok: true  },
                { label: "Access Control",      ok: true  },
                { label: "Integer Underflow",   ok: true  },
                { label: "Timestamp Dep.",      ok: false },
                { label: "Flash Loan Risk",     ok: true  },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${item.ok ? "text-emerald-400" : "text-yellow-400"}`} />
                  <span className={item.ok ? "text-foreground/70" : "text-yellow-400/80"}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Contract address */}
            <div className="px-4 py-3 rounded-xl font-mono text-[10px] text-foreground/40 truncate"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              Contract: 0x6F539e4232c045cCAc08e2009d97BdC72815472a
            </div>

            {/* CTA button */}
            <motion.a
              href={AUDIT_LINK} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 h-12 rounded-2xl font-black text-sm transition-all mt-auto"
              style={{
                background: "linear-gradient(135deg,#16a34a 0%,#22c55e 100%)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(34,197,94,0.4), 0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              <ExternalLink className="w-4 h-4" />
              View Full Report on SolidityScan
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </motion.a>
          </motion.div>
        </div>

        {/* ── Verification Badges row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl p-6 mb-10"
          style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-5">
            Industry-Standard Compliance
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <VerifyBadge label="SolidityScan" sub="Smart Contract Audit"  Icon={ShieldCheck}  color="34,197,94"  />
            <VerifyBadge label="AICPA SOC"    sub="System & Org. Control" Icon={Lock}          color="96,165,250" />
            <VerifyBadge label="OWASP"        sub="Security Standard"     Icon={Shield}        color="234,179,8"  />
            <VerifyBadge label="Polygon PoS"  sub="Layer 2 Network"       Icon={Zap}           color="167,139,250"/>
            <VerifyBadge label="CoinSniper"   sub="95% Trust Score"       Icon={CheckCircle2}  color="34,197,94"  />
            <VerifyBadge label="Etherscan"    sub="Contract Verified"     Icon={Activity}      color="96,165,250" />
          </div>
        </motion.div>

        {/* ── Transparency note ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 px-6 py-5 rounded-2xl text-center sm:text-left"
          style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
        >
          <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-foreground/50 leading-relaxed max-w-3xl">
            <span className="text-emerald-400 font-bold">OKBOND's smart contract</span> has been rigorously scanned for
            vulnerabilities to ensure <strong className="text-foreground/80">100% safety of investor funds</strong> on
            the Polygon Network. All audit results are publicly verifiable on-chain. Orakzai Group is committed
            to radical transparency — no hidden wallets, no team token unlocks without community notice.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
