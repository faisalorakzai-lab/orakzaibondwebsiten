import { Navbar, Footer } from "@/components/layout/Shell";
import { motion } from "framer-motion";

export default function Vision() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">The 2100 Vision</h1>
            <p className="text-primary font-mono tracking-widest uppercase max-w-2xl mx-auto">
              Constructing a Self-Sustaining Sovereign Grid
            </p>
          </motion.div>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-primary/20 hidden md:block" />

            <div className="space-y-24 relative z-10">
              {[
                {
                  year: "CURRENT",
                  title: "The 12-Company Foundation",
                  desc: "Establishing dominance across real estate, energy, finance, agriculture, logistics, hospitality, technology, healthcare, education, media, defense-tech, and asset tokenization."
                },
                {
                  year: "PHASE II",
                  title: "RWA On-Chain Migration",
                  desc: "Deployment of $OKBOND as the central liquidity routing mechanism, collateralizing the physical empire into a fluid, yield-bearing sovereign instrument."
                },
                {
                  year: "PHASE III",
                  title: "Ecosystem Interoperability",
                  desc: "Internal value transfer networks where subsidiaries act as both providers and consumers, shielding the group from external market shocks."
                },
                {
                  year: "YEAR 2100",
                  title: "The Sovereign Grid",
                  desc: "A fully autonomous, multi-generational financial and industrial machine. Absolute capital resilience. The ultimate institutional legacy."
                }
              ].map((phase, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="inline-block px-3 py-1 border border-secondary text-secondary font-mono text-xs mb-4">
                      {phase.year}
                    </div>
                    <h3 className="text-2xl font-serif text-primary mb-4">{phase.title}</h3>
                    <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-md ml-auto mr-0">
                      {phase.desc}
                    </p>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full border-4 border-background bg-primary z-10 hidden md:block" />
                  
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
