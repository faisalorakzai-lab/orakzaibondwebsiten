import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { useLocation } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ShieldCheck, Loader2, CheckCircle2, ExternalLink,
  Play, Crown, Users, Coins, Clock, AlertTriangle,
  RefreshCw, Lock, Wallet, ArrowLeft, LayoutDashboard,
  TrendingUp, Database, CreditCard, Layers, Trophy,
  ChevronRight, Activity, ArrowRightLeft, Bell, BellRing,
  BarChart2, Info, CheckCheck, AlertCircle, Zap, X,
  TrendingDown, PieChart as PieIcon, Square, PowerOff,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import LOTTERY_ABI from "@/lib/contractABI.json";
import ParticleBackground from "@/components/ParticleBackground";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_WALLET    = "0x9b02e2Edd6F58D626aAa91889708dbF39dfa8Cd7";
const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const EXPLORER        = "https://polygonscan.com";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

type TxPhase = "idle" | "pending" | "success" | "failed";
type AdminTab = "dashboard" | "analytics" | "notifications" | "lottery" | "players" | "treasury" | "staking" | "lending";

interface PlayerRow {
  address: string;
  deposit: bigint;
  isWinner: boolean;
}

type NotifLevel = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  level: NotifLevel;
  title: string;
  body: string;
  ts: number;
  read: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function short(a: string) { return `${a.slice(0, 8)}…${a.slice(-6)}`; }

function parseErr(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ACTION_REJECTED")
    return "Transaction rejected by user.";
  if (err instanceof Error) return err.message.slice(0, 220);
  return "Unknown error";
}

async function fetchAllPlayers(c: Contract, cap = 500): Promise<string[]> {
  const addrs: string[] = [];
  for (let i = 0; i < cap; i++) {
    try { addrs.push(await c.players(i) as string); }
    catch { break; }
  }
  return addrs;
}

