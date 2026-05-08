import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, Zap, Globe, ArrowRight, Users, Target,
  TrendingUp, Lock, Layers, CheckCircle, ExternalLink, ArrowLeft,
  Gift, Mic2, BadgePercent, Quote, Sparkles, Trophy,
  ChevronLeft, ChevronRight, Star, Crown, Calendar, Clock, Heart,
  GraduationCap, HandCoins, CheckCircle2, Megaphone, Pin,
} from "lucide-react";
import { useWelfareMetrics } from "@/hooks/useWelfareMetrics";
import { useSocialStats } from "@/hooks/useSocialStats";

/* ── Animation Variants ────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

/* ── Data Constants ────────────────────────────────────────────────── */
const SOCIALS = [
  {
    name: "Telegram",
    handle: "@orakzaibond",
    members: 12847,
    memberLabel: "Members",
    href: "https://t.me/orakzaibond",
    perks: ["Daily Market Analysis", "Instant Support", "Live Announcements"],
    desc: "The heartbeat of the OKBOND movement. Get real-time Lottery alerts, ICO news, and direct access to the team.",
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.4)",
    borderHex: "#38BDF828",
    bgGrad: "from-sky-500/10 to-sky-500/3",
    badgeCls: "bg-sky-500/15 border-sky-500/35 text-sky-300",
    btnCls: "bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_0px_rgba(56,189,248,0)] hover:shadow-[0_0_30px_rgba(56,189,248,0.55)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    handle: "@OrakzaiBond",
    members: 8230,
    memberLabel: "Followers",
    href: "https://x.com/OrakzaiBond",
    perks: ["Latest News", "Live Giveaways", "Market Updates"],
    desc: "Follow the conversation. Get instant updates, community polls, and breaking news about OKBOND and Polygon.",
    color: "#E5E7EB",
    glow: "rgba(229,231,235,0.25)",
    borderHex: "#ffffff1a",
    bgGrad: "from-white/6 to-white/2",
    badgeCls: "bg-white/10 border-white/20 text-foreground/80",
    btnCls: "bg-foreground hover:bg-foreground/80 text-background shadow-[0_0_0px_rgba(255,255,255,0)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Orakzai Bond",
    members: 29000,
    memberLabel: "Followers",
    href: "https://facebook.com/OrakzaiBond",
    perks: ["Community Discussions", "Exclusive Giveaways", "Photo Updates"],
    desc: "A welcoming space for deeper community discussions, milestone celebrations, and exclusive monthly airdrop events.",
    color: "#818CF8",
    glow: "rgba(129,140,248,0.4)",
    borderHex: "#818cf828",
    bgGrad: "from-indigo-500/10 to-indigo-500/3",
    badgeCls: "bg-indigo-500/15 border-indigo-500/35 text-indigo-300",
    btnCls: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_0px_rgba(99,102,241,0)] hover:shadow-[0_0_30px_rgba(99,102,241,0.55)]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const WELFARE = [
  { icon: GraduationCap, label: "Youth Empowered",         value: 3247,  suffix: "+", color: "text-primary",    glow: "rgba(234,179,8,0.4)",    bg: "bg-primary/10 border-primary/25" },
  { icon: Heart,          label: "Free Tech Education Hrs", value: 18500, suffix: "+", color: "text-rose-400",   glow: "rgba(251,113,133,0.35)",  bg: "bg-rose-500/10 border-rose-500/25" },
  { icon: HandCoins,      label: "Community Grants",        value: 142,   suffix: "",  color: "text-emerald-400",glow: "rgba(52,211,153,0.35)",   bg: "bg-emerald-500/10 border-emerald-500/25" },
];

