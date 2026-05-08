import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Globe, ChevronDown, Check, Menu, Wallet, LogOut, ExternalLink, Copy, CheckCheck, Coins } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface NavbarProps {
  address: string | null;
  okbondBalance?: string | null;
  onConnect: () => void;
  onDisconnect?: () => void;
  onMenuToggle?: () => void;
}


// ── Marcus Status Pill ──────────────────────────────────────────────────────
function MarcusStatusPill() {
  const [status, setStatus] = useState<"live" | "standby" | "unknown">("unknown");

  useEffect(() => {
    let cancelled = false;
    const ping = () => {
      fetch("/api/marcus-status", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled) return;
          setStatus(d && d.status === "live" ? "live" : "standby");
        })
        .catch(() => {
          if (!cancelled) setStatus("standby");
        });
    };
    ping();
    const id = window.setInterval(ping, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const isLive = status === "live";
  const dot = isLive ? "#22c55e" : "#eab308";
  const fg  = isLive ? "#4ade80" : "#fbbf24";
  const bg  = isLive ? "rgba(34,197,94,0.08)" : "rgba(234,179,8,0.06)";
  const bd  = isLive ? "rgba(34,197,94,0.45)" : "rgba(234,179,8,0.40)";

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-semibold tracking-widest uppercase transition-all select-none"
      style={{ borderColor: bd, background: bg, color: fg }}
      title={isLive ? "Marcus AI brain online" : "Marcus AI in standby (scripted fallbacks)"}
      aria-label={isLive ? "Marcus AI live" : "Marcus AI standby"}
    >
      <span
        className="block w-1.5 h-1.5 rounded-full"
        style={{
          background: dot,
          boxShadow: `0 0 6px ${dot}`,
          animation: "marcusPillPulse 1.8s ease-in-out infinite",
        }}
      />
      <span>Marcus {isLive ? "Live" : "Standby"}</span>
      <style>{`
        @keyframes marcusPillPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

export default function Navbar({ address, okbondBalance, onConnect, onDisconnect, onMenuToggle }: NavbarProps) {
  const truncatedAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);

  const { lang: activeLang, setLang, t, LANGUAGES } = useLanguage();

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  // Close wallet dropdown on outside click
  useEffect(() => {
    if (!walletOpen) return;
    const handler = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [walletOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden lg:flex fixed top-0 left-0 right-0 z-[9000] items-center justify-between px-8 h-16 border-b border-border/40"
      style={{ background: "rgba(6,5,2,0.96)", backdropFilter: "blur(20px)" }}
    >
      {/* ── Left: Logo ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/">
          <span
            className="font-extrabold text-sm tracking-[0.25em] uppercase cursor-pointer select-none"
            style={{ color: "#EAB308", textShadow: "0 0 20px rgba(234,179,8,0.4)" }}
          >
            OKBOND
          </span>
        </Link>
      </div>

      {/* ── Centre nav links ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-7 text-sm font-medium text-muted-foreground">
        {/* 1. Home */}
        <Link href="/">
          <span className="hover:text-primary transition-colors cursor-pointer">{t("nav.home")}</span>
        </Link>

        {/* 2. Roadmap */}
        <Link href="/roadmap">
          <span className="hover:text-primary transition-colors cursor-pointer">{t("nav.roadmap")}</span>
        </Link>

        {/* 3. ICO — live badge */}
        <Link href="/ico">
          <span className="relative flex items-center gap-1.5 hover:text-primary transition-colors font-semibold text-primary cursor-pointer">
            {t("nav.ico")}
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[8px] font-bold uppercase tracking-widest leading-none animate-pulse">
              {t("nav.icoLive")}
            </span>
          </span>
        </Link>

        {/* 4. Tokenomics */}
        <Link href="/tokenomics">
          <span className="hover:text-primary transition-colors cursor-pointer">{t("nav.tokenomics")}</span>
        </Link>

        {/* 5. About Us */}
        <Link href="/about">
          <span className="hover:text-primary transition-colors cursor-pointer">{t("nav.aboutUs")}</span>
        </Link>

        {/* 6. Legal Vault */}
        <Link href="/legal">
          <span className="hover:text-primary transition-colors cursor-pointer">Legal</span>
        </Link>
      </div>

      {/* ── Right side: Marcus Status + Language + Wallet ─────────────────── */}
      <div className="flex items-center gap-3">

        {/* Marcus AI live/standby status pill */}
        <MarcusStatusPill />

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
                    onClick={() => { setLang(lang.code); setLangOpen(false); }}
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
                  {t("nav.language")} · {LANGUAGES.length}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wallet button */}
        {address ? (
          <div className="relative" ref={walletRef}>
            <button
              type="button"
              onClick={() => setWalletOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm transition-all hover:bg-primary/15 active:scale-95 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              title="Wallet options"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #22c55e" }} />
              {truncatedAddress}
              <ChevronDown className={`w-3 h-3 transition-transform ${walletOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Wallet dropdown */}
            <AnimatePresence>
              {walletOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full mt-2 w-60 rounded-xl overflow-hidden z-50"
                  style={{
                    background: "rgba(10,8,3,0.98)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Address */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Connected Wallet</p>
                    <p className="text-xs text-zinc-300 font-mono break-all leading-snug">{address}</p>
                  </div>

                  {/* OKBOND Balance */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">OKBOND Balance</p>
                    <div className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      {okbondBalance !== null ? (
                        <span className="text-sm font-bold font-mono text-yellow-400">
                          {okbondBalance} OKBOND
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">Loading…</span>
                      )}
                    </div>
                  </div>

                  {/* Copy */}
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Address"}
                  </button>

                  {/* PolygonScan */}
                  <a
                    href={`https://polygonscan.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setWalletOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-400 hover:text-primary hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on PolygonScan
                  </a>

                  {/* Divider */}
                  <div className="h-px mx-4 bg-white/5" />

                  {/* Disconnect */}
                  <button
                    type="button"
                    onClick={() => { setWalletOpen(false); onDisconnect?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click-outside for wallet dropdown */}
            {walletOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setWalletOpen(false)} />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConnect();
            }}
            className="flex items-center gap-2 metallic-gold animate-shine-sweep text-primary-foreground font-bold rounded-full px-5 py-2.5 shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:shadow-[0_0_35px_rgba(234,179,8,0.7)] hover:-translate-y-0.5 active:scale-95 text-sm touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Wallet className="w-4 h-4" />
            {t("nav.connect")}
          </button>
        )}
      </div>

      {/* Click-outside to close lang dropdown */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </motion.nav>
  );
}
