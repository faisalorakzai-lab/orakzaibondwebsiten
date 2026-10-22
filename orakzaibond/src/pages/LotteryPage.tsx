import { useSEO, PAGE_SEO } from "@/components/SEO";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, BadgeCheck, CircleHelp, Clock3, Coins, ExternalLink,
  Fingerprint, LockKeyhole, ShieldAlert, Ticket, Trophy, Users, Wallet,
} from "lucide-react";
import Lottery from "@/components/Lottery";
import { useWallet } from "@/hooks/useWallet";
import "./LotteryPage.css";

const LOTTERY_ADDRESS = "0x5BC55d4b347e39B986864E28604Ddca5dE6357B7";
const EXPLORER_URL = `https://polygonscan.com/address/${LOTTERY_ADDRESS}#code`;

const steps = [
  { number: "01", icon: Ticket, title: "Enter the draw", copy: "The verified contract accepts one entry per wallet. The current entry amount is read directly from the contract terminal below." },
  { number: "02", icon: LockKeyhole, title: "Wait for selection", copy: "The owner can select winners after the 60-day lock and when at least five wallets have entered. Selection is not automatic." },
  { number: "03", icon: Trophy, title: "Check your outcome", copy: "The contract records five winners. Winners can claim POL; eligible non-winners can call the contract to claim their deposited OKBOND back." },
];

const faqs = [
  { q: "What does it cost to enter?", a: "The OKBOND entry amount is read from the connected Polygon contract and shown in the terminal. Polygon network gas is separate and varies with network conditions." },
  { q: "How are winners selected?", a: "The verified source uses block timestamp, block prevrandao, an index and the player count, and only the contract owner can call winner selection after the lock. This is not Chainlink VRF and should not be described as manipulation-proof." },
  { q: "When can I claim a refund?", a: "After winners are selected, an address that is not a winner and has a recorded deposit can call claimRefund. A transaction and Polygon gas are required. The contract source does not guarantee a claim time or independent reserve backing." },
  { q: "What do winners receive?", a: "The contract divides its native POL balance by five when winners are selected. The reward amount is not the OKBOND entry deposit, and actual payout depends on the balance available at that time." },
  { q: "Is the contract audited?", a: "The repository's Polygon deployment manifest lists the source as verified and says an independent audit was not submitted. Source verification is not an independent security audit." },
  { q: "Which network and address should I verify?", a: "The deployment manifest identifies Polygon PoS (chain ID 137) and the contract linked here. Always check the address and network in your wallet before approving or sending a transaction." },
];

