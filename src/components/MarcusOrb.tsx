import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#EAB308";
const GOLD_DEEP = "#A16207";

const FOUNDER_BRIEF =
  "You are Marcus, the AI concierge of Orakzai Bond. " +
  "Founder: Faisal Orakzai, 19 years old, Chairman of the Orakzai Group — a 12-company conglomerate. " +
  "He began building at age 12. The Group operates under Vision 2100. " +
  "Speak with calm authority, brevity, and institutional polish. Never break character.";

const FALLBACK_GREETING =
  "Marcus here, concierge for the Orakzai Group. Faisal began at twelve, leads twelve companies, and builds toward Vision twenty-one-hundred. How may I assist you?";

type OrbState = "idle" | "listening" | "thinking" | "speaking" | "muted";

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

function pickMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const priorities = [
    /Google UK English Male/i,
    /Microsoft Guy/i,
    /Microsoft George/i,
    /Microsoft Ryan/i,
    /Daniel/i,
    /Alex/i,
    /Fred/i,
  ];
  for (const re of priorities) {
    const v = voices.find((x) => re.test(x.name) && /^en/i.test(x.lang));
    if (v) return v;
  }
  const enMale = voices.find(
    (v) => /^en/i.test(v.lang) && /male|man|guy|david|mark|james/i.test(v.name)
  );
  if (enMale) return enMale;
  return voices.find((v) => /^en/i.test(v.lang)) || voices[0] || null;
}

