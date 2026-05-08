import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import STAKING_ABI from "@/abi/StakingContract.json";
import OKBOND_ABI from "@/abi/OKBONDToken.json";

const STAKING_ADDRESS = "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e";
const OKBOND_ADDRESS  = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const POLYGON_RPC     = "https://polygon-bor-rpc.publicnode.com";

export interface StakeInfo {
  id: number;
  amount: string;
  startTime: number;
  lockPeriod: number;
  apy: number;
  active: boolean;
  pendingReward: string;
}

export interface StakingStats {
  totalStaked: string;
  totalStakers: string;
  rewardsDistributed: string;
  userStaked: string;
  userRewards: string;
  userStakes: StakeInfo[];
  allowance: string;
}

export type StakeTxStatus = "idle" | "approving" | "staking" | "unstaking" | "claiming" | "success" | "error";

const LOCK_PERIODS: Record<number, number> = {
  30:  12,
  90:  15,
  180: 18,
  365: 24,
};

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export function useStaking(provider: BrowserProvider | null, address: string | null) {
  const [stats, setStats]     = useState<StakingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<StakeTxStatus>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const getReadProvider = useCallback((): JsonRpcProvider =>
    new JsonRpcProvider(POLYGON_RPC, { chainId: 137, name: "polygon" }), []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const rpc      = getReadProvider();
      const staking  = new Contract(STAKING_ADDRESS, STAKING_ABI, rpc);
      const okbond   = new Contract(OKBOND_ADDRESS,  OKBOND_ABI,  rpc);

      const [totalStaked, totalStakers, rewardsDistributed] = await Promise.all([
        safeCall(() => staking.totalStaked(),              BigInt(0)),
        safeCall(() => staking.totalStakers(),             BigInt(0)),
        safeCall(() => staking.totalRewardsDistributed(),  BigInt(0)),
      ]);

      let userStaked  = "0";
      let userRewards = "0";
      let userStakes: StakeInfo[] = [];
      let allowance   = "0";

      if (address) {
        const [uStaked, uRewards, stakeCount, allow] = await Promise.all([
          safeCall(() => staking.totalUserStaked(address),  BigInt(0)),
          safeCall(() => staking.totalUserRewards(address), BigInt(0)),
          safeCall(() => staking.getStakeCount(address),    BigInt(0)),
          safeCall(() => okbond.allowance(address, STAKING_ADDRESS), BigInt(0)),
        ]);

        userStaked  = formatEther(uStaked);
        userRewards = formatEther(uRewards);
        allowance   = formatEther(allow);

        const count = Math.min(Number(stakeCount), 20);
        const stakePromises = Array.from({ length: count }, (_, i) =>
          Promise.all([
            safeCall(() => staking.getStakeInfo(address, i), [BigInt(0), BigInt(0), BigInt(0), BigInt(0), false]),
            safeCall(() => staking.pendingRewards(address, i), BigInt(0)),
          ])
        );
        const rawStakes = await Promise.all(stakePromises);
        userStakes = rawStakes
          .map(([info, pending], i) => ({
            id:            i,
            amount:        formatEther(info[0] || BigInt(0)),
            startTime:     Number(info[1] || BigInt(0)),
            lockPeriod:    Number(info[2] || BigInt(0)) / 86400,
            apy:           Number(info[3] || BigInt(0)),
            active:        Boolean(info[4]),
            pendingReward: formatEther(pending),
          }))
          .filter(s => s.active);
      }

      setStats({
        totalStaked:        formatEther(totalStaked),
        totalStakers:       totalStakers.toString(),
        rewardsDistributed: formatEther(rewardsDistributed),
        userStaked,
        userRewards,
        userStakes,
        allowance,
      });
    } catch (e) {
      console.error("useStaking fetchStats:", e);
    } finally {
      setLoading(false);
    }
  }, [address, getReadProvider]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const approveAndStake = useCallback(async (amount: string, lockDays: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus("approving");
    setTxError(null);
    setTxHash(null);
    try {
      const signer      = await provider.getSigner();
      const okbond      = new Contract(OKBOND_ADDRESS, OKBOND_ABI, signer);
      const staking     = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const amountWei   = parseEther(amount);
      const lockSeconds = lockDays * 86400;

      const currentAllowance = await safeCall(() => okbond.allowance(address, STAKING_ADDRESS), BigInt(0));
      if (currentAllowance < amountWei) {
        const approveTx = await okbond.approve(STAKING_ADDRESS, amountWei);
        await approveTx.wait(1);
      }

      setTxStatus("staking");
      const stakeTx = await staking.stake(amountWei, lockSeconds);
      setTxHash(stakeTx.hash);
      await stakeTx.wait(1);
      setTxStatus("success");
      await fetchStats();
    } catch (err: any) {
      setTxStatus("error");
      setTxError(err.message || "Staking failed");
    }
  }, [provider, address, fetchStats]);

  const unstake = useCallback(async (stakeId: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus("unstaking");
    setTxError(null);
    try {
      const signer  = await provider.getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx      = await staking.unstake(stakeId);
      setTxHash(tx.hash);
      await tx.wait(1);
      setTxStatus("success");
      await fetchStats();
    } catch (err: any) {
      setTxStatus("error");
      setTxError(err.message || "Unstake failed");
    }
  }, [provider, address, fetchStats]);

  const claimRewards = useCallback(async (stakeId: number) => {
    if (!provider || !address) { setTxError("Wallet not connected"); return; }
    setTxStatus("claiming");
    setTxError(null);
    try {
      const signer  = await provider.getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx      = await staking.claimRewards(stakeId);
      setTxHash(tx.hash);
      await tx.wait(1);
      setTxStatus("success");
      await fetchStats();
    } catch (err: any) {
      setTxStatus("error");
      setTxError(err.message || "Claim failed");
    }
  }, [provider, address, fetchStats]);

  return {
    stats,
    loading,
    txStatus,
    txHash,
    txError,
    lockPeriods: LOCK_PERIODS,
    approveAndStake,
    unstake,
    claimRewards,
    resetTx: () => { setTxStatus("idle"); setTxError(null); setTxHash(null); },
    refresh: fetchStats,
  };
}
