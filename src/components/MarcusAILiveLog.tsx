import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Circle } from "lucide-react";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const NEON_GREEN = "#00ff9c";
const AMBER = "#ffb547";

type Severity = "INFO" | "OPTIMIZE" | "GUARD" | "SCAN" | "EXEC";
const SEV_COLOR: Record<Severity, string> = {
  INFO:     "#9bd1ff",
  OPTIMIZE: GOLD_BRIGHT,
  GUARD:    NEON_GREEN,
  SCAN:     "#c084fc",
  EXEC:     AMBER,
};

interface MarcusEvent {
  sev: Severity;
  msg: string;
}

const EVENTS: MarcusEvent[] = [
  { sev: "SCAN",     msg: "Analyzing global market liquidity across 14 venues..." },
  { sev: "GUARD",    msg: "Capital Protection Protocol active · vault delta within tolerance" },
  { sev: "OPTIMIZE", msg: "Re-balancing reserve weights → real estate +0.42% / liquidity -0.18%" },
  { sev: "SCAN",     msg: "On-chain volatility index: 0.027 · stable regime confirmed" },
  { sev: "EXEC",     msg: "Routing inbound subscription via Polygon zk-bridge · gas-optimized" },
  { sev: "INFO",     msg: "MEV-shield engaged · sandwich risk neutralized for last 3 swaps" },
  { sev: "GUARD",    msg: "RWA collateral attestation refreshed · 100% backing verified" },
  { sev: "OPTIMIZE", msg: "Yield-curve model updated · projected APR band 9.4% – 11.2%" },
  { sev: "SCAN",     msg: "Sentiment crawl across 11 sources · investor-confidence score 92/100" },
  { sev: "EXEC",     msg: "Treasury rotation queued · executing under sovereign guarantee" },
  { sev: "INFO",     msg: "Smart-contract heartbeat OK · governance multisig 4/5 quorum healthy" },
  { sev: "GUARD",    msg: "Anti-whale circuit-breaker armed · max single-tx threshold enforced" },
  { sev: "OPTIMIZE", msg: "Compounding loop tightened · holder rewards delta +0.06%" },
  { sev: "SCAN",     msg: "Cross-chain oracle feed verified · price deviation 0.0009%" },
  { sev: "EXEC",     msg: "Auto-snapshot taken · ledger entry sealed at block 71,402,118" },
  { sev: "INFO",     msg: "Marcus AI v3.2.1 · 1,284 cycles completed in last hour · 0 anomalies" },
];

function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

interface LogLine {
  id: number;
  time: string;
  sev: Severity;
  msg: string;
}

export default function MarcusAILiveLog() {
  const [lines, setLines] = useState<LogLine[]>(() => {
    // Seed with a few past entries so the terminal isn't empty on mount
    const now = Date.now();
    return [0, 1, 2, 3].map((i) => {
      const ev = EVENTS[i % EVENTS.length];
      return {
        id: now - (4 - i) * 1000,
        time: fmtTime(new Date(now - (4 - i) * 4200)),
        sev: ev.sev,
        msg: ev.msg,
      };
    });
  });
  const idxRef = useRef(4);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const ev = EVENTS[idxRef.current % EVENTS.length];
      idxRef.current += 1;
      setLines((prev) => {
        const next = [...prev, { id: Date.now(), time: fmtTime(new Date()), sev: ev.sev, msg: ev.msg }];
        return next.length > 14 ? next.slice(next.length - 14) : next;
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll terminal to bottom on new line
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <section
      className="relative py-20 px-4 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at bottom, rgba(212,175,55,0.05), transparent 60%), #050505",
        borderTop: `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
      }}
    >
      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
               style={{ background: GOLD + "10", border: `1px solid ${GOLD}55` }}>
            <Cpu className="w-3 h-3" style={{ color: GOLD_BRIGHT }} />
            <span className="text-[10.5px] font-mono tracking-[0.2em] uppercase" style={{ color: GOLD_BRIGHT }}>
              Marcus AI · OKBOND Intelligence Layer
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-black uppercase tracking-[0.18em] mb-3"
            style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}
          >
            Live Optimization Log
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto" style={{ color: "#c9b87b" }}>
            A live window into the autonomous protocol that protects, balances, and grows the OKBOND vault — every second, every cycle.
          </p>
        </div>

        {/* Terminal frame */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(12,10,5,0.95), rgba(4,3,2,0.95))",
            border: `1px solid ${GOLD}55`,
            boxShadow: `0 18px 60px rgba(0,0,0,0.7), inset 0 1px 0 ${GOLD}22, 0 0 30px ${GOLD}1f`,
          }}
        >
          {/* Title-bar */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              background: "linear-gradient(180deg, #15110a, #0a0805)",
              borderBottom: `1px solid ${GOLD}33`,
            }}
          >
            <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500" />
            <Circle className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
            <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
            <p className="ml-3 text-[11px] font-mono tracking-wider" style={{ color: GOLD + "cc" }}>
              marcus-ai@orakzai-vault: ~/optimizer
            </p>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: NEON_GREEN }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: NEON_GREEN }} />
              </span>
              <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: NEON_GREEN }}>
                LIVE
              </p>
            </div>
          </div>

          {/* Scanline overlay */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(180deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 3px)",
              }}
            />
            {/* Log body */}
            <div
              ref={scrollRef}
              className="px-4 py-4 font-mono text-[12.5px] leading-relaxed"
              style={{
                height: 320,
                overflowY: "auto",
                color: "#cdbf85",
                background: "#040302",
              }}
            >
              {lines.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2 mb-1.5"
                >
                  <span style={{ color: GOLD + "88" }}>[{l.time}]</span>
                  <span
                    className="px-1.5 rounded text-[10.5px] font-bold tracking-wider self-start mt-[2px]"
                    style={{
                      color: SEV_COLOR[l.sev],
                      background: SEV_COLOR[l.sev] + "1a",
                      border: `1px solid ${SEV_COLOR[l.sev]}55`,
                    }}
                  >
                    {l.sev}
                  </span>
                  <span style={{ color: "#e8d9a3" }}>{l.msg}</span>
                </motion.div>
              ))}
              {/* Blinking cursor prompt */}
              <div className="flex items-center gap-2 mt-1">
                <span style={{ color: GOLD }}>marcus@vault:~$</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ color: GOLD_BRIGHT, fontWeight: 700 }}
                >
                  ▌
                </motion.span>
              </div>
            </div>
          </div>

          {/* Status footer */}
          <div
            className="flex items-center justify-between px-4 py-2 text-[10px] font-mono"
            style={{
              borderTop: `1px solid ${GOLD}22`,
              background: "#0a0805",
              color: GOLD + "99",
            }}
          >
            <span>UPTIME: 99.997%</span>
            <span>CYCLES/MIN: 24</span>
            <span>LATENCY: 38 ms</span>
            <span style={{ color: NEON_GREEN }}>STATUS: NOMINAL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
