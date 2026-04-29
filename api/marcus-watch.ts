// Vercel Edge Function — Marcus daily heartbeat (cron target).
// vercel.json schedules this at 0 0 * * * (midnight UTC). Its only job is
// to confirm Marcus's brain and the Supabase link are reachable, so a
// failed cron alert in Vercel surfaces real outages early.

export const config = { runtime: "edge" };

const SUPABASE_URL =
  (globalThis as any).process?.env?.SUPABASE_URL ||
  "https://aqjfleanijwtfdfjimwz.supabase.co";

const SUPABASE_ANON_KEY =
  (globalThis as any).process?.env?.SUPABASE_ANON_KEY ||
  "sb_publishable_wGEBtOFLO0It_-_dZ5XfbQ_kEVUJNpl";

async function pingSupabase(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: ctrl.signal,
      },
    );
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

async function pingOpenAI(): Promise<boolean> {
  const key = (globalThis as any).process?.env?.OPENAI_API_KEY;
  if (!key) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

export default async function handler(_req: Request): Promise<Response> {
  const [supabaseOk, openaiOk] = await Promise.all([
    pingSupabase(),
    pingOpenAI(),
  ]);

  const ok = supabaseOk && openaiOk;
  return new Response(
    JSON.stringify({
      ok,
      checks: { supabase: supabaseOk, openai: openaiOk },
      timestamp: new Date().toISOString(),
    }),
    {
      status: ok ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}
