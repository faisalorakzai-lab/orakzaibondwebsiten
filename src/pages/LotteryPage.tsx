import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { Link } from "wouter";
import Lottery from "@/components/Lottery";
import { useWallet } from "@/hooks/useWallet";

export default function LotteryPage() {
  const { address, connect, provider, isPolygon, switchToPolygon } = useWallet();

  return (
    <div className="w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <main className="flex-1 container mx-auto px-4 py-24 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/">
              <motion.button
                whileHover={{ x: -4 }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group cursor-pointer"
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
                Participate in our unique smart Lottery where capital is 100% protected. 
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

        {/* Main Component */}
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

        {/* Claim Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {/* Button 1: Claim Reward (Winners Only) - Gold Theme */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(234,179,8,0.6)" }}
            whileTap={{ scale: 0.98 }}
            className="relative h-16 rounded-2xl font-extrabold text-base bg-gradient-to-r from-primary via-yellow-400 to-primary text-primary-foreground transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden"
            style={{
              boxShadow: "0 0 30px rgba(234,179,8,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon and Text */}
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10 flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Claim Reward (Winners Only)</span>
            </motion.div>
          </motion.button>

          {/* Button 2: Claim Capital (Non-Winners) - Silver/Outlined Gold Theme */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234,179,8,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="relative h-16 rounded-2xl font-extrabold text-base bg-transparent border-2 border-primary/60 text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {/* Icon and Text */}
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Claim Capital (Non-Winners)</span>
            </motion.div>
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
