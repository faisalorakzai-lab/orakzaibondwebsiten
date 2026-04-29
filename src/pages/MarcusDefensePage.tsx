/**
 * MarcusDefensePage — Chairman-only Auto-Defense Console.
 *
 * Privacy: lives behind AdminGate (registered in App.tsx). Renders <NotFound/>
 * for any wallet other than ADMIN_WALLET.
 *
 * Visual: Imperial Gold prestige treatment — 0.5px true-gold inset border +
 * 1% film-grain SVG noise overlay (mix-blend-overlay). Matches the Command
 * Center finish from the prestige commit.
 *
 * Live data:
 *   • marcus_defense_state (singleton)  — heartbeat & counters
 *   • chairman_alerts                    — pending + recent
 *   • POST /api/marcus-watch             — manual trigger / 60s poll
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Activity, RefreshCw,
  Crown, Crosshair, Radio, Clock, ExternalLink, Zap, Ban, CheckCircle2,
  Loader2, ArrowLeft, Cpu, Eye,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import {
  fetchDefenseState, fetchPendingAlerts, fetchRecentAlerts,
  runWatchNow, acknowledgeAlert,
  type DefenseState, type ChairmanAlert, type ChairmanCommand,
} from "@/lib/marcusDefense";
import { pushEscalation } from "@/lib/marcusBus";

const ADMIN_WALLET = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";
const TRUE_GOLD = "#D4AF37";
const POLL_MS = 60_000;

/* 1% film-grain SVG (data-uri). Same noise primitive as the AdminPage finish. */
const FILM_GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.83 0 0 0 0 0.69 0 0 0 0 0.22 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/></svg>")`;

