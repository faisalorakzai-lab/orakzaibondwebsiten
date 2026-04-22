import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Landmark, Cpu, Building2, ShoppingCart, TrendingUp,
  Database, Zap, Truck, Shirt, Megaphone, Coffee,
  FlaskConical, Globe, Heart, Users, Star, ArrowLeft,
  ChevronRight, Target, Lightbulb, ChevronDown, CheckCircle2,
  BarChart3, Layers, Rocket,
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Company data — rich detail ────────────────────────────────────────────────
const COMPANIES = [
  {
    num: "01",
    name: "Orakzai Finance",
    tagline: "The Financial Backbone of the Group",
    icon: <Landmark className="w-7 h-7" />,
    sector: "Finance & Banking",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Orakzai Finance is the central financial arm of the group, managing investment portfolios, funding pipelines, and global banking integrations. It operates as the treasury and capital allocation engine for all 12 companies within the ecosystem.",
    services: [
      "Investment portfolio management",
      "Cross-border capital deployment",
      "Global banking integrations",
      "Internal group treasury & fund allocation",
    ],
    highlight: "Managing the flow of capital across 12 mother companies",
  },
  {
    num: "02",
    name: "Orakzai Blockchain",
    tagline: "Decentralized Power at Scale",
    icon: <Cpu className="w-7 h-7" />,
    sector: "Blockchain & Crypto",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "The blockchain division builds and manages crypto infrastructure including OKBOND, DeFi protocols, smart contract ecosystems, and Web3 platforms. This is the technology spine of the entire Orakzai digital economy.",
    services: [
      "OKBOND token — Polygon PoS smart contracts",
      "DeFi protocol design & auditing",
      "Smart contract development & deployment",
      "Web3 platform integration & wallet systems",
    ],
    highlight: "Home of OKBOND — the sovereign currency of the Orakzai ecosystem",
  },
  {
    num: "03",
    name: "Orakzai Properties",
    tagline: "Real Assets. Real Returns.",
    icon: <Building2 className="w-7 h-7" />,
    sector: "Real Estate",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Orakzai Properties manages real estate acquisition, development, and investment across Pakistan and international markets. It bridges physical property with digital investment through tokenized real estate products.",
    services: [
      "Residential & commercial property acquisition",
      "Real estate investment platform",
      "Property tokenization (blockchain-backed)",
      "International real estate portfolio management",
    ],
    highlight: "Bridging physical real estate with blockchain investment",
  },
  {
    num: "04",
    name: "Orakzai Mart",
    tagline: "The Orakzai Marketplace",
    icon: <ShoppingCart className="w-7 h-7" />,
    sector: "E-Commerce",
    status: "Developing",
    statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    desc: "Orakzai Mart is a multi-category e-commerce platform serving local and international markets. It covers electronics, fashion, household goods, groceries, and group-manufactured products — creating a full retail ecosystem.",
    services: [
      "Multi-category retail marketplace",
      "Integration with Orakzai Textile & Chai products",
      "Local vendor onboarding & support",
      "International shipping & logistics partnership",
    ],
    highlight: "Full-stack marketplace powered by the Orakzai ecosystem",
  },
  {
    num: "05",
    name: "Orakzai Fx Empire",
    tagline: "Master the Global Currency Markets",
    icon: <TrendingUp className="w-7 h-7" />,
    sector: "Forex & Trading",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Orakzai Fx Empire operates forex trading systems, a professional trading community, and capital management services. It trains retail traders and manages institutional-scale capital in global currency markets.",
    services: [
      "Forex signal services & trading systems",
      "Capital management for institutional clients",
      "Trader education & community programs",
      "Proprietary trading desk operations",
    ],
    highlight: "Empowering traders across Asia, Middle East & beyond",
  },
  {
    num: "06",
    name: "Orakzai Base",
    tagline: "The Crypto Innovation Engine",
    icon: <Database className="w-7 h-7" />,
    sector: "Blockchain + AI",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Orakzai Base is the core R&D and innovation hub where blockchain meets artificial intelligence. It incubates new crypto projects, develops AI-integrated DeFi tools, and serves as the think-tank for group-wide technology strategy.",
    services: [
      "Blockchain + AI product research & development",
      "Crypto project incubation & launchpad",
      "AI-driven DeFi tools & analytics",
      "Group-wide technology strategy & advisory",
    ],
    highlight: "Where the next generation of blockchain-AI products are born",
  },
  {
    num: "07",
    name: "Orakzai Energy",
    tagline: "Powering the Future",
    icon: <Zap className="w-7 h-7" />,
    sector: "Energy & Sustainability",
    status: "Developing",
    statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    desc: "Orakzai Energy is building a portfolio of energy sector projects with a focus on renewable energy, sustainable infrastructure, and industrial power systems. It aims to deliver affordable, clean energy solutions at scale.",
    services: [
      "Solar & renewable energy project development",
      "Industrial power infrastructure investment",
      "Energy trading & distribution partnerships",
      "Sustainability reporting for group companies",
    ],
    highlight: "Investing in clean, sustainable power for the next century",
  },
  {
    num: "08",
    name: "Orakzai Logistics",
    tagline: "Moving the World Forward",
    icon: <Truck className="w-7 h-7" />,
    sector: "Logistics & Supply Chain",
    status: "Developing",
    statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    desc: "Orakzai Logistics builds last-mile delivery networks, supply chain solutions, and operational infrastructure to support both group companies and third-party clients. It serves as the distribution backbone of the conglomerate.",
    services: [
      "Last-mile delivery network across Pakistan",
      "Supply chain design & optimisation",
      "Warehouse management & fulfilment centres",
      "Cross-border freight & customs management",
    ],
    highlight: "The operational spine connecting all group companies",
  },
  {
    num: "09",
    name: "Orakzai Textile",
    tagline: "Premium Fabric. Global Ambition.",
    icon: <Shirt className="w-7 h-7" />,
    sector: "Manufacturing & Exports",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Orakzai Textile operates manufacturing facilities for garment production, fabric exports, and branded apparel. Leveraging Pakistan's strong textile heritage, it targets both domestic and international retail markets.",
    services: [
      "Garment manufacturing & production facilities",
      "Fabric export to international markets",
      "Branded apparel design & production",
      "OEM & private label production for retailers",
    ],
    highlight: "Leveraging Pakistan's textile strength on the global stage",
  },
  {
    num: "10",
    name: "Orakzai Media & Marketing",
    tagline: "Zova Advertisement — Brand Power",
    icon: <Megaphone className="w-7 h-7" />,
    sector: "Media & Advertising",
    status: "Active",
    statusColor: "text-green-400 border-green-500/30 bg-green-500/10",
    desc: "Operating under the Zova Advertisement brand, this division handles all branding, digital marketing, PR, and media production for the Orakzai Group and external clients. It is the creative and communications engine of the ecosystem.",
    services: [
      "Full-service digital marketing & social media",
      "Brand identity, design & PR campaigns",
      "Video production & content creation",
      "Influencer marketing & growth strategy",
    ],
    highlight: "Zova Advertisement — crafting narratives for empire-scale brands",
  },
  {
    num: "11",
    name: "Orakzai Chai & Food",
    tagline: "Pakistan's Favourite Cup, Scaled",
    icon: <Coffee className="w-7 h-7" />,
    sector: "Food & Beverage",
    status: "Developing",
    statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    desc: "Orakzai Chai & Food Ventures develops an F&B franchise chain starting with chai and expanding into broader food retail. It aims to build a nationally recognised food brand with a scalable franchise model.",
    services: [
      "Chai house chain development & branding",
      "Franchise model design & operator support",
      "Food product development & packaging",
      "Retail expansion into Orakzai Mart",
    ],
    highlight: "Turning Pakistan's beloved chai culture into a national brand",
  },
  {
    num: "12",
    name: "Orakzai Tech Labs",
    tagline: "Building the Super App of Tomorrow",
    icon: <FlaskConical className="w-7 h-7" />,
    sector: "AI & Software",
    status: "Developing",
    statusColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    desc: "Orakzai Tech Labs is the software development and AI systems arm of the group. It builds internal tools, customer-facing apps, and is developing a super app that integrates services from all 12 companies into one platform.",
    services: [
      "AI systems development & integration",
      "Orakzai Super App — all-in-one group platform",
      "Internal enterprise software for group companies",
      "SaaS products & third-party API development",
    ],
    highlight: "The Orakzai Super App — one platform, 12 companies, infinite possibilities",
  },
];

