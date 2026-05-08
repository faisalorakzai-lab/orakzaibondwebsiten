import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { TrendingUp, Users, Coins, Activity, Zap, Shield } from "lucide-react";
import LOTTERY_ABI from "@/lib/contractABI.json";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const GOLD = "#D4AF37";
const ERC20_SUPPLY_ABI = [
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  live?: boolean;
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

interface Props { provider: BrowserProvider | null; }

export default function StatsStrip({ provider }: Props) {
  const [stats, setStats] = useState<StatItem[]>([
    { icon: <Coins className="w-3 h-3" />,     label: "POL Reserve",    value: "—" },
    { icon: <Users className="w-3 h-3" />,     label: "Participants",   value: "—" },
    { icon: <TrendingUp className="w-3 h-3" />, label: "OKBOND Supply", value: "10M" },
    { icon: <Activity className="w-3 h-3" />,  label: "Network",        value: "Polygon PoS" },
    { icon: <Shield className="w-3 h-3" />,    label: "Reserve",        value: "100% Backed" },
    { icon: <Zap className="w-3 h-3" />,       label: "Lottery",        value: "Active",      live: true },
    { icon: <Coins className="w-3 h-3" />,     label: "Phase 1 Price",  value: "$0.15 USDT" },
    { icon: <TrendingUp className="w-3 h-3" />, label: "Listing Target", value: "$1.00 USDT" },
  ]);

  const fetchLive = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    const rpc = provider ?? (eth ? new BrowserProvider(eth) : null);
    if (!rpc) return;
    try {
      const Lottery = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, rpc);
      const token   = new Contract(TOKEN_ADDRESS, ERC20_SUPPLY_ABI, rpc);
      const [polBal, supply, players] = await Promise.all([
        rpc.getBalance(LOTTERY_ADDRESS),
        token.totalSupply() as Promise<bigint>,
        countPlayers(Lottery),
      ]);
      const polFmt     = parseFloat(formatUnits(polBal, 18)).toLocaleString(undefined, { maximumFractionDigits: 3 });
      const supplyFmt  = (parseFloat(formatUnits(supply, 18)) / 1_000_000).toFixed(2) + "M";
      setStats([
        { icon: <Coins className="w-3 h-3" />,     label: "POL Reserve",    value: polFmt + " POL",    live: true },
        { icon: <Users className="w-3 h-3" />,     label: "Participants",   value: String(players),    live: true },
        { icon: <TrendingUp className="w-3 h-3" />, label: "OKBOND Supply", value: supplyFmt },
        { icon: <Activity className="w-3 h-3" />,  label: "Network",        value: "Polygon PoS" },
        { icon: <Shield className="w-3 h-3" />,    label: "Reserve",        value: "100% Backed" },
        { icon: <Zap className="w-3 h-3" />,       label: "Lottery",        value: "Active",           live: true },
        { icon: <Coins className="w-3 h-3" />,     label: "Phase 1 Price",  value: "$0.15 USDT" },
        { icon: <TrendingUp className="w-3 h-3" />, label: "Listing Target", value: "$1.00 USDT" },
      ]);
    } catch { /* keep defaults */ }
  }, [provider]);

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, [fetchLive]);

  const items = [...stats, ...stats];

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{
        background: "transparent",
        borderTop: `1px solid ${GOLD}20`,
        borderBottom: `1px solid ${GOLD}20`,
      }}
    >
      {/* Edge fade — deep black fade, not a background colour */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #050505, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #050505, transparent)" }}
      />

      <motion.div
        className="flex items-center py-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {items.map((stat, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5 px-7">
              <span style={{ color: `${GOLD}55` }}>{stat.icon}</span>
              <span
                className="text-[10px] uppercase tracking-[0.14em] whitespace-nowrap"
                style={{ color: "#444", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.label}
              </span>
              <span
                className="text-[11px] font-bold whitespace-nowrap font-mono"
                style={{ color: GOLD }}
              >
                {stat.value}
              </span>
              {stat.live && (
                <span
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ background: "#22c55e" }}
                />
              )}
            </div>
            {/* Separator — tiny gold diamond */}
            <span
              className="flex-shrink-0 w-[3px] h-[3px] rounded-full"
              style={{ background: `${GOLD}30` }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
