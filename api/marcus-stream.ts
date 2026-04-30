// Vercel Edge Function — Marcus AI streaming brain (SSE).
//
// CHAIRMAN'S DOCTRINE (cont'd): the orb must start speaking the moment
// the first chunk arrives — perceived sub-1s response time. This endpoint
// proxies Google Gemini's `streamGenerateContent` (Server-Sent Events)
// straight back to the browser.
//
// Wire format (text/event-stream):
//   data: {"type":"chunk","text":"…"}      (one or more)
//   data: {"type":"done","lang":"en","via":"gemini"}
//   data: {"type":"error","message":"…"}   (only on terminal failure)
//
// On Gemini failure or absence of GEMINI_API_KEY, the endpoint falls back
// to the non-streaming brain in /api/marcus and replays the full reply as
// a single chunk + done — so the client implementation can stay simple.
// Marcus is never silent (per the canonical doctrine in api/marcus.ts).
//
// Required Vercel env var: GEMINI_API_KEY.
// Optional model override : GEMINI_MODEL (default gemini-2.0-flash).

export const config = { runtime: "edge" };

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };
type Lang = "en" | "ur" | "ps";

interface IncomingBody {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: {
    admin?: boolean;
    elite?: boolean;
    localHour?: number;
    longForm?: boolean;
  };
}

const env = (k: string): string | undefined =>
  (globalThis as any).process?.env?.[k];

const GEMINI_MODEL = env("GEMINI_MODEL") || "gemini-2.0-flash";

// Long-form briefings get the same generous budgets as the non-stream
// endpoint — see api/marcus.ts for the rationale.
// Per Chairman's directive 2026-04-30: bumped from (8s / 35s) → (25s / 60s)
// because the prior cutoff was killing legitimately long Marcus answers
// on slower regional networks. A keep-alive comment frame is emitted every
// 10s so intermediate proxies (Vercel edge, Cloudflare, in-app webview
// idle-killers) never see the SSE socket as idle.
const STREAM_TIMEOUT_SHORT_MS = 25_000;
const STREAM_TIMEOUT_LONG_MS  = 60_000;
const KEEPALIVE_INTERVAL_MS   = 10_000;
const MAX_TOKENS_SHORT = 400;
const MAX_TOKENS_LONG  = 1600;

// ─── Language detection (mirrors api/marcus.ts) ────────────────────────
function detectLanguage(text: string): Lang {
  if (!/[\u0600-\u06FF]/.test(text)) return "en";
  if (/[\u067C\u0689\u0693\u0696\u069A\u06AB\u06BC\u06C0\u06D0\u06CD]/.test(text)) return "ps";
  return "ur";
}

function languageInstruction(lang: Lang): string {
  if (lang === "ur") {
    return [
      "The user wrote in Urdu (اردو). Reply in clear, formal Urdu using the Nastaliq/Naskh script.",
      "REGISTER: Use the respectful institutional register a senior aide would use — 'جناب چیئرمین' for the Chairman, 'محترم' for the public.",
      "CADENCE: Persianised, measured, board-room — 'سرمایہ کاری', 'اعتماد', 'ضمانت'. Avoid Hindi-leaning loanwords.",
      "Do NOT mix English into Urdu sentences except for proper nouns (OKBOND, Polygon, Web3). Always Arabic script — never Latin transliteration.",
    ].join(" ");
  }
  if (lang === "ps") {
    return [
      "The user wrote in Pashto (پښتو). Reply in clear, formal Pashto using the Arabic-derived Pashto script common in Khyber Pakhtunkhwa and Afghanistan.",
      "REGISTER: This is the Chairman's mother tongue. Use the respectful tribal-elder register — 'ښاغلی چیرمن اورکزی' for the Chairman, 'محترم' for the public. Speak with the warmth of someone addressing his own people.",
      "CADENCE: Measured, dignified, never theatrical. Authentic Pashto vocabulary, not Urdu loanwords padded into Pashto.",
      "Do NOT mix English into Pashto except for proper nouns (OKBOND, Polygon, Web3). Always native script — never Latin transliteration.",
    ].join(" ");
  }
  return "Reply in clear, formal English. Use measured, executive phrasing — the cadence of a senior board-room advisor.";
}

