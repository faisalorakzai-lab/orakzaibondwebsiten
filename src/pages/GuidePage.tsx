import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Wallet, Globe, Zap, CheckCircle2, ExternalLink,
  ChevronRight, Download, ShieldCheck, ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Setup Your Wallet",
    icon: Wallet,
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    accent: "text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
    bullets: [
      "Install MetaMask from metamask.io (browser extension or mobile app)",
      "Or use Trust Wallet — download from the official App Store / Google Play",
      "Create a new wallet and safely store your 12-word Secret Phrase offline",
      "Never share your seed phrase with anyone — not even support agents",
    ],
    links: [
      { label: "Get MetaMask", href: "https://metamask.io/download/" },
      { label: "Get Trust Wallet", href: "https://trustwallet.com/download" },
    ],
  },
  {
    number: "02",
    title: "Add Polygon PoS Network",
    icon: Globe,
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    bullets: [
      "Open MetaMask → click the network dropdown (top-left) → 'Add a custom network'",
      "Network Name: Polygon Mainnet",
      "RPC URL: https://polygon-rpc.com",
      "Chain ID: 137 · Symbol: POL · Explorer: https://polygonscan.com",
      "Trust Wallet users: Polygon PoS is built-in — select it from the coin list",
    ],
    networkDetails: [
      { label: "Network", value: "Polygon Mainnet" },
      { label: "Chain ID", value: "137" },
      { label: "Symbol", value: "POL" },
      { label: "RPC", value: "polygon-rpc.com" },
    ],
  },
  {
    number: "03",
    title: "Connect & Purchase OKBOND",
    icon: Zap,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bullets: [
      "Click 'Connect Wallet' on this site — approve the connection in MetaMask/Trust Wallet",
      "Ensure you are on Polygon PoS (Chain ID 137) — the site will prompt you to switch if needed",
      "Go to the ICO page and enter how many OKBOND tokens you want to purchase",
      "Approve the OKBOND token spend, then confirm the purchase transaction",
      "Phase 1 price: $0.15 per OKBOND · Minimum entry: $10 equivalent in POL",
      "Tokens appear in your wallet immediately after the transaction confirms on-chain",
    ],
    links: [
      { label: "View on PolygonScan", href: "https://polygonscan.com/token/0x6f539e4232c045ccac08e2009d97bdc72815472a" },
    ],
  },
];

const faqs = [
  { q: "Do I need POL to buy OKBOND?", a: "Yes. OKBOND is priced in POL (Polygon's native token). You need POL in your wallet to cover the token cost plus a small gas fee (~$0.01)." },
  { q: "Where can I get POL?", a: "Buy POL on Binance, Coinbase, or any major exchange, then withdraw to your Polygon PoS wallet address." },
  { q: "Is it safe to connect my wallet?", a: "Yes. Connecting only allows the site to read your address. No funds move unless you explicitly approve a transaction." },
  { q: "What happens if I need a refund?", a: "OKBOND's Safety Vault guarantees 100% refund of your lottery entry deposit — no questions asked." },
];

export default function GuidePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="pt-28 pb-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Beginner Friendly
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            How to Buy <span className="text-primary">OKBOND</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            New to crypto? No problem. Follow this 3-step guide to set up your wallet,
            connect to Polygon, and purchase OKBOND tokens in minutes.
          </p>
        </motion.div>
      </section>

      {/* 3 Steps */}
      <section className="max-w-3xl mx-auto px-4 pb-16 space-y-8">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`glass-card rounded-3xl border ${step.border} bg-gradient-to-br ${step.color} p-7`}
            >
              {/* Step header */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl border ${step.border} bg-black/30 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${step.accent}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-lg border ${step.badge} uppercase tracking-widest`}>
                      Step {step.number}
                    </span>
                  </div>
                  <h2 className={`text-xl font-extrabold ${step.accent}`}>{step.title}</h2>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-2.5 mb-5">
                {step.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${step.accent}`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Network details table (step 2 only) */}
              {"networkDetails" in step && step.networkDetails && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {step.networkDetails.map((nd) => (
                    <div key={nd.label} className="bg-black/30 rounded-xl border border-white/5 p-3 text-center">
                      <p className={`text-xs font-bold font-mono ${step.accent}`}>{nd.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{nd.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Links */}
              {"links" in step && step.links && (
                <div className="flex flex-wrap gap-2">
                  {step.links.map((lnk) => (
                    <a
                      key={lnk.label}
                      href={lnk.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg border ${step.border} ${step.accent} hover:bg-white/5 transition-all`}
                    >
                      {lnk.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Connector arrows between steps */}
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl border border-border p-7"
        >
          <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2">
            <span className="text-primary">FAQ</span>
            <span className="text-muted-foreground font-normal text-sm">— Common questions</span>
          </h3>
          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border/50 last:border-0 pb-5 last:pb-0">
                <p className="text-sm font-bold text-foreground mb-1.5 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-10 text-center"
        >
          <Download className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-extrabold mb-2">Ready to invest?</h3>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Phase 1 is LIVE at <strong className="text-primary">$0.15 / OKBOND</strong>. Listing target is <strong className="text-emerald-400">$1.00</strong> — that's a potential <strong className="text-emerald-400">+567% ROI</strong> for early investors.
          </p>
          <button
            onClick={() => navigate("/ico")}
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] active:scale-100"
          >
            Go to ICO <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[10px] text-muted-foreground/50 mt-4 font-mono">
            Phase 1 supply: 75,000 OKBOND · Ends June 9, 2026
          </p>
        </motion.div>
      </section>
    </div>
  );
}