const TIERS = [
  {
    name: "Bronze",
    icon: Shield,
    min: "0",
    max: "500 OKBOND",
    color: "#CD7F32",
    glow: "rgba(205,127,50,0.35)",
    border: "border-[#CD7F32]/30",
    bg: "bg-[#CD7F32]/8",
    ring: "shadow-[0_0_0px_rgba(205,127,50,0)]",
    ringHover: "0 0 28px rgba(205,127,50,0.5)",
    benefits: [
      { label: "Community Access",      available: true },
      { label: "Live Announcements",    available: true },
      { label: "Basic Referral (L1)",   available: true },
      { label: "Exclusive Airdrops",    available: false },
      { label: "Strategy Sessions",     available: false },
    ],
  },
  {
    name: "Silver",
    icon: Star,
    min: "501",
    max: "5,000 OKBOND",
    color: "#C0C0C0",
    glow: "rgba(192,192,192,0.35)",
    border: "border-[#C0C0C0]/35",
    bg: "bg-white/6",
    ring: "shadow-[0_0_12px_rgba(192,192,192,0.15)]",
    ringHover: "0 0 35px rgba(192,192,192,0.45)",
    popular: true,
    benefits: [
      { label: "All Bronze Benefits",   available: true },
      { label: "1.2× Lottery Odds",     available: true },
      { label: "Exclusive Airdrops",    available: true },
      { label: "3-Level Referrals",     available: true },
      { label: "Strategy Sessions",     available: false },
    ],
  },
  {
    name: "Gold / Elite",
    icon: Crown,
    min: "5,001+",
    max: "OKBOND",
    color: "#EAB308",
    glow: "rgba(234,179,8,0.5)",
    border: "border-primary/50",
    bg: "bg-primary/10",
    ring: "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
    ringHover: "0 0 50px rgba(234,179,8,0.65)",
    benefits: [
      { label: "All Silver Benefits",                 available: true },
      { label: "VIP Telegram Access",                 available: true },
      { label: "Priority Lottery Entry",             available: true },
      { label: "Exclusive Airdrops",                 available: true },
      { label: "Private Strategy Sessions w/ Faisal", available: true },
    ],
  },
];

const INCENTIVES = [
  {
    icon: BadgePercent,
    title: "Referral Rewards",
    value: "11.5%",
    desc: "Earn across 5 levels. L1: 5%, L2: 3%, L3: 2%, L4: 1%, L5: 0.5%.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/25",
    glow: "rgba(234,179,8,0.3)",
  },
  {
    icon: Mic2,
    title: "Weekly AMAs",
    value: "Live",
    desc: "Real-time voice chats with Faisal Orakzai and the leadership team every week.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/25",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    icon: Gift,
    title: "Exclusive Giveaways",
    value: "Monthly",
    desc: "OKBOND airdrops for active, engaged community members — zero entry cost.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    glow: "rgba(52,211,153,0.3)",
  },
];

const AMBASSADORS = [
  { rank: 1, name: "Ahmad K.",    region: "Karachi, PK",   referrals: 284, earnings: "4,260 OKBOND", medal: "🥇" },
  { rank: 2, name: "Sara M.",     region: "Dubai, UAE",    referrals: 211, earnings: "3,165 OKBOND", medal: "🥈" },
  { rank: 3, name: "Bilal T.",    region: "London, UK",    referrals: 178, earnings: "2,670 OKBOND", medal: "🥉" },
  { rank: 4, name: "Hira Z.",     region: "Toronto, CA",   referrals: 154, earnings: "2,310 OKBOND", medal: "⭐" },
  { rank: 5, name: "Usman R.",    region: "Riyadh, SA",    referrals: 139, earnings: "2,085 OKBOND", medal: "⭐" },
];

const LOCATIONS: [number, number, string, boolean][] = [
  [58.5, 41,   "Karachi — Global HQ", true],
  [47.5, 28,   "London",              false],
  [24,   33,   "New York",            false],
  [55.5, 40,   "Dubai",               false],
  [68,   54,   "Singapore",           false],
  [77,   32,   "Tokyo",               false],
  [79,   68,   "Sydney",              false],
  [48,   45,   "Frankfurt",           false],
  [34,   60,   "Toronto",             false],
  [50,   57,   "Moscow",              false],
  [62,   29,   "New Delhi",           false],
  [40,   55,   "Istanbul",            false],
];

