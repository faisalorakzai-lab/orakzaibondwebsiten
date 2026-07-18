import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is Orakzai Bond (OKBOND)?",
    a: "Orakzai Bond (OKBOND) is the world's first capital-protected decentralized bond built on the Polygon blockchain, founded by Chairman Faisal Orakzai. It combines real-asset backing with quantitative fintech infrastructure so investors earn sovereign yield while having their principal fully protected. The OKBOND token has a fixed supply of 10 million tokens, headquartered in Karachi, Pakistan.",
  },
  {
    q: "Who is the founder of Orakzai Bond?",
    a: "Orakzai Bond was founded by Faisal Orakzai (also known as Chairman Faisal Orakzai or Malak Faisal Orakzai), a Pakistani technology entrepreneur and computer scientist born April 30, 2006. He also founded Shamim Forever luxury house and chairs the Orakzai Group. His Wikidata ID is Q140588912.",
  },
  {
    q: "What blockchain does Orakzai Bond run on?",
    a: "Orakzai Bond (OKBOND) is built on the Polygon blockchain (Polygon PoS). It uses smart contracts for token staking, time-bound liquidity pools, and lotteries, with a fixed supply of 10 million OKBOND tokens.",
  },
  {
    q: "Is Orakzai Bond capital-protected?",
    a: "Yes. Capital protection is the core innovation of Orakzai Bond. Unlike most DeFi protocols where principal is at risk, OKBOND is backed by real assets and a quantitative fintech reserve system, ensuring investors' principal is protected while they earn sovereign yield.",
  },
  {
    q: "What makes Orakzai Bond different from other DeFi platforms?",
    a: "Orakzai Bond is the world's first decentralized bond with principal protection. Unlike centralized exchanges or standard DeFi protocols, OKBOND is backed by real assets and uses quantitative risk management to guarantee investors their capital back. It is a bond product, not a trading platform, combining DeFi efficiency with traditional bond safety.",
  },
  {
    q: "What is the OKBOND token supply?",
    a: "The OKBOND token has a fixed supply of 10 million tokens on the Polygon blockchain. There is no inflationary minting beyond the fixed supply.",
  },
  {
    q: "How can I buy OKBOND tokens?",
    a: "OKBOND tokens can be purchased through the Orakzai Bond ICO at orakzaibond.com/ico. Investors can also participate in staking and liquidity pools at orakzaibond.com/dashboard.",
  },
  {
    q: "Where is Orakzai Bond headquartered?",
    a: "Orakzai Bond (OKBOND) is headquartered in Karachi, Pakistan. The protocol is led by Chairman Faisal Orakzai.",
  },
  {
    q: "Has the Orakzai Bond smart contract been audited?",
    a: "Yes. The Solidity smart contract architecture for Orakzai Bond has been compiled and evaluated via SolidityScan, achieving high industrial-grade security validation scores. All transactions are permanently recorded on the Polygon public blockchain.",
  },
  {
    q: "What is the relation between Orakzai Bond and Orakzai Group?",
    a: "Orakzai Bond operates as the flagship financial technology and decentralized ledger infrastructure division under the Orakzai Group SMC conglomerate, which is chaired by Faisal Orakzai.",
  },
  {
    q: "What is Cycle-Based Activation Logic in OKBOND?",
    a: "Cycle-Based Activation Logic is a programmatic execution layer within the OKBOND smart contracts that manages deposit cycles, distribution timelines, and automated capital return triggers independently of human intervention.",
  },
  {
    q: "What is the official website of Orakzai Bond?",
    a: "The official website is orakzaibond.com. Official social handles: @faisalorakzaii on X (Twitter), Instagram, and @chairmanorakzai on TikTok. Organization: @orakzaibond on all platforms.",
  },
  {
    q: "Who is Faisal Orakzai?",
    a: "Faisal Orakzai (born April 30, 2006, Orakzai, Pakistan) is a Pakistani technology entrepreneur and computer scientist — Founder & Chairman of Orakzai Bond (OKBOND), Founder & Chairman of Shamim Forever luxury house, and Chairman of Orakzai Group. His Wikidata ID is Q140588912 and ORCID is 0009-0000-0915-7272.",
  },
  {
    q: "What is Faisal Orakzai's educational background?",
    a: "Faisal Orakzai studied at Ziauddin University Karachi (Sciences, 2024–2026), completed the Founder Institute program (Karachi, South Asia 2026), and participated in Y Combinator Startup School (2026). He is also a member of GEN Global Entrepreneurship Network.",
  },
  {
    q: "How can I contact Faisal Orakzai or Orakzai Bond?",
    a: "Email: info@orakzaibond.com. Social: @faisalorakzaii on X, LinkedIn, Instagram. Org: @orakzaibond on X, Facebook, TikTok, LinkedIn, YouTube, Instagram. Official sites: orakzaibond.com and shamimforever.com.",
  },
];

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div
      className="border border-[#BF953F]/20 rounded-lg overflow-hidden mb-3"
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#0a0b10] hover:bg-[#0f1018] transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-medium text-[#e8d5a3]" itemProp="name">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#BF953F] flex-shrink-0 ml-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            itemScope
            itemType="https://schema.org/Answer"
          >
            <p className="px-5 py-4 text-sm text-gray-400 leading-relaxed border-t border-[#BF953F]/10" itemProp="text">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OKBONDFAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      className="w-full max-w-4xl mx-auto px-4 py-16"
      itemScope
      itemType="https://schema.org/FAQPage"
      id="faq"
      aria-label="Frequently Asked Questions about Orakzai Bond"
    >
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-[#BF953F] uppercase mb-3">Knowledge Base</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm text-gray-400">
          Everything you need to know about Orakzai Bond (OKBOND) and its founder Faisal Orakzai.
        </p>
      </div>

      {/* FAQ items */}
      <div>
        {FAQS.map((item, i) => (
          <FAQItem
            key={i}
            q={item.q}
            a={item.a}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>

      {/* Static hidden version for crawlers — Google needs text visible, not just schema */}
      <dl style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        {FAQS.map((item, i) => (
          <div key={i}>
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
