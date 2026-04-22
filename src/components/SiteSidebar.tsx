import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Home, Info, Coins, Ticket,
  PieChart, Map, Cpu, Trophy, Users, Shield, FileText,
  Crown, ExternalLink, Twitter, Send, Mail, Download, BookOpen, Rocket,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "hero",       label: "Home",        icon: <Home       className="w-4 h-4" />, href: "#"           },
  { id: "about",      label: "About",       icon: <Info       className="w-4 h-4" />, href: "/about"      },
  { id: "token",      label: "Token",       icon: <Coins      className="w-4 h-4" />, href: "#token"      },
  { id: "lottery",    label: "Lottery",     icon: <Ticket     className="w-4 h-4" />, href: "#lottery"    },
  { id: "tokenomics", label: "Tokenomics",  icon: <PieChart   className="w-4 h-4" />, href: "#tokenomics" },
  { id: "roadmap",    label: "Roadmap",     icon: <Map        className="w-4 h-4" />, href: "#roadmap"    },
  { id: "ico",        label: "ICO / Buy",   icon: <Rocket     className="w-4 h-4" />, href: "#ico"        },
  { id: "community",  label: "Community",   icon: <Users      className="w-4 h-4" />, href: "/community"  },
];

const PAGE_LINKS = [
  { label: "System",  icon: <Cpu      className="w-4 h-4" />, href: "/system"  },
  { label: "Winners", icon: <Trophy   className="w-4 h-4" />, href: "/winners" },
  { label: "Rules",   icon: <FileText className="w-4 h-4" />, href: "/rules"   },
  { label: "Founder", icon: <Crown    className="w-4 h-4" />, href: "/founder" },
  { label: "Admin",   icon: <Shield   className="w-4 h-4" />, href: "/admin"   },
];

const DOC_LINKS = [
  {
    label: "OKBOND PDF",
    icon: <FileText className="w-4 h-4" />,
    href: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr",
    view: "https://drive.google.com/file/d/1ciuxocfbRbwENLaclrpey50EJMxF_pdr/view?usp=drivesdk",
  },
  {
    label: "Whitepaper",
    icon: <BookOpen className="w-4 h-4" />,
    href: "https://drive.google.com/uc?export=download&id=1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh",
    view: "https://drive.google.com/file/d/1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh/view?usp=drivesdk",
  },
];

const SOCIALS = [
  { label: "Twitter",  icon: <Twitter className="w-3.5 h-3.5" />, href: "https://x.com/orakzaibond1" },
  { label: "Telegram", icon: <Send    className="w-3.5 h-3.5" />, href: "https://t.me/orakzaibond"  },
  { label: "Email",    icon: <Mail    className="w-3.5 h-3.5" />, href: "mailto:orakzaibond@gmail.com" },
];

export default function SiteSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = NAV_ITEMS.map(n => n.id);
    const observers: IntersectionObserver[] = [];

    sections.forEach(id => {
      const el = id === "hero" ? document.getElementById("root") || document.body : document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25, rootMargin: "-60px 0px -30% 0px" }
      );
      const target = id === "hero" ? document.querySelector("section, [data-section='hero']") || el : el;
      obs.observe(target);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false);
    if (href === "#") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const W_COLLAPSED = 60;
  const W_EXPANDED  = 220;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center ${expanded || mobile ? "justify-between px-4" : "justify-center px-2"} py-4 border-b border-border/40`}>
        {(expanded || mobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
            <img src="/okbond-logo.png" alt="OKBOND" className="w-8 h-8 rounded-full object-cover border border-primary/40" />
            <div>
              <p className="text-xs font-extrabold text-foreground leading-none">OKBOND</p>
              <p className="text-[9px] text-primary font-mono tracking-wider leading-none mt-0.5">Navigation</p>
            </div>
          </motion.div>
        )}
        {!mobile && (
          <button
            onClick={() => setExpanded(p => !p)}
            className={`w-7 h-7 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all ${!expanded ? "mx-auto" : ""}`}
          >
            {expanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {(expanded || mobile) && (
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold px-2 mb-2">Sections</p>
        )}
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.href)}
              title={!expanded && !mobile ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl transition-all text-left
                ${expanded || mobile ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
                ${active
                  ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_8px_rgba(234,179,8,0.12)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/25 border border-transparent"
                }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(expanded || mobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium flex-1 leading-none"
                >
                  {item.label}
                </motion.span>
              )}
              {(expanded || mobile) && active && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}

        <div className={`my-3 border-t border-border/30 ${!expanded && !mobile ? "mx-2" : "mx-1"}`} />

        {(expanded || mobile) && (
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold px-2 mb-2">Pages</p>
        )}
        {PAGE_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => scrollTo(link.href)}
            title={!expanded && !mobile ? link.label : undefined}
            className={`w-full flex items-center gap-3 rounded-xl transition-all text-left
              ${expanded || mobile ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
              text-muted-foreground hover:text-foreground hover:bg-muted/25 border border-transparent`}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            {(expanded || mobile) && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-medium flex-1"
              >
                {link.label}
              </motion.span>
            )}
            {(expanded || mobile) && <ExternalLink className="w-3 h-3 opacity-30 flex-shrink-0" />}
          </button>
        ))}

        <div className={`my-3 border-t border-border/30 ${!expanded && !mobile ? "mx-2" : "mx-1"}`} />

        {(expanded || mobile) && (
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold px-2 mb-2">Documents</p>
        )}
        {DOC_LINKS.map((doc) => (
          <a
            key={doc.label}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            title={!expanded && !mobile ? `Download ${doc.label}` : undefined}
            className={`w-full flex items-center gap-3 rounded-xl transition-all
              ${expanded || mobile ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
              text-primary/70 hover:text-primary hover:bg-primary/8 border border-transparent hover:border-primary/15`}
          >
            <span className="flex-shrink-0">{doc.icon}</span>
            {(expanded || mobile) && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-medium flex-1"
              >
                {doc.label}
              </motion.span>
            )}
            {(expanded || mobile) && <Download className="w-3 h-3 opacity-50 flex-shrink-0" />}
          </a>
        ))}
      </div>

      <div className={`border-t border-border/30 py-3 px-2 space-y-1`}>
        {(expanded || mobile) && (
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold px-2 mb-2">Connect</p>
        )}
        <div className={`flex ${expanded || mobile ? "flex-col gap-1" : "flex-col items-center gap-1.5"}`}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("mailto") ? undefined : "_blank"}
              rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              title={!expanded && !mobile ? s.label : undefined}
              className={`flex items-center gap-2.5 rounded-xl transition-all text-muted-foreground hover:text-primary
                ${expanded || mobile ? "px-3 py-2 hover:bg-primary/8" : "p-2 hover:bg-primary/8 justify-center"}`}
            >
              {s.icon}
              {(expanded || mobile) && <span className="text-xs">{s.label}</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        animate={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed left-0 top-20 bottom-0 z-40 glass-dark border-r border-border/40 overflow-hidden"
        style={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
      >
        <SidebarContent />
      </motion.aside>

      <button
        onClick={() => setMobileOpen(p => !p)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-7 h-14 bg-primary/20 border border-primary/40 border-l-0 rounded-r-xl flex items-center justify-center text-primary shadow-[2px_0_12px_rgba(234,179,8,0.2)]"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] glass-dark border-r border-border/40 shadow-[4px_0_40px_rgba(0,0,0,0.5)]"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
