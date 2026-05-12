import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Coins, Info, Users, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";

// Fixed tokenomics constants
const TOTAL_SUPPLY = 10_000_000;
const STAKING_POOL_PCT = 0.28; // 28% of supply
const STAKING_POOL = TOTAL_SUPPLY * STAKING_POOL_PCT; // 2,800,000

const REFERRAL_RATES = [
  { level: 1, label: "Level 1 (Direct)", rate: 0.05, color: "text-primary" },
  { level: 2, label: "Level 2 (Indirect)", rate: 0.03, color: "text-amber-400" },
  { level: 3, label: "Level 3 (Deep)", rate: 0.02, color: "text-yellow-300" },
];

const DURATIONS = [3, 6, 12, 24];

interface OKBONDCalculatorProps {
  adminAPY?: number;
  adminPrice?: number;
  adminStage?: number;
}

export default function OKBONDCalculator({ adminAPY, adminPrice, adminStage }: OKBONDCalculatorProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("1000");
  const [duration, setDuration] = useState<number>(12);
  const [entryPrice, setEntryPrice] = useState<string>("0.50");
  const [apy, setApy] = useState<number>(adminAPY ?? 18);
  const [icoStage, setIcoStage] = useState<number>(adminStage ?? 1);
  const [referralAmounts, setReferralAmounts] = useState({ l1: "0", l2: "0", l3: "0" });
  const [showReferral, setShowReferral] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load settings from Supabase (live — so admin changes reflect immediately)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("key, value")
          .in("key", ["staking_apy", "ico_price", "ico_stage"]);

        if (data) {
          data.forEach((row: { key: string; value: number | string | boolean }) => {
            if (row.key === "staking_apy" && adminAPY === undefined) setApy(Number(row.value));
            if (row.key === "ico_price" && adminPrice === undefined) setEntryPrice(String(Number(row.value).toFixed(2)));
            if (row.key === "ico_stage" && adminStage === undefined) setIcoStage(Number(row.value));
          });
        }
      } catch (e) { /* use defaults */ }
      finally { setLoadingSettings(false); }
    };
    fetchSettings();
  }, [adminAPY, adminPrice, adminStage]);

  // If admin props change, use them
  useEffect(() => { if (adminAPY !== undefined) setApy(adminAPY); }, [adminAPY]);
  useEffect(() => { if (adminPrice !== undefined) setEntryPrice(String(adminPrice)); }, [adminPrice]);
  useEffect(() => { if (adminStage !== undefined) setIcoStage(adminStage); }, [adminStage]);

  const principal = parseFloat(amount) || 0;
  const months = duration;
  const apyRate = apy / 100;
  const entry = parseFloat(entryPrice) || 0.50;

  // Base staking reward (simple interest)
  const baseReward = principal * apyRate * (months / 12);

  // Referral bonus
  const l1 = parseFloat(referralAmounts.l1) || 0;
  const l2 = parseFloat(referralAmounts.l2) || 0;
  const l3 = parseFloat(referralAmounts.l3) || 0;

  const refBonus = (l1 * REFERRAL_RATES[0].rate + l2 * REFERRAL_RATES[1].rate + l3 * REFERRAL_RATES[2].rate) * apyRate * (months / 12);
  const totalReward = baseReward + refBonus;
  const totalOKBOND = principal + totalReward;

  const usdBase = baseReward * entry;
  const usdRef = refBonus * entry;
  const usdTotal = totalOKBOND * entry;

  const poolSharePct = principal > 0 ? ((principal / STAKING_POOL) * 100).toFixed(4) : "0";

  const STAGE_PRICES: Record<number, string> = { 1: "$0.50", 2: "$0.70", 3: "$1.00" };

  return (
    <section className="py-16 px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,175,55,0.15), transparent)" }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Coins className="w-3.5 h-3.5" />
            <span>Staking Rewards — 28% of Supply</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t("calc.title")}
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {t("calc.subtitle")}
          </p>

          {/* Live stats strip */}
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            {[
              { label: "Staking Pool", value: `${(STAKING_POOL / 1_000_000).toFixed(1)}M OKBOND` },
              { label: "Current APY", value: `${apy}%` },
              { label: "ICO Stage", value: `Phase ${icoStage} — ${STAGE_PRICES[icoStage] ?? "$0.15"}` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-extrabold text-primary font-mono">{loadingSettings ? "…" : s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6">
          
          {/* ── Input Panel ─────────────────────────────────── */}
          <div className="space-y-5">
            <div className="glass-gold rounded-3xl border border-primary/20 p-6 space-y-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Your Investment
              </h3>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">OKBOND Amount</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" placeholder="e.g. 1000"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-primary/20 text-foreground font-mono font-bold text-lg placeholder-muted-foreground/40 focus:border-primary/60 focus:outline-none transition-colors pr-24" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 text-sm font-bold">OKBOND</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 5000, 10000].map((v) => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        amount === String(v) ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted/10 border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}>
                      {v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entry Price */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Entry Price (USDT)</label>
                <div className="relative">
                  <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} step="0.01" min="0"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-primary/20 text-foreground font-mono font-bold text-lg focus:border-primary/60 focus:outline-none transition-colors pl-8" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 font-bold">$</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(STAGE_PRICES).map(([stage, price]) => (
                    <button key={stage} onClick={() => setEntryPrice(price.replace("$",""))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        entryPrice === price.replace("$","") ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted/10 border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}>
                      Phase {stage}: {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Staking Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        duration === d ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(234,179,8,0.2)]" : "bg-muted/10 border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                      {d}M
                    </button>
                  ))}
                </div>
              </div>

              {/* APY display */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5" /> APY (set by Chairman)
                </div>
                <span className="text-primary font-extrabold font-mono text-sm">{apy}%</span>
              </div>
            </div>

            {/* ── Referral Section ─────────────────────── */}
            <div className="glass-card rounded-2xl border border-primary/15 overflow-hidden">
              <button onClick={() => setShowReferral(!showReferral)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Referral Multiplier
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-bold uppercase">Bonus</span>
                </span>
                {showReferral ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {showReferral && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-3">
                      <p className="text-[11px] text-muted-foreground">Enter your referrals' total OKBOND stakes at each level to see your bonus earnings:</p>
                      {REFERRAL_RATES.map((r, i) => {
                        const key = i === 0 ? "l1" : i === 1 ? "l2" : "l3";
                        return (
                          <div key={r.level} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-muted-foreground">{r.label}</label>
                              <span className={`text-xs font-extrabold ${r.color}`}>+{(r.rate * 100).toFixed(0)}% APY bonus</span>
                            </div>
                            <div className="relative">
                              <input type="number" value={referralAmounts[key as keyof typeof referralAmounts]}
                                onChange={(e) => setReferralAmounts(prev => ({ ...prev, [key]: e.target.value }))}
                                min="0" placeholder="0"
                                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-primary/15 text-foreground font-mono text-sm focus:border-primary/50 focus:outline-none transition-colors pr-20" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 text-xs font-bold">OKBOND</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Results Panel ─────────────────────────── */}
          <div className="space-y-4">
            {/* Main result */}
            <div className="glass-gold rounded-3xl border border-primary/25 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5"><TrendingUp className="w-32 h-32 text-primary" /></div>
              <div className="relative z-10">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Estimated Reward</p>
                <motion.p key={`${totalReward}-${duration}-${apy}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-extrabold text-primary font-mono">
                  +{totalReward.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-0.5">OKBOND over {duration} months</p>
                <p className="text-lg font-bold text-foreground/70 mt-1">
                  ≈ <span className="text-primary">${usdTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> USDT
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Reward Breakdown</h4>
              {[
                { label: "Principal", value: `${principal.toLocaleString()} OKBOND`, usd: `$${(principal * entry).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                { label: "Staking Reward", value: `+${baseReward.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND`, usd: `+$${usdBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, highlight: true },
                ...(refBonus > 0 ? [{ label: "Referral Bonus", value: `+${refBonus.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND`, usd: `+$${usdRef.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, highlight: true }] : []),
                { label: "Total at Maturity", value: `${totalOKBOND.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND`, usd: `$${usdTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
              ].map((row) => (
                <div key={row.label} className={`flex items-center justify-between py-2 border-b border-border/30 last:border-0 ${row.highlight ? "text-primary" : ""}`}>
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono">{row.value}</span>
                    {row.usd && <p className="text-[10px] text-muted-foreground">{row.usd}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pool share */}
            <div className="glass-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Your Pool Share</p>
                  <p className="text-sm font-bold text-primary font-mono">{poolSharePct}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Staking Pool Size</p>
                  <p className="text-sm font-bold text-foreground font-mono">{STAKING_POOL.toLocaleString()} OKBOND</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                     style={{ width: `${Math.min(parseFloat(poolSharePct) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Estimates only. APY set by Chairman — subject to change at launch. Not financial advice. Polygon network.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
