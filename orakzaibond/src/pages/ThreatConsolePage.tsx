/**
 * Sovereign Threat Console — Chairman-only tactical security dashboard.
 *
 * Privacy: This page sits behind AdminGate (in App.tsx), which renders <NotFound/>
 * for any wallet other than ADMIN_WALLET. It is invisible to normal users — no
 * navbar link, no sidebar entry, only accessible by typing /threat-console while
 * connected as the Chairman.
 *
 * Visual: minimalist, tactical, dark. Red/gold accents for alerts.
 *
 * Live data: subscribes to OKBOND Transfer events on Polygon, classifies whales,
 * raises security flags, and lets the Chairman one-tap-escalate any threat to
 * Marcus (which surfaces in the live optimizer log on the homepage).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Activity, Zap,
  Radio, Crosshair, Eye, EyeOff, Lock, Unlock, RefreshCw, ExternalLink,
  Clock, Cpu, ArrowUpRight, ArrowDownLeft, Ban, Skull, Loader2,
  Megaphone, ChevronRight, X,
} from "lucide-react";
import { Contract, JsonRpcProvider, formatUnits, EventLog, Log } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { pushEscalation } from "@/lib/marcusBus";

/* ── Constants ──────────────────────────────────────────────────────────── */
const TOKEN_ADDRESS    = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const ICO_ADDRESS      = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const REFERRAL_ADDRESS = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const LOTTERY_ADDRESS  = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const ADMIN_WALLET     = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";
const FALLBACK_RPC     = "https://polygon-rpc.com";
const EXPLORER         = "https://polygonscan.com";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
const LOTTERY_FNS = [
  "function lotteryStarted() view returns (bool)",
  "function winnersSelected() view returns (bool)",
  "function owner() view returns (address)",
];

/* Whale threshold = 0.1% of total supply (configurable below) */
const WHALE_PCT = 0.001;

/* ── Types ──────────────────────────────────────────────────────────────── */
type Severity = "ok" | "watch" | "alert" | "critical";

interface Transfer {
  hash: string;
  block: number;
  from: string;
  to: string;
  amount: number;
  pctSupply: number;
  ts?: number;
}

interface Flag {
  id: string;
  label: string;
  detail: string;
  severity: Severity;
  icon: React.ReactNode;
}

const SEV_COLOR: Record<Severity, { fg: string; bg: string; border: string; glow: string }> = {
  ok:       { fg: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.30)", glow: "rgba(16,185,129,0.20)" },
  watch:    { fg: "#eab308", bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.30)",  glow: "rgba(234,179,8,0.25)"  },
  alert:    { fg: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.30)", glow: "rgba(249,115,22,0.25)" },
  critical: { fg: "#ef4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.40)",  glow: "rgba(239,68,68,0.35)"  },
};

/* ── Utility ────────────────────────────────────────────────────────────── */
function shortAddr(a: string) { return a.slice(0, 6) + "…" + a.slice(-4); }
function shortHash(h: string) { return h.slice(0, 8) + "…" + h.slice(-6); }
function fmtNum(n: number, max = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}
function fmtPct(n: number) {
  if (n < 0.01) return "<0.01%";
  return n.toFixed(2) + "%";
}
function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function classifyAddress(addr: string): string {
  const a = addr.toLowerCase();
  if (a === ICO_ADDRESS.toLowerCase()) return "ICO";
  if (a === LOTTERY_ADDRESS.toLowerCase()) return "Lottery";
  if (a === REFERRAL_ADDRESS.toLowerCase()) return "Referral";
  if (a === ADMIN_WALLET.toLowerCase()) return "Chairman";
  if (a === "0x0000000000000000000000000000000000000000") return "Mint/Burn";
  return "External";
}

