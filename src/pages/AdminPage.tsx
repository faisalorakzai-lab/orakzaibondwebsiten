import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers";
import { useLocation } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ShieldCheck, Loader2, CheckCircle2, ExternalLink,
  Play, Crown, Users, Coins, Clock, AlertTriangle,
  RefreshCw, Lock, Wallet, ArrowLeft, LayoutDashboard,
  TrendingUp, Database, CreditCard, Layers, Trophy, Check,
  ChevronRight, Activity, ArrowRightLeft, Bell, BellRing,
  BarChart2, Info, CheckCheck, AlertCircle, Zap, X,
  TrendingDown, PieChart as PieIcon, Square, PowerOff, Menu,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import LOTTERY_ABI from "@/lib/contractABI.json";
import ParticleBackground from "@/components/ParticleBackground";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_WALLET    = "0x9b02e2Edd6F58D626aAa91889708dbF39dfa8Cd7";
const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const REFERRAL_CONTRACT = "0x66471251A19D7A862e931340998cADFa9a411E9B";
const EXPLORER        = "https://polygonscan.com";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply( ) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

type TxPhase = "idle" | "pending" | "success" | "failed";
type AdminTab = "dashboard" | "analytics" | "notifications" | "lottery" | "players" | "treasury" | "staking" | "lending" | "community";

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
  { round: "R7", players: 0,  pool: 0,   winners: 0,  prizeEach: 0 },
];

const PIE_COLORS = ["#EAB308", "#CA8A04", "#A16207", "#713F12", "#422006"];

const NAV: { id: AdminTab; label: string; icon: JSX.Element; soon?: boolean; external?: string }[] = [
  { id: "dashboard",     label: "Dashboard",     icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "analytics",     label: "Analytics",     icon: <TrendingUp className="w-4 h-4" /> },
  { id: "notifications", label: "System Alerts", icon: <Bell className="w-4 h-4" /> },
  { id: "lottery",       label: "Lottery",       icon: <Trophy className="w-4 h-4" /> },
  { id: "players",       label: "Players",       icon: <Users className="w-4 h-4" /> },
  { id: "treasury",      label: "Treasury",      icon: <Database className="w-4 h-4" /> },
  { id: "community",     label: "Community Hub", icon: <ShieldCheck className="w-4 h-4" />, external: "/community-hub" },
  { id: "staking",       label: "Staking",       icon: <Layers className="w-4 h-4" />, soon: true },
  { id: "lending",       label: "Lending",       icon: <CreditCard className="w-4 h-4" />, soon: true },
];

