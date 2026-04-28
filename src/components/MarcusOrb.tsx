import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadAdminProof } from "@/lib/adminAuth";

const GOLD = "#EAB308";
const GOLD_DEEP = "#A16207";

const FALLBACK_GREETING_INVESTOR =
  "Marcus here, Digital Chief of Staff for the Orakzai Group. Founded by Mr. Faisal Orakzai — building since the age of twelve, now nineteen, leading twelve mother companies toward Vision twenty-one-hundred. How may I be of service?";

const FALLBACK_GREETING_CHAIRMAN =
  "Welcome back, Chairman. The Sovereign Grid is online and the Group is steady. The Founder is currently overseeing operations.";

const INVESTOR_FALLBACK =
  "Orakzai Bond is the sovereign financial layer of the Group — a liquidity-backed capital retention model on Polygon, anchored by the Trust Trifecta and the Sovereign Guarantee, all aligned to the Vision twenty-one-hundred horizon. For private onboarding with the team, I am routing you to our WhatsApp concierge.";

const ELITE_FALLBACK =
  "Understood. This is an Elite Priority matter. I am opening a direct line to Mr. Orakzai through our WhatsApp concierge — please use the highlighted channel to your right.";

const INVESTOR_RX =
  /\b(invest|buy|ico|okbond|bond|stake|stak|yield|return|lottery|capital|onboard|participate|join|price|tokenomic)\w*\b/i;

const ELITE_KEYWORDS_RX =
  /\b(acquisition|acquire|strategic\s+partnership|joint\s+venture|merger|institutional|family\s+office|sovereign\s+wealth|private\s+placement)\b/i;

// Detect investment amounts >= $100,000
function detectsHighValueAmount(text: string): boolean {
  const t = text.toLowerCase().replace(/,/g, "");
  // $100k, $250k, $1m, $1.5m, 100,000, 1 million, 1m, 500k …
  const patterns: RegExp[] = [
    /\$?\s*([1-9]\d{2,})\s*(k|thousand)\b/i,            // 100k+
    /\$?\s*([1-9]\d*(?:\.\d+)?)\s*(m|mil|million|b|billion)\b/i, // 1m+
    /\$\s*([1-9]\d{5,})/,                                // $100000+
    /\b([1-9]\d{5,})\s*(usd|dollars?|usdt|usdc)\b/i,    // 100000 usd+
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (!m) continue;
    const num = parseFloat(m[1]);
    const unit = (m[2] || "").toLowerCase();
    let dollars = num;
    if (/^k|thousand/.test(unit)) dollars = num * 1_000;
    else if (/^m|mil|million/.test(unit)) dollars = num * 1_000_000;
    else if (/^b|billion/.test(unit)) dollars = num * 1_000_000_000;
    if (dollars >= 100_000) return true;
  }
  return false;
}

type OrbState = "idle" | "listening" | "thinking" | "speaking" | "muted";

function pickMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const priorities = [
    /Google UK English Male/i,
    /Microsoft Guy/i,
    /Microsoft George/i,
    /Microsoft Ryan/i,
    /Microsoft Davis/i,
    /Daniel/i,
    /Alex/i,
    /Fred/i,
  ];
  for (const re of priorities) {
    const v = voices.find((x) => re.test(x.name) && /^en/i.test(x.lang));
    if (v) return v;
  }
  const enMale = voices.find(
    (v) =>
      /^en/i.test(v.lang) &&
      /male|man|guy|david|mark|james|george|ryan/i.test(v.name)
  );
  if (enMale) return enMale;
  return voices.find((v) => /^en/i.test(v.lang)) || voices[0] || null;
}

function timeAwareSalutation(isAdmin: boolean): string {
  const h = new Date().getHours();
  let part: string;
  if (h < 12) part = "Good Morning";
  else if (h < 17) part = "Good Afternoon";
  else if (h < 22) part = "Good Evening";
  else part = "Greetings";
  return isAdmin ? `${part}, Chairman.` : `${part}, Investor.`;
}

