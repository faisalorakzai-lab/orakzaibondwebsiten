import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, EventLog, parseEther, formatEther, JsonRpcProvider } from "ethers";
import ICO_ABI from "@/abi/ICOContract.json";

const ICO_CONTRACT_ADDRESS = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
const FALLBACK_RPCS = [
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
  "https://polygon-bor-rpc.publicnode.com",
];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
}

export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

function getReadContract(provider?: BrowserProvider | null) {
  if (provider) return new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider);
  const rpc = new JsonRpcProvider(FALLBACK_RPCS[0]);
  return new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, rpc);
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
      const c = getReadContract(provider);
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
        maxContribution: formatEther(maxContributionRaw as bigint),
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
      const c = getReadContract(provider);
      // Simulating 5-level fetching from contract or related event logs
      // In a real scenario, these would be direct contract calls to the new Referral contract
      const [contrib, refEarnings, refCount, events] = await Promise.all([
        safeCall(() => c.getUserContribution(addr), BigInt(0)),
        safeCall(() => c.getReferralEarnings(addr), BigInt(0)),
        safeCall(() => c.referralCount(addr), BigInt(0)),
        safeCall(() => c.queryFilter(c.filters.TokensPurchased(addr), -150_000), []),
      ]);

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
        referralEarnings: formatEther(refEarnings as bigint),
        referralCount: (refCount as bigint).toString(),
        levelCounts: ["0", "0", "0", "0", "0"], // Placeholder for 5 levels
        levelEarnings: ["0", "0", "0", "0", "0"], // Placeholder for 5 levels
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
    const referrerAddr = referrer && referrer.startsWith("0x") && referrer.length === 42 && referrer.toLowerCase() !== address.toLowerCase() ? referrer : ZERO_ADDRESS;
    setTxStatus("pending");
    setTxError(null);
    setTxHash(null);
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer);
      const value = parseEther(polAmount);
      const tx = await contract.buyTokens(referrerAddr, { value });
      setTxStatus("confirming");
      setTxHash(tx.hash);
      await tx.wait(1);
      setTxStatus("success");
      await fetchStats();
      if (address) await fetchUserStats(address);
    } catch (err: any) {
      setTxStatus("error");
      setTxError(err.message || "Transaction failed.");
    }
  }, [provider, address, fetchStats, fetchUserStats]);

  return { stats, userStats, loading, txStatus, txHash, txError, buyTokens, resetTx: () => setTxStatus("idle"), refresh: fetchStats };
}
