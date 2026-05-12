import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract } from "ethers";

const POLYGON_RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
];

const ICO_CONTRACT = "0x7BB2458740c4F491277973212309d831385Ab9D7";

const ICO_ABI = [
  "function tokensPerPOL() view returns (uint256)",
  "function totalRaisedPOL() view returns (uint256)",
  "function totalTokensSold() view returns (uint256)",
];

export interface TokenPriceData {
  priceUSD: string | null;
  pricePOL: string | null;
  polUSD: string | null;
  displayPrice: string;
  isLoading: boolean;
  isLive: boolean;
  lastUpdated: Date | null;
}

async function fetchPOLPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.["matic-network"]?.usd ?? null;
  } catch {
    return null;
  }
}

async function fetchTokenPriceFromChain(): Promise<{ pricePOL: number | null }> {
  for (const rpc of POLYGON_RPCS) {
    try {
      const provider = new JsonRpcProvider(rpc, { chainId: 137, name: "polygon" });
      const ico = new Contract(ICO_CONTRACT, ICO_ABI, provider);

      const tokensPerPOLRaw: bigint = await ico.tokensPerPOL();
      if (tokensPerPOLRaw > BigInt(0)) {
        const pricePOL = 1 / (Number(tokensPerPOLRaw) / 1e18);
        return { pricePOL };
      }
      return { pricePOL: null };
    } catch {
      continue;
    }
  }
  return { pricePOL: null };
}

export function useTokenPrice(refreshInterval = 60_000): TokenPriceData {
  const [state, setState] = useState<TokenPriceData>({
    priceUSD: null,
    pricePOL: null,
    polUSD: null,
    displayPrice: "Live Price Initializing",
    isLoading: true,
    isLive: false,
    lastUpdated: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const [chainData, polUSD] = await Promise.all([
        fetchTokenPriceFromChain(),
        fetchPOLPrice(),
      ]);

      const pricePOL = chainData.pricePOL;
      let priceUSD: number | null = null;
      let displayPrice = "Live Price Initializing";

      if (pricePOL !== null && polUSD !== null) {
        priceUSD = pricePOL * polUSD;
        displayPrice = `$${priceUSD.toFixed(4)}`;
      } else if (pricePOL !== null) {
        displayPrice = `${pricePOL.toFixed(6)} POL`;
      }

      setState({
        priceUSD: priceUSD !== null ? priceUSD.toFixed(6) : null,
        pricePOL: pricePOL !== null ? pricePOL.toFixed(6) : null,
        polUSD: polUSD !== null ? polUSD.toFixed(4) : null,
        displayPrice,
        isLoading: false,
        isLive: pricePOL !== null,
        lastUpdated: new Date(),
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        displayPrice: "On-Chain Sync Pending",
      }));
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  return state;
}
