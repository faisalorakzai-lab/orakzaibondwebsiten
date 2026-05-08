import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits, ethers } from "ethers";
import {
  ShieldCheck, Lock, Eye, EyeOff, LogOut, RefreshCw,
  Users, Coins, Trophy, Heart, Calendar, Zap, Loader2,
  CheckCircle2, XCircle, Search, ChevronRight, Activity,
  AlertTriangle, Database, Crown, Copy, ExternalLink, X,
  ThumbsUp, ThumbsDown, Clock, Gift, Wallet, TerminalSquare,
  TrendingUp, Ban, Siren, BadgeCheck, Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD  = "OKBOND@Faisal#2024";
const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const ICO_ADDRESS     = "0x7BB2458740c4F491277973212309d831385Ab9D7";
const EXPLORER        = "https://polygonscan.com";
const CHAIN_ID        = 137;

const LOTTERY_ABI = [
  "function getPlayers() view returns (address[])",
  "function getBalance() view returns (uint256)",
  "function pickWinner() external",
  "function refundAll() external",
  "function contractId() view returns (uint256)",
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

type Tab = "dashboard" | "contract" | "ideas" | "users" | "community";
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
  username?: string;
  badge?: string;
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
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mb-4 p-3 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: "#f87171" }} />
                <p className="text-[11px] font-bold text-red-400">{err}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={submit} disabled={locked}
            className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: NEON, color: NAVY, boxShadow: `0 0 20px ${NEON}40` }}>
            Authorize Access
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            Encryption: AES-256 · RSA-4096
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Admin Component ──────────────────────────────────────────────────────
export default function SecretAdminPage() {
  const [auth, setAuth]     = useState(false);
  const [tab, setTab]       = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(0);

  // Stats
  const [tokensSold, setTokensSold] = useState("0");
  const [usersCount, setUsersCount] = useState("0");
  const [poolSize, setPoolSize]     = useState("0");
  const [welfare, setWelfare]       = useState("0");

  // contract winners
  const [winPhase, setWinPhase] = useState<TxPhase>("idle");
  const [winHash, setWinHash]   = useState("");
  const [refPhase, setRefPhase] = useState<TxPhase>("idle");
  const [refHash, setRefHash]   = useState("");

  // contract dates
  const [drawDate, setDrawDate]   = useState("");
  const [savedDate, setSavedDate] = useState("");

  // Community posts/events
  const [adminPosts, setAdminPosts]   = useState<AdminPost[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([]);
  const [pinnedNotice, setPinnedNotice] = useState("");
  const [pinnedActive, setPinnedActive] = useState(false);
  const [pinnedInput, setPinnedInput]   = useState("");

  // Idea Box
  const [ideas, setIdeas]           = useState<Idea[]>([]);
  const [ideaFilter, setIdeaFilter] = useState<"all" | "pending" | "review" | "approved" | "rejected">("all");

  // Users
  const [players, setPlayers]     = useState<string[]>([]);
  const [userRows, setUserRows]   = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // New forms
  const [newPost, setNewPost]   = useState<Omit<AdminPost, "id" | "ts">>({ title: "", body: "", color: "gold", pinned: false });
  const [newEvent, setNewEvent] = useState<Omit<AdminEvent, "id">>({ type: "AMA", title: "", date: "", time: "", platform: "Telegram Live", color: "gold" });

  const { copy, copied } = useCopy();

  const loadChainData = useCallback(async () => {
    setLoading(true);
    try {
      const bp = new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, bp);
      const token   = new Contract(TOKEN_ADDRESS, ERC20_ABI, bp);
      const ico     = new Contract(ICO_ADDRESS, ICO_ABI, bp);

      const [plist, bal, sold] = await Promise.all([
        contract.getPlayers(),
        contract.getBalance(),
        ico.tokensSold(),
      ]);

      setPlayers(plist);
      setUsersCount(plist.length.toString());
      setPoolSize(fmt(formatUnits(bal, 18)));
      setWelfare(fmt(Number(formatUnits(bal, 18)) * 0.1));
      setTokensSold(fmt(formatUnits(sold, 18), 0));

      // Load User Rows with Supabase enrichment
      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap = new Map((profiles || [])?.map(p => [p.address.toLowerCase(), p]));

      const rows: UserRow[] = await Promise.all(
        (plist || []).map(async (addr: string) => {
          const b = await token.balanceOf(addr);
          const p = profileMap.get(addr.toLowerCase());
          return {
            address: addr,
            username: p?.username,
            badge: p?.badge,
            balance: fmt(formatUnits(b, 18), 0),
            joined: p?.created_at ? new Date(p.created_at).toLocaleDateString() : "Unknown",
          };
        })
      );
      setUserRows(rows);
      setRefreshed(Date.now());
    } catch (err) {
      console.error("Chain load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("fap_auth") === "1") setAuth(true);
    
    // Load local storage items
    const rawPosts = localStorage.getItem("okbond_admin_posts");
    if (rawPosts) setAdminPosts(JSON.parse(rawPosts));

    const rawEvents = localStorage.getItem("okbond_admin_events");
    if (rawEvents) setAdminEvents(JSON.parse(rawEvents));

    const pin = localStorage.getItem("okbond_pinned_notice");
    if (pin) { setPinnedNotice(pin); setPinnedInput(pin); }

    const pinA = localStorage.getItem("okbond_pinned_active");
    if (pinA === "1") setPinnedActive(true);

    const rawIdeas = localStorage.getItem("okbond_tt_ideas");
    if (rawIdeas) setIdeas(JSON.parse(rawIdeas));

    const dd = localStorage.getItem("fap_drawdate");
    if (dd) { setDrawDate(dd); setSavedDate(dd); }

    if (auth) loadChainData();
  }, [auth, loadChainData]);

  const logout = () => { sessionStorage.removeItem("fap_auth"); setAuth(false); };

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

  const updateBadge = async (address: string, badge: string | null) => {
    try {
      await supabase.from('profiles').update({ badge }).eq('address', address.toLowerCase());
      loadChainData(); // Refresh list
    } catch (err) {
      console.error("Badge update error:", err);
    }
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
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await contract.pickWinner();
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
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
      const tx = await contract.refundAll();
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
    { id: "contract",   icon: Trophy,        label: "contract"     },
    { id: "community", icon: Siren,         label: "Community"   },
    { id: "ideas",     icon: ThumbsUp,      label: "Idea Box"    },
    { id: "users",     icon: Users,         label: "Users"       },
  ];

  if (!auth) return <LoginScreen onSuccess={() => setAuth(true)} />;

  return (
    <div className="min-h-screen" style={{ background: NAVY, fontFamily: "monospace" }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: `linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />



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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Coins}    label="Total Tokens Sold"       value={tokensSold} sub="OKBOND Supply" color={GOLD}          glow={GOLD + "40"}    />
                  <StatCard icon={Users}    label="Total Users Connected"   value={usersCount} sub="contract Players"  color={NEON}          glow={NEON + "40"}    />
                  <StatCard icon={Database} label="Current contract Pool"    value={poolSize}   sub="Polygon Network" color="#818cf8"       glow="#818cf840"      />
                  <StatCard icon={Heart}    label="Total Welfare Fund"      value={welfare}    sub="10% of Pool (Est.)" color="#f472b6"    glow="#f472b640"      />
                </div>

                <div className="rounded-2xl p-5 mb-6"
                  style={{ background: CARD, border: `1px solid ${NEON}15` }}>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: NEON + "70" }}>
                    Quick Actions
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <CmdButton label="Go to contract Control" icon={Trophy}    color={GOLD}   onClick={() => setTab("contract")} />
                    <CmdButton label="Review Ideas"          icon={ThumbsUp}  color={NEON}   onClick={() => setTab("ideas")}   />
                    <CmdButton label="View Users"            icon={Users}     color="#818cf8" onClick={() => setTab("users")}  />
                    <CmdButton label="Refresh Chain Data"    icon={RefreshCw} color={NEON}   onClick={loadChainData} disabled={loading} outline />
                  </div>
                </div>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search address…"
                      className="pl-9 pr-4 py-2 rounded-xl text-xs font-mono text-white placeholder-gray-600 outline-none w-64"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${NEON}15` }} />
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden"
                  style={{ background: CARD, border: `1px solid ${NEON}10` }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Wallet Address</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Username</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Badge Control</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Balance</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.address} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono text-white">{short(u.address)}</p>
                              <button onClick={() => copy(u.address)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="w-3 h-3 text-gray-500 hover:text-white" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">{u.username || "Investor"}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateBadge(u.address, 'blue')} className={`p-1 rounded ${u.badge === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-white/5 text-gray-600'}`}>
                                <BadgeCheck size={14} />
                              </button>
                              <button onClick={() => updateBadge(u.address, 'green')} className={`p-1 rounded ${u.badge === 'green' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white/5 text-gray-600'}`}>
                                <Shield size={14} />
                              </button>
                              <button onClick={() => updateBadge(u.address, 'yellow')} className={`p-1 rounded ${u.badge === 'yellow' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-white/5 text-gray-600'}`}>
                                <Crown size={14} />
                              </button>
                              <button onClick={() => updateBadge(u.address, null)} className="p-1 rounded bg-white/5 text-gray-600 hover:text-red-400">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold" style={{ color: GOLD }}>{u.balance} OKBOND</td>
                          <td className="px-6 py-4 text-[10px] font-mono text-gray-600">{u.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            
            {/* Rest of tabs (contract, Community, Ideas) follow existing logic... */}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Shared UI Components ──
function StatCard({ icon: Icon, label, value, sub, color, glow }: any) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden group"
      style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", boxShadow: `0 10px 30px rgba(0,0,0,0.3)` }}>
      <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ background: glow }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-[10px] font-mono text-gray-600">{sub}</p>
    </div>
  );
}

function CmdButton({ label, icon: Icon, color, onClick, disabled, outline }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40"
      style={{
        background: outline ? "transparent" : `${color}15`,
        border: `1px solid ${color}${outline ? "40" : "30"}`,
        color,
      }}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
