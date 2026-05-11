import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract, formatEther, formatUnits } from "ethers";

const POLYGON_RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
];

const CONTRACTS = {
  OKBOND_TOKEN: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F",
  ICO: "0x7BB2458740c4F491277973212309d831385Ab9D7",
  VAULT: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08",
  STAKING: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e",
  NOTEBOOK_REGISTRY: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3",
  LOTTERY: "0x5bc55d4b347e39b986864e28604ddca5de6357b7",
};

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalBurned() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const LOTTERY_ABI = [
  "function lotteryStarted() view returns (bool)",
  "function winnersSelected() view returns (bool)",
  "function entryAmount() view returns (uint256)",
  "function rewardPerWinner() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function lockDuration() view returns (uint256)",
  "function players(uint256) view returns (address)",
  "function isWinner(address) view returns (bool)",
  "function rewardClaimed(address) view returns (bool)",
];

const ICO_ABI = [
  "function totalRaisedPOL() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function totalTokensSold() view returns (uint256)",
  "function icoActive() view returns (bool)",
];

const STAKING_ABI = [
  "function totalStaked() view returns (uint256)",
  "function totalStakers() view returns (uint256)",
  "function totalRewardsDistributed() view returns (uint256)",
];

const VAULT_ABI = [
  "function totalReserves() view returns (uint256)",
  "function lotteryPool() view returns (uint256)",
  "function treasuryBalance() view returns (uint256)",
];

const REGISTRY_ABI = [
  "function totalRegistered() view returns (uint256)",
  "function lastUpdated() view returns (uint256)",
];

export interface LiveBlockchainData {
  // Token Data
  totalSupply: string;
  circulatingSupply: string;
  tokenBurned: string;
  
  // Staking Data
  totalStaked: string;
  totalStakers: string;
  stakingRewardsDistributed: string;
  
  // Vault Data
  vaultReserves: string;
  treasuryBalance: string;
  lotteryPoolBalance: string;
  
  // ICO Data
  icoTokensSold: string;
  icoRaisedPOL: string;
  icoHardCap: string;
  icoActive: boolean;
  
  // Lottery Data
  lotteryActive: boolean;
  lotteryWinnersSelected: boolean;
  lotteryEntryAmount: string;
  lotteryRewardPerWinner: string;
  lotteryParticipants: number;
  
  // Registry Data
  registryEntriesCount: string;
  
  // Status
  networkStatus: "online" | "degraded" | "offline";
  lastUpdated: Date | null;
  dataInitialized: boolean;
}

