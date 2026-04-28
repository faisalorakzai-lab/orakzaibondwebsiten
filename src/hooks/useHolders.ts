import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Holder = {
  address: string;
  display_name: string | null;
  balance: number;
  rank: number | null;
  badge: "champion" | "sovereign" | "elite" | "distinguished" | "honoured" | null;
  avatar_url: string | null;
  tx_hash: string | null;
  updated_at: string;
};

/**
 * Fetch the top N holders from the public `holders` table in Supabase
 * (drives the Elite Leaderboard / Wall of Fame).
 *
 * Returns `{ holders, loading, error }`. If the table is missing/empty/
 * unreachable, `holders` is an empty array — the consuming component is
 * responsible for showing a graceful fallback.
 */
export function useHolders(limit = 5) {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("holders")
        .select("address, display_name, balance, rank, badge, avatar_url, tx_hash, updated_at")
        .order("rank", { ascending: true, nullsFirst: false })
        .order("balance", { ascending: false })
        .limit(limit);
      if (cancelled) return;
      if (error) {
        // Table missing or RLS denies — caller should fall back to defaults.
        setError(error.message);
        setHolders([]);
      } else {
        setHolders((data ?? []) as Holder[]);
        setError(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { holders, loading, error };
}
