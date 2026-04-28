import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Link as LinkIcon, Volume2, VolumeX } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGE =
  "Greetings. I am Marcus, autonomous concierge of the Orakzai Sovereign Grid. I am briefed on Chairman Faisal Orakzai's founding doctrine, the twelve mother companies, and the capital-protected mandate of $OKBOND. How may I serve your wealth strategy?";

const SMART_OPTIONS: { id: number; label: string; query: string }[] = [
  {
    id: 1,
    label: "Verify $OKBOND Security",
    query:
      "Walk me through the Capital-Protected mandate and the real-world asset backing of $OKBOND. Why is my principal safe?",
  },
  {
    id: 2,
    label: "Guide me to Buy",
    query:
      "Give me the precise step-by-step path to acquire $OKBOND, from wallet setup to allocation confirmation.",
  },
  {
    id: 3,
    label: "Explain the 2100 Vision",
    query:
      "Tell me about the Orakzai Group 12-company conglomerate and the 2100 sovereign-grid vision.",
  },
];

function pickMaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  const malePatterns = [
    /daniel/i,
    /alex/i,
    /aaron/i,
    /fred/i,
    /tom/i,
    /oliver/i,
    /arthur/i,
    /george/i,
    /(google).*(male|uk)/i,
    /(microsoft).*(guy|david|mark|george|ryan)/i,
    /\bmale\b/i,
  ];
  for (const pat of malePatterns) {
    const hit = pool.find((v) => pat.test(v.name));
    if (hit) return hit;
  }
  const ukEn = pool.find((v) => v.lang && v.lang.toLowerCase() === "en-gb");
  if (ukEn) return ukEn;
  return pool[0] || null;
}

