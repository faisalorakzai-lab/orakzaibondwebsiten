import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Coins, Info } from "lucide-react";

interface OKBONDCalculatorProps {
  apy?: number; // passed from admin settings
}

export default function OKBONDCalculator({ apy = 18 }: OKBONDCalculatorProps) {
  const [amount, setAmount] = useState<string>("1000");
  const [duration, setDuration] = useState<number>(12);
  const [entryPrice, setEntryPrice] = useState<string>("0.15");

  const principal = parseFloat(amount) || 0;
  const months = duration;
  const apyRate = apy / 100;
  const entry = parseFloat(entryPrice) || 0.15;

  // Compound interest calculation
  const reward = principal * apyRate * (months / 12);
  const total = principal + reward;
  const usdReward = reward * entry;
  const usdTotal = total * entry;

  const DURATIONS = [3, 6, 12, 24];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Coins className="w-3.5 h-3.5" />
            <span>Staking Calculator</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            $OKBOND Smart{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              Calculator
            </span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Estimate your staking rewards based on current APY rates set by the Chairman.
            Numbers are indicative and subject to change at launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Input Panel */}
          <div className="glass-gold rounded-3xl border border-primary/20 p-6 space-y-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Your Investment
            </h3>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                OKBOND Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  placeholder="e.g. 1000"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-primary/20 text-foreground font-mono font-bold text-lg placeholder-muted-foreground/40 focus:border-primary/60 focus:outline-none transition-colors pr-24"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 text-sm font-bold">
                  OKBOND
                </span>
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      amount === String(v)
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-muted/10 border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Entry Price (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-primary/20 text-foreground font-mono font-bold text-lg placeholder-muted-foreground/40 focus:border-primary/60 focus:outline-none transition-colors pl-8"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 font-bold">$</span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Staking Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      duration === d
                        ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                        : "bg-muted/10 border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {d}M
                  </button>
                ))}
              </div>
            </div>

            {/* Current APY display */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                Current APY (set by Chairman)
              </div>
              <span className="text-primary font-extrabold font-mono text-sm">{apy}%</span>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Main result */}
            <div className="glass-gold rounded-3xl border border-primary/25 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5">
                <TrendingUp className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">
                  Estimated Reward
                </p>
                <motion.p
                  key={`${reward}-${duration}-${apy}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-extrabold text-primary font-mono"
                >
                  +{reward.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  OKBOND over {duration} months
                </p>
                {entry > 0 && (
                  <p className="text-lg font-bold text-foreground/70 mt-1">
                    ≈ <span className="text-primary">${usdReward.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> USD
                  </p>
                )}
              </div>
            </div>

            {/* Breakdown */}
            <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Breakdown</h4>
              {[
                { label: "Principal", value: `${principal.toLocaleString()} OKBOND`, usd: entry > 0 ? `$${(principal * entry).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : null },
                { label: "Staking Reward", value: `+${reward.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND`, usd: entry > 0 ? `+$${usdReward.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : null, highlight: true },
                { label: "Total at Maturity", value: `${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} OKBOND`, usd: entry > 0 ? `$${usdTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : null },
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

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Calculations are estimates only. APY and staking terms are subject to change upon official launch. Not financial advice.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
