import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Users, ExternalLink, Gift, Mic2, BadgePercent,
  Quote, Sparkles, TrendingUp, Shield, Trophy,
  ChevronLeft, ChevronRight, Star, Crown, Lock,
  Calendar, Clock, Heart, GraduationCap, HandCoins,
  CheckCircle2, Zap, Megaphone, X as CloseX, Pin,
} from "lucide-react";
import LiveParticipationFeed from "@/components/LiveParticipationFeed";
import ThinkTank from "@/components/ThinkTank";

/* ── Animated counter hook ─────────────────────────────────────────── */
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

/* ── Social platform data ──────────────────────────────────────────── */
const SOCIALS = [
  {
    name: "Telegram",
    handle: "@orakzaibond",
    members: 12847,
    memberLabel: "Members",
    href: "https://t.me/orakzaibond",
    perks: ["Daily Market Analysis", "Instant Support", "Live Announcements"],
    desc: "The heartbeat of the OKBOND movement. Get real-time lottery alerts, ICO news, and direct access to the team.",
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

/* ── Welfare stats ──────────────────────────────────────────────────── */
const WELFARE = [
  { icon: GraduationCap, label: "Youth Empowered",         value: 3247,  suffix: "+", color: "text-primary",    glow: "rgba(234,179,8,0.4)",    bg: "bg-primary/10 border-primary/25" },
  { icon: Heart,          label: "Free Tech Education Hrs", value: 18500, suffix: "+", color: "text-rose-400",   glow: "rgba(251,113,133,0.35)",  bg: "bg-rose-500/10 border-rose-500/25" },
  { icon: HandCoins,      label: "Community Grants",        value: 142,   suffix: "",  color: "text-emerald-400",glow: "rgba(52,211,153,0.35)",   bg: "bg-emerald-500/10 border-emerald-500/25" },
];

/* ── Elite Ambassadors ─────────────────────────────────────────────── */
const AMBASSADORS = [
  { rank: 1, name: "Ahmad K.",    region: "Karachi, PK",   referrals: 284, earnings: "4,260 OKBOND", medal: "🥇" },
  { rank: 2, name: "Sara M.",     region: "Dubai, UAE",    referrals: 211, earnings: "3,165 OKBOND", medal: "🥈" },
  { rank: 3, name: "Bilal T.",    region: "London, UK",    referrals: 178, earnings: "2,670 OKBOND", medal: "🥉" },
  { rank: 4, name: "Hira Z.",     region: "Toronto, CA",   referrals: 154, earnings: "2,310 OKBOND", medal: "⭐" },
  { rank: 5, name: "Usman R.",    region: "Riyadh, SA",    referrals: 139, earnings: "2,085 OKBOND", medal: "⭐" },
];

/* ── Membership tiers ──────────────────────────────────────────────── */
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

/* ── Upcoming Events ───────────────────────────────────────────────── */
const EVENTS = [
  {
    type: "AMA",
    title: "Ask Me Anything — Faisal Orakzai",
    date: "May 3, 2025",
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
    date: "June 9, 2025",
    time: "10:00 PM PKT",
    platform: "On-Chain Draw",
    icon: Trophy,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/25",
    glow: "rgba(234,179,8,0.3)",
    badge: "bg-primary/20 text-primary",
  },
];

/* ── Incentives data ────────────────────────────────────────────────── */
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

/* ── Karachi skyline SVG ────────────────────────────────────────────── */
function KarachiSkyline() {
  return (
    <svg viewBox="0 0 600 120" className="w-full h-20 opacity-[0.12]" fill="currentColor" preserveAspectRatio="xMidYMax meet">
      {/* buildings silhouette — Clifton/Shahrah-e-Faisal inspired */}
      <rect x="0"   y="70"  width="30"  height="50" />
      <rect x="5"   y="50"  width="20"  height="20" />
      <rect x="35"  y="55"  width="25"  height="65" />
      <rect x="40"  y="35"  width="15"  height="20" />
      <rect x="43"  y="25"  width="9"   height="10" />
      <rect x="65"  y="65"  width="30"  height="55" />
      <rect x="70"  y="40"  width="20"  height="25" />
      <rect x="75"  y="28"  width="10"  height="12" />
      <rect x="100" y="60"  width="20"  height="60" />
      <rect x="104" y="42"  width="12"  height="18" />
      {/* Tower — Clifton */}
      <rect x="125" y="20"  width="18"  height="100" />
      <rect x="129" y="10"  width="10"  height="10" />
      <rect x="132" y="4"   width="4"   height="6" />
      <rect x="148" y="55"  width="22"  height="65" />
      <rect x="152" y="38"  width="14"  height="17" />
      <rect x="175" y="65"  width="30"  height="55" />
      <rect x="180" y="48"  width="20"  height="17" />
      <rect x="185" y="35"  width="10"  height="13" />
      {/* Tall office tower */}
      <rect x="210" y="15"  width="22"  height="105" />
      <rect x="213" y="8"   width="16"  height="7" />
      <rect x="217" y="2"   width="8"   height="6" />
      <rect x="235" y="50"  width="18"  height="70" />
      <rect x="238" y="35"  width="12"  height="15" />
      <rect x="258" y="60"  width="25"  height="60" />
      <rect x="263" y="42"  width="15"  height="18" />
      {/* Crescent-like dome — mosque */}
      <rect x="288" y="70"  width="40"  height="50" />
      <ellipse cx="308" cy="70" rx="20" ry="14" />
      <rect x="306" y="42"  width="4"   height="28" />
      <rect x="300" y="56"  width="16"  height="3" />
      <rect x="340" y="60"  width="22"  height="60" />
      <rect x="344" y="42"  width="14"  height="18" />
      <rect x="367" y="50"  width="28"  height="70" />
      <rect x="372" y="32"  width="18"  height="18" />
      <rect x="376" y="20"  width="10"  height="12" />
      {/* Another tower */}
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

/* ── Social Card ────────────────────────────────────────────────────── */
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

/* ── Welfare counter cell ──────────────────────────────────────────── */
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

// ── Admin data types (mirrors SecretAdminPage) ──────────────────────
interface AdminPost {
  id: string; title: string; body: string;
  color: "gold" | "green" | "blue" | "red" | "purple";
  pinned: boolean; ts: number;
}
interface AdminEvent {
  id: string; type: string; title: string;
  date: string; time: string; platform: string;
  color: "gold" | "violet" | "blue" | "green";
}

const POST_COLORS: Record<AdminPost["color"], { bg: string; border: string; text: string; icon: string }> = {
  gold:   { bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.25)",   text: "#EAB308",  icon: "text-yellow-400"  },
  green:  { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   text: "#22c55e",  icon: "text-emerald-400" },
  blue:   { bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)",  text: "#60a5fa",  icon: "text-blue-400"    },
  red:    { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   text: "#f87171",  icon: "text-red-400"     },
  purple: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", text: "#a78bfa",  icon: "text-purple-400"  },
};

/* ── Main Component ─────────────────────────────────────────────────── */
export default function Community() {
  const [slide, setSlide] = useState(0);

  // Admin data from localStorage
  const [pinnedNotice]    = useState<string>(() => localStorage.getItem("okbond_pinned_notice") || "");
  const [pinnedActive]    = useState<boolean>(() => localStorage.getItem("okbond_pinned_active") === "1");
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [adminPosts]      = useState<AdminPost[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_posts") || "[]"); } catch { return []; }
  });
  const [adminEvents]     = useState<AdminEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem("okbond_admin_events") || "[]"); } catch { return []; }
  });

  const showNotice = pinnedActive && pinnedNotice && !noticeDismissed;

  // Merge admin events (shown first) with static events
  const allEvents = [
    ...adminEvents.map((e) => ({
      type: e.type, title: e.title, date: e.date, time: e.time, platform: e.platform,
      icon: e.type === "LOTTERY" ? Trophy : Mic2,
      color: "text-primary", bg: "bg-primary/10 border-primary/25",
      glow: "rgba(234,179,8,0.3)", badge: "bg-primary/20 text-primary",
    })),
    ...EVENTS,
  ];

  /* Auto-advance leaderboard */
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % AMBASSADORS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="community" className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#060818 0%,#04050f 50%,#060818 100%)" }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_35%_at_50%_0%,rgba(234,179,8,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_25%_at_50%_100%,rgba(56,189,248,0.04),transparent)] pointer-events-none" />

      {/* ── Pinned Admin Notice Banner ── */}
      <AnimatePresence>
        {showNotice && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="relative z-20 mx-4 mb-6 rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.3)", boxShadow: "0 0 30px rgba(234,179,8,0.08)" }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Megaphone className="w-4 h-4 flex-shrink-0 text-yellow-400" />
            </motion.div>
            <p className="text-sm font-semibold text-yellow-200 flex-1">{pinnedNotice}</p>
            <button onClick={() => setNoticeDismissed(true)} className="opacity-40 hover:opacity-80 transition-opacity flex-shrink-0">
              <CloseX className="w-4 h-4 text-yellow-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 max-w-6xl relative">

        {/* ── Hero Header ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <motion.span
            className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest"
            animate={{ boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 20px rgba(234,179,8,0.3)", "0 0 0px rgba(234,179,8,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <Users className="w-3.5 h-3.5" />
            Orakzai Global Network
          </motion.span>
          <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter mb-6 leading-[0.9]">
            The World's Most <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              Powerful Community
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Join 31,000+ verified members building the future of decentralized finance. 
            Empowering investors through transparency, collective strength, and shared success.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
             <div className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
               Trust Score: 93.93 | Top Ranking Company in Pakistan
             </div>
          </div>
        </motion.div>

        {/* ── Admin Announcements ── */}
        {adminPosts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60">
                Official Announcements
              </p>
            </div>
            <div className="space-y-3">
              {[...adminPosts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts).map((post) => {
                const c = POST_COLORS[post.color];
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                    className="rounded-2xl px-5 py-4 relative overflow-hidden"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <div className="absolute top-0 left-0 w-0.5 h-full" style={{ background: c.text }} />
                    <div className="flex items-start gap-3 pl-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {post.pinned && (
                          <Pin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.text }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white mb-1">{post.title}</p>
                          <p className="text-xs text-foreground/70 leading-relaxed">{post.body}</p>
                          <p className="text-[10px] font-mono mt-1.5" style={{ color: c.text + "80" }}>
                            {new Date(post.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · Orakzai Admin
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── 3 Social Media Cards ─────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {SOCIALS.map((s, i) => <SocialCard key={s.name} s={s} i={i} />)}
        </div>

        {/* ── Welfare Impact Dashboard + Membership Tiers ───────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">

          {/* WELFARE IMPACT DASHBOARD */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl border border-primary/20 p-7 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0a0c20 0%,#070918 100%)" }}>

            {/* Glow top-right */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(ellipse,rgba(234,179,8,0.09),transparent_70%)] pointer-events-none" />

            {/* Header with logo placeholder */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Social Responsibility</p>
                <h3 className="text-xl font-extrabold text-foreground">Welfare Impact</h3>
                <p className="text-xs text-muted-foreground/60 mt-0.5">United Welfare Platform · Orakzai Group</p>
              </div>
              {/* Son of Orakzai logo */}
              <motion.div
                animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.2)","0 0 24px rgba(234,179,8,0.5)","0 0 8px rgba(234,179,8,0.2)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl border-2 border-primary/40 overflow-hidden flex-shrink-0">
                <img src="/son-of-orakzai-logo.jpg" alt="Son of Orakzai" className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* Live counters grid */}
            <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
              {WELFARE.map((w, i) => <WelfareCell key={w.label} w={w} i={i} />)}
            </div>

            {/* Mission note */}
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

                  {/* Popular badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                      style={{ background: tier.color, color: "#000" }}>
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
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

                  {/* Benefits */}
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

            {/* Upgrade note */}
            <p className="text-center text-[10px] text-muted-foreground/50 mt-5 font-mono">
              Hold more OKBOND to unlock higher tiers automatically
            </p>
          </motion.div>
        </div>

        {/* ── Founder's Corner + Community Incentives ──────────── */}
        <div className="grid lg:grid-cols-5 gap-6 mb-10">

          {/* Founder's Corner (3/5) — with Karachi skyline */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="lg:col-span-3 rounded-3xl border border-primary/20 relative overflow-hidden"
            style={{ background: "linear-gradient(160deg,#0e1025 0%,#090b1c 70%,#07090f 100%)" }}>

            {/* Gold corner accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse,rgba(234,179,8,0.09),transparent_70%)] pointer-events-none" />

            {/* Karachi Skyline at bottom */}
            <div className="absolute bottom-0 left-0 right-0 text-primary overflow-hidden">
              <KarachiSkyline />
            </div>
            {/* Bottom gradient fade over skyline */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#07090f] to-transparent pointer-events-none" />

            <div className="relative z-10 p-7">
              <div className="flex gap-5 items-start mb-6">
                <motion.div
                  animate={{ boxShadow: ["0 0 12px rgba(234,179,8,0.25)", "0 0 30px rgba(234,179,8,0.5)", "0 0 12px rgba(234,179,8,0.25)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl border-2 border-primary/50 flex-shrink-0 relative overflow-hidden"
                  style={{ transform: "perspective(400px) rotateX(8deg) rotateY(-6deg)" }}>
                  <img src="/faisal-orakzai.jpg" alt="Faisal Orakzai" className="w-full h-full object-cover object-top" />
                  <motion.div className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg,transparent 30%,rgba(234,179,8,0.12) 50%,transparent 70%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                </motion.div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">The Founder's Corner</p>
                  <h3 className="text-xl font-extrabold text-foreground">Faisal Orakzai</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a href="https://www.crunchbase.com/organization/orakzai-bond" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all">
                      <ExternalLink className="w-3 h-3" />
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
                  and reaching out to the global stage. Our 5-level referral system ensures that every 
                  member who helps us grow is rewarded fairly for their contribution."
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
                    <motion.path
                      d="M15 38 Q50 42 90 38 Q130 34 160 40"
                      stroke="#EAB308" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: "easeInOut", delay: 2.2 }} />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-primary font-mono">Faisal Orakzai</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono">Orakzai Group · 2024</p>
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
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-auto p-4 rounded-2xl border border-primary/20 bg-primary/5 text-center">
              <p className="text-[10px] text-primary/60 uppercase tracking-widest font-bold mb-1">Total Community</p>
              <p className="text-3xl font-extrabold text-primary font-mono">31,000+</p>
              <p className="text-[10px] text-muted-foreground/50 font-mono">across all platforms</p>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Elite Leaderboard + Live Events ──────────────────── */}
        <div className="grid lg:grid-cols-5 gap-6 mb-10">

          {/* ELITE LEADERBOARD SLIDER (3/5) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="lg:col-span-3 rounded-3xl border border-primary/20 p-7 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0a0c20 0%,#070918 100%)" }}>

            {/* Gold shimmer bg */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(234,179,8,0.05),transparent)] pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Hall of Fame</p>
                <h3 className="text-xl font-extrabold text-foreground">
                  <Crown className="w-5 h-5 text-primary inline mr-2 -mt-1" />
                  Elite Leaderboard
                </h3>
              </div>
              {/* Prev / Next */}
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

            {/* Ambassador card */}
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
                    {/* Medal */}
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

            {/* Dots */}
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

            {/* Become a Leader */}
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
              <motion.div key={ev.type}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`rounded-2xl border ${ev.bg} p-5 relative overflow-hidden flex-1`}
                style={{ background: "rgba(8,10,28,0.9)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${ev.glow}`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>

                {/* Pulse indicator */}
                <motion.div className="absolute top-4 right-4 w-2 h-2 rounded-full"
                  style={{ background: ev.icon === Trophy ? "#EAB308" : "#A78BFA" }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }} />

                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md ${ev.badge} mb-3`}>
                  <ev.icon className="w-3 h-3" />
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

                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 flex items-center gap-1">
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      ●
                    </motion.span>
                    Reminder set for all members
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Add to calendar */}
            <a href="https://t.me/orakzaibond" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-primary/25 bg-primary/8 text-primary text-xs font-bold hover:bg-primary/15 hover:border-primary/40 transition-all">
              <Calendar className="w-3.5 h-3.5" />
              Get Notified on Telegram
            </a>
          </motion.div>
        </div>

        {/* ── Orakzai Think Tank ───────────────────────────────── */}
        <ThinkTank />

        {/* ── Live Telegram Feed ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }} className="mt-10">
          <div className="text-center mb-5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-1">Live Activity</p>
            <h3 className="text-xl font-extrabold text-foreground">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Live Feed</span>
            </h3>
          </div>
          <LiveParticipationFeed />
        </motion.div>

        {/* ── Bottom strip ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl border border-primary/12 px-6 py-5 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">Stay Connected — Official Channels Only</p>
            <p className="text-xs text-muted-foreground/60">Always verify URLs before connecting. We never DM first or ask for funds.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 hover:scale-105"
                style={{ borderColor: s.borderHex, color: s.color, background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 18px ${s.glow}`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <span className="w-4 h-4 inline-flex items-center justify-center">{s.icon}</span>
                {s.name}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
