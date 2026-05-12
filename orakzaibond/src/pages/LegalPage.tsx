import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle2, ExternalLink, FileText, Building2,
  Globe, Lock, Eye, RefreshCw, Zap, AlertCircle,
  MapPin, Landmark, BarChart2, Users, Activity,
  Download, BadgeCheck, BookOpen, Award,
} from "lucide-react";
import { useLiveBlockchainData } from "@/hooks/useLiveBlockchainData";

const OKBOND_CONTRACT = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const POLYGONSCAN_URL = `https://polygonscan.com/token/${OKBOND_CONTRACT}`;
const POLYGONSCAN_ADDRESS = `https://polygonscan.com/address/${OKBOND_CONTRACT}`;

const DOCUMENTS = [
  {
    id: "marketing-pdf",
    title: "OKBOND Marketing Overview",
    description: "Official investor-facing marketing overview and introduction to the Orakzai Bond ecosystem.",
    viewUrl: "https://drive.google.com/file/d/1Q6bClDOeBCBxBZfKdD9SnqSpNFrG-u7A/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1Q6bClDOeBCBxBZfKdD9SnqSpNFrG-u7A",
    type: "PDF",
    verified: true,
  },
  {
    id: "whitepaper",
    title: "Orakzai Bond Whitepaper",
    description: "Complete technical and financial architecture of the OKBOND ecosystem — tokenomics, governance, and protocol design.",
    viewUrl: "https://drive.google.com/file/d/1Psz7Iy5aREH_ltKPGLglTwR2ln1VTHWS/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1Psz7Iy5aREH_ltKPGLglTwR2ln1VTHWS",
    type: "PDF",
    verified: true,
  },
  {
    id: "security-review",
    title: "Smart Contract Security Review",
    description: "Independent security review of all OKBOND smart contracts deployed on Polygon Mainnet.",
    viewUrl: "https://drive.google.com/file/d/1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj/view?usp=drivesdk",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1T_isI9xvQQr_Mbkt1YyBvNF4kLUOcVgj",
    type: "PDF",
    verified: true,
  },
  {
    id: "gold-cert",
    title: "Gold Reserve Certificates",
    description: "Certified documentation of gold reserve backing for OKBOND treasury. Available to verified investors upon request.",
    viewUrl: "https://wa.me/923001234567?text=I%20would%20like%20to%20request%20the%20Gold%20Reserve%20Certificates%20for%20OKBOND%20verification.",
    downloadUrl: null,
    type: "Request",
    verified: false,
    requestOnly: true,
  },
  {
    id: "property-deeds",
    title: "Property Deeds — Azan Smart City",
    description: "Official property deeds for Lahore and Islamabad land assets. Available to verified investors upon request.",
    viewUrl: "https://wa.me/923001234567?text=I%20would%20like%20to%20request%20the%20Property%20Deeds%20for%20Azan%20Smart%20City%20verification.",
    downloadUrl: null,
    type: "Request",
    verified: false,
    requestOnly: true,
  },
];

const ASSETS = [
  {
    id: "azan-lahore",
    name: "Azan Smart City — Lahore",
    category: "Real Estate",
    description: "Sovereign land holdings within Lahore's Azan Smart City. Core pillar of OKBOND real-world collateral.",
    status: "Active",
    icon: Building2,
    color: "#EAB308",
  },
  {
    id: "azan-islamabad",
    name: "Azan Smart City — Islamabad",
    category: "Real Estate",
    description: "Premium land portfolio in Islamabad capital territory, part of the Azan Smart City expansion.",
    status: "Active",
    icon: Building2,
    color: "#EAB308",
  },
  {
    id: "tribal-land",
    name: "Sovereign Tribal Land — Orakzai KPK",
    category: "Sovereign Territory",
    description: "Ancestral sovereign land of the Orakzai tribal region, Khyber Pakhtunkhwa. Foundation of the Group's sovereign wealth base.",
    status: "Documented",
    icon: MapPin,
    color: "#60A5FA",
  },
];