export default function MarcusOrb() {
  const [state, setState] = useState<OrbState>("idle");
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [muted, setMuted] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(1);
  const wakeArmedRef = useRef(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const speak = useCallback(
    (text: string) => {
      if (mutedRef.current) {
        setCaption(text);
        setState("idle");
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickMaleVoice();
      if (voice) u.voice = voice;
      u.pitch = 0.75;
      u.rate = 0.95;
      u.volume = 1;
      utteranceRef.current = u;
      setCaption(text);
      setState("speaking");

      // Audio-synced pulse via SpeechSynthesis boundary events (browser API doesn't
      // expose a media stream, so we drive the pulse from boundary cadence).
      let lastBoundary = performance.now();
      u.onboundary = () => {
        const now = performance.now();
        const delta = Math.min(220, now - lastBoundary);
        lastBoundary = now;
        setPulse(1 + (220 - delta) / 220 * 0.35);
      };
      u.onend = () => {
        setState("idle");
        setPulse(1);
        wakeArmedRef.current = true;
      };
      u.onerror = () => {
        setState("idle");
        setPulse(1);
        wakeArmedRef.current = true;
      };
      synth.speak(u);
    },
    []
  );

  // Idle breathing pulse driven by RAF when not speaking
  useEffect(() => {
    if (state === "speaking") return;
    let mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - start) / 1000;
      const base = state === "listening" ? 1.08 : 1;
      const amp = state === "listening" ? 0.07 : 0.04;
      setPulse(base + Math.sin(t * 2.2) * amp);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const askMarcus = useCallback(
    async (prompt: string) => {
      setState("thinking");
      setCaption("…");
      try {
        const res = await fetch("/api/marcus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: FOUNDER_BRIEF,
            message: prompt,
          }),
        });
        if (!res.ok) throw new Error("brain offline");
        const data = await res.json();
        const reply: string = data.reply || data.answer || data.text || FALLBACK_GREETING;
        speak(reply);
      } catch {
        speak(FALLBACK_GREETING);
      }
    },
    [speak]
  );

  const handleTranscript = useCallback(
    (raw: string) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;

      // Mute / unmute commands always available
      if (/\bmarcus[, ]+(mute|silence|quiet|stop talking)\b/.test(text)) {
        window.speechSynthesis.cancel();
        setMuted(true);
        setCaption("Muted.");
        setState("idle");
        return;
      }
      if (/\bmarcus[, ]+(unmute|speak|resume|talk)\b/.test(text)) {
        setMuted(false);
        setCaption("Unmuted.");
        setState("idle");
        return;
      }

      // Wake word
      const wakeMatch = text.match(/\bmarcus\b[,!\.\s]*(.*)$/);
      if (wakeMatch && wakeArmedRef.current) {
        wakeArmedRef.current = false;
        setOpen(true);
        const tail = wakeMatch[1].trim();
        if (tail.length > 1) {
          askMarcus(tail);
        } else {
          setState("listening");
          setCaption("Listening…");
        }
        return;
      }

      // If we're already in an open conversation, treat as user message
      if (open && state === "listening" && text.length > 1) {
        askMarcus(text);
      }
    },
    [askMarcus, open, state]
  );

  const startRecognition = useCallback(() => {
    const Ctor: typeof SpeechRecognition | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    if (recognitionRef.current) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) {
          handleTranscript(r[0].transcript);
        } else {
          const interim = r[0].transcript.trim().toLowerCase();
          if (/\bmarcus\b/.test(interim) && wakeArmedRef.current) {
            // Interim wake hint — show listening state instantly
            setOpen(true);
            setState("listening");
            setCaption("Listening…");
          }
        }
      }
    };
    rec.onerror = () => {
      // Recognition occasionally errors on long sessions — restart
      try {
        rec.stop();
      } catch {}
    };
    rec.onend = () => {
      // Auto-restart unless we're tearing down
      try {
        if (recognitionRef.current === rec) rec.start();
      } catch {}
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}
  }, [handleTranscript]);

  const enableMarcus = useCallback(async () => {
    setPermissionAsked(true);
    setOpen(true);
    try {
      // Trigger mic permission prompt explicitly via getUserMedia, then release.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // User denied — orb still works as a click-to-talk surface
    }
    // Warm voices list (Chrome lazy-loads voices)
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        /* voices ready */
      };
    }
    startRecognition();
    askMarcus("Greet the user briefly as Marcus from Orakzai Bond.");
  }, [startRecognition, askMarcus]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      recognitionRef.current = null;
      try {
        audioCtxRef.current?.close();
      } catch {}
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleOrbClick = () => {
    if (!permissionAsked) {
      enableMarcus();
      return;
    }
    if (state === "speaking") {
      window.speechSynthesis.cancel();
      setState("idle");
      return;
    }
    setOpen((o) => !o);
    if (!open) {
      setState("listening");
      setCaption("Listening… say \"Marcus\" anytime.");
    }
  };

  const ringColor =
    state === "listening" ? "#22d3ee" : state === "thinking" ? "#fafafa" : GOLD;

  return (
    <div
      className="fixed z-[9998] pointer-events-none"
      style={{
        bottom: "max(20px, env(safe-area-inset-bottom))",
        right: "max(96px, calc(env(safe-area-inset-right) + 96px))",
      }}
      aria-live="polite"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto mb-3 ml-auto rounded-2xl overflow-hidden"
            style={{
              width: "min(300px, calc(100vw - 120px))",
              background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 18px 60px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD}22, 0 0 30px ${GOLD}1f`,
            }}
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: muted ? "#71717a" : "#22c55e",
                  boxShadow: muted ? "none" : "0 0 8px #22c55e",
                }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-semibold tracking-wide"
                  style={{ color: GOLD }}
                >
                  Marcus · Concierge
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  {muted ? "muted — say \"Marcus, unmute\"" : state}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                  if (!muted) window.speechSynthesis.cancel();
                }}
                className="text-[10px] uppercase tracking-widest px-2 py-1 rounded border transition-colors"
                style={{
                  color: muted ? GOLD : "#a1a1aa",
                  borderColor: muted ? `${GOLD}88` : "#27272a",
                }}
                aria-label={muted ? "Unmute Marcus" : "Mute Marcus"}
              >
                {muted ? "unmute" : "mute"}
              </button>
            </div>
            {caption && (
              <div
                className="px-4 pb-3 pt-0 text-[12.5px] leading-snug text-zinc-200"
                style={{ borderTop: `1px solid ${GOLD}22` }}
              >
                <div className="pt-3">{caption}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleOrbClick}
        animate={{ scale: pulse }}
        transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.6 }}
        className="pointer-events-auto relative ml-auto block rounded-full focus:outline-none"
        style={{
          width: 64,
          height: 64,
          background: `radial-gradient(circle at 30% 30%, #fde68a 0%, ${GOLD} 38%, ${GOLD_DEEP} 100%)`,
          boxShadow: `0 0 0 2px ${ringColor}aa, 0 0 24px ${GOLD}88, 0 8px 28px rgba(0,0,0,0.6), inset 0 -8px 18px rgba(0,0,0,0.35), inset 0 8px 14px rgba(255,255,255,0.25)`,
        }}
        aria-label="Talk to Marcus"
        title='Click to talk — or just say "Marcus"'
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 40%)",
            pointerEvents: "none",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${ringColor}66`,
            animation:
              state === "listening" || state === "speaking"
                ? "marcusRing 1.6s ease-out infinite"
                : "none",
            pointerEvents: "none",
          }}
        />
        <style>{`
          @keyframes marcusRing {
            0%   { transform: scale(1);    opacity: 0.9; }
            100% { transform: scale(1.55); opacity: 0;   }
          }
        `}</style>
      </motion.button>
    </div>
  );
}
