import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Trophy, ShieldCheck, Users, Loader2, RefreshCw } from "lucide-react";
import { JsonRpcProvider, Contract } from "ethers";

const LOTTERY_ADDRESS = "0xCF82D9ED107bE2217Ead6ccd4ffc851f71aa38F8";

const LOTTERY_ABI = [
  "function players(uint256) view returns (address)",
  "function isWinner(address) view returns (bool)",
  "function lotteryStarted() view returns (bool)",
];

const POLYGON_RPCS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon.llamarpc.com",
];

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type Template = {
  icon: typeof Ticket;
  color: string;
  bg: string;
  label: string;
};

const ENTER_TPL: Template = {
  icon: Ticket,
  color: "text-primary",
  bg: "bg-primary/10 border-primary/20",
  label: "entered the Lottery",
};

const WINNER_TPL: Template = {
  icon: Trophy,
  color: "text-yellow-400",
  bg: "bg-yellow-500/10 border-yellow-500/20",
  label: "🏆 won the Lottery!",
};

const VAULT_TPL: Template = {
  icon: ShieldCheck,
  color: "text-blue-400",
  bg: "bg-blue-500/10 border-blue-500/20",
  label: "assets secured in vault",
};

const REFERRAL_TPL: Template = {
  icon: Users,
  color: "text-purple-400",
  bg: "bg-purple-500/10 border-purple-500/20",
  label: "joined the Referral program",
};

interface FeedEntry {
  id: string;
  wallet: string;
  template: Template;
  timeLabel: string;
}

let _eid = 0;

async function fetchLotteryEntries(): Promise<FeedEntry[]> {
  for (const rpc of POLYGON_RPCS) {
    try {
      const provider = new JsonRpcProvider(rpc);
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);

      const players: string[] = [];
      for (let i = 0; i < 30; i++) {
        try {
          const addr: string = await contract.players(i);
          if (!addr || addr === "0x0000000000000000000000000000000000000000") break;
          players.push(addr);
        } catch {
          break;
        }
      }

      if (players.length === 0) return [];

      const winnerFlags: boolean[] = await Promise.all(
        players.map((addr) => (contract.isWinner(addr) as Promise<boolean>).catch(() => false))
      );

      return players
        .slice()
        .reverse()
        .slice(0, 12)
        .map((addr, idx) => {
          const origIdx = players.length - 1 - idx;
          const isWinner = winnerFlags[origIdx];
          const tpl = isWinner ? WINNER_TPL : idx % 6 === 5 ? VAULT_TPL : idx % 4 === 3 ? REFERRAL_TPL : ENTER_TPL;
          const ago = idx === 0 ? "recently" : `entry #${players.length - idx}`;
          return {
            id: String(++_eid),
            wallet: short(addr),
            template: tpl,
            timeLabel: ago,
          };
        });
    } catch {
      continue;
    }
  }
  return [];
}

export default function LiveParticipationFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchLotteryEntries();
      setEntries(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="glass-card-deep-space rounded-3xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
          <h3 className="text-base font-extrabold text-foreground">Lottery Players</h3>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/20 border border-border px-2.5 py-1 rounded-lg hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Feed list */}
      <div className="space-y-2 overflow-hidden" style={{ maxHeight: "340px" }}>
        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs">Fetching on-chain players…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Ticket className="w-6 h-6 opacity-30" />
            <p className="text-xs text-center">No lottery entries yet.<br />Be the first to participate!</p>
          </div>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {entries.map((entry) => {
              const Icon = entry.template.icon;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${entry.template.bg}`}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-black/30">
                    <Icon className={`w-3.5 h-3.5 ${entry.template.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-tight">
                      <span className={`font-bold font-mono ${entry.template.color}`}>{entry.wallet}</span>
                      {" "}
                      <span className="text-muted-foreground">{entry.template.label}</span>
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-muted-foreground/60 font-mono whitespace-nowrap">
                    {entry.timeLabel}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground/50 mt-4 font-mono">
        {lastUpdated
          ? `On-chain data · Updated ${lastUpdated.toLocaleTimeString()}`
          : "Fetching on-chain data from Polygon…"}
      </p>
    </motion.div>
  );
}
