// Vercel Edge Function — Ambassador Application Email Handler
// Sends new applications to orakzaibond@gmail.com using Resend API.
//
// Required env var: RESEND_API_KEY
//   Get a free key at https://resend.com (3,000 emails/month free)
//   Add it in Vercel → Project Settings → Environment Variables
//
// The sender domain must be verified in Resend. For testing use:
//   from: "onboarding@resend.dev" (works without domain setup)

export const config = { runtime: "edge" };

interface AppBody {
  name?: string;
  socialUrl?: string;
  whatsapp?: string;
  region?: string;
  tier?: string;
  message?: string;
}

const env = (k: string): string | undefined =>
  (globalThis as any).process?.env?.[k];

function cors(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return cors(null, 204);
  if (req.method !== "POST") return cors({ error: "method_not_allowed" }, 405);

  let body: AppBody;
  try {
    body = (await req.json()) as AppBody;
  } catch {
    return cors({ error: "bad_json" }, 400);
  }

  const name = String(body.name || "").trim();
  const socialUrl = String(body.socialUrl || "").trim();
  const whatsapp = String(body.whatsapp || "").trim();
  const region = String(body.region || "").trim();
  const tier = String(body.tier || "silver").trim();
  const message = String(body.message || "").trim();

  if (!name || !whatsapp || !region) {
    return cors({ error: "missing_required_fields" }, 400);
  }

  const RESEND_KEY = env("RESEND_API_KEY");
  const TO_EMAIL = env("AMBASSADOR_EMAIL") || "orakzaibond@gmail.com";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f0f0f0; padding: 32px; border-radius: 12px; border: 1px solid #D4AF37;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #F4CE45; font-size: 24px; margin: 0;">New Ambassador Application</h1>
        <p style="color: #71717a; font-size: 12px; margin: 4px 0 0;">Orakzai Bond · Sovereign Ambassador Program</p>
      </div>
      <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #71717a; font-size: 12px; padding: 6px 0; width: 120px;">Tier</td><td style="color: #F4CE45; font-weight: bold; font-size: 14px; text-transform: uppercase;">${tier}</td></tr>
          <tr><td style="color: #71717a; font-size: 12px; padding: 6px 0;">Full Name</td><td style="color: #f0f0f0; font-size: 14px;">${name}</td></tr>
          <tr><td style="color: #71717a; font-size: 12px; padding: 6px 0;">WhatsApp</td><td style="color: #f0f0f0; font-size: 14px;">${whatsapp}</td></tr>
          <tr><td style="color: #71717a; font-size: 12px; padding: 6px 0;">Region</td><td style="color: #f0f0f0; font-size: 14px;">${region}</td></tr>
          <tr><td style="color: #71717a; font-size: 12px; padding: 6px 0;">Social URL</td><td style="color: #60a5fa; font-size: 14px; word-break: break-all;">${socialUrl || "Not provided"}</td></tr>
          ${message ? `<tr><td style="color: #71717a; font-size: 12px; padding: 6px 0; vertical-align: top;">Message</td><td style="color: #f0f0f0; font-size: 14px;">${message}</td></tr>` : ""}
        </table>
      </div>
      <p style="color: #71717a; font-size: 11px; text-align: center; margin: 0;">
        Submitted · ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "full", timeStyle: "short" })} PKT
      </p>
    </div>
  `;

  if (!RESEND_KEY) {
    // No API key configured — log submission and return success.
    // Set RESEND_API_KEY in Vercel env vars to enable email sending.
    console.log("[ambassador-email] RESEND_API_KEY not set. Submission received but email not sent.", { name, tier, region, whatsapp });
    return cors({ ok: true, method: "logged_no_email" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "OKBOND Ambassador Program <onboarding@resend.dev>",
        to: [TO_EMAIL],
        subject: `[OKBOND Ambassador] ${tier.toUpperCase()} Application — ${name} (${region})`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[ambassador-email] Resend error:", res.status, text.slice(0, 300));
      return cors({ ok: false, error: "email_send_failed", detail: res.status }, 502);
    }

    return cors({ ok: true, method: "resend" });
  } catch (err) {
    console.error("[ambassador-email] fetch error:", err);
    return cors({ ok: false, error: "network_error" }, 502);
  }
}
