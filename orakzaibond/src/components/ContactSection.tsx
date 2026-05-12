import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Mail, MessageCircle, Send, Globe, Building2,
  CheckCircle2, Phone, ChevronRight, Award,
} from "lucide-react";

/* ── Social link data ──────────────────────────────────────────────── */
const SOCIALS = [
  {
    name: "Facebook", href: "https://www.facebook.com/orakzaibond",
    color: "#1877F2", rgb: "24,119,242",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram", href: "https://www.instagram.com/orakzaibond",
    color: "#E1306C", rgb: "225,48,108",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Telegram", href: "https://t.me/orakzaibond",
    color: "#26A5E4", rgb: "38,165,228",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter", href: "https://x.com/orakzaibond",
    color: "#E7E9EA", rgb: "231,233,234",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Medium", href: "https://medium.com/@orakzaibond",
    color: "#FFC017", rgb: "255,192,23",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
  {
    name: "Reddit", href: "https://www.reddit.com/r/orakzaibond",
    color: "#FF4500", rgb: "255,69,0",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    name: "CoinMarketCap", href: "https://coinmarketcap.com/currencies/orakzaibond",
    color: "#3861FB", rgb: "56,97,251",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 3.857c4.497 0 8.143 3.646 8.143 8.143S16.497 20.143 12 20.143 3.857 16.497 3.857 12 7.503 3.857 12 3.857zm0 1.715a6.428 6.428 0 100 12.856A6.428 6.428 0 0012 5.572zm-.857 2.857l3.428 2.143v4.285l-3.428 2.143-3.429-2.143V10.57l3.429-2.141z" />
      </svg>
    ),
  },
];

/* ── Global map SVG dots background ───────────────────────────────── */
function GlobalMapBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#EAB308" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* Karachi pin glow */}
      <div className="absolute" style={{ bottom: "32%", left: "55%", transform: "translate(-50%,-50%)" }}>
        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="w-16 h-16 rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(234,179,8,0.55) 0%,transparent 70%)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_14px_rgba(234,179,8,0.9)]" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-primary/70">Karachi</div>
      </div>

      {/* Dubai pin glow */}
      <div className="absolute" style={{ bottom: "38%", left: "61%", transform: "translate(-50%,-50%)" }}>
        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 1.2 }}
          className="w-16 h-16 rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(96,165,250,0.55) 0%,transparent 70%)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-sky-400/70">Dubai HQ</div>
      </div>

      {/* Connecting line (SVG arc) — uses viewBox coordinates */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 1000 500" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 550 340 Q 570 270 610 310"
          fill="none" stroke="url(#arcGrad)" strokeWidth="2" strokeDasharray="6 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1.5 }}
        />
      </svg>
    </div>
  );
}

