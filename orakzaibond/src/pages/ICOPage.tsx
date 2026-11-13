import { useState } from "react";
import { Copy, ArrowUpRight, ChevronRight, CircleCheck, Globe2, Pencil, Ticket, Wallet, Zap } from "lucide-react";
import { useSEO } from "@/components/SEO";
import { useWallet } from "@/hooks/useWallet";
import ServiceWorkflows from "@/components/ServiceWorkflows";
import "./ServicesMarketplace.css";

const SERVICE_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://orakzaibond.com/#organization", name: "Orakzai Bond", alternateName: "OKBOND", url: "https://orakzaibond.com/" },
    { "@type": "WebPage", "@id": "https://orakzaibond.com/services#webpage", url: "https://orakzaibond.com/services", name: "OKBOND Services & Utilities", description: "Inquiry-only OKBOND service paths for travel, property and everyday utilities." },
  ],
};

const categories = [
  { id: "news", label: "NEWS", copy: "Project updates and verified announcements.", className: "is-news", href: "/community", icon: <Globe2 aria-hidden="true" /> },
  { id: "events", label: "EVENTS", copy: "Community events and ecosystem moments.", className: "is-events", href: "/community", icon: <Zap aria-hidden="true" /> },
  { id: "airdrops", label: "AIRDROPS", copy: "No active airdrop campaign is represented here. Follow official updates before participating.", className: "is-airdrops", href: "/community", icon: <Ticket aria-hidden="true" /> },
];

const featuredServices = [
  { label: "STAYS & TRAVEL", title: "Plan your next journey", copy: "Request-led hotel, flight and transport support through the OKBOND service desk.", href: "?service=hotels#service-workflows", image: "/services/hotel-reservations.jpg" },
  { label: "PROPERTY", title: "Explore property pathways", copy: "Start a property discovery request when verified opportunities are available.", href: "?service=buy-sell#service-workflows", image: "/services/buy-property.jpg" },
  { label: "EVERYDAY UTILITIES", title: "Keep essentials moving", copy: "Send a clear request for electricity, gas, water, connectivity or billing support.", href: "?service=electricity#service-workflows", image: "/services/electricity-bills.jpg" },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ICOPage() {
  const { address, connect, connecting, okbondBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  useSEO({
    title: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries",
    description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.",
    canonical: "https://orakzaibond.com/services",
    structuredData: SERVICE_PAGE_SCHEMA,
  });

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="service-app">
      <div className="service-app__glow" aria-hidden="true" />
      <div className="service-app__shell">
        <header className="service-app__header">
          <div className="service-app__brand"><img src="/okbond-logo.png" alt="OKBOND" /><span>OKBOND</span></div>
          <a href="/about" className="service-app__header-link">About <ArrowUpRight size={14} aria-hidden="true" /></a>
        </header>

        <nav className="service-tabs" aria-label="Services categories">
          <a className="is-active" href="/services">Services</a>
          <a href="/token">Assets</a>
          <a href="/community">NFT</a>
        </nav>

        <section className="service-discovery" aria-labelledby="service-discovery-title">
          <div className="service-section-kicker"><span /> OKBOND DISCOVERY</div>
          <h1 id="service-discovery-title">A smarter way to explore your digital world.</h1>
          <p className="service-app__intro">Useful pathways, clear requests and a connected OKBOND experience—without pretending that unavailable services are already live.</p>
          <div className="service-discovery__grid">
            {categories.map((category) => (
              <a key={category.id} className={`service-discovery-card ${category.className}`} href={category.href}>
                <span className="service-discovery-card__art">{category.icon}<i /><b /><em /></span>
                <span className="service-discovery-card__label">{category.label}</span>
                <span className="service-discovery-card__copy">{category.copy}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="service-wallet-strip" aria-label="OKBOND wallet identity">
          <div className="service-wallet-strip__mark"><img src="/okbond-logo.png" alt="" /></div>
          <div className="service-wallet-strip__identity">
            <span>Your OKBOND Wallet</span>
            <strong>{address ? shortAddress(address) : "Connect your wallet"}</strong>
            {address && <small>{okbondBalance ? `${okbondBalance} OKBOND` : "Polygon wallet connected"}</small>}
          </div>
          {address ? (
            <div className="service-wallet-strip__actions">
              <button type="button" aria-label="Wallet settings" title="Wallet settings"><Pencil size={18} /></button>
              <button type="button" onClick={copyAddress} aria-label="Copy wallet address" title="Copy wallet address">{copied ? <CircleCheck size={18} /> : <Copy size={18} />}</button>
            </div>
          ) : (
            <button type="button" className="service-wallet-strip__connect" onClick={() => void connect()} disabled={connecting}>
              <Wallet size={17} /> {connecting ? "Connecting…" : "Connect"}
            </button>
          )}
        </section>

        <section className="service-feature" aria-labelledby="service-feature-title">
          <div className="service-feature__copy">
            <span className="service-section-kicker">THE OKBOND ECOSYSTEM</span>
            <h2 id="service-feature-title">Explore a world of digital utilities.</h2>
            <p>Discover service pathways across travel, property and everyday essentials. Every request is clearly marked and reviewed through the existing OKBOND workflow.</p>
            <a href="#service-workflows" className="service-primary-button">Explore utilities <ArrowUpRight size={16} /></a>
          </div>
          <div className="service-feature__visual" aria-label="OKBOND service ecosystem visual" role="img">
            <div className="service-feature__visual-glow" />
            <div className="service-feature__orb"><span>OK</span><small>CONNECTED<br />ECOSYSTEM</small></div>
            <div className="service-feature__ring service-feature__ring--one" />
            <div className="service-feature__ring service-feature__ring--two" />
            <b className="service-feature__node service-feature__node--one" />
            <b className="service-feature__node service-feature__node--two" />
            <b className="service-feature__node service-feature__node--three" />
          </div>
        </section>

        <section className="service-feature-list" id="service-catalog" aria-labelledby="service-feature-list-title">
          <div className="service-list-heading"><div><span className="service-section-kicker">AVAILABLE PATHWAYS</span><h2 id="service-feature-list-title">Choose your next move.</h2></div><span className="service-list-count">03 / LIVE PATHS</span></div>
          <div className="service-feature-list__grid">
            {featuredServices.map((service) => (
              <a className="service-feature-item" href={service.href} key={service.label}>
                <div className="service-feature-item__image" style={{ backgroundImage: `url(${service.image})` }}><span>{service.label}</span></div>
                <div className="service-feature-item__copy"><h3>{service.title}</h3><p>{service.copy}</p><span className="service-feature-item__link">Open request <ArrowUpRight size={14} /></span></div>
              </a>
            ))}
          </div>
        </section>

        <ServiceWorkflows />
      </div>
    </main>
  );
}
