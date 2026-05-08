import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract, formatEther } from "ethers";
import VAULT_ABI from "@/abi/VaultContract.json";

const VAULT_ADDRESS = "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08";
const POLYGON_RPCS  = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc.ankr.com/polygon",
];

export interface VaultData {
  totalReserves: string;
  liquidityReserve: string;
  treasuryBalance: string;
  lotteryPool: string;
  burnedTokens: string;
  totalDeposited: string;
  reserveRatio: number;
  isPaused: boolean;
  owner: string;
  lastFetched: Date | null;
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export function useVault(refreshInterval = 30_000) {
  const [data, setData]     = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetchVault = useCallback(async () => {
    setLoading(true);
    try {
      let provider: JsonRpcProvider | null = null;
      for (const rpc of POLYGON_RPCS) {
        try {
          provider = new JsonRpcProvider(rpc, { chainId: 137, name: "polygon" });
          await provider.getBlockNumber();
          break;
        } catch { provider = null; }
      }
      if (!provider) throw new Error("No RPC available");

      const vault = new Contract(VAULT_ADDRESS, VAULT_ABI, provider);

      const [
        reserves,
        liquidity,
        treasury,
        lottery,
        burned,
        deposited,
        ratio,
        paused,
        owner,
      ] = await Promise.all([
        safeCall(() => vault.totalReserves(),    BigInt(0)),
        safeCall(() => vault.liquidityReserve(), BigInt(0)),
        safeCall(() => vault.treasuryBalance(),  BigInt(0)),
        safeCall(() => vault.lotteryPool(),      BigInt(0)),
        safeCall(() => vault.burnedTokens(),     BigInt(0)),
        safeCall(() => vault.totalDeposited(),   BigInt(0)),
        safeCall(() => vault.getReserveRatio(),  BigInt(0)),
        safeCall(() => vault.paused(),           false),
        safeCall(() => vault.owner(),            "0x0000000000000000000000000000000000000000"),
      ]);

      setData({
        totalReserves:    formatEther(reserves),
        liquidityReserve: formatEther(liquidity),
        treasuryBalance:  formatEther(treasury),
        lotteryPool:      formatEther(lottery),
        burnedTokens:     formatEther(burned),
        totalDeposited:   formatEther(deposited),
        reserveRatio:     Number(ratio),
        isPaused:         Boolean(paused),
        owner:            String(owner),
        lastFetched:      new Date(),
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to fetch vault data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
    const id = setInterval(fetchVault, refreshInterval);
    return () => clearInterval(id);
  }, [fetchVault, refreshInterval]);

  return { data, loading, error, refresh: fetchVault };
}
