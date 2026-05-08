import { motion } from "framer-motion";
import {
  Shield, CheckCircle, ExternalLink, Lock, AlertTriangle,
  FileText, Eye, Zap, Globe, BookOpen, Download,
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
  { icon: <FileText className="w-5 h-5" />,      title: "Smart Contract Audit",    desc: "Core contracts have been reviewed for security vulnerabilities. Audit reports are publicly available." },
  { icon: <Globe className="w-5 h-5" />,         title: "Decentralized Control",   desc: "Contract ownership is managed via multisig with no single point of failure." },
];

const RISK_ITEMS = [
  "Smart contract risk — despite audits, no code is 100% free of vulnerabilities.",
  "Crypto market volatility — OKBOND token price may fluctuate significantly.",
  "Regulatory uncertainty — DeFi regulations vary by jurisdiction.",
  "Staking lock risk — staked tokens cannot be withdrawn before the lock period ends.",
  "Liquidity risk — exit liquidity depends on market conditions at time of sale.",
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
        <p className="text-muted-foreground text-sm mt-1">Verified contracts · Audit transparency · Risk disclosures · Compliance</p>
      </motion.div>

      {/* Verified Contracts */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 mb-6"
      >
        <SectionHeader icon={<CheckCircle className="w-5 h-5" />} title="Verified Smart Contracts" sub="Polygon Mainnet · All contracts publicly verifiable" />
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{c.label}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">{c.type}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{c.addr}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono font-bold">VERIFIED</span>
                <a
                  href={`https://polygonscan.com/address/${c.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  PolygonScan
                </a>
              </div>
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
        {/* Audit Reports */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6"
        >
          <SectionHeader icon={<FileText className="w-5 h-5" />} title="Audit Reports" />
          <div className="space-y-3">
            {[
              { label: "Smart Contract Audit Report", date: "2024", href: "https://drive.google.com/file/d/1uvONnEDac-Z06mrth6TT94N9bRGecyhN/view?usp=drivesdk" },
              { label: "OKBOND Whitepaper",           date: "2024", href: "https://drive.google.com/file/d/1WSYlOs9UHvMUlfBG6QMocQvrJDSTAnbh/view?usp=drivesdk" },
              { label: "Protocol Documentation",      date: "2024", href: "https://drive.google.com/file/d/1ciuxocfbRbwENLaclrpey50EJMxF_pdr/view?usp=drivesdk" },
            ].map(doc => (
              <a
                key={doc.label}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/30 px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
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
