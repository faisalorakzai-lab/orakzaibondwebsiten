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

function WhatsAppGlyph({ className = "w-6 h-6", fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppBot() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close card on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      ref={ref}
      className="fixed z-[9999] flex flex-col items-end gap-3 pointer-events-none"
      style={{
        bottom: "max(20px, env(safe-area-inset-bottom))",
        right: "max(18px, env(safe-area-inset-right))",
      }}
    >
      {/* ─────────────── Chat Card ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            role="dialog"
            aria-label="Chat with Chairman Faisal Orakzai"
            className="relative rounded-2xl overflow-hidden pointer-events-auto"
            style={{
              width: "min(320px, calc(100vw - 32px))",
              background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 18px 60px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD}22, 0 0 30px ${GOLD}1f`,
            }}
          >
            {/* Header (WhatsApp-style chat header w/ gold accents) */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "linear-gradient(135deg, #1a1408 0%, #0d0a04 100%)",
                borderBottom: `1px solid ${GOLD}33`,
              }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-full overflow-hidden"
                  style={{
                    background: "#000",
                    border: `2px solid ${GOLD}`,
                    boxShadow: `0 0 14px ${GOLD}55`,
                  }}
                >
                  <img
                    src="/chairman-portrait.jpg"
                    alt="Chairman Faisal Orakzai"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/faisal-orakzai.jpg";
                    }}
                  />
                </div>
                {/* Online dot */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                  style={{
                    background: "#22c55e",
                    border: "2px solid #0d0a04",
                    boxShadow: "0 0 8px rgba(34,197,94,0.7)",
                  }}
                />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className="text-[14px] font-bold leading-tight truncate"
                    style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}
                  >
                    Chairman Faisal Orakzai
                  </p>
                  <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                </div>
                <p className="text-[10.5px] mt-0.5 font-mono tracking-wide" style={{ color: "#22c55e" }}>
                  ● Online
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat card"
                className="p-1.5 rounded-full transition-colors"
                style={{ color: GOLD + "cc" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = GOLD + "1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body — chat-style message bubble */}
            <div
              className="px-4 py-4"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(212,175,55,0.06), transparent 60%), #050505",
              }}
            >
              <div className="flex items-end gap-2 mb-4">
                <div
                  className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[260px]"
                  style={{
                    background: "linear-gradient(135deg, #15110a 0%, #0c0905 100%)",
                    border: `1px solid ${GOLD}22`,
                  }}
                >
                  <p className="text-[13px] leading-snug" style={{ color: "#f5e9c8" }}>
                    How can I assist you with your investment goals?
                  </p>
                  <p className="text-[10px] text-right mt-1.5 font-mono" style={{ color: GOLD + "99" }}>
                    {timeNow} <span style={{ color: GOLD }}>✓✓</span>
                  </p>
                </div>
              </div>

              {/* Start Chat CTA */}
              <motion.a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-extrabold tracking-wide"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 50%, ${GOLD_DEEP} 100%)`,
                  color: "#0a0a0a",
                  boxShadow: `0 6px 22px ${GOLD}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                  textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <WhatsAppGlyph className="w-4 h-4" fill="#0a0a0a" />
                Start Chat
              </motion.a>

              {/* Hint */}
              <p
                className="text-[10px] text-center mt-2.5 font-mono"
                style={{ color: GOLD + "88", letterSpacing: "0.04em" }}
              >
                OPENS WHATSAPP · END-TO-END ENCRYPTED
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────── Floating Action Button ─────────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat with Chairman Faisal Orakzai"}
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full pointer-events-auto"
        style={{
          width: 58,
          height: 58,
          background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`,
          boxShadow: `0 8px 28px ${GOLD}66, 0 0 0 1px ${GOLD}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
        }}
      >
        {/* Pulse rings (only when card closed, to attract attention) */}
        {!open && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: GOLD }}
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: GOLD }}
              animate={{ scale: [1, 1.95], opacity: [0.22, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.55 }}
            />
          </>
        )}

        <WhatsAppGlyph className="w-7 h-7 relative z-10 drop-shadow" fill="#0a0a0a" />
      </motion.button>
    </div>
  );
}
