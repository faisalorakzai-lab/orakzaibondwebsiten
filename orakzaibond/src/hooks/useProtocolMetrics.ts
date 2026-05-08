import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract, formatEther, formatUnits } from "ethers";

const POLYGON_RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
];

const CONTRACTS = {
  OKBOND_TOKEN:       "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F",
  ICO:                "0x7BB2458740c4F491277973212309d831385Ab9D7",
  VAULT:              "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08",
  STAKING:            "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e",
  NOTEBOOK_REGISTRY:  "0xa6a1C3D97e629326ad812e97e927622A8dA711a3",
};

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalBurned() view returns (uint256)",
];

const ICO_ABI = [
  "function totalRaisedPOL() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function totalTokensSold() view returns (uint256)",
  "function icoActive() view returns (bool)",
  "function tokensPerPOL() view returns (uint256)",
];

const STAKING_ABI = [
  "function totalStaked() view returns (uint256)",
  "function totalStakers() view returns (uint256)",
  "function totalRewardsDistributed() view returns (uint256)",
];

const VAULT_ABI = [
  "function totalReserves() view returns (uint256)",
  "function lotteryPool() view returns (uint256)",
  "function burnedTokens() view returns (uint256)",
  "function treasuryBalance() view returns (uint256)",
];

export interface ProtocolMetrics {
  totalValueLocked: string;
  totalStaked: string;
  totalStakers: string;
  tokensBurned: string;
  treasuryBalance: string;
  vaultReserves: string;
  lotteryPool: string;
  icoProgress: number;
  icoRaised: string;
  icoHardCap: string;
  totalSupply: string;
  tokensSold: string;
  icoActive: boolean;
  apy: string;
  rewardsDistributed: string;
  networkStatus: "online" | "degraded" | "offline";
  lastUpdated: Date | null;
}

function emptyMetrics(): ProtocolMetrics {
  return {
    totalValueLocked: "0",
    totalStaked: "0",
    totalStakers: "0",
    tokensBurned: "0",
    treasuryBalance: "0",
    vaultReserves: "0",
    lotteryPool: "0",
    icoProgress: 0,
    icoRaised: "0",
    icoHardCap: "0",
    totalSupply: "0",
    tokensSold: "0",
    icoActive: false,
    apy: "18",
    rewardsDistributed: "0",
    networkStatus: "offline",
    lastUpdated: null,
  };
}

async function getProvider(): Promise<JsonRpcProvider> {
  for (const rpc of POLYGON_RPCS) {
    try {
      const p = new JsonRpcProvider(rpc, { chainId: 137, name: "polygon" });
      await p.getBlockNumber();
      return p;
    } catch {
      continue;
    }
  }
  return new JsonRpcProvider(POLYGON_RPCS[0], { chainId: 137, name: "polygon" });
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export function useProtocolMetrics(refreshInterval = 30_000) {
  const [metrics, setMetrics] = useState<ProtocolMetrics>(emptyMetrics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const provider = await getProvider();

      const token   = new Contract(CONTRACTS.OKBOND_TOKEN, ERC20_ABI, provider);
      const ico     = new Contract(CONTRACTS.ICO, ICO_ABI, provider);
      const staking = new Contract(CONTRACTS.STAKING, STAKING_ABI, provider);
      const vault   = new Contract(CONTRACTS.VAULT, VAULT_ABI, provider);

      const [
        totalSupplyRaw,
        totalBurnedRaw,
        icoRaisedRaw,
        icoHardCapRaw,
        totalTokensSoldRaw,
        icoActiveRaw,
        totalStakedRaw,
        totalStakersRaw,
        rewardsDistRaw,
        vaultReservesRaw,
        lotteryPoolRaw,
        treasuryRaw,
      ] = await Promise.all([
        safeCall(() => token.totalSupply(), BigInt(0)),
        safeCall(() => token.totalBurned(),  BigInt(0)),
        safeCall(() => ico.totalRaisedPOL(), BigInt(0)),
        safeCall(() => ico.hardCap(),        BigInt(0)),
        safeCall(() => ico.totalTokensSold(),BigInt(0)),
        safeCall(() => ico.icoActive(),      false),
        safeCall(() => staking.totalStaked(),BigInt(0)),
        safeCall(() => staking.totalStakers(),BigInt(0)),
        safeCall(() => staking.totalRewardsDistributed(), BigInt(0)),
        safeCall(() => vault.totalReserves(), BigInt(0)),
        safeCall(() => vault.lotteryPool(),   BigInt(0)),
        safeCall(() => vault.treasuryBalance(),BigInt(0)),
      ]);

      const raised   = parseFloat(formatEther(icoRaisedRaw));
      const hardCap  = parseFloat(formatEther(icoHardCapRaw));
      const progress = hardCap > 0 ? Math.min((raised / hardCap) * 100, 100) : 0;

      const stakedPOLEq = parseFloat(formatEther(totalStakedRaw)) * 0.0018;
      const vaultPOL    = parseFloat(formatEther(vaultReservesRaw));
      const tvl         = (stakedPOLEq + vaultPOL + raised).toFixed(2);

      setMetrics({
        totalValueLocked:   tvl,
        totalStaked:        formatEther(totalStakedRaw),
        totalStakers:       totalStakersRaw.toString(),
        tokensBurned:       formatEther(totalBurnedRaw),
        treasuryBalance:    formatEther(treasuryRaw),
        vaultReserves:      formatEther(vaultReservesRaw),
        lotteryPool:        formatEther(lotteryPoolRaw),
        icoProgress:        progress,
        icoRaised:          formatEther(icoRaisedRaw),
        icoHardCap:         formatEther(icoHardCapRaw),
        totalSupply:        formatEther(totalSupplyRaw),
        tokensSold:         formatEther(totalTokensSoldRaw),
        icoActive:          Boolean(icoActiveRaw),
        apy:                "18",
        rewardsDistributed: formatEther(rewardsDistRaw),
        networkStatus:      "online",
        lastUpdated:        new Date(),
      });
      setError(null);
    } catch (e) {
      setError("Failed to fetch protocol metrics");
      setMetrics(prev => ({ ...prev, networkStatus: "degraded" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(id);
  }, [fetchMetrics, refreshInterval]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
