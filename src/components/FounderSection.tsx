import { motion } from "framer-motion";
import {
  Quote, BadgeCheck, ExternalLink, Building2, Globe,
} from "lucide-react";

const SOCIALS = [
  {
    label: "Instagram",
    handle: "@faisalorakzaiofficial",
    href: "https://instagram.com/faisalorakzaiofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: "#E1306C",
    glow: "rgba(225,48,108,0.35)",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.25)",
  },
  {
    label: "X (Twitter)",
    handle: "@faisalorakzaiofficial",
    href: "https://x.com/faisalorakzaiofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "#E5E7EB",
    glow: "rgba(229,231,235,0.25)",
    bg: "rgba(229,231,235,0.06)",
    border: "rgba(229,231,235,0.18)",
  },
  {
    label: "LinkedIn",
    handle: "faisalorakzaiofficial",
    href: "https://linkedin.com/in/faisalorakzaiofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: "#0A66C2",
    glow: "rgba(10,102,194,0.35)",
    bg: "rgba(10,102,194,0.08)",
    border: "rgba(10,102,194,0.25)",
  },
  {
    label: "Facebook",
    handle: "faisalorakzaiofficial",
    href: "https://facebook.com/faisalorakzaiofficial",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: "#1877F2",
    glow: "rgba(24,119,242,0.35)",
    bg: "rgba(24,119,242,0.08)",
    border: "rgba(24,119,242,0.25)",
  },
];

const STATS = [
  { value: "12+",  label: "Companies", icon: Building2 },
  { value: "250+", label: "Projects",  icon: Globe      },
  { value: "10K+", label: "Investors", icon: BadgeCheck  },
];

