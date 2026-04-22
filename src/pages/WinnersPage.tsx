import { useEffect, useState, useCallback } from "react";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Crown, Star, ArrowLeft, ExternalLink, RefreshCw, ShieldCheck,
  Clock, Coins, Users, CheckCircle2, Lock, ChevronDown, ChevronUp, Hash,
} from "lucide-react";
import LOTTERY_ABI from "@/lib/contractABI.json";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/useWallet";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const POLYGON_RPC     = "https://polygon-rpc.com";
const EXPLORER        = "https://polygonscan.com";

interface WinnerEntry {
  rank: number;
  address: string;
  reward: string;
  claimed: boolean;
}

interface RoundData {
  id: number;
  status: "live" | "completed" | "pending";
  startTime: number;
  winnersSelected: boolean;
  playerCount: number;
  rewardPerWinner: string;
  winners: WinnerEntry[];
  totalPot: string;
}

const RANK_META = [
  { title: "Grand Champion",  icon: <Crown  className="w-5 h-5" />, color: "text-yellow-300", glow: "rgba(253,224,71,0.5)" },
  { title: "Sovereign",       icon: <Trophy className="w-5 h-5" />, color: "text-primary",     glow: "rgba(234,179,8,0.4)"  },
  { title: "Elite",           icon: <Star   className="w-5 h-5" />, color: "text-amber-500",   glow: "rgba(245,158,11,0.3)" },
  { title: "Distinguished",   icon: <Star   className="w-4 h-4" />, color: "text-primary/70",  glow: "rgba(234,179,8,0.2)"  },
  { title: "Honoured",        icon: <Star   className="w-4 h-4" />, color: "text-primary/60",  glow: "rgba(234,179,8,0.15)" },
];

