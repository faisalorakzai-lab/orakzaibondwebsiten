/**
 * api/marcus-watch.ts — Marcus Auto-Defense Layer (24/7 sentry).
 *
 * Runs as:
 *   • Vercel Cron (vercel.json → "/api/marcus-watch" hourly)
 *   • Client poll from MarcusDefensePanel (every 60s while Chairman is on the page)
 *
 * Detection:
 *   1. WHALE TRANSFER — any OKBOND Transfer >= 0.1% of total supply since the
 *      last block we checked.
 *   2. OWNERSHIP CHANGE — current owner() of the lottery contract differs from
 *      what we last recorded.
 *
 * On detection (NO auto-halt — this is a notification layer only):
 *   a. Insert a Pinned Dispatch into `posts` (the existing news ticker channel).
 *      First detection of a wave uses the canonical Protocol Alpha line.
 *   b. Insert a row into `chairman_alerts` with action_required='KILL_SWITCH'.
 *      The Defense console surfaces it for the Chairman to confirm or stand-down.
 *
 * State is stored in the singleton `marcus_defense_state` row (id=1).
 *
 * Privacy & safety:
 *   • Read-only on chain. No private keys here.
 *   • The Chairman is the ONLY human who can issue a halt; this code never can.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Contract, JsonRpcProvider, formatUnits, EventLog } from "ethers";

/* ── Constants ──────────────────────────────────────────────────────────── */
const TOKEN_ADDRESS    = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const LOTTERY_ADDRESS  = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const POLYGON_RPC      = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const WHALE_PCT        = 0.001;          // 0.1% of total supply
const MAX_LOOKBACK     = 5_000;          // safety: never scan more than 5k blocks per run
const DEFAULT_LOOKBACK = 200;            // first run scans last ~200 blocks (~6 minutes)
const DISPATCH_PREFIX  = "📢 [DISPATCH] ";
const PROTOCOL_ALPHA   = "Emergency Dispatch: Security Protocol Alpha initiated. Marcus is monitoring high-velocity activity. Chairman Orakzai retains full kill-switch authority.";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
const OWNABLE_ABI = ["function owner() view returns (address)"];

/* ── Supabase ───────────────────────────────────────────────────────────── */
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Marcus Defense: missing SUPABASE_URL / SUPABASE_ANON_KEY (or VITE_*) env vars."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ── Threat detection ───────────────────────────────────────────────────── */
type Threat =
  | {
      kind: "whale_transfer";
      level: "alert" | "critical";
      summary: string;
      detail: {
        hash: string;
        block: number;
        from: string;
        to: string;
        amount: string;
        pct_supply: number;
      };
    }
  | {
      kind: "ownership_change";
      level: "critical";
      summary: string;
      detail: { previous_owner: string | null; new_owner: string };
    };

