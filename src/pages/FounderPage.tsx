import { motion } from "framer-motion";
import { useEffect } from "react";
import { BadgeCheck, Building2, Globe, Linkedin, Twitter, Send, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const STATS = [
  { value: "12+", label: "Companies", icon: Building2 },
  { value: "Global Sovereign Infrastructure", label: "Projects", icon: Globe },
  { value: "Rank 2523", label: "Crunchbase", icon: BadgeCheck },
];

export default function FounderPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <main className="flex-1">
        {/* ── Exit Button ───────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px-12 pt-6">
          <Link href="/">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 bg-background/60 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.span>
          </Link>
        </div>

        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04060f 0%, #060a1a 40%, #08091e 70%, #04060f 100%)" }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_50%,rgba(234,179,8,0.05),transparent)]" />
          </div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/8 text-primary text-[10px] font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <BadgeCheck className="w-3.5 h-3.5" />
                Founder & Chairman · Orakzai Group
              </span>
              <h1 className="text-6xl md:text-7xl font-black mt-8 mb-4">
                Faisal <span className="text-primary">Orakzai</span>
              </h1>
              <p className="text-xl text-muted-foreground">Visionary Leader in Decentralized Finance</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col items-center">
                <div className="relative mb-12 w-full max-w-sm">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -inset-8 rounded-[3rem] pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(234,179,8,0.25) 0%, transparent 70%)" }}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 rounded-[2.5rem] border border-dashed pointer-events-none"
                    style={{ borderColor: "rgba(234,179,8,0.2)" }}
                  />
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 2px rgba(234,179,8,0.4), 0 0 50px rgba(234,179,8,0.2)",
                        "0 0 0 2px rgba(234,179,8,0.8), 0 0 80px rgba(234,179,8,0.4)",
                        "0 0 0 2px rgba(234,179,8,0.4), 0 0 50px rgba(234,179,8,0.2)",
                      ],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="relative rounded-3xl overflow-hidden"
                    style={{ width: "100%", aspectRatio: "3/4" }}
                  >
                    {[
                      "top-0 left-0 border-t-2 border-l-2 rounded-tl-3xl",
                      "top-0 right-0 border-t-2 border-r-2 rounded-tr-3xl",
                      "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-3xl",
                      "bottom-0 right-0 border-b-2 border-r-2 rounded-br-3xl",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-10 h-10 border-primary/70 z-20 pointer-events-none ${cls}`} />
                    ))}

                    <img src="/faisal-orakzai.jpg" alt="Faisal Orakzai" className="w-full h-full object-cover object-top" />

                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(135deg, transparent 40%, rgba(234,179,8,0.1) 55%, transparent 70%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 px-6 py-5 z-10" style={{ background: "linear-gradient(to top, rgba(4,6,15,0.98) 0%, rgba(4,6,15,0.7) 70%, transparent 100%)" }}>
                      <p className="text-xs font-black text-primary font-mono tracking-widest uppercase">Orakzai Group</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">Karachi, Pakistan 🇵🇰</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-6 -right-6 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-primary/40 z-20 bg-background shadow-[0_0_25px_rgba(234,179,8,0.3)]"
                  >
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Verified</span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mt-12">
                  {STATS.map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-lg font-black text-primary font-mono">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="w-full mt-12 flex justify-center">
                  <div className="badge-base LI-profile-badge" data-locale="en_US" data-size="medium" data-theme="dark" data-type="VERTICAL" data-vanity="orakzaifaisal" data-version="v1" style={{ minHeight: "310px" }}>
                    <a className="badge-base__link LI-simple-link" href="https://pk.linkedin.com/in/orakzaifaisal?trk=profile-badge">Faisal Orakzai</a>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <p className="text-primary font-mono text-sm font-black uppercase tracking-widest mb-4">About</p>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">Faisal Orakzai is a visionary entrepreneur and blockchain pioneer who has revolutionized the decentralized finance landscape. With over a decade of experience in emerging technologies, he has successfully built and scaled a global ecosystem of Global Sovereign Infrastructure under the Orakzai Group.</p>
                  <p className="text-lg text-muted-foreground leading-relaxed">His commitment to innovation, capital protection, and community empowerment has made Orakzai Bond the premier choice for serious investors seeking exposure to cutting-edge blockchain infrastructure on Polygon.</p>
                </div>

                <div className="p-8 rounded-3xl bg-primary/8 border border-primary/25 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-5">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5-6 0-6.002 4-6 7v10c0 1-1 4 6 5z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-black text-primary italic relative z-10 mb-4">"Orakzai Bond represents the sovereign financial layer we've envisioned—100% capital protection meeting the infinite potential of blockchain."</p>
                  <p className="text-sm font-bold text-muted-foreground/70">— Faisal Orakzai, Founder & Chairman</p>
                </div>

                <div className="space-y-4">
                  <p className="text-primary font-mono text-sm font-black uppercase tracking-widest">Credentials</p>
                  <a href="https://www.linkedin.com/in/orakzaifaisal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-blue-500/30 bg-blue-500/8 hover:bg-blue-500/15 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                      <Linkedin className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">LinkedIn Profile</p>
                      <p className="text-xs text-muted-foreground">@orakzaifaisal · Premium Member</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-all" />
                  </a>

                  <a href="https://www.crunchbase.com/person/faisal-orakzai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-sky-500/30 bg-sky-500/8 hover:bg-sky-500/15 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/30 transition-all">
                      <span className="text-xl font-black text-sky-400">⚡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Crunchbase Profile</p>
                      <p className="text-xs text-muted-foreground">World Rank: #2523 · Gold Badge</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-all" />
                  </a>

                  <a href="https://www.crunchbase.com/organization/orakzai-bond" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-primary/30 bg-primary/8 hover:bg-primary/15 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all">
                      <span className="text-xl font-black text-primary">🏆</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Orakzai Bond · Crunchbase</p>
                      <p className="text-xs text-muted-foreground">Verified Organization Profile</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-all" />
                  </a>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-primary font-mono text-sm font-black uppercase tracking-widest mb-4">Connect</p>
                  <div className="flex gap-4">
                    <a href="https://x.com/faisalorakzai" target="_blank" className="p-4 rounded-full bg-white/5 hover:bg-primary/20 transition-all group">
                      <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
                    </a>
                    <a href="https://t.me/orakzaibond" target="_blank" className="p-4 rounded-full bg-white/5 hover:bg-primary/20 transition-all group">
                      <Send className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
