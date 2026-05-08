import { useEffect, useState } from "react";

export type SocialStats = {
  telegram: number | null;
  twitter:  number | null;
  facebook: number | null;
  fetched_at: string | null;
  source: "live" | "fallback";
};

const FALLBACK: SocialStats = {
  telegram: 12847,
  twitter:  8230,
  facebook: 29000,
  fetched_at: null,
  source: "fallback",
};

/**
 * Fetch live follower counts from /api/social-stats (a Vercel serverless
 * function). Falls back to the original placeholder numbers if the endpoint
 * is unreachable or returns an error so the UI never breaks.
 */
export function useSocialStats() {
  const [stats, setStats] = useState<SocialStats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/social-stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as Partial<SocialStats>;
        if (cancelled) return;
        setStats({
          telegram: data.telegram ?? FALLBACK.telegram,
          twitter:  data.twitter  ?? FALLBACK.twitter,
          facebook: data.facebook ?? FALLBACK.facebook,
          fetched_at: data.fetched_at ?? new Date().toISOString(),
          source: "live",
        });
      } catch {
        if (!cancelled) setStats(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, isLive: stats.source === "live" };
}
