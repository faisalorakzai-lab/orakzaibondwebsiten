/**
 * Founder's Vault — Chairman-only treasury panel inside the Admin Panel.
 *
 * Aesthetic: Midnight Gold · minimalist · Swiss-bank vault.
 * Privacy: Lives inside <AdminGate>, so only ADMIN_WALLET can see it.
 *
 * Surfaces:
 *  • Treasury Health  — POL raised, lottery reserves, total supply, days runway estimate
 *  • Top-10 Concentration — reconstructed from Transfer events (last ~250k blocks)
 *  • Security Flags — owner integrity, ICO state, etc.
 *  • Pinned Dispatch — one-tap broadcast (Supabase posts) that surfaces in /system ticker
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Coins, Database, ShieldCheck, ShieldAlert, Megaphone,
  Loader2, RefreshCw, ExternalLink, Trash2, Send, AlertTriangle,
  Lock, TrendingUp, PieChart, Users, CheckCircle2, X, Sparkles,
} from "lucide-react";
import { Contract, JsonRpcProvider, formatEther, formatUnits, EventLog, Log } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { broadcastDispatch, fetchRecentDispatches, unpinDispatch, type Dispatch } from "@/lib/dispatchBus";
import { pushEscalation } from "@/lib/marcusBus";
import ReserveControlPanel from "./ReserveControlPanel";

const TOKEN_ADDRESS    = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const ICO_ADDRESS      = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const REFERRAL_ADDRESS = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const LOTTERY_ADDRESS  = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const ADMIN_WALLET     = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";
const FALLBACK_RPC     = "https://polygon-rpc.com";
const EXPLORER         = "https://polygonscan.com";
const ICO_PRICE_USD    = 0.50;
const POL_USD          = 0.50;

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

const KNOWN_LABELS: Record<string, string> = {
  [ICO_ADDRESS.toLowerCase()]:      "ICO Vault",
  [LOTTERY_ADDRESS.toLowerCase()]:  "Lottery Reserve",
  [REFERRAL_ADDRESS.toLowerCase()]: "Referral Pool",
  [ADMIN_WALLET.toLowerCase()]:     "Chairman",
  "0x0000000000000000000000000000000000000000": "Burn",
};

interface Holder { address: string; balance: number; pct: number; label: string; }

function shortAddr(a: string) { return a.slice(0, 6) + "…" + a.slice(-4); }
function fmtNum(n: number, max = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}

export default function FoundersVault() {
  const { provider } = useWallet();

  const [icoPolBal, setIcoPolBal]       = useState<number>(0);
  const [icoTokenBal, setIcoTokenBal]   = useState<number>(0);
  const [lotteryPolBal, setLotteryPolBal] = useState<number>(0);
  const [lotteryTokenBal, setLotteryTokenBal] = useState<number>(0);
  const [refTokenBal, setRefTokenBal]   = useState<number>(0);
  const [adminTokenBal, setAdminTokenBal] = useState<number>(0);
  const [totalSupply, setTotalSupply]   = useState<number>(0);

  const [lotteryOwner, setLotteryOwner] = useState<string | null>(null);
  const [lotteryStarted, setLotteryStarted] = useState<boolean | null>(null);
  const [winnersSelected, setWinnersSelected] = useState<boolean | null>(null);

  const [holders, setHolders]           = useState<Holder[]>([]);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [lastRefresh, setLastRefresh]   = useState<Date | null>(null);

  const [draft, setDraft]               = useState<string>("");
  const [dispatches, setDispatches]     = useState<Dispatch[]>([]);
  const [posting, setPosting]           = useState(false);
  const [postError, setPostError]       = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Treasury & Security fetch ─────────────────────────────────────── */
  const fetchTreasury = useCallback(async () => {
    setLoading(true);
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_FNS, rpc);

      const [
        supplyRaw, dec,
        icoPol, icoTok, lotPol, lotTok, refTok, admTok,
        owner, started, winsel,
      ] = await Promise.all([
        token.totalSupply().catch(() => 0n),
        token.decimals().catch(() => 18),
        rpc.getBalance(ICO_ADDRESS).catch(() => 0n),
        token.balanceOf(ICO_ADDRESS).catch(() => 0n),
        rpc.getBalance(LOTTERY_ADDRESS).catch(() => 0n),
        token.balanceOf(LOTTERY_ADDRESS).catch(() => 0n),
        token.balanceOf(REFERRAL_ADDRESS).catch(() => 0n),
        token.balanceOf(ADMIN_WALLET).catch(() => 0n),
        lottery.owner().catch(() => null),
        lottery.lotteryStarted().catch(() => null),
        lottery.winnersSelected().catch(() => null),
      ]);

      const decN = Number(dec);
      setTotalSupply(parseFloat(formatUnits(supplyRaw, decN)));
      setIcoPolBal(parseFloat(formatEther(icoPol)));
      setIcoTokenBal(parseFloat(formatUnits(icoTok, decN)));
      setLotteryPolBal(parseFloat(formatEther(lotPol)));
      setLotteryTokenBal(parseFloat(formatUnits(lotTok, decN)));
      setRefTokenBal(parseFloat(formatUnits(refTok, decN)));
      setAdminTokenBal(parseFloat(formatUnits(admTok, decN)));
      setLotteryOwner(owner ? String(owner) : null);
      setLotteryStarted(typeof started === "boolean" ? started : null);
      setWinnersSelected(typeof winsel === "boolean" ? winsel : null);
      setLastRefresh(new Date());
    } catch (err) {
      console.warn("Vault treasury fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  /* ── Top-10 Concentration via Transfer event reconstruction ────────── */
  const fetchHolders = useCallback(async () => {
    setHoldersLoading(true);
    try {
      const rpc = provider || new JsonRpcProvider(FALLBACK_RPC);
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const dec = await token.decimals().catch(() => 18);
      const decN = Number(dec);
      const head = await rpc.getBlockNumber();
      const fromBlock = Math.max(0, head - 250_000);
      const logs: (Log | EventLog)[] = await token.queryFilter(token.filters.Transfer(), fromBlock).catch(() => []);

      const balances: Record<string, bigint> = {};
      for (const l of logs) {
        if (!(l instanceof EventLog)) continue;
        const from = String(l.args?.[0] || "").toLowerCase();
        const to = String(l.args?.[1] || "").toLowerCase();
        const value = BigInt(l.args?.[2] ?? 0);
        if (from && from !== "0x0000000000000000000000000000000000000000") {
          balances[from] = (balances[from] ?? 0n) - value;
        }
        if (to && to !== "0x0000000000000000000000000000000000000000") {
          balances[to] = (balances[to] ?? 0n) + value;
        }
      }

      // Compute live balances for the top candidates (deltas can be negative if
      // they had pre-window balance), then verify with on-chain balanceOf.
      const candidates = Object.entries(balances)
        .map(([addr, delta]) => ({ addr, score: Number(delta > 0n ? delta : -delta) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 25)
        .map(c => c.addr);

      const verified = await Promise.all(candidates.map(async (addr) => {
        try {
          const bal = await token.balanceOf(addr);
          return { address: addr, balance: parseFloat(formatUnits(bal, decN)) };
        } catch { return { address: addr, balance: 0 }; }
      }));

      const supply = totalSupply || (parseFloat(formatUnits(await token.totalSupply().catch(() => 0n), decN)));
      const top = verified
        .filter(v => v.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10)
        .map((v) => ({
          address: v.address,
          balance: v.balance,
          pct: supply > 0 ? (v.balance / supply) * 100 : 0,
          label: KNOWN_LABELS[v.address] || "",
        }));

      setHolders(top);
    } catch (err) {
      console.warn("Holders fetch error:", err);
    } finally {
      setHoldersLoading(false);
    }
  }, [provider, totalSupply]);

  /* ── Dispatches load ───────────────────────────────────────────────── */
  const loadDispatches = useCallback(async () => {
    const list = await fetchRecentDispatches(8);
    setDispatches(list);
  }, []);

  useEffect(() => { fetchTreasury(); }, [fetchTreasury]);
  useEffect(() => { fetchHolders(); }, [fetchHolders]);
  useEffect(() => { loadDispatches(); }, [loadDispatches]);

  /* ── Broadcast handler ─────────────────────────────────────────────── */
  async function handleBroadcast() {
    setPostError(null);
    if (!draft.trim()) { setPostError("Type a dispatch first."); return; }
    setPosting(true);
    try {
      await broadcastDispatch(draft);
      pushEscalation({
        level: "BROADCAST",
        source: "vault",
        msg: `BROADCAST · Chairman pinned dispatch · "${draft.trim().slice(0, 80)}${draft.trim().length > 80 ? "…" : ""}"`,
      });
      setDraft("");
      setToast("Dispatch pinned to community ticker");
      await loadDispatches();
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : "Failed to broadcast.");
    } finally {
      setPosting(false);
    }
  }

  async function handleUnpin(id: string) {
    try {
      await unpinDispatch(id);
      setToast("Dispatch removed");
      await loadDispatches();
    } catch (err: unknown) {
      setToast(err instanceof Error ? `Error: ${err.message}` : "Failed to unpin");
    }
  }

  /* ── Derived ───────────────────────────────────────────────────────── */
  const totalRaisedUsd = icoPolBal * POL_USD;
  const lotteryReserveUsd = lotteryTokenBal * ICO_PRICE_USD;
  const totalSupplyUsd = totalSupply * ICO_PRICE_USD;

  const ownershipOk = lotteryOwner && lotteryOwner.toLowerCase() === ADMIN_WALLET.toLowerCase();
  const flags = [
    {
      label: "Lottery Ownership",
      ok: !!ownershipOk,
      detail: ownershipOk ? "Chairman wallet retains owner role" : (lotteryOwner ? `Owner is ${shortAddr(lotteryOwner)}` : "Owner unknown"),
    },
    {
      label: "ICO State",
      ok: icoTokenBal > 0,
      detail: icoTokenBal > 0 ? `${fmtNum(icoTokenBal, 0)} OKBOND in vault` : "ICO vault empty — refill required",
    },
    {
      label: "Lottery Round",
      ok: true,
      detail: lotteryStarted == null ? "—" : lotteryStarted ? (winnersSelected ? "Complete · winners selected" : "Active round") : "Idle",
    },
    {
      label: "Treasury Liquidity",
      ok: icoPolBal + lotteryPolBal > 0,
      detail: `${fmtNum(icoPolBal + lotteryPolBal, 4)} POL across vaults`,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-primary/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1408, #0a0805)", border: "1px solid #d4af3744", boxShadow: "0 0 18px rgba(212,175,55,0.20)" }}>
              <Crown className="w-4.5 h-4.5" style={{ color: "#d4af37" }} />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#d4af37aa" }}>Tier-Ω</p>
              <h2 className="text-2xl font-extrabold text-foreground" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em" }}>
                Founder's <span style={{ color: "#d4af37" }}>Vault</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Treasury health · Top-10 concentration · Security flags · Pinned Dispatch</p>
        </div>
        <button onClick={() => { fetchTreasury(); fetchHolders(); loadDispatches(); }} disabled={loading || holdersLoading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
          style={{ background: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.30)", color: "#d4af37" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading || holdersLoading ? "animate-spin" : ""}`} />
          Refresh Vault
        </button>
      </div>

      {/* Treasury Health */}
      <section>
        <SectionTitle icon={<Coins className="w-4 h-4" />} label="Treasury Health" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VaultStat label="ICO Raised (POL)" value={loading ? "…" : fmtNum(icoPolBal, 4)} sub={`≈ $${fmtNum(totalRaisedUsd, 0)}`} icon={<Database className="w-4 h-4" />} />
          <VaultStat label="ICO OKBOND Vault" value={loading ? "…" : fmtNum(icoTokenBal, 0)} sub={`≈ $${fmtNum(icoTokenBal * ICO_PRICE_USD, 0)}`} icon={<Lock className="w-4 h-4" />} />
          <VaultStat label="Lottery Reserve" value={loading ? "…" : fmtNum(lotteryTokenBal, 0)} sub={`OKBOND · ≈ $${fmtNum(lotteryReserveUsd, 0)}`} icon={<TrendingUp className="w-4 h-4" />} />
          <VaultStat label="Total Supply" value={loading ? "…" : fmtNum(totalSupply, 0)} sub={`≈ $${fmtNum(totalSupplyUsd, 0)} @ ICO`} icon={<PieChart className="w-4 h-4" />} />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <VaultStat label="Lottery POL Reserve" value={loading ? "…" : fmtNum(lotteryPolBal, 4)} sub="POL on contract" small icon={<Database className="w-3.5 h-3.5" />} />
          <VaultStat label="Referral Pool (OKBOND)" value={loading ? "…" : fmtNum(refTokenBal, 0)} sub="awaiting distribution" small icon={<Sparkles className="w-3.5 h-3.5" />} />
          <VaultStat label="Chairman Holdings" value={loading ? "…" : fmtNum(adminTokenBal, 0)} sub="OKBOND" small icon={<Crown className="w-3.5 h-3.5" />} />
        </div>
      </section>

      {/* Reserve Control Panel — Live Asset Control */}
      <ReserveControlPanel />

      {/* Security Flags */}
      <section>
        <SectionTitle icon={<ShieldCheck className="w-4 h-4" />} label="Security Flags" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {flags.map((f) => (
            <div key={f.label} className="rounded-lg border p-4 flex items-start gap-3"
              style={{ background: f.ok ? "rgba(16,185,129,0.06)" : "rgba(249,115,22,0.06)", borderColor: f.ok ? "rgba(16,185,129,0.25)" : "rgba(249,115,22,0.30)" }}>
              <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: f.ok ? "rgba(16,185,129,0.10)" : "rgba(249,115,22,0.10)", color: f.ok ? "#10b981" : "#f97316" }}>
                {f.ok ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: f.ok ? "#10b981" : "#f97316" }}>{f.label}</p>
                <p className="text-xs text-foreground font-medium leading-snug">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top-10 Concentration */}
      <section>
        <SectionTitle icon={<Users className="w-4 h-4" />} label="Top-10 Concentration"
          right={<span className="text-[10px] text-muted-foreground/60 font-mono">estimated · last 250k blocks</span>} />
        <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(8,8,15,0.4)", borderColor: "rgba(212,175,55,0.15)" }}>
          {holdersLoading && holders.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground/60 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Reconstructing holder map…
            </div>
          ) : holders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground/60">No holders detected in window.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">% Supply</th>
                  <th className="px-4 py-3 text-right">Risk</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {holders.map((h, idx) => {
                  const risk = h.pct >= 5 ? { fg: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.30)", label: "HIGH" }
                             : h.pct >= 2 ? { fg: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.30)", label: "WATCH" }
                                          : { fg: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.30)", label: "OK"   };
                  return (
                    <tr key={h.address} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground/60">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {h.label && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold" style={{ background: "rgba(212,175,55,0.10)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.30)" }}>
                              {h.label}
                            </span>
                          )}
                          <a href={`${EXPLORER}/address/${h.address}`} target="_blank" rel="noopener noreferrer"
                             className="font-mono text-xs text-foreground hover:text-primary transition-colors">
                            {shortAddr(h.address)}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-foreground">{fmtNum(h.balance, 0)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, h.pct)}%`, background: risk.fg }} />
                          </div>
                          <span className="font-mono text-xs font-bold" style={{ color: risk.fg, minWidth: 50, textAlign: "right" }}>{h.pct.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
                          style={{ color: risk.fg, background: risk.bg, border: `1px solid ${risk.border}` }}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={`${EXPLORER}/address/${h.address}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary inline-block">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {lastRefresh && (
            <div className="px-4 py-2 border-t text-[10px] font-mono text-muted-foreground/40" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              Last sync: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </section>

      {/* Pinned Dispatch */}
      <section>
        <SectionTitle icon={<Megaphone className="w-4 h-4" />} label="Pinned Dispatch" right={<span className="text-[10px] text-muted-foreground/60 font-mono">surfaces in /system live ticker</span>} />
        <div className="rounded-xl border p-6" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.04), transparent)", borderColor: "rgba(212,175,55,0.20)" }}>
          <div className="flex items-start gap-2 mb-2">
            <Megaphone className="w-3.5 h-3.5 mt-0.5" style={{ color: "#d4af37" }} />
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#d4af37" }}>Compose Broadcast</p>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 280))}
            placeholder="Address the community directly. Pinned to the live ticker the moment you broadcast."
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none font-mono" />
          <div className="flex items-center justify-between mt-3 gap-4">
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className={draft.length > 260 ? "text-amber-400" : "text-muted-foreground/60"}>{draft.length} / 280</span>
              {postError && <span className="text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> {postError}</span>}
            </div>
            <button onClick={handleBroadcast} disabled={posting || !draft.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#d4af37", color: "#0a0805" }}>
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Broadcast Now
            </button>
          </div>

          {dispatches.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3">Active Dispatches · {dispatches.length}</p>
              <div className="space-y-2">
                {dispatches.map((d) => (
                  <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg group" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    <div className="w-1 self-stretch rounded" style={{ background: "#d4af37" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium leading-relaxed break-words">{d.message}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleUnpin(d.id)}
                      title="Remove dispatch"
                      className="p-1.5 rounded text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border flex items-center gap-3 shadow-2xl"
            style={{ background: "#0a0a14", borderColor: "rgba(212,175,55,0.40)", boxShadow: "0 0 30px rgba(212,175,55,0.25)" }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: "#d4af37" }} />
            <span className="text-xs font-bold text-foreground">{toast}</span>
            <button onClick={() => setToast(null)} className="text-muted-foreground/60 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Sub Components ────────────────────────────────────────────────────── */
function SectionTitle({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span style={{ color: "#d4af37" }}>{icon}</span>
      <h3 className="text-xs font-extrabold tracking-[0.25em] uppercase text-foreground">{label}</h3>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.25), transparent)" }} />
      {right}
    </div>
  );
}

function VaultStat({ icon, label, value, sub, small = false }: { icon: React.ReactNode; label: string; value: string; sub: string; small?: boolean }) {
  return (
    <div className={`rounded-xl border ${small ? "p-4" : "p-5"} relative overflow-hidden transition-all`}
      style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.04), rgba(8,8,15,0.6))", borderColor: "rgba(212,175,55,0.18)", boxShadow: "inset 0 1px 0 rgba(212,175,55,0.06)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: "#d4af37" }}>{icon}</span>
        <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: "#d4af37aa" }}>{label}</p>
      </div>
      <p className={`${small ? "text-xl" : "text-2xl"} font-extrabold text-foreground font-mono mb-1`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
