/**
 * marcusDefense — client-side bridge to the Marcus Auto-Defense Layer.
 *
 *   • fetchDefenseState()      → singleton state row (last block, last owner, run counters)
 *   • fetchPendingAlerts()     → unacknowledged Chairman alerts (newest first)
 *   • fetchRecentAlerts(n)     → newest n alerts including acknowledged
 *   • runWatchNow()            → POST /api/marcus-watch (manual trigger)
 *   • acknowledgeAlert(id, …)  → mark alert handled with the Chairman's command
 *
 * All Supabase reads use the existing anon client. Writes for ack are gated by
 * the AdminGate-rendered UI (only the Chairman wallet sees the buttons).
 */

import { supabase } from "./supabase";

export interface DefenseState {
  id: number;
  last_block_checked: number | null;
  last_known_owner: string | null;
  last_run_at: string | null;
  total_runs: number;
  total_threats_detected: number;
  last_run_summary: {
    block?: number;
    owner?: string;
    total_supply?: string;
    threats_detected?: number;
    ran_at?: string;
  } | null;
}

export type AlertLevel = "watch" | "alert" | "critical";
export type AlertKind = "whale_transfer" | "ownership_change" | "manual";
export type ChairmanCommand = "CONFIRM_KILL_SWITCH" | "STAND_DOWN";

export interface ChairmanAlert {
  id: string;
  level: AlertLevel;
  kind: AlertKind;
  summary: string;
  detail: Record<string, unknown> | null;
  action_required: string | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  chairman_command: ChairmanCommand | null;
  created_at: string;
}

export async function fetchDefenseState(): Promise<DefenseState | null> {
  const { data, error } = await supabase
    .from("marcus_defense_state")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DefenseState | null) ?? null;
}

export async function fetchPendingAlerts(): Promise<ChairmanAlert[]> {
  const { data, error } = await supabase
    .from("chairman_alerts")
    .select("*")
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) throw new Error(error.message);
  return (data as ChairmanAlert[] | null) ?? [];
}

export async function fetchRecentAlerts(limit = 25): Promise<ChairmanAlert[]> {
  const { data, error } = await supabase
    .from("chairman_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as ChairmanAlert[] | null) ?? [];
}

export interface WatchResponse {
  ok: boolean;
  block?: number;
  owner?: string;
  total_supply?: string;
  threats_detected?: number;
  ran_at?: string;
  error?: string;
}

export async function runWatchNow(): Promise<WatchResponse> {
  const r = await fetch("/api/marcus-watch", { method: "POST" });
  return (await r.json()) as WatchResponse;
}

export async function acknowledgeAlert(
  alertId: string,
  chairmanWallet: string,
  command: ChairmanCommand,
): Promise<void> {
  const { error } = await supabase
    .from("chairman_alerts")
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: chairmanWallet.toLowerCase(),
      chairman_command: command,
    })
    .eq("id", alertId);
  if (error) throw new Error(error.message);
}