/* ── The Console ────────────────────────────────────────────────────────── */
export default function ThreatConsolePage() {
  const { address, provider } = useWallet();

  const [totalSupply, setTotalSupply]   = useState<number>(0);
  const [decimals, setDecimals]         = useState<number>(18);
  const [transfers, setTransfers]       = useState<Transfer[]>([]);
  const [whales, setWhales]             = useState<Transfer[]>([]);
  const [stream, setStream]             = useState<Transfer[]>([]);
  const [loading, setLoading]           = useState(true);
  const [streaming, setStreaming]       = useState(true);
  const [lotteryOwner, setLotteryOwner] = useState<string | null>(null);
  const [lotteryStarted, setLotteryStarted] = useState<boolean | null>(null);
  const [winnersSelected, setWinnersSelected] = useState<boolean | null>(null);
  const [icoBalance, setIcoBalance]     = useState<number>(0);
  const [lastRefresh, setLastRefresh]   = useState<Date | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; label: string; level: "CRITICAL" | "EXEC" | "ALERT"; msg: string } | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  const tokenContractRef = useRef<Contract | null>(null);

  /* Title + robots noindex */
  useEffect(() => {
    document.title = "Threat Console";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.title = "Orakzai Bond"; meta.remove(); };
  }, []);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Initial load: supply + recent transfers + lottery state ────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_FNS, rpc);
      tokenContractRef.current = token;

      const [supplyRaw, dec, icoBalRaw, lotOwner, lotStarted, lotWinSel, head] = await Promise.all([
        token.totalSupply().catch(() => 0n),
        token.decimals().catch(() => 18),
        token.balanceOf(ICO_ADDRESS).catch(() => 0n),
        lottery.owner().catch(() => null),
        lottery.lotteryStarted().catch(() => null),
        lottery.winnersSelected().catch(() => null),
        rpc.getBlockNumber(),
      ]);
      const decN = Number(dec);
      const supply = parseFloat(formatUnits(supplyRaw, decN));
      setTotalSupply(supply);
      setDecimals(decN);
      setIcoBalance(parseFloat(formatUnits(icoBalRaw, decN)));
      setLotteryOwner(lotOwner ? String(lotOwner) : null);
      setLotteryStarted(typeof lotStarted === "boolean" ? lotStarted : null);
      setWinnersSelected(typeof lotWinSel === "boolean" ? lotWinSel : null);

      // Pull recent Transfer events (last ~24h on Polygon ≈ 40k blocks at 2.1s/block)
      const fromBlock = Math.max(0, head - 45_000);
      const logs = await token.queryFilter(token.filters.Transfer(), fromBlock).catch(() => []);
      const blockTsCache: Record<number, number> = {};
      const items: Transfer[] = [];
      // To limit RPC, only resolve timestamps for largest transfers
      const parsed = logs
        .map((l: Log | EventLog) => {
          if (!(l instanceof EventLog)) return null;
          const from = String(l.args?.[0] || "");
          const to = String(l.args?.[1] || "");
          const value = BigInt(l.args?.[2] ?? 0);
          const amount = parseFloat(formatUnits(value, decN));
          const pctSupply = supply > 0 ? (amount / supply) * 100 : 0;
          return { hash: l.transactionHash, block: l.blockNumber, from, to, amount, pctSupply };
        })
        .filter(Boolean) as Transfer[];

      // Sort desc by block
      parsed.sort((a, b) => b.block - a.block);

      // Resolve timestamps for top 30 most recent
      const recentSlice = parsed.slice(0, 30);
      for (const t of recentSlice) {
        if (!blockTsCache[t.block]) {
          try {
            const blk = await rpc.getBlock(t.block);
            blockTsCache[t.block] = blk?.timestamp ? blk.timestamp * 1000 : Date.now();
          } catch { blockTsCache[t.block] = Date.now(); }
        }
        t.ts = blockTsCache[t.block];
      }

      items.push(...parsed);
      setTransfers(items);
      setStream(items.slice(0, 40));
      setWhales(items.filter(t => t.pctSupply >= WHALE_PCT * 100).slice(0, 25));
      setLastRefresh(new Date());
    } catch (err) {
      console.warn("Threat console fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Live Transfer subscription ─────────────────────────────────────── */
  useEffect(() => {
    if (!streaming) return;
    let mounted = true;
    let token: Contract | null = null;
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const handler = (from: string, to: string, value: bigint, ev: EventLog) => {
        if (!mounted || !token) return;
        const amount = parseFloat(formatUnits(value, decimals));
        const pctSupply = totalSupply > 0 ? (amount / totalSupply) * 100 : 0;
        const t: Transfer = { hash: ev.log.transactionHash, block: ev.log.blockNumber, from, to, amount, pctSupply, ts: Date.now() };
        setStream(prev => [t, ...prev].slice(0, 40));
        if (pctSupply >= WHALE_PCT * 100) {
          setWhales(prev => [t, ...prev].slice(0, 25));
        }
      };
      token.on("Transfer", handler);
      return () => {
        mounted = false;
        try { token?.off("Transfer", handler); } catch { /* ignore */ }
      };
    } catch (err) {
      console.warn("Live stream subscription failed:", err);
    }
  }, [streaming, provider, decimals, totalSupply]);

  /* ── Derived: Threat Level + Flags ──────────────────────────────────── */
  const flags: Flag[] = useMemo(() => {
    const out: Flag[] = [];
    // Ownership
    if (lotteryOwner !== null) {
      const ok = lotteryOwner.toLowerCase() === ADMIN_WALLET.toLowerCase();
      out.push({
        id: "owner",
        label: "Lottery Ownership",
        detail: ok ? "Chairman wallet retains owner role" : `⚠ Owner is ${shortAddr(lotteryOwner)} — NOT the Chairman`,
        severity: ok ? "ok" : "critical",
        icon: ok ? <ShieldCheck className="w-4 h-4" /> : <Skull className="w-4 h-4" />,
      });
    }
    // Whale activity (last 24h)
    const recentWhales = whales.filter(w => !w.ts || Date.now() - w.ts < 86_400_000);
    if (recentWhales.length === 0) {
      out.push({ id: "whales", label: "Whale Activity (24h)", detail: "No transfers ≥ 0.1% of supply", severity: "ok", icon: <ShieldCheck className="w-4 h-4" /> });
    } else if (recentWhales.length < 3) {
      out.push({ id: "whales", label: "Whale Activity (24h)", detail: `${recentWhales.length} large transfer(s) detected`, severity: "watch", icon: <Eye className="w-4 h-4" /> });
    } else {
      out.push({ id: "whales", label: "Whale Activity (24h)", detail: `${recentWhales.length} large transfers — elevated`, severity: "alert", icon: <AlertTriangle className="w-4 h-4" /> });
    }
    // Lottery state
    if (lotteryStarted !== null) {
      out.push({
        id: "lottery",
        label: "Lottery State",
        detail: lotteryStarted
          ? (winnersSelected ? "Round complete — winners selected" : "Active round — accepting entries")
          : "Idle — no active round",
        severity: "ok",
        icon: lotteryStarted ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />,
      });
    }
    // ICO drained?
    out.push({
      id: "ico-bal",
      label: "ICO Vault",
      detail: `${fmtNum(icoBalance, 0)} OKBOND remaining`,
      severity: icoBalance > 1_000_000 ? "ok" : icoBalance > 0 ? "watch" : "alert",
      icon: <Lock className="w-4 h-4" />,
    });
    // Transfer velocity
    const last1h = stream.filter(t => t.ts && Date.now() - t.ts < 3_600_000).length;
    out.push({
      id: "velocity",
      label: "Transfer Velocity (1h)",
      detail: `${last1h} transfer${last1h === 1 ? "" : "s"} in the last hour`,
      severity: last1h > 100 ? "alert" : last1h > 30 ? "watch" : "ok",
      icon: <Activity className="w-4 h-4" />,
    });

    return out;
  }, [whales, lotteryOwner, lotteryStarted, winnersSelected, icoBalance, stream]);

  const overallThreatLevel: Severity = useMemo(() => {
    if (flags.some(f => f.severity === "critical")) return "critical";
    if (flags.some(f => f.severity === "alert")) return "alert";
    if (flags.some(f => f.severity === "watch")) return "watch";
    return "ok";
  }, [flags]);

  const threatLabel: Record<Severity, string> = {
    ok: "STABLE", watch: "WATCH", alert: "ELEVATED", critical: "CRITICAL"
  };

  /* ── Marcus escalation actions ──────────────────────────────────────── */
  function escalate(label: string, level: "CRITICAL" | "EXEC" | "ALERT", msg: string) {
    pushEscalation({ level, msg, source: "threat-console" });
    setToast(`Marcus dispatched: ${label}`);
    setConfirmAction(null);
  }

  function escalateWhale(t: Transfer) {
    pushEscalation({
      level: "ALERT",
      source: "threat-console",
      msg: `ALERT · whale transfer ${fmtNum(t.amount, 0)} OKBOND (${fmtPct(t.pctSupply)} of supply) · ${shortAddr(t.from)} → ${shortAddr(t.to)} · ${shortHash(t.hash)}`,
      meta: { hash: t.hash, from: t.from, to: t.to, amount: t.amount },
    });
    setToast(`Marcus alerted: whale ${shortAddr(t.from)} → ${shortAddr(t.to)}`);
  }

  /* ── UI ─────────────────────────────────────────────────────────────── */
  const isChairman = !!(address && address.toLowerCase() === ADMIN_WALLET.toLowerCase());

  return (
    <div className="min-h-screen w-full text-foreground" style={{ background: "#040407", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      {/* Tactical grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#eab308 1px, transparent 1px), linear-gradient(90deg, #eab308 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      <main className="relative max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b" style={{ borderColor: "rgba(234,179,8,0.15)" }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: SEV_COLOR[overallThreatLevel].bg, border: `1px solid ${SEV_COLOR[overallThreatLevel].border}` }}>
                <Crosshair className="w-5 h-5" style={{ color: SEV_COLOR[overallThreatLevel].fg }} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#eab308aa" }}>Sovereign · Tier-Ω</p>
                <h1
                  className="text-2xl font-extrabold tracking-tight text-foreground"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.005em" }}>
                  Threat Console
                  {isChairman && (
                    <span className="ml-3 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest"
                      style={{ background: "#eab30815", color: "#eab308", border: "1px solid #eab30855" }}>
                      Chairman
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time on-chain security monitoring · Anti-whale watch · Marcus command channel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Threat level pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: SEV_COLOR[overallThreatLevel].bg, border: `1px solid ${SEV_COLOR[overallThreatLevel].border}`, boxShadow: `0 0 24px ${SEV_COLOR[overallThreatLevel].glow}` }}>
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ background: SEV_COLOR[overallThreatLevel].fg }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }} />
              <span className="text-[10px] font-extrabold tracking-[0.25em]" style={{ color: SEV_COLOR[overallThreatLevel].fg }}>
                THREAT · {threatLabel[overallThreatLevel]}
              </span>
            </div>

            <button onClick={() => setStreaming(s => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: streaming ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)",
                borderColor: streaming ? "rgba(16,185,129,0.30)" : "rgba(255,255,255,0.10)",
                color: streaming ? "#10b981" : "#94a3b8",
              }}>
              {streaming ? <Radio className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {streaming ? "LIVE" : "Paused"}
            </button>

            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
              style={{ background: "rgba(234,179,8,0.08)", borderColor: "rgba(234,179,8,0.30)", color: "#eab308" }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Marcus Command Center ──────────────────────────────────── */}
        <div className="mb-10 rounded-xl border p-6" style={{ background: "rgba(8,8,15,0.6)", borderColor: "rgba(234,179,8,0.20)", boxShadow: "inset 0 1px 0 rgba(234,179,8,0.10)" }}>
          <div className="flex items-center gap-3 mb-5">
            <Cpu className="w-4 h-4" style={{ color: "#eab308" }} />
            <h2 className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: "#eab308" }}>Marcus · Command Center</h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(234,179,8,0.3), transparent)" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CommandButton
              label="Escalate Alert"
              hint="Mark current threat for review"
              icon={<ShieldAlert className="w-4 h-4" />}
              color="#eab308"
              onClick={() => setConfirmAction({ id: "escalate", label: "Escalate Alert", level: "ALERT", msg: `ALERT · Chairman escalation · threat level ${threatLabel[overallThreatLevel]}` })} />
            <CommandButton
              label="Lock Lottery"
              hint="Freeze entries until cleared"
              icon={<Lock className="w-4 h-4" />}
              color="#f97316"
              onClick={() => setConfirmAction({ id: "lock", label: "Lock Lottery", level: "EXEC", msg: "EXEC · Chairman ordered lottery freeze · awaiting on-chain pause" })} />
            <CommandButton
              label="Broadcast Emergency"
              hint="Pin urgent dispatch to ticker"
              icon={<Megaphone className="w-4 h-4" />}
              color="#22d3ee"
              onClick={() => setConfirmAction({ id: "broadcast", label: "Emergency Broadcast", level: "CRITICAL", msg: "CRITICAL · Emergency dispatch queued by Chairman" })} />
            <CommandButton
              label="Halt All Ops"
              hint="Tier-Ω circuit breaker"
              icon={<Ban className="w-4 h-4" />}
              color="#ef4444"
              onClick={() => setConfirmAction({ id: "halt", label: "Halt All Operations", level: "CRITICAL", msg: "CRITICAL · Chairman pulled the Tier-Ω circuit breaker · all ops suspended" })} />
          </div>
        </div>

        {/* ── Top: Security Flags ───────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-4 h-4" style={{ color: "#eab308" }} />
            <h2 className="text-xs font-extrabold tracking-[0.25em] uppercase text-foreground">Security Flags</h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(234,179,8,0.3), transparent)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {flags.map((f) => {
              const c = SEV_COLOR[f.severity];
              return (
                <div key={f.id} className="rounded-lg border p-4 flex items-start gap-3 transition-all hover:translate-y-[-2px]"
                  style={{ background: c.bg, borderColor: c.border, boxShadow: `inset 0 1px 0 ${c.border}` }}>
                  <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: c.fg }}>{f.label}</p>
                    <p className="text-xs text-foreground font-medium leading-snug">{f.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Mid: Anti-Whale Watch ─────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-4 h-4" style={{ color: "#ef4444" }} />
            <h2 className="text-xs font-extrabold tracking-[0.25em] uppercase text-foreground">Anti-Whale Watch</h2>
            <span className="text-[10px] text-muted-foreground/70 font-mono">≥ {(WHALE_PCT * 100).toFixed(2)}% of supply · last 24h</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.3), transparent)" }} />
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ background: "rgba(8,8,15,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
            {loading && whales.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground/60 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning recent transfers…
              </div>
            ) : whales.length === 0 ? (
              <div className="py-16 text-center text-sm text-emerald-400/80 flex flex-col items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                No whale activity detected · all transfers below threshold
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">% Supply</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {whales.map((w) => {
                    const sev: Severity = w.pctSupply >= 1 ? "critical" : w.pctSupply >= 0.5 ? "alert" : "watch";
                    const c = SEV_COLOR[sev];
                    return (
                      <tr key={`${w.hash}-${w.from}-${w.to}`} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <a href={`${EXPLORER}/address/${w.from}`} target="_blank" rel="noopener noreferrer"
                             className="font-mono text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>{classifyAddress(w.from)}</span>
                            {shortAddr(w.from)}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`${EXPLORER}/address/${w.to}`} target="_blank" rel="noopener noreferrer"
                             className="font-mono text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>{classifyAddress(w.to)}</span>
                            {shortAddr(w.to)}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-foreground">{fmtNum(w.amount, 0)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded" style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}>
                            {fmtPct(w.pctSupply)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{w.ts ? relativeTime(w.ts) : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`${EXPLORER}/tx/${w.hash}`} target="_blank" rel="noopener noreferrer"
                               className="text-muted-foreground hover:text-primary transition-colors" title="View tx">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button onClick={() => escalateWhale(w)}
                              title="Escalate to Marcus"
                              className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                              style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.30)" }}>
                              Escalate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Bottom: Live Transfer Stream ──────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-4 h-4" style={{ color: "#22d3ee" }} />
            <h2 className="text-xs font-extrabold tracking-[0.25em] uppercase text-foreground">Live Transfer Stream</h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(34,211,238,0.3), transparent)" }} />
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ background: "rgba(8,8,15,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="max-h-[420px] overflow-y-auto">
              {stream.length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground/60">
                  {loading ? "Loading…" : "No recent transfers"}
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <AnimatePresence initial={false}>
                      {stream.slice(0, 25).map((t) => {
                        const dir = t.from.toLowerCase() === ADMIN_WALLET.toLowerCase() ? "out" : "in";
                        const big = t.pctSupply >= 0.05;
                        return (
                          <motion.tr key={`${t.hash}-${t.from}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 w-8">
                              {dir === "out"
                                ? <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                                : <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />}
                            </td>
                            <td className="px-1 py-2.5 font-mono text-muted-foreground">
                              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mr-1.5" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>{classifyAddress(t.from)}</span>
                              {shortAddr(t.from)}
                            </td>
                            <td className="px-1 py-2.5 text-muted-foreground/40">→</td>
                            <td className="px-1 py-2.5 font-mono text-muted-foreground">
                              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mr-1.5" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>{classifyAddress(t.to)}</span>
                              {shortAddr(t.to)}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-mono font-bold ${big ? "text-red-400" : "text-foreground/80"}`}>
                              {fmtNum(t.amount, 0)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground/50 font-mono text-[10px]">{fmtPct(t.pctSupply)}</td>
                            <td className="px-4 py-2.5 text-right">
                              <a href={`${EXPLORER}/tx/${t.hash}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary"><ExternalLink className="w-3 h-3" /></a>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {lastRefresh && (
            <p className="mt-3 text-[10px] text-muted-foreground/50 font-mono text-right">
              Last full scan: {lastRefresh.toLocaleTimeString()} · {transfers.length} transfers indexed (last ~24h)
            </p>
          )}
        </section>
      </main>

      {/* ── Confirm modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setConfirmAction(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border p-6 max-w-md w-full"
              style={{ background: "#0a0a14", borderColor: confirmAction.level === "CRITICAL" ? "rgba(239,68,68,0.40)" : "rgba(234,179,8,0.30)", boxShadow: `0 0 40px ${confirmAction.level === "CRITICAL" ? "rgba(239,68,68,0.20)" : "rgba(234,179,8,0.15)"}` }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: confirmAction.level === "CRITICAL" ? "rgba(239,68,68,0.10)" : "rgba(234,179,8,0.10)", color: confirmAction.level === "CRITICAL" ? "#ef4444" : "#eab308" }}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: confirmAction.level === "CRITICAL" ? "#ef4444" : "#eab308" }}>Confirm · {confirmAction.level}</p>
                  <h3 className="text-base font-extrabold text-foreground">{confirmAction.label}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-5 font-mono leading-relaxed">{confirmAction.msg}</p>
              <p className="text-[10px] text-muted-foreground/60 mb-5">
                Marcus will be notified instantly. This action is logged in the live optimizer terminal.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={() => escalate(confirmAction.label, confirmAction.level, confirmAction.msg)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:opacity-90"
                  style={{ background: confirmAction.level === "CRITICAL" ? "#ef4444" : "#eab308" }}>
                  Confirm Escalate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border flex items-center gap-3 shadow-2xl"
            style={{ background: "#0a0a14", borderColor: "rgba(234,179,8,0.40)", boxShadow: "0 0 30px rgba(234,179,8,0.25)" }}>
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{toast}</span>
            <button onClick={() => setToast(null)} className="text-muted-foreground/60 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub: Command Button ─────────────────────────────────────────────────── */
function CommandButton({ label, hint, icon, color, onClick }: {
  label: string; hint: string; icon: React.ReactNode; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="group flex items-start gap-3 p-4 rounded-lg border text-left transition-all hover:translate-y-[-2px]"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: color + "30" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}30`; (e.currentTarget as HTMLElement).style.background = color + "10"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: color + "15", color, border: `1px solid ${color}40` }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground/70 leading-snug">{hint}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors mt-1" />
    </button>
  );
}
