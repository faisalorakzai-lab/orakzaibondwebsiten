/// <reference lib="dom" />
declare const process: { env: Record<string, string | undefined> };

import { Contract, Interface, JsonRpcProvider, getAddress, isAddress } from "ethers";

export const config = { runtime: "edge" };

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://aqjfleanijwtfdfjimwz.supabase.co").replace(/\/$/, "");
const ICO_ADDRESS = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const RPC_URL = "https://polygon-bor-rpc.publicnode.com";
const ZERO = "0x0000000000000000000000000000000000000000";
const EVENT_IFACE = new Interface([
  "event TokensPurchased(address indexed buyer,uint256 polAmount,uint256 tokens,address indexed referrer)",
]);
const ICO_IFACE = new Interface([
  "function referralCount(address user) view returns (uint256)",
  "function getReferralEarnings(address user) view returns (uint256)",
]);
const WINDOW_MS = 10 * 60 * 1000;
const rateWindows = new Map<string, { start: number; count: number }>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
function configured() { return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null; }
function limited(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now(); const item = rateWindows.get(ip);
  if (!item || now - item.start > 60_000) { rateWindows.set(ip, { start: now, count: 1 }); return false; }
  item.count += 1; return item.count > 20;
}
function wallet(value: unknown) { return typeof value === "string" && isAddress(value) ? getAddress(value) : null; }
function txHash(value: unknown) { return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value) ? value : null; }
async function db(path: string, key: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json", ...(init?.headers || {}) } });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  if (limited(req)) return json({ error: "Too many requests" }, 429);
  const key = configured();
  if (!key) return json({ error: "Referral backend is not configured" }, 503);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const hash = txHash(body?.txHash);
  if (!hash) return json({ error: "A confirmed Polygon transaction hash is required" }, 400);

  try {
    const provider = new JsonRpcProvider(RPC_URL, { chainId: 137, name: "polygon" });
    const receipt = await provider.getTransactionReceipt(hash);
    if (!receipt || receipt.status !== 1) return json({ error: "Transaction is not confirmed successfully" }, 400);
    const relevant = receipt.logs.filter((log) => log.address.toLowerCase() === ICO_ADDRESS.toLowerCase());
    let event: any = null; let logIndex = -1;
    for (const log of relevant) {
      try { const parsed = EVENT_IFACE.parseLog({ topics: [...log.topics], data: log.data }); if (parsed?.name === "TokensPurchased") { event = parsed; logIndex = log.index; break; } } catch { /* unrelated ICO log */ }
    }
    if (!event || logIndex < 0) return json({ error: "No verified TokensPurchased event found" }, 400);
    const buyer = getAddress(event.args.buyer); const referrer = getAddress(event.args.referrer);
    if (referrer === ZERO || buyer.toLowerCase() === referrer.toLowerCase()) return json({ recorded: false, reason: "No qualifying referrer" });
    const contract = new Contract(ICO_ADDRESS, ICO_IFACE, provider);
    const [count, earnings, block] = await Promise.all([
      contract.referralCount(referrer), contract.getReferralEarnings(referrer), provider.getBlock(receipt.blockNumber),
    ]);
    const row = {
      chain_id: 137, contract_address: ICO_ADDRESS, tx_hash: hash, log_index: logIndex,
      block_number: receipt.blockNumber, buyer_wallet: buyer, referrer_wallet: referrer,
      pol_amount: event.args.polAmount.toString(), token_amount: event.args.tokens.toString(),
      event_timestamp: block?.timestamp ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
      verification_status: "verified",
    };
    const inserted = await db("referral_qualifying_events", key, { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify(row) });
    if (!inserted.ok && inserted.status !== 409) return json({ error: "Could not persist verified referral event" }, 502);
    const snapshot = await db("referral_commission_snapshots", key, { method: "POST", body: JSON.stringify({ wallet_address: referrer, source_contract: ICO_ADDRESS, aggregate_earnings: earnings.toString(), aggregate_referral_count: count.toString(), source_block: receipt.blockNumber }) });
    if (!snapshot.ok) return json({ error: "Event verified but snapshot persistence failed" }, 502);
    return json({ recorded: true, buyer, referrer, txHash: hash, aggregateReferralCount: count.toString(), aggregateEarnings: earnings.toString() });
  } catch (error) {
    console.error("referral verification failed", error);
    return json({ error: "Referral verification failed" }, 502);
  }
}
