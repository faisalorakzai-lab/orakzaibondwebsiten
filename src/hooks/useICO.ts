import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, EventLog, parseEther, formatEther, JsonRpcProvider } from "ethers";
import ICO_ABI from "@/abi/ICOContract.json";

// Live Contract Addresses
const ICO_CONTRACT_ADDRESS = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
const REFERRAL_CONTRACT_ADDRESS = "0x66471251A19D7A862e931340998cADFa9a411E9B";

const FALLBACK_RPCS = [
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
  "https://polygon-bor-rpc.publicnode.com",
];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const REFERRAL_ABI = [
  "function getUserStats(address _user) external view returns (uint256[5] counts, uint256[5] earnings, uint256 totalEarnings, address referrer)",
  "function distributeRewards(address _buyer, uint256 _tokenAmount, address _referrer) external",
  "function levelRates(uint256) external view returns (uint256)",
  "function paused() external view returns (bool)"
];

export interface ICOStats {
  icoActive: boolean;
  totalRaisedPOL: string;
  hardCap: string;
  softCap: string;
  tokensPerPOL: string;
  minContribution: string;
  maxContribution: string;
  totalTokensSold: string;
  referralBonusPercent: string;
}

export interface UserICOStats {
  contribution: string;
  earnedTokens: string;
  referralEarnings: string;
  referralCount: string;
  levelCounts: string[];
  levelEarnings: string[];
  referrer: string;
}

export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

function getReadContract(address: string, abi: any, provider?: BrowserProvider | null) {
  try {
    if (provider) return new Contract(address, abi, provider);
    const rpc = new JsonRpcProvider(FALLBACK_RPCS[0]);
    return new Contract(address, abi, rpc);
  } catch (err) {
    console.error("Failed to initialize contract:", err);
    return null;
  }
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { 
    console.warn("Contract call failed:", err);
    return fallback; 
  }
}

