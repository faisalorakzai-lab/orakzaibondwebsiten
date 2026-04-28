import { Navbar, Footer } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { FileText, Download, Shield } from "lucide-react";

export default function Whitepaper() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-4xl w-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 border border-primary/20 bg-card/80 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-full border border-secondary flex items-center justify-center bg-secondary/10 text-secondary mb-4">
                <FileText size={40} />
              </div>
              
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-primary mb-4">Orakzai Bond Protocol</h1>
                <p className="text-secondary font-mono tracking-widest uppercase text-sm">Official Whitepaper v1.0</p>
              </div>

              <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
                Comprehensive documentation of the $OKBOND architecture, detailing the capital protection mechanisms, RWA collateralization proofs, and the smart contract operational matrix governing the sovereign grid.
              </p>

              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background px-4 py-2 border border-primary/10">
                <Shield size={14} className="text-primary" />
                <span>Audited & Verified Architecture</span>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
                <a 
                  href="#"
                  className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-mono tracking-widest uppercase flex items-center justify-center gap-3"
                  data-testid="btn-download-whitepaper"
                >
                  <Download size={18} />
                  Download PDF
                </a>
                <a 
                  href="#"
                  className="px-8 py-4 border border-primary text-primary hover:bg-primary/10 transition-colors font-mono tracking-widest uppercase flex items-center justify-center"
                  data-testid="btn-view-audit"
                >
                  View Audit Report
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
