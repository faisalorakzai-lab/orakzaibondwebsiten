// Vercel Serverless Function — /api/social-stats
// ----------------------------------------------------------------------------
// Aggregates real follower counts from Telegram, X (Twitter) and Facebook so
// the public site can show authentic, refreshing numbers without exposing any
// API tokens to the browser. Returns plain JSON; in-memory cached for 5 min.
//
// All three integrations are OPTIONAL — whichever credential is missing,
// the corresponding field is returned as `null` and the frontend falls back
// to its baked-in placeholder. This way the page never breaks while you
// roll the secrets out one at a time.
//
// REQUIRED ENVIRONMENT VARIABLES (set in Vercel project settings):
//   TELEGRAM_BOT_TOKEN     – bot token from @BotFather; bot must be admin
//                            of the channel it queries
//   TELEGRAM_CHAT_ID       – e.g. "@orakzaibond" or "-100123456789"
//   X_BEARER_TOKEN         – Bearer token from a project on developer.x.com
//                            (the public follower count needs the v2
//                            /users/by/username endpoint)
//   X_USERNAME             – e.g. "OrakzaiBond" (no @)
//   FACEBOOK_PAGE_ID       – numeric page id, e.g. "123456789012345"
//   FACEBOOK_PAGE_TOKEN    – long-lived Page Access Token from Graph API
// ----------------------------------------------------------------------------

type Out = {
  telegram: number | null;
  twitter:  number | null;
  facebook: number | null;
  fetched_at: string;
};

let cache: { at: number; data: Out } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchTelegram(): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${encodeURIComponent(chat)}`,
    );
    const j = await res.json();
    return typeof j?.result === "number" ? j.result : null;
  } catch { return null; }
}

async function fetchTwitter(): Promise<number | null> {
  const token    = process.env.X_BEARER_TOKEN;
  const username = process.env.X_USERNAME;
  if (!token || !username) return null;
  try {
    const res = await fetch(
      `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const j = await res.json();
    const n = j?.data?.public_metrics?.followers_count;
    return typeof n === "number" ? n : null;
  } catch { return null; }
}

async function fetchFacebook(): Promise<number | null> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token  = process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) return null;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=followers_count,fan_count&access_token=${encodeURIComponent(token)}`,
    );
    const j = await res.json();
    const n = j?.followers_count ?? j?.fan_count;
    return typeof n === "number" ? n : null;
  } catch { return null; }
}

export default async function handler(_req: any, res: any) {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    return res.status(200).json(cache.data);
  }

  const [telegram, twitter, facebook] = await Promise.all([
    fetchTelegram(), fetchTwitter(), fetchFacebook(),
  ]);

  const data: Out = {
    telegram, twitter, facebook,
    fetched_at: new Date().toISOString(),
  };
  cache = { at: now, data };

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  return res.status(200).json(data);
}
