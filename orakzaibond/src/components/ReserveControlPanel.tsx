/**
 * ReserveControlPanel — Live Asset Control inside the Founder's Vault.
 *
 * The Chairman edits each Reserve allocation (Real Estate / On-Chain /
 * Liquidity / POL) in real time. On commit:
 *   1. Writes the snapshot to Supabase via reserveAllocations.updateAllocations
 *   2. RLS in migration 007 blocks any wallet other than the Chairman
 *   3. Pushes a Marcus escalation so the Live Log acknowledges:
 *      "Chairman, OKBOND Reserve allocations have been recalibrated on the Grid."
 *   4. Realtime subscribers (ReserveWidget) pick up the change with no redeploy
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders, Loader2, ShieldCheck, AlertTriangle, RotateCcw, Save, CheckCircle2,
} from "lucide-react";
import {
  fetchAllocations,
  subscribeAllocations,
  updateAllocations,
  type ReserveAllocation,
} from "@/lib/reserveAllocations";
import { pushEscalation } from "@/lib/marcusBus";
import { useWallet } from "@/hooks/useWallet";
import { ADMIN_WALLET } from "@/lib/adminAuth";

const GOLD        = "#d4af37";
const GOLD_BRIGHT = "#f4ce45";

const ACK_LINE =
  "Chairman, OKBOND Reserve allocations have been recalibrated on the Grid.";

export default function ReserveControlPanel() {
  const { address } = useWallet();
  const isChairman = !!address && address.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const [base, setBase] = useState<ReserveAllocation[]>([]);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Initial fetch + live subscription so two Chairmen would never overwrite blind.
  useEffect(() => {
    let mounted = true;
    fetchAllocations().then((rows) => {
      if (!mounted) return;
      setBase(rows);
      setDraft(Object.fromEntries(rows.map((r) => [r.asset_key, r.pct])));
      setLoading(false);
    });
    const unsub = subscribeAllocations((rows) => {
      if (!mounted) return;
      setBase(rows);
      // Only re-seed the draft when the user has no pending edits.
      setDraft((prev) => {
        const dirty = rows.some((r) => prev[r.asset_key] !== undefined && prev[r.asset_key] !== r.pct);
        return dirty ? prev : Object.fromEntries(rows.map((r) => [r.asset_key, r.pct]));
      });
    });
    return () => { mounted = false; unsub(); };
  }, []);

  // Computed totals + dirty state
  const total = useMemo(
    () => base.reduce((s, r) => s + (Number(draft[r.asset_key]) || 0), 0),
    [base, draft],
  );
  const totalRounded = Math.round(total * 100) / 100;
  const sumOk = Math.abs(totalRounded - 100) <= 0.5;
  const dirty = useMemo(
    () => base.some((r) => Number(draft[r.asset_key]) !== r.pct),
    [base, draft],
  );

  function set(key: string, raw: number) {
    const v = Math.max(0, Math.min(100, isFinite(raw) ? raw : 0));
    setDraft((prev) => ({ ...prev, [key]: round2(v) }));
    setError(null);
  }

  function reset() {
    setDraft(Object.fromEntries(base.map((r) => [r.asset_key, r.pct])));
    setError(null);
  }

  // "Auto-balance" — distribute the 100-total delta across the OTHER assets
  // proportionally, so the Chairman can drag one slider and not fight maths.
  function balanceOthers(changedKey: string) {
    const others = base.filter((r) => r.asset_key !== changedKey);
    const otherSumNow = others.reduce((s, r) => s + (Number(draft[r.asset_key]) || 0), 0);
    const target = 100 - (Number(draft[changedKey]) || 0);
    if (otherSumNow <= 0 || others.length === 0) return;
    const factor = target / otherSumNow;
    setDraft((prev) => {
      const next = { ...prev };
      others.forEach((r, i) => {
        // Last one absorbs rounding error so the total lands exactly on 100.
        if (i === others.length - 1) {
          const partial = others.slice(0, -1).reduce(
            (s, x) => s + round2((Number(prev[x.asset_key]) || 0) * factor),
            0,
          );
          next[r.asset_key] = round2(target - partial);
        } else {
          next[r.asset_key] = round2((Number(prev[r.asset_key]) || 0) * factor);
        }
      });
      return next;
    });
  }

  async function commit() {
    if (!isChairman) {
      setError("Connect the Chairman wallet to commit changes.");
      return;
    }
    if (!dirty) return;
    if (!sumOk) {
      setError(`Allocations must total 100% (current: ${totalRounded.toFixed(2)}%).`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updates = base
        .filter((r) => Number(draft[r.asset_key]) !== r.pct)
        .map((r) => ({ asset_key: r.asset_key, pct: Number(draft[r.asset_key]) }));

      const merged = await updateAllocations(updates, address!, "Founder's Vault recalibration");

      // Live acknowledgement → MarcusAILiveLog picks this up via window event.
      pushEscalation({
        level: "EXEC",
        msg: ACK_LINE,
        source: "vault",
        meta: {
          snapshot: Object.fromEntries(merged.map((m) => [m.asset_key, m.pct])),
        },
      });

      setBase(merged);
      setDraft(Object.fromEntries(merged.map((m) => [m.asset_key, m.pct])));
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt((t) => (t && Date.now() - t > 3500 ? null : t)), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to commit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      {/* Section title — matches FoundersVault SectionTitle visual */}
      <div className="flex items-center gap-3 mb-4">
        <span style={{ color: GOLD }}><Sliders className="w-4 h-4" /></span>
        <h3 className="text-xs font-extrabold tracking-[0.25em] uppercase text-foreground">Reserve Control Panel</h3>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        <span className="text-[10px] font-mono uppercase tracking-widest"
          style={{ color: isChairman ? "#34d399" : "#f97316" }}>
          {isChairman ? "Chairman · live write" : address ? "wallet not authorized" : "wallet disconnected"}
        </span>
      </div>

      <div className="rounded-xl border p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(212,175,55,0.04), rgba(8,8,15,0.4))",
          borderColor: "rgba(212,175,55,0.20)",
        }}>
        {/* Help line */}
        <div className="flex items-start gap-2 mb-5 text-[11px] text-muted-foreground/80 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
          <span>
            Adjust each backing-asset class. Changes are written to Supabase and surface
            on the public Reserve Widget instantly — no redeploy.
            Total <span className="font-mono font-bold" style={{ color: GOLD_BRIGHT }}>must equal 100%</span>.
            Use <span className="font-bold">Auto-balance</span> to keep the books square.
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading current allocations…
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {base.map((r) => {
                const v = Number(draft[r.asset_key] ?? r.pct);
                const changed = v !== r.pct;
                return (
                  <div key={r.asset_key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground leading-none">{r.label}</p>
                        {r.hint && <p className="text-[10px] text-muted-foreground/60 mt-1">{r.hint}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          step={0.5}
                          min={0}
                          max={100}
                          value={v}
                          disabled={!isChairman || saving}
                          onChange={(e) => set(r.asset_key, parseFloat(e.target.value))}
                          className="w-20 bg-black/40 border rounded px-2 py-1 text-right text-xs font-mono font-extrabold focus:outline-none transition-colors disabled:opacity-40"
                          style={{
                            color: changed ? GOLD_BRIGHT : "#fff",
                            borderColor: changed ? `${GOLD}88` : "rgba(255,255,255,0.10)",
                          }}
                        />
                        <span className="text-xs font-mono font-bold" style={{ color: GOLD }}>%</span>
                        <button
                          type="button"
                          onClick={() => balanceOthers(r.asset_key)}
                          disabled={!isChairman || saving}
                          title="Distribute the remainder across the other assets so the total lands on 100%"
                          className="ml-1 px-2 py-1 rounded text-[9px] uppercase tracking-widest font-extrabold border transition-colors disabled:opacity-30"
                          style={{
                            color: GOLD,
                            background: "rgba(212,175,55,0.06)",
                            borderColor: "rgba(212,175,55,0.25)",
                          }}>
                          Auto-balance
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0} max={100} step={0.5}
                      value={v}
                      disabled={!isChairman || saving}
                      onChange={(e) => set(r.asset_key, parseFloat(e.target.value))}
                      className="w-full reserve-slider"
                      style={{ accentColor: GOLD }}
                    />
                    {/* Bar preview */}
                    <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.10)" }}>
                      <motion.div
                        animate={{ width: `${v}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, #a07a14, ${GOLD_BRIGHT})`, boxShadow: `0 0 4px ${GOLD}66` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer: total + actions */}
            <div className="mt-6 pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{ borderColor: "rgba(212,175,55,0.15)" }}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Total</span>
                <span className="text-2xl font-extrabold font-mono"
                  style={{ color: sumOk ? GOLD_BRIGHT : "#f97316" }}>
                  {totalRounded.toFixed(2)}%
                </span>
                {sumOk ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Balanced
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Off by {(100 - totalRounded).toFixed(2)}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  disabled={!dirty || saving}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border transition-colors disabled:opacity-30"
                  style={{ color: "#cbd5e1", borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
                  <RotateCcw className="w-3 h-3" /> Revert
                </button>
                <button
                  type="button"
                  onClick={commit}
                  disabled={!isChairman || saving || !dirty || !sumOk}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: GOLD, color: "#0a0805" }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Commit to Grid
                </button>
              </div>
            </div>

            {/* Inline error / success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 px-3 py-2 rounded-md text-[11px] flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)", color: "#fca5a5" }}>
                  <AlertTriangle className="w-3.5 h-3.5" /> {error}
                </motion.div>
              )}
              {savedAt && !error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 px-3 py-2 rounded-md text-[11px] flex items-center gap-2"
                  style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.30)", color: GOLD_BRIGHT }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Marcus has acknowledged the recalibration.
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <style>{`
          .reserve-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(212,175,55,0.45), rgba(212,175,55,0.10));
            outline: none;
          }
          .reserve-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px; height: 14px;
            border-radius: 50%;
            background: ${GOLD_BRIGHT};
            border: 1px solid #0a0805;
            box-shadow: 0 0 0 1px ${GOLD}, 0 0 8px ${GOLD}88;
            cursor: pointer;
          }
          .reserve-slider::-moz-range-thumb {
            width: 14px; height: 14px;
            border-radius: 50%;
            background: ${GOLD_BRIGHT};
            border: 1px solid #0a0805;
            box-shadow: 0 0 0 1px ${GOLD}, 0 0 8px ${GOLD}88;
            cursor: pointer;
          }
          .reserve-slider:disabled { opacity: 0.4; cursor: not-allowed; }
        `}</style>
      </div>
    </section>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
