import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Circle, Cpu, Pause, Play, RefreshCw } from "lucide-react";
import { ESCALATION_EVENT, loadEscalations, type MarcusEscalation } from "@/lib/marcusBus";
import { fetchDefenseState, fetchRecentAlerts, type ChairmanAlert, type DefenseState } from "@/lib/marcusDefense";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const NEON_GREEN = "#00ff9c";

type Severity = "INFO" | "GUARD" | "SCAN" | "EXEC" | "WARN" | "ERROR";
const SEV_COLOR: Record<Severity, string> = {
  INFO: "#9bd1ff",
  GUARD: NEON_GREEN,
  SCAN: "#c084fc",
  EXEC: "#ffb547",
  WARN: "#ffb547",
  ERROR: "#ff4d4f",
};

interface LogLine {
  id: string;
  time: string;
  sev: Severity;
  msg: string;
}

interface StatusResponse {
  status?: string;
  model?: string;
}

function formatTime(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "UNKNOWN";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function severityForAlert(alert: ChairmanAlert): Severity {
  if (alert.level === "critical") return "ERROR";
  if (alert.level === "alert") return "WARN";
  return "GUARD";
}

function lineFromAlert(alert: ChairmanAlert): LogLine {
  return {
    id: `alert-${alert.id}`,
    time: formatTime(alert.created_at),
    sev: severityForAlert(alert),
    msg: alert.summary || alert.action_required || `Alert recorded: ${alert.kind}`,
  };
}

function linesFromDefense(state: DefenseState | null): LogLine[] {
  if (!state) return [];
  const lines: LogLine[] = [];
  if (state.last_run_at) {
    lines.push({
      id: `defense-run-${state.last_run_at}`,
      time: formatTime(state.last_run_at),
      sev: "SCAN",
      msg: `Defense state record loaded · last checked block ${state.last_block_checked ?? "UNKNOWN"}`,
    });
  }
  lines.push({
    id: `defense-summary-${state.id}-${state.total_runs}`,
    time: formatTime(state.last_run_at || Date.now()),
    sev: "INFO",
    msg: `Recorded monitoring runs: ${state.total_runs} · recorded alerts: ${state.total_threats_detected}`,
  });
  return lines;
}

function sortLines(lines: LogLine[]): LogLine[] {
  return [...new Map(lines.map((line) => [line.id, line])).values()].slice(-30);
}

export default function MarcusAILiveLog() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSuccess, setLastSuccess] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [connection, setConnection] = useState("UNKNOWN");
  const [source, setSource] = useState("Supabase alerts + Marcus status API");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTelemetry = useCallback(async () => {
    const started = performance.now();
    setLoading(true);
    setError(null);
    try {
      const [alertsResult, defenseResult, statusResult] = await Promise.allSettled([
        fetchRecentAlerts(20),
        fetchDefenseState(),
        fetch("/api/marcus-status", { cache: "no-store" }).then((response) => {
          if (!response.ok) throw new Error(`Status endpoint returned ${response.status}`);
          return response.json() as Promise<StatusResponse>;
        }),
      ]);

      const nextLines: LogLine[] = [];
      if (alertsResult.status === "fulfilled") {
        nextLines.push(...alertsResult.value.map(lineFromAlert));
      }
      if (defenseResult.status === "fulfilled") {
        nextLines.push(...linesFromDefense(defenseResult.value));
      }
      if (statusResult.status === "fulfilled") {
        const status = statusResult.value.status || "UNKNOWN";
        setConnection(status.toUpperCase());
        if (statusResult.value.model) setSource(`Marcus status API · ${statusResult.value.model}`);
      } else {
        setConnection("DATA UNAVAILABLE");
      }

      const successfulSources = [alertsResult, defenseResult, statusResult].filter((result) => result.status === "fulfilled").length;
      if (successfulSources === 0) {
        throw new Error("No monitoring source responded");
      }
      setLines(sortLines(nextLines));
      setLastSuccess(new Date());
      setLatencyMs(Math.round(performance.now() - started));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Monitoring data unavailable");
      setConnection("DATA UNAVAILABLE");
      setSource("No monitoring source responded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTelemetry();
    const interval = window.setInterval(() => {
      if (!paused) void loadTelemetry();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadTelemetry, paused]);

  useEffect(() => {
    const hydrateEscalation = (event: MarcusEscalation) => {
      setLines((previous) => sortLines([...previous, {
        id: `escalation-${event.id}`,
        time: formatTime(event.ts),
        sev: event.level === "CRITICAL" ? "ERROR" : event.level === "ALERT" ? "WARN" : "EXEC",
        msg: event.msg,
      }]));
      setLastSuccess(new Date());
    };
    const stored = loadEscalations();
    if (stored.length > 0) hydrateEscalation(stored[0]);
    const onEscalation = (event: Event) => {
      const detail = (event as CustomEvent<MarcusEscalation>).detail;
      if (detail) hydrateEscalation(detail);
    };
    window.addEventListener(ESCALATION_EVENT, onEscalation);
    return () => window.removeEventListener(ESCALATION_EVENT, onEscalation);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lines]);

  const operational = connection === "LIVE" || connection === "CONFIGURED";

  return (
    <section
      className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28"
      style={{
        background: "radial-gradient(ellipse at bottom, rgba(212,175,55,0.04), transparent 60%), #050505",
        borderTop: `1px solid ${GOLD}22`,
        borderBottom: `1px solid ${GOLD}22`,
      }}
      aria-labelledby="marcus-log-heading"
    >
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ background: GOLD + "08", border: `1px solid ${GOLD}33` }}>
            <Cpu className="h-3.5 w-3.5" style={{ color: GOLD_BRIGHT }} aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider md:text-sm" style={{ color: GOLD_BRIGHT }}>
              Marcus AI · Intelligence Layer
            </span>
          </div>
          <h2 id="marcus-log-heading" className="mb-4 text-3xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Intelligence in Motion
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
            Monitor OKBOND infrastructure, inspect recorded system events, and explore protocol health through the Marcus AI operations interface.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(160deg, rgba(12,10,5,0.95), rgba(4,3,2,0.95))", border: `1px solid ${GOLD}55`, boxShadow: `0 18px 60px rgba(0,0,0,0.7), inset 0 1px 0 ${GOLD}22, 0 0 30px ${GOLD}1f` }}
        >
          <div className="flex min-w-0 items-center gap-2 border-b px-3 py-3 sm:px-4" style={{ background: "linear-gradient(180deg, #15110a, #0a0805)", borderColor: GOLD + "33" }}>
            <Circle className="h-2.5 w-2.5 shrink-0 fill-red-500 text-red-500" aria-hidden="true" />
            <Circle className="h-2.5 w-2.5 shrink-0 fill-yellow-500 text-yellow-500" aria-hidden="true" />
            <Circle className="h-2.5 w-2.5 shrink-0 fill-green-500 text-green-500" aria-hidden="true" />
            <p className="ml-1 min-w-0 truncate font-mono text-[10px] tracking-wider text-[#D4AF37cc] sm:ml-3 sm:text-[11px]">marcus-ai@orakzai-vault: ~/monitor</p>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${operational ? "animate-pulse" : "bg-amber-400"}`} style={operational ? { background: NEON_GREEN } : undefined} />
              <span className="font-mono text-[9px] uppercase tracking-wider sm:text-[10px]" style={{ color: operational ? NEON_GREEN : "#ffb547" }}>{connection}</span>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 3px)" }} />
            <div ref={scrollRef} className="h-[320px] max-h-[48vh] overflow-x-hidden overflow-y-auto px-3 py-4 font-mono text-[11px] leading-6 sm:px-4 sm:text-[12.5px]" style={{ color: "#cdbf85", background: "#040302" }} aria-live="polite">
              {loading && lines.length === 0 && <p className="text-[#D4AF3788]">[--:--:--] INFO  Loading recorded monitoring data…</p>}
              {!loading && lines.length === 0 && <p className="text-[#ffb547]">[--:--:--] WARN  DATA UNAVAILABLE · no recorded events returned</p>}
              {lines.map((line) => (
                <motion.div key={line.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="mb-1.5 flex min-w-0 items-start gap-2">
                  <span className="shrink-0 whitespace-nowrap tabular-nums" style={{ color: GOLD + "88" }}>[{line.time}]</span>
                  <span className="shrink-0 whitespace-nowrap rounded px-1.5 text-[9px] font-bold tracking-wider sm:text-[10.5px]" style={{ color: SEV_COLOR[line.sev], background: SEV_COLOR[line.sev] + "1a", border: `1px solid ${SEV_COLOR[line.sev]}55` }}>{line.sev}</span>
                  <span className="min-w-0 break-words" style={{ color: "#e8d9a3" }}>{line.msg}</span>
                </motion.div>
              ))}
              <div className="mt-2 flex items-center gap-2 text-[#D4AF37]" aria-hidden="true"><span>marcus@vault:~$</span><span className="animate-pulse font-bold text-[#F4CE45]">▌</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t px-3 py-3 font-mono text-[9px] uppercase tracking-wider text-[#D4AF3799] sm:grid-cols-4 sm:px-4 sm:text-[10px]" style={{ borderColor: GOLD + "22", background: "#0a0805" }}>
            <span>STATE: {connection}</span>
            <span>LAST CHECK: {lastSuccess ? formatTime(lastSuccess) : "UNKNOWN"}</span>
            <span>LATENCY: {latencyMs == null ? "UNKNOWN" : `${latencyMs} ms`}</span>
            <span className="text-right sm:text-left">MODE: {paused ? "PAUSED" : "POLLING"}</span>
          </div>
        </motion.div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-neutral-500 sm:text-xs">
          <span className="min-w-0 break-words">Source: {source}{error ? ` · ${error}` : ""}</span>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setPaused((value) => !value)} className="inline-flex items-center gap-1.5 rounded-md border border-[#D4AF3744] px-2.5 py-1.5 text-[#D4AF37] transition hover:bg-[#D4AF3712]" aria-pressed={paused}>
              {paused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
              {paused ? "Resume updates" : "Pause updates"}
            </button>
            <button type="button" onClick={() => void loadTelemetry()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md border border-[#D4AF3744] px-2.5 py-1.5 text-[#D4AF37] transition hover:bg-[#D4AF3712] disabled:opacity-50" aria-label="Refresh monitoring data">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
            </button>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 px-1 text-[10px] leading-5 text-neutral-600"><Activity className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />This console displays recorded monitoring responses; it does not autonomously control assets.</p>
      </div>
    </section>
  );
}
