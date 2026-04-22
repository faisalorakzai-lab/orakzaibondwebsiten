import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits, ethers } from "ethers";
import {
  ShieldCheck, Lock, Eye, EyeOff, LogOut, RefreshCw,
  Users, Coins, Trophy, Heart, Calendar, Zap, Loader2,
  CheckCircle2, XCircle, Search, ChevronRight, Activity,
  AlertTriangle, Database, Crown, Copy, ExternalLink, X,
  ThumbsUp, ThumbsDown, Clock, Gift, Wallet, TerminalSquare,
  TrendingUp, Ban, Siren,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD  = "OKBOND@Faisal#2024";
const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const ICO_ADDRESS     = "0x0134F0ADE4b5e48aCBFF97155691bBC54eBadD16";
const EXPLORER        = "https://polygonscan.com";
const CHAIN_ID        = 137;

const LOTTERY_ABI = [
  "function getPlayers() view returns (address[])",
  "function getBalance() view returns (uint256)",
  "function pickWinner() external",
  "function refundAll() external",
  "function lotteryId() view returns (uint256)",
  "function entryFee() view returns (uint256)",
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];
const ICO_ABI = [
  "function totalRaised() view returns (uint256)",
  "function tokensSold() view returns (uint256)",
];

const NEON   = "#00e676";
const GOLD   = "#EAB308";
const NAVY   = "#020c1b";
const CARD   = "rgba(5,15,35,0.85)";

type Tab = "dashboard" | "lottery" | "ideas" | "users" | "community";
type TxPhase = "idle" | "pending" | "success" | "failed";

interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
  timestamp: number;
  upvotes: number;
  upvotedBy: string[];
  status: "pending" | "review" | "approved" | "rejected";
}

interface UserRow {
  address: string;
  balance: string;
  joined: string;
}

interface AdminPost {
  id: string;
  title: string;
  body: string;
  color: "gold" | "green" | "blue" | "red" | "purple";
  pinned: boolean;
  ts: number;
}

