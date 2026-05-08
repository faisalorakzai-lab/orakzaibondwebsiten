/**
 * reserveAllocations — Live Asset Control bridge between the Founder's Vault
 * and the public ReserveWidget, backed by Supabase + Realtime.
 *
 *   • fetchAllocations()         — returns the current asset breakdown
 *   • updateAllocations()        — writes a new snapshot (Chairman-only)
 *   • subscribeAllocations(cb)   — live channel; fires on any change
 *
 * The ReserveWidget calls fetch + subscribe so it reflects edits instantly
 * with no redeploy. The Reserve Control Panel inside the Founder's Vault
 * calls updateAllocations() with the connected wallet's address; RLS in
 * migration 007 ensures only the Chairman wallet can write.
 */

import { supabase } from "./supabase";
import { ADMIN_WALLET } from "./adminAuth";

export interface ReserveAllocation {
  asset_key: string;        // 'real_estate' | 'on_chain' | 'liquidity' | 'pol' | …
  label: string;            // 'Real Estate'
  pct: number;              // 0..100, two decimals
  hint: string | null;      // tooltip / sub-label
  display_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface AllocationUpdate {
  asset_key: string;
  pct: number;
}

/** Default snapshot (used as a graceful fallback if Supabase is unreachable). */
export const DEFAULT_ALLOCATIONS: ReserveAllocation[] = [
  { asset_key: "real_estate", label: "Real Estate",      pct: 38, hint: "Orakzai Group land bank",   display_order: 1, updated_at: "", updated_by: null },
  { asset_key: "on_chain",    label: "On-Chain Reserve", pct: 27, hint: "Multisig treasury wallet",  display_order: 2, updated_at: "", updated_by: null },
  { asset_key: "liquidity",   label: "Liquidity Pools",  pct: 18, hint: "QuickSwap V3 + Uniswap",    display_order: 3, updated_at: "", updated_by: null },
  { asset_key: "pol",         label: "Treasury POL",     pct: 17, hint: "Liquid POL reserves",       display_order: 4, updated_at: "", updated_by: null },
];

/** Fetch the current allocations sorted by display_order. */
export async function fetchAllocations(): Promise<ReserveAllocation[]> {
  const { data, error } = await supabase
    .from("reserve_allocations")
    .select("asset_key, label, pct, hint, display_order, updated_at, updated_by")
    .order("display_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_ALLOCATIONS;
  }
  return data.map((row) => ({
    asset_key:     row.asset_key,
    label:         row.label,
    pct:           Number(row.pct),
    hint:          row.hint,
    display_order: row.display_order,
    updated_at:    row.updated_at,
    updated_by:    row.updated_by,
  }));
}

/**
 * Subscribe to live changes. Returns an unsubscribe function.
 * The callback receives the freshly-refetched, sorted allocation list.
 */
export function subscribeAllocations(
  onChange: (allocations: ReserveAllocation[]) => void,
): () => void {
  const channel = supabase
    .channel("reserve_allocations:live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reserve_allocations" },
      async () => {
        const next = await fetchAllocations();
        onChange(next);
      },
    )
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
}

/**
 * Apply a full snapshot atomically: every asset_key in `updates` is upserted
 * (UPDATE if it exists, INSERT if not) with the supplied pct + author.
 *
 * @param updates       one entry per asset to change
 * @param walletAddress the connected wallet — must equal Chairman or RLS rejects
 * @param note          optional human-readable note recorded in the audit table
 *
 * Throws on validation or Supabase error. Caller should display the message.
 */
export async function updateAllocations(
  updates: AllocationUpdate[],
  walletAddress: string,
  note?: string,
): Promise<ReserveAllocation[]> {
  if (!walletAddress) {
    throw new Error("No wallet connected.");
  }
  const author = walletAddress.toLowerCase();
  if (author !== ADMIN_WALLET.toLowerCase()) {
    throw new Error("Only the Chairman wallet can recalibrate the Reserve.");
  }
  if (!updates.length) {
    throw new Error("Nothing to update.");
  }

  // Validate each row
  for (const u of updates) {
    if (typeof u.pct !== "number" || isNaN(u.pct)) {
      throw new Error(`Invalid % for ${u.asset_key}.`);
    }
    if (u.pct < 0 || u.pct > 100) {
      throw new Error(`${u.asset_key}: % must be 0–100.`);
    }
  }

  // Read current rows to merge label/hint/order with any unmentioned assets.
  const current = await fetchAllocations();
  const byKey = new Map(current.map((a) => [a.asset_key, a]));

  // Build the merged snapshot used for both the UPSERT and the audit row.
  const merged: ReserveAllocation[] = current.map((a) => {
    const u = updates.find((x) => x.asset_key === a.asset_key);
    return u ? { ...a, pct: round2(u.pct) } : a;
  });

  // Allow brand-new asset_keys (not currently in the table) to be inserted too.
  for (const u of updates) {
    if (!byKey.has(u.asset_key)) {
      merged.push({
        asset_key: u.asset_key,
        label: u.asset_key,
        pct: round2(u.pct),
        hint: null,
        display_order: merged.length + 1,
        updated_at: "",
        updated_by: null,
      });
    }
  }

  // Sum-to-100 sanity check (allow ±0.5 to absorb rounding).
  const total = merged.reduce((s, a) => s + a.pct, 0);
  if (Math.abs(total - 100) > 0.5) {
    throw new Error(
      `Allocations must total 100% (current sum: ${total.toFixed(2)}%).`,
    );
  }

  // Upsert every row that we changed (and only those) with the author claim
  // populated so the RLS policy lets the write through.
  const upsertPayload = updates.map((u) => {
    const existing = byKey.get(u.asset_key);
    return {
      asset_key:     u.asset_key,
      label:         existing?.label ?? u.asset_key,
      pct:           round2(u.pct),
      hint:          existing?.hint ?? null,
      display_order: existing?.display_order ?? merged.length,
      updated_by:    author,
    };
  });

  const { error: upsertError } = await supabase
    .from("reserve_allocations")
    .upsert(upsertPayload, { onConflict: "asset_key" });

  if (upsertError) {
    throw new Error(upsertError.message || "Failed to write allocations.");
  }

  // Best-effort audit trail (do not block the UI on failure).
  const snapshot = Object.fromEntries(merged.map((a) => [a.asset_key, a.pct]));
  await supabase
    .from("reserve_allocation_history")
    .insert({
      snapshot,
      total_pct: round2(total),
      updated_by: author,
      note: note ?? null,
    });

  return merged;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
