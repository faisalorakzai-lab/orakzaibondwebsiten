import { motion } from "framer-motion";
import {
import { useSEO, PAGE_SEO } from "@/components/SEO";
  Shield, CheckCircle, ExternalLink, Lock, AlertTriangle,
  FileText, Eye, Zap, Globe, Download, BadgeCheck,
  Building2, Award, Landmark, BookOpen,
} from "lucide-react";

const CONTRACTS = [
  { label: "OKBOND Token",      addr: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F", type: "ERC-20 Token",       verified: true },
  { label: "ICO Contract",      addr: "0x7BB2458740c4F491277973212309d831385Ab9D7", type: "Token Sale",          verified: true },
  { label: "Vault",             addr: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08", type: "Reserve Vault",       verified: true },
  { label: "Staking",           addr: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e", type: "Staking Protocol",    verified: true },
  { label: "Notebook Registry", addr: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3", type: "Protocol Registry",   verified: true },
];

const SECURITY_FEATURES = [
  { icon: <Lock className="w-5 h-5" />,          title: "Timelock Systems",        desc: "All critical parameter changes go through a mandatory timelock period, preventing instant manipulation." },
  { icon: <AlertTriangle className="w-5 h-5" />, title: "Emergency Pause",         desc: "Each contract includes an emergency pause mechanism controlled by the multisig for incident response." },
  { icon: <Eye className="w-5 h-5" />,           title: "On-chain Transparency",   desc: "All reserve allocations, staking pools, and treasury movements are fully verifiable on Polygon mainnet." },
  { icon: <Shield className="w-5 h-5" />,        title: "Vault Protection",        desc: "The reserve vault maintains collateral ratios with automated alerts for any reserve deviation." },
  { icon: <FileText className="w-5 h-5" />,      title: "Smart Contract Review",   desc: "Core contracts have been reviewed for security vulnerabilities. Review reports are publicly available." },
  { icon: <Globe className="w-5 h-5" />,         title: "Decentralized Control",   desc: "Contract ownership is managed via multisig with no single point of failure." },
];

const RISK_ITEMS = [
  "Smart contract risk — despite security reviews, no code is 100% free of vulnerabilities.",
  "Crypto market volatility — OKBOND token price may fluctuate significantly.",
  "Regulatory uncertainty — DeFi regulations vary by jurisdiction.",
  "Staking lock risk — staked tokens cannot be withdrawn before the lock period ends.",
  "Liquidity risk — exit liquidity depends on market conditions at time of sale.",
];

const AUDIT_DOCUMENTS = [
  {
    label: "Smart Contract Security Review",
    date: "2026",
    viewUrl: "https://drive.google.com/file/d/1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj",
    badge: "Security",
    badgeColor: "#22c55e",
  },
  {
    label: "OKBOND Whitepaper",
    date: "2026",
    viewUrl: "https://drive.google.com/file/d/1Psz7Iy5aREH_ltKPGLglTwR2ln1VTHWS/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1Psz7Iy5aREH_ltKPGLglTwR2ln1VTHWS",
    badge: "Technical",
    badgeColor: "#60A5FA",
  },
  {
    label: "Marketing Overview PDF",
    date: "2026",
    viewUrl: "https://drive.google.com/file/d/1Q6bClDOeBCBxBZfKdD9SnqSpNFrG-u7A/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1Q6bClDOeBCBxBZfKdD9SnqSpNFrG-u7A",
    badge: "Investor",
    badgeColor: "#EAB308",
  },
];

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  useSEO(PAGE_SEO.security);
  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-primary font-mono tracking-widest uppercase">Security Center</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Protocol Security</h1>
        <p className="text-muted-foreground text-sm mt-1">Verified contracts · Security review · Risk disclosures · Compliance</p>
      </motion.div>

      {/* Corporate Verification Banner */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}
        className="rounded-2xl border p-6 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(20,16,8,0.9))", border: "1px solid rgba(234,179,8,0.2)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(234,179,8,0.5), transparent)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Building2 className="w-5 h-5" />, title: "Registered Entity", value: "Orakzai Group SMC-Pvt Ltd", sub: "Khyber Pakhtunkhwa, Pakistan", color: "#EAB308" },
            { icon: <Landmark className="w-5 h-5" />,  title: "Blockchain Network", value: "Polygon Mainnet", sub: "Chain ID 137 · Verified On-Chain", color: "#8247E5" },
            { icon: <Award className="w-5 h-5" />,     title: "Security Review", value: "Completed", sub: "Smart contracts independently reviewed", color: "#22c55e" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
                <p className="text-xs text-zinc-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Verified Contracts */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 mb-6"
      >
        <SectionHeader icon={<CheckCircle className="w-5 h-5" />} title="Verified Smart Contracts" sub="Polygon Mainnet · All contracts publicly verifiable on PolygonScan" />
        <div className="space-y-3">
          {CONTRACTS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-muted/20 border border-border/30 px-4 py-3.5 hover:border-primary/25 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{c.label}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">{c.type}</span>
                    <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono font-bold">VERIFIED</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{c.addr}</p>
                </div>
              </div>
              <a
                href={`https://polygonscan.com/address/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                PolygonScan
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 mb-6"
      >
        <SectionHeader icon={<Zap className="w-5 h-5" />} title="Security Architecture" sub="Multi-layered defense-in-depth protocol design" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECURITY_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
              className="flex gap-4 rounded-xl border border-border/30 bg-muted/20 p-4 hover:border-primary/25 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{f.icon}</div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Document Vault with Download */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <SectionHeader icon={<FileText className="w-5 h-5" />} title="Security Documents" sub="View or download official documentation" />
          <div className="space-y-3">
            {AUDIT_DOCUMENTS.map(doc => (
              <div
                key={doc.label}
                className="rounded-xl bg-muted/20 border border-border/30 px-4 py-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${doc.badgeColor}15`, border: `1px solid ${doc.badgeColor}30`, color: doc.badgeColor }}>{doc.badge}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={doc.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37" }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View PDF
                  </a>
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60A5FA" }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Disclosures */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6"
        >
          <SectionHeader icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} title="Risk Disclosures" sub="Please read before participating" />
          <div className="space-y-3">
            {RISK_ITEMS.map((risk, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-amber-400/10 last:border-0">
                <span className="text-amber-400 font-mono text-xs flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-4 italic">This platform does not provide financial advice. Participate at your own risk.</p>
        </motion.div>
      </div>

      {/* Legal / Compliance strip */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
      >
        <SectionHeader icon={<Globe className="w-5 h-5" />} title="Compliance & Legal" sub="Regulatory transparency" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
            <p className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">Jurisdiction</p>
            <p>OKBOND Protocol operates as a decentralized autonomous protocol. Participation may be restricted in certain jurisdictions.</p>
          </div>
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
            <p className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">No Securities</p>
            <p>OKBOND tokens are utility tokens for protocol participation and do not represent securities or investment instruments.</p>
          </div>
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
            <p className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">KYC/AML</p>
            <p>As a decentralized protocol, on-chain interactions are pseudonymous. Users are responsible for their own regulatory compliance.</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <a href="/legal" className="text-xs text-primary hover:underline">Privacy Policy</a>
          <a href="/legal" className="text-xs text-primary hover:underline">Terms of Service</a>
          <a href="/legal" className="text-xs text-primary hover:underline">Risk Notice</a>
          <a href="/legal" className="text-xs text-primary hover:underline">Cookie Policy</a>
        </div>
      </motion.div>
    </div>
  );
}
