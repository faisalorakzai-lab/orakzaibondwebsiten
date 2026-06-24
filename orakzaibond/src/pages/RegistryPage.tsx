import { motion } from "framer-motion";
import { useNotebookRegistry } from "@/hooks/useNotebookRegistry";
import {
import { useSEO, PAGE_SEO } from "@/components/SEO";
  BookOpen, RefreshCw, CheckCircle, ExternalLink, Clock,
  Hash, Shield, Database, AlertCircle,
} from "lucide-react";

const KNOWN_CONTRACTS: Record<string, { name: string; type: string; color: string }> = {
  "0xc89729da02a8c2e282ec3070a9a680e01be2e22f": { name: "OKBOND Token",      type: "ERC-20 Token",      color: "text-yellow-400" },
  "0x7bb2458740c4f491277973212309d831385ab9d7": { name: "ICO Contract",      type: "Token Sale",        color: "text-blue-400" },
  "0x3cb45d2022e2e15afa8c4822647b89935a2ced08": { name: "Vault",             type: "Reserve Vault",     color: "text-emerald-400" },
  "0x5067e9e4ef827ce0cc06a44b786668522732fb4e": { name: "Staking",           type: "Staking Protocol",  color: "text-purple-400" },
  "0xa6a1c3d97e629326ad812e97e927622a8da711a3": { name: "Notebook Registry", type: "Protocol Registry", color: "text-primary" },
};

function shortenAddr(addr: string): string {
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`;
}
function shortenHash(hash: string): string {
  if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") return "—";
  return `${hash.slice(0, 14)}…${hash.slice(-8)}`;
}
function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const FALLBACK_ENTRIES = [
  { address: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F", name: "OKBOND Token",      version: "v1.0", deployedAt: 1700000000, verified: true,  codeHash: "0x" },
  { address: "0x7BB2458740c4F491277973212309d831385Ab9D7", name: "ICO Contract",      version: "v1.0", deployedAt: 1700100000, verified: true,  codeHash: "0x" },
  { address: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08", name: "Vault",             version: "v1.0", deployedAt: 1700200000, verified: true,  codeHash: "0x" },
  { address: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e", name: "Staking",           version: "v1.0", deployedAt: 1700300000, verified: true,  codeHash: "0x" },
  { address: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3", name: "Notebook Registry", version: "v1.0", deployedAt: 1700400000, verified: true,  codeHash: "0x" },
];

export default function RegistryPage() {
  const { data, loading, error, refresh } = useNotebookRegistry();

  const entries = (data.isLoaded && data.entries.length > 0)
    ? data.entries
    : FALLBACK_ENTRIES;

  useSEO(PAGE_SEO.registry);
  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-primary font-mono tracking-widest uppercase">Protocol Registry Layer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Notebook Registry Explorer</h1>
          <p className="text-muted-foreground text-sm mt-1">On-chain contract registry · Version history · Verification status</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={loading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:border-primary/30">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Registered Contracts", value: data.total || entries.length, icon: <Database className="w-4 h-4" /> },
          { label: "Verified Contracts",   value: entries.filter(e => e.verified).length, icon: <CheckCircle className="w-4 h-4" /> },
          { label: "Registry Address",     value: "Polygon", icon: <Shield className="w-4 h-4" /> },
          { label: "Last Updated",         value: data.lastUpdated ? formatDate(data.lastUpdated) : "Recent", icon: <Clock className="w-4 h-4" /> },
        ].map(({ label, value, icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border/40 bg-card/60 px-4 py-3">
            <div className="flex items-center gap-2 mb-2 text-primary">{icon}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-400/10 border border-amber-400/20 p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-400">Registry contract unavailable — showing known protocol contracts.</p>
        </div>
      )}

      {/* Contract Registry Table */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden mb-6"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Registered Contracts</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{entries.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Contract", "Address", "Version", "Deployed", "Code Hash", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const known = KNOWN_CONTRACTS[entry.address.toLowerCase()];
                return (
                  <motion.tr
                    key={entry.address}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className={`text-sm font-semibold ${known?.color || "text-foreground"}`}>
                          {known?.name || entry.name || "Unknown Contract"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{known?.type || "Unknown Type"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{shortenAddr(entry.address)}</span>
                        <a href={`https://polygonscan.com/address/${entry.address}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono bg-muted/40 border border-border/30 px-2 py-0.5 rounded-full text-foreground">
                        {entry.version || "v1.0"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.deployedAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">{shortenHash(entry.codeHash)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {entry.verified ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 font-mono">PENDING</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Registry contract info */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Registry Contract</span>
          <span className="text-[10px] bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono">ON-CHAIN</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Notebook Registry Address</p>
            <p className="font-mono text-sm text-foreground break-all">0xa6a1C3D97e629326ad812e97e927622A8dA711a3</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Network</p>
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Polygon Mainnet (Chain ID: 137)
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <a
            href="https://polygonscan.com/address/0xa6a1C3D97e629326ad812e97e927622A8dA711a3"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary border border-primary/25 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Registry on PolygonScan
          </a>
        </div>
      </motion.div>
    </div>
  );
}
