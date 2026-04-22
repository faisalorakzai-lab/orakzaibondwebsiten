import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Lottery from "@/components/Lottery";
import { useWallet } from "@/hooks/useWallet";

export default function LotteryPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} />

      <main className="flex-1 container mx-auto px-4 py-24 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/">
              <motion.button
                whileHover={{ x: -4 }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:animate-pulse" />
                Back to Home
              </motion.button>
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                Sovereign Smart Lottery
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Win Big with <span className="text-primary">Zero Risk</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Participate in our unique smart lottery where capital is 100% protected. 
                Winners take the prize, non-winners get their full deposit back.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:flex flex-col items-center p-6 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
          >
            <ShieldCheck className="w-12 h-12 text-primary mb-3" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Capital Protected</span>
            <span className="text-2xl font-black text-foreground">100% Cashback</span>
          </motion.div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { 
              icon: <Sparkles className="w-5 h-5" />, 
              title: "Transparent Draws", 
              desc: "Fully on-chain logic ensures fairness and transparency." 
            },
            { 
              icon: <ShieldCheck className="w-5 h-5" />, 
              title: "Capital Protection", 
              desc: "Non-winners can claim their full deposit back instantly." 
            },
            { 
              icon: <Trophy className="w-5 h-5" />, 
              title: "Massive Rewards", 
              desc: "Winners share the pool rewards directly to their wallets." 
            }
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Lottery Component */}
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
          <Lottery 
            provider={provider} 
            address={address} 
            onConnect={connect} 
            isPolygon={isPolygon} 
            switchToPolygon={switchToPolygon} 
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
