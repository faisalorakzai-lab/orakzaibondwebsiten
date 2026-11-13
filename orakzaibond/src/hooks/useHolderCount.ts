import { useState, useEffect } from "react";

const TOKEN_ADDRESS = "0xA61aA3460561A91A7402A3F32413e7253fE75bDa";
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useHolderCount() {
  const [count, setCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch(
          `https://api.polygonscan.com/api?module=token&action=tokenholdercount&contractaddress=${TOKEN_ADDRESS}`
        );
        if (!res.ok) throw new Error("non-200");
        const data = await res.json();
        if (!cancelled && data.status === "1" && data.result) {
          const n = parseInt(data.result, 10);
          if (!isNaN(n) && n > 0) {
            setCount(n.toLocaleString());
          }
        }
      } catch {
        // silent — keep null so callers show fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCount();
    const id = setInterval(fetchCount, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { count, loading };
}
