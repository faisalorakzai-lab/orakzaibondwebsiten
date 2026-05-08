import { useState, useEffect } from "react";

export const FOUNDER_RANK_DEFAULT = 803;
const LS_KEY = "okbond_founder_rank";
const EVENT = "okbond:founder-rank-changed";

function readRank(): number {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v !== null) {
      const n = parseInt(v, 10);
      if (!isNaN(n) && n > 0) return n;
    }
  } catch { /* */ }
  return FOUNDER_RANK_DEFAULT;
}

export function setFounderRank(rank: number | null): void {
  try {
    if (rank === null) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, String(rank));
    }
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch { /* */ }
}

export function useFounderRank(): number {
  const [rank, setRank] = useState<number>(readRank);

  useEffect(() => {
    const handler = () => setRank(readRank());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return rank;
}
