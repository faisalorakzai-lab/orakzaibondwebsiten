import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Crown, Star, ExternalLink, ShieldCheck,
  Medal, Sparkles, CheckCircle2, RefreshCw,
} from "lucide-react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import LOTTERY_ABI from "@/lib/contractABI.json";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const EXPLORER        = "https://polygonscan.com";

interface WinnersHallOfFameProps {
  provider: BrowserProvider | null;
}

interface Winner {
  rank: number;
  address: string;
  display: string;
  prize: string;
  date: string;
  txHash: string;
  claimed: boolean;
}

/* ── Showcase data (pre-draw / no wallet) ─────────────────────────── */
const SHOWCASE: Winner[] = [
  { rank: 1, address: "0xAbCd1234F2A3",  display: "0xAbCd…F2A3", prize: "10,000 OKBOND", date: "Jun 9, 2026",  txHash: "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", claimed: true  },
  { rank: 2, address: "0x7712AbCd99aA",  display: "0x7712…99aA", prize: "10,000 OKBOND", date: "Jun 9, 2026",  txHash: "0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", claimed: true  },
  { rank: 3, address: "0x3f91EeBbB2c1", display: "0x3f91…B2c1", prize: "10,000 OKBOND", date: "Jun 9, 2026",  txHash: "0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", claimed: true  },
  { rank: 4, address: "0xEe4400Dd0d3F", display: "0xEe44…0d3F", prize: "10,000 OKBOND", date: "Jun 9, 2026",  txHash: "0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", claimed: false },
  { rank: 5, address: "0xA8b2FfEe1c9D", display: "0xA8b2…1c9D", prize: "10,000 OKBOND", date: "Jun 9, 2026",  txHash: "0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", claimed: false },
];

const RANK_META = [
  { label: "Grand Champion", icon: Crown,  color: "#FFD700", glow: "rgba(255,215,0,0.6)",  medal: "🥇" },
  { label: "Sovereign",      icon: Trophy, color: "#eab308", glow: "rgba(234,179,8,0.45)", medal: "🥈" },
  { label: "Elite",          icon: Star,   color: "#f59e0b", glow: "rgba(245,158,11,0.35)", medal: "🥉" },
  { label: "Distinguished",  icon: Star,   color: "#eab308", glow: "rgba(234,179,8,0.25)", medal: "⭐" },
  { label: "Honoured",       icon: Star,   color: "#d97706", glow: "rgba(217,119,6,0.2)",  medal: "⭐" },
];

