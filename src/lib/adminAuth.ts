import { BrowserProvider, verifyMessage } from "ethers";

export const ADMIN_WALLET = "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7";

const PROOF_KEY = "okbond.admin.siwe.v1";
const PROOF_TTL_MS = 60 * 60 * 1000;

export interface AdminProof {
  address: string;
  message: string;
  signature: string;
  issuedAt: number;
  expiresAt: number;
}

export function isAdminAddress(address: string | null | undefined): boolean {
  return !!address && address.toLowerCase() === ADMIN_WALLET.toLowerCase();
}

function getOrigin(): string {
  if (typeof window !== "undefined" && window.location) {
    return window.location.host || "okbond.local";
  }
  return "okbond.local";
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function buildSiweMessage(address: string, nonce: string, issuedAt: number, expiresAt: number): string {
  const domain = getOrigin();
  const issuedISO = new Date(issuedAt).toISOString();
  const expiresISO = new Date(expiresAt).toISOString();
  return [
    `${domain} wants you to sign in with your Polygon account:`,
    address,
    "",
    "Sign in to access the OKBOND Admin Panel. This will not trigger a blockchain transaction or cost gas.",
    "",
    `URI: https://${domain}`,
    `Version: 1`,
    `Network: Polygon Mainnet`,
    `Chain ID: 137`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedISO}`,
    `Expiration Time: ${expiresISO}`,
    `Resources:`,
    `- okbond:admin-panel`,
  ].join("\n");
}

export async function signAdminProof(provider: BrowserProvider, address: string): Promise<AdminProof> {
  if (!isAdminAddress(address)) {
    throw new Error("Connected wallet is not authorized.");
  }
  const issuedAt = Date.now();
  const expiresAt = issuedAt + PROOF_TTL_MS;
  const nonce = randomNonce();
  const message = buildSiweMessage(address, nonce, issuedAt, expiresAt);
  const signer = await provider.getSigner();
  const signature = await signer.signMessage(message);

  let recovered: string;
  try {
    recovered = verifyMessage(message, signature);
  } catch {
    throw new Error("Signature could not be verified.");
  }
  if (recovered.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    throw new Error("Signature does not match the admin wallet.");
  }

  const proof: AdminProof = { address: recovered, message, signature, issuedAt, expiresAt };
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
    if (!parsed.message || !parsed.signature || !parsed.address) return null;
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
  try {
    const recovered = verifyMessage(proof.message, proof.signature);
    return recovered.toLowerCase() === ADMIN_WALLET.toLowerCase();
  } catch {
    return false;
  }
}
