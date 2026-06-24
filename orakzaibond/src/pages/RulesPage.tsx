import { motion } from "framer-motion";
import {
  ArrowLeft, Scale, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, ShieldCheck,
  XCircle, Info,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useSEO, PAGE_SEO } from "@/components/SEO";

const EFFECTIVE_DATE  = "8 April 2026";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
      {icon}{label}
    </span>
  );
}

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <div className="rounded-2xl border border-primary/12 bg-black/30 overflow-hidden mb-3">
        <button onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-primary/5 transition-colors text-left">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold font-mono text-primary flex-shrink-0">
              {n}
            </span>
            <span className="font-semibold text-foreground text-sm">{title}</span>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </button>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-5 border-t border-primary/8">
            <div className="pt-4 text-sm text-muted-foreground leading-relaxed space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </Reveal>
  );
}

function BulletList({ items, color = "bg-primary" }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0 mt-1.5`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RulesPage() {
  useSEO(PAGE_SEO.rules);
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-12 pb-16 border-b border-primary/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(234,179,8,0.06),transparent)]" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Link href="/">
            <motion.span whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Orakzai Bond
            </motion.span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5" />
              Legal · Rules · Disclaimer
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4">
              Rules &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
                Disclaimer
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
              By interacting with the OKBOND Lottery smart contract, you confirm that you have read,
              understood, and accepted all terms on this page.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground font-mono">
              <Info className="w-3.5 h-3.5 text-primary" />
              Effective date: {EFFECTIVE_DATE} · Orakzai Bond / Orakzai Group
            </div>
          </motion.div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 max-w-4xl py-14 space-y-16">

        {/* ══ 1. RISK DISCLAIMER ══════════════════════════════════ */}
        <section>
          <Reveal>
            <SectionLabel icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Section 1 — Risk Disclaimer" />
            <h2 className="text-3xl font-extrabold text-foreground mb-3">
              Risk <span className="text-primary">Disclaimer</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              Participation in the OKBOND Lottery involves financial risk. Please read the following
              disclosures carefully before committing any tokens.
            </p>
          </Reveal>

          {/* Critical warning banner */}
          <Reveal delay={0.05} className="mb-6">
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/8 p-5 flex gap-4">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-300 mb-1">Important — Read Before Participating</p>
                <p className="text-sm text-orange-200/70 leading-relaxed">
                  Cryptocurrency and decentralised finance (DeFi) activities carry substantial risk of financial
                  loss. OKBOND tokens, like all cryptocurrencies, are highly volatile and may decrease
                  significantly in value. The Lottery outcome is probabilistic — most participants will not win.
                  Never participate with funds you cannot afford to lose.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                icon: <XCircle className="w-4 h-4" />,
                title: "No Guaranteed Returns",
                desc: "Participating in the OKBOND Lottery does not guarantee any financial return. The Lottery is a probabilistic event — the majority of participants do not win.",
                color: "text-red-400", border: "border-red-500/20 bg-red-500/5",
              },
              {
                icon: <AlertTriangle className="w-4 h-4" />,
                title: "Market Volatility",
                desc: "The OKBOND token price is subject to significant market fluctuations. The OKBOND value of any prize may be worth more or less in fiat terms at the time of claiming.",
                color: "text-orange-400", border: "border-orange-500/20 bg-orange-500/5",
              },
              {
                icon: <ShieldCheck className="w-4 h-4" />,
                title: "Smart Contract Risk",
                desc: "While the contract has been designed with security in mind, no smart contract can be guaranteed 100% free of bugs or vulnerabilities. Interact at your own risk.",
                color: "text-yellow-400", border: "border-yellow-500/20 bg-yellow-500/5",
              },
              {
                icon: <Info className="w-4 h-4" />,
                title: "Regulatory Uncertainty",
                desc: "The legal status of cryptocurrency lotteries varies by jurisdiction. It is your responsibility to ensure that your participation is lawful in your country of residence.",
                color: "text-blue-400", border: "border-blue-500/20 bg-blue-500/5",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className={`p-4 rounded-2xl border ${c.border} flex gap-3`}>
                  <span className={`${c.color} flex-shrink-0 mt-0.5`}>{c.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${c.color} mb-1`}>{c.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Clause n="1.1" title="Acceptance of Risk">
            <p>By calling <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">enterLottery()</code> on the OKBOND smart contract, you acknowledge and accept all risks associated with participation, including but not limited to: loss of deposited tokens if you are not selected as a winner, smart contract risk, market risk, and regulatory risk in your jurisdiction.</p>
          </Clause>
          <Clause n="1.2" title="No Financial Advice">
            <p>Nothing on this website, in the OKBOND smart contract, or in any communication by Orakzai Bond or the Orakzai Group constitutes financial, investment, tax, or legal advice. All information is provided for educational and informational purposes only.</p>
            <p>You should consult a qualified financial advisor before making any financial decisions.</p>
          </Clause>
          <Clause n="1.3" title="Eligibility">
            <BulletList items={[
              "You must be at least 18 years of age (or the age of majority in your jurisdiction, whichever is higher).",
              "You must not be a resident of a jurisdiction where cryptocurrency lotteries or DeFi activities are prohibited by law.",
              "You must not be on any international sanctions list.",
              "Employees, directors, and contractors of the Orakzai Group and its subsidiaries are excluded from participation.",
            ]} />
          </Clause>
        </section>

        {/* ══ 2. REFUND CONDITIONS ════════════════════════════════ */}
        <section>
          <Reveal>
            <SectionLabel icon={<RefreshCw className="w-3.5 h-3.5" />} label="Section 2 — Refund Conditions" />
            <h2 className="text-3xl font-extrabold text-foreground mb-3">
              Refund <span className="text-primary">Conditions</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              The OKBOND Lottery is unique in its capital protection mechanism. Non-winners are entitled
              to a full refund of their entry fee.
            </p>
          </Reveal>
          <Clause n="2.1" title="Automatic Eligibility">
            <p>All participants who are not selected as winners in a given Lottery round are automatically eligible to claim a 100% refund of their entry fee (e.g., 50 OKBOND).</p>
          </Clause>
          <Clause n="2.2" title="Claiming Process">
            <p>Refunds are not automatically sent to your wallet. You must manually trigger the refund by calling the <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">claimRefund()</code> function on the smart contract after the round has concluded.</p>
          </Clause>
          <Clause n="2.3" title="No Expiry">
            <p>There is no time limit for claiming your refund. Your tokens remain secured in the smart contract until you choose to withdraw them.</p>
          </Clause>
        </section>
      </main>
    </div>
  );
}