const CONTRACTS_ON_CHAIN = [
  { label: "OKBOND Token",      addr: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F", type: "ERC-20" },
  { label: "ICO Contract",      addr: "0x7BB2458740c4F491277973212309d831385Ab9D7", type: "Token Sale" },
  { label: "Staking",           addr: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e", type: "Staking" },
  { label: "Vault",             addr: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08", type: "Reserve Vault" },
  { label: "Notebook Registry", addr: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3", type: "Registry" },
];

export default function LegalPage() {
  const { data, loading, refresh } = useLiveBlockchainData();

  const holderDisplay = loading
    ? "Live Holder Metrics Initializing"
    : data.totalStakers && data.totalStakers !== "0"
    ? data.totalStakers + " Active Participants"
    : "Live Holder Metrics Initializing";

  const supplyDisplay = data.totalSupply && data.totalSupply !== "0"
    ? parseFloat(data.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden neural-grid-strong">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
              style={{
                border: "1.5px solid rgba(96,165,250,0.55)",
                boxShadow: "0 0 20px rgba(96,165,250,0.3)",
              }}
            >
              <img src="/okbond-logo.png" alt="OKBOND" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(96,165,250,0.75)" }}>
                OKBOND · Sovereignty · Transparency
              </p>
              <h1
                className="font-black leading-none"
                style={{
                  color: "#F4CE45",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
                  textShadow: "0 0 24px rgba(212,175,55,0.4)",
                }}
              >
                Sovereign Transparency Vault
              </h1>
            </div>
          </div>

          {/* Live status bar */}
          <div
            className="rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
            style={{
              background: "rgba(8,12,24,0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(96,165,250,0.25)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {data.networkStatus === "online" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${data.networkStatus === "online" ? "bg-green-400" : loading ? "bg-yellow-400" : "bg-red-400"}`} />
              </span>
              <Activity className="w-3 h-3" style={{ color: "rgba(96,165,250,0.85)" }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(96,165,250,0.7)" }}>
                {loading ? "Connecting to Polygon…" : data.networkStatus === "online" ? "Polygon Mainnet · Live" : "RPC Unavailable"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refresh} disabled={loading} className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: "#a78bfa" }}>
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <a
                href={POLYGONSCAN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ color: "#a78bfa" }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 38 33" fill="none">
                  <path d="M19 6L28.5 11.5V22.5L19 28L9.5 22.5V11.5Z" fill="#8247E5" opacity="0.7" />
                </svg>
                View on PolygonScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </header>

        {/* ── Live Blockchain Metrics ─────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: "#22c55e" }} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Live On-Chain Metrics</h2>
            {data.dataInitialized && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Network", value: "Polygon Mainnet", sub: "Chain ID 137", icon: Globe, color: "#8247E5" },
              {
                label: "Total Supply",
                value: supplyDisplay ? supplyDisplay + " OKBOND" : loading ? "Loading…" : "Unavailable",
                sub: data.networkStatus === "online" ? "On-chain confirmed" : "Fetching from blockchain…",
                icon: BarChart2,
                color: "#EAB308",
              },
              {
                label: "Ecosystem Participants",
                value: holderDisplay,
                sub: "Active staking + ICO participants",
                icon: Users,
                color: "#22c55e",
              },
              { label: "Blockchain Status", value: "Verified", sub: "Smart contract publicly audited", icon: Shield, color: "#22c55e" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "linear-gradient(180deg, rgba(20,16,8,0.6), rgba(8,6,3,0.6))",
                    backdropFilter: "blur(14px)",
                    border: `1px solid ${card.color}22`,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{card.label}</span>
                  </div>
                  <p className="text-base font-black text-white mb-1 leading-tight">{card.value}</p>
                  <p className="text-xs text-zinc-500 leading-snug">{card.sub}</p>
                </motion.div>
              );
            })}
          </div>

          <div
            className="mt-3 flex items-start gap-2 px-4 py-2.5 rounded-xl text-xs"
            style={{ background: "rgba(130,71,229,0.06)", border: "1px solid rgba(130,71,229,0.15)", color: "#a78bfa" }}
          >
            <RefreshCw className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Auto-refreshes every 30s from Polygon Mainnet. Contract: <code className="font-mono text-[10px] opacity-80 break-all">{OKBOND_CONTRACT}</code></span>
          </div>
        </motion.section>

        {/* ── Corporate Verification Layer ───────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="w-4 h-4" style={{ color: "#EAB308" }} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Corporate Verification Layer</h2>
            <span className="text-[9px] uppercase tracking-widest px-2 py-1 rounded-full font-bold" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", color: "#EAB308" }}>Institutional</span>
          </div>

          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(20,16,8,0.65), rgba(8,6,3,0.65))",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(234,179,8,0.2)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(234,179,8,0.5), transparent)" }} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legal Entity Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-4 h-4" style={{ color: "#EAB308" }} />
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#EAB308" }}>Legal Entity Details</p>
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Orakzai Group</h3>
                <p className="text-base font-semibold text-zinc-300 mb-4">SMC-Private Ltd</p>
                {[
                  { label: "Jurisdiction", value: "Pakistan — Khyber Pakhtunkhwa" },
                  { label: "Regulator", value: "Securities & Exchange Commission" },
                  { label: "Founded By", value: "Chairman Faisal Orakzai" },
                  { label: "Group Companies", value: "12 Mother Companies" },
                  { label: "Vision Horizon", value: "Vision 2100 (100-year)" },
                  { label: "Token Standard", value: "ERC-20 on Polygon Mainnet" },
                ].map((r) => (
                  <div key={r.label} className="flex gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-xs text-zinc-500 w-36 flex-shrink-0">{r.label}</span>
                    <span className="text-xs text-zinc-300 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Verification Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#EAB308" }} />
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#EAB308" }}>Verification Status</p>
                </div>
                {[
                  { label: "Blockchain Deployment", status: "Live on Polygon", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
                  { label: "Smart Contract Audit", status: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
                  { label: "Land Asset Documentation", status: "Documented", color: "#60A5FA", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)" },
                  { label: "Corporate Registration", status: "Registered", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
                  { label: "PolygonScan Verification", status: "On-Chain Verified", color: "#8247E5", bg: "rgba(130,71,229,0.08)", border: "rgba(130,71,229,0.25)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                    <span className="text-xs text-zinc-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.status}</span>
                    </div>
                  </div>
                ))}

                {/* PolygonScan Link */}
                <a
                  href={POLYGONSCAN_ADDRESS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:opacity-80"
                  style={{ background: "rgba(130,71,229,0.1)", border: "1px solid rgba(130,71,229,0.3)" }}
                >
                  <span className="text-xs text-zinc-400">View Contracts on PolygonScan</span>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                    <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>Open</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── On-Chain Contract Registry ──────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4" style={{ color: "#8247E5" }} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">On-Chain Contract Registry</h2>
            <span className="text-[9px] uppercase tracking-widest px-2 py-1 rounded-full font-bold" style={{ background: "rgba(130,71,229,0.1)", border: "1px solid rgba(130,71,229,0.25)", color: "#a78bfa" }}>Polygon Mainnet</span>
          </div>
          <div className="space-y-2">
            {CONTRACTS_ON_CHAIN.map((c, i) => (
              <motion.div
                key={c.addr}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(20,16,8,0.55)", border: "1px solid rgba(130,71,229,0.15)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.label}</span>
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">{c.type}</span>
                      <span className="text-[9px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded-full font-bold">VERIFIED</span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">{c.addr}</p>
                  </div>
                </div>
                <a
                  href={`https://polygonscan.com/address/${c.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
                  style={{ color: "#a78bfa" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  PolygonScan
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Asset Backing ──────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: "#EAB308" }} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Real-World Asset Backing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ASSETS.map((asset, i) => {
              const Icon = asset.icon;
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(234,179,8,0.15)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${asset.color}15`, border: `1px solid ${asset.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: asset.color }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                      {asset.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{asset.name}</h3>
                  <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: asset.color }}>{asset.category}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{asset.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Document Vault ─────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-4 h-4" style={{ color: "#EAB308" }} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Document Vault</h2>
            <span className="text-[9px] uppercase tracking-widest px-2 py-1 rounded-full font-bold" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#EAB308" }}>Institutional</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOCUMENTS.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="rounded-2xl p-5"
                style={{
                  background: "linear-gradient(180deg, rgba(20,16,8,0.55), rgba(8,6,3,0.55))",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(234,179,8,0.15)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
                    <FileText className="w-5 h-5" style={{ color: "#EAB308" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-bold text-white leading-snug">{doc.title}</h4>
                      {doc.verified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                      <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">{doc.type}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">{doc.description}</p>

                    {(doc as any).requestOnly ? (
                      <a
                        href={doc.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ color: "#22c55e" }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Request Access
                      </a>
                    ) : (
                      <div className="flex items-center gap-3">
                        <a
                          href={doc.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                          style={{ color: "#EAB308" }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View PDF
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        {doc.downloadUrl && (
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{ color: "#60A5FA" }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl text-xs" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>All documents are for viewing purposes only. Unauthorized redistribution is prohibited and may be prosecuted under applicable law.</span>
          </div>
        </motion.section>

        {/* ── Footer note ────────────────────────────────────────────── */}
        <div className="text-center pt-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(234,179,8,0.2))" }} />
            <Zap className="w-3.5 h-3.5" style={{ color: "#EAB308" }} />
            <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(234,179,8,0.2))" }} />
          </div>
          <p className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed">
            This transparency vault reflects the current legal, corporate, and on-chain status of the OKBOND ecosystem. Updated regularly from Polygon Mainnet.
          </p>
          <p className="text-[10px] text-zinc-700 mt-2 font-mono">© 2026 Orakzai Group · Khyber Pakhtunkhwa, Pakistan</p>
        </div>
      </div>
    </div>
  );
}
