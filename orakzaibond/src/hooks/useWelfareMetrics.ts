import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type WelfareMetric = {
  key: string;
  label: string;
  value: number;
  suffix: string;
  updated_at: string;
};

const FALLBACK: WelfareMetric[] = [
  { key: "youth_empowered",     label: "Youth Empowered",         value: 3247,  suffix: "+", updated_at: "" },
  { key: "free_tech_education", label: "Free Tech Education Hrs", value: 18500, suffix: "+", updated_at: "" },
  { key: "community_grants",    label: "Community Grants",        value: 142,   suffix: "",  updated_at: "" },
];

/**
 * Fetch live welfare metric values from Supabase. Falls back to baked-in
 * defaults if the `welfare_metrics` table is missing/empty/unreachable so
 * the About page never breaks.
 */
export function useWelfareMetrics() {
  const [metrics, setMetrics] = useState<WelfareMetric[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("welfare_metrics")
        .select("key, label, value, suffix, updated_at");
      if (cancelled) return;
      if (!error && data && data.length > 0) {
        // Preserve the original ordering from FALLBACK (visual layout)
        const byKey = new Map(data.map((d) => [d.key, d as WelfareMetric]));
        const merged = FALLBACK.map((f) => byKey.get(f.key) ?? f);
        setMetrics(merged);
        setIsLive(true);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { metrics, loading, isLive };
}
