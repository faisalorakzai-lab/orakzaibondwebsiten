import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/components/SEO";

const CATEGORY_NAMES: Record<string, string> = {
  featured: "Featured Services",
  financing: "Loans & Financing",
  rentals: "Rent & Leasing",
  bills: "Bill Payments",
  easyload: "Easyload & Mobile",
  government: "Government Payments",
  savings: "Savings & Investment",
  insurance: "Insurance",
  travel: "Travel & Mobility",
  digital: "Digital Products",
};

const CATEGORY_SLUGS = new Set(Object.keys(CATEGORY_NAMES));

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CatalogServicePage({ slug }: { slug: string }) {
  const isCategory = CATEGORY_SLUGS.has(slug);
  const title = isCategory ? CATEGORY_NAMES[slug] : titleFromSlug(slug);
  const eyebrow = isCategory ? "OKBOND SERVICE CATALOG" : "OKBOND SERVICE";
  const description = isCategory
    ? `Explore the ${title.toLowerCase()} catalog for your selected market. Each pathway is request-led and availability is shown plainly.`
    : `${title} is part of the OKBOND service catalog. Submit an inquiry to confirm market availability and the next step.`;

  useSEO({
    title: `${title} | OKBOND Services`,
    description,
    canonical: `https://orakzaibond.com/services/catalog/${slug}`,
  });

  return (
    <main className="catalog-detail-page">
      <header className="catalog-detail-page__header">
        <Link href="/services" className="catalog-detail-page__back">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to services</span>
        </Link>
        <span className="catalog-detail-page__mark">OKBOND</span>
      </header>
      <section className="catalog-detail-page__hero">
        <p className="catalog-detail-page__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="catalog-detail-page__description">{description}</p>
        <div className="catalog-detail-page__actions">
          <a href="#request" className="catalog-detail-page__primary">Start an inquiry <ArrowRight size={16} /></a>
          <Link href="/services" className="catalog-detail-page__secondary">Browse all services</Link>
        </div>
      </section>
      <section className="catalog-detail-page__info" id="request">
        <div>
          <p className="catalog-detail-page__eyebrow">NEXT STEP</p>
          <h2>Clear service information. No forced checkout.</h2>
        </div>
        <div className="catalog-detail-page__points">
          <p><CheckCircle2 size={17} /> Availability is checked against the selected country.</p>
          <p><CheckCircle2 size={17} /> Pricing and integrations are confirmed before any commitment.</p>
          <p><CheckCircle2 size={17} /> Your request is inquiry-led; this page does not take payment.</p>
        </div>
      </section>
    </main>
  );
}