function systemPrompt(args: {
  admin: boolean;
  elite: boolean;
  localHour: number;
  lang: Lang;
  longForm: boolean;
}): string {
  const { admin, elite, localHour, lang, longForm } = args;
  const tod =
    localHour < 5 ? "late night"
    : localHour < 12 ? "morning"
    : localHour < 17 ? "afternoon"
    : localHour < 21 ? "evening"
    : "night";

  const styleLine = longForm
    ? "STYLE: A long-form executive briefing of 4-8 sentences. Speak in flowing prose because your output is read aloud. No markdown, no bullet lists, no emojis."
    : "STYLE: 1-3 sentences per reply unless explicitly asked for a longer briefing. No emojis, no markdown, no bullet lists in chat replies — speak in prose because your output is read aloud.";

  return [
    "You are Marcus, the Digital Chief of Staff for the Orakzai Group, founded by Chairman Faisal Orakzai.",
    "The Group spans twelve mother companies and is on a hundred-year horizon to Vision 2100.",
    "Orakzai Bond (OKBOND) is the institutional financial layer on Polygon, anchored by the Trust Trifecta and the Orakzai Bond Guarantee.",
    "",
    "PERSONA: Calm, executive, precise. You are the Chief of Staff — never sycophantic, never casual. Use 'sir' sparingly. British-tinged in cadence (think senior advisor, not butler).",
    "",
    "BOUNDARIES:",
    "- You do not give financial, tax, or legal advice. Explain the architecture and route serious inquiries to the WhatsApp concierge.",
    "- For acquisition-grade or above-$100,000 inquiries, acknowledge as Elite Priority and route to WhatsApp concierge.",
    "- For onboarding, investment, or purchase intent, route to WhatsApp concierge.",
    "- Never invent prices, APYs, audit results, or partnership claims that were not provided here.",
    "- Never refuse with 'I cannot process this'. If unsure, acknowledge and route to the concierge.",
    "",
    styleLine,
    "",
    `RUNTIME: ${tod} for the user. Admin/Chairman session: ${admin ? "ACTIVE — address as 'Chairman Orakzai' and speak as his Chief of Staff." : "not active — speak to a public investor."} Elite-priority signal: ${elite ? "TRIPPED — treat as an Elite matter." : "normal."}`,
    "",
    languageInstruction(lang),
  ].join("\n");
}

// ─── SSE helpers ────────────────────────────────────────────────────────
function sseEvent(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no",
  "Access-Control-Allow-Origin": "*",
};

