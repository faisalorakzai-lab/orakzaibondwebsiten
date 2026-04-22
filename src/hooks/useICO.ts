import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, EventLog, parseEther, formatEther, JsonRpcProvider } from "ethers";
import ICO_ABI from "@/abi/ICOContract.json";

const ICO_CONTRACT_ADDRESS = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
// CORS-friendly public RPCs — tried in order until one works
const FALLBACK_RPCS = [
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
  "https://polygon-bor-rpc.publicnode.com",
];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface ICOStats {
  icoActive: boolean;
  totalRaisedPOL: string;       // formatted ETH string
  hardCap: string;
  softCap: string;
  tokensPerPOL: string;
  minContribution: string;
  maxContribution: string;
  totalTokensSold: string;
  referralBonusPercent: string;
}

export interface UserICOStats {
  contribution: string;      // POL contributed
  earnedTokens: string;      // OKBOND tokens received (from TokensPurchased events)
  referralEarnings: string;  // POL earned as referral commission (Pending Rewards)
  referralCount: string;
  level1Count: string;
  level2Count: string;
  level3Count: string;
  level4Count: string;
  level5Count: string;
  level1Earnings: string;
  level2Earnings: string;
  level3Earnings: string;
  level4Earnings: string;
  level5Earnings: string;
}

export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

// ── Read-only contract: prefer injected MetaMask, fall back to public RPCs ──
function getReadContract(provider?: BrowserProvider | null) {
  if (provider) return new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider);
  // Try CORS-friendly fallbacks in order
  const rpc = new JsonRpcProvider(FALLBACK_RPCS[0]);
  return new Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, rpc);
}