function emptyData(): LiveBlockchainData {
  return {
    totalSupply: "0",
    circulatingSupply: "0",
    tokenBurned: "0",
    totalStaked: "0",
    totalStakers: "0",
    stakingRewardsDistributed: "0",
    vaultReserves: "0",
    treasuryBalance: "0",
    lotteryPoolBalance: "0",
    icoTokensSold: "0",
    icoRaisedPOL: "0",
    icoHardCap: "0",
    icoActive: false,
    lotteryActive: false,
    lotteryWinnersSelected: false,
    lotteryEntryAmount: "0",
    lotteryRewardPerWinner: "0",
    lotteryParticipants: 0,
    registryEntriesCount: "0",
    networkStatus: "offline",
    lastUpdated: null,
    dataInitialized: false,
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
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

async function countPlayers(contract: Contract, cap = 500): Promise<number> {
  let lo = 0,
    hi = cap;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    try {
      await contract.players(mid);
      lo = mid;
    } catch {
      hi = mid - 1;
    }
  }
  try {
    await contract.players(lo);
    return lo + 1;
  } catch {
    return 0;
  }
}

export function useLiveBlockchainData(refreshInterval = 30000) {
  const [data, setData] = useState<LiveBlockchainData>(emptyData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const provider = await getProvider();

      const token = new Contract(CONTRACTS.OKBOND_TOKEN, ERC20_ABI, provider);
      const ico = new Contract(CONTRACTS.ICO, ICO_ABI, provider);
      const staking = new Contract(CONTRACTS.STAKING, STAKING_ABI, provider);
      const vault = new Contract(CONTRACTS.VAULT, VAULT_ABI, provider);
      const lottery = new Contract(CONTRACTS.LOTTERY, LOTTERY_ABI, provider);
      const registry = new Contract(
        CONTRACTS.NOTEBOOK_REGISTRY,
        REGISTRY_ABI,
        provider
      );

      const [
        totalSupplyRaw,
        tokenBurnedRaw,
        totalStakedRaw,
        totalStakersRaw,
        stakingRewardsRaw,
        vaultReservesRaw,
        treasuryRaw,
        lotteryPoolRaw,
        icoTokensSoldRaw,
        icoRaisedRaw,
        icoHardCapRaw,
        icoActiveRaw,
        lotteryStartedRaw,
        lotteryWinnersSelectedRaw,
        lotteryEntryAmountRaw,
        lotteryRewardPerWinnerRaw,
        registryCountRaw,
      ] = await Promise.all([
        safeCall(() => token.totalSupply(), BigInt(0)),
        safeCall(() => token.totalBurned(), BigInt(0)),
        safeCall(() => staking.totalStaked(), BigInt(0)),
        safeCall(() => staking.totalStakers(), BigInt(0)),
        safeCall(() => staking.totalRewardsDistributed(), BigInt(0)),
        safeCall(() => vault.totalReserves(), BigInt(0)),
        safeCall(() => vault.treasuryBalance(), BigInt(0)),
        safeCall(() => vault.lotteryPool(), BigInt(0)),
        safeCall(() => ico.totalTokensSold(), BigInt(0)),
        safeCall(() => ico.totalRaisedPOL(), BigInt(0)),
        safeCall(() => ico.hardCap(), BigInt(0)),
        safeCall(() => ico.icoActive(), false),
        safeCall(() => lottery.lotteryStarted(), false),
        safeCall(() => lottery.winnersSelected(), false),
        safeCall(() => lottery.entryAmount(), BigInt(0)),
        safeCall(() => lottery.rewardPerWinner(), BigInt(0)),
        safeCall(() => registry.totalRegistered(), BigInt(0)),
      ]);

      const lotteryParticipants = await safeCall(
        () => countPlayers(lottery),
        0
      );

      const totalSupply = formatEther(totalSupplyRaw);
      const tokenBurned = formatEther(tokenBurnedRaw);
      const circulatingSupply = (
        parseFloat(totalSupply) - parseFloat(tokenBurned)
      ).toFixed(2);

      setData({
        totalSupply,
        circulatingSupply,
        tokenBurned,
        totalStaked: formatEther(totalStakedRaw),
        totalStakers: totalStakersRaw.toString(),
        stakingRewardsDistributed: formatEther(stakingRewardsRaw),
        vaultReserves: formatEther(vaultReservesRaw),
        treasuryBalance: formatEther(treasuryRaw),
        lotteryPoolBalance: formatEther(lotteryPoolRaw),
        icoTokensSold: formatEther(icoTokensSoldRaw),
        icoRaisedPOL: formatEther(icoRaisedRaw),
        icoHardCap: formatEther(icoHardCapRaw),
        icoActive: Boolean(icoActiveRaw),
        lotteryActive: Boolean(lotteryStartedRaw),
        lotteryWinnersSelected: Boolean(lotteryWinnersSelectedRaw),
        lotteryEntryAmount: formatEther(lotteryEntryAmountRaw),
        lotteryRewardPerWinner: formatEther(lotteryRewardPerWinnerRaw),
        lotteryParticipants,
        registryEntriesCount: registryCountRaw.toString(),
        networkStatus: "online",
        lastUpdated: new Date(),
        dataInitialized: true,
      });
      setError(null);
    } catch (e) {
      setError("Failed to fetch blockchain data");
      setData((prev) => ({
        ...prev,
        networkStatus: "degraded",
        dataInitialized: true,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, refreshInterval);
    return () => clearInterval(id);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh: fetchData };
}
