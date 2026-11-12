import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CarFront, ChevronLeft, ChevronRight,
  Globe2, Hotel, Landmark, MapPin, Plane, ReceiptText, ShieldCheck, Wifi, Zap, Flame, Droplets,
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
  icon: LucideIcon; availability: string; image: string; shortName: string;
};
const SERVICES: Service[] = [
  { id: "hotels", name: "Hotel Reservations", shortName: "Hotels", description: "Plan a more considered stay with a clear request path for your next destination.", group: "Travel & mobility", icon: Hotel, availability: "Request-led service", image: "/services/hotel-reservations.jpg" },
  { id: "flights", name: "Flights & Travel", shortName: "Flights", description: "Bring travel planning and essential trip details together in one place.", group: "Travel & mobility", icon: Plane, availability: "Request-led service", image: "/services/flights-travel.jpg" },
  { id: "chauffeur", name: "Transport & Chauffeur", shortName: "Transport", description: "Explore private transfers and local mobility through a direct inquiry.", group: "Travel & mobility", icon: CarFront, availability: "Request-led service", image: "/services/transport-chauffeur.jpg" },
  { id: "car-rental", name: "Rent a Car", shortName: "Rent Car", description: "Start a vehicle request for future discovery, rental and driver support.", group: "Travel & mobility", icon: ArrowUpRight, availability: "Request-led service", image: "/services/rent-a-car.jpg" },
  { id: "buy-sell", name: "Buy Property", shortName: "Buy Pro", description: "Begin a property discovery request for opportunities that fit your brief.", group: "Property", icon: Building2, availability: "Request-led service", image: "/services/buy-property.jpg" },
  { id: "rentals", name: "Rent Property", shortName: "Rent Pro", description: "Share your location, budget and timeline for a focused rental request.", group: "Property", icon: MapPin, availability: "Request-led service", image: "/services/rent-property.jpg" },
  { id: "installments", name: "Real Estate Installments", shortName: "Invest Pro", description: "Ask about future payment-plan experiences for real-estate opportunities.", group: "Property", icon: Landmark, availability: "Request-led service", image: "/services/real-estate-installments.jpg" },
  { id: "electricity", name: "Electricity Bills", shortName: "Electric", description: "Send an electricity service request with your provider and reference details.", group: "Everyday utilities", icon: Zap, availability: "Request-led service", image: "/services/electricity-bills.jpg" },
  { id: "gas", name: "Gas Bills", shortName: "Gas", description: "Keep essential gas utility support moving through a simple request.", group: "Everyday utilities", icon: Flame, availability: "Request-led service", image: "/services/gas-bills.jpg" },
  { id: "water", name: "Water Bills", shortName: "Water", description: "Share your water utility details for a clear next step from the team.", group: "Everyday utilities", icon: Droplets, availability: "Request-led service", image: "/services/water-bills.jpg" },
  { id: "internet-mobile", name: "Internet & Mobile Top-ups", shortName: "TopUp", description: "Explore a clear request path for connectivity and mobile support.", group: "Everyday utilities", icon: Wifi, availability: "Request-led service", image: "/services/internet-mobile-topups.jpg" },
  { id: "receipts", name: "Transaction Receipts & Billing", shortName: "PKG / PAY", description: "Keep service records and transaction receipt requests in one place.", group: "Everyday utilities", icon: ReceiptText, availability: "Request-led service", image: "/services/transaction-receipts-billing.jpg" },
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
  return <section className="service-carousel" aria-labelledby="service-carousel-title">
    <div className="service-carousel__heading"><div><p className="service-eyebrow"><span /> THE OKBOND SERVICE NETWORK</p><h2 id="service-carousel-title">Services that move<br /><em>with your world.</em></h2></div><div className="service-carousel__controls"><span>{String(activeIndex + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}</span><button type="button" aria-label="Previous service" onClick={() => moveTo(activeIndex - 1)}><ChevronLeft size={18} /></button><button type="button" aria-label="Next service" onClick={() => moveTo(activeIndex + 1)}><ChevronRight size={18} /></button></div></div>
    <div ref={carouselRef} className="service-carousel__track" onScroll={onScroll} role="region" aria-label="OKBOND services" tabIndex={0}>
      {SERVICES.map((service, index) => { const Icon = service.icon; return <motion.article className="service-slide" key={service.id} initial={reduceMotion ? false : { opacity: 0.72, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.55 }} transition={{ duration: reduceMotion ? 0 : 0.45 }} aria-label={service.name}>
        <span className="service-slide__backdrop-title" aria-hidden="true">{service.shortName}</span><div className="service-slide__image" style={{ backgroundImage: `url(${service.image})` }}><div className="service-slide__scrim" /><div className="service-slide__top-meta"><span><Icon size={16} /> {service.group}</span><span>{String(index + 1).padStart(2, "0")}</span></div><div className="service-slide__image-copy"><p className="service-slide__availability">{service.availability}</p><h3>{service.name}</h3><p className="service-slide__description">{service.description}</p></div></div><div className="service-slide__footer"><a className="service-slide__action" href={inquiryHref(service.id)}>Get Started <ArrowRight size={16} /></a></div>
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
export default function ICOPage() {
  useSEO({ title: "OKBOND Services & Utilities | Hotel, Transport, Property & Bill Inquiries", description: "Inquiry-only OKBOND hotel, transport, car-rental and utility services. Property cards appear only for admin-verified listings; bookings and payments are not connected.", canonical: "https://orakzaibond.com/ico", structuredData: SERVICE_PAGE_SCHEMA });
  return <div className="service-marketplace"><div className="service-marketplace__ambient" aria-hidden="true" /><div className="service-marketplace__wrap">
    <section className="service-hero" aria-labelledby="service-hero-title"><div className="service-hero__copy">
      <p className="service-eyebrow"><span /> OKBOND SOVEREIGN SERVICES</p><h1 id="service-hero-title">Your World.<br /><em>Connected</em> Through OKBOND.</h1>
      <p className="service-hero__lead">Explore stay and transport inquiries, a verified property catalog when available, and everyday utility request paths through the OKBOND ecosystem.</p><p className="service-hero__tagline">One Ecosystem. Everyday Essentials. Connected Value.</p>
      <div className="service-hero__actions"><a className="service-button service-button--gold" href="#service-catalog">Explore Services <ArrowDownRight size={16} /></a><a className="service-button service-button--quiet" href="#service-catalog">Explore Properties <ArrowRight size={16} /></a></div>
      <div className="service-hero__assurance"><span><ShieldCheck size={15} /> Built for clarity</span><i /><span><Globe2 size={15} /> One connected vision</span></div>
    </div><GlobeScene /><div className="service-hero__index"><span>OKBOND</span><span>01 — 04 / SERVICE NETWORK</span></div></section>
    <ServiceCarousel />
    <ServiceWorkflows />
  </div></div>;
}