export default function LotteryPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();
  const reduceMotion = useReducedMotion();
  useSEO(PAGE_SEO.lottery);

  const goToTerminal = () => {
    if (!address) {
      void connect();
      return;
    }
    document.getElementById("lottery-terminal")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="lottery-page">
      <section className="lottery-hero">
        <div className="lottery-hero__grain" aria-hidden="true" />
        <div className="lottery-hero__inner">
          <motion.div className="lottery-hero__copy" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="lottery-kicker"><span className="lottery-kicker__dot" /> OKBOND · POLYGON LOTTERY</div>
            <h1>THE OKBOND<br /><span>LOTTERY</span></h1>
            <p className="lottery-hero__subtitle">A new standard for on-chain draws.</p>
            <p className="lottery-hero__body">A live interface to the verified Polygon contract. Review the real entry, draw status and terms before you connect. Participation involves smart-contract, randomness and transaction risk.</p>
            <div className="lottery-hero__actions">
              <button className="lottery-button" onClick={goToTerminal}><Wallet size={17} /> {address ? "View lottery terminal" : "Connect wallet to enter"} <ArrowRight size={16} /></button>
              <a className="lottery-link" href="#lottery-transparency">Explore transparency <ArrowDown size={15} /></a>
            </div>
            <div className="lottery-hero__meta"><span><BadgeCheck size={15} /> Polygon · chain 137</span><span><Users size={15} /> On-chain participants</span></div>
          </motion.div>
          <motion.div className="lottery-vault" aria-label="Decorative animated gold lottery vault illustration" role="img" initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }}>
            <div className="lottery-vault__halo" />
            <div className="lottery-vault__orbit lottery-vault__orbit--one"><i /><i /><i /></div>
            <div className="lottery-vault__orbit lottery-vault__orbit--two"><i /><i /></div>
            <div className="lottery-vault__ring lottery-vault__ring--outer" />
            <div className="lottery-vault__ring lottery-vault__ring--inner" />
            <div className="lottery-vault__coin"><div className="lottery-vault__coin-face"><span>OB</span><small>OKBOND</small></div></div>
            <div className="lottery-vault__base"><span>LIVE CONTRACT</span><strong>POLYGON&nbsp; / &nbsp;137</strong></div>
          </motion.div>
        </div>
        <div className="lottery-hero__bottom"><span>01 — 03</span><span>VERIFIED SOURCE · NOT AN AUDIT</span><span>SCROLL TO EXPLORE</span></div>
      </section>

      <section className="lottery-section lottery-how" aria-labelledby="lottery-how-title">
        <div className="lottery-section__heading"><span className="lottery-eyebrow">THE PROCESS</span><h2 id="lottery-how-title">Three steps. One on-chain record.</h2><p>Animation is purely visual; all real actions and statuses come from the contract.</p></div>
        <div className="lottery-steps">
          {steps.map(({ number, icon: Icon, title, copy }, index) => (
            <motion.article key={number} className="lottery-step" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: index * 0.08 }}>
              <div className="lottery-step__top"><span>{number}</span><Icon size={20} /></div><h3>{title}</h3><p>{copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="lottery-terminal-wrap" id="lottery-terminal" aria-labelledby="lottery-terminal-title">
        <div className="lottery-terminal__bar"><div><span className="lottery-live-dot" /><span id="lottery-terminal-title">LIVE LOTTERY TERMINAL</span></div><a href={EXPLORER_URL} target="_blank" rel="noreferrer">Verify contract <ExternalLink size={14} /></a></div>
        <Lottery provider={provider} address={address} onConnect={connect} isPolygon={isPolygon} switchToPolygon={switchToPolygon} />
      </section>

      <section className="lottery-transparency" id="lottery-transparency" aria-labelledby="lottery-transparency-title">
        <div className="lottery-transparency__intro"><span className="lottery-eyebrow">READ BEFORE PARTICIPATING</span><h2 id="lottery-transparency-title">Clear mechanics.<br /><em>No invented guarantees.</em></h2><p>These details reflect the repository's verified Solidity source and Polygon deployment manifest. Verification confirms published source matching the deployed bytecode; it is not an independent security review.</p><a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="lottery-contract-link"><Fingerprint size={16} /> {LOTTERY_ADDRESS.slice(0, 10)}…{LOTTERY_ADDRESS.slice(-8)} <ExternalLink size={14} /></a></div>
        <div className="lottery-transparency__facts">
          <article><Clock3 /><div><h3>60-day lock</h3><p>The source requires 60 days from the owner starting a round before selection.</p></div></article>
          <article><Users /><div><h3>Five winners · minimum five entrants</h3><p>Selection is owner-triggered and reverts unless at least five players have entered.</p></div></article>
          <article><Coins /><div><h3>Separate assets</h3><p>Entry deposits are OKBOND. The per-winner reward is calculated from the contract's POL balance.</p></div></article>
          <article><ShieldAlert /><div><h3>Understand the risks</h3><p>Randomness uses block data rather than Chainlink VRF; the source lists owner-only selection. No independent audit is recorded in the manifest.</p></div></article>
        </div>
      </section>

      <section className="lottery-faq" aria-labelledby="lottery-faq-title"><div className="lottery-section__heading"><span className="lottery-eyebrow">THE DETAILS</span><h2 id="lottery-faq-title">Questions worth asking.</h2></div><div className="lottery-faq__grid">{faqs.map((item) => <details key={item.q} className="lottery-faq__item"><summary><span><CircleHelp size={17} /> {item.q}</span><span className="lottery-faq__plus" aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>
      <footer className="lottery-footer"><span>OKBOND LOTTERY · POLYGON POS</span><a href={EXPLORER_URL} target="_blank" rel="noreferrer">Source verified on PolygonScan <ExternalLink size={13} /></a></footer>
    </div>
  );
}