function fmtAgo(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(0, Math.floor(ms / 1000))}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function shorten(addr: string | null | undefined): string {
  if (!addr) return "?";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const LEVEL_STYLE: Record<ChairmanAlert["level"], { fg: string; bg: string; border: string; label: string; }> = {
  watch:    { fg: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.30)",  label: "WATCH" },
  alert:    { fg: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.30)", label: "ALERT" },
  critical: { fg: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.40)",  label: "CRITICAL" },
};

export default function MarcusDefensePage() {
  const { address } = useWallet();
  const isAdmin = !!(address && address.toLowerCase() === ADMIN_WALLET.toLowerCase());

  const [state, setState] = useState<DefenseState | null>(null);
  const [pending, setPending] = useState<ChairmanAlert[]>([]);
  const [recent, setRecent] = useState<ChairmanAlert[]>([]);
  const [running, setRunning] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [killTarget, setKillTarget] = useState<ChairmanAlert | null>(null);
  const pollRef = useRef<number | null>(null);

  /* ── Loaders ──────────────────────────────────────────────────────────── */
  const refreshAll = useCallback(async () => {
    try {
      const [s, p, r] = await Promise.all([
        fetchDefenseState(),
        fetchPendingAlerts(),
        fetchRecentAlerts(20),
      ]);
      setState(s);
      setPending(p);
      setRecent(r);
      setLastError(null);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const triggerWatch = useCallback(async () => {
    setRunning(true);
    setLastError(null);
    try {
      const res = await runWatchNow();
      if (!res.ok) throw new Error(res.error || "Marcus watcher failed.");
    } catch (e) {
      setLastError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
      await refreshAll();
    }
  }, [refreshAll]);

  /* ── Initial load + polling ──────────────────────────────────────────── */
  useEffect(() => {
    void refreshAll();
    pollRef.current = window.setInterval(() => {
      // Lightweight refresh on a cadence; the full watch only fires on click
      // or via the Vercel cron, to avoid burning RPC calls.
      void refreshAll();
    }, POLL_MS);
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
    };
  }, [refreshAll]);

  /* ── Kill-switch confirmation flow ───────────────────────────────────── */
  const confirmCommand = useCallback(
    async (alert: ChairmanAlert, command: ChairmanCommand) => {
      if (!address) return;
      setBusyId(alert.id);
      try {
        await acknowledgeAlert(alert.id, address, command);
        // Echo into the existing Marcus escalation bus so the homepage live log
        // reflects the Chairman's command in real-time.
        pushEscalation({
          level: command === "CONFIRM_KILL_SWITCH" ? "CRITICAL" : "EXEC",
          msg:
            command === "CONFIRM_KILL_SWITCH"
              ? `Chairman authorized KILL-SWITCH on ${alert.kind.replace("_", " ")}: ${alert.summary}`
              : `Chairman issued STAND-DOWN on ${alert.kind.replace("_", " ")}: ${alert.summary}`,
          source: "manual",
          meta: { alertId: alert.id, kind: alert.kind, command },
        });
        setKillTarget(null);
        await refreshAll();
      } catch (e) {
        setLastError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusyId(null);
      }
    },
    [address, refreshAll],
  );

  const sentryStatus = useMemo<{ fg: string; label: string; icon: React.ReactNode }>(() => {
    if (pending.length === 0) {
      return { fg: "#10b981", label: "ALL CLEAR", icon: <ShieldCheck className="w-4 h-4" /> };
    }
    if (pending.some((a) => a.level === "critical")) {
      return { fg: "#ef4444", label: "CRITICAL — CHAIRMAN ACTION REQUIRED", icon: <ShieldAlert className="w-4 h-4" /> };
    }
    return { fg: "#f97316", label: "ALERT — CHAIRMAN ACTION REQUIRED", icon: <ShieldAlert className="w-4 h-4" /> };
  }, [pending]);

  if (!isAdmin) {
    // Failsafe — AdminGate should have already short-circuited.
    return (
      <div className="min-h-screen bg-black text-zinc-200 flex items-center justify-center">
        <p className="text-sm opacity-70">Restricted.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-zinc-200 relative"
      style={{
        boxShadow: `inset 0 0 0 0.5px ${TRUE_GOLD}`,
      }}
    >
      {/* 1% film-grain overlay (mix-blend-overlay) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          backgroundImage: FILM_GRAIN,
          opacity: 0.01,
          mixBlendMode: "overlay",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-[var(--gold)] transition"
            style={{ ["--gold" as any]: TRUE_GOLD }}
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Command Center
          </Link>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Crown className="w-3 h-3" style={{ color: TRUE_GOLD }} />
            Chairman Orakzai
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6" style={{ color: TRUE_GOLD }} />
            <h1
              className="text-3xl font-light tracking-wide"
              style={{ fontFamily: "Playfair Display, serif", color: TRUE_GOLD }}
            >
              Marcus Auto-Defense Layer
            </h1>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            24/7 sentry over OKBOND whale movements (≥ 0.1% supply) and contract
            ownership integrity. Marcus reports — the Chairman commands. No
            automated halts.
          </p>
        </div>

        {/* ── Top status row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <StatusCard
            label="Sentry Status"
            value={sentryStatus.label}
            icon={sentryStatus.icon}
            accent={sentryStatus.fg}
          />
          <StatusCard
            label="Last Sweep"
            value={fmtAgo(state?.last_run_at ?? null)}
            icon={<Clock className="w-4 h-4" />}
            accent={TRUE_GOLD}
          />
          <StatusCard
            label="Pending Alerts"
            value={`${pending.length}`}
            icon={<AlertTriangle className="w-4 h-4" />}
            accent={pending.length > 0 ? "#ef4444" : "#10b981"}
          />
          <StatusCard
            label="Total Threats Logged"
            value={`${state?.total_threats_detected ?? 0}`}
            icon={<Activity className="w-4 h-4" />}
            accent={TRUE_GOLD}
          />
        </div>

        {/* ── Heartbeat bar ──────────────────────────────────────────── */}
        <div
          className="mb-6 px-4 py-3 rounded border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
          style={{
            borderColor: "rgba(212,175,55,0.18)",
            background: "rgba(212,175,55,0.03)",
          }}
        >
          <span className="flex items-center gap-2 text-zinc-300">
            <Cpu className="w-3 h-3" style={{ color: TRUE_GOLD }} />
            Block scanned: <strong className="text-white">{state?.last_block_checked ?? "—"}</strong>
          </span>
          <span className="flex items-center gap-2 text-zinc-300">
            <Eye className="w-3 h-3" style={{ color: TRUE_GOLD }} />
            Lottery owner of record:{" "}
            <strong className="text-white font-mono">{shorten(state?.last_known_owner)}</strong>
          </span>
          <span className="flex items-center gap-2 text-zinc-300">
            <Radio className="w-3 h-3" style={{ color: TRUE_GOLD }} />
            Total runs: <strong className="text-white">{state?.total_runs ?? 0}</strong>
          </span>
          <button
            onClick={triggerWatch}
            disabled={running}
            className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium transition disabled:opacity-50"
            style={{
              borderColor: TRUE_GOLD,
              color: TRUE_GOLD,
              background: "rgba(212,175,55,0.06)",
            }}
            data-testid="button-run-marcus-now"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {running ? "Sweeping…" : "Run Marcus Sweep Now"}
          </button>
        </div>

        {lastError && (
          <div className="mb-6 px-4 py-3 rounded border border-red-500/40 bg-red-500/10 text-xs text-red-200">
            {lastError}
          </div>
        )}

        {/* ── Pending Chairman Alerts ────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm uppercase tracking-[0.2em]"
              style={{ color: TRUE_GOLD, fontFamily: "Playfair Display, serif" }}
            >
              Pending Chairman Action
            </h2>
            <span className="text-xs text-zinc-500">
              {pending.length} item{pending.length === 1 ? "" : "s"} awaiting decision
            </span>
          </div>

          {pending.length === 0 ? (
            <div
              className="rounded border px-6 py-10 text-center"
              style={{
                borderColor: "rgba(16,185,129,0.20)",
                background: "rgba(16,185,129,0.04)",
              }}
            >
              <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "#10b981" }} />
              <p className="text-sm text-emerald-200">
                Marcus reports the perimeter is clean. No action required.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Reserve held at <strong className="text-white">$1,850,000</strong>. Sentry continues 24/7.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {pending.map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded border px-4 py-3"
                    style={{
                      borderColor: LEVEL_STYLE[a.level].border,
                      background: LEVEL_STYLE[a.level].bg,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded"
                            style={{
                              color: LEVEL_STYLE[a.level].fg,
                              background: LEVEL_STYLE[a.level].bg,
                              border: `1px solid ${LEVEL_STYLE[a.level].border}`,
                            }}
                          >
                            {LEVEL_STYLE[a.level].label}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                            {a.kind.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-zinc-500 ml-auto">
                            {fmtAgo(a.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-100 leading-relaxed">{a.summary}</p>
                        {a.kind === "whale_transfer" && a.detail && (a.detail as any).hash && (
                          <a
                            href={`https://polygonscan.com/tx/${(a.detail as any).hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] mt-1"
                            style={{ color: TRUE_GOLD }}
                          >
                            View tx <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setKillTarget(a)}
                          disabled={busyId === a.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition disabled:opacity-50"
                          style={{
                            background: "#ef4444",
                            color: "white",
                          }}
                          data-testid={`button-kill-switch-${a.id}`}
                        >
                          <Ban className="w-3 h-3" />
                          Kill Switch
                        </button>
                        <button
                          onClick={() => confirmCommand(a, "STAND_DOWN")}
                          disabled={busyId === a.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs transition disabled:opacity-50"
                          style={{
                            borderColor: "rgba(212,175,55,0.4)",
                            color: TRUE_GOLD,
                          }}
                          data-testid={`button-stand-down-${a.id}`}
                        >
                          {busyId === a.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Stand Down
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── Recent log ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm uppercase tracking-[0.2em]"
              style={{ color: TRUE_GOLD, fontFamily: "Playfair Display, serif" }}
            >
              Sentry Log — Recent
            </h2>
            <Link
              href="/threat-console"
              className="text-xs text-zinc-400 hover:text-[var(--gold)] inline-flex items-center gap-1 transition"
              style={{ ["--gold" as any]: TRUE_GOLD }}
            >
              <Crosshair className="w-3 h-3" />
              Open full Threat Console
            </Link>
          </div>

          <div className="rounded border" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
            {recent.length === 0 ? (
              <p className="px-4 py-6 text-xs text-zinc-500 text-center">
                Marcus has not recorded any events yet. Run a sweep to begin.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800/60">
                {recent.map((a) => (
                  <li key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: LEVEL_STYLE[a.level].fg }}
                    />
                    <span className="text-zinc-300 truncate flex-1">{a.summary}</span>
                    {a.acknowledged_at ? (
                      <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          color:
                            a.chairman_command === "CONFIRM_KILL_SWITCH" ? "#ef4444" : "#10b981",
                          background:
                            a.chairman_command === "CONFIRM_KILL_SWITCH"
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(16,185,129,0.1)",
                        }}
                      >
                        {a.chairman_command === "CONFIRM_KILL_SWITCH"
                          ? "Kill Switch"
                          : "Stood Down"}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-amber-300/80">
                        Pending
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {fmtAgo(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="text-[10px] text-zinc-600 text-center mt-8 max-w-xl mx-auto leading-relaxed">
          Marcus operates under the OSG Sovereign Doctrine: detect, broadcast,
          report — never halt. The kill-switch is a Chairman-only authority and
          remains so by design.
        </p>
      </div>

      {/* ── Kill-switch confirmation modal ───────────────────────────── */}
      <AnimatePresence>
        {killTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => busyId === null && setKillTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full rounded-lg p-6 relative"
              style={{
                background: "#0a0a0a",
                border: `1px solid ${TRUE_GOLD}`,
                boxShadow: `0 0 40px rgba(212,175,55,0.20), inset 0 0 0 0.5px ${TRUE_GOLD}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Ban className="w-5 h-5 text-red-500" />
                <h3
                  className="text-lg"
                  style={{ color: TRUE_GOLD, fontFamily: "Playfair Display, serif" }}
                >
                  Confirm Kill-Switch Authority
                </h3>
              </div>
              <p className="text-sm text-zinc-300 mb-2">
                You are about to issue a Chairman-level kill-switch command in
                response to:
              </p>
              <p
                className="text-sm text-white px-3 py-2 rounded border mb-3"
                style={{
                  borderColor: LEVEL_STYLE[killTarget.level].border,
                  background: LEVEL_STYLE[killTarget.level].bg,
                }}
              >
                {killTarget.summary}
              </p>
              <p className="text-xs text-amber-200/90 mb-5">
                Marcus will record this command and surface it across the
                operator log. The action is reversible only by issuing a
                follow-on Stand-Down.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setKillTarget(null)}
                  disabled={busyId !== null}
                  className="px-3 py-1.5 rounded text-xs text-zinc-300 hover:text-white transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmCommand(killTarget, "CONFIRM_KILL_SWITCH")}
                  disabled={busyId !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition disabled:opacity-50"
                  style={{ background: "#ef4444", color: "white" }}
                  data-testid="button-confirm-kill-switch"
                >
                  {busyId !== null ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  Authorize Kill-Switch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */
function StatusCard({
  label, value, icon, accent,
}: {
  label: string; value: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div
      className="rounded border px-4 py-3"
      style={{
        borderColor: "rgba(212,175,55,0.18)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="text-sm font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
