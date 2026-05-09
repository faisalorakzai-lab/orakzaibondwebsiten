import { useLocation } from "wouter";
import { Home, BarChart3, Rocket, Lock, Menu } from "lucide-react";

const GOLD = "#D4AF37";

const NAV_ITEMS = [
  { href: "/",          icon: <Home       className="w-5 h-5" />, label: "Home"      },
  { href: "/dashboard", icon: <BarChart3  className="w-5 h-5" />, label: "Dashboard" },
  { href: "/ico",       icon: <Rocket     className="w-5 h-5" />, label: "ICO"       },
  { href: "/staking",   icon: <Lock       className="w-5 h-5" />, label: "Staking"   },
];

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export default function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const [location, setLocation] = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[8990] flex items-center justify-around"
      style={{
        background: "rgba(5,5,5,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(212,175,55,0.12)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        paddingTop: "8px",
        height: "calc(60px + max(env(safe-area-inset-bottom), 8px))",
      }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => setLocation(item.href)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation relative"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
              />
            )}
            <span style={{ color: isActive ? GOLD : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}>
              {item.icon}
            </span>
            <span
              className="text-[10px] font-semibold leading-none"
              style={{
                color: isActive ? GOLD : "rgba(255,255,255,0.3)",
                fontFamily: "'Sora','Inter',sans-serif",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu button */}
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="More menu"
      >
        <Menu className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="text-[10px] font-semibold leading-none" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Sora','Inter',sans-serif" }}>
          More
        </span>
      </button>
    </nav>
  );
}
