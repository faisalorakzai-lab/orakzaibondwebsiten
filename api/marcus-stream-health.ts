// Vercel Edge Function — pre-warm probe for /api/marcus-stream.
//
// Runs in the SAME Edge file family as marcus-stream.ts (both are .ts edge
// functions in /api), so repeatedly hitting this endpoint also keeps the
// streamGenerateContent code-path warm in the JavaScript isolate cache.
// More importantly, it pre-opens a TLS socket to Google so the first real
// SSE call doesn't pay the ~150–300ms handshake.
//
// Returns immediately with a tiny JSON body. NEVER fails the request even
// if the Gemini probe fails. Safe to call from anywhere, repeatedly.

export const config = { runtime: "edge" };

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL_DEFAULT = "gemini-2.0-flash";
const PROBE_TIMEOUT_MS = 1500;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "access-control-allow-origin": "*",
    },
  });

async function probeStreamingHandshake(
  apiKey: string,
  model: string,
): Promise<{ ok: boolean; ms: number; reason?: string; firstByteMs?: number }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    const url =
      `${GEMINI_BASE}/models/${encodeURIComponent(model)}` +
      `:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 1 },
      }),
    });
    // Read just one chunk to confirm the SSE pipe is hot, then bail.
    let firstByteMs: number | undefined;
    if (r.ok && r.body) {
      const reader = r.body.getReader();
      const { value } = await reader.read();
      firstByteMs = Date.now() - started;
      if (value) {
        // intentionally ignore content — we just needed the socket open
      }
      try { await reader.cancel(); } catch { /* noop */ }
    }
    return {
      ok: r.ok || r.status === 400,
      ms: Date.now() - started,
      firstByteMs,
      reason: r.ok ? undefined : `http_${r.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - started,
      reason: (err as Error)?.name === "AbortError" ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, HEAD, OPTIONS",
        "access-control-allow-headers": "Content-Type",
      },
    });
  }
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "HEAD") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const started = Date.now();
  const env = (globalThis as any).process?.env ?? {};
  const apiKey: string | undefined = env.GEMINI_API_KEY;
  const model: string = env.GEMINI_MODEL || GEMINI_MODEL_DEFAULT;

  let probe: { ok: boolean; ms: number; reason?: string; firstByteMs?: number } = {
    ok: false,
    ms: 0,
    reason: "no_key",
  };
  if (apiKey) {
    probe = await probeStreamingHandshake(apiKey, model);
  }

  return json(200, {
    ok: true,
    streamWarmed: probe.ok,
    streamFirstByteMs: probe.firstByteMs,
    streamUpstreamMs: probe.ms,
    streamReason: probe.reason,
    model,
    edgeMs: Date.now() - started,
    ts: Date.now(),
  });
}
