import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { TrendingUp, Users, Coins, Activity, Zap } from "lucide-react";
import LOTTERY_ABI from "@/lib/contractABI.json";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const ERC20_SUPPLY_ABI = [
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
}

async function countPlayers(contract: Contract, cap = 500): Promise<number> {
  let lo = 0, hi = cap;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    try { await contract.players(mid); lo = mid; }
    catch { hi = mid - 1; }
  }
  try { await contract.players(lo); return lo + 1; }
  catch { return 0; }
}

interface Props {
  provider: BrowserProvider | null;
}

export default function StatsStrip({ provider }: Props) {
  const [stats, setStats] = useState<StatItem[]>([
    { icon: <Coins className="w-3.5 h-3.5" />, label: "POL in Contract", value: "Loading…" },
    { icon: <Users className="w-3.5 h-3.5" />, label: "Total Players", value: "Loading…" },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "OKBOND Supply", value: "Loading…" },
    { icon: <Activity className="w-3.5 h-3.5" />, label: "Network", value: "Polygon PoS" },
    { icon: <Zap className="w-3.5 h-3.5" />, label: "Status", value: "Live" },
  ]);

  const fetchLive = useCallback(async () => {
    // Use connected wallet provider. Without a wallet, window.ethereum may also work.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    const rpcProvider = provider ?? (eth ? new BrowserProvider(eth) : null);
    if (!rpcProvider) return; // no provider available, keep static defaults
    try {
      const Lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, rpcProvider);
      const token   = new Contract(TOKEN_ADDRESS, ERC20_SUPPLY_ABI, rpcProvider);

      const [polBal, supply, players] = await Promise.all([
        rpcProvider.getBalance(LOTTERY_ADDRESS),
        token.totalSupply() as Promise<bigint>,
        countPlayers(Lottery),
      ]);

      const polFmt = parseFloat(formatUnits(polBal, 18)).toLocaleString(undefined, { maximumFractionDigits: 3 });
      const supplyFmt = (parseFloat(formatUnits(supply, 18)) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "M";

      setStats([
        { icon: <Coins className="w-3.5 h-3.5" />, label: "POL in Contract", value: `${polFmt} POL`, change: "live" },
        { icon: <Users className="w-3.5 h-3.5" />, label: "Total Players", value: String(players), change: "live" },
        { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "OKBOND Supply", value: supplyFmt, change: "live" },
        { icon: <Activity className="w-3.5 h-3.5" />, label: "Network", value: "Polygon PoS" },
        { icon: <Zap className="w-3.5 h-3.5" />, label: "Lottery", value: "Active" },
      ]);
    } catch {
      setStats((prev) => prev.map((s) => ({ ...s, value: s.value === "Loading…" ? "—" : s.value })));
    }
  }, [provider]);

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, [fetchLive]);

  // Duplicate for seamless marquee
  const items = [...stats, ...stats];

  return (
    <div className="w-full overflow-hidden border-b border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background relative">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-0 py-2.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {items.map((stat, i) => (
          <div key={i} className="flex items-center gap-6 px-8">
            <div className="flex items-center gap-2">
              <span className="text-primary/60">{stat.icon}</span>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{stat.label}:</span>
              <span className="text-xs font-bold text-primary font-mono whitespace-nowrap">{stat.value}</span>
              {stat.change === "live" && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </span>
              )}
            </div>
            <div className="w-px h-3 bg-primary/15" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
