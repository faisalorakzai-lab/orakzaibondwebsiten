import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/components/SEO";
import { HUB_COUNTRIES, categoriesForMarket, catalogSlug } from "@/data/serviceCatalog";

export default function AllServicesPage() {
  const initialCode = typeof window !== "undefined" ? window.localStorage.getItem("okbond-service-country") ?? "PK" : "PK";
  const [countryCode, setCountryCode] = useState(initialCode);
  const [query, setQuery] = useState("");
  const country = HUB_COUNTRIES.find((item) => item.code === countryCode) ?? HUB_COUNTRIES[0];
  const categories = categoriesForMarket(country.code);
  const filteredCategories = categories.map((category) => ({
    ...category,
    services: category.services.filter((service) => `${category.label} ${service}`.toLowerCase().includes(query.toLowerCase())),
  })).filter((category) => category.services.length > 0 || category.label.toLowerCase().includes(query.toLowerCase()));

  useSEO({
    title: "All Services | OKBOND",
    description: `Browse all OKBOND service categories and services available for ${country.name}.`,
    canonical: "https://orakzaibond.com/services/all",
  });

  const chooseCountry = (code: string) => {
    setCountryCode(code);
    try { window.localStorage.setItem("okbond-service-country", code); } catch { /* storage may be unavailable */ }
  };

  return (
    <main className="all-services-page">
      <header className="all-services-page__header">
        <Link href="/services" className="all-services-page__back"><ArrowLeft size={18} /> <span>Services</span></Link>
        <h1>All Services</h1>
        <span className="all-services-page__mark">OKBOND</span>
      </header>
      <section className="all-services-page__toolbar">
        <p>Every category. Every service pathway.</p>
        <div className="all-services-page__filters">
          <label className="all-services-page__search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" aria-label="Search all services" /></label>
          <select value={country.code} onChange={(event) => chooseCountry(event.target.value)} aria-label="Select country">{HUB_COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}</select>
        </div>
      </section>
      <p className="all-services-page__market">{country.flag} {country.name} · {categories.reduce((total, category) => total + category.services.length, 0)} service pathways</p>
      <section className="all-services-page__categories" aria-label="All service categories">
        {filteredCategories.map(({ id, label, icon: Icon, services }) => <article key={id} className="all-services-category"><div className="all-services-category__heading"><span className="all-services-category__icon"><Icon size={20} /></span><div><h2>{label}</h2><span>{services.length} services</span></div><Link href={`/services/catalog/${id}`} aria-label={`Open ${label} category`}><ArrowRight size={18} /></Link></div><div className="all-services-category__grid">{services.map((service) => <Link key={service} href={`/services/catalog/${catalogSlug(service)}`} className="all-services-item"><span className="all-services-item__icon"><Icon size={15} /></span><span>{service}</span><ArrowRight size={13} /></Link>)}</div></article>)}
      </section>
      {filteredCategories.length === 0 && <p className="all-services-page__empty">No service matched “{query}” in {country.name}.</p>}
    </main>
  );
}
