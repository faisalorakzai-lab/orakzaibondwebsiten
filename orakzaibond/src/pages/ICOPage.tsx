import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CarFront,
  ChevronDown, Globe2, Hotel, Landmark, MapPin, Plane, ReceiptText, Search, ShieldCheck, Wifi, Zap, Flame, Droplets,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSEO } from "@/components/SEO";
import ServiceWorkflows from "@/components/ServiceWorkflows";
import "./ServicesMarketplace.css";

const SERVICE_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://orakzaibond.com/#organization", name: "Orakzai Bond", alternateName: "OKBOND", url: "https://orakzaibond.com/" },
    { "@type": "WebSite", "@id": "https://orakzaibond.com/#website", url: "https://orakzaibond.com/", name: "Orakzai Bond", publisher: { "@id": "https://orakzaibond.com/#organization" }, inLanguage: "en" },
    { "@type": "WebPage", "@id": "https://orakzaibond.com/services#webpage", url: "https://orakzaibond.com/services", name: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries", description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.", isPartOf: { "@id": "https://orakzaibond.com/#website" }, breadcrumb: { "@id": "https://orakzaibond.com/services#breadcrumb" }, mainEntity: { "@id": "https://orakzaibond.com/services#services" }, inLanguage: "en" },
    { "@type": "BreadcrumbList", "@id": "https://orakzaibond.com/services#breadcrumb", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://orakzaibond.com/" }, { "@type": "ListItem", position: 2, name: "Services & Utilities", item: "https://orakzaibond.com/services" }] },
    { "@type": "ItemList", "@id": "https://orakzaibond.com/services#services", name: "OKBOND service inquiry categories", itemListElement: ["Hotels and stays", "Transport", "Car rental", "Property discovery", "Electricity, gas, water, internet and mobile utilities", "Service request history"].map((name, index) => ({ "@type": "ListItem", position: index + 1, name, description: "Inquiry only; property listings are displayed only when published and administrator-verified." })) },
  ],
};

const ServiceGlobe3D = lazy(() => import("./ServiceGlobe3D"));

