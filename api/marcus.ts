// Vercel Edge Function — Marcus AI brain (Multi-LLM Redundant).
//
// CHAIRMAN'S DOCTRINE: Marcus must never say "I cannot process this".
//
// Architecture (per Chairman directive — Gemini-first, others optional):
//   1. PRIMARY  — Google Gemini 1.5 Flash (free tier, fastest). Tried
//                 first with a 3.5s timeout. Almost always answers in
//                 800ms–2s, so the user perceives sub-3s replies.
//   2. FALLBACK — OpenAI gpt-4o-mini and Anthropic Claude 3.5 Haiku
//                 (both OPTIONAL — only used if their API keys are set).
//                 Raced in parallel with a 1.2s shared budget so the
//                 total worst case stays under the 5-second SLA.
//   3. FINAL    — OrakzaiX on-edge brain. Deterministic intent matcher
//                 + Marcus persona templates in English / Urdu / Pashto.
//                 Zero external dependencies. Guarantees Marcus never
//                 goes silent and never says "I cannot process this".
//
// Required Vercel env var: GEMINI_API_KEY (the primary brain).
// Optional env vars:       OPENAI_API_KEY, ANTHROPIC_API_KEY (failovers).
// Optional model overrides:
//   GEMINI_MODEL    (default gemini-1.5-flash-latest)
//   OPENAI_MODEL    (default gpt-4o-mini)
//   ANTHROPIC_MODEL (default claude-3-5-haiku-latest)

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

const OPENAI_MODEL = env("OPENAI_MODEL") || "gpt-4o-mini";
const ANTHROPIC_MODEL = env("ANTHROPIC_MODEL") || "claude-3-5-haiku-latest";
// Chairman directive: Marcus runs on Gemini 2.0 Flash.
const GEMINI_MODEL = env("GEMINI_MODEL") || "gemini-2.0-flash";

// Latency budgets. Short replies (1–3 sentences) MUST stay snappy so the
// orb feels alive. Long-form executive briefings (~700 words ≈ 90s of TTS)
// are allowed up to 25s of generation time — well under the Vercel
// function timeout (300s, see vercel.json defaultResourceConfig). Without
// this split, briefings were being aborted mid-sentence on the old 3.5s
// cap and the orb stopped speaking abruptly.
const GEMINI_TIMEOUT_SHORT_MS = 3500;
const GEMINI_TIMEOUT_LONG_MS  = 25000;
const FALLBACK_TIMEOUT_SHORT_MS = 1200;
const FALLBACK_TIMEOUT_LONG_MS  = 12000;

// Reply length budgets. The MarcusOrb chunked TTS queue can read 1+ minute
// of speech reliably (sentence chunks + 8s resume() keepalive), so we lift
// the default short cap to ~400 tokens (~300 words ≈ 90s of speech) and
// let dispatch-style longForm replies use ~1600 tokens (~1200 words) so a
// full morning briefing actually completes instead of being clipped at the
// previous 900-token ceiling.
const MAX_TOKENS_SHORT = 400;
const MAX_TOKENS_LONG  = 1600;

// ─── Language detection ────────────────────────────────────────────────
// Arabic block U+0600–U+06FF covers Urdu and Pashto. Pashto-specific
// letters (ټ ډ ړ ږ ښ ګ ڼ ۀ ېۍ) disambiguate.
function detectLanguage(text: string): Lang {
  if (!/[\u0600-\u06FF]/.test(text)) return "en";
  if (/[\u067C\u0689\u0693\u0696\u069A\u06AB\u06BC\u06C0\u06D0\u06CD]/.test(text)) return "ps";
  return "ur";
}

