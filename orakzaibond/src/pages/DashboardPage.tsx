import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BookMarked, CircleAlert,
  Copy, ExternalLink, Gift, Globe, Landmark, Lock, PieChart, RefreshCw,
  Rocket, Ticket, Users, Wallet, Wifi,
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useStaking } from "@/hooks/useStaking";

type TabId = "portfolio" | "ico" | "staking" | "lottery" | "vault" | "governance" | "notebook" | "rewards" | "ambassador" | "analytics";

const TABS: { id: TabId; label: string; icon: typeof Wallet }[] = [
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "ico", label: "Services", icon: Rocket },
  { id: "staking", label: "Staking", icon: Lock },
  { id: "lottery", label: "Lottery", icon: Ticket },
  { id: "vault", label: "Vault", icon: Landmark },
  { id: "governance", label: "Governance", icon: Globe },
  { id: "notebook", label: "Notebook", icon: BookMarked },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "ambassador", label: "Ambassador", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

// Addresses are copied from the configured frontend contracts and deployment manifest.
// “Exact-match” is only used where the repository manifest records a PolygonScan source match.
const CONTRACTS = [
  { name: "OKBOND Token", address: "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F", source: "Exact-match · deployment manifest" },
  { name: "ICO", address: "0x7BB2458740c4F491277973212309d831385Ab9D7", source: "Exact-match · deployment manifest" },
  { name: "Staking", address: "0x5067e9E4Ef827cE0Cc06a44B786668522732fB4e", source: "Verification not confirmed in deployment manifest" },
  { name: "Lottery", address: "0x5BC55d4b347e39B986864E28604Ddca5dE6357B7", source: "Exact-match · deployment manifest" },
  { name: "Vault", address: "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08", source: "Exact-match · deployment manifest" },
  { name: "Notebook Registry", address: "0xa6a1C3D97e629326ad812e97e927622A8dA711a3", source: "Verification not confirmed in deployment manifest" },
] as const;

function amount(value: string | number | null | undefined, unit: string) {
  if (value === null || value === undefined || value === "") return "Unavailable";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "Unavailable";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n)} ${unit}`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/[0.08] bg-[#0b0d11]/90 shadow-[0_18px_55px_rgba(0,0,0,0.22)] ${className}`}>
      {children}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, note, href }: {
  icon: typeof Wallet; label: string; value: string; note: string; href?: string;
}) {
  const body = (
    <div className="h-full rounded-2xl border border-white/[0.08] bg-[linear-gradient(145deg,rgba(15,17,21,.96),rgba(8,10,13,.92))] p-4 sm:p-5 transition duration-200 hover:border-[#D4AF37]/25">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.08] text-[#D4AF37]"><Icon className="h-4 w-4" /></div>
        {href && <ArrowUpRight className="h-4 w-4 text-white/25" />}
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold leading-snug text-white sm:text-xl">{value}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-white/35">{note}</p>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

function SectionHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#D4AF37]/75">{eyebrow}</p><h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2></div>
      {aside}
    </div>
  );
}