type Service = {
  id: string; name: string; description: string; group: string;
  icon: LucideIcon; availability: string; image: string; shortName: string; cta: string;
};
const SERVICES: Service[] = [
  { id: "hotels", name: "Hotel Reservations", shortName: "Hotels", cta: "Book a Stay", description: "Plan a more considered stay with a clear request path for your next destination.", group: "Travel & mobility", icon: Hotel, availability: "Request-led service", image: "/services/hotel-reservations.jpg" },
  { id: "flights", name: "Flights & Travel", shortName: "Flights", cta: "Plan a Trip", description: "Bring travel planning and essential trip details together in one place.", group: "Travel & mobility", icon: Plane, availability: "Request-led service", image: "/services/flights-travel.jpg" },
  { id: "chauffeur", name: "Transport & Chauffeur", shortName: "Transport", cta: "Arrange a Ride", description: "Explore private transfers and local mobility through a direct inquiry.", group: "Travel & mobility", icon: CarFront, availability: "Request-led service", image: "/services/transport-chauffeur.jpg" },
  { id: "car-rental", name: "Rent a Car", shortName: "Rent Car", cta: "Explore Cars", description: "Start a vehicle request for future discovery, rental and driver support.", group: "Travel & mobility", icon: ArrowUpRight, availability: "Request-led service", image: "/services/rent-a-car.jpg" },
  { id: "buy-sell", name: "Buy Property", shortName: "Buy Pro", cta: "Explore Property", description: "Begin a property discovery request for opportunities that fit your brief.", group: "Property", icon: Building2, availability: "Request-led service", image: "/services/buy-property.jpg" },
  { id: "rentals", name: "Rent Property", shortName: "Rent Pro", cta: "Find a Home", description: "Share your location, budget and timeline for a focused rental request.", group: "Property", icon: MapPin, availability: "Request-led service", image: "/services/rent-property.jpg" },
  { id: "installments", name: "Real Estate Installments", shortName: "Invest Pro", cta: "View Plans", description: "Ask about future payment-plan experiences for real-estate opportunities.", group: "Property", icon: Landmark, availability: "Request-led service", image: "/services/real-estate-installments.jpg" },
  { id: "electricity", name: "Electricity Bills", shortName: "Electric", cta: "Pay Electric", description: "Send an electricity service request with your provider and reference details.", group: "Everyday utilities", icon: Zap, availability: "Request-led service", image: "/services/electricity-bills.jpg" },
  { id: "gas", name: "Gas Bills", shortName: "Gas", cta: "Pay Gas", description: "Keep essential gas utility support moving through a simple request.", group: "Everyday utilities", icon: Flame, availability: "Request-led service", image: "/services/gas-bills.jpg" },
  { id: "water", name: "Water Bills", shortName: "Water", cta: "Pay Water", description: "Share your water utility details for a clear next step from the team.", group: "Everyday utilities", icon: Droplets, availability: "Request-led service", image: "/services/water-bills.jpg" },
  { id: "internet-mobile", name: "Internet & Mobile Top-ups", shortName: "TopUp", cta: "Top Up", description: "Explore a clear request path for connectivity and mobile support.", group: "Everyday utilities", icon: Wifi, availability: "Request-led service", image: "/services/internet-mobile-topups.jpg" },
  { id: "receipts", name: "Transaction Receipts & Billing", shortName: "PKG / PAY", cta: "View Records", description: "Keep service records and transaction receipt requests in one place.", group: "Everyday utilities", icon: ReceiptText, availability: "Request-led service", image: "/services/transaction-receipts-billing.jpg" },
];
function inquiryHref(service: string) {
  return `?service=${encodeURIComponent(service)}#service-workflows`;
}
function ServiceCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const moveTo = (next: number) => {
    const index = (next + SERVICES.length) % SERVICES.length;
    setActiveIndex(index);
    carouselRef.current?.children[index]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  };
  const onScroll = () => {
    const element = carouselRef.current;
    if (!element) return;
    const center = element.scrollLeft + element.clientWidth / 2;
    const index = Array.from(element.children).reduce((best, child, i) => {
      const box = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
      return Math.abs(box - center) < Math.abs((element.children[best] as HTMLElement).offsetLeft + (element.children[best] as HTMLElement).offsetWidth / 2 - center) ? i : best;
    }, 0);
    setActiveIndex(index);
  };
  return <section className="service-carousel" aria-label="OKBOND services">
    <div ref={carouselRef} className="service-carousel__track" onScroll={onScroll} role="region" aria-label="OKBOND services" tabIndex={0}>
      {SERVICES.map((service) => { return <motion.article className="service-slide" key={service.id} initial={reduceMotion ? false : { opacity: 0.72, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.55 }} transition={{ duration: reduceMotion ? 0 : 0.45 }} aria-label={service.name}>
        <div className="service-slide__image" style={{ backgroundImage: `url(${service.image})` }}><div className="service-slide__scrim" /><div className="service-slide__image-copy"><p className="service-slide__availability">{service.availability}</p><p className="service-slide__description">{service.description}</p></div></div><h3 className="service-slide__title">{service.shortName}</h3><div className="service-slide__footer"><a className="service-slide__action" href={inquiryHref(service.id)}>{service.cta} <ArrowRight size={16} /></a></div>
      </motion.article>; })}
    </div><div className="service-carousel__dots" aria-label="Choose a service slide">{SERVICES.map((service, index) => <button key={service.id} type="button" aria-label={`Show ${service.name}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => moveTo(index)}><span /></button>)}</div>
  </section>;
}
function GlobeScene() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [webglAvailable, setWebglAvailable] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    const updateRendererPreference = () => {
      if (prefersReducedMotion || window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) {
        setWebglAvailable(false);
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        setWebglAvailable(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
      } catch {
        setWebglAvailable(false);
      }
    };
    updateRendererPreference();
    window.addEventListener("resize", updateRendererPreference);
    return () => window.removeEventListener("resize", updateRendererPreference);
  }, [prefersReducedMotion]);
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientY - rect.top) / rect.height - 0.5) * -5, y: ((event.clientX - rect.left) / rect.width - 0.5) * 7 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });
  return <div ref={stageRef} className="service-globe-stage" onPointerMove={handlePointerMove} onPointerLeave={reset} role="img" aria-label="Illustration of a connected, illuminated OKBOND globe">
    <div className="service-globe-stage__halo" /><div className="service-globe-stage__orbit service-globe-stage__orbit--one" /><div className="service-globe-stage__orbit service-globe-stage__orbit--two" />
    {webglAvailable ? <div className="service-globe-stage__scene" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }} aria-hidden="true"><Suspense fallback={<StaticGlobe tilt={tilt} />}><ServiceGlobe3D enabled fallback={<StaticGlobe tilt={tilt} />} /></Suspense></div> : <StaticGlobe tilt={tilt} />}
    <div className="service-float-card service-float-card--stay"><Hotel size={16} /><span>Stays</span><b>01</b></div><div className="service-float-card service-float-card--transport"><CarFront size={16} /><span>Mobility</span><b>02</b></div><div className="service-float-card service-float-card--property"><Building2 size={16} /><span>Property</span><b>03</b></div><div className="service-float-card service-float-card--utility"><Zap size={16} /><span>Utilities</span><b>04</b></div>
    <div className="service-globe-caption"><span /> A WORLD OF SERVICES <span>·</span> ONE ECOSYSTEM</div>
  </div>;
}
function StaticGlobe({ tilt }: { tilt: { x: number; y: number } }) {
  return <div className="service-globe" style={{ "--tilt-x": `${tilt.x}deg`, "--tilt-y": `${tilt.y}deg` } as CSSProperties}>
    <div className="service-globe__latitude service-globe__latitude--one" /><div className="service-globe__latitude service-globe__latitude--two" /><div className="service-globe__longitude service-globe__longitude--one" /><div className="service-globe__longitude service-globe__longitude--two" />
    <svg className="service-globe__continents" viewBox="0 0 300 300" aria-hidden="true"><path d="M69 73 91 53l25 7 9 17-11 15 9 14-13 12-5 26-19 14-4 25-17-9-7-24-17-13 4-24-14-15 10-15-1-10 17-11Zm88 17 16-12 28 5 17 14 28 4 12 15-14 11-28-5-16 14-20-5-17-17-19-2-12-13 10-9Zm36 54 22 5 14 17-8 18-18 6-16-12-6-19 12-15Zm-67 24 18 8 4 18-13 14-8 31-18 14-10-18 7-25-9-15 8-18 21-9Z" fill="url(#globe-land)" opacity=".83" /><defs><linearGradient id="globe-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4dc9e" /><stop offset="1" stopColor="#8d682e" /></linearGradient></defs></svg>
    <span className="service-globe__node service-globe__node--one" /><span className="service-globe__node service-globe__node--two" /><span className="service-globe__node service-globe__node--three" />
  </div>;
}

type HubCountry = { name: string; code: string; dial: string; flag: string; region: string };
const HUB_COUNTRIES: HubCountry[] = [
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰", region: "Asia" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪", region: "Middle East" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦", region: "Middle East" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧", region: "Europe" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸", region: "North America" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦", region: "North America" },
  { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦", region: "Middle East" },
  { name: "Türkiye", code: "TR", dial: "+90", flag: "🇹🇷", region: "Europe" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺", region: "Oceania" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦", region: "Africa" },
];
type HubCategory = {
  id: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  href: string;
  services: string[];
};

const GLOBAL_CATEGORIES: HubCategory[] = [
  { id: "featured", label: "Featured", detail: "Verified service pathways", icon: Globe2, href: "#service-workflows", services: ["Hotel inquiries", "Transport requests", "Property discovery"] },
  { id: "financing", label: "Loans & Financing", detail: "Availability varies by market", icon: Landmark, href: "#service-workflows", services: ["Financing inquiries", "Installment pathways", "Business finance information"] },
  { id: "rentals", label: "Rent & Leasing", detail: "Property inquiry path", icon: Building2, href: "?service=rentals#service-workflows", services: ["Residential rentals", "Commercial leasing", "Property installments"] },
  { id: "bills", label: "Bill Payments", detail: "Inquiry-only utility support", icon: ReceiptText, href: "?service=electricity#service-workflows", services: ["Electricity bills", "Gas bills", "Water bills", "Internet bills"] },
  { id: "easyload", label: "Easyload & Mobile", detail: "Regional availability varies", icon: Wifi, href: "?service=internet-mobile#service-workflows", services: ["Mobile top-ups", "Internet packages", "Account support"] },
  { id: "government", label: "Government Payments", detail: "Country-specific public services", icon: ShieldCheck, href: "#global-services-hub", services: ["Vehicle Token Tax", "Traffic Challan", "NADRA Fees", "Passport Fees", "Punjab Vehicle Token Tax", "Punjab e-Challan", "CRMS Fees", "Sindh Vehicle Token Tax", "CDA Service Fees", "SECP", "FBR Income Tax", "FBR Sales Tax", "FBR Federal Excise", "CDA Property Tax", "KPK Sales Tax on Sales", "KPK Infrastructure Development Cess", "Private Education Providers Registration", "Islamabad Traffic Violation Challan", "Karachi Traffic Challan", "KPK Driving License", "KPK Traffic Violation Challan", "KPK Food Authority"] },
  { id: "savings", label: "Savings & Investment", detail: "Information only", icon: ArrowUpRight, href: "/token", services: ["Crypto Staking", "Digital Savings", "Fixed-Term Savings", "Investment Opportunities"] },
  { id: "insurance", label: "Insurance", detail: "Market availability varies", icon: ShieldCheck, href: "#global-services-hub", services: ["Health Insurance", "Income Protection", "Mobile Insurance", "Life Insurance", "Travel Insurance"] },
  { id: "travel", label: "Travel & Mobility", detail: "Travel and transport pathways", icon: CarFront, href: "?service=transport#service-workflows", services: ["M-Tag Recharge", "ZU BRT", "Flight Booking", "City-to-City Travel", "Bus Tickets", "Train Tickets", "Airport Transfers", "Hotel Reservations"] },
  { id: "digital", label: "Digital Products", detail: "Explore supported paths", icon: Zap, href: "#service-workflows", services: ["Gift Cards", "eSIM", "Mobile Top-ups", "Gaming Credits", "Digital Vouchers", "Subscription Payments"] },
];

const MARKET_CATEGORY_IDS: Record<string, string[]> = {
  PK: GLOBAL_CATEGORIES.map((category) => category.id),
  AE: ["featured", "financing", "rentals", "bills", "easyload", "savings", "insurance", "travel", "digital"],
  SA: ["featured", "financing", "rentals", "bills", "savings", "insurance", "travel", "digital"],
  GB: ["featured", "financing", "rentals", "bills", "easyload", "savings", "insurance", "travel", "digital"],
  US: ["featured", "financing", "rentals", "bills", "savings", "insurance", "travel", "digital"],
  CA: ["featured", "financing", "rentals", "bills", "savings", "insurance", "travel", "digital"],
  QA: ["featured", "financing", "rentals", "bills", "insurance", "travel", "digital"],
  TR: ["featured", "rentals", "bills", "easyload", "savings", "insurance", "travel", "digital"],
  AU: ["featured", "financing", "rentals", "bills", "savings", "insurance", "travel", "digital"],
  ZA: ["featured", "rentals", "bills", "easyload", "insurance", "travel", "digital"],
};

function categoriesForMarket(code: string) {
  const ids = MARKET_CATEGORY_IDS[code] ?? MARKET_CATEGORY_IDS.PK;
  return GLOBAL_CATEGORIES.filter((category) => ids.includes(category.id));
}

function GlobalServicesHub() {
  const [country, setCountry] = useState<HubCountry>(() => {
    try { return HUB_COUNTRIES.find((item) => item.code === localStorage.getItem("okbond-service-country")) || HUB_COUNTRIES[0]; } catch { return HUB_COUNTRIES[0]; }
  });
  const [query, setQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [serviceDirectoryOpen, setServiceDirectoryOpen] = useState(false);
  const visibleCountries = HUB_COUNTRIES.filter((item) => `${item.name} ${item.code} ${item.dial}`.toLowerCase().includes(query.toLowerCase()));
  const marketCategories = categoriesForMarket(country.code);
  const visibleCategories = marketCategories.filter((category) => `${category.label} ${category.detail} ${category.services.join(" ")}`.toLowerCase().includes(serviceQuery.toLowerCase()));
  const availableServiceCount = marketCategories.reduce((total, category) => total + category.services.length, 0);
  const chooseCountry = (item: HubCountry) => {
    setCountry(item);
    setDirectoryOpen(false);
    setServiceDirectoryOpen(false);
    try { localStorage.setItem("okbond-service-country", item.code); } catch { /* storage may be unavailable */ }
  };
  return <section className="global-services-hub" id="global-services-hub" aria-labelledby="global-services-title">
    <div className="global-services-hub__inner">
      <div className="global-services-hub__heading"><div className="global-appbar"><button type="button" className="global-appbar__back" onClick={() => window.history.back()} aria-label="Go back">‹</button><h2 id="global-services-title">Services</h2></div></div><label className="global-services-search"><Search size={17} /><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Search services" aria-label="Search services" /></label>
      <div className="global-country-panel"><div className="global-country-panel__copy"><span className="global-label">SELECT YOUR COUNTRY</span><h3>Discover what is available in your market.</h3><p>Country selection saves locally and does not change request history.</p></div><button type="button" className="global-country-select" onClick={() => setDirectoryOpen((open) => !open)} aria-expanded={directoryOpen}><span className="global-country-select__flag">{country.flag}</span><span><strong>{country.name}</strong><small>{country.code} · {country.dial}</small></span><ChevronDown size={17} /></button>{directoryOpen && <div className="global-country-directory"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search country or code" aria-label="Search countries" /></label><div className="global-country-directory__list">{visibleCountries.map((item) => <button type="button" key={item.code} onClick={() => chooseCountry(item)}><span>{item.flag}</span><span><b>{item.name}</b><small>{item.region} · {item.dial}</small></span></button>)}{visibleCountries.length === 0 && <p>No country matched this search.</p>}</div></div>}</div>
      <div className="global-services-hub__subhead"><div><span className="global-label">SERVICE CATEGORIES · {marketCategories.length} AVAILABLE</span><h3>Built around real next steps.</h3></div><div className="global-services-hub__subhead-actions"><span className="global-country-status">{country.flag} {country.name} · {availableServiceCount} services</span><button type="button" className="global-see-all" onClick={() => setServiceDirectoryOpen((open) => !open)} aria-expanded={serviceDirectoryOpen}>{serviceDirectoryOpen ? "Close directory" : "See all services"}<ArrowRight size={15} /></button></div></div>
      <div className="global-category-grid">{visibleCategories.map(({ id, label, detail, icon: Icon, href, services }) => <a key={id} className="global-category-card" href={href} title={detail}><span className="global-category-card__icon"><Icon size={17} /></span><span><strong>{label}</strong><small>{services.length} services · {services.slice(0, 2).join(", ")}{services.length > 2 ? "…" : ""}</small></span><ArrowRight size={15} /></a>)}</div>
      {serviceDirectoryOpen && <div className="global-services-directory" aria-label={`${country.name} complete services directory`}><div className="global-services-directory__heading"><div><span className="global-label">COMPLETE SERVICE DIRECTORY</span><h4>{country.name} services</h4></div><span>{availableServiceCount} service pathways</span></div><div className="global-services-directory__grid">{marketCategories.map(({ id, label, icon: Icon, href, services }) => <article key={id} className="global-services-directory__group"><div><span className="global-services-directory__group-icon"><Icon size={16} /></span><h5>{label}</h5></div><ul>{services.map((service) => <li key={service}><a href={href}>{service}<ArrowRight size={12} /></a></li>)}</ul></article>)}</div></div>}
      <div className="global-services-empty" aria-live="polite">{visibleCategories.length === 0 ? "No services found in this market." : ""}</div><div className="global-services-hub__notice"><ShieldCheck size={16} /><span>Availability, pricing and integrations depend on verified country configuration. No unsupported service is represented as live.</span></div>
    </div>
  </section>;
}
export default function ICOPage() {
  useSEO({ title: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries", description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.", canonical: "https://orakzaibond.com/services", structuredData: SERVICE_PAGE_SCHEMA });
  return <div className="service-marketplace"><div className="service-marketplace__ambient" aria-hidden="true" /><div className="service-marketplace__wrap">
    <section className="service-hero" aria-labelledby="service-hero-title"><div className="service-hero__copy">
      <p className="service-eyebrow"><span /> OKBOND SOVEREIGN SERVICES</p><h1 id="service-hero-title">Your World.<br /><em>Connected</em> Through OKBOND.</h1>
      <p className="service-hero__lead">Explore stay and transport inquiries, a verified property catalog when available, and everyday utility request paths through the OKBOND ecosystem.</p><p className="service-hero__tagline">One Ecosystem. Everyday Essentials. Connected Value.</p>
      <div className="service-hero__actions"><a className="service-button service-button--gold" href="#service-catalog">Explore Services <ArrowDownRight size={16} /></a><a className="service-button service-button--quiet" href="#service-catalog">Explore Properties <ArrowRight size={16} /></a></div>
      <div className="service-hero__assurance"><span><ShieldCheck size={15} /> Built for clarity</span><i /><span><Globe2 size={15} /> One connected vision</span></div>
    </div><GlobeScene /><div className="service-hero__index"><span>OKBOND</span><span>01 — 04 / SERVICE NETWORK</span></div></section>
    <ServiceCarousel />
    <GlobalServicesHub />
    <ServiceWorkflows />
  </div></div>;
}
