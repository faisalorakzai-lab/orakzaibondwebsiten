import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CarFront, Globe2, Hotel, Landmark,
  MapPin, Plane, ReceiptText, ShieldCheck, Wifi, Zap, Flame, Droplets,
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
    { "@type": "WebPage", "@id": "https://orakzaibond.com/ico#webpage", url: "https://orakzaibond.com/ico", name: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries", description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.", isPartOf: { "@id": "https://orakzaibond.com/#website" }, breadcrumb: { "@id": "https://orakzaibond.com/ico#breadcrumb" }, mainEntity: { "@id": "https://orakzaibond.com/ico#services" }, inLanguage: "en" },
    { "@type": "BreadcrumbList", "@id": "https://orakzaibond.com/ico#breadcrumb", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://orakzaibond.com/" }, { "@type": "ListItem", position: 2, name: "Services & Utilities", item: "https://orakzaibond.com/ico" }] },
    { "@type": "ItemList", "@id": "https://orakzaibond.com/ico#services", name: "OKBOND service inquiry categories", itemListElement: ["Hotels and stays", "Transport", "Car rental", "Property discovery", "Electricity, gas, water, internet and mobile utilities", "Service request history"].map((name, index) => ({ "@type": "ListItem", position: index + 1, name, description: "Inquiry only; property listings are displayed only when published and administrator-verified." })) },
  ],
};

const ServiceGlobe3D = lazy(() => import("./ServiceGlobe3D"));

type Service = {
  id: string; name: string; description: string; group: string;
  icon: LucideIcon; availability: string;
};
const SERVICES: Service[] = [
  { id: "hotels", name: "Hotel Reservations", description: "Discover a more considered way to plan your next stay.", group: "Travel & mobility", icon: Hotel, availability: "Booking integration in development" },
  { id: "flights", name: "Flights & Travel", description: "Bring travel planning and essential trip details together.", group: "Travel & mobility", icon: Plane, availability: "Airline search in development" },
  { id: "chauffeur", name: "Transport & Chauffeur", description: "Explore private transfers and local mobility services.", group: "Travel & mobility", icon: CarFront, availability: "Operator network in development" },
  { id: "car-rental", name: "Rent a Car", description: "A simple starting point for future vehicle discovery.", group: "Travel & mobility", icon: ArrowUpRight, availability: "Rental inventory in development" },
  { id: "buy-sell", name: "Buy Property", description: "Discover a future marketplace for property opportunities.", group: "Property", icon: Building2, availability: "Verified listings in development" },
  { id: "rentals", name: "Rent Property", description: "Explore long-stay and rental discovery concepts.", group: "Property", icon: MapPin, availability: "Rental listings in development" },
  { id: "installments", name: "Real Estate Installments", description: "Learn about future property payment-plan experiences.", group: "Property", icon: Landmark, availability: "Plans and transactions in development" },
  { id: "electricity", name: "Electricity Bills", description: "A clear route to future electricity bill services.", group: "Everyday utilities", icon: Zap, availability: "Utility provider connection in development" },
  { id: "gas", name: "Gas Bills", description: "Keep essential household utility payments in view.", group: "Everyday utilities", icon: Flame, availability: "Utility provider connection in development" },
  { id: "water", name: "Water Bills", description: "A future-ready utility experience for water services.", group: "Everyday utilities", icon: Droplets, availability: "Utility provider connection in development" },
  { id: "internet-mobile", name: "Internet & Mobile Top-ups", description: "Explore future connectivity and mobile top-up options.", group: "Everyday utilities", icon: Wifi, availability: "Telecom connection in development" },
  { id: "receipts", name: "Transaction Receipts & Billing", description: "A planned home for service records and transaction receipts.", group: "Everyday utilities", icon: ReceiptText, availability: "Billing services in development" },
];
function inquiryHref(service: string) {
  void service;
  return "#service-workflows";
}
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  const reduceMotion = useReducedMotion();
  return <motion.article className="service-market-card" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.055 }}>
    <div className="service-market-card__top"><span className="service-market-card__icon"><Icon size={21} strokeWidth={1.55} aria-hidden="true" /></span><span className="service-market-card__group">{service.group}</span></div>
    <h3>{service.name}</h3><p className="service-market-card__description">{service.description}</p>
    <div className="service-market-card__status"><span aria-hidden="true" />{service.availability}</div>
    <a className="service-market-card__action" href={inquiryHref(service.name)} aria-label={`View ${service.name} service`}>View Service <ArrowRight size={15} aria-hidden="true" /></a>
  </motion.article>;
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
export default function ICOPage() {
  useSEO({ title: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries", description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.", canonical: "https://orakzaibond.com/ico", structuredData: SERVICE_PAGE_SCHEMA });
  return <div className="service-marketplace"><div className="service-marketplace__ambient" aria-hidden="true" /><div className="service-marketplace__wrap">
    <section className="service-hero" aria-labelledby="service-hero-title"><div className="service-hero__copy">
      <p className="service-eyebrow"><span /> OKBOND SOVEREIGN SERVICES</p><h1 id="service-hero-title">Your World.<br /><em>Connected</em> Through OKBOND.</h1>
      <p className="service-hero__lead">Explore stay and transport inquiries, a verified property catalog when available, and everyday utility request paths through the OKBOND ecosystem.</p><p className="service-hero__tagline">One Ecosystem. Everyday Essentials. Connected Value.</p>
      <div className="service-hero__actions"><a className="service-button service-button--gold" href="#service-catalog">Explore Services <ArrowDownRight size={16} /></a><a className="service-button service-button--quiet" href="#service-catalog">Explore Properties <ArrowRight size={16} /></a></div>
      <div className="service-hero__assurance"><span><ShieldCheck size={15} /> Built for clarity</span><i /><span><Globe2 size={15} /> One connected vision</span></div>
    </div><GlobeScene /><div className="service-hero__index"><span>OKBOND</span><span>01 — 04 / SERVICE NETWORK</span></div></section>
    <section className="service-catalog" id="service-catalog" aria-labelledby="service-catalog-title"><div className="service-catalog__heading"><div><p className="service-eyebrow"><span /> THE OKBOND SERVICE NETWORK</p><h2 id="service-catalog-title">Everyday services.<br /><em>Elegantly connected.</em></h2></div><p>Explore the full service network and choose a clear next step. Each request opens the existing OKBOND workflow center.</p></div><div className="service-category-grid">{SERVICES.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div></section>
    <ServiceWorkflows />
  </div></div>;
}
