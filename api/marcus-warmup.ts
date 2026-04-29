export const config = { runtime: "edge" };

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL_DEFAULT = "gemini-2.0-flash";

const json = (status: number, body: unknown, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      ...extraHeaders,
    },
  });

async function pingGemini(apiKey: string, model: string): Promise<{ ok: boolean; ms: number; reason?: string }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1500);
  try {
    const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 1, temperature: 0 },
      }),
    });
    return { ok: r.ok || r.status === 400, ms: Date.now() - started, reason: r.ok ? undefined : `http_${r.status}` };
  } catch (err) {
    return { ok: false, ms: Date.now() - started, reason: (err as Error)?.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "HEAD") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const started = Date.now();
  const env = (process as any)?.env ?? {};
  const apiKey: string | undefined = env.GEMINI_API_KEY;
  const model: string = env.GEMINI_MODEL || GEMINI_MODEL_DEFAULT;

  let upstream: { ok: boolean; ms: number; reason?: string } = { ok: false, ms: 0, reason: "no_key" };
  if (apiKey) {
    upstream = await pingGemini(apiKey, model);
  }

  return json(200, {
    ok: true,
    warmed: upstream.ok,
    upstreamMs: upstream.ms,
    upstreamReason: upstream.reason,
    model,
    edgeMs: Date.now() - started,
    ts: Date.now(),
  });
}
