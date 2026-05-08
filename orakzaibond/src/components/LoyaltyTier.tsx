import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import {
  Shield, Star, Crown, Wallet, ChevronRight,
  Zap, ExternalLink, Lock,
} from "lucide-react";

// ── Token contract ────────────────────────────────────────────────────────────
const TOKEN_ADDRESS = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "starter",
    label: "Starter",
    min: 0,
    max: 500,
    Icon: Shield,
    perk: "Welcome to the OKBOND ecosystem",
    perkIcon: Zap,
    gradient: "from-zinc-600 via-zinc-400 to-zinc-600",
    shimmer: "from-transparent via-zinc-300/30 to-transparent",
    border: "border-zinc-500/40",
    glow: "shadow-zinc-500/10",
    bg: "from-zinc-800/60 to-zinc-900/40",
    badge: "bg-zinc-700/80 text-zinc-200 border-zinc-500/40",
    dot: "bg-zinc-400",
    ring: "ring-zinc-500/30",
    cta: null,
  },
  {
    id: "silver",
    label: "Silver Partner",
    min: 501,
    max: 5000,
    Icon: Star,
    perk: "1.2× Lottery Chance Multiplier",
    perkIcon: Zap,
    gradient: "from-slate-400 via-slate-200 to-slate-400",
    shimmer: "from-transparent via-white/40 to-transparent",
    border: "border-slate-400/40",
    glow: "shadow-slate-400/15",
    bg: "from-slate-800/60 to-slate-900/40",
    badge: "bg-slate-700/80 text-slate-100 border-slate-400/40",
    dot: "bg-slate-300",
    ring: "ring-slate-400/30",
    cta: null,
  },
  {
    id: "elite",
    label: "Orakzai Elite",
    min: 5001,
    max: Infinity,
    Icon: Crown,
    perk: "Direct Access to VIP Telegram",
    perkIcon: ExternalLink,
    gradient: "from-yellow-600 via-yellow-300 to-yellow-600",
    shimmer: "from-transparent via-yellow-200/50 to-transparent",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/20",
    bg: "from-yellow-900/40 to-amber-900/20",
    badge: "bg-yellow-800/60 text-yellow-200 border-yellow-500/40",
    dot: "bg-yellow-400",
    ring: "ring-yellow-500/30",
    cta: "https://t.me/+VIPOrakzaiBond",
  },
] as const;

type TierId = typeof TIERS[number]["id"];

function getTier(balance: number): typeof TIERS[number] {
  if (balance >= 5001) return TIERS[2];
  if (balance >= 501)  return TIERS[1];
  return TIERS[0];
}

function nextTier(tierId: TierId): typeof TIERS[number] | null {
  const idx = TIERS.findIndex((t) => t.id === tierId);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  provider: BrowserProvider | null;
  address: string | null;
  onConnect: () => void;
}

