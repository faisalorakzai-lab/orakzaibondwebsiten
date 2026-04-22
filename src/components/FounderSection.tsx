import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Quote, BadgeCheck, Building2, Globe, Linkedin, Twitter, ExternalLink as LinkIcon, Send
} from "lucide-react";

const SOCIALS = [
  {
    label: "LinkedIn",
    handle: "orakzaifaisal",
    href: "https://www.linkedin.com/in/orakzaifaisal",
    icon: <Linkedin className="w-4 h-4" />,
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.08)",
    border: "rgba(10,102,194,0.25)",
  },
  {
    label: "Crunchbase",
    handle: "Faisal Orakzai",
    href: "https://www.crunchbase.com/person/faisal-orakzai",
    icon: <LinkIcon className="w-4 h-4" />,
    color: "#0284c7",
    bg: "rgba(2,132,199,0.08)",
    border: "rgba(2,132,199,0.25)",
  },
  {
    label: "X (Twitter)",
    handle: "@faisalorakzai",
    href: "https://x.com/faisalorakzai",
    icon: <Twitter className="w-4 h-4" />,
    color: "#E5E7EB",
    bg: "rgba(229,231,235,0.06)",
    border: "rgba(229,231,235,0.18)",
  },
];

const STATS = [
  { value: "12+",  label: "Companies", icon: Building2 },
  { value: "250+", label: "Projects",  icon: Globe      },
  { value: "Rank 2523", label: "Crunchbase World", icon: BadgeCheck  },
];

export default function FounderSection() {
  useEffect(() => {
    // Load LinkedIn badge script asynchronously
    const script = document.createElement("script");
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="founder" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04060f 0%, #060a1a 40%, #08091e 70%, #04060f 100%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_50%,rgba(234,179,8,0.05),transparent)]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/8 text-primary text-[10px] font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <BadgeCheck className="w-3.5 h-3.5" />
            Founder Credentials · Orakzai Group
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT: Identity & Badge */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col items-center lg:items-start">
            <div className="mb-8 w-full flex justify-center lg:justify-start min-h-[250px]">
              {/* LinkedIn Premium Badge Rendering */}
              <div className="badge-base LI-profile-badge" 
                   data-locale="en_US" 
                   data-size="medium" 
                   data-theme="dark" 
                   data-type="VERTICAL" 
                   data-vanity="orakzaifaisal" 
                   data-version="v1">
                <a className="badge-base__link LI-simple-link" href="https://pk.linkedin.com/in/orakzaifaisal?trk=profile-badge">Faisal Orakzai</a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full mt-8">
              {STATS.map((s) => (
                <div key={s.label} className="text-center lg:text-left p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-lg font-black text-primary font-mono">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Biography & Socials */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}>
            <h2 className="text-5xl font-black text-foreground mb-4 leading-none">
              Faisal <span className="text-primary">Orakzai</span>
            </h2>
            <p className="text-primary font-mono text-sm font-bold uppercase tracking-widest mb-6">Chairman, Orakzai Group</p>
            
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed mb-10">
              <p>
                A visionary leader in the decentralized finance space, Faisal Orakzai has built a global ecosystem of over 250 projects under the Orakzai Group umbrella.
              </p>
              <div className="p-6 rounded-2xl bg-primary/5 border-l-4 border-primary italic relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 opacity-10 text-primary" />
                "Orakzai Bond represents the sovereign financial layer we've envisioned—100% capital protection meeting the infinite potential of blockchain."
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 px-5 py-3 rounded-xl border transition-all hover:scale-105"
                   style={{ backgroundColor: s.bg, borderColor: s.border }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{s.label}</p>
                    <p className="text-sm font-bold text-foreground">{s.handle}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Project Socials</p>
              <div className="flex gap-4">
                <a href="https://x.com/orakzaibond1" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-primary/20 transition-all">
                  <Twitter className="w-5 h-5 text-primary" />
                </a>
                <a href="https://t.me/orakzaibond" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-primary/20 transition-all">
                  <Send className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
