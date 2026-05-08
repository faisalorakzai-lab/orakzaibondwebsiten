import type { VercelRequest, VercelResponse } from "@vercel/node";

// Marcus AI health probe.
// Returns "live" when the OpenAI brain is wired up, "standby" otherwise.
// Consumed by the Marcus Status Pill in the Navbar.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const hasKey = !!process.env.OPENAI_API_KEY;
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json({
    status: hasKey ? "live" : "standby",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    hasKey,
    ts: Date.now(),
  });
}
