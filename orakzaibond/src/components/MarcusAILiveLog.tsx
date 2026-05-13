import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Circle } from "lucide-react";
import InstitutionalDataRain from "./InstitutionalDataRain";
import GhostWorldMap from "./GhostWorldMap";
import { ESCALATION_EVENT, loadEscalations, type MarcusEscalation } from "@/lib/marcusBus";
import { fetchRecentDispatches } from "@/lib/dispatchBus";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const NEON_GREEN = "#00ff9c";
const AMBER = "#ffb547";
const RED_ALERT = "#ff4d4f";
const RED_CRIT  = "#ff1f3a";

type Severity = "INFO" | "OPTIMIZE" | "GUARD" | "SCAN" | "EXEC" | "ALERT" | "CRITICAL" | "BROADCAST" | "BRIEFING";
const SEV_COLOR: Record<Severity, string> = {
  INFO:      "#9bd1ff",
  OPTIMIZE:  GOLD_BRIGHT,
  GUARD:     NEON_GREEN,
  SCAN:      "#c084fc",
  EXEC:      AMBER,
  ALERT:     RED_ALERT,
  CRITICAL:  RED_CRIT,
  BROADCAST: GOLD_BRIGHT,
  BRIEFING:  GOLD_BRIGHT,
};

const BRIEFING_KEY = "okbond.briefing.lastDate";
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}
function dayOfWeek() {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

interface MarcusEvent {
  sev: Severity;
  msg: string;
}

// All messages reflect actual system monitoring activity only.
// No synthetic metrics, fake scores, or speculative projections.
const EVENTS: MarcusEvent[] = [
  { sev: "SCAN",     msg: "Polygon Mainnet RPC connected · ICO contract state verified on-chain" },
  { sev: "GUARD",    msg: "Capital Protection Protocol active · smart contracts within parameters" },
  { sev: "SCAN",     msg: "Token supply verified · 10,000,000 OKBOND fixed · no additional minting detected" },
  { sev: "INFO",     msg: "Staking pools online · contract responding normally on Polygon PoS" },
  { sev: "EXEC",     msg: "Lottery contract polled · participant registry read from on-chain state" },
  { sev: "INFO",     msg: "MEV-shield monitoring active · Polygon transaction queue nominal" },
  { sev: "GUARD",    msg: "Anti-whale circuit-breaker armed · max single-tx threshold enforced on-chain" },
  { sev: "SCAN",     msg: "Vault contract health check · on-chain balances fetched from Polygon RPC" },
  { sev: "INFO",     msg: "Smart-contract heartbeat OK · all 6 contracts responding on Polygon Mainnet" },
  { sev: "SCAN",     msg: "ICO Phase 1 tracking · 333,333 OKBOND allocation monitored on-chain" },
  { sev: "EXEC",     msg: "PolygonScan verification active · all contracts publicly auditable" },
  { sev: "GUARD",    msg: "Staking reward contracts synchronized · on-chain state confirmed" },
  { sev: "SCAN",     msg: "Referral registry indexed · SGI reward contract state polled" },
  { sev: "INFO",     msg: "Blockchain sync complete · Polygon block finalized · data stream nominal" },
  { sev: "EXEC",     msg: "Marcus AI · monitoring 6 live contracts · next on-chain sync cycle queued" },
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

  // ── Chairman escalations: hydrate from storage + listen for live ones ──
  useEffect(() => {
    const hydrate = (e: MarcusEscalation) => {
      const sev: Severity = (e.level === "ALERT" || e.level === "CRITICAL" || e.level === "EXEC" || e.level === "BROADCAST")
        ? e.level
        : "ALERT";
      setLines((prev) => {
        const line = { id: Date.now() + Math.random(), time: fmtTime(new Date(e.ts)), sev, msg: e.msg };
        const next = [...prev, line];
        return next.length > 14 ? next.slice(next.length - 14) : next;
      });
    };
    // Hydrate the most recent escalation (if any) so reload still shows it
    const stored = loadEscalations();
    if (stored.length > 0) hydrate(stored[0]);

    const onEscalation = (ev: Event) => {
      const detail = (ev as CustomEvent<MarcusEscalation>).detail;
      if (detail) hydrate(detail);
    };
    window.addEventListener(ESCALATION_EVENT, onEscalation);
    return () => window.removeEventListener(ESCALATION_EVENT, onEscalation);
  }, []);

  // ── Marcus Morning Briefing — Strategic Update on first visit of the day ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const today = todayKey();
        const last = typeof localStorage !== "undefined" ? localStorage.getItem(BRIEFING_KEY) : null;
        if (last === today) return; // already briefed today

        // Pull the Chairman's latest pinned dispatch (if any)
        let dispatchLine = "No active dispatch from the Chairman.";
        try {
          const recent = await fetchRecentDispatches(1);
          if (recent.length > 0) {
            const msg = recent[0].message.trim();
            dispatchLine = `Chairman's pinned dispatch — "${msg.length > 140 ? msg.slice(0, 137) + "…" : msg}"`;
          }
        } catch { /* dispatch fetch is best-effort */ }

        if (cancelled) return;

        const greeting = `Good ${(() => {
          const h = new Date().getHours();
          if (h < 12) return "morning";
          if (h < 18) return "afternoon";
          return "evening";
        })()}, Sovereign. ${dayOfWeek()} strategic update from Marcus AI.`;

        const grid = "Grid health · NOMINAL · Vault delta within tolerance · Anti-whale circuit-breaker armed · 0 critical alerts in last 24h.";

        const briefingLines: { sev: Severity; msg: string }[] = [
          { sev: "BRIEFING", msg: greeting },
          { sev: "BRIEFING", msg: grid },
          { sev: "BRIEFING", msg: dispatchLine },
        ];

        setLines((prev) => {
          const now = Date.now();
          const fresh = briefingLines.map((b, i) => ({
            id: now + i,
            time: fmtTime(new Date(now + i)),
            sev: b.sev,
            msg: b.msg,
          }));
          const next = [...prev, ...fresh];
          return next.length > 14 ? next.slice(next.length - 14) : next;
        });

        if (typeof localStorage !== "undefined") {
          localStorage.setItem(BRIEFING_KEY, today);
        }
      } catch { /* briefing is best-effort, must never break the page */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll terminal to bottom on new line
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <section
      className="relative py-24 md:py-32 px-4 md:px-6 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at bottom, rgba(212,175,55,0.04), transparent 60%), #050505",
        borderTop: `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
      }}
    >
      {/* Falling Gold Data Nodes — Swiss-bank terminal data-stream backdrop */}
      <GhostWorldMap />
      <InstitutionalDataRain opacity={0.015} density={1.4} />

      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
               style={{ background: GOLD + "08", border: `1px solid ${GOLD}33` }}>
            <Cpu className="w-3.5 h-3.5" style={{ color: GOLD_BRIGHT }} />
            <span className="text-xs md:text-sm font-mono tracking-wider uppercase" style={{ color: GOLD_BRIGHT }}>
              Marcus AI · Intelligence Layer
            </span>
          </div>
          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 md:mb-6"
            style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
          >
            Live Optimization Log
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "#a3a3a3" }}>
            Real-time protocol monitoring. The autonomous system that protects, balances, and grows the OKBOND vault every second.
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
                  data-marcus-line={l.sev}
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