const CONTINENTS = [
  "M 14 22 L 28 18 L 36 22 L 38 30 L 34 40 L 26 44 L 18 42 L 12 36 L 10 28 Z",
  "M 24 46 L 32 44 L 36 52 L 34 64 L 28 72 L 22 68 L 18 58 L 20 50 Z",
  "M 44 20 L 56 18 L 58 24 L 54 30 L 48 32 L 42 28 L 42 22 Z",
  "M 44 32 L 56 30 L 60 38 L 58 52 L 54 62 L 48 64 L 42 58 L 40 46 L 42 36 Z",
  "M 56 18 L 82 16 L 84 24 L 80 32 L 72 38 L 64 40 L 58 36 L 54 28 L 56 20 Z",
  "M 72 60 L 84 58 L 86 66 L 80 70 L 72 68 L 70 62 Z",
  "M 30 8 L 42 6 L 44 14 L 36 16 L 28 14 Z",
];

const values = [
  { icon: CheckCircle, label: "Transparency", desc: "All contracts are open-source and verified on PolygonScan." },
  { icon: Users,       label: "Community First", desc: "Token holders vote on major decisions via on-chain governance." },
  { icon: Target,      label: "Real Utility",    desc: "OKBOND is built for real-world utility within a global digital ecosystem — not just speculation." },
  { icon: Shield,      label: "Protection",      desc: "Capital protection is hardcoded into the Lottery smart contract." },
];

