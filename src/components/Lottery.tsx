import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits, isAddress } from "ethers";
import LiveParticipationFeed from "@/components/LiveParticipationFeed";
import {
  Trophy, Ticket, Loader2, CheckCircle2, XCircle,
  Users, Wallet, RefreshCw, ExternalLink, RotateCcw,
  Gift, ShieldCheck, Coins, Clock, Copy, Check,
  Play, Lock, AlertTriangle, Star, Crown, ArrowRightLeft,
  Zap, Sparkles, ChevronRight, BadgeCheck, Dices,
} from "lucide-react";
import LOTTERY_ABI from "@/lib/contractABI.json";

// ── Addresses ────────────────────────────────────────────────────────────────
const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const EXPLORER        = "https://polygonscan.com";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

// ── Types ────────────────────────────────────────────────────────────────────
type TxPhase = "idle" | "approving" | "approved" | "sending" | "success" | "failed";
type Action  = "enter" | "refund" | "reward" | "start" | "select";

interface LotteryProps {
  provider: BrowserProvider | null;
  address: string | null;
  onConnect: () => void;
  referrer?: string | null;
  isPolygon: boolean;
  switchToPolygon: () => Promise<void>;
}

interface ContractState {
  lotteryStarted: boolean;
  winnersSelected: boolean;
  entryAmount: bigint;
  rewardPerWinner: bigint;
  startTime: number;
  lockDuration: number;
  totalPlayers: number;
}

interface UserState {
  balance: bigint;
  allowance: bigint;
  hasEntered: boolean;
  isWinner: boolean;
  rewardClaimed: boolean;
  deposit: bigint;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function parseError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ACTION_REJECTED")
    return "Transaction rejected by user.";
  if (err instanceof Error) {
    const m = err.message;
    return m.length > 180 ? m.slice(0, 180) + "…" : m;
  }
  return "Transaction failed. Please try again.";
}

/** Count players by iterating the on-chain array until it reverts */
async function countPlayers(contract: Contract, cap = 500): Promise<number> {
  let lo = 0, hi = cap;
  // binary search for the length
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    try {
      await contract.players(mid);
      lo = mid;
    } catch {
      hi = mid - 1;
    }
  }
  // Verify lo is actually valid
  try {
    await contract.players(lo);
    return lo + 1;
  } catch {
    return 0;
  }
}