export function useICO(provider: BrowserProvider | null, address: string | null) {
  const [stats, setStats]         = useState<ICOStats | null>(null);
  const [userStats, setUserStats] = useState<UserICOStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [txStatus, setTxStatus]   = useState<TxStatus>("idle");
  const [txHash, setTxHash]       = useState<string | null>(null);
  const [txError, setTxError]     = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const c = getReadContract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider);
      if (!c) throw new Error("ICO contract not initialized");

      const [
        icoActiveRaw, totalRaisedRaw, hardCapRaw, softCapRaw,
        tokensPerPOLRaw, minContribRaw, maxContribRaw, totalSoldRaw, refBonusRaw
      ] = await Promise.all([
        safeCall(() => c.icoActive(), true),
        safeCall(() => c.totalRaisedPOL(), BigInt(0)),
        safeCall(() => c.hardCap(), BigInt(0)),
        safeCall(() => c.softCap(), BigInt(0)),
        safeCall(() => c.tokensPerPOL(), BigInt(0)),
        safeCall(() => c.minContribution(), BigInt(0)),
        safeCall(() => c.maxContribution(), BigInt(0)),
        safeCall(() => c.totalTokensSold(), BigInt(0)),
        safeCall(() => c.referralBonusPercent(), BigInt(0)),
      ]);

      setStats({
        icoActive: Boolean(icoActiveRaw),
        totalRaisedPOL: formatEther(totalRaisedRaw || BigInt(0)),
        hardCap: formatEther(hardCapRaw || BigInt(0)),
        softCap: formatEther(softCapRaw || BigInt(0)),
        tokensPerPOL: (tokensPerPOLRaw || BigInt(0)).toString(),
        minContribution: formatEther(minContribRaw || BigInt(0)),
        maxContribution: formatEther(maxContribRaw || BigInt(0)),
        totalTokensSold: formatEther(totalSoldRaw || BigInt(0)),
        referralBonusPercent: (refBonusRaw || BigInt(0)).toString(),
      });
    } catch (e) {
      console.error("useICO fetchStats error:", e);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const fetchUserStats = useCallback(async (addr: string) => {
    console.log("Fetching user stats for:", addr);
    try {
      const icoContract = getReadContract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider);
      const refContract = getReadContract(REFERRAL_CONTRACT_ADDRESS, REFERRAL_ABI, provider);
      
      if (!icoContract || !refContract) throw new Error("Contracts not initialized");

      const [contrib, refStatsRaw, events] = await Promise.all([
        safeCall(() => icoContract.getUserContribution(addr), BigInt(0)),
        safeCall(() => refContract.getUserStats(addr), [Array(5).fill(BigInt(0)), Array(5).fill(BigInt(0)), BigInt(0), ZERO_ADDRESS]),
        safeCall(() => icoContract.queryFilter(icoContract.filters.TokensPurchased(addr), -150_000), []),
      ]);

      console.log("Raw refStatsRaw:", refStatsRaw);

      const counts = Array.isArray(refStatsRaw?.[0]) ? refStatsRaw[0] : Array(5).fill(BigInt(0));
      const earnings = Array.isArray(refStatsRaw?.[1]) ? refStatsRaw[1] : Array(5).fill(BigInt(0));
      const totalEarnings = refStatsRaw?.[2] || BigInt(0);
      const referrer = refStatsRaw?.[3] || ZERO_ADDRESS;

      let earnedRaw = BigInt(0);
      if (Array.isArray(events)) {
        for (const log of events) {
          if (log instanceof EventLog && log.args?.tokens != null) {
            earnedRaw += BigInt(log.args.tokens);
          }
        }
      }

      const newUserStats = {
        contribution: formatEther(contrib || BigInt(0)),
        earnedTokens: formatEther(earnedRaw),
        referralEarnings: formatEther(totalEarnings),
        referralCount: counts.reduce((a: bigint, b: bigint) => a + (b || BigInt(0)), BigInt(0)).toString(),
        levelCounts: counts.map((c: bigint) => (c || BigInt(0)).toString()),
        levelEarnings: earnings.map((e: bigint) => formatEther(e || BigInt(0))),
        referrer: String(referrer),
      };
      
      console.log("Setting user stats:", newUserStats);
      setUserStats(newUserStats);
    } catch (e) {
      console.error("useICO fetchUserStats error:", e);
    }
  }, [provider]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (address) fetchUserStats(address);
    else setUserStats(null);
  }, [address, fetchUserStats]);

  const buyTokens = useCallback(async (polAmount: string, referrer: string | null) => {
    if (!provider || !address) {
      setTxError("Wallet not connected.");
      return;
    }
    
    const finalReferrer = (referrer && referrer.startsWith("0x") && referrer.length === 42 && referrer.toLowerCase() !== address.toLowerCase()) 
      ? referrer 
      : (userStats?.referrer && userStats.referrer !== ZERO_ADDRESS ? userStats.referrer : ZERO_ADDRESS);

    setTxStatus("pending");
    setTxError(null);
    setTxHash(null);
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer);
      const value = parseEther(polAmount);
      
      const tx = await contract.buyTokens(finalReferrer, { value });
      setTxStatus("confirming");
      setTxHash(tx.hash);
      await tx.wait(1);
      
      setTxStatus("success");
      await fetchStats();
      if (address) await fetchUserStats(address);
    } catch (err: any) {
      console.error("Purchase error:", err);
      setTxStatus("error");
      setTxError(err.message || "Transaction failed.");
    }
  }, [provider, address, userStats, fetchStats, fetchUserStats]);

  return { 
    stats, 
    userStats, 
    loading, 
    txStatus, 
    txHash, 
    txError, 
    buyTokens, 
    resetTx: () => setTxStatus("idle"), 
    refresh: () => { fetchStats(); if(address) fetchUserStats(address); } 
  };
}
