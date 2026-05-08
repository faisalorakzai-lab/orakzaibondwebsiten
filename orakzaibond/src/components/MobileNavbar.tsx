import { Menu, Wallet, LogOut, Copy, CheckCheck, ExternalLink, Coins } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface MobileNavbarProps {
  address: string | null;
  okbondBalance?: string | null;
  onConnect: () => void;
  onDisconnect?: () => void;
  onMenuToggle?: () => void;
}

const GOLD = "#F4CE45";

export default function MobileNavbar({ address, okbondBalance, onConnect, onDisconnect, onMenuToggle }: MobileNavbarProps) {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-[9000] flex items-center justify-between px-4 h-16 border-b border-border/40"
      style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)" }}
    >
      {/* Hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors touch-manipulation"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <button
        type="button"
        onClick={() => setLocation("/")}
        className="absolute left-1/2 -translate-x-1/2 font-extrabold text-sm tracking-widest uppercase touch-manipulation"
        style={{ color: GOLD, WebkitTapHighlightColor: "transparent", textShadow: "0 0 16px rgba(244,206,69,0.4)" }}
      >
        OKBOND
      </button>

      {/* Wallet area */}
      {address ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setWalletOpen((o) => !o)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all touch-manipulation active:scale-95"
            style={{
              borderColor: "rgba(244,206,69,0.35)",
              color: GOLD,
              background: "rgba(244,206,69,0.06)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {`${address.slice(0, 4)}…${address.slice(-4)}`}
          </button>

          {/* Wallet dropdown */}
          {walletOpen && (
            <>
              <div className="fixed inset-0 z-[9901]" onClick={() => setWalletOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-[9902]"
                style={{
                  background: "rgba(10,8,3,0.99)",
                  border: "1px solid rgba(244,206,69,0.25)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Address */}
                <div className="px-3 py-2.5 border-b border-white/5">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Connected</p>
                  <p className="text-xs text-zinc-300 font-mono truncate">{`${address.slice(0, 8)}…${address.slice(-6)}`}</p>
                </div>

                {/* OKBOND Balance */}
                <div className="px-3 py-2.5 border-b border-white/5">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">OKBOND Balance</p>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {okbondBalance !== null ? (
                      <span className="text-xs font-bold font-mono text-yellow-400">
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
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on PolygonScan
                </a>

                {/* Disconnect */}
                <button
                  type="button"
                  onClick={() => { setWalletOpen(false); onDisconnect?.(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/8 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all touch-manipulation active:scale-95"
          style={{
            borderColor: "rgba(244,206,69,0.35)",
            background: "rgba(244,206,69,0.1)",
            color: GOLD,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Wallet className="w-3 h-3" />
          Connect
        </button>
      )}
    </header>
  );
}