export default function FounderSection() {
  return (
    <section className="py-24 relative overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #04060f 0%, #060a1a 40%, #08091e 70%, #04060f 100%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_50%,rgba(234,179,8,0.05),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_75%_50%,rgba(100,120,255,0.04),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {/* Floating particles */}
        {[...Array(18)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-primary/20"
            style={{ width: 2, height: 2, left: `${(i * 5.8) % 100}%`, top: `${(i * 13.7) % 100}%` }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 4 + (i % 3) * 1.5, repeat: Infinity, delay: i * 0.4 }} />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* ── Section label ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/8 text-primary text-[10px] font-extrabold uppercase tracking-widest"
            style={{ boxShadow: "0 0 20px rgba(234,179,8,0.1)" }}>
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified Founder · Orakzai Group
          </span>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Portrait */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.25,0.46,0.45,0.94] }}
            className="flex flex-col items-center">

            {/* Gold frame + portrait */}
            <div className="relative">
              {/* Outer ambient glow */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-6 rounded-[2.5rem] pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(234,179,8,0.18) 0%, transparent 70%)" }} />

              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-[2rem] border border-dashed pointer-events-none"
                style={{ borderColor: "rgba(234,179,8,0.15)" }} />

              {/* Gold frame card */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 2px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.15)",
                    "0 0 0 2px rgba(234,179,8,0.7), 0 0 70px rgba(234,179,8,0.30)",
                    "0 0 0 2px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.15)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative rounded-3xl overflow-hidden"
                style={{ width: 340, height: 420, maxWidth: "100%" }}>

                {/* Gold corner accents */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-3xl",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-3xl",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-3xl",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-3xl",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-primary/70 z-20 pointer-events-none ${cls}`} />
                ))}

                {/* Photo */}
                <img
                  src="/faisal-orakzai.jpg"
                  alt="Faisal Orakzai — Founder & Chairman, Orakzai Group"
                  className="w-full h-full object-cover object-top"
                />

                {/* Subtle gold overlay shimmer */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, transparent 40%, rgba(234,179,8,0.08) 55%, transparent 70%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }} />

                {/* Bottom name plate */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4 z-10"
                  style={{ background: "linear-gradient(to top, rgba(4,6,15,0.95) 0%, rgba(4,6,15,0.6) 70%, transparent 100%)" }}>
                  <p className="text-xs font-extrabold text-primary font-mono tracking-widest uppercase">Orakzai Group</p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">Karachi, Pakistan 🇵🇰</p>
                </div>
              </motion.div>

              {/* Verified badge */}
              <motion.div
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 260 }}
                className="absolute -bottom-4 -right-4 flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-primary/40 z-20"
                style={{ background: "rgba(6,8,22,0.95)", boxShadow: "0 0 20px rgba(234,179,8,0.25)" }}>
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Verified</span>
              </motion.div>
            </div>

            {/* Stats row below photo */}
            <div className="flex items-center gap-6 mt-10">
              {STATS.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center">
                  <p className="text-xl font-extrabold font-mono text-primary">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Bio + Quote + Socials */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.25,0.46,0.45,0.94] }}>

            {/* Title */}
            <div className="mb-7">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/65 mb-2">
                Founder & Chairman
              </p>
              <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-1">
                Faisal{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">
                  Orakzai
                </span>
              </h2>
              <p className="text-sm text-muted-foreground/70 font-semibold mb-1">
                Founder & Chairman · Orakzai Group
              </p>
              {/* Handle row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {["@faisalorakzaiofficial"].map((h) => (
                  <span key={h} className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-primary/25 bg-primary/8 text-primary/80">
                    {h}
                  </span>
                ))}
                <span className="text-[10px] font-mono text-muted-foreground/40">· Verified Profile</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-primary/40 via-primary/15 to-transparent mb-7" />

            {/* Biography */}
            <div className="mb-8">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-3">Biography</p>
              <p className="text-foreground/85 leading-relaxed text-[15px]">
                A <span className="font-bold text-foreground">visionary entrepreneur and investor</span> with a proven track record
                in Finance, Real Estate, and Emerging Tech. Faisal is the driving force behind the{" "}
                <span className="text-primary font-bold">Orakzai Group</span>, overseeing{" "}
                <span className="font-bold text-foreground">12 diversified companies</span> with a mission to revolutionise
                digital finance through OKBOND — a blockchain-first ecosystem built for the next generation of investors.
              </p>
            </div>

            {/* Vision Quote */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-2xl p-6 mb-8 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(234,179,8,0.07) 0%, rgba(234,179,8,0.03) 100%)",
                border: "1px solid rgba(234,179,8,0.2)",
              }}>

              {/* Gold left bar */}
              <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-primary/80 via-primary/40 to-primary/10" />

              <Quote className="w-5 h-5 text-primary/40 mb-3" />

              <blockquote
                className="text-base leading-relaxed font-semibold italic mb-4"
                style={{ color: "#D4AF37" }}>
                "Our goal is not just to create a token, but to build a risk-free financial ecosystem
                where every partner grows with us."
              </blockquote>

              {/* Signature + name */}
              <div className="flex items-end justify-between">
                <div>
                  {/* SVG digital signature */}
                  <svg viewBox="0 0 200 48" className="w-40 h-10" fill="none">
                    <motion.path
                      d="M8 36 Q28 12 48 30 Q68 48 88 24 Q108 4 128 28 Q148 48 168 20 Q182 8 196 18"
                      stroke="#EAB308" strokeWidth="1.8" strokeLinecap="round" fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                      style={{ filter: "drop-shadow(0 0 5px rgba(234,179,8,0.65))" }} />
                    <motion.path
                      d="M12 40 Q55 44 95 40 Q135 36 172 42"
                      stroke="#EAB308" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 2.8 }} />
                  </svg>
                  <p className="text-xs font-extrabold text-primary font-mono mt-1">Faisal Orakzai</p>
                  <p className="text-[10px] text-muted-foreground/45 font-mono">Founder & Chairman · Orakzai Group</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Est.</p>
                  <p className="text-lg font-extrabold text-primary/50 font-mono">2024</p>
                </div>
              </div>
            </motion.div>

            {/* Social Connect */}
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">
                Connect with the Founder
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SOCIALS.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 group"
                    style={{ background: s.bg, borderColor: s.border }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${s.glow}`;
                      (e.currentTarget as HTMLElement).style.borderColor = s.color + "60";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.borderColor = s.border;
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: s.color + "18", color: s.color }}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground leading-none mb-0.5">{s.label}</p>
                      <p className="text-[10px] font-mono truncate" style={{ color: s.color + "aa" }}>
                        {s.handle}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
                      style={{ color: s.color }} />
                  </motion.a>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