// ── Safely call a view fn — returns null if it doesn't exist ────────────────
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

  // ── Fetch on-chain ICO stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const c = getReadContract(provider);

      const [
        icoActiveRaw,
        totalRaisedRaw,
        hardCapRaw,
        softCapRaw,
        tokensPerPOLRaw,
        minContribRaw,
        maxContribRaw,
        totalSoldRaw,
        refBonusRaw,
      ] = await Promise.all([
        safeCall(() => c.icoActive(),               true),
        safeCall(() => c.totalRaisedPOL(),           BigInt(0)),
        safeCall(() => c.hardCap(),                  BigInt(0)),
        safeCall(() => c.softCap(),                  BigInt(0)),
        safeCall(() => c.tokensPerPOL(),             BigInt(0)),
        safeCall(() => c.minContribution(),          BigInt(0)),
        safeCall(() => c.maxContribution(),          BigInt(0)),
        safeCall(() => c.totalTokensSold(),          BigInt(0)),
        safeCall(() => c.referralBonusPercent(),     BigInt(0)),
      ]);

      setStats({
        icoActive:           Boolean(icoActiveRaw),
        totalRaisedPOL:      formatEther(totalRaisedRaw as bigint),
        hardCap:             formatEther(hardCapRaw as bigint),
        softCap:             formatEther(softCapRaw as bigint),
        tokensPerPOL:        (tokensPerPOLRaw as bigint).toString(),
        minContribution:     formatEther(minContribRaw as bigint),
        maxContribution:     formatEther(maxContribRaw as bigint),
        totalTokensSold:     formatEther(totalSoldRaw as bigint),
        referralBonusPercent:(refBonusRaw as bigint).toString(),
      });
    } catch (e) {
      console.error("useICO fetchStats error:", e);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // ── Fetch user-specific stats ───────────────────────────────────────────
  const fetchUserStats = useCallback(async (addr: string) => {
    try {
      const c = getReadContract(provider);

      // Parallel: on-chain view calls + event log query
      const [
        contrib, 
        refEarnings, 
        refCount, 
        l1C, l2C, l3C, l4C, l5C,
        l1E, l2E, l3E, l4E, l5E,
        events
      ] = await Promise.all([
        safeCall(() => c.getUserContribution(addr),  BigInt(0)),
        safeCall(() => c.getReferralEarnings(addr),  BigInt(0)),
        safeCall(() => c.referralCount(addr),        BigInt(0)),
        // 5-level counts
        safeCall(() => c.level1Count(addr), BigInt(0)),
        safeCall(() => c.level2Count(addr), BigInt(0)),
        safeCall(() => c.level3Count(addr), BigInt(0)),
        safeCall(() => c.level4Count(addr), BigInt(0)),
        safeCall(() => c.level5Count(addr), BigInt(0)),
        // 5-level earnings
        safeCall(() => c.level1Earnings(addr), BigInt(0)),
        safeCall(() => c.level2Earnings(addr), BigInt(0)),
        safeCall(() => c.level3Earnings(addr), BigInt(0)),
        safeCall(() => c.level4Earnings(addr), BigInt(0)),
        safeCall(() => c.level5Earnings(addr), BigInt(0)),
        // Query TokensPurchased events where buyer == addr (indexed param 0)
        safeCall(
          () => c.queryFilter(c.filters.TokensPurchased(addr), -150_000),
          [] as any[]
        ),
      ]);

      // Sum tokens field from all matching purchase events
      let earnedRaw = BigInt(0);
      if (Array.isArray(events)) {
        for (const log of events) {
          if (log instanceof EventLog && log.args?.tokens != null) {
            earnedRaw += BigInt(log.args.tokens);
          }
        }
      }

      setUserStats({
        contribution:     formatEther(contrib as bigint),
        earnedTokens:     formatEther(earnedRaw),
        referralEarnings: formatEther(refEarnings as bigint),
        referralCount:    (refCount as bigint).toString(),
        level1Count:      (l1C as bigint).toString(),
        level2Count:      (l2C as bigint).toString(),
        level3Count:      (l3C as bigint).toString(),
        level4Count:      (l4C as bigint).toString(),
        level5Count:      (l5C as bigint).toString(),
        level1Earnings:   formatEther(l1E as bigint),
        level2Earnings:   formatEther(l2E as bigint),
        level3Earnings:   formatEther(l3E as bigint),
        level4Earnings:   formatEther(l4E as bigint),
        level5Earnings:   formatEther(l5E as bigint),
      });
    } catch (e) {
      console.error("useICO fetchUserStats error:", e);
    }
  }, [provider]);

  // ── Initial load + poll every 30s ─────────────────────────────────────
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (address) fetchUserStats(address);
    else setUserStats(null);
  }, [address, fetchUserStats]);

  // ── Buy tokens ──────────────────────────────────────────────────────────
  const buyTokens = useCallback(async (
    polAmount: string,
    referrer: string | null,
  ) => {
    if (!provider || !address) {
      setTxError("Wallet not connected.");
      return;
    }

    // Validate referrer
    const referrerAddr =
      referrer &&
      referrer.startsWith("0x") &&
      referrer.length === 42 &&
      referrer.toLowerCase() !== address.toLowerCase()
        ? referrer
        : ZERO_ADDRESS;

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

      await tx.wait(1);   // wait for 1 confirmation
      setTxStatus("success");

      // Refresh stats after purchase
      await fetchStats();
      if (address) await fetchUserStats(address);

    } catch (err: unknown) {
      setTxStatus("error");
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string | number }).code;
        if (code === 4001 || code === "ACTION_REJECTED") {
          setTxError("Transaction rejected by user.");
        } else if ("reason" in err) {
          setTxError((err as { reason: string }).reason || "Transaction failed.");
        } else if (err instanceof Error) {
          setTxError(err.message);
        } else {
          setTxError("Transaction failed. Please try again.");
        }
      } else if (err instanceof Error) {
        setTxError(err.message);
      } else {
        setTxError("Transaction failed. Please try again.");
      }
    }
  }, [provider, address, fetchStats, fetchUserStats]);

  const resetTx = useCallback(() => {
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
  }, []);

  return {
    stats,
    userStats,
    loading,
    txStatus,
    txHash,
    txError,
    buyTokens,
    resetTx,
    refresh: fetchStats,
  };
}