export function MarcusAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const introSpokenRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 1500);
    const hideTimer = setTimeout(() => setShowBubble(false), 13500);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current = pickMaleVoice(voices);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isThinking]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) utter.voice = voiceRef.current;
        utter.rate = 0.95;
        utter.pitch = 0.85;
        utter.volume = 1;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } catch {
        setIsSpeaking(false);
      }
    },
    [voiceEnabled],
  );

  const typeMessage = useCallback(async (text: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const words = text.split(" ");
    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: currentText },
      ]);
      await new Promise((r) => setTimeout(r, 30));
    }
    setIsTyping(false);
  }, []);

  const deliverAssistant = useCallback(
    async (text: string) => {
      setIsTyping(true);
      speak(text);
      await typeMessage(text);
    },
    [speak, typeMessage],
  );

  const handleInitialMessage = useCallback(async () => {
    if (introSpokenRef.current) return;
    introSpokenRef.current = true;
    setMessages([]);
    await deliverAssistant(INITIAL_MESSAGE);
  }, [deliverAssistant]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen, messages.length, handleInitialMessage]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
    }
  }, [isOpen, stopSpeaking]);

  useEffect(() => {
    if (!voiceEnabled) {
      stopSpeaking();
    }
  }, [voiceEnabled, stopSpeaking]);

  const askMarcus = useCallback(
    async (query: string, history: Message[]): Promise<string> => {
      const base = (import.meta as any).env?.BASE_URL || "/";
      const endpoint = `${base.replace(/\/$/, "")}/api/marcus`;
      const candidates = [endpoint, "/api/marcus"];
      let lastErr: any = null;
      for (const url of candidates) {
        try {
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, messages: history }),
          });
          if (!resp.ok) {
            const data = await resp.json().catch(() => ({}));
            lastErr = new Error(data?.error || `HTTP ${resp.status}`);
            continue;
          }
          const data = await resp.json();
          if (data?.reply) return String(data.reply);
          lastErr = new Error("Empty response");
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("Marcus offline");
    },
    [],
  );

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? inputValue).trim();
    if (!text || isTyping || isThinking) return;

    setInputValue("");
    const userMsg: Message = { role: "user", content: text };
    const historySnapshot = [...messages, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setShowBubble(false);
    setIsThinking(true);

    try {
      const reply = await askMarcus(text, messages);
      setIsThinking(false);
      await deliverAssistant(reply);
    } catch (err: any) {
      setIsThinking(false);
      const fallback =
        "Understood. Marcus is momentarily off-grid. The Chairman's desk will respond directly on WhatsApp at +92 336 797 0004.";
      await deliverAssistant(fallback);
      void historySnapshot;
      void err;
    }
  };

  const handleSmartOption = async (id: number) => {
    if (isTyping || isThinking) return;
    const opt = SMART_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    setMessages((prev) => [...prev, { role: "user", content: opt.label }]);
    setShowBubble(false);
    setIsThinking(true);
    try {
      const reply = await askMarcus(opt.query, messages);
      setIsThinking(false);
      await deliverAssistant(reply);
    } catch {
      setIsThinking(false);
      await deliverAssistant(
        "Understood. Marcus is momentarily off-grid. The Chairman's desk will respond directly on WhatsApp at +92 336 797 0004.",
      );
    }
  };

  const orbActive = isSpeaking || isThinking;

  return (
    <>
      <AnimatePresence>
        {!isOpen && showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-32 right-8 z-50 max-w-[280px] bg-card/90 backdrop-blur-md border border-primary/30 p-4 shadow-2xl rounded-tr-none"
          >
            <button
              onClick={() => setShowBubble(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
            <p className="text-sm font-mono text-primary/90 leading-relaxed pr-4">
              Marcus v9.5 online. Voice concierge active. Tap the orb.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-background border border-primary flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        data-testid="btn-marcus-orb"
        aria-label="Open Marcus AI concierge"
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-secondary"
          animate={
            orbActive
              ? { opacity: [0.4, 1, 0.4], scale: [1, 1.35, 1] }
              : { opacity: 0.5, scale: 1 }
          }
          transition={
            orbActive
              ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
          }
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/20 blur-md"
          animate={
            orbActive
              ? { opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }
              : { opacity: 0.6, scale: 1 }
          }
          transition={
            orbActive
              ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
          }
        />
        <motion.div
          className="w-8 h-8 rounded-full bg-primary relative z-10 shadow-[0_0_15px_rgba(212,175,55,0.5)] group-hover:bg-secondary group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-500"
          animate={
            orbActive
              ? {
                  scale: [1, 1.18, 1],
                  boxShadow: [
                    "0 0 15px rgba(212,175,55,0.6)",
                    "0 0 35px rgba(212,175,55,0.95)",
                    "0 0 15px rgba(212,175,55,0.6)",
                  ],
                }
              : { scale: 1 }
          }
          transition={
            orbActive
              ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
          }
        />
        <span className="absolute -bottom-6 text-[10px] font-mono text-primary/70 tracking-widest whitespace-nowrap">
          MARCUS v9.5
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 md:bottom-28 md:right-8 z-50 w-full md:w-[420px] h-[85vh] md:h-[640px] bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-secondary"
                  animate={
                    orbActive
                      ? { opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }
                      : { opacity: [0.6, 1, 0.6] }
                  }
                  transition={{
                    duration: orbActive ? 0.6 : 1.6,
                    repeat: Infinity,
                  }}
                />
                <span className="text-xs font-mono text-primary tracking-widest">
                  MARCUS v9.5 · VOICE CONCIERGE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVoiceEnabled((v) => !v)}
                  className={`transition-colors ${
                    voiceEnabled
                      ? "text-secondary hover:text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid="btn-marcus-voice"
                  aria-label={voiceEnabled ? "Mute Marcus" : "Unmute Marcus"}
                  title={voiceEnabled ? "Voice on" : "Voice off"}
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="btn-marcus-close"
                  aria-label="Close concierge"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm font-mono leading-relaxed ${
                      msg.role === "user"
                        ? "bg-secondary/10 border border-secondary text-secondary-foreground"
                        : "bg-primary/5 border border-primary/30 text-card-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: msg.content.replace(
                            /(\$OKBOND|Capital-Protected|12-company|Chairman|Sovereign Grid|2100)/g,
                            '<span class="text-secondary font-bold">$1</span>',
                          ),
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "assistant" &&
                    i > 0 &&
                    !isTyping &&
                    i === messages.length - 1 && (
                      <a
                        href="https://wa.me/923367970004?text=I%20have%20a%20question%20about%20%24OKBOND"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 border border-secondary/50 text-secondary hover:bg-secondary/10 text-xs font-mono transition-colors"
                      >
                        <LinkIcon size={12} />
                        Connect to Chairman via WhatsApp
                      </a>
                    )}
                </div>
              ))}
              {isThinking && (
                <div className="flex items-start">
                  <div className="bg-primary/5 border border-primary/30 px-3 py-2 text-xs font-mono text-primary/70 flex items-center gap-2">
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span>MARCUS · CONSULTING SOVEREIGN GRID</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-primary/20 bg-background/50 space-y-3">
              <div className="flex flex-col gap-2">
                {SMART_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSmartOption(opt.id)}
                    disabled={isTyping || isThinking}
                    className="w-full text-left px-3 py-2 border border-primary/20 hover:border-primary text-xs font-mono text-primary/80 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    data-testid={`btn-smart-opt-${opt.id}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Query Marcus AI..."
                  disabled={isTyping || isThinking}
                  className="flex-1 bg-transparent border-b border-primary/30 focus:border-primary px-2 py-1 text-sm font-mono outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  data-testid="input-marcus"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping || isThinking || !inputValue.trim()}
                  className="text-primary hover:text-secondary disabled:opacity-50 transition-colors"
                  data-testid="btn-marcus-send"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
