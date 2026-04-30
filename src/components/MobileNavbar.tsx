// Orakzai Terminal — mobile-only top bar (< 1024px).
//
// This component renders ONLY when useIsDesktop() returns false. The full
// <Navbar/> (with inline desktop nav links, language dropdown, etc.) is
// not even imported into the React tree at mobile widths — eliminating
// the "double-bar" bug observed in Trust Wallet's in-app browser, where
// CSS-only `hidden md:flex` failed because the in-app webview misreports
// its effective viewport.
//
// LAYOUT: hamburger | logo | language pill | wallet/connect
// HEIGHT: 64px (h-16) — slightly shorter than the desktop bar to give
// mobile users back ~16px of vertical real estate.

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

interface MobileNavbarProps {
  address: string | null;
  onConnect: () => void;
  onMenuToggle?: () => void;
}

export default function MobileNavbar({
  address,
  onConnect,
  onMenuToggle,
}: MobileNavbarProps) {
  const [langOpen, setLangOpen] = useState(false);
  const { lang: activeCode, setLang, available: LANGUAGES } = useLanguage();
  const activeLang =
    LANGUAGES.find((l) => l.code === activeCode) || LANGUAGES[0];

  const truncatedAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <motion.nav
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-md"
      // Force GPU layer so the sticky bar never tears or ghosts on Android
      // in-app browsers when the page scrolls under heavy filter children.
      style={{ transform: "translate3d(0,0,0)", WebkitBackfaceVisibility: "hidden" }}
    >
      <div className="px-3 h-16 flex items-center justify-between gap-2">
        {/* ── Left: hamburger + logo ─────────────────────────────────── */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg border border-border/70 bg-background/60 active:bg-primary/10 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50 flex-shrink-0">
                <img
                  src="/okbond-logo.png"
                  alt="OKBOND"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground truncate">
                Orakzai Bond
              </span>
            </div>
          </Link>
        </div>

        {/* ── Right: lang + wallet ───────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language pill — compact, opens a dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-border/70 bg-background/60 text-xs font-medium text-foreground active:bg-primary/10"
              aria-label="Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono uppercase">{activeLang.code}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                    style={{ transform: "translate3d(0,0,0)" }}
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm active:bg-primary/10"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-6">
                            {l.code.toUpperCase()}
                          </span>
                          <span className="text-foreground">{l.label}</span>
                          <span className="text-muted-foreground text-xs">{l.native}</span>
                        </span>
                        {activeLang.code === l.code && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet — compact pill on mobile */}
          {address ? (
            <div className="px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono text-xs">
              {truncatedAddress}
            </div>
          ) : (
            <Button
              onClick={onConnect}
              className="metallic-gold text-primary-foreground font-bold rounded-full px-3 py-1.5 text-xs h-auto"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
