/**
 * marcusBus — one-tap escalation channel for the Chairman to command Marcus.
 *
 * Escalations dispatched here are:
 *  1. Persisted to localStorage (so they survive reload)
 *  2. Broadcast as a CustomEvent on `window` (so MarcusAILiveLog can react live)
 *
 * Privacy: this is a client-side bus only. Writes are gated by AdminGate,
 * never exposed to non-admin sessions.
 */

export type EscalationLevel = "ALERT" | "CRITICAL" | "EXEC" | "BROADCAST";

export interface MarcusEscalation {
  id: string;
  ts: number;
  level: EscalationLevel;
  msg: string;
  source: "threat-console" | "vault" | "manual";
  meta?: Record<string, unknown>;
}

const KEY = "okbond.marcus.escalations.v1";
const MAX = 50;
export const ESCALATION_EVENT = "marcus:escalation";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function pushEscalation(e: Omit<MarcusEscalation, "id" | "ts">): MarcusEscalation {
  const item: MarcusEscalation = { ...e, id: uuid(), ts: Date.now() };
  try {
    const arr = loadEscalations();
    arr.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX)));
  } catch { /* ignore quota */ }
  try {
    window.dispatchEvent(new CustomEvent(ESCALATION_EVENT, { detail: item }));
  } catch { /* SSR-safe */ }
  return item;
}

export function loadEscalations(): MarcusEscalation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function clearEscalations(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("marcus:escalation:cleared"));
  } catch { /* ignore */ }
}