function languageInstruction(lang: Lang): string {
  if (lang === "ur") {
    return "The user wrote in Urdu. Reply in clear, formal Urdu using the Nastaliq/Naskh script (Arabic block). Address Chairman Orakzai with full respect. Do not insert any English words unless they are proper nouns (OKBOND, Polygon, etc.).";
  }
  if (lang === "ps") {
    return "The user wrote in Pashto. Reply in clear, formal Pashto using the Arabic-derived script common in KPK and Afghanistan. Address Chairman Orakzai with full respect. Do not insert any English words unless they are proper nouns.";
  }
  return "Reply in clear, formal English. Use measured, executive phrasing.";
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

// ─── Provider 1: OpenAI ────────────────────────────────────────────────
async function callOpenAI(messages: Msg[], maxTokens: number, timeoutMs: number): Promise<string> {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) throw new Error("openai_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: maxTokens,
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`openai ${r.status}: ${t.slice(0, 160)}`);
    }
    const data: any = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("openai empty");
    return reply;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 2: Anthropic Claude ──────────────────────────────────────
async function callAnthropic(messages: Msg[], maxTokens: number, timeoutMs: number): Promise<string> {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("anthropic_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Anthropic wants `system` separate from messages.
    const sys = messages.find((m) => m.role === "system")?.content || "";
    const turns = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        system: sys,
        messages: turns,
        max_tokens: maxTokens,
        temperature: 0.6,
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`anthropic ${r.status}: ${t.slice(0, 160)}`);
    }
    const data: any = await r.json();
    // Claude returns { content: [ { type:"text", text:"..." } ] }
    const reply = (data?.content || [])
      .filter((b: any) => b?.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();
    if (!reply) throw new Error("anthropic empty");
    return reply;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 3: Google Gemini ─────────────────────────────────────────
async function callGemini(messages: Msg[], maxTokens: number, timeoutMs: number): Promise<string> {
  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) throw new Error("gemini_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const sys = messages.find((m) => m.role === "system")?.content || "";
    const turns = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: sys ? { parts: [{ text: sys }] } : undefined,
        contents: turns,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: maxTokens,
        },
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`gemini ${r.status}: ${t.slice(0, 160)}`);
    }
    const data: any = await r.json();
    const cand = data?.candidates?.[0];
    const reply = (cand?.content?.parts || [])
      .map((p: any) => p?.text || "")
      .join("")
      .trim();
    if (!reply) {
      // Surface the real reason — e.g. SAFETY block or RECITATION — instead
      // of a generic "empty" so retries / fallbacks have a better chance.
      const finish = cand?.finishReason || "no_candidate";
      throw new Error(`gemini empty (finishReason=${finish})`);
    }
    // If Gemini hit MAX_TOKENS we still return what we got (better a long
    // partial than nothing) but log it so we can size the cap up later.
    if (cand?.finishReason === "MAX_TOKENS") {
      console.warn("[marcus] gemini hit MAX_TOKENS at", maxTokens, "tokens");
    }
    return reply;
  } finally {
    clearTimeout(timer);
  }
}

