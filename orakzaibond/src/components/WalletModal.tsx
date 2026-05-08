/**
 * WalletModal — shown when the user clicks "Connect Wallet" but MetaMask
 * is not detected, or when there's a wallet error. Gives mobile users a
 * deep-link to open the site inside the MetaMask browser.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

const GOLD = "#D4AF37";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  error?: string | null;
  /** Called when user wants to retry (MetaMask now installed) */
  onRetry: () => void;
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function getDeepLink(): string {
  const domain = window.location.hostname;
  const path   = window.location.pathname;
  return `https://metamask.app.link/dapp/${domain}${path}`;
}

export default function WalletModal({ open, onClose, error, onRetry }: WalletModalProps) {
  const mobile    = isMobile();
  const deepLink  = getDeepLink();
  const noMeta    = error === "no_metamask";
  const otherErr  = error && !noMeta;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="wallet-modal-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            key="wallet-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed z-[10001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(380px,calc(100vw-32px))] rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0f0c03 0%, #080604 100%)",
              border: `1px solid ${GOLD}40`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${GOLD}15, 0 0 40px ${GOLD}12`,
            }}
          >
            {/* Top accent */}
            <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}>
                  <Wallet className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>OKBOND</p>
                  <p className="text-sm font-bold text-white">Connect Wallet</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-3">
              {/* Error banner */}
              {otherErr && (
                <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-snug">{error}</p>
                </div>
              )}

              {noMeta ? (
                <>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {mobile
                      ? "Open this page inside the MetaMask app browser to connect your wallet."
                      : "MetaMask is required to connect. Install the browser extension and refresh."}
                  </p>

                  {/* Mobile: deep link */}
                  {mobile && (
                    <a
                      href={deepLink}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD}, #b8960c)`,
                        color: "#0a0a0a",
                        boxShadow: `0 0 20px ${GOLD}40`,
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in MetaMask App
                    </a>
                  )}

                  {/* Desktop: install link */}
                  {!mobile && (
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD}, #b8960c)`,
                        color: "#0a0a0a",
                        boxShadow: `0 0 20px ${GOLD}40`,
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Install MetaMask
                    </a>
                  )}

                  {/* Retry after install */}
                  {!mobile && (
                    <button
                      onClick={onRetry}
                      className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
                      style={{ color: GOLD, border: `1px solid ${GOLD}30` }}
                    >
                      I've installed MetaMask — Try Again
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Connect your MetaMask wallet to access the OKBOND ecosystem and verify your holdings.
                  </p>
                  <button
                    onClick={() => { onClose(); onRetry(); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD}, #b8960c)`,
                      color: "#0a0a0a",
                      boxShadow: `0 0 20px ${GOLD}40`,
                    }}
                  >
                    <Wallet className="w-4 h-4" />
                    Try Again
                  </button>
                </>
              )}

              {/* Trust note */}
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#22c55e" }} />
                <p className="text-[11px] text-zinc-600">We never ask for your seed phrase or private key.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
