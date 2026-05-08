/**
 * adminAuth — wallet-address-only verification for the OKBOND Admin Panel.
 *
 * Per Chairman's directive (Apr 2026): the on-chain signature step has been
 * removed. The Admin Panel now grants access purely by verifying that the
 * connected wallet equals ADMIN_WALLET. No Polygon Mainnet network gate, no
 * signMessage prompt, no gas. Session lives in sessionStorage for 1 hour.
 *
 * Threat model: this is a UI gate only. The Admin Panel itself must rely on
 * server-side authorisation (e.g. RLS policies) for any sensitive write —
 * client-side gating alone never protects data. This file intentionally keeps
 * the API surface (signAdminProof, isProofValid, loadAdminProof, etc.) so
 * existing callers don't need to change.
 */

import type { BrowserProvider } from "ethers";

export const ADMIN_WALLET = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";

const PROOF_KEY = "okbond.admin.siwe.v1";
const PROOF_TTL_MS = 60 * 60 * 1000;

export interface AdminProof {
  address: string;
  /** Retained for backward compatibility; populated with a human-readable note. */
  message: string;
  /** Retained for backward compatibility; empty string in address-only mode. */
  signature: string;
  issuedAt: number;
  expiresAt: number;
}

export function isAdminAddress(address: string | null | undefined): boolean {
  return !!address && address.toLowerCase() === ADMIN_WALLET.toLowerCase();
}

/**
 * Verify the connected wallet and persist a session proof. The `provider`
 * argument is accepted for backward compatibility but is no longer used —
 * we never request a signature.
 */
export async function signAdminProof(_provider: BrowserProvider | unknown, address: string): Promise<AdminProof> {
  if (!isAdminAddress(address)) {
    throw new Error("Connected wallet is not authorized.");
  }
  const issuedAt = Date.now();
  const expiresAt = issuedAt + PROOF_TTL_MS;
  const proof: AdminProof = {
    address: address.toLowerCase(),
    message: "Address-verified admin session (Orakzai Bond)",
    signature: "",
    issuedAt,
    expiresAt,
  };
  saveAdminProof(proof);
  return proof;
}

export function saveAdminProof(proof: AdminProof): void {
  try {
    sessionStorage.setItem(PROOF_KEY, JSON.stringify(proof));
  } catch {
    /* sessionStorage unavailable — proof will live only in memory for this render */
  }
}

export function clearAdminProof(): void {
  try {
    sessionStorage.removeItem(PROOF_KEY);
  } catch {
    /* ignore */
  }
}

export function loadAdminProof(): AdminProof | null {
  try {
    const raw = sessionStorage.getItem(PROOF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminProof;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.address) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isProofValid(proof: AdminProof | null, address: string | null | undefined): proof is AdminProof {
  if (!proof) return false;
  if (Date.now() >= proof.expiresAt) return false;
  if (!isAdminAddress(proof.address)) return false;
  if (!isAdminAddress(address)) return false;
  if (proof.address.toLowerCase() !== address!.toLowerCase()) return false;
  return true;
}