function shortAddr(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function formatTs(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

function elapsed(ts: number): string {
  if (!ts) return "";
  const secs = Math.floor(Date.now() / 1000) - ts;
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function WinnersPage() {
  const { address, connect } = useWallet();
  const [round, setRound] = useState<RoundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new JsonRpcProvider(POLYGON_RPC);
      const c = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);

      const [
        winnersSelected,
        started,
        startTimeBN,
        rewardBN,
      ] = await Promise.all([
        c.winnersSelected()      as Promise<boolean>,
        c.lotteryStarted()       as Promise<boolean>,
        c.startTime()            as Promise<bigint>,
        c.rewardPerWinner()      as Promise<bigint>,
      ]);

      const startTime = Number(startTimeBN);
      const rewardPerWinner = formatUnits(rewardBN, 18);

      // Collect players by scanning index
      const players: string[] = [];
      for (let i = 0; ; i++) {
        try {
          const addr: string = await c.players(i);
          players.push(addr);
        } catch { break; }
      }

      // Collect winners
      const winners: WinnerEntry[] = [];
      if (winnersSelected) {
        for (let i = 0; i < 5; i++) {
          try {
            const addr: string = await c.winners(i);
            if (addr === "0x0000000000000000000000000000000000000000") break;
            const claimed: boolean = await c.rewardClaimed(addr);
            winners.push({ rank: i + 1, address: addr, reward: rewardPerWinner, claimed });
          } catch { break; }
        }
      }

      const totalPot = winners.length > 0
        ? (parseFloat(rewardPerWinner) * winners.length).toFixed(2)
        : "—";

      setRound({
        id: 1,
        status: winnersSelected ? "completed" : started ? "live" : "pending",
        startTime,
        winnersSelected,
        playerCount: players.length,
        rewardPerWinner,
        winners,
        totalPot,
      });
      setLastFetch(Date.now());
    } catch (e) {
      console.error("WinnersPage load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusBadge = (status: RoundData["status"]) => {
    if (status === "completed")
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/30 text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
    if (status === "live")
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> Live</span>;
    return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400"><Clock className="w-3.5 h-3.5" /> Pending</span>;
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-28 pb-16 border-b border-primary/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(234,179,8,0.08),transparent)]" />
          {[...Array(30)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-primary/20"
              style={{ width: 2, height: 2, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }} />
          ))}
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative">
          <motion.a href="/" whileHover={{ x: -3 }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Orakzai Bond
          </motion.a>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest"
              animate={{ boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 20px rgba(234,179,8,0.3)", "0 0 0px rgba(234,179,8,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}>
              <Trophy className="w-3.5 h-3.5" />
              On-Chain Winner Records · Polygon PoS
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4">
              Winners{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
                Hall
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Every winner is recorded permanently on Polygon PoS. No edits. No deletions. Pure blockchain transparency.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: <ShieldCheck className="w-3 h-3" />,   label: "Smart Contract Verified",  cls: "text-green-400  border-green-500/25  bg-green-500/8"  },
                { icon: <Lock        className="w-3 h-3" />,   label: "No Manual Control",         cls: "text-purple-400 border-purple-500/25 bg-purple-500/8" },
                { icon: <CheckCircle2 className="w-3 h-3" />,  label: "Blockchain Verified",       cls: "text-blue-400   border-blue-500/25   bg-blue-500/8"   },
                { icon: <Star        className="w-3 h-3" />,   label: "Fully On-chain System",     cls: "text-primary    border-primary/25     bg-primary/8"    },
              ].map((b) => (
                <span key={b.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${b.cls}`}>
                  {b.icon}{b.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 max-w-5xl py-14">

        {/* ── Stats Bar ─────────────────────────────────────────────── */}
        {round && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Rounds",     value: "1",                       icon: <Hash    className="w-4 h-4" />, color: "text-blue-400"   },
              { label: "Total Winners",    value: `${round.winners.length}`, icon: <Trophy  className="w-4 h-4" />, color: "text-primary"    },
              { label: "Total Pot (OKBOND)", value: round.totalPot,          icon: <Coins   className="w-4 h-4" />, color: "text-yellow-300" },
              { label: "Total Players",    value: `${round.playerCount}`,    icon: <Users   className="w-4 h-4" />, color: "text-green-400"  },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                className="p-4 rounded-2xl border border-primary/15 bg-black/40 backdrop-blur text-center">
                <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Round History Table ────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Round History</h2>
              <p className="text-sm text-muted-foreground mt-0.5">All lottery rounds — fully transparent, permanently on-chain</p>
            </div>
            <div className="flex items-center gap-3">
              {lastFetch > 0 && (
                <span className="text-xs text-muted-foreground/60 font-mono hidden sm:block">
                  Updated {elapsed(Math.floor(lastFetch / 1000))}
                </span>
              )}
              <button onClick={load} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/25 bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/15 transition-all disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}#events`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/25 bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/15 transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
                Polygonscan
              </a>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl border border-primary/10 bg-black/30 animate-pulse" />
              ))}
            </div>
          ) : round ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/20 overflow-hidden bg-black/30 backdrop-blur">

              {/* Round header row */}
              <button onClick={() => setExpanded(expanded === round.id ? null : round.id)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-primary/5 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-extrabold text-sm font-mono">R1</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="font-bold text-foreground">Round 1 — Genesis Lottery</span>
                      {statusBadge(round.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      {round.startTime > 0 && <span><Clock className="w-3 h-3 inline mr-1" />{formatTs(round.startTime)}</span>}
                      <span><Users className="w-3 h-3 inline mr-1" />{round.playerCount} players</span>
                      <span><Coins className="w-3 h-3 inline mr-1" />{parseFloat(round.rewardPerWinner).toFixed(2)} OKBOND/winner</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
                    <Trophy className="w-3.5 h-3.5" />
                    {round.winners.length} / 5 winners
                  </div>
                  {expanded === round.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded winner list */}
              <AnimatePresence>
                {expanded === round.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden border-t border-primary/10">

                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-primary/5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="col-span-1">Rank</span>
                      <span className="col-span-5">Wallet Address</span>
                      <span className="col-span-3">Reward</span>
                      <span className="col-span-2">Status</span>
                      <span className="col-span-1 text-right">Verify</span>
                    </div>

                    {round.winners.length > 0 ? (
                      round.winners.map((w, i) => {
                        const meta = RANK_META[Math.min(i, RANK_META.length - 1)];
                        return (
                          <motion.div key={w.address}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="grid grid-cols-12 gap-3 items-center px-6 py-4 border-t border-primary/8 hover:bg-primary/5 transition-colors group">

                            {/* Rank */}
                            <div className="col-span-1 flex items-center gap-1.5">
                              <motion.div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.color}`}
                                animate={{ boxShadow: [`0 0 4px ${meta.glow}`, `0 0 14px ${meta.glow}`, `0 0 4px ${meta.glow}`] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}>
                                {meta.icon}
                              </motion.div>
                            </div>

                            {/* Wallet */}
                            <div className="col-span-5">
                              <p className={`font-mono text-sm font-bold ${meta.color}`}>{meta.title}</p>
                              <p className="font-mono text-xs text-muted-foreground mt-0.5 break-all">
                                <span className="hidden md:inline">{w.address}</span>
                                <span className="md:hidden">{shortAddr(w.address)}</span>
                              </p>
                            </div>

                            {/* Reward */}
                            <div className="col-span-3">
                              <p className="text-sm font-bold text-foreground">
                                {parseFloat(w.reward).toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">Per-winner share</p>
                            </div>

                            {/* Claim status */}
                            <div className="col-span-2">
                              {w.claimed
                                ? <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20"><CheckCircle2 className="w-3 h-3" />Claimed</span>
                                : <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"><Clock className="w-3 h-3" />Pending</span>}
                            </div>

                            {/* Polygonscan link */}
                            <div className="col-span-1 flex justify-end">
                              <a href={`${EXPLORER}/address/${w.address}`} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/50 transition-all group-hover:scale-110">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="px-6 py-10 text-center">
                        {round.status === "live" ? (
                          <div className="space-y-2">
                            <motion.div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center mx-auto"
                              animate={{ boxShadow: ["0 0 6px rgba(234,179,8,0.2)", "0 0 20px rgba(234,179,8,0.5)", "0 0 6px rgba(234,179,8,0.2)"] }}
                              transition={{ duration: 2, repeat: Infinity }}>
                              <Clock className="w-5 h-5 text-yellow-400" />
                            </motion.div>
                            <p className="text-sm font-bold text-foreground">Lottery is Live — Winners Not Yet Selected</p>
                            <p className="text-xs text-muted-foreground">Winners will be selected by the on-chain randomness algorithm at the close of this round.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">No round data available yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Round footer */}
                    <div className="flex items-center justify-between px-6 py-3 bg-black/20 border-t border-primary/8 gap-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500/60" />
                        Contract:{" "}
                        <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                          className="text-primary/60 hover:text-primary transition-colors">
                          {LOTTERY_ADDRESS.slice(0, 12)}…{LOTTERY_ADDRESS.slice(-8)}
                        </a>
                      </div>
                      <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}#events`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary font-mono transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View all events
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">Unable to fetch on-chain data. Please try refreshing.</p>
            </div>
          )}
        </div>

        {/* ── Future Rounds Placeholder ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-dashed border-primary/15 bg-primary/3 p-8 text-center mb-12">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <Hash className="w-5 h-5 text-primary/50" />
          </div>
          <p className="text-sm font-semibold text-foreground/60 mb-1">Round 2, 3, 4… coming soon</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">Each new lottery round will appear here automatically — fully transparent, always on-chain. All round history is permanent and immutable.</p>
        </motion.div>

        {/* ── On-chain Proof Panel ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-primary/15 overflow-hidden bg-black/40 mb-12">
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-primary/5">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                animate={{ boxShadow: ["0 0 4px rgba(234,179,8,0.2)", "0 0 14px rgba(234,179,8,0.6)", "0 0 4px rgba(234,179,8,0.2)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </motion.div>
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">On-chain Proof</span>
            </div>
            <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary font-mono hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              Open on Polygonscan
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-primary/8">
            {[
              { label: "Lottery Contract",   value: LOTTERY_ADDRESS,   link: `${EXPLORER}/address/${LOTTERY_ADDRESS}` },
              { label: "OKBOND Token",        value: TOKEN_ADDRESS,     link: `${EXPLORER}/address/${TOKEN_ADDRESS}`   },
            ].map((c) => (
              <div key={c.label} className="px-6 py-4 bg-black/30">
                <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-1">{c.label}</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary/80 break-all">{c.value}</span>
                  <a href={c.link} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary/40 hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary/8">
            {[
              { label: "Network",    value: "Polygon PoS",    color: "text-purple-400" },
              { label: "Chain ID",   value: "137",            color: "text-blue-400"   },
              { label: "Standard",   value: "ERC-20 / Custom Lottery", color: "text-green-400"  },
              { label: "Custody",    value: "Non-Custodial",  color: "text-primary"    },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className={`text-xs font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center">
          <p className="text-muted-foreground mb-4 text-sm">Want your name on this board?</p>
          <motion.a href="/#lottery" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-extrabold text-background bg-primary hover:brightness-110 shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] transition-all cursor-pointer">
            <Trophy className="w-5 h-5" />
            Enter the Lottery
          </motion.a>
        </motion.div>
      </main>

      {/* ── Footer strip ─────────────────────────────────────────────── */}
      <div className="border-t border-primary/10 py-6 text-center">
        <p className="text-xs text-muted-foreground/50 font-mono">
          OKBOND Lottery · Polygon PoS · Contract{" "}
          <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noopener noreferrer"
            className="text-primary/50 hover:text-primary transition-colors">
            {LOTTERY_ADDRESS.slice(0, 10)}…
          </a>
        </p>
      </div>
    </div>
  );
}
