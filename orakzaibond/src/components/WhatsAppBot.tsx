import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeCheck } from "lucide-react";

const WA_NUMBER = "923367970004";
const WA_MESSAGE =
  "Hello Chairman Faisal, I am interested in the Orakzai Bond ($OKBOND) ecosystem. How can I get started?";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const GOLD_DEEP = "#A07A1F";

function WhatsAppGlyph({ className = "w-5 h-5", fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppBot() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      ref={ref}
      className="fixed z-[9950] flex flex-col items-end gap-2.5 pointer-events-none"
      style={{
        /* On mobile: sit just above the bottom nav (58px) + safe area + 8px gap */
        bottom: "calc(max(env(safe-area-inset-bottom), 4px) + 66px)",
        right: "max(14px, env(safe-area-inset-right))",
      }}
    >
      {/* ─────────────── Chat Card ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.93 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="dialog"
            aria-label="Chat with Chairman Faisal Orakzai"
            className="relative rounded-2xl overflow-hidden pointer-events-auto"
            style={{
              width: "min(300px, calc(100vw - 28px))",
              background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
              border: `1px solid ${GOLD}44`,
              boxShadow: `0 16px 50px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD}18, 0 0 24px ${GOLD}18`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-3.5 py-2.5"
              style={{
                background: "linear-gradient(135deg, #1a1408 0%, #0d0a04 100%)",
                borderBottom: `1px solid ${GOLD}2a`,
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden"
                  style={{ background: "#000", border: `1.5px solid ${GOLD}`, boxShadow: `0 0 10px ${GOLD}44` }}
                >
                  <img
                    src="/chairman-portrait.jpg"
                    alt="Chairman Faisal Orakzai"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/faisal-orakzai.jpg"; }}
                  />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22c55e", border: "1.5px solid #0d0a04", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[13px] font-bold leading-tight truncate" style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}>
                    Chairman Faisal Orakzai
                  </p>
                  <BadgeCheck className="w-3 h-3 flex-shrink-0" style={{ color: GOLD }} />
                </div>
                <p className="text-[10px] mt-0.5 font-mono tracking-wide" style={{ color: "#22c55e" }}>● Online</p>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-1 rounded-full"
                style={{ color: GOLD + "bb" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-3.5 py-3.5" style={{ background: "radial-gradient(circle at top right, rgba(212,175,55,0.05), transparent 60%), #050505" }}>
              <div className="flex items-end gap-2 mb-3.5">
                <div
                  className="rounded-2xl rounded-tl-sm px-3 py-2 max-w-[240px]"
                  style={{ background: "linear-gradient(135deg, #15110a 0%, #0c0905 100%)", border: `1px solid ${GOLD}1a` }}
                >
                  <p className="text-[12.5px] leading-snug" style={{ color: "#f5e9c8" }}>
                    How can I assist you with your investment goals?
                  </p>
                  <p className="text-[9.5px] text-right mt-1 font-mono" style={{ color: GOLD + "88" }}>
                    {timeNow} <span style={{ color: GOLD }}>✓✓</span>
                  </p>
                </div>
              </div>

              <motion.a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-extrabold tracking-wide pointer-events-auto"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 50%, ${GOLD_DEEP} 100%)`,
                  color: "#0a0a0a",
                  boxShadow: `0 5px 18px ${GOLD}44, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              >
                <WhatsAppGlyph className="w-4 h-4" fill="#0a0a0a" />
                Start Chat
              </motion.a>

              <p className="text-[9px] text-center mt-2 font-mono" style={{ color: GOLD + "66", letterSpacing: "0.04em" }}>
                OPENS WHATSAPP · END-TO-END ENCRYPTED
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────── Floating Button — smaller & safe ─────────────── */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full pointer-events-auto touch-manipulation"
        style={{
          width: 46,
          height: 46,
          background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`,
          boxShadow: `0 6px 20px ${GOLD}55, 0 0 0 1px ${GOLD}77, inset 0 1px 0 rgba(255,255,255,0.35)`,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: GOLD }}
            animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <WhatsAppGlyph className="w-5 h-5 relative z-10" fill="#0a0a0a" />
      </motion.button>
    </div>
  );
}