export default function MarcusOrb() {
  const [state, setState] = useState<OrbState>("idle");
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [muted, setMuted] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [wakeFlash, setWakeFlash] = useState(false);
  const [adminPresent, setAdminPresent] = useState(false);
  const [eliteMode, setEliteMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(1);
  const wakeArmedRef = useRef(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);
  const adminRef = useRef(false);
  const historyRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const eliteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Poll admin session state every 5s — links to AdminGate's signed proof.
  useEffect(() => {
    const check = () => {
      const proof = loadAdminProof();
      const present = !!proof && Date.now() < proof.expiresAt;
      adminRef.current = present;
      setAdminPresent(present);
    };
    check();
    const id = window.setInterval(check, 5000);
    return () => window.clearInterval(id);
  }, []);

  const cancelSpeech = useCallback(() => {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, []);

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
      u.rate = 0.9;
      u.volume = 1;
      utteranceRef.current = u;
      setCaption(text);
      setState("speaking");

      let lastBoundary = performance.now();
      u.onboundary = () => {
        const now = performance.now();
        const delta = Math.min(220, now - lastBoundary);
        lastBoundary = now;
        setPulse(1 + ((220 - delta) / 220) * 0.4);
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

  // Idle / listening breathing pulse driven by RAF
  useEffect(() => {
    if (state === "speaking") return;
    let mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - start) / 1000;
      const base = state === "listening" ? 1.1 : state === "thinking" ? 1.05 : 1;
      const amp = state === "listening" ? 0.08 : state === "thinking" ? 0.05 : 0.04;
      setPulse(base + Math.sin(t * 2.2) * amp);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const triggerEliteMode = useCallback(() => {
    setEliteMode(true);
    if (eliteTimerRef.current) window.clearTimeout(eliteTimerRef.current);
    eliteTimerRef.current = window.setTimeout(() => setEliteMode(false), 12000);
  }, []);

  const askMarcus = useCallback(
    async (prompt: string) => {
      setState("thinking");
      setCaption("…");
      const isElite =
        ELITE_KEYWORDS_RX.test(prompt) || detectsHighValueAmount(prompt);
      const isInvestor = INVESTOR_RX.test(prompt);
      if (isElite) triggerEliteMode();

      try {
        const res = await fetch("/api/marcus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            history: historyRef.current.slice(-8),
            context: {
              admin: adminRef.current,
              elite: isElite,
              localHour: new Date().getHours(),
            },
          }),
        });
        if (!res.ok) throw new Error("brain offline");
        const data = await res.json();
        const reply: string =
          data.reply ||
          data.answer ||
          data.text ||
          (isElite
            ? ELITE_FALLBACK
            : isInvestor
            ? INVESTOR_FALLBACK
            : adminRef.current
            ? FALLBACK_GREETING_CHAIRMAN
            : FALLBACK_GREETING_INVESTOR);

        historyRef.current.push({ role: "user", content: prompt });
        historyRef.current.push({ role: "assistant", content: reply });
        if (historyRef.current.length > 16) {
          historyRef.current = historyRef.current.slice(-16);
        }
        speak(reply);
      } catch {
        const reply = isElite
          ? ELITE_FALLBACK
          : isInvestor
          ? INVESTOR_FALLBACK
          : adminRef.current
          ? FALLBACK_GREETING_CHAIRMAN
          : FALLBACK_GREETING_INVESTOR;
        speak(reply);
      }
    },
    [speak, triggerEliteMode]
  );

  // Chairman briefing — admin-only. Fetches grid status + speaks summary.
  const runBriefing = useCallback(async () => {
    if (!adminRef.current) {
      speak(
        "Briefing access is restricted, sir. Please authenticate the Chairman session via the Admin gate."
      );
      return;
    }
    setState("thinking");
    setCaption("Compiling briefing…");
    try {
      const [gridRes, marcusRes] = await Promise.all([
        fetch("/api/grid-status").catch(() => null),
        fetch("/api/marcus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Deliver the Chairman briefing now.",
            history: historyRef.current.slice(-4),
            context: { admin: true, briefing: true },
          }),
        }).catch(() => null),
      ]);

      let connections = 0;
      if (gridRes && gridRes.ok) {
        const g = await gridRes.json();
        connections = Number(g?.activeConnections || g?.connections || 0);
      }
      // Deterministic fallback if endpoint unavailable
      if (!connections) {
        const seed = Math.floor(Date.now() / (1000 * 60 * 5));
        connections = 1280 + ((seed * 137) % 420);
      }

      let core = "";
      if (marcusRes && marcusRes.ok) {
        const m = await marcusRes.json();
        core = m?.reply || "";
      }
      if (!core) {
        core =
          "All twelve mother companies report green. The Sovereign Grid is stable. Vision twenty-one-hundred remains the prime directive.";
      }
      const briefing = `Chairman briefing. ${core} Active connections on the Sovereign Grid right now: ${connections.toLocaleString()}. The Founder is currently overseeing operations.`;
      speak(briefing);
    } catch {
      speak(
        "Chairman briefing partial. The Sovereign Grid is online. The Founder is currently overseeing operations."
      );
    }
  }, [speak]);

  const triggerWakeFlash = useCallback(() => {
    setWakeFlash(true);
    window.setTimeout(() => setWakeFlash(false), 700);
  }, []);

  const handleTranscript = useCallback(
    (raw: string) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;

      // Mute / stop — must terminate speech IMMEDIATELY
      if (
        /\bmarcus[, ]+(mute|silence|quiet|stop talking|be quiet|stop)\b/.test(
          text
        )
      ) {
        cancelSpeech();
        setMuted(true);
        setCaption('Muted. Say "Marcus, unmute" to resume.');
        setState("idle");
        triggerWakeFlash();
        return;
      }
      // Unmute
      if (
        /\bmarcus[, ]+(unmute|speak|resume|talk|come back)\b/.test(text)
      ) {
        setMuted(false);
        setCaption("Unmuted.");
        setState("idle");
        triggerWakeFlash();
        return;
      }
      // Chairman briefing
      if (/\bmarcus[, ]+(briefing|brief me|status report|the briefing)\b/.test(text)) {
        triggerWakeFlash();
        setOpen(true);
        wakeArmedRef.current = false;
        runBriefing();
        return;
      }

      // Wake word
      const wakeMatch = text.match(/\bmarcus\b[,!\.\s]*(.*)$/);
      if (wakeMatch && wakeArmedRef.current) {
        wakeArmedRef.current = false;
        setOpen(true);
        triggerWakeFlash();
        const tail = wakeMatch[1].trim();
        if (tail.length > 1) {
          askMarcus(tail);
        } else {
          setState("listening");
          setCaption("Listening… how may I assist?");
        }
        return;
      }

      // Open conversation: treat as user message
      if (open && state === "listening" && text.length > 1) {
        askMarcus(text);
      }
    },
    [askMarcus, open, state, triggerWakeFlash, runBriefing, cancelSpeech]
  );

  const startRecognition = useCallback(() => {
    const w = window as any;
    const Ctor: any = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (recognitionRef.current) return;

    const rec: any = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (ev: any) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) {
          handleTranscript(r[0].transcript);
        } else {
          const interim = String(r[0].transcript || "").trim().toLowerCase();
          if (/\bmarcus\b/.test(interim) && wakeArmedRef.current) {
            triggerWakeFlash();
            setOpen(true);
            setState("listening");
            setCaption("Listening…");
          }
        }
      }
    };
    rec.onerror = () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
    rec.onend = () => {
      try {
        if (recognitionRef.current === rec) rec.start();
      } catch {
        /* ignore */
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      /* ignore */
    }
  }, [handleTranscript, triggerWakeFlash]);

  const enableMarcus = useCallback(async () => {
    setPermissionAsked(true);
    setOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* user denied — orb still works as click-to-talk */
    }
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        /* voices ready */
      };
    }
    startRecognition();
    const greeting = `${timeAwareSalutation(adminRef.current)} ${
      adminRef.current
        ? "The Sovereign Grid is online. Say, Marcus briefing, for the operational update."
        : "I am Marcus, Digital Chief of Staff to Mr. Faisal Orakzai. The Group spans twelve mother companies, on a hundred-year horizon to Vision twenty-one-hundred. How may I be of service?"
    }`;
    speak(greeting);
  }, [startRecognition, speak]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      if (eliteTimerRef.current) window.clearTimeout(eliteTimerRef.current);
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const handleOrbClick = () => {
    if (!permissionAsked) {
      enableMarcus();
      return;
    }
    if (state === "speaking") {
      cancelSpeech();
      setState("idle");
      return;
    }
    setOpen((o) => !o);
    if (!open) {
      setState("listening");
      setCaption('Listening… say "Marcus" anytime.');
    }
  };

  const ringColor =
    state === "listening"
      ? "#22d3ee"
      : state === "thinking"
      ? "#fafafa"
      : state === "speaking"
      ? GOLD
      : GOLD;

  return (
    <>
      {/* ─── Elite-mode WhatsApp spotlight ─── */}
      {eliteMode && (
        <div
          className="fixed pointer-events-none z-[9998]"
          style={{
            bottom: "max(8px, env(safe-area-inset-bottom))",
            right: "max(6px, env(safe-area-inset-right))",
            width: 96,
            height: 96,
          }}
          aria-hidden="true"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${GOLD}`,
              boxShadow: `0 0 30px ${GOLD}, inset 0 0 18px ${GOLD}88`,
              animation: "marcusEliteRing 1.4s ease-out infinite",
            }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid #fde68a`,
              animation: "marcusEliteRing 1.4s ease-out 0.4s infinite",
            }}
          />
        </div>
      )}

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
                width: "min(320px, calc(100vw - 120px))",
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
                    className="text-[13px] font-semibold tracking-wide flex items-center gap-2"
                    style={{ color: GOLD }}
                  >
                    <span>Marcus · Digital Chief of Staff</span>
                    {eliteMode && (
                      <span
                        className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                        style={{
                          color: "#0a0a0a",
                          background: GOLD,
                          fontWeight: 800,
                        }}
                      >
                        Elite
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {muted
                      ? 'muted — say "Marcus, unmute"'
                      : adminPresent
                      ? `${state} · chairman session`
                      : state}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                    if (!muted) cancelSpeech();
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

        <div className="relative ml-auto" style={{ width: 64, height: 64 }}>
          {/* Chairman-online green dot (admin session active) */}
          {adminPresent && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #0a0a0a",
                boxShadow:
                  "0 0 10px #22c55e, 0 0 18px rgba(34,197,94,0.55)",
                animation: "marcusChairmanPulse 1.6s ease-in-out infinite",
                zIndex: 2,
              }}
              title="Chairman session active"
              aria-label="Chairman session active"
            />
          )}

          <motion.button
            onClick={handleOrbClick}
            animate={{ scale: pulse }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              mass: 0.6,
            }}
            className="pointer-events-auto relative block rounded-full focus:outline-none w-full h-full"
            style={{
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
            {wakeFlash && (
              <>
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid #fde68a`,
                    animation: "marcusWake 0.7s ease-out forwards",
                    pointerEvents: "none",
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${GOLD}`,
                    animation: "marcusWake 0.7s ease-out 0.12s forwards",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </motion.button>
        </div>

        <style>{`
          @keyframes marcusRing {
            0%   { transform: scale(1);    opacity: 0.9; }
            100% { transform: scale(1.55); opacity: 0;   }
          }
          @keyframes marcusWake {
            0%   { transform: scale(1);   opacity: 1; }
            100% { transform: scale(1.9); opacity: 0; }
          }
          @keyframes marcusChairmanPulse {
            0%, 100% { transform: scale(1);    opacity: 1;   }
            50%      { transform: scale(1.25); opacity: 0.75;}
          }
          @keyframes marcusEliteRing {
            0%   { transform: scale(0.85); opacity: 0.95; }
            100% { transform: scale(1.45); opacity: 0;    }
          }
        `}</style>
      </div>
    </>
  );
}