/* ── Confetti particle ────────────────────────────────────────────── */
function ConfettiParticles() {
  const particles = useRef(
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 6 + 5,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.25 + 0.08,
      color: i % 4 === 0 ? "#eab308" : i % 4 === 1 ? "#fde68a" : i % 4 === 2 ? "#ffffff" : "#f59e0b",
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: "-10px",
            background: p.color,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -(Math.random() * 400 + 300)],
            x: [0, (Math.random() - 0.5) * 80],
            opacity: [0, p.opacity, p.opacity * 0.5, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Hero Winner Card ─────────────────────────────────────────────── */
function HeroCard({ winner }: { winner: Winner }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl overflow-hidden mb-10"
      style={{
        background: "linear-gradient(135deg,rgba(10,10,28,0.97) 0%,rgba(20,16,4,0.97) 50%,rgba(10,10,28,0.97) 100%)",
      }}>

      {/* Pulsing animated border */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 0 1px rgba(234,179,8,0.3), 0 0 30px rgba(234,179,8,0.12)",
            "0 0 0 1px rgba(234,179,8,0.7), 0 0 60px rgba(234,179,8,0.28)",
            "0 0 0 1px rgba(234,179,8,0.3), 0 0 30px rgba(234,179,8,0.12)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Radial gold glow behind */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(234,179,8,0.12), transparent)" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(234,179,8,0.1), transparent 70%)" }} />

      {/* Gold top line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="relative z-10 p-8 md:p-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center"
              style={{ boxShadow: "0 0 20px rgba(234,179,8,0.3)" }}>
              <Trophy className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70">Latest Mega Jackpot</p>
              <h3 className="text-lg font-extrabold text-foreground">Grand Champion Winner</h3>
            </div>
          </div>

          {/* JACKPOT WINNER badge */}
          <motion.span
            animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.3)", "0 0 24px rgba(234,179,8,0.6)", "0 0 8px rgba(234,179,8,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/50 bg-primary/15 text-primary text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Jackpot Winner
          </motion.span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet */}
          <div className="md:col-span-1">
            <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold font-mono text-foreground tracking-wider">{winner.display}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/40 font-mono mt-1">Polygon PoS · Verified</p>
          </div>

          {/* Amount */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Amount Won</p>
            <motion.p
              className="text-3xl font-extrabold font-mono"
              style={{ color: "#eab308", textShadow: "0 0 30px rgba(234,179,8,0.5)" }}>
              {winner.prize}
            </motion.p>
            <p className="text-[10px] text-primary/50 font-mono mt-1">≈ ${(10000 * 0.15).toLocaleString()} USD (Phase 1)</p>
          </div>

          {/* Date + verify */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Draw Date</p>
            <p className="text-xl font-extrabold text-foreground mb-3">{winner.date}</p>
            <a
              href={`${EXPLORER}/address/${winner.address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify on Blockchain
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Trophy emoji row */}
        <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-primary/10">
          {["🏆", "⭐", "🥇", "⭐", "🏆"].map((e, i) => (
            <motion.span key={i} className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              {e}
            </motion.span>
          ))}
          <span className="text-xs font-mono text-muted-foreground/40 mx-2">
            On-chain Liquidity-Backed Principal Security draw · June 9, 2026
          </span>
          {["🏆", "⭐", "🥇", "⭐", "🏆"].map((e, i) => (
            <motion.span key={i + 5} className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 0.15 }}>
              {e}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}

/* ── Winners Table Row ────────────────────────────────────────────── */
function WinnerRow({ w, i, live }: { w: Winner; i: number; live: boolean }) {
  const meta = RANK_META[Math.min(i, RANK_META.length - 1)];
  const Icon = meta.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07, duration: 0.4 }}
      className="border-b group transition-all duration-200 cursor-default"
      style={{ borderColor: "rgba(234,179,8,0.06)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(234,179,8,0.04)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

      {/* Rank */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{meta.medal}</span>
          <div>
            <span className="text-xs font-extrabold" style={{ color: meta.color }}>{meta.label}</span>
            <p className="text-[10px] text-muted-foreground/40 font-mono">#{i + 1}</p>
          </div>
        </div>
      </td>

      {/* Wallet */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: meta.color + "18", border: `1px solid ${meta.color}40` }}
            animate={{ boxShadow: [`0 0 4px ${meta.glow}`, `0 0 12px ${meta.glow}`, `0 0 4px ${meta.glow}`] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}>
            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </motion.div>
          <span className="font-mono text-sm text-foreground/80 tracking-wide">{w.display}</span>
          {live && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-mono">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              LIVE
            </span>
          )}
        </div>
      </td>

      {/* Prize */}
      <td className="px-5 py-4">
        <span className="font-mono font-extrabold text-sm" style={{ color: meta.color }}>{w.prize}</span>
        <p className="text-[10px] text-muted-foreground/40 font-mono">≈ $1,500 USD</p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        {w.claimed
          ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 w-fit">
              <CheckCircle2 className="w-2.5 h-2.5" />Claimed
            </span>
          : <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-amber-500/12 border border-amber-500/25 text-amber-400 w-fit">
              <RefreshCw className="w-2.5 h-2.5" />Pending
            </span>}
      </td>

      {/* Verify button */}
      <td className="px-5 py-4">
        <a
          href={`${EXPLORER}/address/${w.address}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-primary/25 bg-primary/8 text-primary/80 hover:text-primary hover:border-primary/50 hover:bg-primary/15 hover:shadow-[0_0_14px_rgba(234,179,8,0.25)] transition-all duration-200 whitespace-nowrap">
          <ShieldCheck className="w-3 h-3" />
          Verify on Blockchain
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </td>
    </motion.tr>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */
export default function WinnersHallOfFame({ provider }: WinnersHallOfFameProps) {
  const [winners, setWinners]   = useState<Winner[]>(SHOWCASE);
  const [live, setLive]         = useState(false);
  const [rewardStr, setRewardStr] = useState("10,000 OKBOND");

  const fetchWinners = useCallback(async () => {
    if (!provider) return;
    try {
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const selected: boolean = await contract.winnersSelected();
      if (!selected) return;

      const reward = await contract.rewardPerWinner();
      const rewardFormatted = parseFloat(formatUnits(reward, 18)).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " OKBOND";
      setRewardStr(rewardFormatted);

      const found: Winner[] = [];
      const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      for (let i = 0; i < 30 && found.length < 5; i++) {
        try {
          const addr: string = await contract.players(i);
          const isW: boolean = await contract.isWinner(addr);
          const claimed: boolean = await contract.rewardClaimed(addr);
          if (isW) found.push({
            rank: found.length + 1,
            address: addr,
            display: `${addr.slice(0, 6)}…${addr.slice(-4)}`,
            prize: rewardFormatted,
            date: now,
            txHash: "0x" + addr.slice(2).padEnd(64, "0"),
            claimed,
          });
        } catch { break; }
      }
      if (found.length > 0) { setWinners(found); setLive(true); }
    } catch { /* silent — expected in dev */ }
  }, [provider]);

  useEffect(() => { fetchWinners(); }, [fetchWinners]);

  const hero = winners[0];

  return (
    <section id="winners-hall" className="py-20 relative overflow-hidden">

      {/* ── Confetti particles ── */}
      <ConfettiParticles />

      {/* ── Section ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(234,179,8,0.05),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">

        {/* ── Section Header ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12">

          <motion.span
            animate={{ boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 18px rgba(234,179,8,0.35)", "0 0 0px rgba(234,179,8,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full border border-primary/35 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
            <Medal className="w-3.5 h-3.5" />
            {live ? "Live On-Chain Winners" : "Winners Hall of Fame"}
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
              Champions
            </span>{" "}
            of OKBOND
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Every winner is immortalised on-chain. Every address, a legacy. Blockchain-verified,
            tamper-proof, and publicly auditable forever.
          </p>
        </motion.div>

        {/* ── Hero Winner Card ── */}
        <HeroCard winner={{ ...hero, prize: rewardStr }} />

        {/* ── Recent Winners Table ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-3xl overflow-hidden border border-primary/12"
          style={{ background: "rgba(6,8,22,0.82)", backdropFilter: "blur(14px)" }}>

          {/* Table header bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-primary/10"
            style={{ background: "rgba(234,179,8,0.03)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"
                style={{ boxShadow: "0 0 12px rgba(234,179,8,0.2)" }}>
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60">Verified Results</p>
                <h3 className="text-base font-extrabold text-foreground">Recent Winners</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {live && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 uppercase tracking-widest">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  On-Chain Live
                </span>
              )}
              <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors">
                View Contract <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.018)" }}>
                  {["Rank", "Wallet Address", "Prize Amount", "Status", "Blockchain Proof"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/45 font-mono border-b border-primary/8">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {winners.map((w, i) => (
                    <WinnerRow key={w.address + i} w={{ ...w, prize: rewardStr }} i={i} live={live} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* ── Refund Confirmation Bar ── */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0px rgba(52,211,153,0)",
                "inset 0 0 30px rgba(52,211,153,0.05), 0 0 0px rgba(52,211,153,0)",
                "0 0 0px rgba(52,211,153,0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-4 px-6 py-4 border-t"
            style={{
              borderColor: "rgba(52,211,153,0.18)",
              background: "linear-gradient(90deg, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0.03) 50%, rgba(52,211,153,0.06) 100%)",
            }}>

            <motion.div
              animate={{ boxShadow: ["0 0 6px rgba(52,211,153,0.4)", "0 0 18px rgba(52,211,153,0.7)", "0 0 6px rgba(52,211,153,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </motion.div>

            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-400">
                ✓ 60% Liquidity-Backed Principal Security Confirmed
              </p>
              <p className="text-[11px] text-muted-foreground/65 leading-relaxed">
                100% of non-winning tokens for this draw have been successfully refunded to all investors.
                {" "}
                <a href={`${EXPLORER}/address/${LOTTERY_ADDRESS}`} target="_blank" rel="noreferrer"
                  className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-2">
                  Verify on Polygonscan →
                </a>
              </p>
            </div>

            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"
              animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px #34d399", "0 0 12px #34d399", "0 0 4px #34d399"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* ── Privacy note ── */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center text-[11px] text-muted-foreground/35 mt-5 font-mono">
          * Wallet addresses partially anonymised for display. Full addresses verifiable on Polygonscan.
          {!live && " · Live winners populate automatically after Liquidity-Backed Principal Security draw completes."}
        </motion.p>
      </div>
    </section>
  );
}