interface AdminEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  platform: string;
  color: "gold" | "violet" | "blue" | "green";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmt   = (n: number | string, d = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

// ── Copy Hook ─────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    setTimeout(() => setCopied(""), 1800);
  };
  return { copy, copied };
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [key, setKey]       = useState("");
  const [show, setShow]     = useState(false);
  const [err, setErr]       = useState("");
  const [shake, setShake]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockSec, setLockSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("fap_lock");
    if (raw) {
      const until = parseInt(raw, 10);
      const now = Date.now();
      if (until > now) {
        setLocked(true);
        setLockSec(Math.ceil((until - now) / 1000));
        timerRef.current = setInterval(() => {
          const rem = Math.ceil((until - Date.now()) / 1000);
          if (rem <= 0) {
            clearInterval(timerRef.current!);
            setLocked(false);
            setLockSec(0);
            sessionStorage.removeItem("fap_lock");
          } else {
            setLockSec(rem);
          }
        }, 1000);
      } else {
        sessionStorage.removeItem("fap_lock");
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const submit = () => {
    if (locked) return;
    if (key === ADMIN_PASSWORD) {
      sessionStorage.setItem("fap_auth", "1");
      onSuccess();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      if (next >= 3) {
        const until = Date.now() + 60_000;
        sessionStorage.setItem("fap_lock", String(until));
        setLocked(true);
        setLockSec(60);
        timerRef.current = setInterval(() => {
          const rem = Math.ceil((until - Date.now()) / 1000);
          if (rem <= 0) {
            clearInterval(timerRef.current!);
            setLocked(false);
            setLockSec(0);
            setAttempts(0);
            sessionStorage.removeItem("fap_lock");
          } else setLockSec(rem);
        }, 1000);
        setErr("Too many failed attempts. Locked for 60 seconds.");
      } else {
        setErr(`Invalid Admin Key. ${3 - next} attempt${3 - next !== 1 ? "s" : ""} remaining.`);
      }
      setKey("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: NAVY }}>

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(0,230,118,0.05),transparent)]" />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg pointer-events-none" style={{ borderColor: NEON + "60" }} />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg pointer-events-none" style={{ borderColor: NEON + "60" }} />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg pointer-events-none" style={{ borderColor: NEON + "60" }} />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg pointer-events-none" style={{ borderColor: NEON + "60" }} />

      {/* Scanning line */}
      <motion.div className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${NEON}40, transparent)` }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />

      <motion.div
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4">

        <div className="rounded-3xl p-8 relative"
          style={{ background: CARD, border: `1px solid ${NEON}25`, boxShadow: `0 0 60px rgba(0,230,118,0.08), 0 30px 60px rgba(0,0,0,0.5)` }}>

          {/* Lock icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ boxShadow: [`0 0 0 0 ${NEON}40`, `0 0 0 20px transparent`] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,230,118,0.05))`, border: `1px solid ${NEON}30` }}>
              {locked
                ? <Ban className="w-9 h-9" style={{ color: "#ef4444" }} />
                : <ShieldCheck className="w-9 h-9" style={{ color: NEON }} />}
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TerminalSquare className="w-3.5 h-3.5" style={{ color: NEON }} />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: NEON }}>
                Restricted Access — Command Center
              </p>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Orakzai Admin Portal</h1>
            <p className="text-xs text-gray-500">Enter your Admin Key to continue</p>
          </div>

          {/* Input */}
          <div className="mb-4 relative">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: NEON + "80" }}>
              Admin Key
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: NEON + "60" }} />
              <input
                type={show ? "text" : "password"}
                value={key}
                disabled={locked}
                onChange={(e) => { setKey(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={locked ? `Locked — ${lockSec}s remaining` : "••••••••••••••••"}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${err ? "#ef444450" : NEON + "25"}`,
                  caretColor: NEON,
                }}
                onFocus={(e) => { e.target.style.borderColor = NEON + "60"; e.target.style.boxShadow = `0 0 0 3px ${NEON}10`; }}
                onBlur={(e) => { e.target.style.borderColor = err ? "#ef444450" : NEON + "25"; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity">
                {show ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {err && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-mono"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {err}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            whileHover={!locked ? { scale: 1.02 } : {}}
            whileTap={!locked ? { scale: 0.98 } : {}}
            onClick={submit}
            disabled={locked || !key}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all"
            style={{
              background: locked || !key
                ? "rgba(255,255,255,0.04)"
                : `linear-gradient(135deg, ${NEON}20, ${NEON}10)`,
              border: `1px solid ${locked || !key ? "rgba(255,255,255,0.06)" : NEON + "50"}`,
              color: locked || !key ? "#4b5563" : NEON,
              boxShadow: locked || !key ? "none" : `0 0 20px ${NEON}20`,
            }}>
            {locked ? `🔒 Locked (${lockSec}s)` : "Authenticate →"}
          </motion.button>

          {/* Warning */}
          <p className="text-center text-[10px] text-gray-700 mt-5 font-mono">
            ⚠ Unauthorized access is strictly prohibited and logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, glow }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; glow: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3, boxShadow: `0 0 30px ${glow}` }}
      className="rounded-2xl p-5 relative overflow-hidden transition-all"
      style={{ background: CARD, border: `1px solid ${color}20` }}>

      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>

      <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
        style={{ color: color + "80" }}>{label}</p>
      <p className="text-2xl font-extrabold font-mono text-white mb-1">{value}</p>
      {sub && <p className="text-[11px] text-gray-500 font-mono">{sub}</p>}
    </motion.div>
  );
}

// ── Tx Status Badge ───────────────────────────────────────────────────────────
function TxBadge({ phase, hash }: { phase: TxPhase; hash?: string }) {
  if (phase === "idle") return null;
  const cfg = {
    pending: { icon: Loader2, label: "Broadcasting…",  color: GOLD,    spin: true  },
    success: { icon: CheckCircle2, label: "Confirmed!", color: NEON,    spin: false },
    failed:  { icon: XCircle,  label: "Failed",        color: "#ef4444", spin: false },
  }[phase];
  const { icon: Ic, label, color, spin } = cfg;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono mt-3"
      style={{ background: `${color}10`, border: `1px solid ${color}30`, color }}>
      <Ic className={`w-4 h-4 flex-shrink-0${spin ? " animate-spin" : ""}`} />
      <span>{label}</span>
      {hash && phase === "success" && (
        <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 ml-auto hover:underline" style={{ color }}>
          View <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────
function CmdButton({ label, icon: Icon, color, onClick, disabled, outline }: {
  label: string; icon: React.ElementType; color: string;
  onClick: () => void; disabled?: boolean; outline?: boolean;
}) {
  return (
    <motion.button whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick} disabled={disabled}
      className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all"
      style={{
        background: disabled ? "rgba(255,255,255,0.04)" : outline ? `${color}12` : `linear-gradient(135deg, ${color}25, ${color}10)`,
        border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : color + "50"}`,
        color: disabled ? "#4b5563" : color,
        boxShadow: disabled ? "none" : `0 0 15px ${color}15`,
      }}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </motion.button>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab]             = useState<Tab>("dashboard");
  const [loading, setLoading]     = useState(false);
  const [refreshed, setRefreshed] = useState(0);

  // Stats
  const [tokensSold, setTokensSold]   = useState("—");
  const [usersCount, setUsersCount]   = useState("—");
  const [poolSize, setPoolSize]       = useState("—");
  const [welfare, setWelfare]         = useState("—");

  // Lottery
  const [drawDate, setDrawDate]   = useState("");
  const [savedDate, setSavedDate] = useState(() => localStorage.getItem("fap_drawdate") || "");
  const [winPhase, setWinPhase]   = useState<TxPhase>("idle");
  const [winHash, setWinHash]     = useState("");
  const [refPhase, setRefPhase]   = useState<TxPhase>("idle");
  const [refHash, setRefHash]     = useState("");
  const [players, setPlayers]     = useState<string[]>([]);

  // Community management
  const [pinnedNotice, setPinnedNotice]   = useState<string>(() => localStorage.getItem("okbond_pinned_notice") || "");
  const [pinnedActive, setPinnedActive]   = useState<boolean>(() => localStorage.getItem("okbond_pinned_active") === "1");
  const [pinnedInput, setPinnedInput]     = useState<string>(() => localStorage.getItem("okbond_pinned_notice") || "");
  const [adminPosts, setAdminPosts]       = useState<AdminPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_posts") || "[]"); } catch { return []; }
  });
  const [adminEvents, setAdminEvents]     = useState<AdminEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_events") || "[]"); } catch { return []; }
  });
  const [newPost, setNewPost] = useState<Omit<AdminPost, "id" | "ts">>({ title: "", body: "", color: "gold", pinned: false });
  const [newEvent, setNewEvent] = useState<Omit<AdminEvent, "id">>({ type: "AMA", title: "", date: "", time: "", platform: "Telegram Live", color: "gold" });

  // Ideas
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_tt_ideas") || "[]"); } catch { return []; }
  });
  const [ideaFilter, setIdeaFilter] = useState<"all" | "pending" | "review" | "approved" | "rejected">("pending");

  // Users
  const [userSearch, setUserSearch] = useState("");
  const [userRows, setUserRows]     = useState<UserRow[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  const { copy, copied } = useCopy();

  // Logout
  const logout = () => {
    sessionStorage.removeItem("fap_auth");
    window.location.reload();
  };

  // Load on-chain data
  const loadChainData = useCallback(async () => {
    setLoading(true);
    try {
      const rpc = new ethers.JsonRpcProvider("https://polygon-rpc.com");

      // Lottery
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, rpc);
      const [bal, pls] = await Promise.allSettled([
        lottery.getBalance(),
        lottery.getPlayers(),
      ]);
      if (bal.status === "fulfilled") {
        setPoolSize(fmt(parseFloat(formatUnits(bal.value, 18)), 4) + " POL");
      }
      if (pls.status === "fulfilled") {
        setPlayers(pls.value as string[]);
        setUsersCount(String((pls.value as string[]).length));
      }

      // Token
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const [sup, dec] = await Promise.allSettled([
        token.totalSupply(),
        token.decimals(),
      ]);
      if (sup.status === "fulfilled" && dec.status === "fulfilled") {
        const total = parseFloat(formatUnits(sup.value, dec.value));
        setTokensSold(fmt(total, 0));
      }

      // Welfare (10% of pool conceptually)
      if (bal.status === "fulfilled") {
        const w = parseFloat(formatUnits(bal.value, 18)) * 0.1;
        setWelfare(fmt(w, 4) + " POL");
      }

      setRefreshed(Date.now());
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadChainData(); }, [loadChainData]);

  // Load user balances from players list
  const loadUserBalances = useCallback(async () => {
    if (!players.length) return;
    setUserLoading(true);
    try {
      const rpc = new ethers.JsonRpcProvider("https://polygon-rpc.com");
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, rpc);
      const dec: number = await token.decimals();
      const rows: UserRow[] = await Promise.all(
        players.slice(0, 50).map(async (addr, i) => {
          try {
            const bal = await token.balanceOf(addr);
            return { address: addr, balance: fmt(parseFloat(formatUnits(bal, dec)), 2), joined: `Player #${i + 1}` };
          } catch {
            return { address: addr, balance: "0", joined: `Player #${i + 1}` };
          }
        })
      );
      setUserRows(rows);
    } catch { /* no-op */ }
    setUserLoading(false);
  }, [players]);

  useEffect(() => {
    if (tab === "users") loadUserBalances();
  }, [tab, loadUserBalances]);

  // Persist ideas
  useEffect(() => {
    localStorage.setItem("okbond_tt_ideas", JSON.stringify(ideas));
  }, [ideas]);

  // Persist community data
  useEffect(() => { localStorage.setItem("okbond_admin_posts", JSON.stringify(adminPosts)); }, [adminPosts]);
  useEffect(() => { localStorage.setItem("okbond_admin_events", JSON.stringify(adminEvents)); }, [adminEvents]);

  const savePinnedNotice = () => {
    localStorage.setItem("okbond_pinned_notice", pinnedInput);
    setPinnedNotice(pinnedInput);
  };
  const togglePinned = (val: boolean) => {
    setPinnedActive(val);
    localStorage.setItem("okbond_pinned_active", val ? "1" : "0");
  };

  const addPost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    setAdminPosts((prev) => [{ ...newPost, id: Date.now().toString(), ts: Date.now() }, ...prev]);
    setNewPost({ title: "", body: "", color: "gold", pinned: false });
  };
  const deletePost = (id: string) => setAdminPosts((prev) => prev.filter((p) => p.id !== id));
  const togglePin = (id: string) => setAdminPosts((prev) => prev.map((p) => p.id === id ? { ...p, pinned: !p.pinned } : p));

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date.trim()) return;
    setAdminEvents((prev) => [...prev, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ type: "AMA", title: "", date: "", time: "", platform: "Telegram Live", color: "gold" });
  };
  const deleteEvent = (id: string) => setAdminEvents((prev) => prev.filter((e) => e.id !== id));

  const updateIdeaStatus = (id: string, status: "pending" | "review" | "approved" | "rejected") => {
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  };

  const getProvider = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const bp = new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const network = await bp.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) throw new Error("Switch to Polygon PoS");
    return bp;
  };

  const pickWinner = async () => {
    setWinPhase("pending"); setWinHash("");
    try {
      const bp = await getProvider();
      const signer = await bp.getSigner();
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await lottery.pickWinner();
      setWinHash(tx.hash);
      await tx.wait();
      setWinPhase("success");
      loadChainData();
    } catch { setWinPhase("failed"); }
  };

  const massRefund = async () => {
    setRefPhase("pending"); setRefHash("");
    try {
      const bp = await getProvider();
      const signer = await bp.getSigner();
      const lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await lottery.refundAll();
      setRefHash(tx.hash);
      await tx.wait();
      setRefPhase("success");
      loadChainData();
    } catch { setRefPhase("failed"); }
  };

  const saveDrawDate = () => {
    if (!drawDate) return;
    localStorage.setItem("fap_drawdate", drawDate);
    setSavedDate(drawDate);
  };

  const filteredIdeas = ideas.filter((i) => ideaFilter === "all" || i.status === ideaFilter);
  const filteredUsers = userRows.filter((u) =>
    !userSearch || u.address.toLowerCase().includes(userSearch.toLowerCase())
  );

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: Activity,      label: "Dashboard"   },
    { id: "lottery",   icon: Trophy,        label: "Lottery"     },
    { id: "community", icon: Siren,         label: "Community"   },
    { id: "ideas",     icon: ThumbsUp,      label: "Idea Box"    },
    { id: "users",     icon: Users,         label: "Users"       },
  ];

  return (
    <div className="min-h-screen" style={{ background: NAVY, fontFamily: "monospace" }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: `linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{ background: "rgba(2,12,27,0.95)", borderBottom: `1px solid ${NEON}15`, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${NEON}15`, border: `1px solid ${NEON}30` }}>
            <ShieldCheck className="w-4 h-4" style={{ color: NEON }} />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: NEON + "70" }}>
              Command Center · Restricted
            </p>
            <p className="text-sm font-extrabold text-white leading-none">Orakzai Admin Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Last refreshed */}
          {refreshed > 0 && (
            <span className="text-[10px] font-mono text-gray-600 hidden md:block">
              Synced {new Date(refreshed).toLocaleTimeString()}
            </span>
          )}
          <button onClick={loadChainData} disabled={loading}
            className="p-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: `${NEON}10`, border: `1px solid ${NEON}20` }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: NEON }} />
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-52 flex-shrink-0 flex flex-col pt-6 px-3"
          style={{ background: "rgba(2,10,22,0.6)", borderRight: `1px solid ${NEON}10` }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-bold uppercase tracking-wider transition-all text-left"
              style={{
                background: tab === id ? `${NEON}12` : "transparent",
                border: `1px solid ${tab === id ? NEON + "30" : "transparent"}`,
                color: tab === id ? NEON : "#4b5563",
              }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {tab === id && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: NEON }} />}
            </button>
          ))}

          <div className="mt-auto pb-6 px-2">
            <div className="rounded-xl p-3" style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}15` }}>
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: GOLD + "70" }}>
                Admin
              </p>
              <p className="text-[10px] font-mono text-gray-400">Faisal Orakzai</p>
              <p className="text-[9px] font-mono text-gray-600">Chairman · OKBOND</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-6 max-w-5xl">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {tab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-white mb-1">Master Statistics</h2>
                  <p className="text-xs font-mono text-gray-500">Live on-chain data — Polygon PoS · Chain ID 137</p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Coins}    label="Total Tokens Sold"       value={tokensSold} sub="OKBOND Supply" color={GOLD}          glow={GOLD + "40"}    />
                  <StatCard icon={Users}    label="Total Users Connected"   value={usersCount} sub="Lottery Players"  color={NEON}          glow={NEON + "40"}    />
                  <StatCard icon={Database} label="Current Lottery Pool"    value={poolSize}   sub="Polygon Network" color="#818cf8"       glow="#818cf840"      />
                  <StatCard icon={Heart}    label="Total Welfare Fund"      value={welfare}    sub="10% of Pool (Est.)" color="#f472b6"    glow="#f472b640"      />
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl p-5 mb-6"
                  style={{ background: CARD, border: `1px solid ${NEON}15` }}>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: NEON + "70" }}>
                    Quick Actions
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <CmdButton label="Go to Lottery Control" icon={Trophy}    color={GOLD}   onClick={() => setTab("lottery")} />
                    <CmdButton label="Review Ideas"          icon={ThumbsUp}  color={NEON}   onClick={() => setTab("ideas")}   />
                    <CmdButton label="View Users"            icon={Users}     color="#818cf8" onClick={() => setTab("users")}  />
                    <CmdButton label="Refresh Chain Data"    icon={RefreshCw} color={NEON}   onClick={loadChainData} disabled={loading} outline />
                  </div>
                </div>

                {/* System Status */}
                <div className="rounded-2xl p-5"
                  style={{ background: CARD, border: `1px solid ${NEON}15` }}>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: NEON + "70" }}>
                    System Status
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Lottery Contract",  addr: LOTTERY_ADDRESS, status: "Active" },
                      { label: "Token Contract",    addr: TOKEN_ADDRESS,   status: "Active" },
                      { label: "ICO Contract",      addr: ICO_ADDRESS,     status: "Phase 1" },
                    ].map((c) => (
                      <div key={c.label} className="rounded-xl p-4"
                        style={{ background: "rgba(0,230,118,0.04)", border: `1px solid ${NEON}15` }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">{c.label}</p>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${NEON}15`, color: NEON }}>{c.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-gray-400 truncate flex-1">{short(c.addr)}</p>
                          <button onClick={() => copy(c.addr)} className="opacity-40 hover:opacity-80 transition-opacity">
                            {copied === c.addr
                              ? <CheckCircle2 className="w-3 h-3" style={{ color: NEON }} />
                              : <Copy className="w-3 h-3 text-gray-400" />}
                          </button>
                          <a href={`${EXPLORER}/address/${c.addr}`} target="_blank" rel="noreferrer"
                            className="opacity-40 hover:opacity-80 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LOTTERY ── */}
            {tab === "lottery" && (
              <motion.div key="lottery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-white mb-1">Lottery Control Center</h2>
                  <p className="text-xs font-mono text-gray-500">Manage lottery draws, winners, and refunds</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                  {/* Set Draw Date */}
                  <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${GOLD}20` }}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}25` }}>
                        <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">Set Next Draw Date</p>
                        <p className="text-[10px] font-mono text-gray-500">Saved to local state</p>
                      </div>
                    </div>

                    {savedDate && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs font-mono"
                        style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, color: GOLD }}>
                        <Clock className="w-3.5 h-3.5" />
                        Current: {new Date(savedDate).toLocaleString()}
                      </div>
                    )}

                    <input type="datetime-local" value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white mb-4 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD}25`,
                        colorScheme: "dark",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = GOLD + "60"; }}
                      onBlur={(e) => { e.target.style.borderColor = GOLD + "25"; }} />

                    <CmdButton label="Save Draw Date" icon={CheckCircle2} color={GOLD}
                      onClick={saveDrawDate} disabled={!drawDate} />
                  </div>

                  {/* Pool Status */}
                  <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${NEON}20` }}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${NEON}15`, border: `1px solid ${NEON}25` }}>
                        <Database className="w-4 h-4" style={{ color: NEON }} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">Pool Status</p>
                        <p className="text-[10px] font-mono text-gray-500">Live from contract</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { label: "Pool Size",    val: poolSize,   c: NEON },
                        { label: "Total Players",val: usersCount, c: "#818cf8" },
                        { label: "Welfare (10%)", val: welfare,   c: "#f472b6" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                          style={{ background: `${r.c}08`, border: `1px solid ${r.c}15` }}>
                          <p className="text-[11px] font-mono text-gray-500">{r.label}</p>
                          <p className="text-sm font-extrabold font-mono" style={{ color: r.c }}>{r.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pick Winner + Mass Refund */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${GOLD}20` }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Crown className="w-5 h-5" style={{ color: GOLD }} />
                      <p className="text-sm font-extrabold text-white">Pick Winner</p>
                    </div>
                    <p className="text-xs font-mono text-gray-500 mb-5">
                      Calls the smart contract RNG to select a random winner from current lottery pool.
                      Requires admin wallet on Polygon PoS.
                    </p>
                    <div className="p-3 rounded-xl mb-4 text-xs font-mono"
                      style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}15`, color: GOLD + "90" }}>
                      ⚠ This action is irreversible. Ensure draw date has passed before proceeding.
                    </div>
                    <CmdButton label="Pick Winner" icon={Crown} color={GOLD}
                      onClick={pickWinner} disabled={winPhase === "pending"} />
                    <TxBadge phase={winPhase} hash={winHash} />
                  </div>

                  <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid rgba(239,68,68,0.2)` }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Gift className="w-5 h-5" style={{ color: "#f87171" }} />
                      <p className="text-sm font-extrabold text-white">Mass Refund</p>
                    </div>
                    <p className="text-xs font-mono text-gray-500 mb-5">
                      Refunds all non-winner players in the current lottery round. Only use if lottery is cancelled or postponed.
                    </p>
                    <div className="p-3 rounded-xl mb-4 text-xs font-mono"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#f8717190" }}>
                      ⚠ This will empty the lottery pool. All players will be refunded.
                    </div>
                    <CmdButton label="Initiate Mass Refund" icon={Ban} color="#f87171"
                      onClick={massRefund} disabled={refPhase === "pending"} />
                    <TxBadge phase={refPhase} hash={refHash} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── COMMUNITY ── */}
            {tab === "community" && (
              <motion.div key="community" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-white mb-1">Community Management</h2>
                  <p className="text-xs font-mono text-gray-500">Control announcements, pinned notices, and events shown on the community page</p>
                </div>

                {/* ── 1. Pinned Notice Banner ── */}
                <div className="rounded-2xl p-6 mb-5" style={{ background: CARD, border: `1px solid ${GOLD}20` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}25` }}>
                        <Siren className="w-4 h-4" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">Pinned Site Notice</p>
                        <p className="text-[10px] font-mono text-gray-500">Gold banner shown at top of Community page</p>
                      </div>
                    </div>
                    {/* Toggle */}
                    <button onClick={() => togglePinned(!pinnedActive)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: pinnedActive ? `${NEON}15` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${pinnedActive ? NEON + "40" : "rgba(255,255,255,0.08)"}`,
                        color: pinnedActive ? NEON : "#4b5563",
                      }}>
                      {pinnedActive ? "● Live" : "○ Off"}
                    </button>
                  </div>
                  <textarea value={pinnedInput} onChange={(e) => setPinnedInput(e.target.value)}
                    rows={2} placeholder="e.g. 🚀 Phase 2 ICO opens June 15 — whitelist now open!"
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none resize-none mb-4 transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD}25`, caretColor: GOLD }}
                    onFocus={(e) => { e.target.style.borderColor = GOLD + "60"; }}
                    onBlur={(e) => { e.target.style.borderColor = GOLD + "25"; }} />
                  <div className="flex items-center gap-3">
                    <CmdButton label="Save & Publish Notice" icon={CheckCircle2} color={GOLD}
                      onClick={savePinnedNotice} disabled={!pinnedInput.trim()} />
                    {pinnedNotice && (
                      <p className="text-[10px] font-mono text-gray-600 truncate flex-1">
                        Current: "{pinnedNotice.slice(0, 60)}{pinnedNotice.length > 60 ? "…" : ""}"
                      </p>
                    )}
                  </div>
                </div>

                {/* ── 2. Admin Announcements ── */}
                <div className="rounded-2xl p-6 mb-5" style={{ background: CARD, border: `1px solid ${NEON}18` }}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${NEON}15`, border: `1px solid ${NEON}25` }}>
                      <TrendingUp className="w-4 h-4" style={{ color: NEON }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">Admin Announcements</p>
                      <p className="text-[10px] font-mono text-gray-500">Posts shown in Community page — visible to all visitors</p>
                    </div>
                  </div>

                  {/* Add post form */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(0,230,118,0.04)", border: `1px solid ${NEON}12` }}>
                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: NEON + "70" }}>New Post</p>
                    <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Announcement title…"
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none mb-2 transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`, caretColor: NEON }} />
                    <textarea rows={2} value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                      placeholder="Write your announcement here…"
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none mb-2 resize-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`, caretColor: NEON }} />
                    <div className="flex items-center gap-3 flex-wrap">
                      <select value={newPost.color} onChange={(e) => setNewPost({ ...newPost, color: e.target.value as AdminPost["color"] })}
                        className="px-3 py-2 rounded-xl text-xs font-mono text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)` }}>
                        <option value="gold">Gold</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="red">Red (Alert)</option>
                        <option value="purple">Purple</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs font-mono text-gray-500 cursor-pointer select-none">
                        <input type="checkbox" checked={newPost.pinned} onChange={(e) => setNewPost({ ...newPost, pinned: e.target.checked })}
                          className="w-3.5 h-3.5 accent-yellow-400" />
                        Pin to top
                      </label>
                      <div className="ml-auto">
                        <CmdButton label="Publish" icon={Zap} color={NEON} onClick={addPost} disabled={!newPost.title.trim() || !newPost.body.trim()} />
                      </div>
                    </div>
                  </div>

                  {/* Existing posts */}
                  {adminPosts.length === 0 ? (
                    <p className="text-xs font-mono text-gray-600 text-center py-4">No announcements yet. Create one above.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminPosts.map((post) => {
                        const postColors: Record<AdminPost["color"], string> = { gold: GOLD, green: NEON, blue: "#60a5fa", red: "#f87171", purple: "#a78bfa" };
                        const c = postColors[post.color];
                        return (
                          <div key={post.id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                            style={{ background: `${c}06`, border: `1px solid ${c}18` }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                {post.pinned && <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>PINNED</span>}
                                <p className="text-sm font-bold text-white truncate">{post.title}</p>
                              </div>
                              <p className="text-xs font-mono text-gray-400 line-clamp-1">{post.body}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => togglePin(post.id)} title="Pin/Unpin"
                                className="p-1.5 rounded-lg opacity-50 hover:opacity-90 transition-opacity text-yellow-400"
                                style={{ background: "rgba(234,179,8,0.08)" }}>
                                <Crown className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deletePost(post.id)}
                                className="p-1.5 rounded-lg opacity-50 hover:opacity-90 transition-opacity"
                                style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── 3. Events Calendar ── */}
                <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid rgba(129,140,248,0.2)` }}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)" }}>
                      <Calendar className="w-4 h-4" style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">Events Calendar</p>
                      <p className="text-[10px] font-mono text-gray-500">Admin events appear alongside defaults on Community page</p>
                    </div>
                  </div>

                  {/* Add event form */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)" }}>
                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: "#818cf8" + "90" }}>New Event</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        placeholder="Type (AMA, LOTTERY…)"
                        className="px-3 py-2 rounded-xl text-xs font-mono text-white placeholder-gray-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                      <input type="text" value={newEvent.platform} onChange={(e) => setNewEvent({ ...newEvent, platform: e.target.value })}
                        placeholder="Platform"
                        className="px-3 py-2 rounded-xl text-xs font-mono text-white placeholder-gray-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                    <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Event title…"
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono text-white placeholder-gray-600 outline-none mb-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="px-3 py-2 rounded-xl text-xs font-mono text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }} />
                      <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="px-3 py-2 rounded-xl text-xs font-mono text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }} />
                    </div>
                    <CmdButton label="Add Event" icon={Calendar} color="#818cf8"
                      onClick={addEvent} disabled={!newEvent.title.trim() || !newEvent.date.trim()} />
                  </div>

                  {/* Existing events */}
                  {adminEvents.length === 0 ? (
                    <p className="text-xs font-mono text-gray-600 text-center py-4">No custom events yet. Add one above.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                          style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                                style={{ background: "rgba(129,140,248,0.2)", color: "#818cf8" }}>{ev.type}</span>
                              <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                            </div>
                            <p className="text-[10px] font-mono text-gray-500">{ev.date} · {ev.time} · {ev.platform}</p>
                          </div>
                          <button onClick={() => deleteEvent(ev.id)}
                            className="p-1.5 rounded-lg ml-3 opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
                            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── IDEA BOX ── */}
            {tab === "ideas" && (
              <motion.div key="ideas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-white mb-1">Think Tank — Idea Management</h2>
                    <p className="text-xs font-mono text-gray-500">
                      {ideas.length} total submissions · Live sync with Community Think Tank
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(["all", "pending", "review", "approved", "rejected"] as const).map((f) => {
                      const colors: Record<string, string> = {
                        all: NEON, pending: GOLD, review: "#818cf8", approved: NEON, rejected: "#f87171",
                      };
                      const active = ideaFilter === f;
                      const c = colors[f];
                      return (
                        <button key={f} onClick={() => setIdeaFilter(f)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                          style={{
                            background: active ? `${c}18` : "transparent",
                            border: `1px solid ${active ? c + "50" : "rgba(255,255,255,0.06)"}`,
                            color: active ? c : "#4b5563",
                          }}>
                          {f === "review" ? "Under Review" : f}
                          <span className="ml-1 opacity-60">
                            ({f === "all" ? ideas.length : ideas.filter((i) => i.status === f).length})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredIdeas.length === 0 ? (
                  <div className="rounded-2xl p-16 text-center"
                    style={{ background: CARD, border: `1px solid ${NEON}15` }}>
                    <ThumbsUp className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: NEON }} />
                    <p className="text-sm font-mono text-gray-500">No ideas in this category.</p>
                    <p className="text-xs font-mono text-gray-700 mt-1">
                      Community submissions appear here from the Think Tank section.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIdeas.map((idea) => {
                      const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
                        pending:  { bg: `${GOLD}12`,                   color: GOLD,      label: "Pending"       },
                        review:   { bg: "rgba(129,140,248,0.12)",       color: "#818cf8", label: "Under Review"  },
                        approved: { bg: `${NEON}12`,                   color: NEON,      label: "Approved"      },
                        rejected: { bg: "rgba(239,68,68,0.10)",         color: "#f87171", label: "Rejected"      },
                      };
                      const sc = statusCfg[idea.status] ?? statusCfg.pending;
                      return (
                        <motion.div key={idea.id} layout
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl p-5"
                          style={{ background: CARD, border: `1px solid rgba(255,255,255,0.06)` }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Status + meta row */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: sc.bg, color: sc.color }}>
                                  {sc.label}
                                </span>
                                {idea.category && (
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>
                                    {idea.category}
                                  </span>
                                )}
                                <span className="text-[9px] font-mono text-gray-600">
                                  {new Date(idea.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-[9px] font-mono text-gray-600">
                                  · ▲ {idea.upvotes} votes
                                </span>
                              </div>
                              {/* Title + description */}
                              <p className="text-sm font-bold text-white mb-1 truncate">{idea.title || "Untitled Idea"}</p>
                              <p className="text-xs font-mono text-gray-400 line-clamp-2 mb-1.5">{idea.description}</p>
                              <p className="text-[10px] font-mono text-gray-600">
                                by {idea.author?.startsWith("0x") ? short(idea.author) : (idea.author || "Anonymous")}
                              </p>
                            </div>

                            {/* Action buttons — always show all 3 actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {idea.status !== "approved" && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => updateIdeaStatus(idea.id, "approved")}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                  style={{ background: `${NEON}12`, border: `1px solid ${NEON}35`, color: NEON }}>
                                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                                </motion.button>
                              )}
                              {idea.status !== "review" && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => updateIdeaStatus(idea.id, "review")}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                  style={{ background: "rgba(129,140,248,0.10)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8" }}>
                                  <Clock className="w-3.5 h-3.5" /> Review
                                </motion.button>
                              )}
                              {idea.status !== "rejected" && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => updateIdeaStatus(idea.id, "rejected")}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                                  <ThumbsDown className="w-3.5 h-3.5" /> Reject
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-white mb-1">Wallet User Table</h2>
                    <p className="text-xs font-mono text-gray-500">
                      {players.length} connected wallet{players.length !== 1 ? "s" : ""} · Polygon PoS
                    </p>
                  </div>
                  <button onClick={loadUserBalances} disabled={userLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: `${NEON}10`, border: `1px solid ${NEON}20`, color: NEON }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${userLoading ? "animate-spin" : ""}`} />
                    Refresh Balances
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by wallet address…"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-mono text-white placeholder-gray-600 outline-none transition-all"
                    style={{ background: CARD, border: `1px solid ${NEON}20`, caretColor: NEON }}
                    onFocus={(e) => { e.target.style.borderColor = NEON + "50"; }}
                    onBlur={(e) => { e.target.style.borderColor = NEON + "20"; }} />
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${NEON}15` }}>
                  {/* Header */}
                  <div className="grid grid-cols-12 px-5 py-3"
                    style={{ background: "rgba(0,230,118,0.05)", borderBottom: `1px solid ${NEON}15` }}>
                    <p className="col-span-1 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600">#</p>
                    <p className="col-span-5 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600">Wallet Address</p>
                    <p className="col-span-4 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600">OKBOND Balance</p>
                    <p className="col-span-2 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600">Actions</p>
                  </div>

                  {userLoading ? (
                    <div className="flex items-center justify-center py-16" style={{ background: CARD }}>
                      <Loader2 className="w-6 h-6 animate-spin mr-3" style={{ color: NEON }} />
                      <span className="text-sm font-mono text-gray-500">Loading balances from chain…</span>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="py-16 text-center" style={{ background: CARD }}>
                      <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: NEON }} />
                      <p className="text-sm font-mono text-gray-500">No players connected yet.</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-16 text-center" style={{ background: CARD }}>
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-20 text-gray-500" />
                      <p className="text-sm font-mono text-gray-500">No results for "{userSearch}".</p>
                    </div>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <motion.div key={u.address} layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-12 px-5 py-3.5 items-center transition-all"
                        style={{
                          background: i % 2 === 0 ? "rgba(0,230,118,0.02)" : "transparent",
                          borderBottom: `1px solid ${NEON}08`,
                        }}>
                        <p className="col-span-1 text-xs font-mono text-gray-600">{i + 1}</p>
                        <div className="col-span-5 flex items-center gap-2">
                          <p className="text-xs font-mono text-gray-300">{short(u.address)}</p>
                          <button onClick={() => copy(u.address)} className="opacity-30 hover:opacity-70 transition-opacity">
                            {copied === u.address
                              ? <CheckCircle2 className="w-3 h-3" style={{ color: NEON }} />
                              : <Copy className="w-3 h-3 text-gray-500" />}
                          </button>
                        </div>
                        <p className="col-span-4 text-sm font-extrabold font-mono" style={{ color: GOLD }}>
                          {u.balance} <span className="text-[10px] font-normal text-gray-600">OKBOND</span>
                        </p>
                        <div className="col-span-2 flex items-center gap-2">
                          <a href={`${EXPLORER}/address/${u.address}`} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity"
                            style={{ background: `${NEON}10` }}>
                            <ExternalLink className="w-3 h-3" style={{ color: NEON }} />
                          </a>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {players.length > 50 && (
                  <p className="text-[10px] font-mono text-gray-600 text-center mt-3">
                    Showing first 50 of {players.length} players.
                  </p>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Entry: Auth Gate ──────────────────────────────────────────────────────────
export default function SecretAdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("fap_auth") === "1");

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }
  return <AdminPanel />;
}
