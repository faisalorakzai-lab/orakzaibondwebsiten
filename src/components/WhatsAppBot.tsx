import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

const WA_NUMBER = "923367970004";
const WA_MESSAGE = "Hello Orakzai Team, I want to know more about OKBOND.";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;
const WA_GREEN = "#25D366";

export default function WhatsAppBot() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
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

  return (
    <div
      ref={ref}
      className="fixed z-[9999] flex flex-col items-end gap-3"
      style={{ bottom: "24px", right: "20px" }}
    >
      {/* ── Tooltip / Chat bubble ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1      }}
            exit={  { opacity: 0, y: 12,  scale: 0.92   }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{
              width: 272,
              background: "#111b21",
              border: "1px solid rgba(37,211,102,0.25)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(37,211,102,0.12)",
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "#1f2c34" }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: WA_GREEN + "20", border: `2px solid ${WA_GREEN}40` }}
              >
                <img
                  src="/faisal-orakzai.jpg"
                  alt="Faisal Orakzai"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-none mb-0.5">Faisal Orakzai</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: WA_GREEN }} />
                  <p className="text-[10px] font-mono" style={{ color: WA_GREEN }}>Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full opacity-40 hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            {/* Chat body */}
            <div className="px-4 py-4" style={{ background: "#0b141a" }}>
              {/* Received bubble */}
              <div className="flex items-end gap-2 mb-4">
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[220px]"
                  style={{ background: "#1f2c34" }}
                >
                  <p className="text-[13px] text-gray-100 leading-snug">
                    Hi! I'm <span className="font-bold text-white">Faisal Orakzai</span>. Need help with OKBOND? Click to chat with us directly!
                  </p>
                  <p
                    className="text-[10px] text-right mt-1.5 font-mono"
                    style={{ color: "#8696a0" }}
                  >
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" "}✓✓
                  </p>
                </div>
              </div>

              {/* CTA button */}
              <motion.a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-extrabold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)`,
                  color: "#fff",
                  boxShadow: `0 4px 20px rgba(37,211,102,0.35)`,
                }}
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </motion.a>
            </div>

            {/* Speech-bubble tail */}
            <div
              className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
              style={{ background: "#0b141a", border: "1px solid rgba(37,211,102,0.15)", borderTop: "none", borderLeft: "none" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center rounded-full shadow-xl"
        style={{
          width: 56,
          height: 56,
          background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)`,
          boxShadow: `0 4px 24px rgba(37,211,102,0.45)`,
          flexShrink: 0,
        }}
      >
        {/* Pulse rings */}
        {!open && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: WA_GREEN }}
              animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: WA_GREEN }}
              animate={{ scale: [1, 1.85], opacity: [0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
          </>
        )}

        {/* WhatsApp SVG */}
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 relative z-10">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.button>
    </div>
  );
}