async function detectThreats(): Promise<{
  threats: Threat[];
  newBlock: number;
  newOwner: string;
  totalSupplyHuman: string;
}> {
  const provider = new JsonRpcProvider(POLYGON_RPC);
  const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const lottery = new Contract(LOTTERY_ADDRESS, OWNABLE_ABI, provider);

  const [latestBlock, totalSupplyRaw, decimalsRaw, currentOwner] = await Promise.all([
    provider.getBlockNumber(),
    token.totalSupply() as Promise<bigint>,
    token.decimals() as Promise<bigint>,
    lottery.owner() as Promise<string>,
  ]);

  const decimals = Number(decimalsRaw);
  const totalSupply = Number(formatUnits(totalSupplyRaw, decimals));
  const whaleThreshold = totalSupply * WHALE_PCT;

  // Read prior state
  const supabase = getSupabase();
  const { data: stateRow } = await supabase
    .from("marcus_defense_state")
    .select("last_block_checked, last_known_owner")
    .eq("id", 1)
    .maybeSingle();

  const lastBlock = stateRow?.last_block_checked
    ? Number(stateRow.last_block_checked)
    : latestBlock - DEFAULT_LOOKBACK;
  const fromBlock = Math.max(lastBlock + 1, latestBlock - MAX_LOOKBACK);
  const lastOwner = stateRow?.last_known_owner ?? null;

  const threats: Threat[] = [];

  // (1) Ownership-change detection
  const ownerNow = currentOwner.toLowerCase();
  if (lastOwner && lastOwner.toLowerCase() !== ownerNow) {
    threats.push({
      kind: "ownership_change",
      level: "critical",
      summary: `Lottery contract owner changed from ${shorten(lastOwner)} to ${shorten(ownerNow)}.`,
      detail: { previous_owner: lastOwner, new_owner: ownerNow },
    });
  }

  // (2) Whale Transfer detection (skip on first run to avoid backfill noise)
  if (stateRow?.last_block_checked && fromBlock <= latestBlock) {
    const filter = token.filters.Transfer();
    const logs = (await token.queryFilter(filter, fromBlock, latestBlock)) as EventLog[];
    for (const log of logs) {
      const args = log.args as unknown as { from: string; to: string; value: bigint };
      const amountHuman = Number(formatUnits(args.value, decimals));
      const pct = totalSupply > 0 ? amountHuman / totalSupply : 0;
      if (amountHuman >= whaleThreshold) {
        threats.push({
          kind: "whale_transfer",
          level: pct >= WHALE_PCT * 5 ? "critical" : "alert",
          summary: `Whale transfer ${amountHuman.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })} OKBOND (${(pct * 100).toFixed(2)}% of supply) from ${shorten(
            args.from
          )} to ${shorten(args.to)}.`,
          detail: {
            hash: log.transactionHash,
            block: log.blockNumber,
            from: args.from,
            to: args.to,
            amount: amountHuman.toString(),
            pct_supply: pct,
          },
        });
      }
    }
  }

  return {
    threats,
    newBlock: latestBlock,
    newOwner: ownerNow,
    totalSupplyHuman: totalSupply.toLocaleString(undefined, { maximumFractionDigits: 0 }),
  };
}

/* ── Dispatch & alert writers ───────────────────────────────────────────── */
async function recordThreats(threats: Threat[]): Promise<void> {
  if (threats.length === 0) return;
  const supabase = getSupabase();

  // 1. Pinned Dispatch (first one of the wave uses Protocol Alpha)
  await supabase.from("posts").insert({
    address: "0x9b02e2edd6f58d626aaa91889708dbf39dfa8cd7",
    content: `${DISPATCH_PREFIX}${PROTOCOL_ALPHA}`,
    image_url: null,
  });

  // 2. One Chairman alert per threat
  await supabase.from("chairman_alerts").insert(
    threats.map((t) => ({
      level: t.level,
      kind: t.kind,
      summary: t.summary,
      detail: t.detail,
      action_required: "KILL_SWITCH",
    }))
  );
}

async function persistState(
  newBlock: number,
  newOwner: string,
  threats: Threat[],
  totalSupplyHuman: string
): Promise<void> {
  const supabase = getSupabase();
  const { data: cur } = await supabase
    .from("marcus_defense_state")
    .select("total_runs, total_threats_detected")
    .eq("id", 1)
    .maybeSingle();

  await supabase
    .from("marcus_defense_state")
    .update({
      last_block_checked: newBlock,
      last_known_owner: newOwner,
      last_run_at: new Date().toISOString(),
      total_runs: (cur?.total_runs ?? 0) + 1,
      total_threats_detected:
        (cur?.total_threats_detected ?? 0) + threats.length,
      last_run_summary: {
        block: newBlock,
        owner: newOwner,
        total_supply: totalSupplyHuman,
        threats_detected: threats.length,
        ran_at: new Date().toISOString(),
      },
    })
    .eq("id", 1);
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function shorten(addr: string): string {
  if (!addr) return "?";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* ── Handler ────────────────────────────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const { threats, newBlock, newOwner, totalSupplyHuman } = await detectThreats();
    await recordThreats(threats);
    await persistState(newBlock, newOwner, threats, totalSupplyHuman);
    res.status(200).json({
      ok: true,
      block: newBlock,
      owner: newOwner,
      total_supply: totalSupplyHuman,
      threats_detected: threats.length,
      threats,
      ran_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: msg });
  }
}
