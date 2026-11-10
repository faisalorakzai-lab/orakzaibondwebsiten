import { motion } from "framer-motion";
import { Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: Shield, title: "Decentralized Security",
    description: "Built on immutable blockchain technology. No central authority controls your assets — your keys, your wealth." },
  { icon: Zap, title: "Staking & Yield",
    description: "Lock your OKBOND tokens in high-yield staking pools and earn passive income. Power your portfolio while you sleep." },
  { icon: Globe, title: "Global Investment Pools",
    description: "Participate in community-governed investment pools spanning global markets, open to anyone, anywhere." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" as any } }),
};

export default function About() {
  return (
    <section id="about" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,179,8,0.07),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }} className="text-center mb-16">
          <span className="inline-block mb-3 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            About OKBOND
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5 leading-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              Orakzai Global Network
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
            Orakzai Bond is a decentralized financial platform engineered for staking, investment pools, and token utilities — empowering global investors with blockchain-based opportunities.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Founder bio + mission/vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-primary/20 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">The Founder</h3>
            </div>
            <p className="text-primary font-semibold mb-3 text-sm uppercase tracking-wide">
              Faisal Orakzai
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              A Global Visionary and Architect of the Orakzai Group — Faisal Orakzai has built a multi-industry conglomerate from the ground up in Karachi, Pakistan, expanding its reach to international blockchain innovation. His journey reflects the leap from local leadership to building a decentralized global ecosystem designed for the next generation.
            </p>
            <a href="/founder"
              className="inline-flex items-center gap-2 mt-5 text-sm text-primary font-semibold hover:underline">
              Read Full Story →
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become a leading Web3 financial ecosystem — where OKBOND is the currency of power, and every holder is a sovereign participant in a future built on trust, transparency, and unstoppable code.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