function FeatureLink({ href, label = "Open feature" }: { href: string; label?: string }) {
  return <Link href={href} className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/[0.08] px-3.5 py-2.5 text-xs font-semibold text-[#E7CC72] transition hover:bg-[#D4AF37]/[0.14]">{label}<ArrowRight className="h-3.5 w-3.5" /></Link>;
}

function FeatureUnavailable({ icon: Icon, title, description, href, linkLabel }: {
  icon: typeof Wallet; title: string; description: string; href?: string; linkLabel?: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#D4AF37]"><Icon className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{title}</h3><span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-amber-200/75">Not available</span></div><p className="mt-2 text-sm leading-relaxed text-white/45">{description}</p>{href && <div className="mt-4"><FeatureLink href={href} label={linkLabel} /></div>}</div>
      </div>
    </Card>
  );
}

function ContractRegistry() {
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const copyAddress = async (name: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setFeedback((prev) => ({ ...prev, [name]: "Address copied" }));
    } catch {
      setFeedback((prev) => ({ ...prev, [name]: "Copy unavailable — select the address" }));
    }
    window.setTimeout(() => setFeedback((prev) => ({ ...prev, [name]: "" })), 2400);
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]/75">Polygon · Chain ID 137</p><h2 className="mt-1 text-lg font-semibold text-white">Contract Registry</h2></div>
        <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-[#D4AF37]">PolygonScan<ExternalLink className="h-3.5 w-3.5" /></a>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {CONTRACTS.map((contract) => (
          <div key={contract.name} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(130px,.8fr)_minmax(0,2fr)_auto] sm:items-center sm:px-5">
            <div><p className="text-sm font-medium text-white/85">{contract.name}</p><p className="mt-1 text-[10px] text-white/35">Polygon Mainnet</p></div>
            <div className="min-w-0"><p className="break-all font-mono text-[11px] leading-relaxed text-white/65 sm:text-xs">{contract.address}</p><p className={`mt-1 text-[10px] ${contract.source.startsWith("Exact-match") ? "text-emerald-300/70" : "text-amber-200/60"}`}>{contract.source}</p><p className="mt-0.5 text-[9px] text-white/30">Independent audit: not recorded in manifest</p>{feedback[contract.name] && <p aria-live="polite" className="mt-1 text-[10px] text-[#E7CC72]">{feedback[contract.name]}</p>}</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => copyAddress(contract.name, contract.address)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] text-white/55 transition hover:border-[#D4AF37]/35 hover:text-[#E7CC72]" aria-label={`Copy ${contract.name} address`}><Copy className="h-3.5 w-3.5" />Copy</button>
              <a href={`https://polygonscan.com/address/${contract.address}#code`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/45 transition hover:border-[#D4AF37]/35 hover:text-[#E7CC72]" aria-label={`Open ${contract.name} on PolygonScan`}><ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        ))}
      </div>
      <p className="px-4 pb-4 text-[10px] leading-relaxed text-white/30 sm:px-5">“Exact-match” reflects the repository deployment manifest only; it is not an independent audit or a live availability guarantee.</p>
    </Card>
  );
}

function PortfolioOverview({ address, okbondBalance, staking, stakingLoading, stakingError }: {
  address: string | null; okbondBalance: string | null; staking: ReturnType<typeof useStaking>["stats"]; stakingLoading: boolean; stakingError: string | null;
}) {
  const connected = Boolean(address);
  const stakedValue = !connected ? "Connect wallet" : stakingLoading ? "Loading…" : stakingError || !staking ? "Unavailable" : amount(staking.userStaked, "OKBOND");
  const rewardValue = !connected ? "Connect wallet" : stakingLoading ? "Loading…" : stakingError || !staking ? "Unavailable" : amount(staking.userRewards, "OKBOND");
  const walletValue = !connected ? "Connect wallet" : okbondBalance === null ? "Unavailable" : amount(okbondBalance, "OKBOND");
  return (
    <div className="space-y-7">
      <div>
        <SectionHeading eyebrow="Your assets" title="Portfolio overview" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Wallet} label="Wallet balance" value={walletValue} note={connected ? "OKBOND balance read from Polygon" : "Connect a wallet to view your balance"} />
          <MetricCard icon={Lock} label="Total staked" value={stakedValue} note={connected ? "Read from the staking contract" : "Wallet-specific contract read"} href="/staking" />
          <MetricCard icon={Gift} label="Claimable staking rewards" value={rewardValue} note={connected ? "Contract-reported OKBOND rewards" : "Wallet-specific contract read"} href="/staking" />
          <MetricCard icon={BarChart3} label="Portfolio value" value="Not available" note="No verified current market valuation is connected" />
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Additional positions" title="Ecosystem exposure" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard icon={Landmark} label="Personal vault allocation" value="Not available" note="No user-specific vault position is exposed here" href="/vault" />
          <MetricCard icon={Ticket} label="Lottery entries" value="Not available" note="A personal entry count is not connected to this dashboard" href="/lottery" />
          <MetricCard icon={Globe} label="Governance participation" value="Not available" note="No connected voting or proposal integration" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Portfolio history" title="Value & allocation" />
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-black/10 px-5 py-7 text-center">
            <PieChart className="h-7 w-7 text-[#D4AF37]/55" />
            <p className="mt-3 text-sm font-medium text-white/75">Historical portfolio data unavailable</p>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/40">No verified wallet value history or complete asset-pricing source is connected, so no chart or allocation percentages are shown.</p>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Wallet activity" title="Transactions" />
          {connected && address ? <div className="flex min-h-40 flex-col items-center justify-center text-center"><Activity className="h-7 w-7 text-[#D4AF37]/55" /><p className="mt-3 text-sm font-medium text-white/75">Open on-chain wallet activity</p><p className="mt-1 text-xs text-white/40">Transaction history is shown by PolygonScan, not mirrored here.</p><a className="mt-4 inline-flex items-center gap-2 text-xs text-[#E7CC72] hover:text-white" href={`https://polygonscan.com/address/${address}`} target="_blank" rel="noopener noreferrer">View wallet on PolygonScan<ExternalLink className="h-3.5 w-3.5" /></a></div> : <div className="flex min-h-40 flex-col items-center justify-center text-center"><Wallet className="h-7 w-7 text-white/30" /><p className="mt-3 text-sm text-white/65">Connect a wallet to open its activity</p></div>}
        </Card>
      </div>

      {connected && staking?.userStakes?.length ? (
        <Card className="overflow-hidden">
          <div className="border-b border-white/[0.07] px-4 py-4 sm:px-5"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]/75">On-chain positions</p><h2 className="mt-1 text-lg font-semibold text-white">Your staking positions</h2></div>
          <div className="divide-y divide-white/[0.06]">{staking.userStakes.map((position) => <div key={position.id} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:items-center sm:px-5"><span className="text-sm font-medium text-white">{amount(position.amount, "OKBOND")}</span><span className="text-xs text-white/45">{position.lockPeriod} day lock · {position.active ? "Active" : "Inactive"}</span><span className="text-xs text-[#E7CC72]">Claimable: {amount(position.pendingReward, "OKBOND")}</span></div>)}</div>
        </Card>
      ) : connected && !stakingLoading && !stakingError ? (
        <Card className="flex items-center gap-3 p-4"><Lock className="h-4 w-4 shrink-0 text-white/35" /><p className="text-xs text-white/45">No active staking positions were returned for this wallet.</p></Card>
      ) : null}
    </div>
  );
}

function StakingPanel({ address, staking, loading, error }: { address: string | null; staking: ReturnType<typeof useStaking>["stats"]; loading: boolean; error: string | null }) {
  if (loading) return <Card className="p-6 text-sm text-white/50">Loading current Polygon staking data…</Card>;
  if (error || !staking) return <Card className="p-6"><p className="flex items-center gap-2 text-sm text-amber-200"><CircleAlert className="h-4 w-4" />Staking data is unavailable right now.</p><p className="mt-2 text-xs text-white/40">{error || "The staking contract did not return data."}</p></Card>;
  return <div className="space-y-4">
    <Card className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">
      <div><p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Contract total staked</p><p className="mt-2 text-lg font-semibold text-white">{amount(staking.totalStaked, "OKBOND")}</p></div>
      <div><p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Contract staker count</p><p className="mt-2 text-lg font-semibold text-white">{staking.totalStakers}</p></div>
      <div><p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Rewards distributed</p><p className="mt-2 text-lg font-semibold text-white">{amount(staking.rewardsDistributed, "OKBOND")}</p></div>
    </Card>
    <FeatureUnavailable icon={Lock} title="Staking positions" description={address ? "Your wallet-specific positions and claimable amounts are shown on the Staking page. No APY estimate or future reward projection is added here." : "Connect your wallet on the Staking page to load your own positions and contract-reported claimable rewards."} href="/staking" linkLabel="Open staking page" />
  </div>;
}

function TabContent({ tab, address, okbondBalance, staking, stakingLoading, stakingError }: {
  tab: TabId; address: string | null; okbondBalance: string | null; staking: ReturnType<typeof useStaking>["stats"]; stakingLoading: boolean; stakingError: string | null;
}) {
  switch (tab) {
    case "portfolio": return <PortfolioOverview address={address} okbondBalance={okbondBalance} staking={staking} stakingLoading={stakingLoading} stakingError={stakingError} />;
    case "ico": return <FeatureUnavailable icon={Rocket} title="ICO contract data" description="ICO participation, terms, and current contract reads are handled by the dedicated ICO page; the portfolio does not substitute sale price for a market valuation." href="/ico" linkLabel="Open Services" />;
    case "staking": return <StakingPanel address={address} staking={staking} loading={stakingLoading} error={stakingError} />;
    case "lottery": return <FeatureUnavailable icon={Ticket} title="Lottery activity" description="This dashboard has no wallet-specific lottery history integration. View the lottery page for the current contract status and wallet actions." href="/lottery" linkLabel="Open lottery page" />;
    case "vault": return <FeatureUnavailable icon={Landmark} title="Personal vault allocation" description="The current dashboard integration does not expose a user-specific vault position or allocation. No reserve shares are inferred." href="/vault" linkLabel="Open vault page" />;
    case "governance": return <FeatureUnavailable icon={Globe} title="Governance data" description="Proposal, vote, and participation data are not connected to this dashboard; no proposals or voting activity are fabricated." />;
    case "notebook": return <FeatureUnavailable icon={BookMarked} title="Notebook registry" description="The on-chain registry page is available, but personal notebook records are not summarized in this portfolio." href="/registry" linkLabel="Open registry" />;
    case "rewards": return <FeatureUnavailable icon={Gift} title="Claimable rewards" description={address ? stakingLoading ? "Loading the staking contract's wallet-specific reward read…" : stakingError || !staking ? "Staking reward data is currently unavailable." : `The staking contract reports ${amount(staking.userRewards, "OKBOND")} for this wallet. Open staking to review available claim actions.` : "Connect a wallet to read contract-reported staking rewards."} href="/staking" linkLabel="Review staking rewards" />;
    case "ambassador": return <FeatureUnavailable icon={Users} title="Ambassador program" description="Program details and application are managed on the dedicated page; no commission tiers or personal referral income are estimated here." href="/ambassador" linkLabel="Open ambassador page" />;
    case "analytics": return <FeatureUnavailable icon={Activity} title="Portfolio analytics" description="This dashboard has no verified historical portfolio-value feed, so trend charts, performance, and asset-allocation percentages are not shown." />;
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");
  const [walletFeedback, setWalletFeedback] = useState("");
  const reduceMotion = useReducedMotion();
  const { address, chainId, isPolygon, error: walletError, connecting, okbondBalance, connect, disconnect, switchToPolygon, clearError, refreshBalance } = useWallet();
  const { stats: staking, loading: stakingLoading, readError: stakingError, refresh: refreshStaking } = useStaking(null, address);
  const walletConnected = Boolean(address);
  const refreshAll = () => { refreshBalance(); void refreshStaking(); };

  const connectWallet = async () => {
    setWalletFeedback(""); clearError();
    await connect();
  };
  const disconnectWallet = async () => { await disconnect(); setWalletFeedback("Wallet disconnected"); };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050608] pb-28 text-white lg:pb-12">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(ellipse_at_50%_-15%,rgba(212,175,55,.12),transparent_65%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[26px] border border-[#D4AF37]/15 bg-[linear-gradient(118deg,#101114_0%,#090a0d_52%,#11100c_100%)] px-5 py-6 shadow-[0_25px_80px_rgba(0,0,0,.38)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#D4AF37]/[0.07] blur-3xl" />
          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.2fr_.8fr] lg:gap-10">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-black/25 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[.18em] text-[#E6CC77]"><BarChart3 className="h-3.5 w-3.5" /> Sovereign portfolio</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-black/20 px-3 py-1.5 text-[10px] font-mono text-white/55"><span className={`h-1.5 w-1.5 rounded-full ${stakingError ? "bg-amber-300" : staking ? "bg-emerald-300" : "bg-white/30"}`} />{stakingError ? "STAKING READ UNAVAILABLE" : stakingLoading ? "READING STAKING CONTRACT" : "POLYGON · CHAIN 137"}</span>
              </div>
              <h1 className="max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-.045em] text-white sm:text-4xl lg:text-[52px]">Your Financial<br /><span className="bg-gradient-to-r from-[#F1DE9A] via-[#D4AF37] to-[#A77F22] bg-clip-text text-transparent">Command Center</span></h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">One ecosystem. Your assets. Full visibility.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!walletConnected ? (
                  <button type="button" onClick={connectWallet} disabled={connecting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#F0D988] via-[#D4AF37] to-[#B28D32] px-5 py-3 text-sm font-semibold text-[#12110c] shadow-[0_8px_32px_rgba(212,175,55,.18)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-60"><Wallet className="h-4 w-4" />{connecting ? "Connecting…" : "Connect wallet"}</button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-2.5 font-mono text-xs text-emerald-100"><Wallet className="h-4 w-4" />{address!.slice(0, 7)}…{address!.slice(-5)}</span>
                    {!isPolygon && <button type="button" onClick={() => void switchToPolygon()} className="min-h-10 rounded-xl border border-amber-300/25 px-3 text-xs font-medium text-amber-100 hover:bg-amber-300/10">Switch to Polygon</button>}
                    <button type="button" onClick={disconnectWallet} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs text-white/55 hover:border-white/25 hover:text-white">Disconnect</button>
                  </div>
                )}
                <button type="button" onClick={refreshAll} disabled={stakingLoading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3.5 text-xs text-white/55 transition hover:border-[#D4AF37]/30 hover:text-[#E7CC72] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${stakingLoading ? "animate-spin" : ""}`} />Refresh data</button>
              </div>
              {walletConnected && <p className="mt-3 text-[11px] text-white/40">Wallet network: {isPolygon ? "Polygon Mainnet · 137" : chainId ? `Unsupported chain · ${chainId}` : "Checking network…"}</p>}
              {(walletError || walletFeedback) && <p role="status" className={`mt-3 text-xs ${walletError ? "text-amber-200" : "text-emerald-200"}`}>{walletError === "no_metamask" ? "No compatible wallet was detected. Install or open a supported wallet, then try again." : walletError || walletFeedback}</p>}
            </div>
            <div className="relative mx-auto flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56 lg:h-64 lg:w-64" aria-hidden="true">
              <div className="absolute inset-3 rounded-full border border-[#D4AF37]/10" />
              <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/15" />
              <motion.div className="absolute inset-4 rounded-full border border-[#E2C45E]/20" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
              <motion.div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[#F3DB82]/70 bg-[radial-gradient(circle_at_32%_24%,#FFF2BC_0%,#D4AF37_30%,#8F6919_61%,#17130b_100%)] shadow-[inset_0_2px_10px_rgba(255,255,255,.65),inset_0_-12px_25px_rgba(0,0,0,.5),0_0_42px_rgba(212,175,55,.23)] sm:h-36 sm:w-36 lg:h-40 lg:w-40" animate={reduceMotion ? undefined : { y: [0, -7, 0], rotateY: [0, 7, 0, -7, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <div className="absolute inset-2 rounded-full border border-[#FFF1B7]/35" />
                <div className="relative text-center"><span className="block text-4xl font-semibold tracking-[-.08em] text-[#fff6d1] drop-shadow-[0_2px_4px_rgba(0,0,0,.55)]">OB</span><span className="mt-1 block text-[7px] font-mono tracking-[.32em] text-[#fff0b0]/80">OKBOND</span></div>
              </motion.div>
              <span className="absolute right-7 top-7 h-1.5 w-1.5 rounded-full bg-[#F4D876] shadow-[0_0_12px_#f4d876]" />
              <span className="absolute bottom-8 left-7 h-1 w-1 rounded-full bg-white/80 shadow-[0_0_10px_#fff]" />
            </div>
          </div>
          <div className="relative z-10 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 text-[10px] font-mono uppercase tracking-[.16em] text-white/35"><span>{walletConnected ? "Personal data · Polygon reads" : "Read-only portfolio preview"}</span><span>Values shown only when returned by connected integrations</span></div>
        </section>

        <div className="mt-6">
          <div role="tablist" aria-label="Dashboard sections" className="-mx-4 max-w-full overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex w-max min-w-full gap-1.5 rounded-2xl border border-white/[0.07] bg-[#0b0d11]/85 p-1.5 sm:w-max sm:min-w-0">
              {TABS.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} aria-controls="dashboard-tab-panel" onClick={() => setActiveTab(id)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition sm:px-4 ${activeTab === id ? "border-[#D4AF37]/25 bg-[#D4AF37]/[0.09] text-[#E9D27E]" : "border-transparent text-white/45 hover:bg-white/[0.035] hover:text-white/80"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
            </div>
          </div>
          <div className="mb-6 mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[.16em] text-white/35"><Wifi className="h-3.5 w-3.5 text-[#D4AF37]/70" />{stakingError ? "Staking contract read unavailable" : stakingLoading ? "Reading staking contract" : "Staking contract read completed"}<span className="ml-auto hidden sm:inline">No fabricated activity or market history</span></div>
          <div id="dashboard-tab-panel" role="tabpanel" aria-label={`${activeTab} section`}>
            <TabContent tab={activeTab} address={address} okbondBalance={okbondBalance} staking={staking} stakingLoading={stakingLoading} stakingError={stakingError} />
          </div>
        </div>

        <div className="mt-8"><ContractRegistry /></div>
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] leading-relaxed text-white/30"><span>Polygon Mainnet · Chain ID 137</span><span>Contract activity and balances can change; verify before acting.</span></footer>
      </div>
    </main>
  );
}