function useCountdown(endMs: number | null) {
  const [rem, setRem] = useState(0);
  useEffect(() => {
    if (!endMs) return;
    const tick = () => setRem(Math.max(0, endMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);
  const d = Math.floor(rem / 86_400_000);
  const h = Math.floor((rem % 86_400_000) / 3_600_000);
  const m = Math.floor((rem % 3_600_000) / 60_000);
  const s = Math.floor((rem % 60_000) / 1000);
  return { d, h, m, s, expired: rem === 0 };
}

function makeId() { return Math.random().toString(36).slice(2); }

// ── Analytics mock history (7 rounds) ────────────────────────────────────────
const ROUND_HISTORY = [
  { round: "R1", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "R2", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "R3", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "R4", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "R5", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "R6", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
  { round: "Current", players: 0, pool: 0, winners: 0, prizeEach: 0 },
];

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-primary/20 rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="text-primary font-bold font-mono">{payload[0].value.toLocaleString()}{unit}</p>
    </div>
  );
}

// ── Nav Tabs ──────────────────────────────────────────────────────────────────
const NAV: { id: AdminTab; label: string; icon: React.ReactNode; soon?: boolean }[] = [
  { id: "dashboard",      label: "Dashboard",    icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "analytics",      label: "Analytics",    icon: <BarChart2 className="w-4 h-4" /> },
  { id: "notifications",  label: "Alerts",       icon: <Bell className="w-4 h-4" /> },
  { id: "lottery",        label: "Lottery",      icon: <Trophy className="w-4 h-4" /> },
  { id: "players",        label: "Players",      icon: <Users className="w-4 h-4" /> },
  { id: "treasury",       label: "Treasury",     icon: <Coins className="w-4 h-4" /> },
  { id: "staking",        label: "Staking",      icon: <TrendingUp className="w-4 h-4" />, soon: true },
  { id: "lending",        label: "Lending",      icon: <CreditCard className="w-4 h-4" />, soon: true },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { address, provider, isPolygon, connect, switchToPolygon } = useWallet();
  const [switching, setSwitching] = useState(false);
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<AdminTab>("dashboard");

  const isAdmin = !!(address && address.toLowerCase() === ADMIN_WALLET.toLowerCase());

  useEffect(() => {
    if (address && !isAdmin) {
      setTimeout(() => setLocation("/"), 2000);
    }
  }, [address, isAdmin, setLocation]);

  // ── Contract state ─────────────────────────────────────────────────────────
  const [lotteryStarted,  setLotteryStarted]  = useState(false);
  const [winnersSelected, setWinnersSelected] = useState(false);
  const [entryAmount,     setEntryAmount]     = useState(0n);
  const [rewardPerWinner, setRewardPerWinner] = useState(0n);
  const [startTime,       setStartTime]       = useState(0);
  const [lockDuration,    setLockDuration]    = useState(0);
  const [contractPOL,     setContractPOL]     = useState(0n);
  const [contractOKBOND,  setContractOKBOND]  = useState(0n);
  const [totalSupply,     setTotalSupply]     = useState(0n);
  const [players,         setPlayers]         = useState<PlayerRow[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [playersLoading,  setPlayersLoading]  = useState(false);

  // ── Price state ────────────────────────────────────────────────────────────
  const [polPrice,  setPolPrice]  = useState<number | null>(null);
  const [polChange, setPolChange] = useState<number | null>(null);

  // ── Tx state ───────────────────────────────────────────────────────────────
  const [startPhase,  setStartPhase]  = useState<TxPhase>("idle");
  const [selectPhase, setSelectPhase] = useState<TxPhase>("idle");
  const [closePhase,  setClosePhase]  = useState<TxPhase>("idle");
  const [startTx,     setStartTx]     = useState<string | null>(null);
  const [selectTx,    setSelectTx]    = useState<string | null>(null);
  const [closeTx,     setCloseTx]     = useState<string | null>(null);
  const [startErr,    setStartErr]    = useState<string | null>(null);
  const [selectErr,   setSelectErr]   = useState<string | null>(null);
  const [closeErr,    setCloseErr]    = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const prevState = useRef({ lotteryStarted: false, winnersSelected: false, players: 0 });

  const addNotif = useCallback((level: NotifLevel, title: string, body: string) => {
    setNotifs(prev => [{ id: makeId(), level, title, body, ts: Date.now(), read: false }, ...prev].slice(0, 50));
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const unreadCount = notifs.filter(n => !n.read).length;

  const endMs = lotteryStarted && !winnersSelected && startTime > 0
    ? (startTime + lockDuration) * 1000 : null;
  const cd = useCountdown(endMs);

  // ── Fetch contract data ────────────────────────────────────────────────────
  const fetchState = useCallback(async () => {
    if (!provider || !isAdmin || !isPolygon) return;
    setLoading(true);
    try {
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const t = new Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
      const [started, winSel, amount, reward, st, lock, polBal, okBal, supply] = await Promise.all([
        c.lotteryStarted()   as Promise<boolean>,
        c.winnersSelected()  as Promise<boolean>,
        c.entryAmount()      as Promise<bigint>,
        c.rewardPerWinner()  as Promise<bigint>,
        c.startTime()        as Promise<bigint>,
        c.lockDuration()     as Promise<bigint>,
        provider.getBalance(LOTTERY_ADDRESS),
        t.balanceOf(LOTTERY_ADDRESS) as Promise<bigint>,
        t.totalSupply()              as Promise<bigint>,
      ]);

      // Detect state changes and fire notifications
      if (started && !prevState.current.lotteryStarted) {
        addNotif("success", "Lottery Activated", "The lottery has been started. Players can now enter.");
      }
      if (winSel && !prevState.current.winnersSelected) {
        addNotif("success", "Winners Selected", "5 winners have been drawn from the player pool. Rewards are claimable.");
      }

      prevState.current = { lotteryStarted: started, winnersSelected: winSel, players: prevState.current.players };

      setLotteryStarted(started);
      setWinnersSelected(winSel);
      setEntryAmount(amount);
      setRewardPerWinner(reward);
      setStartTime(Number(st));
      setLockDuration(Number(lock));
      setContractPOL(polBal);
      setContractOKBOND(okBal);
      setTotalSupply(supply);
    } catch { /* best-effort */ }
    finally { setLoading(false); }
  }, [provider, isAdmin, isPolygon, addNotif]);

  // ── Fetch players ──────────────────────────────────────────────────────────
  const fetchPlayers = useCallback(async () => {
    if (!provider || !isAdmin || !isPolygon) return;
    setPlayersLoading(true);
    try {
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const addrs = await fetchAllPlayers(c);
      const rows = await Promise.all(
        addrs.map(async (addr): Promise<PlayerRow> => {
          const [dep, winner] = await Promise.all([
            c.deposits(addr)  as Promise<bigint>,
            c.isWinner(addr)  as Promise<boolean>,
          ]);
          return { address: addr, deposit: dep, isWinner: winner };
        })
      );

      // Notify on new players
      if (rows.length > prevState.current.players && prevState.current.players > 0) {
        const diff = rows.length - prevState.current.players;
        addNotif("info", `${diff} New Player${diff > 1 ? "s" : ""}`, `${rows.length} total participants in the current round.`);
      }
      prevState.current.players = rows.length;
      setPlayers(rows);
    } catch { /* best-effort */ }
    finally { setPlayersLoading(false); }
  }, [provider, isAdmin, isPolygon, addNotif]);

  // ── Fetch POL price ────────────────────────────────────────────────────────
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd&include_24hr_change=true"
      );
      if (!res.ok) return;
      const data = await res.json();
      const pol = data["matic-network"];
      if (pol) {
        if (pol.usd_24h_change < -5) addNotif("warning", "POL Price Drop", `POL fell ${pol.usd_24h_change.toFixed(2)}% in 24h. Current: $${pol.usd.toFixed(4)}`);
        setPolPrice(pol.usd);
        setPolChange(pol.usd_24h_change ?? null);
      }
    } catch { /* best-effort */ }
  }, [addNotif]);

  // ── Seed initial notifications on admin connect ────────────────────────────
  const seededRef = useRef(false);
  useEffect(() => {
    if (isAdmin && isPolygon && !seededRef.current) {
      seededRef.current = true;
      addNotif("info", "Admin Console Active", "You are connected as the contract owner. All systems operational.");
      addNotif("info", "Network Confirmed", "Connected to Polygon PoS (Chain ID 137). Smart contract is reachable.");
    }
  }, [isAdmin, isPolygon, addNotif]);

  useEffect(() => { fetchState(); fetchPrices(); }, [fetchState, fetchPrices]);
  useEffect(() => { if (tab === "players") fetchPlayers(); }, [tab, fetchPlayers]);

  // ── Tx handlers ────────────────────────────────────────────────────────────
  async function handleStart() {
    if (!provider) return;
    setStartPhase("pending"); setStartTx(null); setStartErr(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).startLottery();
      setStartTx(tx.hash); await tx.wait();
      setStartPhase("success"); await fetchState();
      addNotif("success", "Lottery Started", `Tx confirmed: ${tx.hash.slice(0, 18)}…`);
    } catch (e) {
      setStartPhase("failed"); setStartErr(parseErr(e));
      addNotif("error", "Start Failed", parseErr(e));
    }
  }

  async function handleSelect() {
    if (!provider) return;
    setSelectPhase("pending"); setSelectTx(null); setSelectErr(null);
    try {
      const tx = await (new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, await provider.getSigner())).selectWinners();
      setSelectTx(tx.hash); await tx.wait();
      setSelectPhase("success"); await fetchState();
      addNotif("success", "Winners Drawn", `5 winners selected. Tx: ${tx.hash.slice(0, 18)}…`);
    } catch (e) {
      setSelectPhase("failed"); setSelectErr(parseErr(e));
      addNotif("error", "Selection Failed", parseErr(e));
    }
  }

  async function handleForceClose() {
    if (!provider) return;
    setShowCloseConfirm(false);
    setClosePhase("pending"); setCloseTx(null); setCloseErr(null);
    try {
      const signer = await provider.getSigner();
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await c.selectWinners();
      setCloseTx(tx.hash);
      await tx.wait();
      setClosePhase("success");
      await fetchState();
      addNotif("success", "Lottery Force Closed", `Winners selected & lottery ended. Tx: ${tx.hash.slice(0, 18)}…`);
    } catch (e) {
      setClosePhase("failed");
      setCloseErr(parseErr(e));
      addNotif("error", "Force Close Failed", parseErr(e));
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const polFmt    = parseFloat(formatUnits(contractPOL, 18)).toFixed(4);
  const polUSD    = polPrice ? (parseFloat(formatUnits(contractPOL, 18)) * polPrice).toFixed(2) : null;
  const okFmt     = parseFloat(formatUnits(contractOKBOND, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const supplyFmt = (parseFloat(formatUnits(totalSupply, 18)) / 1_000_000).toFixed(2) + "M";
  const entryFmt  = entryAmount > 0n ? parseFloat(formatUnits(entryAmount, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";
  const rewardFmt = rewardPerWinner > 0n ? parseFloat(formatUnits(rewardPerWinner, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "TBD";

  // ── Analytics derived ──────────────────────────────────────────────────────
  const currentPlayers = players.length;
  const entryNum       = entryAmount > 0n ? parseFloat(formatUnits(entryAmount, 18)) : 0;
  const totalDeposited = currentPlayers * entryNum;
  const rewardNum      = rewardPerWinner > 0n ? parseFloat(formatUnits(rewardPerWinner, 18)) : 0;

  const chartData = ROUND_HISTORY.map((r, i) =>
    i === ROUND_HISTORY.length - 1
      ? { ...r, players: currentPlayers, pool: totalDeposited, prizeEach: rewardNum }
      : r
  );

  const tokenPieData = [
    { name: "In Contract", value: parseFloat(formatUnits(contractOKBOND || 0n, 18)) },
    { name: "Circulating",  value: Math.max(0, parseFloat(formatUnits(totalSupply || 0n, 18)) - parseFloat(formatUnits(contractOKBOND || 0n, 18))) },
  ];
  const PIE_COLORS = ["hsl(43,96%,56%)", "hsl(220,15%,18%)"];

  const winRate = currentPlayers > 0 ? ((5 / currentPlayers) * 100).toFixed(1) : "0.0";

  // ── Notification icon & colour ─────────────────────────────────────────────
  function notifIcon(level: NotifLevel) {
    const cls = "w-4 h-4 flex-shrink-0";
    if (level === "success") return <CheckCircle2 className={`${cls} text-green-400`} />;
    if (level === "warning") return <AlertTriangle className={`${cls} text-yellow-400`} />;
    if (level === "error")   return <AlertCircle   className={`${cls} text-red-400`} />;
    return <Info className={`${cls} text-primary/70`} />;
  }
  function notifBorder(level: NotifLevel) {
    if (level === "success") return "border-green-500/20  bg-green-500/5";
    if (level === "warning") return "border-yellow-500/20 bg-yellow-500/5";
    if (level === "error")   return "border-red-500/20    bg-red-500/5";
    return "border-primary/15 bg-primary/5";
  }
  function relTime(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.07),transparent_60%)] pointer-events-none" />

      {/* ── Force Close Confirmation Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowCloseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                  <PowerOff className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Force Close Lottery?</h3>
                  <p className="text-xs text-muted-foreground">Yeh action blockchain par permanent hai</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-300 leading-relaxed">
                  <strong className="block mb-1">⚠️ Warning:</strong>
                  Lottery abhi bhi active hai aur lock timer expire nahi hua. Force close karne se contract <code>selectWinners()</code> call karega — blockchain reject kar sakta hai agar contract mein timer check hai.
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-300 leading-relaxed">
                  <strong className="block mb-1">Kya hoga:</strong>
                  5 winners on-chain select ho jayenge, players reward claim kar sakenge, aur lottery permanently close ho jayegi.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all font-semibold text-sm"
                >
                  Nahi, Wapis Jao
                </button>
                <button
                  onClick={handleForceClose}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
                >
                  <PowerOff className="w-4 h-4" /> Han, Force Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="relative z-20 border-b border-border/50 glass-dark px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Site</span>
          </a>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.3)", "0 0 20px rgba(234,179,8,0.7)", "0 0 8px rgba(234,179,8,0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-8 h-8 rounded-full overflow-hidden border border-primary/40 flex-shrink-0"
            >
              <img src="/okbond-logo.png" alt="OKBOND" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <span className="font-extrabold text-foreground text-sm">Orakzai Admin</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 tracking-widest">
                OWNER ONLY
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {polPrice && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/40">
              <Activity className="w-3 h-3 text-primary/60" />
              <span className="text-xs text-muted-foreground font-mono">POL</span>
              <span className="text-xs font-bold text-primary font-mono">${polPrice.toFixed(4)}</span>
              {polChange !== null && (
                <span className={`text-[10px] font-semibold ${polChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {polChange >= 0 ? "+" : ""}{polChange.toFixed(2)}%
                </span>
              )}
            </div>
          )}

          {/* Notification bell */}
          {isAdmin && (
            <button
              onClick={() => { setTab("notifications"); markAllRead(); }}
              className="relative p-2 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
            >
              {unreadCount > 0
                ? <BellRing className="w-4 h-4 text-primary animate-pulse" />
                : <Bell className="w-4 h-4" />}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <button onClick={() => { fetchState(); if (tab === "players") fetchPlayers(); }} disabled={loading}
            className="p-2 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {address ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-primary font-mono text-xs">{short(address)}</span>
            </div>
          ) : (
            <button onClick={connect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* ── Wrong network banner ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {address && !isPolygon && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="relative z-20 flex items-center justify-between gap-4 px-6 py-3 border-b border-orange-500/30 bg-orange-500/10">
            <div className="flex items-center gap-2.5 text-sm text-orange-300">
              <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
              <span><strong>Wrong Network</strong> — Switch to Polygon to use the admin console.</span>
            </div>
            <button onClick={async () => { setSwitching(true); try { await switchToPolygon(); } finally { setSwitching(false); } }}
              disabled={switching}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-all disabled:opacity-50">
              {switching ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Switching…</> : <><ArrowRightLeft className="w-3.5 h-3.5" /> Switch to Polygon</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1">

        {/* ── Sidebar nav ──────────────────────────────────────────────────── */}
        {isAdmin && (
          <aside className="hidden md:flex flex-col w-56 border-r border-border/50 glass-dark py-6 px-3 gap-1">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold px-3 mb-2">Modules</p>
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.soon && setTab(n.id)}
                disabled={!!n.soon}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                  ${n.soon ? "opacity-40 cursor-not-allowed text-muted-foreground"
                    : tab === n.id
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
              >
                {n.icon}
                <span className="flex-1">{n.label}</span>
                {n.id === "notifications" && unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {n.soon && <span className="text-[9px] uppercase tracking-widest bg-muted/30 text-muted-foreground/60 px-1.5 py-0.5 rounded font-bold">Soon</span>}
                {!n.soon && tab === n.id && !n.soon && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
              </button>
            ))}

            <div className="mt-auto px-3 pt-4 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1">Contract</p>
              <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono text-primary/50 hover:text-primary transition-colors">
                {LOTTERY_ADDRESS.slice(0, 12)}… <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </aside>
        )}

        {/* ── Main area ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">

          {/* Not connected */}
          {!address && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="glass-gold rounded-3xl p-16 text-center mt-8 max-w-xl mx-auto">
              <Lock className="w-14 h-14 text-primary/30 mx-auto mb-5" />
              <h2 className="text-2xl font-extrabold text-foreground mb-3">Vault Locked</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">Connect the Orakzai admin wallet to enter the Power Console.</p>
              <button onClick={connect}
                className="px-10 py-3.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-base hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] hover:-translate-y-0.5">
                Connect Admin Wallet
              </button>
            </motion.div>
          )}

          {/* Wrong wallet */}
          {address && !isAdmin && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="glass-gold rounded-3xl p-16 text-center mt-8 max-w-xl mx-auto border border-destructive/20">
              <AlertTriangle className="w-14 h-14 text-destructive/50 mx-auto mb-5" />
              <h2 className="text-2xl font-extrabold text-foreground mb-3">Access Denied</h2>
              <p className="text-muted-foreground mb-2 leading-relaxed">This wallet does not have admin privileges.</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted/20 rounded-lg px-4 py-2 inline-block mt-2">
                Required: {ADMIN_WALLET.slice(0, 12)}…{ADMIN_WALLET.slice(-6)}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-4">Redirecting to home page…</p>
            </motion.div>
          )}

          {/* Admin panels */}
          {isAdmin && (
            <AnimatePresence mode="wait">

              {/* ── DASHBOARD ─────────────────────────────────────────────── */}
              {tab === "dashboard" && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground">
                      Power <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Console</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin. All systems nominal.</p>
                  </div>

                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: <Coins className="w-5 h-5" />, label: "POL Balance", value: loading ? "…" : `${polFmt} POL`, sub: polUSD ? `≈ $${polUSD}` : undefined },
                      { icon: <Users className="w-5 h-5" />, label: "Total Players", value: loading ? "…" : String(players.length || "—"), sub: "entered" },
                      { icon: <Database className="w-5 h-5" />, label: "OKBOND Held", value: loading ? "…" : okFmt, sub: "in contract" },
                      { icon: <Layers className="w-5 h-5" />, label: "Entry Cost", value: loading ? "…" : `${entryFmt}`, sub: "OKBOND per ticket" },
                    ].map((s) => (
                      <div key={s.label} className="glass-card rounded-2xl border border-border p-5 hover:border-primary/25 transition-colors">
                        <div className="flex items-center gap-2 text-primary/50 mb-3">{s.icon}</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-xl font-extrabold text-primary font-mono">{s.value}</p>
                        {s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Status card */}
                  <div className="glass-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Lottery Status</p>
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${winnersSelected ? "bg-purple-400" : lotteryStarted ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                          <span className="font-bold text-foreground text-lg">
                            {winnersSelected ? "Complete — Winners Selected" : lotteryStarted ? "Active — Accepting Entries" : "Pending Start"}
                          </span>
                        </div>
                      </div>
                      {endMs && !cd.expired && (
                        <div className="flex gap-2">
                          {[{ v: cd.d, l: "Days" }, { v: cd.h, l: "Hrs" }, { v: cd.m, l: "Min" }, { v: cd.s, l: "Sec" }].map(({ v, l }) => (
                            <div key={l} className="text-center px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 min-w-[52px]">
                              <p className="font-mono font-extrabold text-primary text-2xl leading-none">{String(v).padStart(2, "0")}</p>
                              <p className="text-[10px] text-muted-foreground uppercase mt-1">{l}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {endMs && cd.expired && (
                        <span className="text-yellow-400 text-sm font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Lock expired — select winners
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* Start */}
                    <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                        <div><p className="font-bold text-foreground text-sm">Start Lottery</p><p className="text-xs text-muted-foreground">Opens entry for all users</p></div>
                      </div>
                      {startPhase === "success" && (
                        <div className="text-green-400 text-xs p-2.5 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Started!
                          {startTx && <a href={`${EXPLORER}/tx/${startTx}`} target="_blank" rel="noopener noreferrer" className="ml-auto"><ExternalLink className="w-3 h-3" /></a>}
                        </div>
                      )}
                      {startPhase === "failed" && <p className="text-destructive text-xs p-2.5 rounded-xl bg-destructive/5 border border-destructive/20">{startErr}</p>}
                      <button onClick={handleStart} disabled={!isPolygon || startPhase === "pending" || lotteryStarted}
                        className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                          ${!isPolygon ? "bg-muted/20 text-muted-foreground cursor-not-allowed border border-border"
                            : lotteryStarted ? "bg-muted/20 text-muted-foreground cursor-not-allowed border border-border"
                            : startPhase === "pending" ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:-translate-y-0.5"}`}>
                        {startPhase === "pending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                          : lotteryStarted ? <><CheckCircle2 className="w-4 h-4" /> Already Active</>
                          : <><Play className="w-4 h-4" /> Start Lottery</>}
                      </button>
                    </div>

                    {/* Select Winners */}
                    <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-purple-400" />
                        </div>
                        <div><p className="font-bold text-foreground text-sm">Select 5 Winners</p><p className="text-xs text-muted-foreground">Permanently picks winners</p></div>
                      </div>
                      {!cd.expired && lotteryStarted && !winnersSelected && (
                        <div className="text-yellow-400 text-xs p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5" /> Locked until countdown expires
                        </div>
                      )}
                      {selectPhase === "success" && (
                        <div className="text-green-400 text-xs p-2.5 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Winners selected!
                          {selectTx && <a href={`${EXPLORER}/tx/${selectTx}`} target="_blank" rel="noopener noreferrer" className="ml-auto"><ExternalLink className="w-3 h-3" /></a>}
                        </div>
                      )}
                      {selectPhase === "failed" && <p className="text-destructive text-xs p-2.5 rounded-xl bg-destructive/5 border border-destructive/20">{selectErr}</p>}
                      <button onClick={handleSelect} disabled={!isPolygon || selectPhase === "pending" || !lotteryStarted || winnersSelected || !cd.expired}
                        className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                          ${winnersSelected ? "bg-muted/20 text-muted-foreground cursor-not-allowed border border-border"
                            : selectPhase === "pending" ? "bg-purple-500/20 text-purple-400/50 cursor-not-allowed"
                            : !lotteryStarted || !cd.expired ? "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-border"
                            : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-0.5"}`}>
                        {selectPhase === "pending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Selecting…</>
                          : winnersSelected ? <><Crown className="w-4 h-4" /> Already Done</>
                          : <><Crown className="w-4 h-4" /> Select 5 Winners</>}
                      </button>
                    </div>

                    {/* Force Close */}
                    <div className="glass-card rounded-2xl border border-red-500/20 p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                          <Square className="w-4 h-4 text-red-400 fill-red-400" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Close Lottery</p>
                          <p className="text-xs text-muted-foreground">Force end — winners drawn</p>
                        </div>
                      </div>
                      {!lotteryStarted && (
                        <div className="text-muted-foreground text-xs p-2.5 rounded-xl bg-muted/10 border border-border flex items-center gap-2">
                          <Info className="w-3.5 h-3.5" /> Lottery shuru nahi hai
                        </div>
                      )}
                      {lotteryStarted && !cd.expired && (
                        <div className="text-orange-400 text-xs p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5" /> Timer active — force close hoga
                        </div>
                      )}
                      {closePhase === "success" && (
                        <div className="text-green-400 text-xs p-2.5 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lottery closed!
                          {closeTx && <a href={`${EXPLORER}/tx/${closeTx}`} target="_blank" rel="noopener noreferrer" className="ml-auto"><ExternalLink className="w-3 h-3" /></a>}
                        </div>
                      )}
                      {closePhase === "failed" && <p className="text-red-400 text-xs p-2.5 rounded-xl bg-red-500/5 border border-red-500/20">{closeErr}</p>}
                      <button
                        onClick={() => lotteryStarted && !winnersSelected && cd.expired ? handleForceClose() : setShowCloseConfirm(true)}
                        disabled={!isPolygon || closePhase === "pending" || !lotteryStarted || winnersSelected}
                        className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                          ${!lotteryStarted || winnersSelected ? "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-border"
                            : closePhase === "pending" ? "bg-red-500/20 text-red-400/50 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:-translate-y-0.5"}`}
                      >
                        {closePhase === "pending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Closing…</>
                          : winnersSelected ? <><Square className="w-4 h-4 fill-current" /> Already Closed</>
                          : <><PowerOff className="w-4 h-4" /> Close Lottery</>}
                      </button>
                    </div>
                  </div>

                  {/* Recent alerts preview */}
                  {notifs.filter(n => !n.read).length > 0 && (
                    <div className="glass-card rounded-2xl border border-primary/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BellRing className="w-4 h-4 text-primary animate-pulse" />
                          <span className="font-bold text-sm text-foreground">Unread Alerts</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">{unreadCount}</span>
                        </div>
                        <button onClick={() => setTab("notifications")} className="text-xs text-primary/70 hover:text-primary transition-colors">View all →</button>
                      </div>
                      <div className="space-y-2">
                        {notifs.filter(n => !n.read).slice(0, 3).map(n => (
                          <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${notifBorder(n.level)}`}>
                            {notifIcon(n.level)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground">{n.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">{relTime(n.ts)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── ANALYTICS ─────────────────────────────────────────────── */}
              {tab === "analytics" && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Analytics <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Live on-chain metrics and lottery performance data.</p>
                  </div>

                  {/* KPI strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: <Users className="w-4 h-4" />, label: "Participants", value: loading ? "—" : String(currentPlayers),
                        sub: "current round", trend: null,
                      },
                      {
                        icon: <Coins className="w-4 h-4" />, label: "Prize Pool", value: loading ? "—" : `${totalDeposited.toLocaleString(undefined, { maximumFractionDigits: 0 })} OKBOND`,
                        sub: "total deposited", trend: null,
                      },
                      {
                        icon: <Trophy className="w-4 h-4" />, label: "Win Rate", value: loading ? "—" : `${winRate}%`,
                        sub: "5 winners / players", trend: null,
                      },
                      {
                        icon: <Zap className="w-4 h-4" />, label: "Reward / Winner", value: loading ? "—" : `${rewardFmt}`,
                        sub: "OKBOND reward", trend: null,
                      },
                    ].map((s) => (
                      <div key={s.label} className="glass-card rounded-2xl border border-border p-4 hover:border-primary/25 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-primary/50">{s.icon}</div>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-base font-extrabold text-primary font-mono leading-tight">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts row 1 */}
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Players per round */}
                    <div className="glass-card rounded-2xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-4 h-4 text-primary/60" />
                        <p className="font-bold text-sm text-foreground">Players per Round</p>
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="round" tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip />} />
                          <Bar dataKey="players" fill="hsl(43,96%,56%)" radius={[4, 4, 0, 0]} opacity={0.9} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-muted-foreground mt-2 text-center">Historical rounds — earlier data populates after first lottery cycle completes.</p>
                    </div>

                    {/* Prize pool per round */}
                    <div className="glass-card rounded-2xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary/60" />
                        <p className="font-bold text-sm text-foreground">Prize Pool (OKBOND)</p>
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="poolGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="hsl(43,96%,56%)" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="hsl(43,96%,56%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="round" tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip unit=" OKBOND" />} />
                          <Area type="monotone" dataKey="pool" stroke="hsl(43,96%,56%)" strokeWidth={2} fill="url(#poolGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Charts row 2 */}
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* Token distribution pie */}
                    <div className="glass-card rounded-2xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <PieIcon className="w-4 h-4 text-primary/60" />
                        <p className="font-bold text-sm text-foreground">Token Distribution</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={140}>
                          <PieChart>
                            <Pie
                              data={tokenPieData}
                              cx="50%" cy="50%"
                              innerRadius={38} outerRadius={60}
                              dataKey="value"
                              stroke="none"
                            >
                              {tokenPieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " OKBOND"} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 mt-1">
                          {tokenPieData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                              {d.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lottery state grid */}
                    <div className="glass-card rounded-2xl border border-border p-5 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-primary/60" />
                        <p className="font-bold text-sm text-foreground">Contract State Breakdown</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Lottery Active",     value: loading ? "…" : (lotteryStarted  ? "Yes" : "No"),  ok: lotteryStarted },
                          { label: "Winners Drawn",      value: loading ? "…" : (winnersSelected ? "Yes" : "No"),  ok: winnersSelected },
                          { label: "Entry Amount",       value: loading ? "…" : `${entryFmt} OKBOND`,              ok: entryAmount > 0n },
                          { label: "Reward / Winner",    value: loading ? "…" : `${rewardFmt} OKBOND`,             ok: rewardPerWinner > 0n },
                          { label: "Lock Duration",      value: loading ? "…" : (lockDuration ? `${Math.round(lockDuration / 86400)}d` : "—"), ok: lockDuration > 0 },
                          { label: "Total Supply",       value: loading ? "…" : supplyFmt,                         ok: totalSupply > 0n },
                          { label: "Contract POL",       value: loading ? "…" : `${polFmt} POL`,                   ok: contractPOL > 0n },
                          { label: "Contract OKBOND",    value: loading ? "…" : okFmt,                             ok: contractOKBOND > 0n },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/50">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className={`text-xs font-bold font-mono ${item.ok ? "text-primary" : "text-muted-foreground"}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/30 flex gap-3 flex-wrap">
                        <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                          <ExternalLink className="w-3 h-3" /> Lottery on Polygonscan
                        </a>
                        <a href={`${EXPLORER}/token/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border bg-muted/20 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                          <ExternalLink className="w-3 h-3" /> OKBOND Token
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* POL price card */}
                  {polPrice && (
                    <div className="glass-gold rounded-2xl border border-primary/15 p-5 flex items-center justify-between gap-6 flex-wrap">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Live POL Price</p>
                        <p className="text-3xl font-extrabold text-primary font-mono">${polPrice.toFixed(4)}</p>
                        {polChange !== null && (
                          <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${polChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {polChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {polChange >= 0 ? "+" : ""}{polChange.toFixed(2)}% (24h)
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        {[
                          { label: "Treasury (POL)", value: `$${polUSD ?? "—"}` },
                          { label: "POL in Contract", value: `${polFmt} POL` },
                        ].map(s => (
                          <div key={s.label} className="px-4 py-2.5 rounded-xl bg-background/30 border border-primary/10">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">{s.label}</p>
                            <p className="font-bold text-primary font-mono text-sm">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
              {tab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl font-extrabold text-foreground">
                        System <span className="text-primary">Alerts</span>
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        {notifs.length} event{notifs.length !== 1 ? "s" : ""} recorded this session
                        {unreadCount > 0 && <> · <span className="text-primary">{unreadCount} unread</span></>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                      <button onClick={() => fetchState()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync chain
                      </button>
                    </div>
                  </div>

                  {/* Filter strip */}
                  {notifs.length > 0 && (() => {
                    const counts = { all: notifs.length, info: 0, success: 0, warning: 0, error: 0 };
                    notifs.forEach(n => { counts[n.level]++; });
                    return (
                      <div className="flex gap-2 flex-wrap">
                        {(["all", "info", "success", "warning", "error"] as const).map(lvl => (
                          <span key={lvl} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-default
                            ${lvl === "success" ? "border-green-500/20 text-green-400 bg-green-500/5"
                              : lvl === "warning" ? "border-yellow-500/20 text-yellow-400 bg-yellow-500/5"
                              : lvl === "error"   ? "border-red-500/20 text-red-400 bg-red-500/5"
                              : lvl === "info"    ? "border-primary/20 text-primary/70 bg-primary/5"
                              : "border-border text-muted-foreground bg-muted/10"}`}>
                            {lvl.charAt(0).toUpperCase() + lvl.slice(1)} ({counts[lvl === "all" ? "all" : lvl]})
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Notification feed */}
                  {notifs.length === 0 ? (
                    <div className="glass-card rounded-2xl border border-border p-16 text-center">
                      <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No alerts yet. They appear when contract state changes.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notifs.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${notifBorder(n.level)} ${n.read ? "opacity-60" : ""}`}
                        >
                          <div className="mt-0.5">{notifIcon(n.level)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <p className={`text-sm font-bold ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground/50">{relTime(n.ts)}</span>
                            <button onClick={() => dismissNotif(n.id)}
                              className="p-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── LOTTERY tab ───────────────────────────────────────────── */}
              {tab === "lottery" && (
                <motion.div key="lottery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Lottery <span className="text-primary">Control</span></h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: "Entry Amount", value: `${entryFmt} OKBOND` },
                      { label: "Reward / Winner", value: `${rewardFmt} OKBOND` },
                      { label: "Lock Duration", value: lockDuration ? `${Math.round(lockDuration / 86400)}d` : "—" },
                    ].map((s) => (
                      <div key={s.label} className="glass-card rounded-2xl border border-border p-5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
                        <p className="text-xl font-bold text-primary font-mono">{loading ? "…" : s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card rounded-2xl border border-border p-6">
                    <p className="text-sm font-semibold text-foreground mb-4">Lottery Status</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`w-3 h-3 rounded-full ${winnersSelected ? "bg-purple-400" : lotteryStarted ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                      <span className="font-bold text-lg">{winnersSelected ? "Complete" : lotteryStarted ? "Active" : "Pending"}</span>
                    </div>
                    {endMs && !cd.expired && (
                      <div className="flex gap-3 mt-2">
                        {[{ v: cd.d, l: "Days" }, { v: cd.h, l: "Hours" }, { v: cd.m, l: "Min" }, { v: cd.s, l: "Sec" }].map(({ v, l }) => (
                          <div key={l} className="text-center px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="font-mono font-extrabold text-primary text-2xl leading-none">{String(v).padStart(2, "0")}</p>
                            <p className="text-[10px] text-muted-foreground uppercase mt-1">{l}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Close Lottery Panel */}
                  <div className="glass-card rounded-2xl border border-red-500/20 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                        <PowerOff className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Close / Stop Lottery</p>
                        <p className="text-xs text-muted-foreground">Lottery band karo — winners on-chain draw honge</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-muted/10 border border-border">
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Status</p>
                        <p className="font-bold text-foreground">
                          {winnersSelected ? "✅ Already Closed" : lotteryStarted ? "🟢 Active" : "⚫ Not Started"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/10 border border-border">
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Timer</p>
                        <p className={`font-bold ${cd.expired ? "text-green-400" : "text-yellow-400"}`}>
                          {!lotteryStarted ? "—" : cd.expired ? "Expired ✓" : `${cd.d}d ${cd.h}h ${cd.m}m remaining`}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/10 border border-border">
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">On Close</p>
                        <p className="font-bold text-foreground">5 Winners Selected</p>
                      </div>
                    </div>

                    {closePhase === "success" && (
                      <div className="text-green-400 text-xs p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Lottery successfully closed!
                        {closeTx && (
                          <a href={`${EXPLORER}/tx/${closeTx}`} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 hover:text-green-300">
                            View Tx <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                    {closePhase === "failed" && (
                      <div className="text-red-400 text-xs p-3 rounded-xl bg-red-500/5 border border-red-500/20">{closeErr}</div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => lotteryStarted && !winnersSelected && cd.expired ? handleForceClose() : setShowCloseConfirm(true)}
                        disabled={!isPolygon || closePhase === "pending" || !lotteryStarted || winnersSelected}
                        className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                          ${!lotteryStarted || winnersSelected ? "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-border"
                            : closePhase === "pending" ? "bg-red-500/20 text-red-400/50 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"}`}
                      >
                        {closePhase === "pending"
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Closing Lottery…</>
                          : winnersSelected
                          ? <><Square className="w-4 h-4 fill-current" /> Lottery Already Closed</>
                          : cd.expired
                          ? <><PowerOff className="w-4 h-4" /> Close & Select Winners</>
                          : <><PowerOff className="w-4 h-4" /> Force Close (Early)</>}
                      </button>
                    </div>

                    {!winnersSelected && lotteryStarted && (
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        {cd.expired
                          ? "Timer expire ho gaya hai — ye normal close hai, confirm dialog nahi aayega."
                          : "Timer abhi bhi chal raha hai — Force Close karne se confirm dialog aayega. Blockchain contract mein timer check hoga."}
                      </p>
                    )}
                  </div>

                  <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" /> View contract on Polygonscan
                  </a>
                </motion.div>
              )}

              {/* ── PLAYERS tab ──────────────────────────────────────────── */}
              {tab === "players" && (
                <motion.div key="players" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-foreground">Players <span className="text-primary">Registry</span></h2>
                      <p className="text-muted-foreground text-sm mt-0.5">{players.length} participant{players.length !== 1 ? "s" : ""} in current lottery</p>
                    </div>
                    <button onClick={fetchPlayers} disabled={playersLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                      <RefreshCw className={`w-4 h-4 ${playersLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>

                  {playersLoading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm">Loading player data from chain…</span>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="glass-card rounded-2xl border border-border p-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No players have entered yet.</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl border border-border overflow-hidden">
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-xs text-muted-foreground uppercase tracking-wider font-semibold border-b border-border px-5 py-3 bg-muted/10">
                        <span className="w-10">#</span>
                        <span>Wallet Address</span>
                        <span className="text-right pr-6">Deposit</span>
                        <span className="text-right">Status</span>
                      </div>
                      <div className="divide-y divide-border/50 max-h-[480px] overflow-y-auto">
                        {players.map((p, i) => (
                          <motion.div key={p.address}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-5 py-3.5 hover:bg-primary/5 transition-colors">
                            <span className="w-10 text-xs text-muted-foreground/60 font-mono">{i + 1}</span>
                            <a href={`${EXPLORER}/address/${p.address}`} target="_blank" rel="noopener noreferrer"
                              className="font-mono text-sm text-primary/80 hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                              {short(p.address)}
                              <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
                            </a>
                            <span className="text-sm font-bold text-foreground pr-6 text-right font-mono">
                              {parseFloat(formatUnits(p.deposit, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })} OKBOND
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.isWinner ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" : "bg-muted/20 text-muted-foreground border border-border"}`}>
                              {p.isWinner ? "🏆 Winner" : "Active"}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="border-t border-border px-5 py-3 bg-muted/5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {players.filter(p => p.isWinner).length} winner{players.filter(p => p.isWinner).length !== 1 ? "s" : ""} selected
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Total deposited: <span className="text-primary font-mono font-bold">
                            {players.reduce((acc, p) => acc + parseFloat(formatUnits(p.deposit, 18)), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} OKBOND
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TREASURY tab ─────────────────────────────────────────── */}
              {tab === "treasury" && (
                <motion.div key="treasury" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Treasury <span className="text-primary">View</span></h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="glass-gold rounded-2xl border border-primary/15 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-foreground">POL Balance</span>
                        </div>
                        {polPrice && <span className="text-xs text-muted-foreground">@ ${polPrice.toFixed(4)}/POL</span>}
                      </div>
                      <p className="text-4xl font-extrabold text-primary font-mono mb-1">{loading ? "…" : polFmt}</p>
                      <p className="text-sm text-muted-foreground">POL (MATIC)</p>
                      {polUSD && <p className="text-lg font-bold text-foreground/70 mt-2">≈ ${polUSD} USD</p>}
                      {polChange !== null && (
                        <p className={`text-xs mt-1 font-semibold ${polChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                          24h: {polChange >= 0 ? "+" : ""}{polChange.toFixed(2)}%
                        </p>
                      )}
                    </div>

                    <div className="glass-gold rounded-2xl border border-primary/15 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                            <Database className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-foreground">OKBOND Balance</span>
                        </div>
                      </div>
                      <p className="text-4xl font-extrabold text-primary font-mono mb-1">{loading ? "…" : okFmt}</p>
                      <p className="text-sm text-muted-foreground">OKBOND tokens in contract</p>
                    </div>

                    <div className="glass-card rounded-2xl border border-border p-6 md:col-span-2">
                      <p className="text-sm font-bold text-foreground mb-4">Token Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Total Supply", value: loading ? "…" : supplyFmt },
                          { label: "Network", value: "Polygon PoS" },
                          { label: "Standard", value: "ERC-20" },
                          { label: "Decimals", value: "18" },
                        ].map((s) => (
                          <div key={s.label}>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="font-bold text-primary font-mono text-sm">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-3 flex-wrap">
                        <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                          <ExternalLink className="w-3 h-3" /> Lottery Contract
                        </a>
                        <a href={`${EXPLORER}/token/${TOKEN_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border bg-muted/20 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                          <ExternalLink className="w-3 h-3" /> OKBOND Token
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