const IMPACT = [
  { icon: <Lightbulb className="w-5 h-5" />, title: "Free Digital Education", desc: "Programs bringing quality education to underserved communities across Pakistan and beyond." },
  { icon: <Target className="w-5 h-5" />,    title: "Skill Development",      desc: "Practical training initiatives preparing youth for the modern economy." },
  { icon: <Users className="w-5 h-5" />,     title: "Community Empowerment",  desc: "Grassroots initiatives building capacity at the local level." },
  { icon: <Star className="w-5 h-5" />,      title: "Youth Entrepreneurship", desc: "Mentorship and seed support for emerging entrepreneurs." },
];

// ── Expandable Company Card ───────────────────────────────────────────────────
function CompanyCard({ co, delay }: { co: typeof COMPANIES[0]; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={delay}>
      <motion.div
        layout
        onClick={() => setOpen((o) => !o)}
        whileHover={{ y: open ? 0 : -3 }}
        className="group relative rounded-3xl border border-primary/15 backdrop-blur-sm cursor-pointer overflow-hidden transition-colors hover:border-primary/40"
        style={{ background: "rgba(0,0,0,0.45)" }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.07),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                className="w-13 h-13 flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
                animate={open ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {co.icon}
              </motion.div>
              {/* Number */}
              <div>
                <p className="text-[10px] font-mono text-primary/40 font-bold tracking-widest">{co.num}</p>
                <p className="text-xs text-primary/60 font-medium">{co.sector}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status badge */}
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${co.statusColor}`}>
                {co.status === "Active" ? "● " : "○ "}{co.status}
              </span>
              {/* Expand icon */}
              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
                className="w-7 h-7 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-center">
                <ChevronDown className="w-3.5 h-3.5 text-primary/60" />
              </motion.div>
            </div>
          </div>

          {/* Name + tagline */}
          <h3 className="font-extrabold text-foreground text-base mb-1 leading-snug">{co.name}</h3>
          <p className="text-xs text-primary/70 font-semibold italic mb-3">{co.tagline}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{co.desc}</p>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-primary/10 pt-5 space-y-4">
                {/* Full description */}
                <p className="text-sm text-muted-foreground leading-relaxed">{co.desc}</p>

                {/* Key Services */}
                <div>
                  <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Key Services & Offerings
                  </p>
                  <div className="space-y-2">
                    {co.services.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/80 leading-relaxed">{s}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Highlight banner */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                  <Rocket className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/80 font-semibold leading-relaxed">{co.highlight}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reveal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FounderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticleBackground />

      {/* Main Navbar */}
      <Navbar address={null} onConnect={() => {}} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Karachi skyline layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0800] to-background" />
          <svg className="absolute bottom-0 inset-x-0 w-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <rect x="0"   y="200" width="60"  height="120" fill="hsl(43,96%,56%)" />
            <rect x="70"  y="150" width="40"  height="170" fill="hsl(43,96%,56%)" />
            <rect x="120" y="180" width="80"  height="140" fill="hsl(43,96%,56%)" />
            <rect x="210" y="120" width="50"  height="200" fill="hsl(43,96%,56%)" />
            <rect x="270" y="160" width="100" height="160" fill="hsl(43,96%,56%)" />
            <rect x="380" y="100" width="60"  height="220" fill="hsl(43,96%,56%)" />
            <rect x="450" y="140" width="90"  height="180" fill="hsl(43,96%,56%)" />
            <rect x="550" y="80"  width="45"  height="240" fill="hsl(43,96%,56%)" />
            <rect x="605" y="130" width="110" height="190" fill="hsl(43,96%,56%)" />
            <rect x="725" y="60"  width="55"  height="260" fill="hsl(43,96%,56%)" />
            <rect x="790" y="110" width="80"  height="210" fill="hsl(43,96%,56%)" />
            <rect x="880" y="150" width="65"  height="170" fill="hsl(43,96%,56%)" />
            <rect x="955" y="90"  width="90"  height="230" fill="hsl(43,96%,56%)" />
            <rect x="1055" y="130" width="50" height="190" fill="hsl(43,96%,56%)" />
            <rect x="1115" y="170" width="70" height="150" fill="hsl(43,96%,56%)" />
            <rect x="1195" y="110" width="85" height="210" fill="hsl(43,96%,56%)" />
            <rect x="1290" y="160" width="60" height="160" fill="hsl(43,96%,56%)" />
            <rect x="1360" y="130" width="80" height="190" fill="hsl(43,96%,56%)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(234,179,8,0.12),transparent_70%)]" />
        </div>

        {/* Back link */}
        <div className="absolute top-24 left-6 z-20">
          <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Orakzai Bond
          </a>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            The Orakzai Group — Founder & Chairman
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="block text-foreground">Faisal</span>
            <motion.span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}>
              Orakzai
            </motion.span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
            A Global Visionary and Architect of the Orakzai Group — building the future of decentralized economy, industrial innovation, and global-scale ecosystems.
          </motion.p>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { value: "250+", label: "Active & Upcoming Projects" },
              { value: "12",   label: "Mother Companies" },
              { value: "100M", label: "Lives to Impact" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <motion.p className="text-3xl font-extrabold text-primary font-mono"
                  animate={{ textShadow: ["0 0 10px rgba(234,179,8,0.3)", "0 0 25px rgba(234,179,8,0.7)", "0 0 10px rgba(234,179,8,0.3)"] }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  {s.value}
                </motion.p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</p>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── FOUNDER PROFILE ───────────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(234,179,8,0.06),transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Portrait */}
            <Reveal delay={0}>
              <div className="relative flex justify-center md:justify-start">
                <motion.div className="absolute inset-0 rounded-3xl"
                  animate={{ boxShadow: ["0 0 40px rgba(234,179,8,0.2)", "0 0 80px rgba(234,179,8,0.5)", "0 0 40px rgba(234,179,8,0.2)"] }}
                  transition={{ duration: 3.5, repeat: Infinity }} />
                <div className="relative w-72 md:w-80">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary via-yellow-300 to-primary/40 opacity-60" />
                  <div className="relative rounded-3xl overflow-hidden border-2 border-primary/40 shadow-[0_0_60px_rgba(234,179,8,0.3)]">
                    <img src="/founder.jpg" alt="Faisal Orakzai"
                      className="w-full object-cover object-top" style={{ aspectRatio: "4/5" }} />
                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    Founder & Chairman
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Bio */}
            <Reveal delay={0.15}>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-2">Global Visionary Builder</p>
                  <h2 className="text-4xl font-extrabold text-foreground mb-1">Faisal <span className="text-primary">Orakzai</span></h2>
                  <p className="text-muted-foreground text-sm">Karachi, Pakistan · Founder & Chairman, Orakzai Group</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Faisal Orakzai is a visionary entrepreneur and systems builder from Karachi, Pakistan, leading the Orakzai Group — a rapidly expanding multi-industry conglomerate with operations and projects across 12 verticals worldwide.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With a forward-thinking mindset and deep involvement in modern financial systems, decentralized technologies, and business infrastructure, he is focused on building scalable ecosystems rather than isolated businesses. His leap from local leadership to international blockchain innovation marks a defining moment in Pakistan's entrepreneurial history.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { top: "Technology +", bottom: "Finance + Real Assets" },
                    { top: "Local Strength +", bottom: "Global Vision" },
                    { top: "Community Growth +", bottom: "Institutional Structure" },
                  ].map((p, i) => (
                    <div key={i} className="glass-card rounded-xl border border-primary/20 p-3 text-center hover:border-primary/40 transition-colors">
                      <p className="text-[10px] text-primary font-bold leading-tight">{p.top}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{p.bottom}</p>
                    </div>
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-4 italic text-sm">
                  "He is not just building companies — he is building an ecosystem designed to impact generations."
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SCALE STATEMENT ───────────────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none" />
        <div className="absolute inset-0 border-y border-primary/15 pointer-events-none" />
        <Reveal className="container mx-auto px-6 text-center max-w-4xl">
          <motion.div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest">
            Scale & Scope
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">250+</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold text-foreground">Active & Upcoming Projects</p>
          <p className="text-muted-foreground mt-3 text-lg">
            Orakzai Group operates and is developing projects across multiple industries worldwide.
          </p>

          {/* Status summary */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: <BarChart3 className="w-4 h-4" />, label: "7 Active Companies", color: "text-green-400 border-green-500/30 bg-green-500/10" },
              { icon: <Rocket className="w-4 h-4" />,    label: "5 In Development",   color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
              { icon: <Globe className="w-4 h-4" />,     label: "12 Sectors Covered",  color: "text-primary border-primary/30 bg-primary/10" },
            ].map((s) => (
              <span key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${s.color}`}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── 12 MOTHER COMPANIES — DETAILED EXPANDABLE CARDS ──────────────────── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.05),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl">
          <Reveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              The Orakzai Empire
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
              12 Mother <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Companies</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Each vertical operates as an independent powerhouse — unified under the Orakzai ecosystem.{" "}
              <span className="text-primary/70 font-semibold">Tap any card to expand full details.</span>
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANIES.map((co, i) => (
              <CompanyCard key={co.name} co={co} delay={i * 0.04} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ──────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl">
          <Reveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              Purpose
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
              Vision & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Mission</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            <Reveal delay={0}>
              <div className="relative rounded-3xl border border-primary/25 p-8 overflow-hidden glass-gold">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.12),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-primary uppercase tracking-widest font-bold">Vision</span>
                  </div>
                  <blockquote className="text-2xl font-bold text-foreground leading-tight">
                    "To redefine the global economy through decentralized power and sustainable industrial innovation."
                  </blockquote>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative rounded-3xl border border-border p-8 overflow-hidden glass-card">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.06),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-primary uppercase tracking-widest font-bold">Mission</span>
                  </div>
                  <blockquote className="text-2xl font-bold text-foreground leading-tight">
                    "Empowering 100 million lives through a unified ecosystem of technology, finance, and social welfare."
                  </blockquote>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SIGNATURE IDENTITY ────────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal delay={0.1}>
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-6">
                  Identity
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
                  Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Identity</span>
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Faisal Orakzai's presence reflects discipline, tradition, and leadership. His signature style commands respect in every room.
                </p>
                <div className="space-y-4">
                  {[
                    { label: "Traditional Pakistani Attire", desc: "White/black shalwar kameez — rooted in cultural heritage." },
                    { label: "Waistcoat of Authority",       desc: "A symbol of professionalism, leadership, and presence." },
                    { label: "Minimalist Power Aesthetic",   desc: "Purposeful, clean, and impactful — less noise, more signal." },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }} viewport={{ once: true }}
                      className="flex gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-card/30 transition-colors">
                      <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0}>
              <div className="relative rounded-3xl overflow-hidden border border-primary/20 shadow-[0_0_60px_rgba(234,179,8,0.15)]">
                <img src="/founder.jpg" alt="Faisal Orakzai — Signature Identity"
                  className="w-full object-cover object-top" style={{ maxHeight: "520px" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <p className="text-base font-bold text-foreground">Faisal Orakzai</p>
                  <p className="text-xs text-primary font-mono uppercase tracking-widest mt-0.5">
                    Rooted in culture, driven by global ambition
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SOCIAL IMPACT ─────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
        <div className="absolute inset-0 border-y border-primary/10 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl">
          <Reveal className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              Impact
            </span>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
                Son of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Orakzai</span>
              </h2>
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-4">Social Responsibility Movement</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Orakzai Group is not limited to business expansion — it actively supports social impact initiatives that build human potential beyond profit.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {IMPACT.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }}
                  className="relative group rounded-2xl border border-primary/15 bg-card/30 p-6 text-center hover:border-primary/40 transition-colors overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.06),transparent)] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="text-center p-8 rounded-3xl border border-primary/20 glass-gold max-w-3xl mx-auto">
              <p className="text-lg font-semibold text-foreground/90 leading-relaxed">
                Creating opportunities beyond profit —
              </p>
              <p className="text-xl font-bold text-primary">building human potential.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BRAND POSITIONING ─────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-6 text-center max-w-4xl">
          <Reveal>
            <motion.div
              animate={{ boxShadow: ["0 0 40px rgba(234,179,8,0.1)", "0 0 80px rgba(234,179,8,0.25)", "0 0 40px rgba(234,179,8,0.1)"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6 px-5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold uppercase tracking-widest">
              The Orakzai Promise
            </motion.div>
            <blockquote className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight mb-8">
              "Orakzai Group is not a company —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
                it is an evolving ecosystem
              </span>{" "}
              of industries, innovation, and impact designed for the future."
            </blockquote>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-px bg-primary/40" />
              <p className="text-sm font-bold text-primary font-mono tracking-widest uppercase">Faisal Orakzai</p>
              <p className="text-xs text-muted-foreground">Founder & Chairman, Orakzai Group</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/30">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-6xl">
          <div>
            <p className="text-sm font-bold text-foreground">Orakzai Bond · OKBOND</p>
            <p className="text-xs text-muted-foreground mt-0.5">The financial layer of the Orakzai ecosystem</p>
          </div>
          <a href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:-translate-y-0.5">
            Explore OKBOND <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
