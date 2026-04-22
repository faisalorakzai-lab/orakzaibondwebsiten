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

// Simplified ABI for the Referral Contract View Functions
const REFERRAL_ABI = [
  "function getUserStats(address _user) external view returns (uint256[5] counts, uint256[5] earnings, uint256 totalEarnings, address referrer)",
  "function distributeRewards(address _buyer, uint256 _tokenAmount, address _referrer) external"
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
  if (provider) return new Contract(address, abi, provider);
  const rpc = new JsonRpcProvider(FALLBACK_RPCS[0]);
  return new Contract(address, abi, rpc);
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
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
        totalRaisedPOL: formatEther(totalRaisedRaw as bigint),
        hardCap: formatEther(hardCapRaw as bigint),
        softCap: formatEther(softCapRaw as bigint),
        tokensPerPOL: (tokensPerPOLRaw as bigint).toString(),
        minContribution: formatEther(minContribRaw as bigint),
        maxContribution: formatEther(maxContribRaw as bigint),
        totalTokensSold: formatEther(totalSoldRaw as bigint),
        referralBonusPercent: (refBonusRaw as bigint).toString(),
      });
    } catch (e) {
      console.error("useICO fetchStats error:", e);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const fetchUserStats = useCallback(async (addr: string) => {
    try {
      const icoContract = getReadContract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider);
      const refContract = getReadContract(REFERRAL_CONTRACT_ADDRESS, REFERRAL_ABI, provider);
      
      const [contrib, refStatsRaw, events] = await Promise.all([
        safeCall(() => icoContract.getUserContribution(addr), BigInt(0)),
        safeCall(() => refContract.getUserStats(addr), [Array(5).fill(BigInt(0)), Array(5).fill(BigInt(0)), BigInt(0), ZERO_ADDRESS]),
        safeCall(() => icoContract.queryFilter(icoContract.filters.TokensPurchased(addr), -150_000), []),
      ]);

      const [counts, earnings, totalEarnings, referrer] = refStatsRaw;

      let earnedRaw = BigInt(0);
      if (Array.isArray(events)) {
        for (const log of events) {
          if (log instanceof EventLog && log.args?.tokens != null) {
            earnedRaw += BigInt(log.args.tokens);
          }
        }
      }

      setUserStats({
        contribution: formatEther(contrib as bigint),
        earnedTokens: formatEther(earnedRaw),
        referralEarnings: formatEther(totalEarnings as bigint),
        referralCount: (counts as bigint[]).reduce((a, b) => a + b, BigInt(0)).toString(),
        levelCounts: (counts as bigint[]).map(c => c.toString()),
        levelEarnings: (earnings as bigint[]).map(e => formatEther(e)),
        referrer: referrer as string,
      });
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
    
    // Fallback to existing referrer if not in URL
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
      
      // Step 1: Buy tokens on ICO contract
      const tx = await contract.buyTokens(finalReferrer, { value });
      setTxStatus("confirming");
      setTxHash(tx.hash);
      const receipt = await tx.wait(1);
      
      // Note: The referral reward distribution is handled separately or within the contract.
      // If the ICO contract doesn't call the Referral contract, we would call it here,
      // but typically the ICO contract should be the one calling the Referral contract for security.
      
      setTxStatus("success");
      await fetchStats();
      if (address) await fetchUserStats(address);
    } catch (err: any) {
      setTxStatus("error");
      setTxError(err.message || "Transaction failed.");
    }
  }, [provider, address, userStats, fetchStats, fetchUserStats]);

  return { stats, userStats, loading, txStatus, txHash, txError, buyTokens, resetTx: () => setTxStatus("idle"), refresh: fetchStats };
}
