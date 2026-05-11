import { motion } from "framer-motion";
import { useLiveBlockchainData } from "@/hooks/useLiveBlockchainData";
import {
  TrendingUp,
  Users,
  Coins,
  Activity,
  Zap,
  Shield,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

const GOLD = "#D4AF37";
const POLYGONSCAN_BASE = "https://polygonscan.com";

const CONTRACTS = {
  TOKEN: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F",
  ICO: "0x7BB2458740c4F491277973212309d831385Ab9D7",
  VAULT: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08",
  STAKING: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e",
  LOTTERY: "0x5bc55d4b347e39b986864e28604ddca5de6357b7",
  REGISTRY: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3",
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
  contractAddress?: string;
  isLive?: boolean;
}

function MetricCard({
  label,
  value,
  icon,
  isLoading,
  contractAddress,
  isLive,
}: MetricCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openPolygonScan = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contractAddress) {
      window.open(`${POLYGONSCAN_BASE}/address/${contractAddress}`, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative rounded-2xl p-6 border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isLive ? `${GOLD}40` : `${GOLD}20`,
        background: isLive
          ? `linear-gradient(135deg, ${GOLD}08 0%, ${GOLD}04 100%)`
          : `linear-gradient(135deg, ${GOLD}04 0%, ${GOLD}02 100%)`,
        boxShadow: isLive
          ? `0 0 20px ${GOLD}15, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 0 10px ${GOLD}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Animated border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ borderColor: `${GOLD}50` }}
      />

      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${GOLD}15`, color: GOLD }}
            >
              {icon}
            </div>
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: "#888" }}
            >
              {label}
            </span>
          </div>

          {/* Live indicator */}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#22c55e" }}
              />
              <span className="text-[10px] font-mono text-emerald-400">
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 bg-white/5 rounded animate-pulse" />
          ) : value === "0" || value === "0.00" ? (
            <div className="text-2xl font-bold text-white/40">
              On-Chain Sync Pending
            </div>
          ) : (
            <div className="text-3xl font-black text-white font-mono break-words">
              {value}
            </div>
          )}
        </div>

        {/* Contract actions */}
        {contractAddress && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              title="Copy contract address"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" style={{ color: "#22c55e" }} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={openPolygonScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              title="View on PolygonScan"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Verify</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function LiveEcosystemMetrics() {
  const { data, loading, refresh } = useLiveBlockchainData();

  const metrics = [
    {
      label: "Total Supply",
      value: data.totalSupply
        ? parseFloat(data.totalSupply).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : "—",
      icon: <Coins className="w-5 h-5" />,
      contract: CONTRACTS.TOKEN,
      isLive: data.dataInitialized && data.totalSupply !== "0",
    },
    {
      label: "Circulating Supply",
      value: data.circulatingSupply
        ? parseFloat(data.circulatingSupply).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : "—",
      icon: <TrendingUp className="w-5 h-5" />,
      contract: CONTRACTS.TOKEN,
      isLive: data.dataInitialized && data.circulatingSupply !== "0",
    },
    {
      label: "Total Staked",
      value: data.totalStaked
        ? parseFloat(data.totalStaked).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
        : "—",
      icon: <Activity className="w-5 h-5" />,
      contract: CONTRACTS.STAKING,
      isLive: data.dataInitialized && data.totalStaked !== "0",
    },
    {
      label: "Staking Participants",
      value: data.totalStakers || "—",
      icon: <Users className="w-5 h-5" />,
      contract: CONTRACTS.STAKING,
      isLive: data.dataInitialized && data.totalStakers !== "0",
    },
    {
      label: "Vault Reserves",
      value: data.vaultReserves
        ? parseFloat(data.vaultReserves).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
        : "—",
      icon: <Shield className="w-5 h-5" />,
      contract: CONTRACTS.VAULT,
      isLive: data.dataInitialized && data.vaultReserves !== "0",
    },
    {
      label: "Lottery Pool",
      value: data.lotteryPoolBalance
        ? parseFloat(data.lotteryPoolBalance).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
        : "—",
      icon: <Zap className="w-5 h-5" />,
      contract: CONTRACTS.LOTTERY,
      isLive: data.dataInitialized && data.lotteryPoolBalance !== "0",
    },
    {
      label: "ICO Tokens Sold",
      value: data.icoTokensSold
        ? parseFloat(data.icoTokensSold).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : "—",
      icon: <TrendingUp className="w-5 h-5" />,
      contract: CONTRACTS.ICO,
      isLive: data.dataInitialized && data.icoTokensSold !== "0",
    },
    {
      label: "Registry Entries",
      value: data.registryEntriesCount || "—",
      icon: <Activity className="w-5 h-5" />,
      contract: CONTRACTS.REGISTRY,
      isLive: data.dataInitialized && data.registryEntriesCount !== "0",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-2"
              style={{ fontFamily: "'Sora','Inter',sans-serif" }}
            >
              Live Ecosystem Metrics
            </h2>
            <p className="text-white/40 text-base">
              Real-time on-chain data from Polygon blockchain
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
            style={{
              borderColor: `${GOLD}40`,
              background: `${GOLD}08`,
              color: GOLD,
            }}
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-semibold">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <MetricCard
              key={idx}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              isLoading={loading}
              contractAddress={metric.contract}
              isLive={metric.isLive}
            />
          ))}
        </div>

        {/* Last Updated */}
        {data.lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center text-xs text-white/30 font-mono"
          >
            Last updated: {data.lastUpdated.toLocaleTimeString()} •{" "}
            {data.networkStatus === "online" ? (
              <span style={{ color: "#22c55e" }}>● Network Online</span>
            ) : (
              <span style={{ color: "#ef4444" }}>● Network Degraded</span>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
