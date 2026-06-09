import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Mail, Send } from "lucide-react";

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

interface ContactOption {
  id: "whatsapp" | "email";
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

const greetings = [
  "Hello! 👋 How can I help?",
  "Welcome! 🌟 Let's connect.",
  "Hi there! 💬 Need assistance?",
  "Greetings! 🚀 What can I do?",
];

export default function PremiumAIBot() {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(greetings[0]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const blinkTimerRef = useRef<number | null>(null);
  const talkTimerRef = useRef<number | null>(null);

  // Random greeting on mount
  useEffect(() => {
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(randomGreeting);
  }, []);

  // Blinking animation
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    blinkTimerRef.current = window.setInterval(triggerBlink, 3000 + Math.random() * 2000);
    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    };
  }, []);

  // Talking animation when hovering
  const handleMouseEnter = () => {
    setIsTalking(true);
    if (talkTimerRef.current) clearTimeout(talkTimerRef.current);
    talkTimerRef.current = window.setTimeout(() => setIsTalking(false), 2000);
  };

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
        bottom: "calc(max(env(safe-area-inset-bottom), 4px) + 20px)",
        right: "max(14px, env(safe-area-inset-right))",
      }}
    >
      {/* ─────────────── Contact Panel ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative rounded-3xl overflow-hidden pointer-events-auto"
            style={{
              width: "min(340px, calc(100vw - 28px))",
              background: "linear-gradient(135deg, #0a0a0a 0%, #1a1410 100%)",
              border: `2px solid ${GOLD}55`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${GOLD}22, inset 0 1px 0 ${GOLD}11`,
            }}
          >
            {/* Header with Bot Greeting */}
            <div
              className="relative px-5 py-4"
              style={{
                background: `linear-gradient(135deg, ${GOLD}15 0%, ${GOLD}08 100%)`,
                borderBottom: `1px solid ${GOLD}33`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0 pt-1">
                  <img
                    src="/marcus-bot.jpg"
                    alt="AI Bot"
                    className="w-12 h-12 rounded-full object-cover"
                    style={{
                      border: `2px solid ${GOLD}`,
                      boxShadow: `0 0 16px ${GOLD}44`,
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                    style={{
                      background: "#22c55e",
                      border: "2px solid #0a0a0a",
                      boxShadow: "0 0 8px #22c55e",
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-tight" style={{ color: GOLD_BRIGHT }}>
                    Premium AI Assistant
                  </p>
                  <p className="text-[11px] mt-1 font-mono tracking-wide" style={{ color: "#22c55e" }}>
                    ● Ready to help
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="p-1 rounded-full hover:opacity-70 transition-opacity"
                  style={{ color: GOLD + "bb" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Greeting Message */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-2xl"
                style={{
                  background: `${GOLD}12`,
                  border: `1px solid ${GOLD}33`,
                }}
              >
                <p className="text-[12px] leading-relaxed text-zinc-200">
                  {greeting}
                </p>
              </motion.div>
            </div>

            {/* Contact Options */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              {contactOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={option.action}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                  style={{
                    background: `${option.color}15`,
                    border: `1.5px solid ${option.color}44`,
                  }}
                >
                  <div
                    className="p-2.5 rounded-xl"
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

            {/* Footer */}
            <div
              className="px-5 py-3 text-center text-[9px] font-mono tracking-wide"
              style={{
                background: `${GOLD}08`,
                borderTop: `1px solid ${GOLD}22`,
                color: GOLD + "88",
              }}
            >
              Powered by Premium AI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────── Main Premium AI Bot Button ─────────────── */}
      <motion.button
        onMouseEnter={handleMouseEnter}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI Bot" : "Open AI Bot"}
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full pointer-events-auto touch-manipulation overflow-hidden group"
        style={{
          width: 80,
          height: 80,
          background: `linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 50%, ${GOLD_DEEP} 100%)`,
          boxShadow: `0 12px 32px ${GOLD}66, 0 0 0 2px ${GOLD}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Outer Glow Ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: GOLD }}
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Bot Image Container */}
        <div className="absolute inset-1 rounded-full overflow-hidden">
          <img
            src="/marcus-bot.jpg"
            alt="AI Bot"
            className="w-full h-full object-cover"
          />

          {/* Overlay Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)",
              backdropFilter: "blur(1px)",
            }}
          />
        </div>

        {/* Eyes Blinking Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scaleY: isBlinking ? 0.1 : 1,
            }}
            transition={{ duration: 0.15 }}
            className="flex gap-4"
          >
            <div
              className="w-2 h-3 rounded-full"
              style={{
                background: "#fde68a",
                boxShadow: `0 0 8px ${GOLD}`,
              }}
            />
            <div
              className="w-2 h-3 rounded-full"
              style={{
                background: "#fde68a",
                boxShadow: `0 0 8px ${GOLD}`,
              }}
            />
          </motion.div>
        </div>

        {/* Mouth Animation (Talking) */}
        {isTalking && (
          <motion.div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-none"
            animate={{ scaleY: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <div
              className="w-4 h-2 rounded-full"
              style={{
                background: "#fde68a",
                boxShadow: `0 0 6px ${GOLD}`,
              }}
            />
          </motion.div>
        )}

        {/* Shine/Gloss Effect */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        {/* Pulse Indicator */}
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 rounded-full pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: "#22c55e",
            boxShadow: "0 0 12px #22c55e",
          }}
        />
      </motion.button>

      {/* ─────────────── Floating Label ─────────────── */}
      {!open && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-mono px-3 py-1.5 rounded-full pointer-events-none"
          style={{
            background: `${GOLD}22`,
            border: `1px solid ${GOLD}44`,
            color: GOLD,
          }}
        >
          Premium AI
        </motion.div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes aiGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.8); }
        }
      `}</style>
    </div>
  );
}
