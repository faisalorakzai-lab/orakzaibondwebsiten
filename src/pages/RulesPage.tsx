import { motion } from "framer-motion";
import {
  ArrowLeft, Scale, AlertTriangle, RefreshCw, Shuffle,
  FileText, ChevronDown, ChevronUp, ShieldCheck, ExternalLink,
  CheckCircle2, XCircle, Info,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/useWallet";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";
const TOKEN_ADDRESS   = "0x6f539e4232c045ccac08e2009d97bdc72815472a";
const EXPLORER        = "https://polygonscan.com";
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
  const { address, connect } = useWallet();

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-28 pb-16 border-b border-primary/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(234,179,8,0.06),transparent)]" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative">
          <motion.a href="/" whileHover={{ x: -3 }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Orakzai Bond
          </motion.a>

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
                  significantly in value. The lottery outcome is probabilistic — most participants will not win.
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
                desc: "Participating in the OKBOND Lottery does not guarantee any financial return. The lottery is a probabilistic event — the majority of participants do not win.",
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
              The OKBOND lottery contract includes a built-in refund mechanism for non-winning participants.
              The following conditions govern when and how refunds are issued.
            </p>
          </Reveal>

          {/* Refund eligibility table */}
          <Reveal delay={0.05} className="mb-6">
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-black/30">
              <div className="px-5 py-3 border-b border-primary/10 bg-primary/5">
                <p className="text-xs font-bold text-foreground uppercase tracking-widest font-mono">Refund Eligibility Matrix</p>
              </div>
              <div className="divide-y divide-primary/8">
                {[
                  { scenario: "You entered and were NOT selected as a winner", eligible: true,  notes: "Call claimRefund() after winnersSelected = true" },
                  { scenario: "You entered and WERE selected as a winner",     eligible: false, notes: "You claim your reward, not a refund" },
                  { scenario: "You did not enter the lottery",                 eligible: false, notes: "No deposit was made — nothing to refund" },
                  { scenario: "Winners not yet selected",                      eligible: false, notes: "claimRefund() is disabled until the draw completes" },
                  { scenario: "You already claimed your refund",               eligible: false, notes: "One refund per wallet — double-claiming is blocked" },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-3">
                    <div className="flex-1 text-sm text-foreground/80">{row.scenario}</div>
                    <div className="flex-shrink-0 w-20 flex justify-center">
                      {row.eligible
                        ? <span className="flex items-center gap-1 text-xs font-bold text-green-400"><CheckCircle2 className="w-3.5 h-3.5" />Yes</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-red-400"><XCircle className="w-3.5 h-3.5" />No</span>}
                    </div>
                    <div className="flex-1 text-xs text-muted-foreground hidden sm:block">{row.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Clause n="2.1" title="Refund Amount">
            <p>Refunds are issued in OKBOND tokens at the exact amount originally deposited via the <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">entryAmount</code> state variable. No additional amounts, fees, or interest are included.</p>
            <p>Gas fees paid to the Polygon network for your original entry transaction are non-refundable, as they are paid to network validators and are outside the control of the lottery contract.</p>
          </Clause>
          <Clause n="2.2" title="Refund Timing">
            <BulletList items={[
              "Refunds can only be claimed after winnersSelected is set to true on-chain.",
              "There is no set deadline for claiming a refund — the contract holds your deposit until you claim it.",
              "It is your responsibility to monitor the lottery state and claim your refund when eligible.",
              "Orakzai Bond and the Orakzai Group are not liable for unclaimed deposits.",
            ]} />
          </Clause>
          <Clause n="2.3" title="No Discretionary Refunds">
            <p>Because the lottery is fully governed by a smart contract, no manual or discretionary refunds can be issued by Orakzai Bond, the Orakzai Group, or any individual. If you do not claim your refund via the contract, your deposit remains in the contract indefinitely.</p>
            <p>This is a feature of decentralised, trustless systems — no human can unilaterally move your funds.</p>
          </Clause>
          <Clause n="2.4" title="Failed Transactions">
            <p>If a transaction to enter the lottery fails (e.g. due to insufficient gas, network congestion, or contract revert), no OKBOND tokens are deducted from your wallet. Only confirmed, on-chain transactions constitute a valid entry. Gas fees for failed transactions may still be charged by the Polygon network.</p>
          </Clause>
        </section>

        {/* ══ 3. WINNER SELECTION LOGIC ═══════════════════════════ */}
        <section>
          <Reveal>
            <SectionLabel icon={<Shuffle className="w-3.5 h-3.5" />} label="Section 3 — Winner Selection Logic" />
            <h2 className="text-3xl font-extrabold text-foreground mb-3">
              Winner Selection <span className="text-primary">Logic</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              The winner selection process is governed entirely by the smart contract. The following rules
              define exactly how winners are determined — with no human discretion or override possible.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mb-6">
            <div className="rounded-2xl border border-primary/15 bg-black/40 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Maximum Winners",   value: "5",                        color: "text-primary",    icon: <ShieldCheck className="w-4 h-4" /> },
                  { label: "Selection Method",  value: "On-chain Randomness",      color: "text-blue-400",  icon: <Shuffle className="w-4 h-4" />     },
                  { label: "Prize Distribution", value: "Equal Share (Pool ÷ 5)", color: "text-green-400", icon: <CheckCircle2 className="w-4 h-4" />  },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl border border-primary/10 bg-primary/5">
                    <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                    <p className={`text-lg font-extrabold ${s.color} mb-0.5`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Clause n="3.1" title="Selection Trigger">
            <p>Winners are selected when the lottery administrator calls the <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">selectWinners()</code> function on the smart contract. This action is irreversible — once called, <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">winnersSelected</code> is permanently set to <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">true</code> and no further entries can be accepted.</p>
          </Clause>
          <Clause n="3.2" title="Randomness Source">
            <p>The winner selection uses on-chain entropy derived from:</p>
            <BulletList items={[
              "block.timestamp — the Unix timestamp of the block in which selectWinners() is executed.",
              "block.prevrandao — the Polygon validator's randomness beacon value (EIP-4399).",
              "players.length — the total number of verified entrants at the time of the draw.",
            ]} />
            <p className="mt-3">These values are combined using <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">keccak256</code> hashing to produce a seed, which is used to index the players array and select winners without bias.</p>
          </Clause>
          <Clause n="3.3" title="Equal Probability">
            <p>Each registered wallet address has an equal and independent probability of selection. The selection algorithm does not weight entries by wallet balance, entry time, or any other factor. One entry = one equal chance.</p>
            <p>Duplicate entries from the same wallet are blocked at the contract level by the <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">hasEntered</code> mapping — one wallet cannot win more than one prize slot per round.</p>
          </Clause>
          <Clause n="3.4" title="Minimum Participants">
            <p>If the number of valid entries at the time of the draw is fewer than 5, the contract selects only as many winners as there are eligible participants. In such a case, the prize pool is divided equally among the actual winners selected.</p>
          </Clause>
          <Clause n="3.5" title="Dispute Resolution">
            <p>Because winner selection is fully on-chain and deterministic, there is no dispute resolution process. The contract's output is final and binding. Any party can independently verify the winner selection by inspecting the <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">selectWinners()</code> transaction on Polygonscan using the block data at the time of execution.</p>
            <p>There is no appeals process. Orakzai Bond and the Orakzai Group do not have the technical ability to alter, reverse, or override winner selection results.</p>
          </Clause>
        </section>

        {/* ══ 4. TERMS OF USE ════════════════════════════════════ */}
        <section>
          <Reveal>
            <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="Section 4 — Terms of Use" />
            <h2 className="text-3xl font-extrabold text-foreground mb-3">
              Terms of <span className="text-primary">Use</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              These terms govern your use of the Orakzai Bond website, smart contracts, and any associated
              services provided by the Orakzai Group. By accessing this website or interacting with any
              Orakzai Bond smart contract, you agree to these terms.
            </p>
          </Reveal>

          <Clause n="4.1" title="Acceptance of Terms">
            <p>By accessing this website or interacting with any OKBOND smart contract on the Polygon blockchain, you represent that you have read, understood, and agree to be bound by these Terms of Use and all applicable laws and regulations in your jurisdiction.</p>
            <p>If you do not agree to these terms, you must immediately cease using this website and all associated smart contracts.</p>
          </Clause>
          <Clause n="4.2" title="Use of Smart Contracts">
            <BulletList items={[
              "You interact with OKBOND smart contracts entirely at your own risk.",
              "You are solely responsible for the security of your private keys and wallet credentials.",
              "You acknowledge that blockchain transactions are irreversible once confirmed.",
              "You must not attempt to exploit, manipulate, or attack the smart contract in any way.",
              "You must not use automated bots or scripts to gain an unfair advantage in the lottery.",
            ]} />
          </Clause>
          <Clause n="4.3" title="Prohibited Activities">
            <p>The following activities are strictly prohibited:</p>
            <BulletList color="bg-red-500" items={[
              "Attempting to manipulate blockchain randomness through miner/validator collusion.",
              "Using multiple wallets to circumvent the one-entry-per-wallet restriction.",
              "Engaging in money laundering, terrorist financing, or any other illegal activity through OKBOND.",
              "Misrepresenting your identity, eligibility, or jurisdiction.",
              "Attempting to reverse-engineer, decompile, or exploit the smart contract.",
            ]} />
          </Clause>
          <Clause n="4.4" title="Intellectual Property">
            <p>All content on this website — including but not limited to text, graphics, logos, imagery, the OKBOND brand, and the Orakzai Group brand — is the exclusive property of the Orakzai Group. Unauthorised reproduction, distribution, or commercial use is strictly prohibited.</p>
            <p>The deployed smart contract source code is on-chain and publicly readable via Polygonscan.</p>
          </Clause>
          <Clause n="4.5" title="Limitation of Liability">
            <p>To the fullest extent permitted by applicable law, Orakzai Bond, the Orakzai Group, and their respective officers, directors, employees, and contractors shall not be liable for:</p>
            <BulletList color="bg-orange-500" items={[
              "Any loss of tokens resulting from participation in the lottery.",
              "Any loss arising from smart contract bugs, exploits, or vulnerabilities beyond our control.",
              "Any indirect, incidental, special, consequential, or punitive damages.",
              "Any losses arising from your failure to safeguard your private keys or wallet.",
              "Any disruption to the Polygon network or third-party infrastructure.",
            ]} />
          </Clause>
          <Clause n="4.6" title="Modifications">
            <p>Orakzai Bond reserves the right to update or modify these Terms of Use at any time. Updated terms will be published on this page with a revised effective date. Continued use of the website or smart contracts following any update constitutes your acceptance of the revised terms.</p>
            <p>Smart contract logic, once deployed, cannot be modified. Any new lottery rounds may be deployed as new contracts with updated parameters, which will be clearly communicated.</p>
          </Clause>
          <Clause n="4.7" title="Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions, unless otherwise required by applicable law in your jurisdiction.</p>
            <p>Any disputes arising from or in connection with these Terms or your participation in the OKBOND Lottery shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan, to the extent permitted by law.</p>
          </Clause>
          <Clause n="4.8" title="Severability">
            <p>If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed from these Terms if modification is not possible. All other provisions shall remain in full force and effect.</p>
          </Clause>
        </section>

        {/* ══ On-chain Reference ══════════════════════════════════ */}
        <section>
          <Reveal>
            <SectionLabel icon={<ShieldCheck className="w-3.5 h-3.5" />} label="On-chain Reference" />
            <h2 className="text-2xl font-extrabold text-foreground mb-4">
              Contract <span className="text-primary">Reference</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-black/30">
              {[
                { label: "Lottery Contract",  addr: LOTTERY_ADDRESS, link: `${EXPLORER}/address/${LOTTERY_ADDRESS}` },
                { label: "OKBOND Token",       addr: TOKEN_ADDRESS,   link: `${EXPLORER}/address/${TOKEN_ADDRESS}`   },
              ].map((c, i) => (
                <div key={c.label} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 ${i > 0 ? "border-t border-primary/8" : ""}`}>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-0.5">{c.label}</p>
                    <p className="font-mono text-xs text-primary/80 break-all">{c.addr}</p>
                  </div>
                  <a href={c.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/25 bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/15 transition-all flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify on Polygonscan
                  </a>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ══ Acknowledgement Banner ══════════════════════════════ */}
        <Reveal>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <motion.div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3"
              animate={{ boxShadow: ["0 0 4px rgba(234,179,8,0.2)", "0 0 16px rgba(234,179,8,0.5)", "0 0 4px rgba(234,179,8,0.2)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}>
              <Scale className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="font-bold text-foreground mb-2">By Participating, You Confirm</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4">
              That you have read and understood these rules and disclaimer, that you are eligible to participate,
              and that you accept all associated risks. Your on-chain transaction is your binding consent.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.a href="/#lottery" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-background bg-primary shadow-[0_0_25px_rgba(234,179,8,0.35)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] hover:brightness-110 transition-all text-sm">
                I Understand — Enter the Lottery
              </motion.a>
              <motion.a href="/system" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-primary border border-primary/30 bg-primary/8 hover:bg-primary/15 transition-all text-sm">
                How the System Works
              </motion.a>
            </div>
          </div>
        </Reveal>

      </main>

      <div className="border-t border-primary/10 py-6 text-center">
        <p className="text-xs text-muted-foreground/50 font-mono">
          OKBOND Rules & Disclaimer · Effective {EFFECTIVE_DATE} · Orakzai Group · Karachi, Pakistan
        </p>
      </div>
    </div>
  );
}