/* ── Museum of Future placeholder card ───────────────────────────── */
function DubaiMapCard() {
  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden flex-shrink-0"
      style={{ border: "1px solid rgba(96,165,250,0.2)", background: "linear-gradient(135deg,#06090f 0%,#0a1020 100%)" }}>
      {/* Skyline silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-20" viewBox="0 0 400 100" preserveAspectRatio="none">
        <polygon points="0,100 0,60 20,60 20,40 30,40 30,20 40,20 40,40 60,40 60,55 80,55 80,30 95,30 95,15 105,15 105,30 120,30 120,50 140,50 140,35 155,35 155,10 165,10 165,35 180,35 180,50 200,50 200,45 220,45 220,60 240,60 240,40 250,40 250,25 260,25 260,40 280,40 280,55 300,55 300,65 320,65 320,45 330,45 330,60 350,60 350,70 370,70 370,60 390,60 400,60 400,100" fill="#60a5fa" />
      </svg>
      {/* Stars */}
      {[...Array(18)].map((_, i) => (
        <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white"
          style={{ top: `${10 + Math.random() * 45}%`, left: `${5 + Math.random() * 90}%` }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}
      {/* Museum glow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-8 rounded-full blur-xl"
          style={{ background: "rgba(96,165,250,0.5)" }} />
      </div>
      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Building2 className="w-8 h-8 text-sky-400/60" />
        <p className="text-[11px] font-black uppercase tracking-widest text-sky-300/70">Museum of the Future</p>
        <p className="text-[9px] text-sky-400/40 font-mono">Sheikh Zayed Rd · Dubai</p>
      </div>
      {/* Live badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-sky-400">Global HQ</span>
      </div>
    </div>
  );
}

/* ── Contact Form ────────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSent(true); setSending(false); }, 1200);
  }

  const inputCls = "w-full h-11 px-4 rounded-xl text-sm text-foreground placeholder:text-foreground/30 outline-none transition-all focus:ring-2 focus:ring-primary/40";
  const inputStyle = { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(234,179,8,0.12)" };
  const focusStyle = { boxShadow: "0 0 0 2px rgba(234,179,8,0.2)" };

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-12 text-center h-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </motion.div>
          <h3 className="font-black text-xl text-foreground">Message Sent!</h3>
          <p className="text-sm text-foreground/55 max-w-xs leading-relaxed">
            We've received your message and will respond within 24 hours at your email.
          </p>
          <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="mt-2 text-xs text-primary/60 hover:text-primary transition-colors font-semibold">
            Send another message →
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={handleSubmit} className="space-y-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="Faisal Orakzai" className={inputCls} style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => { e.target.style.boxShadow = ""; }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" className={inputCls} style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => { e.target.style.boxShadow = ""; }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Subject</label>
            <select name="subject" value={form.subject} onChange={handleChange} required
              className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => { e.target.style.boxShadow = ""; }}>
              <option value="" disabled>Select a subject…</option>
              <option value="investment">Partnership / Investment</option>
              <option value="ico">ICO Inquiry</option>
              <option value="technical">Technical Support</option>
              <option value="media">Media / Press</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
              placeholder="Tell us about your inquiry…"
              className={`${inputCls} h-auto py-3 resize-none`} style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => { e.target.style.boxShadow = ""; }} />
          </div>
          <motion.button type="submit" disabled={sending}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg,#EAB308 0%,#ca8a04 100%)",
              color: "#060818",
              boxShadow: "0 0 28px rgba(234,179,8,0.45), 0 4px 16px rgba(0,0,0,0.5)",
            }}>
            {sending ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? "Sending…" : "Send Message"}
          </motion.button>
          <p className="text-center text-[10px] text-foreground/25 font-mono">
            Encrypted · Confidential · Responded within 24 hours
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/* ── Main Section ────────────────────────────────────────────────── */
export default function ContactSection() {
  const formRef = useRef<HTMLDivElement>(null);

  return (
    <section id="contact" className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#04050f 0%,#060818 60%,#04050f 100%)" }}>

      <GlobalMapBg />

      {/* Ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(234,179,8,0.05),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_20%_at_75%_60%,rgba(96,165,250,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/6 mb-5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Contact Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            Reach Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
              Global HQ
            </span>
          </h2>
          <p className="text-foreground/55 text-lg max-w-xl mx-auto leading-relaxed">
            Whether you're a potential investor, partner, or media — we respond within 24 hours.
            Headquarters based in the heart of Dubai.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* LEFT: Corporate info */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="space-y-5">

            {/* Dubai HQ card */}
            <div className="rounded-3xl p-6 space-y-5"
              style={{ background: "rgba(8,12,22,0.97)", border: "1px solid rgba(96,165,250,0.18)", boxShadow: "0 0 40px rgba(96,165,250,0.04)" }}>

              {/* Dubai Registered badge + title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)" }}>
                  <Building2 className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-foreground text-sm">Dubai Global HQ</p>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>
                      <Award className="w-2.5 h-2.5" />
                      Dubai Registered
                    </span>
                  </div>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    Al Moosa Tower 1, Office 1605, Sheikh Zayed Rd,<br />
                    Opp. Museum of the Future · Trade Center First, Dubai UAE
                  </p>
                </div>
              </div>

              {/* Museum of the Future widget */}
              <DubaiMapCard />

              {/* Map link */}
              <a href="https://maps.google.com/?q=Al+Moosa+Tower+1+Sheikh+Zayed+Road+Dubai"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-sky-400/70 hover:text-sky-400 transition-colors font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Email contacts */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Corporate Inquiries", sub: "Partnerships & Investment",
                  email: "invest@orakzaibond.com", icon: Mail, color: "234,179,8",
                  href: "mailto:invest@orakzaibond.com",
                },
                {
                  label: "General Support", sub: "Official Contact Email",
                  email: "support@orakzaibond.com", icon: Mail, color: "96,165,250",
                  href: "mailto:support@orakzaibond.com",
                },
              ].map((c) => (
                <motion.a key={c.email} href={c.href} whileHover={{ y: -2 }}
                  className="flex flex-col gap-2 p-4 rounded-2xl transition-all"
                  style={{ background: `rgba(${c.color},0.05)`, border: `1px solid rgba(${c.color},0.15)` }}>
                  <div className="flex items-center gap-2">
                    <c.icon className="w-4 h-4 flex-shrink-0" style={{ color: `rgb(${c.color})` }} />
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `rgb(${c.color})` }}>{c.label}</span>
                  </div>
                  <p className="text-[10px] text-foreground/40 font-semibold">{c.sub}</p>
                  <p className="text-xs font-black text-foreground/80 break-all">{c.email}</p>
                </motion.a>
              ))}
            </div>

            {/* WhatsApp primary CTA */}
            <motion.a href="https://wa.me/923367970004" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl transition-all group"
              style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.22)", boxShadow: "0 0 20px rgba(37,211,102,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)" }}>
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-foreground">WhatsApp Support</p>
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400">
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Online Now
                    </span>
                  </div>
                  <p className="text-xs text-foreground/40 font-mono mt-0.5">+92 336 7970004</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-sm"
                style={{ background: "rgba(37,211,102,0.15)", color: "#25D366" }}>
                <Phone className="w-4 h-4" />
                Chat
              </div>
            </motion.a>

            {/* Social media ecosystem */}
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Social Media Ecosystem</p>
              <div className="grid grid-cols-4 gap-2.5">
                {SOCIALS.map((s) => (
                  <motion.a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.name} whileHover={{ y: -3, scale: 1.08 }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all group"
                    style={{ background: `rgba(${s.rgb},0.06)`, border: `1px solid rgba(${s.rgb},0.15)` }}>
                    <div style={{ color: s.color }}>{s.icon}</div>
                    <span className="text-[8px] font-bold text-foreground/40 text-center leading-tight group-hover:text-foreground/70 transition-colors">
                      {s.name.split(" /")[0]}
                    </span>
                  </motion.a>
                ))}
              </div>
              <p className="text-center text-[9px] text-foreground/25 font-mono mt-3">All handles: @orakzaibond</p>
            </div>
          </motion.div>

          {/* RIGHT: Contact form */}
          <motion.div ref={formRef}
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg,rgba(10,14,24,0.98) 0%,rgba(6,9,16,0.99) 100%)",
              border: "1px solid rgba(234,179,8,0.18)",
              boxShadow: "0 0 60px rgba(234,179,8,0.05)",
            }}>
            {/* Gold corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top right,rgba(234,179,8,0.07),transparent)" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)" }}>
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/50">Direct Inquiry</p>
                  <h3 className="font-black text-foreground text-base leading-tight">Send Us a Message</h3>
                </div>
              </div>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
