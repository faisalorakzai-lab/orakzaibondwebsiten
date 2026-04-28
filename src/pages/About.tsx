import { Navbar, Footer } from "@/components/layout/Shell";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 border-l-2 border-primary pl-6"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">The Chairman & The Empire</h1>
            <p className="text-secondary font-mono tracking-widest uppercase">Zero to Institutional Powerhouse</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative p-2 border border-primary/20 bg-card"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-secondary z-10" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-secondary z-10" />
              <img 
                src="/chairman.png" 
                alt="Chairman" 
                className="w-full h-auto object-cover filter grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8 font-mono text-muted-foreground leading-relaxed"
            >
              <p>
                From humble beginnings to a sovereign-grade institution, the Orakzai Group represents a relentless pursuit of vertical integration and absolute capital control. Built from zero, it now stands as a 12-company empire.
              </p>
              <p>
                The Chairman's vision transcends typical venture scale. It is a multi-generational blueprint aimed at establishing a self-sustaining economic grid by the year 2100.
              </p>
              <p>
                Spanning real estate, energy, finance, agriculture, logistics, hospitality, technology, healthcare, education, media, defense-tech, and asset tokenization, the Group operates as a private dynasty with institutional rigor.
              </p>

              <div className="pt-8 border-t border-primary/20">
                <a 
                  href="https://wa.me/923367970004" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors uppercase tracking-widest text-sm"
                >
                  Contact The Chairman's Desk
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
