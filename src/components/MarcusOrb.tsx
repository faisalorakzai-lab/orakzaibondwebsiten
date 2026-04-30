import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadAdminProof } from "@/lib/adminAuth";
import { useLocation } from "wouter";

const GOLD = "#EAB308";
const GOLD_DEEP = "#A16207";

// Fallback greetings — em-dashes and other long-pause punctuation removed.
// Chrome's SpeechSynthesis engine treats `—` (U+2014) as a hard break and
// frequently fails to start the next utterance, which manifested as
// "Marcus stops after 'Faisal Orakzai'". Commas keep the cadence audible
// without triggering Chrome's queue-stall bug.
const FALLBACK_GREETING_INVESTOR =
  "Marcus here, Digital Chief of Staff for the Orakzai Group, founded by Chairman Faisal Orakzai. Building since the age of twelve, now nineteen, he leads twelve mother companies toward Vision twenty-one-hundred. How may I be of service?";

const FALLBACK_GREETING_CHAIRMAN =
  "Chairman Orakzai. The Orakzai Bond Grid is online, the Group is steady, and the Founder is overseeing operations. Standing by for instruction.";

const INVESTOR_FALLBACK =
  "Orakzai Bond is the institutional financial layer of the Group, a liquidity-backed capital retention model on Polygon, anchored by the Trust Trifecta and the Orakzai Bond Guarantee, all aligned to the Vision twenty-one-hundred horizon. For private onboarding with the team, I am routing you to our WhatsApp concierge.";

const ELITE_FALLBACK =
  "Understood. This is an Elite Priority matter. I am opening a direct line to Mr. Orakzai through our WhatsApp concierge. Please use the highlighted channel to your right.";

// Sanitise text just before it goes to the TTS engine: em-dashes / en-dashes
// become commas, ellipses become a single comma, double-spaces collapse.
// The visible caption in the panel is unaffected — only the spoken stream.
function speechSafe(text: string): string {
  return text
    .replace(/\u2014/g, ",")  // em-dash
    .replace(/\u2013/g, ",")  // en-dash
    .replace(/\u2026/g, ",")  // …
    .replace(/\s{2,}/g, " ")
    .trim();
}

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
type SpeechLang = "en" | "ur" | "ps";

// Detect script: Arabic/Urdu/Pashto block (U+0600–U+06FF). Pashto-specific
// letters (ټ ډ ړ ږ ښ ګ ڼ ۀ) disambiguate from Urdu when present.
function detectLang(text: string): SpeechLang {
  if (!/[\u0600-\u06FF]/.test(text)) return "en";
  if (/[\u067C\u0689\u0693\u0696\u069A\u06AB\u06BC\u06C0]/.test(text)) return "ps";
  return "ur";
}

function pickVoiceFor(lang: SpeechLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (lang === "ur") {
    // Urdu (ur-PK) is widely shipped on Android Chrome and modern Edge.
    const urdu = voices.find((v) => /^ur(-|$)/i.test(v.lang));
    if (urdu) return urdu;
    // Hindi is mutually intelligible enough to be a passable fallback for
    // Urdu speech output until a real Urdu voice is installed.
    const hindi = voices.find((v) => /^hi(-|$)/i.test(v.lang));
    if (hindi) return hindi;
    // Final fallback: any Arabic-script voice, then the English picker.
    const arabic = voices.find((v) => /^ar(-|$)/i.test(v.lang));
    if (arabic) return arabic;
  }

  if (lang === "ps") {
    // Pashto (ps-AF) — rare in browsers today. Fall through to Urdu/Arabic.
    const pashto = voices.find((v) => /^ps(-|$)/i.test(v.lang));
    if (pashto) return pashto;
    const urdu = voices.find((v) => /^ur(-|$)/i.test(v.lang));
    if (urdu) return urdu;
    const arabic = voices.find((v) => /^ar(-|$)/i.test(v.lang));
    if (arabic) return arabic;
  }

  // English — Marcus's default voice. Prefer named premium British/US males.
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

// ─────────────────────────────────────────────────────────────────────────
// Chunked speech queue.
//
// Why this exists: Chrome's Web Speech API silently kills any single
// SpeechSynthesisUtterance that exceeds ~15 seconds of audio. That is why
// Marcus was reading only the first sentence of long Founder dispatches
// before going quiet. The fix is to split long text into sentence-sized
// utterances and queue them, plus run a periodic resume() ping that
// works around Chrome's 250-character pause-on-pause bug.
// ─────────────────────────────────────────────────────────────────────────

interface ChunkSpeechOptions {
  voice: SpeechSynthesisVoice | null;
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: SpeechLang;
  onBoundary?: (ev: SpeechSynthesisEvent) => void;
  onEachStart?: (chunkIndex: number, total: number) => void;
  onAllDone?: () => void;
  onError?: () => void;
}

// Split text into utterance-sized chunks at sentence boundaries. Each
// chunk is kept under ~180 characters so Chrome cannot truncate it.
function splitForSpeech(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  // First pass: split on sentence terminators (English + Urdu/Arabic ۔ ؟ !).
  const sentenceRx = /[^\.!\?؟۔]+[\.!\?؟۔]*\s*/g;
  const sentences = cleaned.match(sentenceRx) || [cleaned];
  const chunks: string[] = [];
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      chunks.push(s);
      continue;
    }
    // Sentence is too long — split on commas, then on spaces as a last resort.
    const parts = s.split(/,\s*/);
    let buf = "";
    const flush = () => {
      const t = buf.trim();
      if (t) chunks.push(t);
      buf = "";
    };
    for (const p of parts) {
      const candidate = buf ? `${buf}, ${p}` : p;
      if (candidate.length <= maxLen) {
        buf = candidate;
      } else {
        flush();
        if (p.length <= maxLen) {
          buf = p;
        } else {
          // Hard wrap on whitespace.
          const words = p.split(/\s+/);
          let line = "";
          for (const w of words) {
            const c = line ? `${line} ${w}` : w;
            if (c.length <= maxLen) {
              line = c;
            } else {
              if (line) chunks.push(line);
              line = w;
            }
          }
          if (line) buf = line;
        }
      }
    }
    flush();
  }
  return chunks;
}

