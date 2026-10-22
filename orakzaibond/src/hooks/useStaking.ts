import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import STAKING_ABI from "@/abi/StakingContract.json";
import OKBOND_ABI from "@/abi/OKBONDToken.json";

export const STAKING_ADDRESS = "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e";
export const OKBOND_ADDRESS  = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const POLYGON_RPC = "https://polygon-bor-rpc.publicnode.com";
export const LOCK_PERIODS = [30, 90, 180, 365] as const;

export interface StakeInfo {
  id: number; amount: string; startTime: number; lockPeriod: number; apy: number; active: boolean; pendingReward: string;
}
export interface StakingStats {
  totalStaked: string; totalStakers: string; rewardsDistributed: string; userStaked: string; userRewards: string;
  userStakes: StakeInfo[]; allowance: string; apys: Record<number, number>;
}
export type StakeTxStatus = "idle" | "approving" | "staking" | "unstaking" | "claiming" | "success" | "error";

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export function useStaking(provider: BrowserProvider | null, address: string | null) {
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<StakeTxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const getReadProvider = useCallback(() => new JsonRpcProvider(POLYGON_RPC, { chainId: 137, name: "polygon" }), []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const rpc = getReadProvider();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, rpc);
      const okbond = new Contract(OKBOND_ADDRESS, OKBOND_ABI, rpc);
      const [totalStaked, totalStakers, rewardsDistributed, apyValues] = await Promise.all([
        safeCall(() => staking.totalStaked(), 0n), safeCall(() => staking.totalStakers(), 0n), safeCall(() => staking.totalRewardsDistributed(), 0n),
        Promise.all(LOCK_PERIODS.map(async (days) => [days, Number(await safeCall(() => staking.getAPY(days * 86400), 0n))] as const)),
      ]);
      let userStaked = "0", userRewards = "0", allowance = "0", userStakes: StakeInfo[] = [];
      if (address) {
        const [uStaked, uRewards, stakeCount, allow] = await Promise.all([
          safeCall(() => staking.totalUserStaked(address), 0n), safeCall(() => staking.totalUserRewards(address), 0n),
          safeCall(() => staking.getStakeCount(address), 0n), safeCall(() => okbond.allowance(address, STAKING_ADDRESS), 0n),
        ]);
        userStaked = formatEther(uStaked); userRewards = formatEther(uRewards); allowance = formatEther(allow);
        const count = Math.min(Number(stakeCount), 50);
        const rawStakes = await Promise.all(Array.from({ length: count }, (_, i) => Promise.all([
          safeCall(() => staking.getStakeInfo(address, i), [0n, 0n, 0n, 0n, false]), safeCall(() => staking.pendingRewards(address, i), 0n),
        ])));
        userStakes = rawStakes.map(([info, pending], i) => ({ id: i, amount: formatEther(info[0] || 0n), startTime: Number(info[1] || 0n), lockPeriod: Number(info[2] || 0n) / 86400, apy: Number(info[3] || 0n), active: Boolean(info[4]), pendingReward: formatEther(pending) })).filter((s) => s.active);
      }
      setStats({ totalStaked: formatEther(totalStaked), totalStakers: totalStakers.toString(), rewardsDistributed: formatEther(rewardsDistributed), userStaked, userRewards, userStakes, allowance, apys: Object.fromEntries(apyValues) });
    } catch (e) { console.error("useStaking fetchStats:", e); }
    finally { setLoading(false); }
  }, [address, getReadProvider]);

  useEffect(() => { fetchStats(); const id = setInterval(fetchStats, 30_000); return () => clearInterval(id); }, [fetchStats]);

  const approveAndStake = useCallback(async (amount: string, lockDays: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus("approving"); setTxError(null); setTxHash(null);
    try {
      const signer = await provider.getSigner(); const token = new Contract(OKBOND_ADDRESS, OKBOND_ABI, signer); const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer); const amountWei = parseEther(amount);
      if (await safeCall(() => token.allowance(address, STAKING_ADDRESS), 0n) < amountWei) { const approval = await token.approve(STAKING_ADDRESS, amountWei); await approval.wait(1); }
      setTxStatus("staking"); const tx = await staking.stake(amountWei, lockDays * 86400); setTxHash(tx.hash); await tx.wait(1); setTxStatus("success"); await fetchStats();
    } catch (err: any) { setTxStatus("error"); setTxError(err?.shortMessage || err?.message || "Staking failed"); }
  }, [provider, address, fetchStats]);

  const runPositionTx = useCallback(async (kind: "unstake" | "claim", stakeId: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus(kind === "unstake" ? "unstaking" : "claiming"); setTxError(null); setTxHash(null);
    try { const signer = await provider.getSigner(); const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer); const tx = await staking[kind === "unstake" ? "unstake" : "claimRewards"](stakeId); setTxHash(tx.hash); await tx.wait(1); setTxStatus("success"); await fetchStats(); }
    catch (err: any) { setTxStatus("error"); setTxError(err?.shortMessage || err?.message || `${kind} failed`); }
  }, [provider, address, fetchStats]);

  return { stats, loading, txStatus, txHash, txError, lockPeriods: LOCK_PERIODS, approveAndStake, unstake: (id: number) => runPositionTx("unstake", id), claimRewards: (id: number) => runPositionTx("claim", id), resetTx: () => { setTxStatus("idle"); setTxError(null); setTxHash(null); }, refresh: fetchStats };
}
