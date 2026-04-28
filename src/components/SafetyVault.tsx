import { motion } from "framer-motion";
import { ShieldCheck, RotateCcw, Droplets } from "lucide-react";

const CARDS = [
  {
    icon: ShieldCheck,
    title: "Asset Protection",
    desc: "Every entry token is locked inside our audited smart contract for the full duration of the Lottery. No admin can touch them — the contract holds sole custody until the draw is complete.",
    accent: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    glow: "shadow-primary/20",
    iconBg: "bg-primary/15 border-primary/30",
    iconColor: "text-primary",
    tag: "Smart Contract Custody",
    tagColor: "bg-primary/15 border-primary/25 text-primary",
  },
  {
    icon: RotateCcw,
    title: "100% Guaranteed Refund",
    desc: "Didn't win? No problem. If you're not selected as a winner, 100% of your entry tokens are automatically returned to your wallet by the smart contract — instantly, with zero deductions.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    border: "border-emerald-500/35",
    glow: "shadow-emerald-500/20",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    tag: "Zero Risk · Auto Refund",
    tagColor: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
  {
    icon: Droplets,
    title: "Liquidity Backing",
    desc: "60% of all ICO funds are deployed directly to the QuickSwap liquidity pool on Polygon PoS. This ensures deep liquidity, price stability, and real on-chain value for every OKBOND holder.",
    accent: "from-blue-500/15 to-blue-500/5",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/15",
    iconBg: "bg-blue-500/15 border-blue-500/30",
    iconColor: "text-blue-400",
    tag: "60% to QuickSwap LP",
    tagColor: "bg-blue-500/15 border-blue-500/25 text-blue-400",
  },
];

export default function SafetyVault() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/8 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold uppercase tracking-widest">Security First</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
              Safety Vault
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Your funds are protected at every step. Our smart contract enforces capital safety so you never have to trust anyone — only the code.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative group glass-card rounded-3xl border ${card.border} p-6 bg-gradient-to-br ${card.accent} shadow-xl ${card.glow} flex flex-col`}
              >
                {/* Subtle top-edge highlight */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full`} />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl border ${card.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} strokeWidth={1.75} />
                </div>

                {/* Tag */}
                <span className={`self-start px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-widest mb-3 ${card.tagColor}`}>
                  {card.tag}
                </span>

                {/* Title */}
                <h3 className="text-lg font-extrabold text-foreground mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {card.desc}
                </p>

                {/* Bottom accent line */}
                <div className={`mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r ${card.accent.replace("from-", "from-").replace("/20", "/80").replace("/5", "/40")}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          {[
            { dot: "bg-primary", text: "Smart Contract Verified on Polygon PoS" },
            { dot: "bg-emerald-400", text: "Auto-Refund on Non-Win" },
            { dot: "bg-blue-400", text: "60% Liquidity Pool Backed" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${item.dot} flex-shrink-0`} />
              {item.text}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