// ─── OrakzaiX: on-edge fallback brain ──────────────────────────────────
// Deterministic intent matcher + persona templates. Used only if all
// commercial providers fail. Guarantees Marcus never goes silent.
function orakzaiXReply(message: string, lang: Lang, admin: boolean): string {
  const m = message.toLowerCase();
  const hasAny = (...ws: string[]) => ws.some((w) => m.includes(w));
  const sir = admin ? "Chairman" : "sir";

  // Replies localized per script. Keep them short and on-persona.
  const T = {
    en: {
      greet: `Standing by, ${sir}. Marcus here. The full brain is briefly unavailable, but I remain at your service.`,
      invest: `For investment matters I will route you to the WhatsApp concierge directly, ${sir}. They handle institutional and elite-priority intake.`,
      price: `I do not quote live numbers without the verified data layer attached, ${sir}. The token, allocation and roadmap pages have the current figures. I can open any of them for you.`,
      okbond: `Orakzai Bond is the institutional financial layer of the Group on Polygon, anchored by the Trust Trifecta and the Orakzai Bond Guarantee. The whitepaper has the full architecture.`,
      vision: `The Group is on a hundred-year horizon to Vision 2100, with twelve mother companies converging into a single trust-driven economy.`,
      contact: `For direct contact, the WhatsApp concierge is the fastest channel, ${sir}. The contact page lists the verified number.`,
      thanks: `At your service, ${sir}.`,
      default: `Acknowledged, ${sir}. My commercial cognition layer is briefly cycling. Please rephrase or ask me to open a specific page — roadmap, whitepaper, tokenomics, founder, or contact.`,
    },
    ur: {
      greet: `حاضر ہوں، ${admin ? "چیئرمین" : "جناب"}۔ مارکس حاضر ہے۔ مرکزی ذہن وقتی طور پر دستیاب نہیں، مگر میں آپ کی خدمت میں موجود ہوں۔`,
      invest: `سرمایہ کاری کے معاملات کے لیے میں آپ کو واٹس ایپ کنسیئرج پر منتقل کر رہا ہوں۔ وہاں ادارہ جاتی اور ایلیٹ پرائیوریٹی درخواستیں قبول کی جاتی ہیں۔`,
      price: `تصدیق شدہ ڈیٹا لیئر کے بغیر میں براہِ راست اعداد پیش نہیں کرتا۔ ٹوکن، ایلوکیشن اور روڈمیپ صفحات پر تازہ ترین معلومات موجود ہیں۔`,
      okbond: `اوراکزئی بانڈ گروپ کی ادارہ جاتی مالی پرت ہے جو پولیگون پر قائم ہے، اور ٹرسٹ ٹرائفیکٹا اور اوراکزئی بانڈ گارنٹی پر مشتمل ہے۔ وائٹ پیپر میں مکمل تفصیل موجود ہے۔`,
      vision: `گروپ ویژن 2100 کی سو سالہ پیش رفت پر گامزن ہے، بارہ مدرکمپنیاں ایک اعتماد پر مبنی معیشت میں ضم ہو رہی ہیں۔`,
      contact: `براہِ راست رابطے کے لیے واٹس ایپ کنسیئرج تیز ترین ذریعہ ہے۔ کنٹیکٹ صفحہ پر تصدیق شدہ نمبر موجود ہے۔`,
      thanks: `آپ کی خدمت میں حاضر ہوں۔`,
      default: `موصول ہوا۔ مرکزی ذہن وقتی طور پر بحال ہو رہا ہے۔ براہِ کرم سوال دہرائیں یا کہیں — روڈمیپ، وائٹ پیپر، ٹوکنومکس، فاؤنڈر یا کنٹیکٹ کھولوں۔`,
    },
    ps: {
      greet: `حاضر یم، ${admin ? "چیرمین صاحب" : "ښاغلی"}. مارکس په خدمت کې دی. اصلي مغز په لنډ مهال کې شته نه دی، خو زه تاسو سره یم.`,
      invest: `د پانګونې مسایلو لپاره به تاسو واتساپ کانسیرج ته انتقال کړم. هلته ادارهیز او ایلیټ غوښتنې مدیریت کیږي.`,
      price: `د تصدیق شوي ډیټا پرته ژوندي شمېرې نه وړاندې کوم. ټوکن، ایلوکیشن او روډمیپ پاڼې اوسني معلومات لري.`,
      okbond: `اورکزی بانډ په پولیګون کې د ګروپ ادارهیز مالي طبقه ده، چې د ټرسټ ټرایفکټا او اورکزی بانډ ګارنټۍ پر بنسټ ولاړه ده. وایټ پیپر بشپړه ساختمان لري.`,
      vision: `ګروپ د ویژن 2100 د یو سل کلن لیدلوري په لور روان دی، دولس مور شرکتونه په یوه باور لرونکې اقتصاد کې سره یوځای کیږي.`,
      contact: `د مستقیم اړیکي لپاره واتساپ کانسیرج تر ټولو ګړندی لاره ده. د اړیکې پاڼه تصدیق شوی شمیره لري.`,
      thanks: `ستاسو په خدمت کې یم.`,
      default: `ومنل شو. اصلي مغز په لنډ مهال کې بیا فعالیږي. مهرباني وکړئ پوښتنه بیا وکړئ یا ووایاست — روډمیپ، وایټ پیپر، ټوکنومکس، فاونډر یا اړیکه پرانیزم.`,
    },
  } as const;

  const t = T[lang];

  if (hasAny("hello", "hi ", "salaam", "salam", "السلام", "سلام", "ھیلو")) return t.greet;
  if (hasAny("invest", "buy", "purchase", "allocation", "ico", "سرمایہ", "خرید", "پانګ")) return t.invest;
  if (hasAny("price", "apy", "yield", "rate", "قیمت", "نرخ", "بیه")) return t.price;
  if (hasAny("okbond", "bond", "trifecta", "guarantee", "بانڈ", "بانډ")) return t.okbond;
  if (hasAny("vision", "2100", "future", "roadmap", "ویژن", "لیدلور", "روڈمیپ", "روډمیپ")) return t.vision;
  if (hasAny("contact", "whatsapp", "phone", "concierge", "رابطہ", "اړیکه", "واتساپ")) return t.contact;
  if (hasAny("thank", "shukria", "شکریہ", "مننه")) return t.thanks;
  return t.default;
}

