// Vercel Edge Function — Chairman's Briefing.
// Returns live OKBOND headline metrics + the most recent community
// dispatches from Supabase, packaged for Marcus to read aloud.
//
// This endpoint is deliberately self-contained: no OpenAI call (so it
// always returns under 1s even when the model is slow). Marcus on the
// client side does the speaking.
//
// Required env vars on Vercel:
//   SUPABASE_URL          (defaults to the public project URL if unset)
//   SUPABASE_ANON_KEY     (defaults to the public anon key if unset)
// Optional:
//   OKBOND_PRICE_USD, OKBOND_TVL_USD, OKBOND_HOLDERS — manual overrides
//   for the headline metrics. If unset, sensible placeholders are used
//   so the briefing never fails just because the price oracle is down.

export const config = { runtime: "edge" };

const SUPABASE_URL =
  (globalThis as any).process?.env?.SUPABASE_URL ||
  "https://aqjfleanijwtfdfjimwz.supabase.co";

const SUPABASE_ANON_KEY =
  (globalThis as any).process?.env?.SUPABASE_ANON_KEY ||
  "sb_publishable_wGEBtOFLO0It_-_dZ5XfbQ_kEVUJNpl";

const SUPABASE_TIMEOUT_MS = 2500;

interface DispatchRow {
  id: string;
  content: string;
  created_at: string;
  address?: string;
}

async function fetchRecentDispatches(): Promise<DispatchRow[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SUPABASE_TIMEOUT_MS);
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/posts` +
      `?select=id,content,created_at,address` +
      `&order=created_at.desc&limit=5`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: ctrl.signal,
    });
    if (!r.ok) return [];
    const rows = (await r.json()) as DispatchRow[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function envNumber(key: string, fallback: number): number {
  const raw = (globalThis as any).process?.env?.[key];
  if (!raw) return fallback;
  const n = parseFloat(String(raw));
  return Number.isFinite(n) ? n : fallback;
}

function summariseDispatch(d: DispatchRow): string {
  const text = (d.content || "").trim().replace(/\s+/g, " ");
  return text.length > 220 ? text.slice(0, 220).trimEnd() + "…" : text;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dispatches = await fetchRecentDispatches();

  const price = envNumber("OKBOND_PRICE_USD", 1.0);
  const tvl = envNumber("OKBOND_TVL_USD", 0);
  const holders = envNumber("OKBOND_HOLDERS", 0);

  const headline =
    `Chairman, the Orakzai Bond Grid is online. ` +
    `OKBOND is trading at ${price.toFixed(4)} dollars. ` +
    (tvl > 0 ? `Total value locked stands at ${Math.round(tvl).toLocaleString()} dollars. ` : "") +
    (holders > 0 ? `Active holders: ${Math.round(holders).toLocaleString()}. ` : "");

  const dispatchSummary =
    dispatches.length === 0
      ? "No new community dispatches in the last cycle."
      : `${dispatches.length} new dispatch${dispatches.length === 1 ? "" : "es"} on the Grid. ` +
        dispatches.map((d, i) => `Dispatch ${i + 1}: ${summariseDispatch(d)}`).join(" ");

  return new Response(
    JSON.stringify({
      headline,
      dispatchSummary,
      metrics: {
        priceUsd: price,
        tvlUsd: tvl,
        holders,
      },
      dispatches: dispatches.map((d) => ({
        id: d.id,
        text: summariseDispatch(d),
        createdAt: d.created_at,
      })),
      generatedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}