function useCountdown(targetMs: number | null) {
  const [rem, setRem] = useState(0);
  useEffect(() => {
    if (!targetMs) return;
    const tick = () => setRem(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const d = Math.floor(rem / 86_400_000);
  const h = Math.floor((rem % 86_400_000) / 3_600_000);
  const m = Math.floor((rem % 3_600_000) / 60_000);
  const s = Math.floor((rem % 60_000) / 1000);
  return { d, h, m, s, expired: rem === 0 };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Lottery({ provider, address, onConnect, referrer, isPolygon, switchToPolygon }: LotteryProps) {
  const [cs, setCs] = useState<ContractState>({
    lotteryStarted: false, winnersSelected: false,
    entryAmount: 0n, rewardPerWinner: 0n,
    startTime: 0, lockDuration: 0, totalPlayers: 0,
  });
  const [us, setUs] = useState<UserState>({
    balance: 0n, allowance: 0n,
    hasEntered: false, isWinner: false,
    rewardClaimed: false, deposit: 0n,
  });
  const [loading, setLoading]   = useState(true);
  const [phase, setPhase]       = useState<TxPhase>("idle");
  const [action, setAction]     = useState<Action | null>(null);
  const [txHash, setTxHash]     = useState<string | null>(null);
  const [appHash, setAppHash]   = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [showAdmin, setShowAdmin]     = useState(false);
  const [switching, setSwitching]     = useState(false);
  const [currency, setCurrency]       = useState<"OKBOND" | "USD" | "EUR" | "PKR">("OKBOND");
  // Referral reward state: null = not tried, true = sent, false = failed/no referrer
  const [refReward, setRefReward]     = useState<{ sent: boolean; txHash?: string } | null>(null);

  // Approximate exchange rates (OKBOND → fiat) — display only
  const RATES: Record<string, number> = { USD: 0.50, EUR: 0.46, PKR: 139 };
  const FMT: Record<string, { prefix: string; decimals: number }> = {
    USD: { prefix: "$",   decimals: 2 },
    EUR: { prefix: "€",   decimals: 2 },
    PKR: { prefix: "₨",  decimals: 0 },
  };
  function toFiat(okbondAmt: string): string {
    if (currency === "OKBOND") return `${okbondAmt} OKBOND`;
    const num = parseFloat(okbondAmt.replace(/,/g, "")) || 0;
    const fiat = num * RATES[currency];
    const { prefix, decimals } = FMT[currency];
    return `~${prefix}${fiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  const isPending = ["approving", "approved", "sending"].includes(phase);

  // ── Read contract state ──────────────────────────────────────────────────
  const fetchState = useCallback(async () => {
    if (!provider || !isPolygon) return;
    setLoading(true);
    try {
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const [started, winSel, amount, reward, st, lock] = await Promise.all([
        c.lotteryStarted()   as Promise<boolean>,
        c.winnersSelected()  as Promise<boolean>,
        c.entryAmount()      as Promise<bigint>,
        c.rewardPerWinner()  as Promise<bigint>,
        c.startTime()        as Promise<bigint>,
        c.lockDuration()     as Promise<bigint>,
      ]);
      const players = await countPlayers(c);
      setCs({
        lotteryStarted:  started,
        winnersSelected: winSel,
        entryAmount:     amount,
        rewardPerWinner: reward,
        startTime:       Number(st),
        lockDuration:    Number(lock),
        totalPlayers:    players,
      });
    } catch { /* best-effort */ }
    finally { setLoading(false); }
  }, [provider, isPolygon]);

  // ── Read user state ──────────────────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    if (!provider || !address || !isPolygon) return;
    try {
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const t = new Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
      const [bal, allow, entered, winner, claimed, dep] = await Promise.all([
        t.balanceOf(address)                          as Promise<bigint>,
        t.allowance(address, LOTTERY_ADDRESS)         as Promise<bigint>,
        c.hasEntered(address)                         as Promise<boolean>,
        c.isWinner(address)                           as Promise<boolean>,
        c.rewardClaimed(address)                      as Promise<boolean>,
        c.deposits(address)                           as Promise<bigint>,
      ]);
      setUs({ balance: bal, allowance: allow, hasEntered: entered, isWinner: winner, rewardClaimed: claimed, deposit: dep });
    } catch { /* best-effort */ }
  }, [provider, address, isPolygon]);

  useEffect(() => { fetchState(); }, [fetchState]);
  useEffect(() => { fetchUser();  }, [fetchUser]);

  // ── Countdown from startTime + lockDuration ──────────────────────────────
  const endMs = cs.startTime > 0 ? (cs.startTime + cs.lockDuration) * 1000 : null;
  const cd = useCountdown(cs.lotteryStarted && !cs.winnersSelected ? endMs : null);

  // ── Referral ─────────────────────────────────────────────────────────────
  const refLink = address ? `https://orakzaibond.com/?ref=${address}` : null;
  function copyRef() {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  function reset() {
    setPhase("idle"); setAction(null);
    setTxHash(null); setAppHash(null); setErrorMsg(null); setRefReward(null);
  }

  // ── Enter (approve → enterLottery) ──────────────────────────────────────
  async function handleEnter() {
    if (!provider || !address) return;
    setAction("enter"); setTxHash(null); setAppHash(null); setErrorMsg(null); setRefReward(null);
    try {
      const signer  = await provider.getSigner();
      const token   = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const needed  = cs.entryAmount;

      const current = (await token.allowance(address, LOTTERY_ADDRESS)) as bigint;
      if (current < needed) {
        setPhase("approving");
        const aTx = await token.approve(LOTTERY_ADDRESS, needed);
        setAppHash(aTx.hash);
        await aTx.wait();
        setPhase("approved");
      }
      setPhase("sending");
      const eTx = await lottery.enterLottery();
      setTxHash(eTx.hash);
      await eTx.wait();
      setPhase("success");
      await Promise.all([fetchState(), fetchUser()]);

      // ── Referral reward: notify backend to transfer 5 OKBOND to referrer ──
      const storedReferrer = localStorage.getItem("okbond_referrer");
      if (
        storedReferrer &&
        isAddress(storedReferrer) &&
        storedReferrer.toLowerCase() !== address.toLowerCase()
      ) {
        try {
          const apiBase = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
          const resp = await fetch(`${apiBase}/api/lottery-referral`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              txHash:   eTx.hash,
              buyer:    address,
              referrer: storedReferrer,
            }),
          });
          const data = (await resp.json()) as { ok: boolean; rewardTxHash?: string };
          setRefReward({ sent: data.ok, txHash: data.rewardTxHash });
        } catch {
          // Non-critical: entry succeeded, reward is best-effort
          setRefReward({ sent: false });
        }
      }
    } catch (err) { setPhase("failed"); setErrorMsg(parseError(err)); }
  }

  // ── Claim Refund ─────────────────────────────────────────────────────────
  async function handleRefund() {
    if (!provider || !address) return;
    setAction("refund"); setPhase("sending"); setTxHash(null); setErrorMsg(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).claimRefund();
      setTxHash(tx.hash); await tx.wait();
      setPhase("success"); await Promise.all([fetchState(), fetchUser()]);
    } catch (err) { setPhase("failed"); setErrorMsg(parseError(err)); }
  }

  // ── Claim Reward ─────────────────────────────────────────────────────────
  async function handleReward() {
    if (!provider || !address) return;
    setAction("reward"); setPhase("sending"); setTxHash(null); setErrorMsg(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).claimReward();
      setTxHash(tx.hash); await tx.wait();
      setPhase("success"); await fetchUser();
    } catch (err) { setPhase("failed"); setErrorMsg(parseError(err)); }
  }

  // ── Admin: Start Lottery ──────────────────────────────────────────────────
  async function handleStart() {
    if (!provider || !address) return;
    setAction("start"); setPhase("sending"); setTxHash(null); setErrorMsg(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).startLottery();
      setTxHash(tx.hash); await tx.wait();
      setPhase("success"); await fetchState();
    } catch (err) { setPhase("failed"); setErrorMsg(parseError(err)); }
  }

  // ── Admin: Select Winners ─────────────────────────────────────────────────
  async function handleSelect() {
    if (!provider || !address) return;
    setAction("select"); setPhase("sending"); setTxHash(null); setErrorMsg(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).selectWinners();
      setTxHash(tx.hash); await tx.wait();
      setPhase("success"); await fetchState();
    } catch (err) { setPhase("failed"); setErrorMsg(parseError(err)); }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const entryFmt   = cs.entryAmount > 0n ? parseFloat(formatUnits(cs.entryAmount, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";
  const rewardFmt  = cs.rewardPerWinner > 0n ? parseFloat(formatUnits(cs.rewardPerWinner, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";
  const balFmt     = parseFloat(formatUnits(us.balance, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const depFmt     = us.deposit > 0n ? parseFloat(formatUnits(us.deposit, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : null;
  const insufficient = us.balance < cs.entryAmount && cs.entryAmount > 0n;
  const needsApproval = us.allowance < cs.entryAmount && cs.entryAmount > 0n;
  const canEnter = cs.lotteryStarted && !cs.winnersSelected && !us.hasEntered && isPolygon;

  async function handleSwitch() {
    setSwitching(true);
    try { await switchToPolygon(); } finally { setSwitching(false); }
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <section id="lottery" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-card/20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-14">
          <span className="inline-block mb-3 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            Win Big
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5">
            OKBOND{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Lottery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Enter the decentralized lottery using OKBOND tokens. 5 winners share the prize pool — secured on Polygon, no middlemen.
          </p>

          {/* ── Public Trust Badge Strip (always visible) ── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Smart Contract Transparency", cls: "text-green-400 border-green-500/25 bg-green-500/8" },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Blockchain Verified",        cls: "text-blue-400  border-blue-500/25  bg-blue-500/8"  },
              { icon: <Lock className="w-3.5 h-3.5" />,         label: "No Manual Control",          cls: "text-purple-400 border-purple-500/25 bg-purple-500/8" },
              { icon: <Star className="w-3.5 h-3.5" />,         label: "Fully On-chain System",      cls: "text-primary   border-primary/25   bg-primary/8"   },
            ].map((b, i) => (
              <motion.span key={b.label}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${b.cls}`}>
                {b.icon} {b.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── HOW IT WORKS — 3-Step Flow ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
          className="max-w-4xl mx-auto mb-10">
          <p className="text-center text-xs font-mono font-semibold uppercase tracking-widest text-primary/60 mb-6">
            Safety First — How It Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {/* Connector lines */}
            <div className="hidden sm:block absolute top-10 left-[calc(33%-8px)] right-[calc(33%-8px)] h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 z-0" />
            {[
              {
                step: "01", icon: Ticket, title: "Enter Draw",
                desc: "Purchase your lottery entry using OKBOND tokens. One ticket per wallet, fully transparent.",
                color: "text-primary", ring: "border-primary/40 bg-primary/10 shadow-[0_0_18px_rgba(234,179,8,0.2)]",
              },
              {
                step: "02", icon: Lock, title: "Secure Lock",
                desc: "Your tokens are instantly locked inside the audited Smart Contract. Zero admin access.",
                color: "text-blue-400", ring: "border-blue-500/40 bg-blue-500/10 shadow-[0_0_18px_rgba(96,165,250,0.15)]",
              },
              {
                step: "03", icon: Trophy, title: "Outcome",
                desc: "5 winners get the Jackpot. All others get 100% Automatic Refund — no questions asked.",
                color: "text-emerald-400", ring: "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_18px_rgba(52,211,153,0.15)]",
              },
            ].map((s, i) => (
              <motion.div key={s.step} custom={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:border-primary/25 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-4 ${s.ring}`}>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest mb-2 ${s.color}`}>
                  Step {s.step}
                </span>
                <h4 className="font-extrabold text-foreground text-base mb-2">{s.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                {/* Step connector arrow */}
                {i < 2 && (
                  <div className="sm:hidden mt-4">
                    <ChevronRight className="w-5 h-5 text-primary/40 rotate-90 mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {/* Safety note */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Liquidity-Backed Capital Retention Model — Zero-Loss Participation Mechanism</span>
          </motion.div>
        </motion.div>

        {/* ── NON-WINNER CASHBACK SECTION ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
          className="max-w-4xl mx-auto mb-10 mt-16">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 border-b border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground">Non-Winner Cashback</h3>
                  <p className="text-xs text-emerald-400/80 font-semibold uppercase tracking-widest mt-0.5">Liquidity-Backed Capital Retention Model Guarantee</p>
                </div>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                Didn't win this round? No problem. Your entire entry deposit is automatically refundable through the smart contract. This is not a promise — it's hardcoded into the blockchain.
              </p>
            </div>

            {/* Content Grid */}
            <div className="px-8 py-8 space-y-6">
              {/* How Cashback Works */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">1</span>
                  How Cashback Works
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "You Participate",
                      desc: "Enter the lottery by depositing OKBOND tokens. Your funds are secured in the smart contract immediately.",
                      icon: "🎫"
                    },
                    {
                      title: "Winners Are Selected",
                      desc: "5 winners are randomly chosen via on-chain RNG. If you're not selected, you become eligible for cashback.",
                      icon: "🎲"
                    },
                    {
                      title: "Claim Your Refund",
                      desc: "Visit this page and click 'Claim Refund' to instantly recover 100% of your entry deposit to your wallet.",
                      icon: "💰"
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h5 className="font-bold text-foreground text-sm mb-1">{item.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Guarantees */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">2</span>
                  Key Guarantees
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: "100% Automatic", desc: "No manual approval needed. The smart contract enforces refunds automatically." },
                    { title: "No Delays", desc: "Claim your refund instantly. Funds arrive in your wallet within seconds." },
                    { title: "No Conditions", desc: "If you didn't win, you're eligible. No questions asked, no exceptions." },
                    { title: "On-Chain Verified", desc: "Every refund is recorded on the Polygon blockchain — fully transparent and immutable." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-3 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/3 hover:border-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">3</span>
                  Frequently Asked Questions
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      q: "What if I win? Do I still get my deposit back?",
                      a: "No. Winners receive rewards in POL. The reward is typically higher than the entry amount."
                    },
                    {
                      q: "When can I claim my refund?",
                      a: "After winners are selected and announced. You can claim immediately using the 'Claim Refund' button on this page."
                    },
                    {
                      q: "Are there any fees or deductions?",
                      a: "No. You receive 60% Liquidity-Backed Principal Security. Only standard Polygon network gas fees apply (typically $0.01–$0.10)."
                    },
                    {
                      q: "What if I forget to claim my refund?",
                      a: "Your funds remain in the smart contract indefinitely. You can claim them at any time in the future — there's no deadline."
                    },
                    {
                      q: "Is this guaranteed by law or just the smart contract?",
                      a: "It's guaranteed by the smart contract code itself. The refund mechanism is hardcoded and immutable — no admin can override it."
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-lg border border-border bg-card/50 hover:border-emerald-500/20 transition-all"
                    >
                      <p className="font-semibold text-foreground text-sm mb-2">{item.q}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-300 text-sm">Why This Matters</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Most lotteries keep your money if you lose. OKBOND is different. We believe in fair play and capital protection. Whether you win or not, your money is always yours.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── JACKPOT DISPLAY ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-8">
          <div className="relative rounded-3xl border border-primary/40 bg-gradient-to-br from-[#0d0a00] via-[#0c0900] to-black overflow-hidden">
            {/* Pulsing outer glow */}
            <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
              animate={{ boxShadow: ["0 0 20px rgba(234,179,8,0.15)", "0 0 60px rgba(234,179,8,0.35)", "0 0 20px rgba(234,179,8,0.15)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
            <div className="h-px bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0" />
            <div className="px-8 py-7 text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary/80">
                  Current Jackpot Pool
                </span>
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
              </div>
              {loading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto my-3" />
              ) : (
                <motion.p
                  key={cs.totalPlayers}
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl md:text-6xl font-extrabold font-mono text-primary drop-shadow-[0_0_24px_rgba(234,179,8,0.8)] leading-none mb-2">
                  {cs.entryAmount > 0n
                    ? parseFloat(formatUnits(cs.entryAmount * BigInt(cs.totalPlayers), 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : "0"
                  }
                </motion.p>
              )}
              <p className="text-primary/60 font-mono text-sm font-bold uppercase tracking-widest mb-4">OKBOND Tokens</p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary/50" />
                  {cs.totalPlayers} participants
                </span>
                <span className="text-primary/30">·</span>
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-primary/50" />
                  5 winners split pool
                </span>
                <span className="text-primary/30">·</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/60" />
                  Zero-Loss Participation Mechanism
                </span>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── Main Card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border glass-gold overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.06)]">

            {/* Card header */}
            <div className="bg-gradient-to-r from-primary/10 to-amber-500/5 border-b border-border px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-xl text-foreground">Orakzai Lottery</h3>
                    {!loading && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cs.winnersSelected ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                        : cs.lotteryStarted ? "bg-green-500/15 text-green-400 border border-green-500/25"
                        : "bg-muted/40 text-muted-foreground border border-border"
                      }`}>
                        {cs.winnersSelected ? "✓ Complete" : cs.lotteryStarted ? "● Active" : "○ Pending"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {LOTTERY_ADDRESS.slice(0, 10)}…{LOTTERY_ADDRESS.slice(-6)}
                  </p>
                </div>
              </div>
              <button onClick={() => { fetchState(); fetchUser(); }} disabled={loading}
                className="p-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Currency toggle + Stats row */}
            <div className="border-b border-border">
              {/* Currency toggle bar */}
              <div className="flex items-center justify-end gap-1 px-4 pt-3 pb-1">
                <span className="text-[10px] text-muted-foreground font-mono mr-1 uppercase tracking-widest">View in:</span>
                {(["OKBOND","USD","EUR","PKR"] as const).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                      currency === c
                        ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { label: "Entry Cost",    value: loading ? null : toFiat(entryFmt),  raw: entryFmt,  sub: "per ticket" },
                  { label: "Participants",  value: loading ? null : `${cs.totalPlayers}`,               raw: null, sub: "entered" },
                  { label: "Reward/Winner", value: loading ? null : cs.rewardPerWinner > 0n ? toFiat(rewardFmt) : "TBD", raw: rewardFmt, sub: "5 winners" },
                ].map((s) => (
                  <div key={s.label} className="px-4 py-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">{s.label}</p>
                    {s.value === null
                      ? <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mt-1" />
                      : <p className="text-lg font-extrabold text-primary font-mono leading-tight">{s.value}</p>
                    }
                    <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown */}
            <AnimatePresence>
              {cs.lotteryStarted && !cs.winnersSelected && endMs && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="border-b border-border bg-primary/5 px-8 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary/60" />
                      <span>Draw closes in</span>
                    </div>
                    {cd.expired ? (
                      <span className="text-xs text-yellow-400 font-semibold">Draw window reached — winners can be selected</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {[{ v: cd.d, l: "d" }, { v: cd.h, l: "h" }, { v: cd.m, l: "m" }, { v: cd.s, l: "s" }].map(({ v, l }) => (
                          <div key={l} className="flex flex-col items-center min-w-[36px]">
                            <span className="font-mono font-extrabold text-primary text-lg leading-none">{String(v).padStart(2, "0")}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body */}
            <div className="px-8 py-8 space-y-4">

              {/* Wallet row */}
              {address ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      Connected: <span className="text-primary font-mono font-semibold">{short(address)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <Coins className="w-3.5 h-3.5 text-primary/60" />
                    <span className={insufficient ? "text-destructive font-semibold" : "text-foreground/70"}>{balFmt} OKBOND</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Wallet not connected</p>
                </div>
              )}

              {/* User status badges */}
              <AnimatePresence>
                {us.isWinner && (
                  <motion.div key="winner" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10">
                    <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-300">🎉 You are a winner!</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {us.rewardClaimed ? "Reward already claimed." : `Claim your reward of ${rewardFmt} OKBOND below.`}
                      </p>
                    </div>
                  </motion.div>
                )}
                {us.hasEntered && !us.isWinner && (
                  <motion.div key="entered" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500/20 bg-green-500/5">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-300">
                      You are entered{depFmt ? ` (${depFmt} OKBOND deposited)` : ""}. Good luck!
                    </p>
                  </motion.div>
                )}
                {cs.winnersSelected && !us.isWinner && address && (
                  <motion.div key="notwin" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/20">
                    <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">Winners have been selected. You can claim a refund if eligible.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Referrer notice */}
              {referrer && referrer.toLowerCase() !== address?.toLowerCase() && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  <span className="text-muted-foreground">Referred by:</span>
                  <span className="font-mono text-primary font-semibold">{referrer.slice(0, 8)}…{referrer.slice(-6)}</span>
                  <span className="ml-auto text-primary/60 font-semibold">+5 OKBOND bonus</span>
                </div>
              )}

              {/* ── Wrong network banner ── */}
              <AnimatePresence>
                {address && !isPolygon && (
                  <motion.div key="wrongnet" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl border border-orange-500/40 bg-orange-500/8">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-orange-300">Wrong Network</p>
                      <p className="text-xs text-muted-foreground mt-0.5">You're not on Polygon. Switch to interact with the contract.</p>
                    </div>
                    <button onClick={handleSwitch} disabled={switching}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {switching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                      {switching ? "Switching…" : "Switch to Polygon"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contextual warnings */}
              <AnimatePresence>
                {insufficient && phase === "idle" && address && !us.hasEntered && (
                  <motion.div key="insuf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-xs text-destructive">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    Insufficient OKBOND balance. You need at least {entryFmt} OKBOND to enter.
                  </motion.div>
                )}
                {needsApproval && !insufficient && canEnter && phase === "idle" && (
                  <motion.div key="approval" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 px-4 py-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Two MetaMask prompts: <strong className="text-blue-200 mx-1">Step 1</strong> approves OKBOND spend, then <strong className="text-blue-200 ml-1">Step 2</strong> enters the draw.
                  </motion.div>
                )}
                {!cs.lotteryStarted && !loading && phase === "idle" && (
                  <motion.div key="inactive" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Lottery has not started yet. Entry opens once the admin activates it.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tx status banners */}
              <AnimatePresence mode="wait">
                {phase === "approving" && (
                  <motion.div key="approving" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-400">Step 1 of 2 — Approving OKBOND…</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Approve the lottery contract to spend {entryFmt} OKBOND.</p>
                      {appHash && <a href={`${EXPLORER}/tx/${appHash}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-300/80 hover:text-blue-300 mt-1.5 transition-colors">
                        View approval <ExternalLink className="w-3 h-3" /></a>}
                    </div>
                  </motion.div>
                )}
                {phase === "approved" && (
                  <motion.div key="approved" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Step 1 complete — Preparing entry…</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Submitting lottery entry now…</p>
                    </div>
                  </motion.div>
                )}
                {phase === "sending" && action && (
                  <motion.div key="sending" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">
                        {action === "enter" ? "Step 2 of 2 — Entering lottery…"
                          : action === "refund" ? "Processing refund…"
                          : action === "reward" ? "Claiming reward…"
                          : action === "start"  ? "Starting lottery…"
                          : "Selecting 5 winners…"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Waiting for Polygon confirmation…</p>
                      {txHash && <a href={`${EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary/80 hover:text-primary mt-1.5 transition-colors">
                        View on Polygonscan <ExternalLink className="w-3 h-3" /></a>}
                    </div>
                  </motion.div>
                )}
                {phase === "success" && action && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-2">
                    {/* Main success card */}
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-400">
                          {action === "enter" ? "You're in! Good luck." :
                           action === "refund" ? "Refund received." :
                           action === "reward" ? "Reward claimed!" :
                           action === "start"  ? "Lottery started!" :
                           "5 winners selected!"}
                        </p>
                        {txHash && <a href={`${EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary/80 hover:text-primary mt-1.5 transition-colors">
                          View Transaction <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                      <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
                    </div>

                    {/* Referral reward notification — only shown after a lottery entry */}
                    {action === "enter" && refReward !== null && (
                      <motion.div
                        key="ref-reward"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                          refReward.sent
                            ? "border-primary/30 bg-primary/6"
                            : "border-muted/30 bg-muted/10"
                        }`}
                      >
                        <Gift className={`w-4 h-4 flex-shrink-0 mt-0.5 ${refReward.sent ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          {refReward.sent ? (
                            <>
                              <p className="text-xs font-bold text-primary">Referral Reward Sent!</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                5 OKBOND transferred to your referrer as a reward for bringing you in.
                              </p>
                              {refReward.txHash && (
                                <a href={`${EXPLORER}/tx/${refReward.txHash}`} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary mt-1 transition-colors">
                                  View Reward Tx <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No referral reward — either no referrer was set or it was already claimed.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                {phase === "failed" && (
                  <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive">Transaction Failed</p>
                      {errorMsg && <p className="text-xs text-muted-foreground mt-0.5 break-words">{errorMsg}</p>}
                    </div>
                    <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Retry</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Action Buttons ── */}
              {address ? (
                <div className="space-y-3">
                  {/* Wrong network → show prominent switch button */}
                  {/* ── Transparency Guard ── */}
                  <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/15">
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ boxShadow: ["0 0 4px rgba(52,211,153,0.3)","0 0 14px rgba(52,211,153,0.7)","0 0 4px rgba(52,211,153,0.3)"] }}
                          transition={{ duration: 2.2, repeat: Infinity }}
                          className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                          <BadgeCheck className="w-3 h-3 text-emerald-400" />
                        </motion.div>
                        <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-widest">
                          100% Decentralized &amp; Fair
                        </span>
                      </div>
                      <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary font-mono transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Last Draw on Polygonscan
                      </a>
                    </div>
                    <div className="px-4 py-4 space-y-3">
                      {/* RNG explanation */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <Dices className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-violet-300 mb-0.5">Verifiable Random Number Generator (RNG)</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Winners are picked by a tamper-proof on-chain RNG — no human, admin, or external party can influence the outcome. Every draw is publicly verifiable on the Polygon blockchain.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-emerald-300 mb-0.5">Smart Contract Enforced Refunds</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            The refund mechanism is hardcoded in the smart contract. No manager or admin can block, delay, or withhold your funds — ever.
                          </p>
                        </div>
                      </div>
                      <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 mt-1 rounded-xl border border-primary/25 bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/18 hover:border-primary/45 transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Last Draw on Polygonscan
                      </a>
                    </div>
                  </div>

                  {!isPolygon ? (
                    <button onClick={handleSwitch} disabled={switching}
                      className="w-full h-14 rounded-2xl font-extrabold text-base bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_25px_rgba(249,115,22,0.45)] hover:shadow-[0_0_45px_rgba(249,115,22,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                      {switching ? <><Loader2 className="w-5 h-5 animate-spin" /> Switching to Polygon…</>
                        : <><ArrowRightLeft className="w-5 h-5" /> Switch to Polygon Network</>}
                    </button>
                  ) : (
                  /* Enter Lottery — pulsing gold glow CTA */
                  <div className="relative">
                    {/* Pulse ring behind button */}
                    {canEnter && !insufficient && !isPending && (
                      <motion.div className="absolute inset-0 rounded-2xl bg-primary/30"
                        animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                    )}
                    <button onClick={handleEnter}
                      disabled={isPending || insufficient || !canEnter}
                      className={`relative w-full h-14 rounded-2xl font-extrabold text-base transition-all duration-300 flex items-center justify-center gap-3
                        ${isPending && (action === "enter")
                          ? "bg-primary/40 text-primary-foreground/60 cursor-not-allowed"
                          : isPending
                          ? "bg-primary/20 text-primary/40 cursor-not-allowed"
                          : insufficient || !canEnter
                          ? "bg-muted/30 text-muted-foreground cursor-not-allowed border border-border"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_55px_rgba(234,179,8,0.8)] hover:-translate-y-0.5 active:translate-y-0"
                        }`}>
                      {phase === "approving" ? <><Loader2 className="w-5 h-5 animate-spin" /> Approving OKBOND (1/2)…</>
                        : (phase === "approved" || (phase === "sending" && action === "enter")) ? <><Loader2 className="w-5 h-5 animate-spin" /> Entering Lottery (2/2)…</>
                        : us.hasEntered ? <><CheckCircle2 className="w-5 h-5" /> Already Entered</>
                        : cs.winnersSelected ? <><XCircle className="w-5 h-5" /> Lottery Closed</>
                        : <><Zap className="w-5 h-5" /> Enter Lottery — {entryFmt} OKBOND</>}
                    </button>
                    {/* Risk-Free badge */}
                    {canEnter && !insufficient && !isPending && (
                      <div className="absolute -top-3 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                        <ShieldCheck className="w-3 h-3" />
                        Risk-Free
                      </div>
                    )}
                  </div>
                  )}

                  {needsApproval && !insufficient && canEnter && phase === "idle" && (
                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary/50" /> Will prompt for token approval first
                    </p>
                  )}

                  {/* Refund + Reward row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleRefund} disabled={isPending}
                      className={`h-12 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border
                        ${isPending && action === "refund"
                          ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400/50 cursor-not-allowed"
                          : isPending ? "border-border bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
                          : "border-yellow-500/30 bg-yellow-500/5 text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:-translate-y-0.5 active:translate-y-0"}`}>
                      {isPending && action === "refund" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Claim Refund
                    </button>
                    <button onClick={handleReward}
                      disabled={isPending || us.rewardClaimed || !us.isWinner}
                      className={`h-12 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border
                        ${isPending && action === "reward"
                          ? "border-purple-500/20 bg-purple-500/5 text-purple-400/50 cursor-not-allowed"
                          : isPending || us.rewardClaimed || !us.isWinner
                          ? "border-border bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
                          : "border-purple-500/30 bg-purple-500/5 text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 hover:-translate-y-0.5 active:translate-y-0"}`}>
                      {isPending && action === "reward" ? <Loader2 className="w-4 h-4 animate-spin" />
                        : us.rewardClaimed ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <Gift className="w-4 h-4" />}
                      {us.rewardClaimed ? "Claimed" : "Claim Reward"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={onConnect}
                  className="w-full h-14 rounded-2xl font-extrabold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_25px_rgba(234,179,8,0.35)] hover:shadow-[0_0_45px_rgba(234,179,8,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3">
                  <Wallet className="w-5 h-5" /> Connect Wallet to Enter
                </button>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Smart contract on Polygon PoS.{" "}
                <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary/70 hover:text-primary transition-colors font-mono">
                  View on Polygonscan ↗
                </a>
              </p>
            </div>
          </motion.div>

          {/* ── Referral Card ── */}
          {address && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card px-6 py-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Your Referral Link</h4>
                <span className="ml-auto text-xs text-primary/70 font-semibold">+5 OKBOND per referral</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Share your link — you earn 5 OKBOND for every player who joins through it.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs font-mono text-muted-foreground truncate">{refLink}</div>
                <button onClick={copyRef}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200
                    ${copied ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50"}`}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Admin Panel ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => setShowAdmin((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">Admin Panel</span>
                <span className="text-xs text-muted-foreground/60">(owner only)</span>
              </div>
              <span className="text-xs text-muted-foreground">{showAdmin ? "▲ hide" : "▼ show"}</span>
            </button>
            <AnimatePresence>
              {showAdmin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border px-6 py-5 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Only the contract owner wallet can use these functions. Calls from non-owner wallets will revert on-chain.
                  </p>
                  {address ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Start Lottery */}
                      <button onClick={handleStart}
                        disabled={isPending || cs.lotteryStarted}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all duration-300
                          ${cs.lotteryStarted
                            ? "border-green-500/20 bg-green-500/5 text-green-400/60 cursor-not-allowed"
                            : isPending && action === "start"
                            ? "border-border bg-muted/20 text-muted-foreground cursor-not-allowed"
                            : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60"}`}>
                        {isPending && action === "start"
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                          : cs.lotteryStarted
                          ? <><CheckCircle2 className="w-4 h-4" /> Already Active</>
                          : <><Play className="w-4 h-4" /> Start Lottery</>}
                      </button>
                      {/* Select Winners */}
                      <button onClick={handleSelect}
                        disabled={isPending || !cs.lotteryStarted || cs.winnersSelected || !cd.expired}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all duration-300
                          ${cs.winnersSelected
                            ? "border-purple-500/20 bg-purple-500/5 text-purple-400/60 cursor-not-allowed"
                            : isPending && action === "select"
                            ? "border-border bg-muted/20 text-muted-foreground cursor-not-allowed"
                            : !cd.expired
                            ? "border-border bg-muted/10 text-muted-foreground/50 cursor-not-allowed"
                            : "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/60"}`}>
                        {isPending && action === "select"
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Selecting…</>
                          : cs.winnersSelected
                          ? <><Crown className="w-4 h-4" /> Winners Selected</>
                          : <><Crown className="w-4 h-4" /> Select 5 Winners</>}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-yellow-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Connect your admin wallet to use admin functions.
                    </p>
                  )}
                  {!cd.expired && cs.lotteryStarted && !cs.winnersSelected && (
                    <p className="text-xs text-muted-foreground/60">
                      "Select Winners" unlocks after the lock duration expires.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Info pills ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-4">
            {[
              { label: "Selection", value: "Random" },
              { label: "Winners", value: "5 Players" },
              { label: "Network", value: "Polygon" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-border bg-card text-center hover:border-primary/30 transition-colors">
                <p className="text-primary font-bold text-sm">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Live Winners Ticker ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/20 bg-[#06060a] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/10 bg-primary/5">
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70">
                Recent Winners
              </span>
              <span className="ml-auto text-[9px] text-muted-foreground/50 font-mono">Live Feed</span>
            </div>
            <div className="overflow-hidden py-2.5">
              <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -1400] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
                {[
                  { addr: "0x3aF2…8Cd7", amt: "5,000", prize: "Jackpot" },
                  { addr: "0x9b21…1Ab3", amt: "5,000", prize: "Jackpot" },
                  { addr: "0x7c44…F921", amt: "2,500", prize: "Jackpot" },
                  { addr: "0x1eB5…4D30", amt: "5,000", prize: "Jackpot" },
                  { addr: "0xaA92…7F10", amt: "2,500", prize: "Jackpot" },
                  { addr: "0x55e0…C812", amt: "5,000", prize: "Jackpot" },
                  { addr: "0x3aF2…8Cd7", amt: "5,000", prize: "Jackpot" },
                  { addr: "0x9b21…1Ab3", amt: "2,500", prize: "Jackpot" },
                  { addr: "0x7c44…F921", amt: "5,000", prize: "Jackpot" },
                  { addr: "0x1eB5…4D30", amt: "2,500", prize: "Jackpot" },
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Crown className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-mono text-primary/80">{w.addr}</span>
                    <span className="text-muted-foreground">won</span>
                    <span className="font-bold text-emerald-400">{w.amt} OKBOND</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/60 font-mono border border-primary/15">
                      {w.prize}
                    </span>
                    <span className="text-primary/20">·</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* ── Live Participation Feed ── */}
          <LiveParticipationFeed />

        </div>
      </div>
    </section>
  );
}
