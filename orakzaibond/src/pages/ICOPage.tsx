import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Building2,
  CarFront, Check, ChevronRight, CircleHelp, Clock3, Droplets, Flame,
  Globe2, Hotel, Landmark, Mail, MapPin, Plane, ReceiptText, ShieldCheck,
  Sparkles, WalletCards, Wifi, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSEO } from "@/components/SEO";
import "./ServicesMarketplace.css";

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
const FEATURED = [
  { number: "01", label: "STAYS · INQUIRY", title: "Luxury Hotel Stays", description: "Explore a considered stay experience. Hotel inventory and booking are not connected yet.", icon: Hotel, tone: "hotel", href: inquiryHref("Luxury Hotel Stays") },
  { number: "02", label: "MOBILITY · INQUIRY", title: "Executive Transport", description: "Ask about future chauffeur and private-transfer services. No vehicles are available to book here.", icon: CarFront, tone: "transport", href: inquiryHref("Executive Transport") },
  { number: "03", label: "PROPERTY · DISCOVERY", title: "Property Discovery", description: "Explore property discovery concepts. No live property inventory or transactions are connected.", icon: Building2, tone: "property", href: "#property-discovery" },
  { number: "04", label: "UTILITY INQUIRY", title: "Everyday Utility Payments", description: "Electricity, gas, water and connectivity in one planned hub. This page does not process bills.", icon: Zap, tone: "utility", href: "#utility-services" },
];
function inquiryHref(service: string) {
  return `mailto:support@orakzaibond.com?subject=${encodeURIComponent(`OKBOND service inquiry: ${service}`)}&body=${encodeURIComponent(`Hello OKBOND team,\n\nI would like to learn more about ${service}.\n\nPlease share availability and next steps.\n`)}`;
}
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  const reduceMotion = useReducedMotion();
  return <motion.article className="service-market-card" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.055 }}>
    <div className="service-market-card__top"><span className="service-market-card__icon"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span><span className="service-market-card__index">{String(index + 1).padStart(2, "0")}</span></div>
    <p className="service-market-card__group">{service.group}</p><h3>{service.name}</h3><p className="service-market-card__description">{service.description}</p>
    <div className="service-market-card__status"><span aria-hidden="true" />{service.availability}</div>
    <a className="service-market-card__action" href={inquiryHref(service.name)} aria-label={`Ask about ${service.name}`}>Ask about this service <ArrowRight size={15} aria-hidden="true" /></a>
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
function FeaturedCard({ number, label, title, description, Icon, tone, href, index }: {
  number: string; label: string; title: string; description: string;
  Icon: LucideIcon; tone: string; href: string; index: number;
}) {
  const reduceMotion = useReducedMotion();
  return <motion.a href={href} className={`service-feature-card service-feature-card--${tone}`} aria-label={`${title}: ${label}`} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : index * 0.06 }}>
    <div className="service-feature-card__art"><span className="service-feature-card__orb" /><Icon size={31} strokeWidth={1.2} /><span className="service-feature-card__number">{number}</span></div>
    <p className="service-feature-card__label">{label}</p><h3>{title}</h3><p className="service-feature-card__description">{description}</p>
    <span className="service-feature-card__action">{tone === "property" ? "Explore property" : tone === "utility" ? "View utility options" : "Ask about this service"}<ArrowRight size={15} aria-hidden="true" /></span>
  </motion.a>;
}
export default function ICOPage() {
  useSEO({ title: "Sovereign Services & Utility Marketplace | OKBOND", description: "Explore the OKBOND service network: hospitality, travel, property discovery and everyday utilities. Services are previews; live provider and payment integrations are not connected.", canonical: "https://orakzaibond.com/ico" });
  return <div className="service-marketplace"><div className="service-marketplace__ambient" aria-hidden="true" /><div className="service-marketplace__wrap">
    <section className="service-hero" aria-labelledby="service-hero-title"><div className="service-hero__copy">
      <p className="service-eyebrow"><span /> OKBOND SOVEREIGN SERVICES</p><h1 id="service-hero-title">Your World.<br /><em>Connected</em> Through OKBOND.</h1>
      <p className="service-hero__lead">Discover premium stays, seamless transportation, property opportunities and everyday services through one connected ecosystem.</p><p className="service-hero__tagline">One Ecosystem. Everyday Essentials. Connected Value.</p>
      <div className="service-hero__actions"><a className="service-button service-button--gold" href="#service-catalog">Explore Services <ArrowDownRight size={16} /></a><a className="service-button service-button--quiet" href="#property-discovery">Explore Properties <ArrowRight size={16} /></a></div>
      <div className="service-hero__assurance"><span><ShieldCheck size={15} /> Built for clarity</span><i /><span><Globe2 size={15} /> One connected vision</span></div>
    </div><GlobeScene /><div className="service-hero__index"><span>OKBOND</span><span>01 — 04 / SERVICE NETWORK</span></div></section>
    <section className="service-intro" id="service-catalog"><div><p className="service-eyebrow"><span /> THE ECOSYSTEM, AT A GLANCE</p><h2>Useful by design.<br /><em>Connected</em> by nature.</h2></div><p>From a journey to a place to call home, explore a curated service network designed to bring everyday essentials into one refined experience.</p></section>
    <section className="service-category-section" aria-labelledby="service-category-title"><div className="service-section-heading"><div><p className="service-eyebrow"><span /> FIND YOUR NEXT STEP</p><h2 id="service-category-title">Services for <em>real life.</em></h2></div><span className="service-count">12 SERVICE CATEGORIES</span></div><div className="service-category-grid">{SERVICES.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div></section>
    <section className="service-featured" aria-labelledby="service-featured-title"><div className="service-section-heading service-section-heading--light"><div><p className="service-eyebrow"><span /> A CLOSER LOOK</p><h2 id="service-featured-title">More than a service.<br /><em>A considered experience.</em></h2></div><p>Four connected experiences. Each with a clear next step and honest availability.</p></div><div className="service-featured-grid">{FEATURED.map(({ number, label, title, description, icon: Icon, tone, href }, index) => <FeaturedCard key={number} {...{ number, label, title, description, Icon, tone, href, index }} />)}</div></section>
    <section className="service-utility-band" id="utility-services" aria-labelledby="service-utility-title"><div className="service-utility-band__icon"><WalletCards size={25} /></div><div className="service-utility-band__copy"><p className="service-eyebrow"><span /> QUICK ACCESS</p><h2 id="service-utility-title">Everyday essentials,<br /><em>one clear starting point.</em></h2><p>Electricity, gas, water, internet, mobile top-ups and receipts are planned for this utility hub.</p></div><div className="service-utility-band__links">{SERVICES.slice(7).map(({ name, icon: Icon, id }) => <a key={id} href={inquiryHref(name)}><Icon size={17} /><span>{name}</span><ChevronRight size={15} /></a>)}</div><p className="service-notice service-notice--wide"><CircleHelp size={15} /> Utility providers and payment services are not connected. This page does not collect account numbers or process bills.</p></section>
    <section className="service-property" id="property-discovery" aria-labelledby="service-property-title"><div className="service-property__art" aria-hidden="true"><div className="service-property__sun" /><div className="service-property__building service-property__building--back" /><div className="service-property__building service-property__building--front"><i /><i /><i /><i /><i /><i /></div><div className="service-property__horizon" /><span className="service-property__coordinates">31° 32' N&nbsp; · &nbsp;74° 21' E</span></div><div className="service-property__copy"><p className="service-eyebrow"><span /> PROPERTY DISCOVERY</p><h2 id="service-property-title">Find space for<br /><em>what’s next.</em></h2><p>Explore the planned property experience: buy or sell, find rentals, or learn about real estate installment concepts—all with clear status and inquiry paths.</p><div className="service-property__actions"><a href={inquiryHref("Property buy and sell")}>Buy or sell <ArrowUpRight size={15} /></a><a href={inquiryHref("Property rentals")}>Discover rentals <ArrowUpRight size={15} /></a><a href={inquiryHref("Real estate installments")}>Installment plans <ArrowUpRight size={15} /></a></div><p className="service-notice"><CircleHelp size={15} /> No live listings, property verification or transaction service is connected.</p></div></section>
    <section className="service-journey" aria-labelledby="service-journey-title"><div className="service-journey__heading"><p className="service-eyebrow"><span /> SIMPLE BY DESIGN</p><h2 id="service-journey-title">A clearer service <em>journey.</em></h2><p>Explore now. Ask a question. Know exactly what is—and isn’t—available.</p></div><div className="service-journey__steps">{[{ icon: Sparkles, title: "Explore", copy: "Browse travel, property and utility categories." }, { icon: CircleHelp, title: "Make an inquiry", copy: "Contact the team to ask about a service." }, { icon: Clock3, title: "Get a clear update", copy: "We’ll clarify availability and next steps." }].map(({ icon: Icon, title, copy }, index) => <article key={title}><span className="service-journey__step-icon"><Icon size={19} /></span><span className="service-journey__step-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p>{index < 2 && <span className="service-journey__connector" />}</article>)}</div></section>
    <section className="service-trust" aria-label="Service transparency"><div className="service-trust__mark"><BadgeCheck size={23} /></div><div><p className="service-eyebrow"><span /> TRANSPARENCY, ALWAYS</p><h2>Know where things stand.</h2><p>These pages are a service-network preview. Hotels, airlines, vehicles, property listings, utility providers and payment gateways are not connected yet. An inquiry is only a request for information—it is not a booking, listing, bill payment or financial transaction.</p></div><div className="service-trust__status"><span />PREVIEW NETWORK</div></section>
    <section className="service-closing"><div className="service-closing__spark"><Sparkles size={20} /></div><p className="service-eyebrow"><span /> EVERYDAY ESSENTIALS, CONNECTED VALUE</p><h2>One ecosystem.<br /><em>A world of possibility.</em></h2><p>Tell us which service you’d like to see next. Our team can share current availability and development updates.</p><a className="service-button service-button--gold" href={inquiryHref("OKBOND service network")}>Start an inquiry <Mail size={16} /></a><span className="service-closing__footnote"><Check size={13} /> No service booking or payment is processed on this page.</span></section>
  </div></div>;
}