export default function LoyaltyTier({ provider, address, onConnect }: Props) {
  const [balance, setBalance]   = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!provider || !address) { setBalance(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const signer   = await provider.getSigner();
        const contract = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
        const [raw, dec] = await Promise.all([
          contract.balanceOf(address) as Promise<bigint>,
          contract.decimals() as Promise<number>,
        ]);
        if (!cancelled) setBalance(Number(formatUnits(raw, dec)));
      } catch {
        if (!cancelled) setBalance(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [provider, address]);

  const tier    = balance !== null ? getTier(balance) : null;
  const next    = tier ? nextTier(tier.id) : null;
  const TierIcon = tier?.Icon ?? Crown;

  return (
    <section className="px-4 pb-2">
      <div className="max-w-5xl mx-auto">

        <AnimatePresence mode="wait">

          {/* ── Not connected ── */}
          {!address && (
            <motion.button
              key="disconnected"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={onConnect}
              className="w-full group glass-card rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 flex items-center gap-4 hover:border-primary/40 hover:from-primary/10 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Check Your Loyalty Tier</p>
                <p className="text-xs text-muted-foreground">Connect wallet to see your OKBOND rank and perks</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          )}

          {/* ── Loading ── */}
          {address && loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full glass-card rounded-2xl border border-border p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 rounded bg-white/5" />
                  <div className="w-48 h-3 rounded bg-white/5" />
                </div>
                <div className="w-24 h-8 rounded-xl bg-white/5" />
              </div>
            </motion.div>
          )}

          {/* ── Tier card ── */}
          {address && !loading && tier && balance !== null && (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`relative overflow-hidden glass-card rounded-2xl border ${tier.border} bg-gradient-to-r ${tier.bg} shadow-lg ${tier.glow}`}
            >
              {/* Metallic shimmer sweep */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tier.shimmer} w-full translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]`} />

              <div className="relative z-10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">

                {/* Medal icon with metallic ring */}
                <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.bg} border ${tier.border} ring-4 ${tier.ring} flex items-center justify-center`}>
                  {/* Metallic gradient overlay on icon */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${tier.gradient} opacity-10`} />
                  <TierIcon className={`w-7 h-7 relative z-10 bg-gradient-to-br ${tier.gradient} bg-clip-text`}
                    style={{ color: tier.id === "starter" ? "#94a3b8" : tier.id === "silver" ? "#cbd5e1" : "#eab308" }}
                  />
                  {/* Shine dot */}
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/50" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${tier.badge}`}>
                      {tier.id === "starter" ? "Bronze" : tier.id === "silver" ? "Silver" : "Gold"} Tier
                    </span>
                    <h3 className="text-base font-extrabold text-foreground">{tier.label}</h3>
                  </div>

                  {/* Balance */}
                  <p className="text-xs text-muted-foreground mb-2 font-mono">
                    Balance: <span className="font-bold" style={{ color: tier.id === "starter" ? "#94a3b8" : tier.id === "silver" ? "#cbd5e1" : "#eab308" }}>
                      {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND
                    </span>
                  </p>

                  {/* Perk pill */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${tier.badge} text-xs font-semibold`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tier.dot} animate-pulse`} />
                    {tier.perk}
                    {tier.cta && (
                      <a href={tier.cta} target="_blank" rel="noopener noreferrer"
                        className="ml-1 underline underline-offset-2 opacity-80 hover:opacity-100 flex items-center gap-0.5">
                        Join <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right — progress to next tier */}
                <div className="flex-shrink-0 w-full sm:w-44">
                  {next ? (
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1.5">
                        <span>Progress to {next.label}</span>
                        <span>{Math.min(100, Math.round((balance / next.min) * 100))}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (balance / next.min) * 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                        {Math.max(0, next.min - balance).toLocaleString(undefined, { maximumFractionDigits: 0 })} OKBOND to next tier
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${tier.badge} text-xs font-bold`}>
                        <Crown className="w-3.5 h-3.5" />
                        Max Tier Reached
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom accent bar */}
              <div className={`h-0.5 bg-gradient-to-r ${tier.gradient} opacity-60`} />
            </motion.div>
          )}

        </AnimatePresence>

        {/* All tiers preview (always visible) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {TIERS.map((t) => {
            const Icon = t.Icon;
            const isActive = tier?.id === t.id;
            return (
              <div
                key={t.id}
                className={`relative overflow-hidden glass-card rounded-xl border p-4 text-center transition-all duration-300 ${
                  isActive
                    ? `${t.border} bg-gradient-to-b ${t.bg} shadow-lg ${t.glow}`
                    : "border-border bg-card/30 opacity-60"
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${t.gradient}`} />
                )}
                <div className="relative z-10">
                  <Icon className="w-6 h-6 mx-auto mb-2"
                    style={{ color: t.id === "starter" ? "#94a3b8" : t.id === "silver" ? "#cbd5e1" : "#eab308" }}
                  />
                  <p className="text-xs font-extrabold text-foreground leading-tight mb-0.5">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {t.id === "elite" ? "5,001+" : t.id === "silver" ? "501–5,000" : "0–500"} OKBOND
                  </p>
                  {isActive && (
                    <span className={`inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${t.badge}`}>
                      <span className={`w-1 h-1 rounded-full ${t.dot} animate-pulse`} />
                      Your Tier
                    </span>
                  )}
                  {!isActive && tier && (
                    <Lock className="w-3 h-3 mx-auto mt-1.5 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
