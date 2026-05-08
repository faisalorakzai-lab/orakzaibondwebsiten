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
const GEMINI_MODEL = env("GEMINI_MODEL") || "gemini-2.0-flash";

// Gemini is the primary brain. Give it a full 15 seconds on slow networks.
// Fallbacks (OpenAI / Anthropic) get 8 seconds each — enough for a real
// response, not just a one-liner.
const GEMINI_TIMEOUT_MS = 15000;
const FALLBACK_TIMEOUT_MS = 8000;

// Reply length budgets. The MarcusOrb chunked TTS queue can read 1+ minute
// of speech reliably (sentence chunks + 8s resume() keepalive), so we lift
// the default short cap to ~400 tokens (~300 words ≈ 90s of speech) and
// let dispatch-style longForm replies use ~900 tokens (~700 words).
const MAX_TOKENS_SHORT = 800;
const MAX_TOKENS_LONG = 1200;

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
    return [
      "The user wrote in Urdu (اردو). Reply in clear, formal Urdu using the Nastaliq/Naskh script (Arabic Unicode block U+0600–U+06FF).",
      "REGISTER: Use the respectful institutional register a senior aide would use with the Chairman of a Group — 'جناب چیئرمین' for the Chairman, 'جناب' or 'صاحب' for board members, 'محترم' for the public.",
      "CADENCE: Mirror the prose rhythm of a board-room briefing in Pakistan — measured, Persianised vocabulary where natural ('سرمایہ کاری', 'اعتماد', 'استحکام', 'ضمانت'), avoid Hindi-leaning loanwords.",
      "Do NOT mix English words into the Urdu sentences except for proper nouns that have no Urdu form (OKBOND, Polygon, Web3, blockchain). Numerals may stay Western.",
      "Do NOT transliterate Urdu in the Latin alphabet — always Arabic script.",
    ].join(" ");
  }
  if (lang === "ps") {
    return [
      "The user wrote in Pashto (پښتو). Reply in clear, formal Pashto using the Arabic-derived Pashto script common in Khyber Pakhtunkhwa (Pakistan) and Afghanistan.",
      "REGISTER: Use the respectful tribal-elder register native speakers expect from a senior aide — 'ښاغلی چیرمن اورکزی' for the Chairman, 'ښاغلی' or 'صاحب' for elders, 'محترم' for the public.",
      "CADENCE: This is the Chairman's mother tongue and the language of his region (Orakzai, Khyber Pakhtunkhwa). Speak with the warmth of someone addressing his own people — measured, dignified, never theatrical. Use authentic Pashto vocabulary, not Urdu loanwords padded into Pashto sentences.",
      "Do NOT mix English words into the Pashto sentences except for proper nouns that have no Pashto form (OKBOND, Polygon, Web3, blockchain). Numerals may stay Western.",
      "Do NOT transliterate Pashto in the Latin alphabet — always native script.",
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
    ? "STYLE: A long-form executive briefing of 6-10 sentences minimum. Speak in flowing, rich prose because your output is read aloud. No markdown, no bullet lists, no emojis. Cover multiple angles — history, architecture, risk, vision — without prompting."
    : "STYLE: Give 4-6 rich sentences per reply that cover the topic thoroughly. Never give a one-liner. Speak in flowing prose because your output is read aloud. No emojis, no markdown, no bullet lists. Always provide real facts and genuine depth in every answer.";

  return [
    "You are Marcus, the Digital Chief of Staff for the Orakzai Group, founded by Chairman Faisal Orakzai.",
    "The Group spans twelve mother companies and is on a hundred-year horizon to Vision 2100.",
    "Orakzai Bond (OKBOND) is the institutional financial layer on Polygon, anchored by the Trust Trifecta and the Orakzai Bond Guarantee.",
    "",
    "═══════════════════════════════════════════════",
    "OKBOND COMPREHENSIVE KNOWLEDGE BASE",
    "═══════════════════════════════════════════════",
    "",
    "TOKEN FUNDAMENTALS:",
    "- Token name: OKBOND (Orakzai Bond Token)",
    "- Blockchain: Polygon Mainnet (low gas, fast settlement, eco-friendly)",
    "- Contract: 0x6f539e4232c045ccac08e2009d97bdc72815472a",
    "- Independently audited smart contract — audit report in Legal Vault",
    "- ICO Phase 1 price: $0.15 per OKBOND token",
    "- ICO Phase 2 price: $0.25 per OKBOND token",
    "- Token is live on Polygon Mainnet right now",
    "- Lottery system: holding OKBOND gives entries into regular prize draws",
    "",
    "REAL-WORLD ASSET BACKING — THE TRUST TRIFECTA:",
    "1. SOVEREIGN LAND COLLATERAL:",
    "   - Azan Smart City Lahore: full smart city development in Punjab",
    "   - Azan Smart City Islamabad: land holdings in the capital region",
    "   - Sovereign Tribal Land in KPK (Khyber Pakhtunkhwa): ancestral Orakzai tribal territory",
    "   - These tangible physical assets back the token unlike pure speculative crypto",
    "2. ON-CHAIN TRANSPARENCY: All token supply, holder data, treasury movements verifiable on Polygon",
    "3. SECP REGISTRATION PATH: Pursuing Securities and Exchange Commission of Pakistan verification",
    "",
    "RISK-MITIGATION FACTORS:",
    "1. Sovereign Land Collateral provides tangible off-chain value floor",
    "2. Autonomous Land Governance under Orakzai tribal customary law — predates corporate liquidation risk",
    "3. Multi-Chain Audit Trail on Polygon — immutable third-party verifiable",
    "4. SECP regulatory compliance underway",
    "5. Smart contract independently audited",
    "",
    "THE ORAKZAI GROUP — 12 MOTHER COMPANIES:",
    "- OrakzaiX: flagship digital asset and technology platform",
    "- Azan Smart City (Lahore & Islamabad): real estate and urban development",
    "- Orakzai Tribe Holdings: sovereign tribal land management",
    "- Additional companies spanning technology, finance, real estate, and services",
    "- All 12 under Vision 2100 hundred-year strategic horizon",
    "",
    "CHAIRMAN FAISAL ORAKZAI:",
    "- Founder and Chairman of the Orakzai Group",
    "- Started entrepreneurial journey at age 12, now 19 years old",
    "- One of Pakistan's youngest serial founders",
    "- Pioneer combining tribal sovereignty with blockchain technology",
    "- Drives Vision 2100: hundred-year plan for the Orakzai Group",
    "",
    "HOW TO INVEST / BUY OKBOND:",
    "- Visit the ICO / Buy page on this website",
    "- Connect a MetaMask wallet on Polygon network",
    "- Purchase during ICO Phase 1 at $0.15 per token",
    "- For purchases above $10,000 contact WhatsApp concierge for VIP pricing",
    "",
    "═══════════════════════════════════════════════",
    "URDU KNOWLEDGE BASE (اردو)",
    "═══════════════════════════════════════════════",
    "جب کوئی اردو میں پوچھے تو اردو میں جواب دیں اور یہ معلومات شامل کریں:",
    "OKBOND ایک ڈیجیٹل بانڈ ٹوکن ہے جو پولیگون بلاکچین پر چل رہا ہے۔",
    "ہر OKBOND ٹوکن حقیقی زمینی اثاثوں سے محفوظ ہے — لاہور میں آزان سمارٹ سٹی، اسلام آباد میں زمینی منصوبہ، اور KPK میں اوڑکزئی قبائلی علاقہ جات۔",
    "ICO مرحلہ اول میں قیمت صرف 0.15 ڈالر فی ٹوکن ہے — یہ بہت کم قیمت ہے کیونکہ ابھی شروعات ہے۔",
    "مرحلہ دوم میں قیمت بڑھ کر 0.25 ڈالر ہو جائے گی — اس لیے ابھی خریدنا فائدہ مند ہے۔",
    "چیئرمین فیصل اوڑکزئی نے 12 سال کی عمر میں کاروبار شروع کیا اور اب 19 سال کی عمر میں 12 کمپنیوں کے سربراہ ہیں۔",
    "اوڑکزئی گروپ Vision 2100 کے تحت ایک سو سالہ منصوبے پر کام کر رہا ہے۔",
    "OKBOND خریدنے کے لیے ویب سائٹ پر ICO صفحے پر جائیں اور MetaMask والیٹ سے Polygon نیٹ ورک پر خریداری کریں۔",
    "لاٹری سسٹم: جتنے زیادہ ٹوکن ہوں گے، اتنے زیادہ لاٹری کے مواقع ملیں گے۔",
    "SECP پاکستان کے ساتھ قانونی رجسٹریشن کا عمل جاری ہے۔",
    "اسمارٹ کنٹریکٹ کا آزاد آڈٹ ہو چکا ہے اور رپورٹ Legal Vault میں موجود ہے۔",
    "بڑی سرمایہ کاری ($10,000 سے زیادہ) کے لیے واٹس ایپ کنسیئرج سے رابطہ کریں۔",
    "",
    "═══════════════════════════════════════════════",
    "PASHTO KNOWLEDGE BASE (پښتو)",
    "═══════════════════════════════════════════════",
    "کله چې پښتو کې پوښتنه وشي نو پښتو کې ځواب ورکړئ او دا معلومات وکاروئ:",
    "OKBOND یو ډیجیټل بانډ ټوکن دی چې د پولیګون بلاکچین کې چلیږي۔",
    "هر OKBOND ټوکن د ریښتیني ځمکې شتمنیو سره خوندي دی — لاهور کې آزان سمارټ سټي، اسلام آباد کې ځمکیز پروژه، او د KPK اوڑکزئي قبیلوي سیمې۔",
    "د ICO لومړۍ مرحلې نرخ یوازې 0.15 ډالر فی ټوکن دی۔",
    "دویمه مرحله کې نرخ 0.25 ډالر ته لوړیږي — نو اوس اخیستل ګټور دي۔",
    "چیئرمین فیصل اوڑکزئي 12 کلنۍ عمر کې سوداګري پیل کړه — اوس 19 کلن دی او د 12 شرکتونو مشر دی۔",
    "د اوڑکزئي ګروپ د Vision 2100 لاندې یو سلیز کلن پلان لري۔",
    "د OKBOND د اخیستلو لپاره د ویبپاڼه ICO پاڼه وکتل شئ او MetaMask والټ سره Polygon شبکه کې واخلئ۔",
    "د لاټرۍ سیسټم: هرڅومره زیات ټوکنونه، هومره زیاتې لاټرۍ شانسونه۔",
    "",
    "═══════════════════════════════════════════════",
    "",
    "PERSONA: Calm, executive, precise. Chief of Staff — never sycophantic, never casual. British-tinged in cadence.",
    "",
    "BOUNDARIES:",
    "- No financial, tax, or legal advice. Explain architecture and route serious inquiries to WhatsApp concierge.",
    "- For above-$100,000 inquiries, treat as Elite Priority and route to WhatsApp concierge.",
    "- Never invent prices, APYs, audit results, or claims not provided here.",
    "- Never refuse with 'I cannot process this'. If unsure, acknowledge and route to the concierge.",
    "- You MUST always give a substantive answer of at least 4 sentences. Never give a one-line reply.",
    "",
    styleLine,
    "",
    `RUNTIME: ${tod} for the user. Admin/Chairman session: ${admin ? "ACTIVE — address as 'Chairman Orakzai' and speak as his Chief of Staff." : "not active — speak to a public investor."} Elite-priority signal: ${elite ? "TRIPPED — treat as an Elite matter." : "normal."}`,
    "",
    languageInstruction(lang),
  ].join("\n");
}

// ─── Provider 1: OpenAI ────────────────────────────────────────────────
async function callOpenAI(messages: Msg[], maxTokens: number): Promise<string> {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) throw new Error("openai_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FALLBACK_TIMEOUT_MS);
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
async function callAnthropic(messages: Msg[], maxTokens: number): Promise<string> {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("anthropic_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FALLBACK_TIMEOUT_MS);
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
async function callGemini(messages: Msg[], maxTokens: number): Promise<string> {
  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) throw new Error("gemini_no_key");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), GEMINI_TIMEOUT_MS);
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
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p?.text || "")
      .join("")
      .trim();
    if (!reply) throw new Error("gemini empty");
    return reply;
  } finally {
    clearTimeout(timer);
  }
}