/* ── Helper Components ────────────────────────────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

function KarachiSkyline() {
  return (
    <svg viewBox="0 0 600 120" className="w-full h-20 opacity-[0.12]" fill="currentColor" preserveAspectRatio="xMidYMax meet">
      <rect x="0"   y="70"  width="30"  height="50" />
      <rect x="5"   y="50"  width="20"  height="20" />
      <rect x="35"  y="55"  width="25"  height="65" />
      <rect x="40"  y="35"  width="15"  height="20" />
      <rect x="43"  y="25"  width="9"   height="10" />
      <rect x="65"  y="65"  width="30"  height="55" />
      <rect x="100" y="60"  width="20"  height="60" />
      <rect x="104" y="42"  width="12"  height="18" />
      <rect x="125" y="20"  width="18"  height="100" />
      <rect x="129" y="10"  width="10"  height="10" />
      <rect x="132" y="4"   width="4"   height="6" />
      <rect x="148" y="55"  width="22"  height="65" />
      <rect x="152" y="38"  width="14"  height="17" />
      <rect x="175" y="65"  width="30"  height="55" />
      <rect x="180" y="48"  width="20"  height="17" />
      <rect x="185" y="35"  width="10"  height="13" />
      <rect x="210" y="15"  width="22"  height="105" />
      <rect x="213" y="8"   width="16"  height="7" />
      <rect x="217" y="2"   width="8"   height="6" />
      <rect x="235" y="50"  width="18"  height="70" />
      <rect x="238" y="35"  width="12"  height="15" />
      <rect x="258" y="60"  width="25"  height="60" />
      <rect x="263" y="42"  width="15"  height="18" />
      <rect x="288" y="70"  width="40"  height="50" />
      <ellipse cx="308" cy="70" rx="20" ry="14" />
      <rect x="306" y="42"  width="4"   height="28" />
      <rect x="300" y="56"  width="16"  height="3" />
      <rect x="340" y="60"  width="22"  height="60" />
      <rect x="344" y="42"  width="14"  height="18" />
      <rect x="367" y="50"  width="28"  height="70" />
      <rect x="372" y="32"  width="18"  height="18" />
      <rect x="376" y="20"  width="10"  height="12" />
      <rect x="400" y="22"  width="20"  height="98" />
      <rect x="403" y="12"  width="14"  height="10" />
      <rect x="407" y="5"   width="6"   height="7" />
      <rect x="425" y="58"  width="25"  height="62" />
      <rect x="430" y="40"  width="15"  height="18" />
      <rect x="455" y="65"  width="22"  height="55" />
      <rect x="460" y="50"  width="12"  height="15" />
      <rect x="482" y="55"  width="30"  height="65" />
      <rect x="487" y="38"  width="20"  height="17" />
      <rect x="492" y="28"  width="10"  height="10" />
      <rect x="517" y="70"  width="20"  height="50" />
      <rect x="542" y="62"  width="25"  height="58" />
      <rect x="547" y="45"  width="15"  height="17" />
      <rect x="572" y="68"  width="28"  height="52" />
    </svg>
  );
}

function SocialCard({ s, i }: { s: typeof SOCIALS[0]; i: number }) {
  const { count, ref } = useCounter(s.members, 1800);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.12 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ boxShadow: hovered ? `0 0 55px ${s.glow}, 0 0 20px ${s.glow.replace("0.4", "0.15").replace("0.25", "0.1")}` : "none" }}
      className="flex flex-col gap-5 p-7 rounded-3xl border relative overflow-hidden transition-all duration-300"
      style={{ borderColor: hovered ? s.color + "50" : s.borderHex, background: "linear-gradient(135deg,#0c0e24 0%,#080a1c 100%)" }}>
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        style={{ background: `radial-gradient(ellipse at top left, ${s.glow.replace("0.4","0.08").replace("0.25","0.05")}, transparent 70%)` }} />
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <motion.div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 ${s.badgeCls}`}
            animate={{ boxShadow: [`0 0 6px ${s.glow}`, `0 0 20px ${s.glow}`, `0 0 6px ${s.glow}`] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}>
            <span style={{ color: s.color }}>{s.icon}</span>
          </motion.div>
          <div>
            <p className="font-extrabold text-lg text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{s.handle}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground/40 mt-1 flex-shrink-0" />
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: s.color }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.3, repeat: Infinity }} />
        <span className="text-2xl font-extrabold font-mono" style={{ color: s.color }}>
          {count.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground/70 font-bold uppercase tracking-wider">{s.memberLabel}</span>
      </div>
      <p className="text-sm text-muted-foreground/80 leading-relaxed relative z-10">{s.desc}</p>
      <ul className="space-y-1.5 relative z-10">
        {s.perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-xs font-medium" style={{ color: s.color }}>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: s.color }} />
            {p}
          </li>
        ))}
      </ul>
      <a href={s.href} target="_blank" rel="noopener noreferrer"
        className={`relative z-10 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-extrabold text-sm transition-all duration-300 ${s.btnCls}`}>
        <Users className="w-4 h-4" />
        Join Now
      </a>
    </motion.div>
  );
}

function WelfareCell({ w, i }: { w: typeof WELFARE[0]; i: number }) {
  const { count, ref } = useCounter(w.value, 2200);
  return (
    <motion.div ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
      className={`flex flex-col items-center text-center p-5 rounded-2xl border ${w.bg}`}
      style={{ background: "rgba(8,10,28,0.85)" }}>
      <motion.div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 ${w.bg}`}
        animate={{ boxShadow: [`0 0 6px ${w.glow}`, `0 0 18px ${w.glow}`, `0 0 6px ${w.glow}`] }}
        transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.4 }}
        style={{ transform: "perspective(200px) rotateX(10deg) rotateY(-8deg)" }}>
        <w.icon className={`w-6 h-6 ${w.color}`} />
      </motion.div>
      <p className={`text-2xl font-extrabold font-mono ${w.color}`}>
        {count.toLocaleString()}{w.suffix}
      </p>
      <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mt-1 leading-tight">
        {w.label}
      </p>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function AboutPage() {
  const [slide, setSlide] = useState(0);
  const [adminEvents] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_events") || "[]"); } catch { return []; }
  });

  // ── Real-data overrides (graceful fallback to baked-in defaults) ────────
  const { metrics: welfareMetrics } = useWelfareMetrics();
  const { stats: socialStats }      = useSocialStats();

  // Map live welfare values onto the existing WELFARE array, preserving icons
  // / colours / glow that drive the visual layout.
  const welfareByLabel = new Map(welfareMetrics.map((m) => [m.label, m]));
  const liveWelfare = WELFARE.map((w) => {
    const m = welfareByLabel.get(w.label);
    return m ? { ...w, value: Number(m.value), suffix: m.suffix ?? w.suffix } : w;
  });

  // Override social member counts with live API numbers when available.
  const socialOverride: Record<string, number | null> = {
    "Telegram":    socialStats.telegram,
    "Twitter / X": socialStats.twitter,
    "Facebook":    socialStats.facebook,
  };
  const liveSocials = SOCIALS.map((s) => {
    const live = socialOverride[s.name];
    return typeof live === "number" ? { ...s, members: live } : s;
  });

  const staticEvents = [
    {
      type: "AMA",
      title: "Ask Me Anything — Faisal Orakzai",
      date: "May 3, 2026",
      time: "8:00 PM PKT",
      platform: "Telegram Live",
      icon: Mic2,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/25",
      glow: "rgba(139,92,246,0.3)",
      badge: "bg-violet-500/20 text-violet-300",
    },
    {
      type: "LOTTERY",
      title: "Mega Lottery Draw — Phase 1 Final",
      date: "June 9, 2026",
      time: "10:00 PM PKT",
      platform: "On-Chain Draw",
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/25",
      glow: "rgba(234,179,8,0.3)",
      badge: "bg-primary/20 text-primary",
    },
  ];

  const allEvents = [
    ...adminEvents.map((e) => ({
      ...e,
      icon: e.type === "AMA" ? Mic2 : e.type === "LOTTERY" ? Trophy : Calendar,
      bg: e.color === "gold" ? "bg-primary/10 border-primary/25" : "bg-violet-500/10 border-violet-500/25",
      glow: e.color === "gold" ? "rgba(234,179,8,0.3)" : "rgba(139,92,246,0.3)",
      badge: e.color === "gold" ? "bg-primary/20 text-primary" : "bg-violet-500/20 text-violet-300",
      color: e.color === "gold" ? "text-primary" : "text-violet-400",
    })),
    ...staticEvents,
  ];

  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
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

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(234,179,8,0.09),transparent_60%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
              About Orakzai Bond
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
                Orakzai Global
              </span>
              <br />Network
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Orakzai Bond is a decentralized financial platform engineered for staking, investment pools, and token
              utilities — empowering global investors with blockchain-based opportunities on Polygon PoS.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center">
              <Link href="/ico">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer">
                  Join ICO Now <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/founder">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                  Meet the Founder <ExternalLink className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── STATS ROW ────────────────────────────────────────────── */}
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "Powered by OKBOND",  label: "Infrastructure" },
              { value: "10M",    label: "Total Supply" },
              { value: "$0.15",  label: "ICO Phase 1 Price" },
              { value: "567%",   label: "Target ROI" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-primary/20 bg-card p-5 text-center">
                <p className="text-3xl font-extrabold text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── WORLD MAP ──────────────────────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative w-full rounded-3xl border border-primary/20 bg-black/60 backdrop-blur overflow-hidden p-4">
              <div className="absolute" style={{ left: "58.5%", top: "41%", transform: "translate(-50%,-50%)", width: 260, height: 260,
                background: "radial-gradient(circle, rgba(234,179,8,0.18) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(8px)", pointerEvents: "none" }} />
              <svg viewBox="0 0 100 80" className="w-full" style={{ maxHeight: 380 }}>
                {[20, 40, 60].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />)}
                {[25, 50, 75].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="rgba(234,179,8,0.06)" strokeWidth="0.3" />)}
                {CONTINENTS.map((d, i) => <path key={i} d={d} fill="rgba(234,179,8,0.07)" stroke="rgba(234,179,8,0.18)" strokeWidth="0.4" />)}
                {LOCATIONS.map(([cx, cy, label, isHQ], i) => (
                  <g key={label}>
                    {isHQ && (
                      <motion.circle cx={cx} cy={cy} r={4} fill="none" stroke="rgba(234,179,8,0.5)" strokeWidth="0.4"
                        style={{ originX: `${cx}px`, originY: `${cy}px` }}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                    )}
                    <motion.circle cx={cx} cy={cy} r={isHQ ? 1.4 : 0.85}
                      fill={isHQ ? "hsl(43,96%,56%)" : "rgba(234,179,8,0.7)"}
                      initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}
                      style={{ filter: isHQ ? "drop-shadow(0 0 2px rgba(234,179,8,0.9))" : "drop-shadow(0 0 1px rgba(234,179,8,0.5))" }} />
                  </g>
                ))}
              </svg>
            </motion.div>
          </div>
        </section>

        {/* ── MOVED: SOCIAL LINKS ────────────────────────────────────── */}
        <section className="px-4 pb-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {liveSocials.map((s, i) => <SocialCard key={s.name} s={s} i={i} />)}
            </div>
          </div>
        </section>

        {/* ── MOVED: WELFARE & TIERS ─────────────────────────────────── */}
        <section className="px-4 pb-10">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 mb-10">
            {/* WELFARE IMPACT DASHBOARD */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="rounded-3xl border border-primary/20 p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0a0c20 0%,#070918 100%)" }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(ellipse,rgba(234,179,8,0.09),transparent_70%)] pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Social Responsibility</p>
                  <h3 className="text-xl font-extrabold text-foreground">Welfare Impact</h3>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">United Welfare Platform · Orakzai Group</p>
                </div>
                <motion.div
                  animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.2)","0 0 24px rgba(234,179,8,0.5)","0 0 8px rgba(234,179,8,0.2)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl border-2 border-primary/40 overflow-hidden flex-shrink-0">
                  <img src="/son-of-orakzai-logo.jpg" alt="Son of Orakzai" className="w-full h-full object-cover" />
                </motion.div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
                {liveWelfare.map((w, i) => <WelfareCell key={w.label} w={w} i={i} />)}
              </div>
              <div className="relative z-10 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 flex items-center gap-3">
                <Heart className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  <span className="font-bold text-primary">5%</span> of every OKBOND transaction supports youth education and community welfare across Pakistan.
                </p>
              </div>
            </motion.div>

            {/* MEMBERSHIP TIERS */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="rounded-3xl border border-primary/20 p-7"
              style={{ background: "linear-gradient(135deg,#0a0c20 0%,#070918 100%)" }}>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Holder Privileges</p>
              <h3 className="text-xl font-extrabold text-foreground mb-5">Membership Tiers</h3>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map((tier, i) => (
                  <motion.div key={tier.name}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                    whileHover={{ y: -4 }}
                    className={`relative rounded-2xl border ${tier.border} ${tier.ring} p-4 flex flex-col gap-3 transition-all duration-300 cursor-default`}
                    style={{ background: "rgba(8,10,28,0.9)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = tier.ringHover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                        style={{ background: tier.color, color: "#000" }}>
                        Most Popular
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center ${tier.bg} ${tier.border}`}
                        style={{ transform: "perspective(300px) rotateX(15deg) rotateY(-10deg)", boxShadow: `0 6px 20px ${tier.glow}` }}>
                        <tier.icon className="w-6 h-6" style={{ color: tier.color }} />
                      </motion.div>
                      <p className="font-extrabold text-sm text-center leading-tight" style={{ color: tier.color }}>
                        {tier.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 font-mono text-center">
                        {tier.min} – {tier.max}
                      </p>
                    </div>
                    <ul className="space-y-1.5">
                      {tier.benefits.map((b) => (
                        <li key={b.label} className={`flex items-start gap-1.5 text-[10px] leading-tight ${b.available ? "text-foreground/80" : "text-muted-foreground/30"}`}>
                          {b.available
                            ? <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                            : <Lock className="w-3 h-3 flex-shrink-0 mt-0.5 text-muted-foreground/25" />}
                          {b.label}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-5 font-mono">
                Hold more OKBOND to unlock higher tiers automatically
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── MOVED: FOUNDER'S CORNER & INCENTIVES ───────────────────── */}
        <section className="px-4 pb-10">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6 mb-10">
            {/* Founder's Corner (3/5) */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65 }}
              className="lg:col-span-3 rounded-3xl border border-primary/20 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg,#0e1025 0%,#090b1c 70%,#07090f 100%)" }}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse,rgba(234,179,8,0.09),transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 text-primary overflow-hidden">
                <KarachiSkyline />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#07090f] to-transparent pointer-events-none" />
              <div className="relative z-10 p-7">
                <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                  {/* Chairman Portrait — high-resolution Visual Authority frame */}
                  <motion.div
                    animate={{ boxShadow: ["0 0 18px rgba(234,179,8,0.3)", "0 0 42px rgba(234,179,8,0.55)", "0 0 18px rgba(234,179,8,0.3)"] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="w-40 h-52 md:w-44 md:h-56 rounded-2xl border-2 border-primary/60 flex-shrink-0 relative overflow-hidden"
                    style={{
                      transform: "perspective(500px) rotateX(6deg) rotateY(-5deg)",
                      background: "linear-gradient(135deg, #0a0a0a 0%, #050505 100%)",
                    }}>
                    <img
                      src="/chairman-portrait.jpg"
                      alt="Faisal Orakzai — Chairman, Orakzai Group"
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                      decoding="async"
                      style={{ display: "block" }}
                    />
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(135deg,transparent 30%,rgba(252,246,186,0.18) 50%,transparent 70%)" }}
                      animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">The Founder's Corner</p>
                    <h3 className="text-xl font-extrabold text-foreground">Faisal Orakzai</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a href="https://www.crunchbase.com/organization/orakzai-bond" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all">
                        Official Crunchbase Profile
                      </a>
                    </div>
                  </div>
                </div>
                <div className="relative mb-6">
                  <Quote className="absolute -top-4 -left-2 w-8 h-8 text-primary/10" />
                  <blockquote className="text-sm text-muted-foreground/90 leading-relaxed italic pl-6 border-l border-primary/20">
                    "Orakzai Bond is more than just a token; it's a commitment to our community. 
                    We are building a legacy of trust and shared prosperity, starting right here in Pakistan 
                    and reaching out to the global stage."
                  </blockquote>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mb-5" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold mb-2">Digital Signature</p>
                    <svg viewBox="0 0 200 50" className="w-40 h-10" fill="none">
                      <motion.path
                        d="M10 35 Q30 10 50 30 Q70 50 90 25 Q110 5 130 28 Q150 48 170 22 Q185 10 195 20"
                        stroke="#EAB308" strokeWidth="2" strokeLinecap="round" fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                        style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.7))" }} />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-primary font-mono">Faisal Orakzai</p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono">Orakzai Group · 2026</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Incentives (2/5) */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65 }}
              className="lg:col-span-2 flex flex-col gap-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 px-1">Community Incentives</p>
              {INCENTIVES.map((inc, i) => (
                <motion.div key={inc.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`flex gap-4 items-start p-5 rounded-2xl border ${inc.bg} transition-all duration-300 cursor-default`}
                  style={{ background: "linear-gradient(135deg,#0c0e24 0%,#080a1c 100%)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${inc.glow}`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${inc.bg}`}
                    style={{ transform: "perspective(250px) rotateX(12deg) rotateY(-8deg)" }}>
                    <inc.icon className={`w-5 h-5 ${inc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-foreground text-sm">{inc.title}</p>
                      <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md border ${inc.bg} ${inc.color}`}>{inc.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{inc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── MOVED: HALL OF FAME & WHAT'S NEXT ──────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6 mb-10">
            {/* ELITE LEADERBOARD SLIDER (3/5) */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65 }}
              className="lg:col-span-3 rounded-3xl border border-primary/20 p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0a0c20 0%,#070918 100%)" }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(234,179,8,0.05),transparent)] pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Hall of Fame</p>
                  <h3 className="text-xl font-extrabold text-foreground">
                    <Crown className="w-5 h-5 text-primary inline mr-2 -mt-1" />
                    Elite Leaderboard
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSlide((s) => (s - 1 + AMBASSADORS.length) % AMBASSADORS.length)}
                    className="w-8 h-8 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSlide((s) => (s + 1) % AMBASSADORS.length)}
                    className="w-8 h-8 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative z-10 overflow-hidden rounded-2xl border border-primary/15 mb-5"
                style={{ background: "rgba(6,8,22,0.9)" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={slide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35 }}
                    className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl border-2 border-primary/40 bg-primary/10 flex flex-col items-center justify-center flex-shrink-0"
                        style={{ boxShadow: "0 0 20px rgba(234,179,8,0.3)", transform: "perspective(300px) rotateX(12deg) rotateY(-8deg)" }}>
                        <span className="text-2xl leading-none">{AMBASSADORS[slide].medal}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-extrabold text-foreground text-lg">{AMBASSADORS[slide].name}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                            Rank #{AMBASSADORS[slide].rank}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 font-mono">{AMBASSADORS[slide].region}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-center">
                        <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">Referrals</p>
                        <p className="text-xl font-extrabold text-primary font-mono">{AMBASSADORS[slide].referrals}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-center">
                        <p className="text-[10px] text-emerald-400/70 uppercase font-bold tracking-wider mb-1">Earnings</p>
                        <p className="text-sm font-extrabold text-emerald-400 font-mono">{AMBASSADORS[slide].earnings}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-2 mb-5">
                {AMBASSADORS.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === slide ? "20px" : "8px", height: "8px",
                      background: i === slide ? "#EAB308" : "rgba(234,179,8,0.2)",
                      boxShadow: i === slide ? "0 0 8px rgba(234,179,8,0.6)" : "none",
                    }} />
                ))}
              </div>
              <a href="#ico"
                className="relative z-10 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-extrabold text-sm bg-primary hover:bg-primary/90 text-black transition-all duration-300 hover:shadow-[0_0_35px_rgba(234,179,8,0.5)]">
                <Zap className="w-4 h-4" />
                Become a Leader — Join Referral Program
              </a>
            </motion.div>

            {/* LIVE EVENTS CALENDAR (2/5) */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.1 }}
              className="lg:col-span-2 flex flex-col gap-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 px-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                What's Next?
              </p>
              {allEvents.map((ev, i) => (
                <motion.div key={ev.title}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                  className={`rounded-2xl border ${ev.bg} p-5 relative overflow-hidden flex-1`}
                  style={{ background: "rgba(8,10,28,0.9)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${ev.glow}`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                  <motion.div className="absolute top-4 right-4 w-2 h-2 rounded-full"
                    style={{ background: ev.icon === Trophy ? "#EAB308" : "#A78BFA" }}
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }} />
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md ${ev.badge} mb-3`}>
                    {ev.type}
                  </span>
                  <h4 className="font-extrabold text-foreground text-sm leading-tight mb-3">{ev.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      <span className={`font-bold ${ev.color}`}>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-muted-foreground/70">{ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                        <ev.icon className={`w-3 h-3 ${ev.color}`} />
                      </span>
                      <span className="text-muted-foreground/70">{ev.platform}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <a href="https://t.me/orakzaibond" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-primary/25 bg-primary/8 text-primary text-xs font-bold hover:bg-primary/15 hover:border-primary/40 transition-all">
                <Calendar className="w-3.5 h-3.5" />
                Get Notified on Telegram
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── ORIGINAL: FOUNDER & MISSION ────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-primary/20 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold text-foreground">The Founder</h3>
              </div>
              <p className="text-primary font-semibold mb-3 text-sm uppercase tracking-wide">
                Faisal Orakzai
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                A Global Visionary and Architect of the Orakzai Group — Faisal Orakzai has built a multi-industry conglomerate from the ground up in Karachi, Pakistan, expanding its reach to international blockchain innovation.
              </p>
              <Link href="/founder">
                <span className="inline-flex items-center gap-2 mt-5 text-sm text-primary font-semibold hover:underline cursor-pointer">
                  Read Full Story →
                </span>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7 }} className="p-8 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To become a leading Web3 financial ecosystem — where OKBOND is the currency of real value, and every holder is an active participant in a future built on trust, transparency, and open code.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── ORIGINAL: VALUES ────────────────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="p-6 rounded-2xl border border-border bg-card/50 hover:border-primary/30 transition-all">
                  <v.icon className="w-8 h-8 text-primary mb-4" />
                  <h4 className="text-lg font-bold mb-2">{v.label}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
