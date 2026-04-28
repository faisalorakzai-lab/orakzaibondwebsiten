import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar, Footer } from "@/components/layout/Shell";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Sovereign Grid" className="w-full h-full object-cover opacity-40 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
                <span className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                <span className="font-mono text-xs text-primary uppercase tracking-[0.2em]">Institutional Wealth Strategy 2100</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
                Absolute <span className="text-primary">Capital</span>.<br />
                Sovereign <span className="text-secondary">Authority</span>.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground font-mono leading-relaxed mb-10 max-w-2xl">
                The on-chain wealth strategy console of an alternate-future sovereign. 
                $OKBOND is a capital-protected, RWA-backed digital instrument from the Orakzai Group.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/bond" 
                  className="px-8 py-4 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-all font-mono font-bold tracking-widest text-center border border-transparent hover:border-secondary"
                  data-testid="btn-hero-invest"
                >
                  INITIALIZE INVESTMENT
                </Link>
                <Link 
                  href="/whitepaper"
                  className="px-8 py-4 border border-primary text-primary hover:bg-primary/10 transition-all font-mono tracking-widest text-center backdrop-blur-sm"
                  data-testid="btn-hero-whitepaper"
                >
                  VIEW WHITEPAPER
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-32 bg-card relative z-10 border-y border-primary/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 border border-primary/20 bg-background/50 backdrop-blur-sm relative group hover:border-primary transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-primary font-mono text-xl mb-4">01. Capital Protection</h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  Principal unconditionally reserved. Your wealth is shielded against market volatility through sovereign-grade physical backing.
                </p>
              </div>
              <div className="p-8 border border-primary/20 bg-background/50 backdrop-blur-sm relative group hover:border-primary transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-primary font-mono text-xl mb-4">02. RWA Backing</h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  Tokenized real-world assets. Supported by the Orakzai 12-company portfolio, real estate, and audited gold reserves.
                </p>
              </div>
              <div className="p-8 border border-primary/20 bg-background/50 backdrop-blur-sm relative group hover:border-primary transition-colors">
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-primary font-mono text-xl mb-4">03. 2100 Vision</h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  Participation in a multi-generational sovereign grid. A self-sustaining economic ecosystem spanning 12 vital industries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
