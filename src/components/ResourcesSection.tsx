import { motion } from "framer-motion";
import { FileText, Download, Shield, BookOpen, BarChart3, Scale, Lock } from "lucide-react";

/* ── Document data ─────────────────────────────────────────────────── */
const DOCS = [
  {
    id: "whitepaper",
    badge: "TECHNICAL WHITEPAPER",
    icon: BookOpen,
    title: "OKBOND Whitepaper",
    subtitle: "Technical & Financial Backbone",
    description:
      "Deep-dive into OKBOND's smart contract architecture, Polygon PoS integration, Lottery algorithm, on-chain randomness, token distribution, and governance model.",
    size: "2.4 MB",
    pages: "38 Pages",
    accent: "#EAB308",
    accentRgb: "234,179,8",
    border: "rgba(234,179,8,0.28)",
    glow: "rgba(234,179,8,0.12)",
    iconBg: "rgba(234,179,8,0.12)",
    dlHref: "https://drive.google.com/uc?export=download&id=1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh",
    viewHref: "https://drive.google.com/uc?export=download&id=1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh",
  },
  {
    id: "pitchdeck",
    badge: "INVESTOR PITCH DECK",
    icon: BarChart3,
    title: "Orakzai Group Pitch Deck",
    subtitle: "12 Companies · Future Vision",
    description:
      "A visual overview of the entire Orakzai Group ecosystem — 12 operating companies, Global Sovereign Infrastructure, strategic roadmap, revenue model, and the OKBOND investment opportunity.",
    size: "5.1 MB",
    pages: "52 Slides",
    accent: "#a78bfa",
    accentRgb: "167,139,250",
    border: "rgba(167,139,250,0.28)",
    glow: "rgba(167,139,250,0.10)",
    iconBg: "rgba(167,139,250,0.12)",
    dlHref: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr",
    viewHref: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr",
  },
  {
    id: "audit",
    badge: "SECURITY CERTIFICATE",
    icon: Shield,
    title: "Smart Contract Audit",
    subtitle: "Polygon PoS · SolidityScan",
    description:
      "Official security audit of the OKBOND smart contract on Polygon PoS — vulnerability scan, reentrancy protection, ownership controls, and 85% security score by SolidityScan.",
    size: "1.2 MB",
    pages: "Audit Report",
    accent: "#22c55e",
    accentRgb: "34,197,94",
    border: "rgba(34,197,94,0.28)",
    glow: "rgba(34,197,94,0.10)",
    iconBg: "rgba(34,197,94,0.12)",
    dlHref: "https://drive.google.com/uc?export=download&id=1uvONnEDac-Z06mrth6TT94N9bRGecyhN",
    viewHref: "https://drive.google.com/uc?export=download&id=1uvONnEDac-Z06mrth6TT94N9bRGecyhN",
  },
  {
    id: "legal",
    badge: "LEGAL DISCLAIMER",
    icon: Scale,
    title: "Legal Disclaimer",
    subtitle: "Terms & Conditions for Investors",
    description:
      "Full legal disclaimer, risk disclosures, token classification, jurisdictional limitations, and investor rights. Read before participating in any OKBOND offering.",
    size: "0.8 MB",
    pages: "Legal Document",
    accent: "#60a5fa",
    accentRgb: "96,165,250",
    border: "rgba(96,165,250,0.28)",
    glow: "rgba(96,165,250,0.10)",
    iconBg: "rgba(96,165,250,0.12)",
    dlHref: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr",
    viewHref: "https://drive.google.com/uc?export=download&id=1ciuxocfbRbwENLaclrpey50EJMxF_pdr",
  },
];

