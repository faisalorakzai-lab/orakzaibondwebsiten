import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import STAKING_ABI from "@/abi/StakingContract.json";
import OKBOND_ABI from "@/abi/OKBONDToken.json";

export const STAKING_ADDRESS = "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e";
export const OKBOND_ADDRESS  = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const POLYGON_RPC = "https://polygon-bor-rpc.publicnode.com";
export const LOCK_PERIODS = [30, 90, 180, 365] as const;

export interface StakeInfo {
  id: number; amount: string; startTime: number; lockPeriod: number; apy: number; active: boolean; pendingReward: string; txHash: string | null;
}
export interface StakingStats {
  totalStaked: string; totalStakers: string; rewardsDistributed: string; userStaked: string; userRewards: string;
  userStakes: StakeInfo[]; allowance: string; apys: Record<number, number>;
}
export type StakeTxStatus = "idle" | "approving" | "staking" | "unstaking" | "claiming" | "success" | "error";

export function useStaking(provider: BrowserProvider | null, address: string | null) {
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<StakeTxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const getReadProvider = useCallback(() => new JsonRpcProvider(POLYGON_RPC, { chainId: 137, name: "polygon" }), []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setReadError(null);
    try {
      const rpc = getReadProvider();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, rpc);
      const okbond = new Contract(OKBOND_ADDRESS, OKBOND_ABI, rpc);
      const [totalStaked, totalStakers, rewardsDistributed, apyValues] = await Promise.all([
        staking.totalStaked(), staking.totalStakers(), staking.totalRewardsDistributed(),
        Promise.all(LOCK_PERIODS.map(async (days) => [days, Number(await staking.getAPY(days * 86400))] as const)),
      ]);
      let userStaked = "0", userRewards = "0", allowance = "0", userStakes: StakeInfo[] = [];
      if (address) {
        const [uStaked, uRewards, stakeCount, allow] = await Promise.all([
          staking.totalUserStaked(address), staking.totalUserRewards(address),
          staking.getStakeCount(address), okbond.allowance(address, STAKING_ADDRESS),
        ]);
        userStaked = formatEther(uStaked); userRewards = formatEther(uRewards); allowance = formatEther(allow);
        const count = Math.min(Number(stakeCount), 50);
        const rawStakes = await Promise.all(Array.from({ length: count }, (_, i) => Promise.all([
          staking.getStakeInfo(address, i), staking.pendingRewards(address, i),
        ])));
        // Staked events do not contain a stake id. Never infer a hash from event ordering.
        userStakes = rawStakes.map(([info, pending], i) => ({ id: i, amount: formatEther(info[0]), startTime: Number(info[1]), lockPeriod: Number(info[2]) / 86400, apy: Number(info[3]), active: Boolean(info[4]), pendingReward: formatEther(pending), txHash: null })).filter((s) => s.active);
      }
      setStats({ totalStaked: formatEther(totalStaked), totalStakers: totalStakers.toString(), rewardsDistributed: formatEther(rewardsDistributed), userStaked, userRewards, userStakes, allowance, apys: Object.fromEntries(apyValues) });
    } catch (e) {
      console.error("useStaking fetchStats:", e);
      setStats(null);
      setReadError("Live Polygon staking data is temporarily unavailable. Retry to connect again.");
    }
    finally { setLoading(false); }
  }, [address, getReadProvider]);

  useEffect(() => { fetchStats(); const id = setInterval(fetchStats, 30_000); return () => clearInterval(id); }, [fetchStats]);

  const approveAndStake = useCallback(async (amount: string, lockDays: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus("approving"); setTxError(null); setTxHash(null);
    try {
      const signer = await provider.getSigner(); const token = new Contract(OKBOND_ADDRESS, OKBOND_ABI, signer); const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const network = await provider.getNetwork();
      if (network.chainId !== 137n) throw new Error("Switch to Polygon Mainnet before staking.");
      if (!amount.trim() || !/^\d+(\.\d{1,18})?$/.test(amount.trim()) || Number(amount) <= 0) throw new Error("Enter a valid OKBOND amount.");
      const amountWei = parseEther(amount);
      const balanceWei = await token.balanceOf(address);
      if (amountWei > balanceWei) throw new Error("Insufficient OKBOND balance.");
      if (await token.allowance(address, STAKING_ADDRESS) < amountWei) { const approval = await token.approve(STAKING_ADDRESS, amountWei); await approval.wait(1); }
      setTxStatus("staking"); const tx = await staking.stake(amountWei, lockDays * 86400); setTxHash(tx.hash); await tx.wait(1); setTxStatus("success"); await fetchStats();
    } catch (err: any) { setTxStatus("error"); setTxError(err?.shortMessage || err?.message || "Staking failed"); }
  }, [provider, address, fetchStats]);

  const runPositionTx = useCallback(async (kind: "unstake" | "claim", stakeId: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus(kind === "unstake" ? "unstaking" : "claiming"); setTxError(null); setTxHash(null);
    try { const signer = await provider.getSigner(); const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer); const tx = await staking[kind === "unstake" ? "unstake" : "claimRewards"](stakeId); setTxHash(tx.hash); await tx.wait(1); setTxStatus("success"); await fetchStats(); }
    catch (err: any) { setTxStatus("error"); setTxError(err?.shortMessage || err?.message || `${kind} failed`); }
  }, [provider, address, fetchStats]);

  return { stats, loading, readError, txStatus, txHash, txError, lockPeriods: LOCK_PERIODS, approveAndStake, unstake: (id: number) => runPositionTx("unstake", id), claimRewards: (id: number) => runPositionTx("claim", id), resetTx: () => { setTxStatus("idle"); setTxError(null); setTxHash(null); }, refresh: fetchStats };
}