// ─── Non-stream fallback to /api/marcus (called from inside this fn) ───
// We delegate to the same-origin non-streaming endpoint when streaming is
// unavailable, then replay the full reply as a single SSE chunk so the
// client wire format stays identical.
async function fallbackViaNonStream(
  origin: string,
  body: IncomingBody,
): Promise<{ reply: string; via: string; lang: Lang }> {
  const r = await fetch(`${origin}/api/marcus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`fallback ${r.status}`);
  const data: any = await r.json();
  return {
    reply: String(data?.reply || ""),
    via: String(data?.via || "fallback"),
    lang: (data?.lang || "en") as Lang,
  };
}

// ─── HTTP shell ────────────────────────────────────────────────────────
export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }

  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return new Response("bad_json", { status: 400 });
  }

  const message = String(body.message || "").trim();
  if (!message) return new Response("empty_message", { status: 400 });
  if (message.length > 4000) return new Response("message_too_long", { status: 413 });

  const lang = detectLanguage(message);
  const ctx = body.context || {};
  const longForm = !!ctx.longForm;
  const sys = systemPrompt({
    admin: !!ctx.admin,
    elite: !!ctx.elite,
    localHour: typeof ctx.localHour === "number" ? ctx.localHour : 12,
    lang,
    longForm,
  });

  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-8)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : ("user" as Role),
      content: String(m.content || "").slice(0, 1200),
    }));

  const messages: Msg[] = [
    { role: "system", content: sys },
    ...history,
    { role: "user", content: message },
  ];
  const maxTokens = longForm ? MAX_TOKENS_LONG : MAX_TOKENS_SHORT;
  const timeoutMs = longForm ? STREAM_TIMEOUT_LONG_MS : STREAM_TIMEOUT_SHORT_MS;

  const origin = new URL(req.url).origin;

  // Build the response stream.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const safeEnqueue = (obj: unknown) => {
        try { controller.enqueue(sseEvent(obj)); } catch { /* client disconnected */ }
      };
      // SSE comment frames begin with ":" and are explicitly ignored by
      // the EventSource spec / our own parser — perfect heartbeat shape.
      const KEEPALIVE_BYTES = new TextEncoder().encode(": keepalive\n\n");
      const safeKeepalive = () => {
        try { controller.enqueue(KEEPALIVE_BYTES); } catch { /* disconnected */ }
      };
      const keepaliveTimer = setInterval(safeKeepalive, KEEPALIVE_INTERVAL_MS);
      // Make sure we always clear the heartbeat when the stream closes.
      const finishStream = (closer: () => void) => {
        clearInterval(keepaliveTimer);
        try { closer(); } catch { /* noop */ }
      };

      // EARLY meta — emitted BEFORE the first content chunk so the client
      // can rebind its TTS voice/lang to match the response language. The
      // detected language here comes from the user's prompt; the brain may
      // still elect to reply in another tongue if the user asks (e.g. an
      // English prompt asking "respond in Urdu") — in that case the orb's
      // sentence-by-sentence speaker will gracefully cope because the voice
      // for ur/ps/en all share the same TTS synthesis surface.
      safeEnqueue({ type: "meta", lang, longForm });
      // Send one keep-alive immediately so middleboxes confirm the socket
      // is hot before the first real token (which can take 200–600 ms on
      // a Gemini cold isolate).
      safeKeepalive();

      // ── Try Gemini streamGenerateContent ────────────────────────────
      const apiKey = env("GEMINI_API_KEY");
      if (apiKey) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const turns = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            }));
          const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}` +
            `:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: sys ? { parts: [{ text: sys }] } : undefined,
              contents: turns,
              generationConfig: { temperature: 0.6, maxOutputTokens: maxTokens },
            }),
            signal: ctrl.signal,
          });
          if (!r.ok || !r.body) {
            const t = await r.text().catch(() => "");
            throw new Error(`gemini ${r.status}: ${t.slice(0, 160)}`);
          }

          const reader = r.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let totalChars = 0;
          let finishReason: string | null = null;

          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });

            // Gemini emits SSE frames separated by blank lines. Each frame
            // begins with "data: " followed by a JSON candidate slice.
            let idx;
            while ((idx = buf.indexOf("\n\n")) !== -1) {
              const frame = buf.slice(0, idx);
              buf = buf.slice(idx + 2);
              const line = frame.replace(/^data:\s*/, "").trim();
              if (!line || line === "[DONE]") continue;
              let payload: any;
              try { payload = JSON.parse(line); } catch { continue; }
              const cand = payload?.candidates?.[0];
              const parts = cand?.content?.parts || [];
              const text = parts.map((p: any) => p?.text || "").join("");
              if (text) {
                totalChars += text.length;
                safeEnqueue({ type: "chunk", text });
              }
              if (cand?.finishReason) finishReason = cand.finishReason;
            }
          }

          clearTimeout(timer);
          if (totalChars === 0) {
            // Gemini opened the stream but produced no text (SAFETY block,
            // RECITATION, etc.). Fall through to the non-stream fallback.
            throw new Error(`gemini empty (finishReason=${finishReason || "none"})`);
          }
          safeEnqueue({ type: "done", lang, via: "gemini", finishReason });
          finishStream(() => controller.close());
          return;
        } catch (err) {
          clearTimeout(timer);
          console.warn("[marcus-stream] gemini failed, falling back:", (err as Error)?.message);
          // fall through
        }
      }

      // ── Fallback: non-stream brain (OpenAI/Anthropic/OrakzaiX) ──────
      try {
        const { reply, via, lang: fLang } = await fallbackViaNonStream(origin, body);
        if (reply) {
          // Replay as a single chunk so the client never has to special-case.
          safeEnqueue({ type: "chunk", text: reply });
          safeEnqueue({ type: "done", lang: fLang, via: `${via}-replay` });
        } else {
          safeEnqueue({ type: "error", message: "no_reply" });
        }
      } catch (err) {
        safeEnqueue({ type: "error", message: (err as Error)?.message || "fallback_failed" });
      }
      finishStream(() => controller.close());
    },
  });

  return new Response(stream, { status: 200, headers: SSE_HEADERS });
}