/* ── 3D PDF icon ────────────────────────────────────────────────────── */
function PdfIcon3D({ color, Icon }: { color: string; Icon: React.ElementType }) {
  return (
    <div className="relative w-16 h-[72px] select-none flex-shrink-0">
      {/* Page shadow */}
      <div className="absolute inset-0 rounded-xl" style={{ background: color, opacity: 0.08, transform: "translate(4px,6px)", filter: "blur(6px)" }} />
      {/* Page body */}
      <div className="absolute inset-0 rounded-xl flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(145deg,#1a1f35 0%,#0d1020 100%)`, border: `1.5px solid ${color}40`, boxShadow: `inset 0 0 18px ${color}10` }}>
        {/* Top fold corner */}
        <div className="absolute top-0 right-0 w-0 h-0"
          style={{ borderLeft: "12px solid transparent", borderTop: `12px solid ${color}60` }} />
        <div className="absolute top-0 right-0 w-0 h-0"
          style={{ borderLeft: "12px solid transparent", borderTop: "12px solid #0d1020" }} />
        {/* PDF label strip */}
        <div className="absolute bottom-0 left-0 right-0 py-1 flex items-center justify-center"
          style={{ background: `${color}22`, borderTop: `1px solid ${color}30` }}>
          <span className="text-[9px] font-black tracking-widest" style={{ color }}>PDF</span>
        </div>
        {/* Center icon */}
        <div className="flex-1 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

/* ── Document Card ──────────────────────────────────────────────────── */
function DocCard({ doc, i }: { doc: (typeof DOCS)[number]; i: number }) {
  const Icon = doc.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl p-6 flex flex-col gap-5 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, rgba(10,14,28,0.95) 0%, rgba(6,9,18,0.98) 100%)`,
        border: `1px solid ${doc.border}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 8px 40px ${doc.glow}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Glassmorphism inner glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${doc.glow}, transparent)` }} />

      {/* Top row: badge + size */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
          style={{ background: `rgba(${doc.accentRgb},0.12)`, border: `1px solid rgba(${doc.accentRgb},0.25)`, color: doc.accent }}>
          {doc.badge}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Lock className="w-3 h-3" style={{ color: doc.accent, opacity: 0.6 }} />
          <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider">{doc.size}</span>
        </div>
      </div>

      {/* Icon + title */}
      <div className="flex items-center gap-4">
        <PdfIcon3D color={doc.accent} Icon={Icon} />
        <div className="min-w-0">
          <h3 className="font-black text-foreground text-base leading-tight">{doc.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: doc.accent, opacity: 0.75 }}>{doc.subtitle}</p>
          <p className="text-[10px] font-mono text-foreground/30 mt-1 uppercase tracking-wider">{doc.pages}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/55 leading-relaxed flex-1">{doc.description}</p>

      {/* Action buttons */}
      <div className="flex gap-2.5 mt-auto">
        <motion.a
          href={doc.dlHref} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-black text-sm transition-all"
          style={{
            background: `linear-gradient(135deg, ${doc.accent} 0%, rgba(${doc.accentRgb},0.75) 100%)`,
            color: "#060818",
            boxShadow: `0 0 20px rgba(${doc.accentRgb},0.35), 0 4px 12px rgba(0,0,0,0.4)`,
          }}
        >
          <Download className="w-4 h-4" />
          Download Now
        </motion.a>
        <motion.a
          href={doc.viewHref} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl font-bold text-sm transition-all border"
          style={{ borderColor: `rgba(${doc.accentRgb},0.3)`, color: doc.accent, background: `rgba(${doc.accentRgb},0.06)` }}
        >
          <FileText className="w-4 h-4" />
          View
        </motion.a>
      </div>
    </motion.div>
  );
}

/* ── Main Section ───────────────────────────────────────────────────── */
export default function ResourcesSection() {
  return (
    <section id="resources" className="py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060818 0%, #04050f 60%, #060818 100%)" }}>

      {/* ── Background: Security Shield watermark ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <Shield className="w-[520px] h-[520px] opacity-[0.022] text-primary" />
      </div>

      {/* Subtle radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(234,179,8,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_25%_at_50%_100%,rgba(96,165,250,0.03),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/6 mb-5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resources & Documents</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            The Orakzai{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary">
              Document Vault
            </span>
          </h2>
          <p className="text-foreground/55 text-lg max-w-2xl mx-auto leading-relaxed">
            Every official document in one secure place. Download our whitepapers, pitch decks,
            audit certificates, and legal disclosures — all verified and digitally sealed.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { label: "SSL Encrypted", color: "text-emerald-400 border-emerald-400/25 bg-emerald-400/6" },
              { label: "Verified by Orakzai Group", color: "text-primary border-primary/25 bg-primary/6" },
              { label: "Free to Download", color: "text-sky-400 border-sky-400/25 bg-sky-400/6" },
            ].map((b) => (
              <span key={b.label} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${b.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {b.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Document Grid: 4 cards ── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {DOCS.map((doc, i) => <DocCard key={doc.id} doc={doc} i={i} />)}
        </div>

        {/* ── Divider rule ── */}
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <Shield className="w-5 h-5 text-primary/30" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm text-foreground/40 max-w-xl leading-relaxed">
            All documents are the exclusive property of{" "}
            <span className="text-primary/70 font-bold">Orakzai Group</span>.
            For official verification, contact our support via the{" "}
            <span className="text-emerald-400/80 font-bold">WhatsApp Support Bot</span>{" "}
            at the bottom-right of this page.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
