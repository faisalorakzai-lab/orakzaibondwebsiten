import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, Check, Menu } from "lucide-react";

interface NavbarProps {
  address: string | null;
  onConnect: () => void;
  onMenuToggle?: () => void;
}

const LANGUAGES = [
  { code: "en", label: "English",  native: "English"  },
  { code: "ur", label: "Urdu",     native: "اردو"      },
  { code: "ar", label: "Arabic",   native: "العربية"   },
  { code: "zh", label: "Chinese",  native: "中文"       },
];

export default function Navbar({ address, onConnect, onMenuToggle }: NavbarProps) {
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* ── Left: Hamburger + Logo ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          
          {/* Hamburger Menu Toggle */}
          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </motion.button>

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <motion.div
                className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/50 flex-shrink-0"
                animate={{
                  boxShadow: [
                    "0 0 8px rgba(234,179,8,0.35), 0 0 20px rgba(234,179,8,0.15)",
                    "0 0 16px rgba(234,179,8,0.65), 0 0 40px rgba(234,179,8,0.30)",
                    "0 0 8px rgba(234,179,8,0.35), 0 0 20px rgba(234,179,8,0.15)",
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/okbond-logo.png" alt="OKBOND" className="w-full h-full object-cover" />
              </motion.div>

              <div>
                <motion.h1
                  className="font-bold text-xl tracking-tight"
                  style={{ color: "hsl(var(--foreground))" }}
                  animate={{
                    textShadow: [
                      "0 0 6px rgba(234,179,8,0.0)",
                      "0 0 12px rgba(234,179,8,0.55), 0 0 25px rgba(234,179,8,0.25)",
                      "0 0 6px rgba(234,179,8,0.0)",
                    ],
                  }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  Orakzai Bond
                </motion.h1>
                <span className="text-xs text-primary font-mono font-medium tracking-widest uppercase">OKBOND</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Nav links ──────────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {/* 1. Home */}
          <Link href="/">
            <span className="hover:text-primary transition-colors cursor-pointer">Home</span>
          </Link>

          {/* 2. Liquidity-Backed Principal Security */}
          <Link href="/lottery">
            <span className="hover:text-primary transition-colors cursor-pointer font-semibold text-primary/80">Liquidity-Backed Principal Security</span>
          </Link>

          {/* 3. Token */}
          <Link href="/token">
            <span className="hover:text-primary transition-colors cursor-pointer">Token</span>
          </Link>

          {/* 3b. ICO */}
          <Link href="/ico">
            <span className="relative flex items-center gap-1.5 hover:text-primary transition-colors font-semibold text-primary cursor-pointer">
              ICO
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[8px] font-bold uppercase tracking-widest leading-none animate-pulse">
                Live
              </span>
            </span>
          </Link>

          {/* 4. Stake — coming soon */}
          <span className="relative flex items-center gap-1.5 cursor-default select-none opacity-60">
            Stake
            <span className="px-1.5 py-0.5 rounded-md bg-primary/15 border border-primary/25 text-primary text-[8px] font-bold uppercase tracking-widest leading-none">
              Soon
            </span>
          </span>

          {/* 5. Tokenomics */}
          <Link href="/tokenomics">
            <span className="hover:text-primary transition-colors cursor-pointer">Tokenomics</span>
          </Link>

          {/* 6. About Us */}
          <Link href="/about">
            <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
          </Link>
        </div>

        {/* ── Right side: Language + Wallet ─────────────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Language dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary/30 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-xs font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono">{activeLang.code.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-background/95 backdrop-blur shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setActiveLang(lang); setLangOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-6">{lang.code.toUpperCase()}</span>
                        <span className="text-foreground">{lang.label}</span>
                        <span className="text-muted-foreground text-xs">{lang.native}</span>
                      </span>
                      {activeLang.code === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                  <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground/60 text-center font-mono">
                    Global Reach — 4 Languages
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet button */}
          {address ? (
            <motion.div
              className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm"
              animate={{
                boxShadow: [
                  "0 0 6px rgba(234,179,8,0.15)",
                  "0 0 14px rgba(234,179,8,0.35)",
                  "0 0 6px rgba(234,179,8,0.15)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {truncatedAddress}
            </motion.div>
          ) : (
            <Button
              onClick={onConnect}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 py-5 shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:shadow-[0_0_35px_rgba(234,179,8,0.7)] hover:-translate-y-0.5"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Click-outside to close lang dropdown */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </motion.nav>
  );
}
