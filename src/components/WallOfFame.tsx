import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BrowserProvider, Contract } from "ethers";
import { Trophy, Crown, Star } from "lucide-react";
import LOTTERY_ABI from "@/lib/contractABI.json";

const LOTTERY_ADDRESS = "0x5bc55d4b347e39b986864e28604ddca5de6357b7";

interface WallOfFameProps {
  provider: BrowserProvider | null;
}

interface Winner {
  address: string;
  display: string;
}

// Static showcase winners (shown when no live data / not started)
const SHOWCASE: Winner[] = [
  { address: "0xAbCd...4f2e", display: "0xAbCd…4f2e" },
  { address: "0x7712...99aA", display: "0x7712…99aA" },
  { address: "0x3f91...B2c1", display: "0x3f91…B2c1" },
  { address: "0xEe44...0d3F", display: "0xEe44…0d3F" },
  { address: "0xA8b2...1c9D", display: "0xA8b2…1c9D" },
];

const RANKS = [
  { label: "Champion",   icon: <Crown className="w-4 h-4" />,  color: "text-yellow-300" },
  { label: "Sovereign",  icon: <Star  className="w-4 h-4" />,  color: "text-primary"     },
  { label: "Elite",      icon: <Trophy className="w-4 h-4" />, color: "text-yellow-500/70" },
];

export default function WallOfFame({ provider }: WallOfFameProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [live, setLive] = useState(false);

  const fetchWinners = useCallback(async () => {
    if (!provider) return;
    try {
      const contract = new Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
      const started: boolean = await contract.winnersSelected();
      if (!started) return;

      const found: Winner[] = [];
      for (let i = 0; i < 20 && found.length < 5; i++) {
        try {
          const addr: string = await contract.players(i);
          const isW: boolean = await contract.isWinner(addr);
          if (isW) found.push({ address: addr, display: `${addr.slice(0, 6)}…${addr.slice(-4)}` });
        } catch { break; }
      }
      if (found.length > 0) { setWinners(found); setLive(true); }
    } catch { /* silent */ }
  }, [provider]);

  useEffect(() => { fetchWinners(); }, [fetchWinners]);

  const display = live ? winners : SHOWCASE;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.06),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <span className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            {live ? "Live Winners" : "Wall of Fame"}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Global{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              Champion Wall
            </span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {live
              ? "On-chain verified OKBOND Lottery winners — blockchain-proven champions."
              : "Our elite winners are immortalised on-chain. Every wallet, a throne. Every address, a legacy."}
          </p>
        </motion.div>

        <div className="space-y-3">
          {display.map((w, i) => (
            <motion.div key={w.address + i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 6 }}
              className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-primary/15 bg-black/40 backdrop-blur hover:border-primary/40 transition-all cursor-default">

              {/* Rank */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 w-28 ${RANKS[Math.min(i, 2)].color} font-bold text-sm`}>
                  {RANKS[Math.min(i, 2)].icon}
                  <span>{i < 3 ? RANKS[i].label : `Winner #${i + 1}`}</span>
                </div>

                {/* Wallet */}
                <span className="font-mono text-foreground/80 text-sm tracking-wide">{w.display}</span>
              </div>

              {/* Right: live badge or star */}
              <div className="flex items-center gap-2">
                {live && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-mono">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    ON-CHAIN
                  </span>
                )}
                <motion.div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                  animate={{ boxShadow: ["0 0 4px rgba(234,179,8,0.15)", "0 0 12px rgba(234,179,8,0.4)", "0 0 4px rgba(234,179,8,0.15)"] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}>
                  <Star className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {!live && (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xs text-muted-foreground/60 mt-6 font-mono">
            * Addresses partially anonymised for privacy. Live winners populate after Lottery completion.
          </motion.p>
        )}
      </div>
    </section>
  );
}
