import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/components/SEO";
import { HUB_COUNTRIES, catalogSlug, categoriesForMarket } from "@/data/serviceCatalog";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CatalogServicePage({ slug }: { slug: string }) {
  const savedCode = typeof window !== "undefined" ? window.localStorage.getItem("okbond-service-country") : null;
  const country = HUB_COUNTRIES.find((item) => item.code === savedCode) ?? HUB_COUNTRIES[0];
  const marketCategories = categoriesForMarket(country.code);
  const category = marketCategories.find((item) => item.id === slug);
  const serviceCategory = category ?? marketCategories.find((item) => item.services.some((service) => catalogSlug(service) === slug));
  const matchedService = serviceCategory?.services.find((service) => catalogSlug(service) === slug);
  const title = category?.label ?? matchedService ?? titleFromSlug(slug);
  const eyebrow = category ? "OKBOND SERVICE CATEGORY" : "OKBOND SERVICE";
  const description = category
    ? `Explore ${title.toLowerCase()} in ${country.name}. Each pathway is request-led and market availability is shown plainly.`
    : `${title} is part of the OKBOND service catalog for ${country.name}. Confirm availability and the next step through an inquiry.`;
  const serviceItems = category?.services ?? [title];

  useSEO({
    title: `${title} | OKBOND Services`,
    description,
    canonical: `https://orakzaibond.com/services/catalog/${slug}`,
  });

  return (
    <main className="catalog-detail-page">
      <header className="catalog-detail-page__header">
        <Link href="/services" className="catalog-detail-page__back"><ArrowLeft size={18} aria-hidden="true" /><span>Back to services</span></Link>
        <span className="catalog-detail-page__mark">OKBOND</span>
      </header>
      <section className="catalog-detail-page__hero">
        <p className="catalog-detail-page__eyebrow">{eyebrow} · {country.name}</p>
        <h1>{title}</h1>
        <p className="catalog-detail-page__description">{description}</p>
        <div className="catalog-detail-page__actions"><a href="#request" className="catalog-detail-page__primary">Submit an inquiry <ArrowRight size={16} /></a><Link href="/services" className="catalog-detail-page__secondary">Browse all services</Link></div>
      </section>
      <section className="catalog-detail-page__catalog" aria-label={`${title} service list`}>
        <div className="catalog-detail-page__catalog-heading"><div><p className="catalog-detail-page__eyebrow">{category ? "SERVICES IN THIS CATEGORY" : "SERVICE PATHWAY"}</p><h2>{category ? `${serviceItems.length} services available in ${country.name}` : "Service information"}</h2></div></div>
        <div className="catalog-detail-page__service-grid">{serviceItems.map((service) => <Link key={service} href={`/services/catalog/${catalogSlug(service)}`} className="catalog-detail-page__service-card"><span>{service}</span><ArrowRight size={15} /></Link>)}</div>
      </section>
      <section className="catalog-detail-page__info" id="request">
        <div><p className="catalog-detail-page__eyebrow">NEXT STEP</p><h2>Clear service information. No forced checkout.</h2></div>
        <div className="catalog-detail-page__points"><p><CheckCircle2 size={17} /> Availability is checked against the selected country.</p><p><CheckCircle2 size={17} /> Pricing and integrations are confirmed before any commitment.</p><p><CheckCircle2 size={17} /> Your request is inquiry-led; this page does not take payment.</p></div>
      </section>
    </main>
  );
}
