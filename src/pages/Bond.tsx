import { Navbar, Footer } from "@/components/layout/Shell";
import { motion } from "framer-motion";

export default function Bond() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 border-l-2 border-secondary pl-6"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">$OKBOND Security</h1>
            <p className="text-primary font-mono tracking-widest uppercase">The Anatomy of a Sovereign Instrument</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 border border-primary/20 bg-card"
            >
              <h3 className="text-xl font-serif text-primary mb-4 border-b border-primary/20 pb-4">Capital-Protected Mandate</h3>
              <p className="font-mono text-muted-foreground text-sm leading-relaxed mb-4">
                $OKBOND is structurally engineered to preserve principal. Each token is a direct claim on a diversified, uncorrelated basket of hard assets. Market volatility is neutralized by physical backing.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 border border-secondary/30 bg-card relative"
            >
              <div className="absolute inset-0 bg-secondary/5 pointer-events-none" />
              <h3 className="text-xl font-serif text-secondary mb-4 border-b border-secondary/30 pb-4">RWA Backing Architecture</h3>
              <ul className="font-mono text-muted-foreground text-sm space-y-3">
                <li className="flex items-center gap-2"><span className="text-secondary">■</span> Sovereign-Grade Real Estate</li>
                <li className="flex items-center gap-2"><span className="text-secondary">■</span> Audited Gold Reserves</li>
                <li className="flex items-center gap-2"><span className="text-secondary">■</span> Revenue from 12 Operating Subsidiaries</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-12 border border-primary/20 bg-background relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <h2 className="text-2xl font-serif text-primary mb-8 text-center">Initialization Protocol (ICO)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
              {[
                { step: "01", title: "Connect", desc: "Web3 Wallet Integration" },
                { step: "02", title: "Acquire", desc: "USDT/USDC Funding" },
                { step: "03", title: "Access", desc: "Official ICO Portal" },
                { step: "04", title: "Verify", desc: "KYC/AML Clearance" },
                { step: "05", title: "Confirm", desc: "Token Allocation" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full border border-primary text-primary flex items-center justify-center font-mono text-sm mb-4 bg-background">
                    {item.step}
                  </div>
                  <h4 className="font-serif text-foreground mb-2">{item.title}</h4>
                  <p className="text-xs font-mono text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <a 
                href="https://wa.me/923367970004" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-all font-mono tracking-widest text-sm"
              >
                REQUEST ALLOCATION
              </a>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
