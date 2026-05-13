/**
 * MobileDrawer — standalone mobile navigation drawer.
 *
 * Why it lives outside SiteSidebar.tsx (Chairman directive 2026-04-30, fix #2):
 * The previous build rendered the mobile drawer INSIDE <SiteSidebar/>, which
 * is wrapped in an ErrorBoundary scope="Sidebar" silent. That boundary
 * renders NOTHING on error. ReserveWidget inside the sidebar calls an RPC
 * (fetchAllocations) and on flaky mobile networks it throws → silent boundary
 * unmounts the WHOLE sidebar tree → the drawer never enters the DOM.
 * Result: tapping the hamburger felt like a click but produced nothing.
 *
 * This component:
 *   • has ZERO dependency on SiteSidebar, ReserveWidget, or any RPC
 *   • is rendered in App.tsx in its OWN <ErrorBoundary scope="MobileDrawer">
 *   • portals to <body> to escape every ancestor stacking / filter context
 *   • uses framer-motion for a smooth 320ms slide
 *   • locks body scroll while open (iOS Safari)
 *   • closes on Escape, scrim tap, or any nav-link tap
 */

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  X, Home, Info, Coins, Ticket, PieChart, Map, Rocket, Users,
  Cpu, Trophy, FileText, Crown, Shield, Star, Lock,
  Twitter, Send, Mail, BookOpen, Download, ExternalLink,
  BarChart3, Landmark, BookMarked,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ReserveWidget from "./ReserveWidget";
import ErrorBoundary from "./ErrorBoundary";

// Local nav definitions — intentionally duplicated from SiteSidebar.tsx so
// this drawer NEVER imports from SiteSidebar (importing would re-introduce
// the silent-boundary failure mode we just fixed). If you add or rename a
// nav item, update both files.
const SECTION_ITEMS = [
  { labelKey: "nav.home",       label: "Home",       icon: Home,      href: "/"           },
  { labelKey: "nav.dashboard",  label: "Dashboard",  icon: BarChart3, href: "/dashboard"  },
  { labelKey: "nav.about",      label: "About",      icon: Info,      href: "/about"      },
  { labelKey: "nav.token",      label: "Token",      icon: Coins,     href: "/token"      },
  { labelKey: "nav.staking",    label: "Staking",    icon: Lock,      href: "/staking"    },
  { labelKey: "nav.lottery",    label: "Lottery",    icon: Ticket,    href: "/lottery"    },
  { labelKey: "nav.tokenomics", label: "Tokenomics", icon: PieChart,  href: "/tokenomics" },
  { labelKey: "nav.roadmap",    label: "Roadmap",    icon: Map,       href: "/roadmap"    },
  { labelKey: "nav.icoBuy",     label: "ICO / Buy",  icon: Rocket,    href: "/ico"        },
  { labelKey: "nav.community",  label: "Community",  icon: Users,     href: "/community"  },
];

const PAGE_ITEMS = [
  { labelKey: "nav.vault",      label: "Vault",       icon: Landmark,   href: "/vault"      },
  { labelKey: "nav.security",   label: "Security",    icon: Shield,     href: "/security"   },
  { labelKey: "nav.registry",   label: "Registry",    icon: BookMarked, href: "/registry"   },
  { labelKey: "nav.ambassador", label: "Ambassador",  icon: Star,       href: "/ambassador" },
  { labelKey: "nav.legal",      label: "Legal Vault", icon: Lock,       href: "/legal"      },
  { labelKey: "nav.system",     label: "System",      icon: Cpu,        href: "/system"     },
  { labelKey: "nav.winners",    label: "Winners",     icon: Trophy,     href: "/winners"    },
  { labelKey: "nav.rules",      label: "Rules",       icon: FileText,   href: "/rules"      },
  { labelKey: "nav.founder",    label: "Founder",     icon: Crown,      href: "/founder"    },
  { labelKey: "nav.admin",      label: "Admin",       icon: Shield,     href: "/admin"      },
];