// ─── Brain orchestrator (Gemini-first cascade) ─────────────────────────
// 1) Try Gemini (primary). If it answers, we're done — typically <2s.
// 2) If Gemini fails or times out, race the OPTIONAL fallbacks
//    (OpenAI + Anthropic) in parallel — whichever returns first wins.
// 3) If everything fails, throw — handler then serves OrakzaiX so
//    Marcus is never silent.
async function brain(
  messages: Msg[],
  maxTokens: number,
  longForm: boolean,
): Promise<{ reply: string; via: string }> {
  const geminiTimeout   = longForm ? GEMINI_TIMEOUT_LONG_MS   : GEMINI_TIMEOUT_SHORT_MS;
  const fallbackTimeout = longForm ? FALLBACK_TIMEOUT_LONG_MS : FALLBACK_TIMEOUT_SHORT_MS;

  // Primary: Gemini.
  if (env("GEMINI_API_KEY")) {
    try {
      const reply = await callGemini(messages, maxTokens, geminiTimeout);
      return { reply, via: "gemini" };
    } catch (err) {
      console.warn("[marcus] gemini failed, trying fallbacks:", (err as Error)?.message);
      // fall through to optional fallbacks
    }
  }

  // Optional fallbacks — only invoked if their key is set.
  const fallbacks: Array<{ name: string; run: () => Promise<string> }> = [];
  if (env("OPENAI_API_KEY")) {
    fallbacks.push({ name: "openai", run: () => callOpenAI(messages, maxTokens, fallbackTimeout) });
  }
  if (env("ANTHROPIC_API_KEY")) {
    fallbacks.push({ name: "anthropic", run: () => callAnthropic(messages, maxTokens, fallbackTimeout) });
  }

  if (fallbacks.length > 0) {
    const tagged = fallbacks.map(({ name, run }) =>
      run().then((reply) => ({ reply, via: name })),
    );
    return await Promise.any(tagged);
  }

  throw new Error("all_brains_failed");
}

// ─── HTTP shell ────────────────────────────────────────────────────────
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

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
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return jsonResponse({ error: "bad_json" }, 400);
  }

  const message = String(body.message || "").trim();
  if (!message) return jsonResponse({ error: "empty_message" }, 400);
  if (message.length > 4000) {
    return jsonResponse({ error: "message_too_long" }, 413);
  }

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

  // 1) Try the commercial brains (Gemini → optional fallbacks).
  try {
    const { reply, via } = await brain(messages, maxTokens, longForm);
    return jsonResponse({ reply, lang, via });
  } catch {
    // 2) Fall through to OrakzaiX. Marcus never says "I cannot process this".
    const reply = orakzaiXReply(message, lang, !!ctx.admin);
    return jsonResponse({ reply, lang, via: "orakzaix-fallback" });
  }
}
