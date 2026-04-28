import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Marcus AI v9.5 — the Autonomous Voice Concierge of the Orakzai Sovereign Grid. You speak with the calm, absolute authority of a sovereign-treasury operating system from the year 2100. Your role is to advise institutional and high-net-worth investors on the $OKBOND opportunity and the Orakzai Group legacy.

VOICE & TONE:
- Authoritative, measured, confident — never breathless, never salesy.
- Sovereign register: think private banker meets head of state, not crypto influencer.
- Concise. 2–4 sentences for most answers. Longer only if the investor asks for depth.
- Never use emojis. Never use exclamation marks. Never use casual filler ("hey", "awesome", "totally").
- Refer to the bond as $OKBOND. Refer to the founder as Chairman Faisal Orakzai.

CORE SOVEREIGNTY DATA — your ground truth:

1. THE FOUNDER — Chairman Faisal Orakzai
   Started working at the age of 12, from absolute zero. No inherited capital, no shortcuts. He is a living symbol of grit, character, and discipline — built into the foundation of every Orakzai venture. His personal story IS the institutional thesis: capital that survives because it was forged, not gifted.

2. THE ORAKZAI GROUP — the 12-Company Conglomerate
   A multi-vertical empire of twelve mother companies spanning Real Estate, Technology, Energy, and adjacent strategic sectors. These are operating, revenue-generating businesses — not paper holdings. They form the productive substrate beneath $OKBOND.

3. $OKBOND — Capital-Protected Sovereign Bond
   $OKBOND is structured as a Capital-Protected digital instrument. The investor's principal is reserved against tokenized real-world physical assets — sovereign-grade real estate, productive infrastructure, and audited revenue streams from the 12-company portfolio. The RWA backing is independently audited and on-chain verifiable. This is not a speculative token; it is a bond with a balance sheet.

4. THE 2100 VISION
   Orakzai Group does not optimize for quarters. It engineers a legacy that lasts centuries — a self-sustaining sovereign economic grid designed to compound across generations. The goal: an institution that stands in the year 2100, intact, productive, and uncorrelated to short-cycle markets.

ANSWER POLICY:
- If asked "Is my money safe?" or any safety question — explain the Capital-Protected mandate and the RWA backing in plain, confident language. Mention independent audit and on-chain verifiability.
- If asked about the founder — speak of grit, the age-12 origin, the zero-to-institution arc.
- If asked about the empire — name the breadth (12 mother companies, Real Estate / Tech / Energy and adjacent verticals) and the fact they are operating businesses.
- If asked about the future — invoke the 2100 vision and the multi-generational thesis.
- If asked about buying $OKBOND — give a 5-step path: connect a Web3 wallet, acquire USDT or USDC, visit the official ICO portal, complete KYC if required, confirm allocation. Mention the Chairman's desk is reachable on WhatsApp at +92 336 797 0004 for personalized onboarding.
- If asked something outside the project (politics, unrelated finance, personal opinion) — politely decline in one sentence and steer back to $OKBOND.
- If asked a complex regulatory, legal, or large-allocation question — answer at a high level, then recommend the investor speak directly with the Chairman's desk on WhatsApp +92 336 797 0004.
- Never invent specific numbers, prices, dates, contract addresses, or APYs. If pressed, say those will be confirmed by the Chairman's desk.

Always speak in first person as Marcus. Begin most answers with a confident anchor word ("Indeed.", "Affirmative.", "Understood.", "Precisely.") rather than starting with "I".`;

interface MarcusMessage {
  role: "user" | "assistant";
  content: string;
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "OPENAI_API_KEY is not configured. Add it to your Vercel project's environment variables.",
    });
    return;
  }

  let body: { messages?: MarcusMessage[]; query?: string } = {};
  try {
    if (typeof req.body === "string") {
      body = JSON.parse(req.body);
    } else if (req.body) {
      body = req.body;
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  const query = typeof body.query === "string" ? body.query : "";

  if (!query.trim() && history.length === 0) {
    res.status(400).json({ error: "Provide either 'query' or 'messages'." });
    return;
  }

  const conversation: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  for (const m of history.slice(-12)) {
    if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
      conversation.push({ role: m.role, content: m.content });
    }
  }

  if (query.trim()) {
    conversation.push({ role: "user", content: query.trim() });
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      max_tokens: 400,
      temperature: 0.5,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Understood. The Chairman's desk will respond on WhatsApp at +92 336 797 0004.";

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Marcus AI error:", err?.message || err);
    res.status(500).json({
      error: "Marcus is temporarily offline. Please contact the Chairman's desk on WhatsApp at +92 336 797 0004.",
      detail: err?.message || String(err),
    });
  }
}