const DOC_LINKS = [
  { label: "OKBOND PDF",      icon: FileText, href: "https://drive.google.com/file/d/1Q6bClDOeBCBxBZfKdD9SnqSpNFrG-u7A/view?usp=drivesdk" },
  { label: "Whitepaper",      icon: BookOpen, href: "https://drive.google.com/file/d/1Psz7Iy5aREH_ltKPGLglTwR2ln1VTHWS/view?usp=drivesdk" },
  { label: "Security Review", icon: Shield,   href: "https://drive.google.com/file/d/1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj/view?usp=drivesdk" },
];

const SOCIALS = [
  { label: "Twitter",  icon: Twitter, href: "https://x.com/orakzaibond1" },
  { label: "Telegram", icon: Send,    href: "https://t.me/orakzaibond"   },
  { label: "Email",    icon: Mail,    href: "mailto:info@orakzaibond.com" },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Defensive translation lookup. If LanguageContext is missing for any reason
// (theoretical edge-case, not currently possible) we fall back to the English
// label so the drawer never crashes.
function useSafeT(): (key: string) => string {
  try {
    const { t } = useLanguage();
    return t;
  } catch {
    return (key: string) => key;
  }
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const [location, setLocation] = useLocation();
  const t = useSafeT();

  // Body scroll lock while open.
  //
  // Chairman directive 2026-04-30 (round 6, FINAL): the round-4
  // position:fixed body lock looked correct in theory but on real iOS
  // Safari it still produced a "frozen" feeling drawer for the
  // Chairman — every touch on the nav list felt dead. We've stripped
  // it entirely, exactly as he ordered:
  //
  //     "use 100dvh + overflow-y:auto !important, remove
  //     touch-action:none and position:fixed."
  //
  // The new lock is the lightest possible thing that works: while the
  // drawer is open we set body { overflow: hidden } only. We do NOT
  // touch position, top, or touch-action on body. The drawer panel
  // owns its own scroll via h-[100dvh] + overflow-y:auto and the
  // browser handles momentum scrolling natively. Background scroll is
  // prevented because the body is overflow:hidden; the small visual
  // jump that some iOS versions show when scrollbar gutters appear is
  // an acceptable trade for the drawer feeling alive.
  useEffect(() => {
    if (!open) return;
    // Gold-standard body scroll lock: position:fixed + saved scrollY.
    // This is the only approach that reliably prevents background scroll
    // on both iOS Safari (which ignores overflow:hidden on body) and
    // Android Chrome (which can still rubber-band through overflow:hidden).
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflowY: body.style.overflowY,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll"; // keep scrollbar gutter to avoid layout shift
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflowY = prev.overflowY;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const tryT = (key: string, fallback: string): string => {
    const v = t(key);
    return v && v !== key ? v : fallback;
  };

  const navigate = (href: string): void => {
    onClose();
    if (href.startsWith("http") || href.startsWith("mailto")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (href.startsWith("/#")) {
      const hash = href.substring(1);
      if (location === "/") {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setLocation("/");
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
      return;
    }
    setLocation(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SectionLabel = ({ children }: { children: ReactNode }) => (
    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold px-2 mb-2 mt-3">
      {children}
    </p>
  );

  const NavButton = ({
    icon: Icon, label, href, active = false, external = false,
  }: {
    icon: typeof Home; label: string; href: string; active?: boolean; external?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => navigate(href)}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors
        ${active
          ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_8px_rgba(234,179,8,0.12)]"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-primary/10 border border-transparent"
        }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {external && <ExternalLink className="w-3 h-3 opacity-30 flex-shrink-0" />}
      {active && !external && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
      )}
    </button>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim — z-[9990] so it sits above all page content but below the drawer.
              onTouchMove preventDefault blocks background page scroll when the drawer
              is open — body overflow:hidden alone is not reliable on all Android builds. */}
          <motion.div
            key="okbond-mobile-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="okbond-sidebar-mobile-scrim lg:hidden fixed inset-0 bg-black/65"
            style={{ zIndex: 9990, touchAction: "none" }}
          />

          {/* Drawer
              Chairman directive 2026-04-30 (round 6 FINAL): height MUST be
              100dvh (dynamic viewport height) so the panel always fills the
              real visible viewport on iOS Safari — even when the URL bar
              expands/contracts during scroll. The previous top-0/bottom-0
              pin was equivalent to 100vh, which on iOS includes the
              behind-the-URL-bar area and made the bottom of the nav list
              unreachable when the URL bar reappeared. */}
          <motion.aside
            key="okbond-mobile-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.32 }}
            className="okbond-sidebar-mobile-drawer lg:hidden fixed left-0 top-0 w-[280px] max-w-[85vw] flex flex-col bg-background border-r border-border/40 shadow-[4px_0_40px_rgba(0,0,0,0.6)]"
            style={{ willChange: "transform", height: "100dvh", maxHeight: "100dvh", zIndex: 9995 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/okbond-logo.png"
                  alt="OKBOND"
                  className="w-8 h-8 rounded-full object-cover border border-primary/40"
                />
                <div>
                  <p className="text-xs font-extrabold text-foreground leading-none">OKBOND</p>
                  <p className="text-[9px] text-primary font-mono tracking-wider leading-none mt-0.5">Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="w-9 h-9 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 active:bg-primary/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable nav body.
                flex: 1 1 0 + minHeight: 0 makes this div grow to fill
                the remaining flex space in the aside (which has an
                explicit height: 100dvh) while also allowing it to shrink
                below its natural content height — the prerequisite for
                overflow-y:scroll to activate on iOS Safari.  */}
            <div
              style={{
                flex: "1 1 0",
                minHeight: 0,
                overflowY: "scroll",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
              className="py-3 px-2 space-y-0.5"
            >
              <SectionLabel>Sections</SectionLabel>
              {SECTION_ITEMS.map((item) => (
                <NavButton
                  key={item.href + item.label}
                  icon={item.icon}
                  label={tryT(item.labelKey, item.label)}
                  href={item.href}
                  active={location === item.href}
                />
              ))}

              <div className="my-3 border-t border-border/30 mx-1" />
              <SectionLabel>Pages</SectionLabel>
              {PAGE_ITEMS.map((item) => (
                <NavButton
                  key={item.href + item.label}
                  icon={item.icon}
                  label={tryT(item.labelKey, item.label)}
                  href={item.href}
                  active={location === item.href}
                />
              ))}

              {/* Reserve Transparency widget — Chairman directive 2026-04-30
                  (round 5): the Reserve Transparency dial that lives in the
                  desktop sidebar must also appear inside the mobile drawer
                  so investors browsing on a phone get the same proof-of-
                  collateral display the desktop version offers.
                  
                  Wrapped in its OWN ErrorBoundary so that if the underlying
                  Supabase fetch fails (the original silent-failure that
                  caused the whole drawer to disappear in earlier rounds),
                  ONLY this widget area collapses — the nav links, docs,
                  and socials around it keep working perfectly. */}
              <div className="my-3 border-t border-border/30 mx-1" />
              <ErrorBoundary scope="MobileDrawer/ReserveWidget" silent>
                <div className="px-1">
                  <ReserveWidget />
                </div>
              </ErrorBoundary>

              <div className="my-3 border-t border-border/30 mx-1" />
              <SectionLabel>Documents</SectionLabel>
              {DOC_LINKS.map((doc) => {
                const Icon = doc.icon;
                return (
                  <a
                    key={doc.label}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-primary/80 hover:text-primary hover:bg-primary/8 active:bg-primary/15 border border-transparent hover:border-primary/15 transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">{doc.label}</span>
                    <Download className="w-3 h-3 opacity-60 flex-shrink-0" />
                  </a>
                );
              })}
            </div>

            {/* Footer — socials */}
            <div className="border-t border-border/30 py-3 px-2 flex-shrink-0">
              <SectionLabel>Connect</SectionLabel>
              <div className="flex flex-col gap-1">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  const isMail = s.href.startsWith("mailto");
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target={isMail ? undefined : "_blank"}
                      rel={isMail ? undefined : "noopener noreferrer"}
                      onClick={onClose}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-muted-foreground hover:text-primary hover:bg-primary/8 active:bg-primary/15 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{s.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
