import { useLocation } from "wouter";
import { Home, Rocket, Lock, Ticket, BarChart3 } from "lucide-react";

const GOLD = "#D4AF37";

const NAV_ITEMS = [
  { href: "/",          icon: Home,     label: "Home"      },
  { href: "/ico",       icon: Rocket,   label: "ICO"       },
  { href: "/staking",   icon: Lock,     label: "Staking"   },
  { href: "/lottery",   icon: Ticket,   label: "Lottery"   },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
];

interface MobileBottomNavProps {
  onMenuOpen?: () => void;
}

export default function MobileBottomNav({ onMenuOpen: _onMenuOpen }: MobileBottomNavProps) {
  const [location, setLocation] = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[8990]"
      style={{
        background: "rgba(5,5,5,0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "1px solid rgba(212,175,55,0.15)",
        paddingBottom: "max(env(safe-area-inset-bottom), 6px)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around"
        style={{ height: "58px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => setLocation(item.href)}
              className="flex flex-col items-center justify-center gap-[3px] flex-1 relative touch-manipulation transition-all duration-200"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: "32px",
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                    boxShadow: `0 0 8px ${GOLD}88`,
                  }}
                />
              )}

              <span
                className="transition-all duration-200"
                style={{
                  color: isActive ? GOLD : "rgba(255,255,255,0.28)",
                  filter: isActive ? `drop-shadow(0 0 6px ${GOLD}66)` : "none",
                  transform: isActive ? "scale(1.12)" : "scale(1)",
                }}
              >
                <Icon size={isActive ? 20 : 19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>

              <span
                className="text-[9.5px] font-semibold leading-none tracking-wide"
                style={{
                  color: isActive ? GOLD : "rgba(255,255,255,0.28)",
                  fontFamily: "'Sora','Inter',sans-serif",
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
