/**
 * TrustStrip — a compact, sticky trust-signal bar shown across all pages.
 * Shows live/verified status of key transparency pillars:
 *   • Smart contract security reviewed
 *   • On-chain (Polygon Mainnet)
 *   • Real-world asset backed
 *   • Verified contracts on PolygonScan
 *   • 100-year vision
 */
import { motion } from "framer-motion";
import { Shield, Zap, Building2, FileCheck, Globe } from "lucide-react";

const BADGES = [
  {
    icon: Shield,
    label: "Contract Security Reviewed",
    color: "#22c55e",
    dot: "#22c55e",
    href: "https://drive.google.com/file/d/1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj/view?usp=drivesdk",
  },
  {
    icon: Zap,
    label: "Polygon Mainnet · Live",
    color: "#8247E5",
    dot: "#22c55e",
    href: "https://polygonscan.com/token/0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F",
  },
  {
    icon: Building2,
    label: "Real-World Asset Backed",
    color: "#D4AF37",
    dot: "#D4AF37",
    href: "/legal",
  },
  {
    icon: FileCheck,
    label: "Verified · Polygon Mainnet",
    color: "#60A5FA",
    dot: "#22c55e",
    href: "https://polygonscan.com/token/0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F",
  },
  {
    icon: Globe,
    label: "Vision 2100 · 12 Companies",
    color: "#a78bfa",
    dot: "#a78bfa",
    href: "/about",
  },
];

// Duplicate so the marquee loop is seamless
const ALL = [...BADGES, ...BADGES];

export default function TrustStrip() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(8,6,3,0.95), rgba(5,4,2,0.95))",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        className="flex items-center gap-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {ALL.map((badge, i) => {
          const Icon = badge.icon;
          const isExternal = badge.href.startsWith("http");
          const Tag = isExternal ? "a" : "a";
          return (
            <Tag
              key={i}
              href={badge.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 px-5 py-2 shrink-0 select-none group cursor-pointer"
            >
              {/* Separator dot */}
              <span className="w-1 h-1 rounded-full opacity-30 mr-3 shrink-0" style={{ background: "#D4AF37" }} />

              {/* Pulse dot */}
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: badge.dot }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: badge.dot }}
                />
              </span>

              <Icon
                className="w-3 h-3 shrink-0 transition-opacity group-hover:opacity-100 opacity-80"
                style={{ color: badge.color }}
              />
              <span
                className="text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap transition-colors group-hover:opacity-100 opacity-70"
                style={{ color: badge.color }}
              >
                {badge.label}
              </span>
            </Tag>
          );
        })}
      </motion.div>
    </div>
  );
}