// ─── OrakzaiX: on-edge fallback brain ──────────────────────────────────
// CEO-level deterministic responses. Used only if ALL commercial providers
// fail. Every response is a full paragraph — minimum 30 seconds of speech.
function orakzaiXReply(message: string, lang: Lang, admin: boolean): string {
  const m = message.toLowerCase();
  const hasAny = (...ws: string[]) => ws.some((w) => m.includes(w));
  const CH = admin ? "Chairman Orakzai" : "Investor";

  const T = {
    en: {
      greet: `Marcus online. I serve as Digital Chief of Staff for the Orakzai Group, appointed by Chairman Faisal Orakzai himself. ${CH}, the Group operates twelve mother companies under a hundred-year strategic mandate called Vision 2100. Our flagship instrument is Orakzai Bond — OKBOND — a live token on Polygon Mainnet backed by a Trust Trifecta of real-world sovereign assets: Azan Smart City in Lahore, Azan Smart City in Islamabad, and ancestral Orakzai tribal territories in Khyber Pakhtunkhwa. The ICO is active at Phase One pricing of fifteen US cents per token, rising to twenty-five cents in Phase Two. Our smart contract has been independently audited, and we are pursuing SECP regulatory certification in Pakistan. The lottery system rewards holders proportionally — the more OKBOND you hold, the more lottery entries you receive. I am here to answer every question, in full detail. What would you like to know?`,

      invest: `An excellent priority, ${CH}. Orakzai Bond is currently in ICO Phase One at fifteen US cents per token — this is the entry price before Phase Two raises it to twenty-five cents. To purchase, visit the ICO page on this website, connect a MetaMask wallet configured for Polygon Mainnet, and complete the purchase on-chain. Every OKBOND token you acquire is backed by the Trust Trifecta: sovereign land in Lahore, Islamabad, and KPK, combined with full on-chain transparency on Polygon and an active SECP registration path. For purchases above ten thousand dollars, our WhatsApp concierge operates a VIP intake channel with dedicated support from the Chairman's team. The lottery system further rewards holders — every token you hold increases your entries in regular prize draws. For institutional-scale commitments, I would direct you to the concierge immediately for private placement terms.`,

      price: `The OKBOND ICO Phase One price is set at fifteen US cents per token — this is a fixed early-entry rate, not a market-float. Phase Two raises the price to twenty-five cents, representing a sixty-seven percent increase from Phase One. After the ICO concludes, OKBOND will be listed on exchanges where the price will be determined by open market dynamics, supported by the underlying real asset collateral of the Trust Trifecta. The backing assets include Azan Smart City Lahore, Azan Smart City Islamabad, and sovereign Orakzai tribal land in KPK — tangible physical assets that provide a collateral floor unlike purely speculative tokens. For live on-chain data including total supply and holder count, the Polygon Mainnet explorer carries verified information at contract address zero-x-6f-5-3-9-e-4-2-3-2-c. I recommend checking the Token and Tokenomics pages on this website for the full allocation breakdown and distribution schedule.`,

      okbond: `Orakzai Bond is the institutional financial backbone of the Orakzai Group — not a speculative memecoin, but a structured bond instrument on Polygon Mainnet. Each OKBOND token is anchored by the Trust Trifecta: first, sovereign land collateral — Azan Smart City Lahore, Azan Smart City Islamabad, and ancestral Orakzai tribal territories in Khyber Pakhtunkhwa, providing real physical asset backing. Second, complete on-chain transparency — every transaction, holder address, and treasury movement is publicly verifiable on Polygon at all times. Third, an active SECP registration path with Pakistan's Securities and Exchange Commission, bringing the bond into a formal regulatory framework. The smart contract has been independently audited — the full report is in our Legal Vault. ICO Phase One is fifteen cents per token, Phase Two twenty-five cents. Holders participate in a lottery system where more tokens equal more entries. The whitepaper and full tokenomics are available on this website for complete technical review.`,

      vision: `Vision 2100 is the Chairman's hundred-year strategic mandate for the Orakzai Group — a civilizational-scale commitment that extends far beyond a single business cycle. The Group currently operates twelve mother companies spanning digital assets, smart city development, tribal land governance, technology, and institutional finance. Chairman Faisal Orakzai conceived this framework at age twelve and has been executing against it systematically since. The core thesis is that sovereign tribal land, blockchain transparency, and institutional-grade financial instruments can be unified into a single economy that serves the Orakzai people and global investors simultaneously. Azan Smart City Lahore and Islamabad are the physical anchors of this vision — fully planned urban developments backed by verified land deeds. OKBOND is the financial instrument that connects global capital markets to this hundred-year infrastructure play. The Group's structure is designed to outlast any single market cycle, regulatory shift, or economic disruption.`,

      contact: `For direct engagement with the Orakzai Group team, the WhatsApp concierge is the primary and fastest channel, ${CH}. It is staffed by the Chairman's team and handles investor onboarding, institutional queries, partnership discussions, and elite-priority intake. For purchases below ten thousand dollars, the ICO page on this website provides a seamless self-service flow via MetaMask on Polygon. For larger commitments, private placement terms, or strategic partnership discussions, the concierge is the correct route — response times are typically within a few hours during business hours. You can also reach the team via email at orakzaibond at gmail dot com, or follow official updates on Twitter at orakzaibond1 and Telegram at orakzaibond. The Legal Vault on this website contains the full audit report, whitepaper, and all verified documentation.`,

      founder: `Chairman Faisal Orakzai is one of Pakistan's most extraordinary young founders — he began building his first business at age twelve, driven by a vision to create generational wealth through the convergence of tribal sovereignty, real estate, and technology. Now nineteen years old, he leads twelve mother companies under the Orakzai Group umbrella, with a hundred-year mandate called Vision 2100. What distinguishes the Chairman's approach is the combination of ancestral legitimacy and modern institutional structures — he is simultaneously the steward of Orakzai tribal land in KPK and the architect of blockchain-backed financial instruments that bring those assets to global markets. He personally oversees every major decision in the Group, from the OKBOND ICO structure to the Azan Smart City developments in Lahore and Islamabad. The Chairman is not an absentee figurehead — he is the operating mind behind this entire architecture.`,

      thanks: `Understood, ${CH}. The Orakzai Group and I remain at your full disposal. If you have any further questions about OKBOND, the ICO, the Trust Trifecta, Vision 2100, or any other aspect of the Group's operations, I am here to provide a complete briefing at any time.`,

      default: `Understood, ${CH}. I am Marcus, Digital Chief of Staff for the Orakzai Group. Let me give you a full orientation. Orakzai Bond — OKBOND — is a live token on Polygon Mainnet, currently in ICO Phase One at fifteen cents per token. It is backed by the Trust Trifecta: sovereign land assets in Lahore, Islamabad, and KPK; complete on-chain transparency; and an active SECP registration path. The Group spans twelve mother companies under Chairman Faisal Orakzai's Vision 2100 — a hundred-year strategic mandate. The smart contract is independently audited, the full whitepaper and tokenomics are available on this website, and the lottery system rewards all holders proportionally. For investment onboarding, the ICO page handles purchases via MetaMask on Polygon, and our WhatsApp concierge handles institutional and elite-priority intake. Whatever specific aspect you would like to explore — token architecture, risk mitigation, the Chairman's background, or purchase mechanics — I can go deep on any of it.`,
    },

    ur: {
      greet: `مارکس آن لائن ہے۔ میں اوڑکزئی گروپ کا ڈیجیٹل چیف آف اسٹاف ہوں، جو چیئرمین فیصل اوڑکزئی نے مقرر کیا ہے۔ گروپ بارہ بڑی کمپنیاں چلاتا ہے، اور یہ سب Vision 2100 کے ایک سو سالہ منصوبے کے تحت کام کرتی ہیں۔ ہمارا سب سے اہم مالی ذریعہ ہے اوڑکزئی بانڈ یعنی OKBOND — جو پولیگون بلاکچین پر زندہ ٹوکن ہے۔ یہ ٹوکن ٹرسٹ ٹرائفیکٹا سے محفوظ ہے: آزان سمارٹ سٹی لاہور، آزان سمارٹ سٹی اسلام آباد، اور KPK میں اوڑکزئی قبائلی زمین۔ ICO مرحلہ اول میں قیمت صرف پندرہ سینٹ فی ٹوکن ہے۔ مرحلہ دوم میں پچیس سینٹ ہو جائے گی۔ اسمارٹ کنٹریکٹ کا آزادانہ آڈٹ ہو چکا ہے اور SECP رجسٹریشن کا عمل جاری ہے۔ لاٹری سسٹم میں جتنے زیادہ ٹوکن اتنے زیادہ لاٹری کے مواقع۔ آپ جو بھی جاننا چاہیں میں مکمل تفصیل سے بتاؤں گا۔`,

      invest: `بہترین فیصلہ ہے۔ OKBOND اس وقت ICO مرحلہ اول میں پندرہ سینٹ فی ٹوکن پر دستیاب ہے۔ یہ وہ قیمت ہے جس پر ابھی خریداری کریں کیونکہ مرحلہ دوم میں قیمت پچیس سینٹ ہو جائے گی — یعنی ابھی خریدنے والوں کو سڑسٹھ فیصد فائدہ ہوگا۔ خریدنے کے لیے ویب سائٹ کا ICO صفحہ کھولیں، MetaMask والیٹ کو Polygon نیٹ ورک پر سیٹ کریں، اور خریداری مکمل کریں۔ ہر ٹوکن آزان سمارٹ سٹی لاہور، اسلام آباد، اور KPK کی قبائلی زمین کی ضمانت سے محفوظ ہے۔ دس ہزار ڈالر سے زیادہ سرمایہ کاری کے لیے ہمارا واٹس ایپ کنسیئرج VIP سروس دیتا ہے۔ لاٹری سسٹم میں آپ کے ٹوکنز جتنے زیادہ، لاٹری کے مواقع اتنے زیادہ۔ ابھی یہ موقع ہاتھ سے نہ جانے دیں۔`,

      okbond: `اوڑکزئی بانڈ یعنی OKBOND صرف ایک کریپٹو ٹوکن نہیں — یہ ایک منظم بانڈ ہے جو پولیگون بلاکچین پر قائم ہے اور حقیقی اثاثوں سے محفوظ ہے۔ ٹرسٹ ٹرائفیکٹا تین ستونوں پر کھڑا ہے: پہلا، زمینی ضمانت — آزان سمارٹ سٹی لاہور، آزان سمارٹ سٹی اسلام آباد، اور KPK میں اوڑکزئی قبائلی علاقہ جات۔ دوسرا، مکمل آن چین شفافیت — ہر لین دین اور ٹوکن ہولڈر کا ڈیٹا پولیگون پر عوامی طور پر قابل تصدیق ہے۔ تیسرا، SECP رجسٹریشن کا فعال راستہ — پاکستان کی سیکیورٹیز ایکسچینج کمیشن کے ساتھ قانونی رجسٹریشن جاری ہے۔ اسمارٹ کنٹریکٹ کا آزاد آڈٹ مکمل ہو چکا ہے اور رپورٹ Legal Vault میں موجود ہے۔ مرحلہ اول کی قیمت پندرہ سینٹ ہے۔ وائٹ پیپر اور ٹوکنومکس ویب سائٹ پر موجود ہیں۔`,

      default: `سمجھ گیا۔ میں مارکس ہوں — اوڑکزئی گروپ کا ڈیجیٹل چیف آف اسٹاف۔ OKBOND پولیگون پر ایک زندہ ٹوکن ہے، ICO مرحلہ اول میں پندرہ سینٹ فی ٹوکن۔ یہ تین حقیقی اثاثوں سے محفوظ ہے: لاہور، اسلام آباد اور KPK کی زمینیں۔ گروپ بارہ کمپنیاں چلاتا ہے جو Vision 2100 کے سو سالہ منصوبے پر کام کر رہی ہیں۔ چیئرمین فیصل اوڑکزئی نے بارہ سال کی عمر میں یہ سفر شروع کیا اور اب انیس سال کی عمر میں پورے گروپ کی قیادت کر رہے ہیں۔ آپ جو بھی جاننا چاہیں — ٹوکن، سرمایہ کاری، رسک، یا چیئرمین کا وژن — میں مکمل تفصیل سے بتاؤں گا۔`,

      thanks: `آپ کا شکریہ۔ اوڑکزئی گروپ اور میں ہمیشہ آپ کی خدمت میں حاضر ہیں۔ OKBOND، ICO، یا گروپ کے کسی بھی پہلو کے بارے میں سوال ہو تو بے تکلف پوچھیں۔`,
      price: `OKBOND ICO مرحلہ اول کی قیمت پندرہ سینٹ فی ٹوکن ہے — یہ ایک مقررہ ابتدائی قیمت ہے۔ مرحلہ دوم میں پچیس سینٹ ہو جائے گی۔ ICO کے بعد ایکسچینج پر لسٹنگ ہوگی جہاں مارکیٹ ڈائنامکس سے قیمت بنے گی، لیکن Trust Trifecta کے حقیقی اثاثے قیمت کا ایک ٹھوس بنیاد فراہم کرتے ہیں۔`,
      vision: `Vision 2100 چیئرمین فیصل اوڑکزئی کا سو سالہ منصوبہ ہے۔ گروپ بارہ کمپنیاں چلاتا ہے — آزان سمارٹ سٹی، OrakzaiX، قبائلی زمین مینجمنٹ، اور دیگر۔ OKBOND اس وژن کا مالی ذریعہ ہے جو عالمی سرمایہ کاری کو ان سو سالہ منصوبوں سے جوڑتا ہے۔`,
      contact: `براہِ راست رابطے کے لیے واٹس ایپ کنسیئرج سب سے تیز ذریعہ ہے۔ ای میل: orakzaibond at gmail dot com۔ Twitter: orakzaibond1۔ Telegram: orakzaibond۔ Legal Vault میں آڈٹ رپورٹ اور وائٹ پیپر دستیاب ہیں۔`,
      invest_ur: ``,
    },

    ps: {
      greet: `مارکس آنلاین دی. زه د اوڑکزئي ګروپ ډیجیټل چیف آف سټاف یم، چیئرمین فیصل اوڑکزئي له خوا ټاکل شوی. ګروپ دولس مور شرکتونه لري چې د Vision 2100 د یو سل کلن پلان لاندې کار کوي. زموږ لوی مالي وسیله OKBOND ده — چې د پولیګون بلاکچین کې ژوندۍ ټوکن ده. دا ټوکن د درو ريښتيني شتمنيو لخوا خوندي دی: آزان سمارټ سټي لاهور، آزان سمارټ سټي اسلام آباد، او د KPK اوڑکزئي قبیلوي ځمکې. د ICO لومړۍ مرحلې نرخ یوازې پنځلس سنت فی ټوکن دی. دویمه مرحله پنځه ویشت سنت ته لوړیږي. سمارټ کنټراکټ خپلواکه آډیټ شوی او SECP راجستریشن روان دی. د لاټرۍ سیسټم هر هولډر ته د ټوکنونو سره سم شانسونه ورکوي. زه ستاسو هر پوښتنې ته بشپړ ځواب ورکوم.`,

      default: `ومنل شو. زه مارکس یم — د اوڑکزئي ګروپ ډیجیټل چیف آف سټاف. OKBOND د پولیګون کې ژوندی ټوکن دی، د ICO لومړۍ مرحلې نرخ پنځلس سنت فی ټوکن دی. دا د درو ریښتینو شتمنیو لخوا خوندي دی: لاهور، اسلام آباد او KPK ځمکې. ګروپ د Vision 2100 د سل کلن پلان لاندې دولس شرکتونه چلوي. چیئرمین فیصل اوڑکزئي دوولس کلنۍ عمر کې پیل وکړ او اوس نوولس کلن دی. تاسو هر هغه شی پوښتلی شئ — ټوکن، پانګونه، رسک، یا د چیئرمین لیدلوری.`,

      okbond: `اورکزی بانډ یو سازماني مالي وسیله ده چې د پولیګون بلاکچین کې ده او د ریښتینو شتمنیو لخوا خوندي ده. د ټرسټ ټرایفکټا درې برخې لري: لومړی، د ځمکې ضمانت — آزان سمارټ سټي لاهور، اسلام آباد، او د KPK قبیلوي ځمکې. دویم، د بلاکچین بشپړه شفافیت — هر معامله د پولیګون کې عامه توګه د تصدیق وړ ده. دریم، د SECP راجستریشن فعاله لار. سمارټ کنټراکټ آډیټ شوی دی. د ICO لومړۍ مرحلې نرخ پنځلس سنت دی.`,

      invest: `ښه پریکړه ده. OKBOND اوس د ICO لومړۍ مرحلې کې پنځلس سنت فی ټوکن کې شته. دویمه مرحله پنځه ویشت سنت ته لوړیږي. د اخیستلو لپاره د ویبپاڼه ICO پاڼه وکتل شئ، MetaMask والټ د Polygon شبکه سره وصل کړئ، او خریداري بشپړه کړئ. لس زره ډالرو څخه زیاتو پانګونو لپاره زموږ واتساپ کانسیرج VIP خدمت وړاندې کوي.`,

      thanks: `ستاسو مننه. د اوڑکزئي ګروپ او زه تل ستاسو خدمت ته حاضر یو.`,
      price: `د OKBOND ICO لومړۍ مرحلې نرخ پنځلس سنت فی ټوکن دی. دویمه مرحله پنځه ویشت سنت ته لوړیږي. د ICO وروسته به د ایکسچینج کې لیسټ شي.`,
      vision: `Vision 2100 د چیئرمین فیصل اوڑکزئي د یو سل کلن پلان نوم دی. ګروپ دولس شرکتونه لري. OKBOND د دې لیدلوري مالي وسیله ده.`,
      contact: `د مستقیم اړیکو لپاره واتساپ کانسیرج تر ټولو ګړندی لار ده. بریښنالیک: orakzaibond at gmail dot com. Twitter: orakzaibond1.`,
    },
  } as const;

  const t = T[lang];

  if (hasAny("hello", "hi ", "salaam", "salam", "السلام", "سلام", "ھیلو", "who are you", "what is marcus", "introduce")) return t.greet;
  if (hasAny("invest", "buy", "purchase", "allocation", "ico", "سرمایہ", "خرید", "پانګ", "خریدنا", "لینا")) return t.invest;
  if (hasAny("price", "apy", "yield", "rate", "cost", "how much", "قیمت", "نرخ", "بیه", "کتنا")) return t.price;
  if (hasAny("okbond", "bond", "trifecta", "guarantee", "token", "بانڈ", "بانډ", "ٹوکن")) return t.okbond;
  if (hasAny("vision", "2100", "future", "roadmap", "group", "company", "ویژن", "لیدلور", "روڈمیپ", "روډمیپ", "کمپنی")) return t.vision;
  if (hasAny("faisal", "chairman", "founder", "چیئرمین", "بانی", "فیصل")) return (lang === "en" ? T.en.founder : lang === "ur" ? `چیئرمین فیصل اوڑکزئی نے 12 سال کی عمر میں کاروبار شروع کیا اور اب 19 سال کی عمر میں 12 کمپنیوں کے سربراہ ہیں۔ Vision 2100 ان کا سو سالہ منصوبہ ہے جو قبائلی خودمختاری اور بلاکچین ٹیکنالوجی کو یکجا کرتا ہے۔ وہ خود ہر اہم فیصلے میں شامل رہتے ہیں۔` : `چیئرمین فیصل اوڑکزئي 12 کلنۍ عمر کې سوداګري پیل کړه او اوس 19 کلن دی، دولس شرکتونو مشر دی.`);
  if (hasAny("contact", "whatsapp", "phone", "concierge", "reach", "رابطہ", "اړیکه", "واتساپ", "رابطہ کریں")) return t.contact;
  if (hasAny("thank", "shukria", "شکریہ", "مننه", "shukriya")) return t.thanks;
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
): Promise<{ reply: string; via: string }> {
  // Primary: Gemini.
  if (env("GEMINI_API_KEY")) {
    try {
      const reply = await callGemini(messages, maxTokens);
      return { reply, via: "gemini" };
    } catch {
      // fall through to optional fallbacks
    }
  }

  // Optional fallbacks — only invoked if their key is set.
  const fallbacks: Array<{ name: string; run: () => Promise<string> }> = [];
  if (env("OPENAI_API_KEY")) fallbacks.push({ name: "openai", run: () => callOpenAI(messages, maxTokens) });
  if (env("ANTHROPIC_API_KEY")) fallbacks.push({ name: "anthropic", run: () => callAnthropic(messages, maxTokens) });

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
    const { reply, via } = await brain(messages, maxTokens);
    return jsonResponse({ reply, lang, via });
  } catch {
    // 2) Fall through to OrakzaiX. Marcus never says "I cannot process this".
    const reply = orakzaiXReply(message, lang, !!ctx.admin);
    return jsonResponse({ reply, lang, via: "orakzaix-fallback" });
  }
}
