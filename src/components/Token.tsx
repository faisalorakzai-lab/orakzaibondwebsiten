import { motion } from "framer-motion";
import { CheckCircle2, Shield, Lock, Zap, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const TOKEN_SPECS = [
  {
    icon: <Zap className="w-6 h-6" />,
    label: "Token Name",
    value: "Orakzai Bond",
    detail: "OKBOND",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    label: "Network",
    value: "Polygon",
    detail: "Proof of Stake (PoS)",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    label: "Total Supply",
    value: "10,000,000",
    detail: "Fixed (No Inflation)",
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    label: "Security Lock-up",
    value: "60 Days",
    detail: "Smart Contract Governed",
  },
];

const FEATURES = [
  {
    title: "Smart Contract Audited",
    description: "Verified and secured by professional smart contract auditors. Full transparency and security for all token holders.",
    icon: "🔐",
  },
  {
    title: "No Inflation",
    description: "Fixed supply of 10M OKBOND ensures scarcity and long-term value preservation for investors.",
    icon: "📊",
  },
  {
    title: "60-Day Security Lock",
    description: "Smart contract-governed security lock-up period ensures stability and prevents sudden market manipulation.",
    icon: "⏱️",
  },
  {
    title: "Polygon Network",
    description: "Built on Polygon PoS for fast, low-cost transactions with enterprise-grade security and scalability.",
    icon: "🌐",
  },
];

export default function Token() {
  return (
    <section className="relative min-h-screen py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(234,179,8,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Exit Button */}
        <div className="mb-12">
          <Link href="/">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.span>
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            Token Specifications
          </span>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[0.85]">
            Orakzai Bond<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary drop-shadow-[0_0_50px_rgba(234,179,8,0.7)]">
              OKBOND Token
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A fixed-supply, audited smart contract on Polygon PoS — engineered for scarcity, security, and sustainable value.
          </p>
        </motion.div>

        {/* Token Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {TOKEN_SPECS.map((spec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -8, boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}
                className="relative p-8 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden h-full"
                style={{
                  boxShadow: "0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* Animated neon border glow */}
                <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                {/* Icon */}
                <div className="relative z-10 mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                  {spec.icon}
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-sm font-mono text-muted-foreground/70 uppercase tracking-wider mb-2">
                  {spec.label}
                </h3>
                <p className="relative z-10 text-2xl font-black text-foreground mb-1">
                  {spec.value}
                </p>
                <p className="relative z-10 text-xs text-muted-foreground">
                  {spec.detail}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-foreground mb-12 text-center"
          >
            Why OKBOND?
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}
                  className="relative p-8 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 transition-all duration-300 overflow-hidden h-full"
                  style={{
                    boxShadow: "0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Animated neon border glow */}
                  <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                  {/* Icon */}
                  <div className="relative z-10 text-5xl mb-4">
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h4 className="relative z-10 text-xl font-black text-foreground mb-3">
                    {feature.title}
                  </h4>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security & Audit Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-3xl backdrop-blur-xl border border-primary/30 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden"
          style={{
            boxShadow: "0 0 40px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Animated neon border glow */}
          <div className="absolute inset-0 rounded-3xl border border-primary/50 opacity-20 blur-sm" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-foreground mb-2">
                  Audited Smart Contract
                </h3>
                <p className="text-muted-foreground mb-4">
                  All OKBOND smart contracts have been professionally audited and verified for security, transparency, and compliance. Our audit report is publicly available for full transparency.
                </p>
                <motion.a
                  href="https://drive.google.com/file/d/1uvONnEDac-Z06mrth6TT94N9bRGecyhN/view?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(234,179,8,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary text-primary-foreground transition-all duration-300 relative overflow-hidden group"
                  style={{
                    boxShadow: "0 0 20px rgba(234,179,8,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10">Download Audit Report</span>
                  <ExternalLink className="w-4 h-4 relative z-10" />
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground text-lg mb-6">
            Ready to secure your position in the Orakzai Bond ecosystem?
          </p>
          <motion.a
            href="/ico"
            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-3 text-lg h-16 px-12 rounded-full font-black bg-gradient-to-r from-primary via-yellow-400 to-primary text-primary-foreground transition-all duration-300 relative overflow-hidden group"
            style={{
              boxShadow: "0 0 30px rgba(234,179,8,0.5), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(234,179,8,0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">Buy OKBOND Now</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