export default function AdminPage() {
  const { address, provider, isPolygon, connect, switchToPolygon } = useWallet();
  const [switching, setSwitching] = useState(false);
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [players,         setPlayers]         = useState<PlayerRow[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [playersLoading,  setPlayersLoading]  = useState(false);

  // ── Balances ───────────────────────────────────────────────────────────────
  const [polBal, setPolBal] = useState(0n);
  const [okBal,  setOkBal]  = useState(0n);
  const [supply, setSupply] = useState(0n);

  // ── Prices ─────────────────────────────────────────────────────────────────
  const [polPrice,  setPolPrice]  = useState<number | null>(null);
  const [polChange, setPolChange] = useState<number | null>(null);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const addNotif = (level: NotifLevel, title: string, body: string) => {
    setNotifs(prev => [{ id: makeId(), level, title, body, ts: Date.now(), read: false }, ...prev].slice(0, 50));
  };
  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  // ── Fetch state ────────────────────────────────────────────────────────────
  const fetchState = useCallback(async () => {
    if (!provider || !isPolygon) return;
    setLoading(true);
    try {
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const token    = new Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

      const [started, selected, entry, reward, start, lock, pBal, oBal, tSup] = await Promise.all([
        contract.lotteryStarted(),
        contract.winnersSelected(),
        contract.entryAmount(),
        contract.rewardPerWinner(),
        contract.startTime(),
        contract.lockDuration(),
        provider.getBalance(LOTTERY_ADDRESS),
        token.balanceOf(LOTTERY_ADDRESS),
        token.totalSupply(),
      ]);

      setLotteryStarted(started);
      setWinnersSelected(selected);
      setEntryAmount(entry);
      setRewardPerWinner(reward);
      setStartTime(Number(start));
      setLockDuration(Number(lock));
      setPolBal(pBal);
      setOkBal(oBal);
      setSupply(tSup);
    } catch (err) {
      console.error("Fetch error:", err);
      addNotif("error", "Fetch Failed", parseErr(err));
    } finally {
      setLoading(false);
    }
  }, [provider, isPolygon]);

  const fetchPlayers = useCallback(async () => {
    if (!provider || !isPolygon) return;
    setPlayersLoading(true);
    try {
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const addrs = await fetchAllPlayers(contract);
      const rows: PlayerRow[] = await Promise.all(addrs.map(async (a) => {
        const [dep, win] = await Promise.all([
          contract.playerDeposits(a),
          contract.isWinner(a)
        ]);
        return { address: a, deposit: dep, isWinner: win };
      }));
      setPlayers(rows);
    } catch (err) {
      addNotif("error", "Players Fetch Failed", parseErr(err));
    } finally {
      setPlayersLoading(false);
    }
  }, [provider, isPolygon]);

  useEffect(() => {
    if (address && isPolygon) {
      fetchState();
      // Fetch price
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd&include_24hr_change=true")
        .then(r => r.json())
        .then(d => {
          setPolPrice(d["matic-network"].usd);
          setPolChange(d["matic-network"].usd_24h_change);
        })
        .catch(() => {});
    }
  }, [address, isPolygon, fetchState]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const [txPhase, setTxPhase] = useState<TxPhase>("idle");
  const [txMsg,   setTxMsg]   = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleForceClose = async () => {
    setShowCloseConfirm(false);
    if (!provider) return;
    setTxPhase("pending");
    setTxMsg("Broadcasting force close transaction...");
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await contract.selectWinners();
      setTxMsg("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setTxPhase("success");
      setTxMsg("Lottery closed successfully.");
      addNotif("success", "Lottery Closed", "Force close transaction confirmed on-chain.");
      fetchState();
    } catch (err) {
      setTxPhase("failed");
      setTxMsg(parseErr(err));
      addNotif("error", "Close Failed", parseErr(err));
    }
  };

  // ── Formatting ─────────────────────────────────────────────────────────────
  const polFmt = formatUnits(polBal, 18);
  const okFmt  = formatUnits(okBal, 18);
  const entryFmt = formatUnits(entryAmount, 18);
  const rewardFmt = formatUnits(rewardPerWinner, 18);
  const supplyFmt = formatUnits(supply, 18);
  const polUSD = polPrice ? (Number(polFmt) * polPrice).toFixed(2) : null;

  const currentPlayers = players.length;
  const chartData = ROUND_HISTORY.map((r, i) => i === 6 ? { ...r, players: currentPlayers, pool: Number(okFmt) } : r);

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "Just now";
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
          {isAdmin && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
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
          <>
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                />
              )}
            </AnimatePresence>

            {/* Sidebar Content */}
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-64 glass-dark border-r border-border/50 py-6 px-3 flex flex-col gap-1 transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-56
              ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
              <div className="flex items-center justify-between mb-6 px-3 md:hidden">
                <div className="flex items-center gap-2">
                  <img src="/okbond-logo.png" alt="Logo" className="w-6 h-6 rounded-full" />
                  <span className="font-bold text-sm">Admin Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold px-3 mb-2">Modules</p>
              {NAV.map((n) => {
                const content = (
                  <>
                    {n.icon}
                    <span className="flex-1">{n.label}</span>
                    {n.id === "notifications" && unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {n.soon && <span className="text-[9px] uppercase tracking-widest bg-muted/30 text-muted-foreground/60 px-1.5 py-0.5 rounded font-bold">Soon</span>}
                    {!n.soon && tab === n.id && !n.soon && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
                  </>
                );

                if (n.external) {
                  return (
                    <a
                      key={n.id}
                      href={n.external}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent cursor-pointer"
                    >
                      {content}
                    </a>
                  );
                }

                return (
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
                    {content}
                  </button>
                );
              })}

              <div className="mt-auto px-3 pt-4 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1">Contract</p>
                <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-mono text-primary/50 hover:text-primary transition-colors">
                  {LOTTERY_ADDRESS.slice(0, 12)}… <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </aside>
          </>
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
                <Wallet className="w-5 h-5" /> Connect Wallet
              </button>
            </motion.div>
          )}

          {/* Connected but not admin */}
          {address && !isAdmin && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="glass-dark border border-red-500/20 rounded-3xl p-12 text-center mt-8 max-w-xl mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-foreground mb-2">Access Denied</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Wallet <code>{short(address)}</code> is not authorized for this console.
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

                  {/* Main grid */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Status card */}
                    <div className="lg:col-span-2 glass-gold rounded-3xl border border-primary/15 p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap className="w-32 h-32 text-primary" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                          <div className={`w-2.5 h-2.5 rounded-full ${lotteryStarted ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                            {lotteryStarted ? "Lottery Active" : "Lottery Inactive"}
                          </span>
                        </div>
                        <h3 className="text-4xl font-black text-foreground mb-4">
                          {lotteryStarted ? "Round is LIVE" : "Ready to Start"}
                        </h3>
                        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                          {lotteryStarted
                            ? "Players are currently entering the pool. You can monitor entries in real-time or force close the round if needed."
                            : "The contract is idle. You can initiate a new round from the Lottery Control tab."}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button onClick={() => setTab("lottery")}
                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
                            Manage Lottery <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => setTab("analytics")}
                            className="px-6 py-3 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-all">
                            View Analytics
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="space-y-4">
                      <div className="glass-card rounded-2xl border border-border p-6">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" /> Quick Actions
                        </h4>
                        <div className="space-y-2">
                          <button onClick={fetchState} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-xs font-medium group">
                            <span>Refresh On-Chain Data</span>
                            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-primary ${loading ? "animate-spin" : ""}`} />
                          </button>
                          <button onClick={() => setTab("players")} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-xs font-medium group">
                            <span>View Player Registry</span>
                            <Users className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                          </button>
                          <button onClick={() => setTab("notifications")} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-xs font-medium group">
                            <span>System Logs</span>
                            <Bell className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                          </button>
                        </div>
                      </div>

                      <div className="glass-card rounded-2xl border border-border p-6">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-400" /> Security
                        </h4>
                        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                          <p className="text-[10px] text-green-400/80 leading-relaxed">
                            Owner-only access verified. Session is encrypted and secured via Polygon PoS.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        icon: <Database className="w-4 h-4" />, label: "Prize Pool", value: loading ? "—" : `${okFmt}`,
                        sub: "OKBOND tokens", trend: null,
                      },
                      {
                        icon: <TrendingUp className="w-4 h-4" />, label: "Entry Fee", value: loading ? "—" : `${entryFmt}`,
                        sub: "OKBOND", trend: null,
                      },
                      {
                        icon: <Activity className="w-4 h-4" />, label: "Network", value: "Polygon",
                        sub: "Mainnet", trend: null,
                      },
                    ].map((s) => (
                      <div key={s.label} className="glass-card rounded-2xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-primary/60">{s.icon}</div>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-lg font-extrabold text-foreground font-mono">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-3xl border border-border p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-foreground">Player Participation</h3>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-[10px] text-muted-foreground">Entries per Round</span>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="round" tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "rgba(15,15,20,0.9)", borderRadius: "12px", border: "1px solid rgba(234,179,8,0.2)", fontSize: "12px" }}
                              itemStyle={{ color: "#EAB308" }}
                            />
                            <Bar dataKey="players" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card rounded-3xl border border-border p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-foreground">Pool Growth</h3>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary/40" />
                          <span className="text-[10px] text-muted-foreground">OKBOND Pool</span>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorPool" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="round" tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "rgba(15,15,20,0.9)", borderRadius: "12px", border: "1px solid rgba(234,179,8,0.2)", fontSize: "12px" }}
                            />
                            <Area type="monotone" dataKey="pool" stroke="#EAB308" fillOpacity={1} fill="url(#colorPool)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
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
                      <button onClick={markAllRead} className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
                        Mark all read
                      </button>
                      <button onClick={() => setNotifs([])} className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-red-400/70 hover:text-red-400 hover:border-red-500/30 transition-all">
                        Clear logs
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notifs.length === 0 ? (
                      <div className="glass-card rounded-3xl border border-border p-16 text-center">
                        <CheckCheck className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                        <p className="text-muted-foreground">No system alerts at this time.</p>
                      </div>
                    ) : (
                      notifs.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`glass-card rounded-2xl border p-4 flex gap-4 items-start transition-all ${n.read ? "border-border opacity-60" : "border-primary/20 bg-primary/5"}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            n.level === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                            n.level === "warning" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                            n.level === "error"   ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}>
                            {n.level === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                             n.level === "warning" ? <AlertTriangle className="w-5 h-5" /> :
                             n.level === "error"   ? <AlertCircle className="w-5 h-5" /> :
                             <Info className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm text-foreground truncate">{n.title}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(n.ts)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
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
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${lotteryStarted ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {lotteryStarted ? "Active" : "Inactive"}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${winnersSelected ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/10 border-border text-muted-foreground"}`}>
                        {winnersSelected ? "Winners Selected" : "Pending Selection"}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Start Time</span>
                        <span className="text-xs font-mono text-foreground">{startTime ? new Date(startTime * 1000).toLocaleString() : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Contract Address</span>
                        <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
                          {short(LOTTERY_ADDRESS)} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl border border-border p-6">
                      <h3 className="text-sm font-bold text-foreground mb-4">Round Management</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowCloseConfirm(true)}
                          disabled={!lotteryStarted || loading}
                          className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        >
                          <PowerOff className="w-4 h-4" /> Force Close Round
                        </button>
                        <p className="text-[10px] text-muted-foreground text-center px-4">
                          Force closing will trigger winner selection on-chain. Use only if timer is stuck or emergency.
                        </p>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-border p-6">
                      <h3 className="text-sm font-bold text-foreground mb-4">Transaction Status</h3>
                      <div className={`p-4 rounded-xl border ${
                        txPhase === "pending" ? "bg-primary/5 border-primary/20" :
                        txPhase === "success" ? "bg-green-500/5 border-green-500/20" :
                        txPhase === "failed"  ? "bg-red-500/5 border-red-500/20" :
                        "bg-muted/10 border-border"
                      }`}>
                        <div className="flex items-center gap-3">
                          {txPhase === "pending" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                          {txPhase === "success" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          {txPhase === "failed"  && <AlertCircle className="w-4 h-4 text-red-400" />}
                          {txPhase === "idle"    && <Clock className="w-4 h-4 text-muted-foreground" />}
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            txPhase === "pending" ? "text-primary" :
                            txPhase === "success" ? "text-green-400" :
                            txPhase === "failed"  ? "text-red-400" :
                            "text-muted-foreground"
                          }`}>
                            {txPhase === "idle" ? "No Active Transaction" : txPhase}
                          </span>
                        </div>
                        {txMsg && <p className="text-[10px] text-muted-foreground mt-2 font-mono leading-relaxed">{txMsg}</p>}
                      </div>
                    </div>
                  </div>
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
                    <div className="glass-card rounded-3xl border border-border p-20 text-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Scanning blockchain for entries...</p>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="glass-card rounded-3xl border border-border p-20 text-center">
                      <Users className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                      <p className="text-muted-foreground">No players have entered this round yet.</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/20">
                              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Address</th>
                              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Deposit</th>
                              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Explorer</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {players.map((p, i) => (
                              <motion.tr
                                key={p.address}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                className="hover:bg-muted/10 transition-colors"
                              >
                                <td className="px-6 py-4 font-mono text-xs text-foreground">{p.address}</td>
                                <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{formatUnits(p.deposit, 18)} OKBOND</td>
                                <td className="px-6 py-4">
                                  {p.isWinner ? (
                                    <span className="flex items-center gap-1.5 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                                      <Crown className="w-3 h-3" /> Winner
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Participant</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <a href={`${EXPLORER}/address/${p.address}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <ExternalLink className="w-4 h-4 ml-auto" />
                                  </a>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      This list shows players retrieved from the <code>players[]</code> array in the contract. Deposits are fetched individually for each address.
                    </p>
                  </div>
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
