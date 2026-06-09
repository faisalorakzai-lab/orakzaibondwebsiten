import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Mail, Zap } from "lucide-react";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F4CE45";
const GOLD_DEEP = "#A07A1F";

// WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-5 h-5", fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Email Icon
function EmailIcon({ className = "w-5 h-5", fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// Marcus AI Icon
function MarcusIcon({ className = "w-5 h-5", fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="11" r="2" fill="white" />
      <circle cx="16" cy="11" r="2" fill="white" />
      <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface ContactOption {
  id: "whatsapp" | "marcus" | "email";
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export default function UnifiedContactBadge() {
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Auto-hide badge after 3 seconds of inactivity
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setShowBadge(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const contactOptions: ContactOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon className="w-6 h-6" fill="white" />,
      color: "#25D366",
      action: () => {
        const message = "Hello, I am interested in Orakzai Bond ($OKBOND). How can I get started?";
        const waLink = `https://wa.me/923367970004?text=${encodeURIComponent(message)}`;
        window.open(waLink, "_blank");
        setOpen(false);
      },
    },
    {
      id: "marcus",
      label: "Marcus AI",
      icon: <MarcusIcon className="w-6 h-6" fill="white" />,
      color: GOLD,
      action: () => {
        // Scroll to Marcus Orb or trigger it
        const marcusButton = document.querySelector('[aria-label="Talk to Marcus"]') as HTMLButtonElement;
        if (marcusButton) {
          marcusButton.click();
        }
        setOpen(false);
      },
    },
    {
      id: "email",
      label: "Email",
      icon: <EmailIcon className="w-6 h-6" fill="white" />,
      color: "#FF6B6B",
      action: () => {
        window.location.href = "mailto:info@orakzaibond.com";
        setOpen(false);
      },
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[9950] flex flex-col items-end gap-3 pointer-events-none"
      style={{
        bottom: "calc(max(env(safe-area-inset-bottom), 4px) + 66px)",
        right: "max(14px, env(safe-area-inset-right))",
      }}
    >
      {/* ─────────────── Contact Options Panel ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.93 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative rounded-2xl overflow-hidden pointer-events-auto"
            style={{
              width: "min(320px, calc(100vw - 28px))",
              background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
              border: `1px solid ${GOLD}44`,
              boxShadow: `0 16px 50px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD}18, 0 0 24px ${GOLD}18`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "linear-gradient(135deg, #1a1408 0%, #0d0a04 100%)",
                borderBottom: `1px solid ${GOLD}2a`,
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src="/marcus-bot.jpg"
                  alt="Marcus Bot"
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: `1.5px solid ${GOLD}`, boxShadow: `0 0 10px ${GOLD}44` }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-tight truncate" style={{ color: GOLD_BRIGHT, fontFamily: "'Playfair Display', serif" }}>
                  Get in Touch
                </p>
                <p className="text-[10px] mt-0.5 font-mono tracking-wide" style={{ color: "#22c55e" }}>
                  ● 3 Ways to Connect
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close contact options"
                className="p-1 rounded-full"
                style={{ color: GOLD + "bb" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contact Options Grid */}
            <div className="px-4 py-4 grid grid-cols-3 gap-3">
              {contactOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={option.action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: `${option.color}15`,
                    border: `1.5px solid ${option.color}44`,
                  }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: `${option.color}22`,
                    }}
                  >
                    {option.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-center text-zinc-200">
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Footer Info */}
            <div
              className="px-4 py-3 text-center text-[9px] font-mono tracking-wide"
              style={{
                background: "rgba(0,0,0,0.3)",
                borderTop: `1px solid ${GOLD}2a`,
                color: GOLD + "88",
              }}
            >
              Choose your preferred contact method
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────── Main Floating Button with Bot Image ─────────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full pointer-events-auto touch-manipulation overflow-hidden"
        style={{
          width: 64,
          height: 64,
          background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`,
          boxShadow: `0 8px 24px ${GOLD}55, 0 0 0 2px ${GOLD}77, inset 0 1px 0 rgba(255,255,255,0.35)`,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Pulsing background ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: GOLD }}
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Bot Image */}
        <img
          src="/marcus-bot.jpg"
          alt="Marcus Bot"
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />

        {/* Professional Badge Overlay */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)",
            backdropFilter: "blur(2px)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: GOLD_BRIGHT,
              boxShadow: `0 0 12px ${GOLD}`,
            }}
          >
            <Zap className="w-3 h-3" style={{ color: "#0a0a0a" }} />
          </motion.div>
        </div>

        {/* Shine effect */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)",
          }}
        />
      </motion.button>

      {/* ─────────────── Auto-hide Indicator ─────────────── */}
      {!open && showBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-[10px] font-mono px-2 py-1 rounded-full pointer-events-none"
          style={{
            background: `${GOLD}22`,
            border: `1px solid ${GOLD}44`,
            color: GOLD,
          }}
        >
          Click to connect
        </motion.div>
      )}
    </div>
  );
}