let __marcusKeepAliveTimer: number | null = null;

function startKeepAlive() {
  if (__marcusKeepAliveTimer != null) return;
  // Chrome stops firing utterance events if speechSynthesis is left running
  // for more than ~14 seconds without a pause/resume cycle. A periodic
  // resume() ping keeps the queue draining all the way to the end.
  __marcusKeepAliveTimer = window.setInterval(() => {
    try {
      const s = window.speechSynthesis;
      if (s.speaking && !s.paused) {
        s.pause();
        s.resume();
      }
    } catch {
      /* ignore */
    }
  }, 8000);
}

function stopKeepAlive() {
  if (__marcusKeepAliveTimer != null) {
    window.clearInterval(__marcusKeepAliveTimer);
    __marcusKeepAliveTimer = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Streaming TTS: enqueue ONE sentence at a time onto the live speech queue
// without cancelling what's already in flight. Used by /api/marcus-stream
// so the orb can begin speaking the first sentence within ~600ms while the
// rest of the briefing is still being generated.
// ─────────────────────────────────────────────────────────────────────────
interface StreamSpeechController {
  feed(text: string): void;          // call when new tokens arrive
  finish(): void;                    // call when the stream ends cleanly
  abort(): void;                     // cancel everything in flight
  spokenChars(): number;             // how much has been queued for TTS
}

const SENTENCE_END_RX = /[\.!\?؟۔]/;

function createStreamSpeech(opts: {
  voice: SpeechSynthesisVoice | null;
  lang?: SpeechLang;
  pitch?: number;
  rate?: number;
  volume?: number;
  onBoundary?: (ev: SpeechSynthesisEvent) => void;
  onAllDone?: () => void;
  onError?: () => void;
}): StreamSpeechController {
  const synth = window.speechSynthesis;
  const lang = opts.lang || "en";
  const browserLang =
    lang === "ur" ? "ur-PK" : lang === "ps" ? "ps-AF" : "en-GB";

  let pending = "";          // unspoken accumulated text awaiting a boundary
  let inFlight = 0;          // sentence utterances currently queued/playing
  let finished = false;      // upstream stream has ended
  let aborted = false;
  let spoken = 0;

  const enqueue = (raw: string) => {
    const piece = speechSafe(raw);
    if (!piece) return;
    // Sentences can still exceed 180 chars (no punctuation); fall back to
    // the proven sentence-splitter so Chrome cannot truncate.
    const sub = splitForSpeech(piece);
    sub.forEach((s) => {
      const u = new SpeechSynthesisUtterance(s);
      if (opts.voice) u.voice = opts.voice;
      u.lang = opts.voice?.lang || browserLang;
      u.pitch = opts.pitch ?? 0.75;
      u.rate = opts.rate ?? 0.9;
      u.volume = opts.volume ?? 1;
      if (opts.onBoundary) u.onboundary = opts.onBoundary;
      inFlight += 1;
      const tearDown = () => {
        inFlight -= 1;
        if (finished && inFlight <= 0) {
          stopKeepAlive();
          if (aborted) opts.onError?.();
          else opts.onAllDone?.();
        }
      };
      u.onend = tearDown;
      u.onerror = tearDown;
      try { synth.speak(u); spoken += s.length; } catch { tearDown(); }
    });
    startKeepAlive();
  };

  const flushSentences = (force = false) => {
    if (!pending) return;
    if (force) { enqueue(pending); pending = ""; return; }
    let lastCut = -1;
    for (let i = 0; i < pending.length; i++) {
      if (SENTENCE_END_RX.test(pending[i])) lastCut = i;
    }
    if (lastCut >= 0) {
      const ready = pending.slice(0, lastCut + 1);
      pending = pending.slice(lastCut + 1);
      enqueue(ready);
    } else if (pending.length > 220) {
      // No punctuation in a long run — break on the last whitespace so we
      // don't sit silent forever waiting for a period that never comes.
      const ws = pending.lastIndexOf(" ", 220);
      const cut = ws > 60 ? ws : 220;
      enqueue(pending.slice(0, cut));
      pending = pending.slice(cut);
    }
  };

  return {
    feed(text: string) {
      if (aborted) return;
      pending += text;
      flushSentences(false);
    },
    finish() {
      if (aborted || finished) return;
      finished = true;
      flushSentences(true);
      if (inFlight <= 0) {
        stopKeepAlive();
        opts.onAllDone?.();
      }
    },
    abort() {
      aborted = true;
      finished = true;
      pending = "";
      try { synth.cancel(); } catch {}
      stopKeepAlive();
      opts.onError?.();
    },
    spokenChars() { return spoken; },
  };
}

// Speak the given text reliably in chunks. Returns the LAST utterance so
// callers that previously held a ref to the active utterance can keep doing
// so. Cancels any in-flight speech first.
function speakChunked(
  text: string,
  opts: ChunkSpeechOptions,
): SpeechSynthesisUtterance | null {
  const synth = window.speechSynthesis;
  try { synth.cancel(); } catch { /* ignore */ }
  stopKeepAlive();

  const chunks = splitForSpeech(speechSafe(text));
  if (!chunks.length) {
    opts.onAllDone?.();
    return null;
  }

  const lang = opts.lang || "en";
  const browserLang =
    lang === "ur" ? "ur-PK" : lang === "ps" ? "ps-AF" : "en-GB";

  let last: SpeechSynthesisUtterance | null = null;
  chunks.forEach((piece, i) => {
    const u = new SpeechSynthesisUtterance(piece);
    if (opts.voice) u.voice = opts.voice;
    u.lang = opts.voice?.lang || browserLang;
    u.pitch = opts.pitch ?? 0.75;
    u.rate = opts.rate ?? 0.9;
    u.volume = opts.volume ?? 1;
    if (opts.onBoundary) u.onboundary = opts.onBoundary;
    u.onstart = () => opts.onEachStart?.(i, chunks.length);
    if (i === chunks.length - 1) {
      u.onend = () => {
        stopKeepAlive();
        opts.onAllDone?.();
      };
      u.onerror = () => {
        stopKeepAlive();
        opts.onError?.();
      };
    } else {
      u.onerror = () => {
        // Don't abort the whole queue on a single chunk error — Chrome
        // sometimes fires "interrupted" between chunks. Just keep going.
      };
    }
    last = u;
    synth.speak(u);
  });

  startKeepAlive();
  return last;
}


function playRoyalChime() {
  try {
    const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    // Premium triadic chime: D5 → G5 → D6 (rising perfect-fifth-octave, signature crystalline tone)
    const notes = [
      { freq: 587.33, t: 0.00, dur: 1.6, gain: 0.18 },
      { freq: 783.99, t: 0.10, dur: 1.7, gain: 0.16 },
      { freq: 1174.66, t: 0.22, dur: 1.9, gain: 0.13 },
    ];
    notes.forEach(({ freq, t, dur, gain: g }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0, now + t);
      gainNode.gain.linearRampToValueAtTime(g, now + t + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
      osc.connect(gainNode).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.05);
    });
    window.setTimeout(() => { try { ctx.close(); } catch {} }, 2200);
  } catch {
    /* audio context unavailable — silent fallback */
  }
}

// Voice-navigation routes: each maps a spoken keyword to a path.
// /whitepaper triggers a server-side download (vercel.json rewrite) — must use full navigation.
const NAV_ROUTES: Record<string, { path: string; external: boolean; label: string }> = {
  home:        { path: "/",           external: false, label: "the home page" },
  roadmap:     { path: "/roadmap",    external: false, label: "the roadmap" },
  whitepaper:  { path: "/whitepaper", external: true,  label: "the whitepaper" },
  tokenomics:  { path: "/tokenomics", external: false, label: "tokenomics" },
  ico:         { path: "/ico",        external: false, label: "the ICO page" },
  about:       { path: "/about",      external: false, label: "the about page" },
  founder:     { path: "/founder",    external: false, label: "the founder page" },
  community:   { path: "/community",  external: false, label: "the community page" },
  contact:     { path: "/contact",    external: false, label: "contact" },
  token:       { path: "/token",      external: false, label: "the token page" },
  lottery:     { path: "/lottery",    external: false, label: "the lottery" },
  documents:   { path: "/documents",  external: false, label: "documents" },
};
const NAV_RX = new RegExp(
  "\\bmarcus[, ]+(?:go to |open |take me to |show |bring up |navigate to )?(?:the )?(" +
    Object.keys(NAV_ROUTES).join("|") +
    ")\\b",
  "i"
);

function timeAwareSalutation(isAdmin: boolean): string {
  const h = new Date().getHours();
  let part: string;
  if (h < 12) part = "Good Morning";
  else if (h < 17) part = "Good Afternoon";
  else if (h < 22) part = "Good Evening";
  else part = "Greetings";
  return isAdmin ? `${part}, Chairman Orakzai.` : `${part}, Investor.`;
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
  const [contextPreview, setContextPreview] = useState<string | null>(null);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [, setLocation] = useLocation();

  const recognitionRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(1);
  const wakeArmedRef = useRef(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);
  const openRef = useRef(false);
  const adminRef = useRef(false);
  const historyRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const eliteTimerRef = useRef<number | null>(null);
  const briefingOfferRef = useRef(false);
  const prevAdminRef = useRef(false);

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

  // Pre-warm the Marcus Edge function + upstream Gemini connection on mount.
  // Saves ~300ms on the very first user prompt by eliminating cold-start
  // latency on both the Vercel Edge runtime and the Google API socket.
  // Idempotent, no side effects, low-priority — never blocks the UI.
  useEffect(() => {
    let cancelled = false;
    const fire = () => {
      if (cancelled) return;
      try {
        fetch("/api/marcus-warmup", {
          method: "POST",
          keepalive: true,
          headers: { "content-type": "application/json" },
          body: "{}",
        }).catch(() => { /* warmup failures are intentionally silent */ });
      } catch { /* noop */ }
    };
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (typeof ric === "function") {
      ric(fire, { timeout: 1500 });
    } else {
      window.setTimeout(fire, 250);
    }
    return () => { cancelled = true; };
  }, []);

  // Mirror "open" → openRef so async callbacks (speak.onend, etc.) read the latest value.
  useEffect(() => { openRef.current = open; }, [open]);

  // Clear the Discuss-with-Marcus context chip whenever the panel closes.
  useEffect(() => { if (!open) { setContextPreview(null); setIsAnnouncing(false); } }, [open]);

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
      const lang = detectLang(text);
      const voice = pickVoiceFor(lang);
      setCaption(text);
      setState("speaking");

      let lastBoundary = performance.now();
      const onAfterSpeech = () => {
        setPulse(1);
        if (openRef.current) {
          // Conversation is live — return to active listening so the user's
          // next sentence is captured without needing another "Marcus" prefix.
          setState("listening");
          setCaption("Listening… speak when ready.");
          wakeArmedRef.current = false;
        } else {
          setState("idle");
          wakeArmedRef.current = true;
        }
      };

      const last = speakChunked(text, {
        voice,
        lang,
        pitch: 0.75,
        rate: 0.9,
        volume: 1,
        onBoundary: () => {
          const now = performance.now();
          const delta = Math.min(220, now - lastBoundary);
          lastBoundary = now;
          setPulse(1 + ((220 - delta) / 220) * 0.4);
        },
        onAllDone: onAfterSpeech,
        onError: onAfterSpeech,
      });
      utteranceRef.current = last;
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

      const promptLang = detectLang(prompt);
      const requestBody = {
        message: prompt,
        // Detected user-input language so the brain replies in the same
        // tongue (English / Urdu / Pashto). The server also re-detects
        // for safety, but sending it here makes routing explicit.
        lang: promptLang,
        history: historyRef.current.slice(-8),
        context: {
          admin: adminRef.current,
          elite: isElite,
          localHour: new Date().getHours(),
        },
      };

      const fallbackText = isElite
        ? ELITE_FALLBACK
        : isInvestor
        ? INVESTOR_FALLBACK
        : adminRef.current
        ? FALLBACK_GREETING_CHAIRMAN
        : FALLBACK_GREETING_INVESTOR;

      // ── Path A: streaming SSE — orb starts speaking on first chunk. ──
      // First-byte timeout guards against a stalled connection so we can
      // fall back to the non-stream path inside the 5s product SLA. Once
      // bytes are flowing, we let the long-form budget on the server side
      // (~25s for Gemini) carry the briefing to completion.
      const streamCtrl = new AbortController();
      const firstByteTimer = window.setTimeout(() => streamCtrl.abort(), 4800);

      try {
        const res = await fetch("/api/marcus-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
          signal: streamCtrl.signal,
          body: JSON.stringify(requestBody),
        });
        if (!res.ok || !res.body) throw new Error(`stream offline ${res.status}`);

        const voice = pickVoiceFor(promptLang);
        let lastBoundary = performance.now();
        const onAfterStream = () => {
          setPulse(1);
          if (openRef.current) {
            setState("listening");
            setCaption("Listening… speak when ready.");
            wakeArmedRef.current = false;
          } else {
            setState("idle");
            wakeArmedRef.current = true;
          }
        };
        const speaker = mutedRef.current
          ? null
          : createStreamSpeech({
              voice,
              lang: promptLang,
              pitch: 0.75,
              rate: 0.9,
              volume: 1,
              onBoundary: () => {
                const now = performance.now();
                const delta = Math.min(220, now - lastBoundary);
                lastBoundary = now;
                setPulse(1 + ((220 - delta) / 220) * 0.4);
              },
              onAllDone: onAfterStream,
              onError: onAfterStream,
            });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let sseBuf = "";
        let accumulated = "";
        let firstChunk = true;
        let streamFailedSignal: string | null = null;
        let sawDoneEvent = false;
        // Inter-chunk watchdog. The first-byte timer above only protects
        // against a stalled HANDSHAKE; once bytes are flowing, Chrome will
        // happily wait forever if the upstream Edge function dies mid-
        // stream. This second timer aborts the connection if more than 12s
        // elapse between chunks so we can fall through to the proven non-
        // stream brain instead of leaving Marcus mute mid-sentence.
        let interChunkTimer: number | null = null;
        const armInterChunkTimer = () => {
          if (interChunkTimer != null) window.clearTimeout(interChunkTimer);
          interChunkTimer = window.setTimeout(() => {
            try { streamCtrl.abort(); } catch { /* noop */ }
          }, 12000);
        };

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          if (firstChunk) {
            // Stop the first-byte timeout the moment ANY bytes arrive — we
            // are now committed to the stream.
            window.clearTimeout(firstByteTimer);
            armInterChunkTimer();
          } else {
            armInterChunkTimer();
          }
          sseBuf += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = sseBuf.indexOf("\n\n")) !== -1) {
            const frame = sseBuf.slice(0, idx);
            sseBuf = sseBuf.slice(idx + 2);
            const dataLine = frame
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim())
              .join("");
            if (!dataLine) continue;
            let evt: any;
            try { evt = JSON.parse(dataLine); } catch { continue; }

            if (evt.type === "meta" && (evt.lang === "ur" || evt.lang === "ps" || evt.lang === "en")) {
              // Server confirmed response language. If it differs from our
              // prompt-derived guess, no action is needed because the
              // streaming speaker we've already built reads voice + lang
              // from the same `promptLang` we passed at construction. We
              // could rebuild here, but doing so risks silencing the first
              // chunk during the rebuild handoff — accept the prompt-lang
              // voice and let the synthesizer handle script gracefully.
              continue;
            }
            if (evt.type === "chunk" && typeof evt.text === "string" && evt.text) {
              if (firstChunk) {
                // FIRST CHUNK — orb flips to "speaking" immediately so the
                // visual handshake leads the audio handshake.
                setState("speaking");
                firstChunk = false;
              }
              accumulated += evt.text;
              setCaption(accumulated);
              if (mutedRef.current) {
                // Muted: no TTS, just keep the caption updated.
              } else {
                speaker?.feed(evt.text);
              }
            } else if (evt.type === "done") {
              // server has finished — flush remaining TTS and exit
              sawDoneEvent = true;
            } else if (evt.type === "error") {
              streamFailedSignal = String(evt.message || "error");
            }
          }
        }

        window.clearTimeout(firstByteTimer);
        if (interChunkTimer != null) window.clearTimeout(interChunkTimer);

        // Truncation guard: if the stream closed WITHOUT a `done` event AND
        // delivered less than ~120 chars, treat that as a mid-flight cutoff
        // (Vercel Edge cold-start, Gemini RPC reset, etc.) and fall through
        // to the non-stream brain. Without this guard, a partial reply like
        // "Marcus here, Digital Chief of Staff … Faisal Orakzai" would be
        // accepted as a complete answer and Marcus would go silent for the
        // rest of the briefing.
        if (streamFailedSignal || !accumulated || (!sawDoneEvent && accumulated.length < 120)) {
          // Server reported a terminal error event OR closed without ever
          // sending a chunk OR cut out mid-sentence → fall through to the
          // non-stream path.
          speaker?.abort();
          throw new Error(streamFailedSignal || (!accumulated ? "empty_stream" : "truncated_stream"));
        }

        speaker?.finish();
        if (mutedRef.current) onAfterStream();

        historyRef.current.push({ role: "user", content: prompt });
        historyRef.current.push({ role: "assistant", content: accumulated });
        if (historyRef.current.length > 16) {
          historyRef.current = historyRef.current.slice(-16);
        }
        return;
      } catch (streamErr) {
        window.clearTimeout(firstByteTimer);
        // Streaming path failed before any usable text arrived. Try the
        // proven non-stream brain so the orb is never silent.
      }

      // ── Path B: non-stream fallback (existing /api/marcus contract). ─
      const ctrl = new AbortController();
      const ttimer = window.setTimeout(() => ctrl.abort(), 4800);
      try {
        const res = await fetch("/api/marcus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify(requestBody),
        });
        window.clearTimeout(ttimer);
        if (!res.ok) throw new Error("brain offline");
        const data = await res.json();
        const reply: string =
          data.reply ||
          data.answer ||
          data.text ||
          fallbackText;

        historyRef.current.push({ role: "user", content: prompt });
        historyRef.current.push({ role: "assistant", content: reply });
        if (historyRef.current.length > 16) {
          historyRef.current = historyRef.current.slice(-16);
        }
        speak(reply);
      } catch {
        window.clearTimeout(ttimer);
        speak(fallbackText);
      }
    },
    [speak, triggerEliteMode]
  );

  // Chairman briefing — admin-only. Pulls /api/briefing for live OKBOND price,
  // TVL, active wallets, AND the latest community dispatches from the X-feed,
  // then speaks an executive summary aloud.
  const runBriefing = useCallback(async () => {
    if (!adminRef.current) {
      speak(
        "Briefing access is restricted, sir. Please authenticate the Chairman session via the Admin gate."
      );
      return;
    }
    setState("thinking");
    setCaption("Compiling live briefing…");
    try {
      const res = await fetch("/api/briefing", { cache: "no-store" });
      const b = res.ok ? await res.json() : null;

      const price = b?.price;
      const priceLine =
        price && Number.isFinite(price.usd)
          ? `O.K.bond is trading at ${price.usd.toFixed(4)} dollars, ${
              price.change24h >= 0 ? "up" : "down"
            } ${Math.abs(price.change24h).toFixed(2)} percent in the last twenty-four hours.`
          : "OKBOND price feed is initialising.";

      const tvl = b?.tvl;
      const tvlLine =
        tvl && Number.isFinite(tvl.usd)
          ? `Total value locked across the OKBOND Grid sits at ${Math.round(
              tvl.usd
            ).toLocaleString()} dollars.`
          : "Treasury telemetry is consolidating.";

      const wallets = Number(b?.activeWallets || 0);
      const walletLine =
        wallets > 0
          ? `We have ${wallets.toLocaleString()} active wallets engaged on the network.`
          : "Wallet telemetry is loading.";

      const posts: Array<{ author: string; content: string }> = Array.isArray(
        b?.latestPosts
      )
        ? b.latestPosts.slice(0, 3)
        : [];
      let feedLine = "";
      if (posts.length) {
        const trimmed = posts
          .map((p, i) => {
            const snippet =
              (p.content || "").replace(/\s+/g, " ").trim().slice(0, 120) ||
              "no content";
            return `${i === 0 ? "Top dispatch" : i === 1 ? "Next" : "And"} from ${p.author || "an investor"}: ${snippet}.`;
          })
          .join(" ");
        feedLine = ` Latest from the community feed. ${trimmed}`;
      }

      // STRATEGY MODE — translate raw numbers into Chief-of-Staff posture.
      let strategyLine = "";
      if (price && Number.isFinite(price.usd) && Number.isFinite(price.change24h)) {
        const ch = price.change24h;
        if (ch <= -2) {
          strategyLine =
            " Posture, sir: this is an accumulation window. I recommend we hold reserve dry-powder steady and let the Grid absorb supply quietly.";
        } else if (ch >= 2) {
          strategyLine =
            " Posture, sir: distribution discipline is in order. Velocity is hot — I would protect realised value and let the Orakzai Bond Guarantee narrate the strength.";
        } else {
          strategyLine =
            " Posture, sir: we are in a coiling phase. I recommend we tighten the community narrative and pre-position the next dispatch to bias the breakout upward.";
        }
      }
      let communityLine = "";
      if (wallets > 0) {
        if (wallets < 500) {
          communityLine =
            " Community velocity is in its founder-phase — every wallet onboarded compounds disproportionately, so I would prioritise concierge outreach.";
        } else if (wallets < 5000) {
          communityLine =
            " Community velocity is in its institutional curve — I would now layer the elite-priority pipeline on top of the retail flywheel.";
        } else {
          communityLine =
            " Community velocity has crossed the network-effect threshold — I would now harden custody and accelerate the Vision twenty-one-hundred narrative on every channel.";
        }
      }

      // Morning Briefing — leads with the Chairman's signature opener: a fixed
      // headline (sovereign reserve + grid health) followed by live telemetry.
      const headline =
        "Chairman Orakzai, the OKBOND Reserve is stable at one point eight five million dollars. Grid health is at ninety-eight percent.";
      const briefing = `${headline} ${priceLine} ${tvlLine} ${walletLine}${feedLine}${strategyLine}${communityLine} The Orakzai Bond Grid stands online and the Founder is overseeing operations.`;
      speak(briefing);
    } catch {
      speak(
        "Chairman Orakzai, the OKBOND Reserve is stable at one point eight five million dollars. Grid health is at ninety-eight percent. Live telemetry is consolidating — partial briefing only."
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

      // Briefing offer interceptor — Chairman just said yes/no to the auto-offer.
      if (briefingOfferRef.current) {
        if (/\b(yes|yeah|yep|sure|please|deliver|go ahead|affirmative|do it|proceed)\b/.test(text)) {
          briefingOfferRef.current = false;
          triggerWakeFlash();
          runBriefing();
          return;
        }
        if (/\b(no|not now|later|skip|negative|stand by|hold)\b/.test(text)) {
          briefingOfferRef.current = false;
          speak("Acknowledged, Chairman. Standing by.");
          return;
        }
        // Anything else — drop the flag and let the message fall through normally.
        briefingOfferRef.current = false;
      }

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
      // Voice navigation — "Marcus, Roadmap" / "Marcus, Whitepaper" / etc.
      const navMatch = text.match(NAV_RX);
      if (navMatch) {
        const key = navMatch[1].toLowerCase();
        const route = NAV_ROUTES[key];
        if (route) {
          triggerWakeFlash();
          speak(`Opening ${route.label}.`);
          window.setTimeout(() => {
            if (route.external) {
              window.location.href = route.path;
            } else {
              setLocation(route.path);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 700);
          return;
        }
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
    [askMarcus, open, state, triggerWakeFlash, runBriefing, cancelSpeech, setLocation, speak]
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
    // Royal Chime: signature notification before the first welcome of the session
    if (!sessionStorage.getItem("marcus.chime.played")) {
      playRoyalChime();
      sessionStorage.setItem("marcus.chime.played", "1");
      await new Promise((r) => window.setTimeout(r, 850));
    }
    const greeting = `${timeAwareSalutation(adminRef.current)} ${
      adminRef.current
        ? "The OKBOND Grid is online. Say, Marcus briefing, for the operational update."
        : "I am Marcus, Digital Chief of Staff to Mr. Faisal Orakzai. The Group spans twelve mother companies, on a hundred-year horizon to Vision twenty-one-hundred. How may I be of service?"
    }`;
    speak(greeting);
  }, [startRecognition, speak]);

  // Chairman's Briefing on login: when admin proof activates, Marcus offers
  // today's market & community briefing. Say "yes" to deliver, "no" to stand by.
  useEffect(() => {
    if (
      adminPresent &&
      !prevAdminRef.current &&
      permissionAsked &&
      !mutedRef.current
    ) {
      briefingOfferRef.current = true;
      setOpen(true);
      setCaption("Chairman detected — briefing on standby.");
      speak(
        "Welcome back, Chairman Orakzai. Shall I deliver today's market and community briefing? Say yes to proceed."
      );
    }
    prevAdminRef.current = adminPresent;
  }, [adminPresent, permissionAsked, speak]);

  // ────────────────────────────────────────────────────────────────
  // Founder Dispatch full-read: when a new Pinned Dispatch is detected on
  // the Community page, Community.tsx fires "marcus:announce-dispatch"
  // with the full title + body. Marcus then:
  //   1) intros: "New dispatch from the Founder just posted on the Grid…"
  //   2) reads the entire dispatch aloud at executive (slower) pacing
  //   3) keeps the gold context chip pulsing throughout the read
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const speakDispatch = (intro: string, body: string) => {
      if (mutedRef.current) {
        setCaption(intro + " " + body);
        setState("idle");
        setIsAnnouncing(false);
        return;
      }

      // Detect language across the WHOLE payload so a Founder dispatch
      // posted in Urdu/Pashto picks the right voice for both intro and body.
      const lang = detectLang(intro + " " + body);
      const voice = pickVoiceFor(lang);

      setIsAnnouncing(true);
      setState("speaking");
      setCaption(intro);

      let lastBoundary = performance.now();
      const onBoundary = () => {
        const now = performance.now();
        const delta = Math.min(220, now - lastBoundary);
        lastBoundary = now;
        setPulse(1 + ((220 - delta) / 220) * 0.4);
      };

      const finish = () => {
        setPulse(1);
        setIsAnnouncing(false);
        if (openRef.current) {
          setState("listening");
          setCaption("Listening… speak when ready.");
          wakeArmedRef.current = false;
          try { startRecognition(); } catch { /* ignore */ }
        } else {
          setState("idle");
          wakeArmedRef.current = true;
        }
      };

      // Speak the intro as a short, single chunk, then queue the entire body
      // as a chain of sentence-sized chunks. This is the actual fix for the
      // "Marcus only reads the beginning" bug — the body used to be one
      // huge utterance and Chrome was silently killing it after ~15 seconds.
      speakChunked(intro, {
        voice,
        lang,
        pitch: 0.72,
        rate: 0.86,
        volume: 1,
        onBoundary,
        onAllDone: () => {
          setCaption(body);
          const last = speakChunked(body, {
            voice,
            lang,
            pitch: 0.74,
            rate: 0.80,
            volume: 1,
            onBoundary,
            onAllDone: finish,
            onError: finish,
          });
          utteranceRef.current = last;
        },
        onError: () => {
          // Intro failed for some reason — still attempt the body so the
          // dispatch is read aloud rather than silently dropped.
          setCaption(body);
          const last = speakChunked(body, {
            voice,
            lang,
            pitch: 0.74,
            rate: 0.80,
            volume: 1,
            onBoundary,
            onAllDone: finish,
            onError: finish,
          });
          utteranceRef.current = last;
        },
      });
    };

    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      const text = String(detail.text || "").trim();
      if (!text) return;
      if (mutedRef.current) return; // respect mute

      const author = String(detail.author || "the Founder").trim() || "the Founder";
      const intro = `New dispatch regarding Orakzai Bond, just posted by ${author}.`;

      const preview = text.length > 96 ? text.slice(0, 96).trimEnd() + "…" : text;
      setContextPreview(preview);
      setOpen(true);
      setPermissionAsked(true);

      // Prime conversation history so follow-up questions land in context.
      historyRef.current.push({
        role: "assistant",
        content: `I just read aloud a new dispatch from ${author}: "${text}"`,
      });
      if (historyRef.current.length > 16) {
        historyRef.current = historyRef.current.slice(-16);
      }

      speakDispatch(intro, text);
    };

    window.addEventListener("marcus:announce-dispatch", handler as EventListener);
    return () => window.removeEventListener("marcus:announce-dispatch", handler as EventListener);
  }, [startRecognition]);

  // Discuss-with-Marcus: any component (e.g. OrakzaiSocialFeed) can dispatch
  // window.dispatchEvent(new CustomEvent("marcus:discuss", { detail: { text, author, handle } }))
  // to hand a piece of content to Marcus and open the orb in conversation mode.
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      const text = String(detail.text || "").trim();
      if (!text) return;

      const ctxLine =
        "Context dispatch the user is asking about" +
        (detail.author ? ` (from ${detail.author}${detail.handle ? " " + detail.handle : ""})` : "") +
        `: "${text}"`;

      // Prime the conversation history so the OpenAI brain sees the post on the next turn.
      historyRef.current.push({ role: "user", content: ctxLine });
      historyRef.current.push({
        role: "assistant",
        content: "I have reviewed this dispatch. What specific details can I clarify for you?",
      });
      if (historyRef.current.length > 16) {
        historyRef.current = historyRef.current.slice(-16);
      }

      const preview = text.length > 64 ? text.slice(0, 64).trimEnd() + "…" : text;
      setContextPreview(preview);
      setOpen(true);
      setPermissionAsked(true);
      setMuted(false);
      mutedRef.current = false;
      wakeArmedRef.current = false;
      setCaption("Reviewing the dispatch…");
      try { startRecognition(); } catch { /* ignore */ }
      speak("I have reviewed this dispatch. What specific details can I clarify for you?");
    };
    window.addEventListener("marcus:discuss", handler as EventListener);
    return () => window.removeEventListener("marcus:discuss", handler as EventListener);
  }, [speak, startRecognition]);

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
              {contextPreview && (
                <div
                  className="px-4 pt-3 pb-0"
                  style={{ borderTop: `1px solid ${GOLD}22` }}
                >
                  <motion.div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                    animate={
                      isAnnouncing
                        ? {
                            background: [
                              "rgba(234,179,8,0.12)",
                              "rgba(234,179,8,0.32)",
                              "rgba(234,179,8,0.12)",
                            ],
                            borderColor: [
                              "rgba(234,179,8,0.45)",
                              "rgba(244,206,69,0.95)",
                              "rgba(234,179,8,0.45)",
                            ],
                            boxShadow: [
                              "0 0 0 rgba(212,175,55,0)",
                              "0 0 18px rgba(212,175,55,0.7)",
                              "0 0 0 rgba(212,175,55,0)",
                            ],
                          }
                        : {
                            background: "rgba(234,179,8,0.10)",
                            borderColor: "rgba(234,179,8,0.35)",
                            boxShadow: "0 0 0 rgba(212,175,55,0)",
                          }
                    }
                    transition={
                      isAnnouncing
                        ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                    style={{
                      color: "#fde68a",
                      maxWidth: "100%",
                      borderWidth: 1,
                      borderStyle: "solid",
                    }}
                    title={contextPreview}
                  >
                    {isAnnouncing && (
                      <span className="relative flex h-1.5 w-1.5 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#F4CE45" }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#F4CE45" }} />
                      </span>
                    )}
                    <span style={{ opacity: 0.75 }}>
                      {isAnnouncing ? "Reading dispatch:" : "Discussing:"}
                    </span>
                    <span
                      style={{
                        color: "#fef3c7",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "20rem",
                      }}
                    >
                      {contextPreview}
                    </span>
                  </motion.div>
                </div>
              )}
              {caption && (
                <div
                  className="px-4 pb-3 pt-0 text-[12.5px] leading-snug text-zinc-200"
                  style={{ borderTop: contextPreview ? "none" : `1px solid ${GOLD}22` }}
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
