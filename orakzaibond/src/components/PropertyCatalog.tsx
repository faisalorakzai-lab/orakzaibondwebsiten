import { useEffect, useState } from "react";
import { BadgeCheck, Building2, ChevronRight, MapPin, RefreshCw, UsersRound, WalletCards } from "lucide-react";

export type PropertyListing = {
  id: string;
  slug: string;
  title: string;
  city: string;
  location: string;
  description: string;
  propertyType: string;
  bedrooms: number | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  installmentTerms: string | null;
  images: string[];
  publishedAt: string | null;
  verified: boolean;
};
type Filters = { type: string; location: string; bedrooms: string; budgetMin: string; budgetMax: string };

function formatPrice(amount: number, currency: string | null): string {
  if (!currency) return "Price on inquiry";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
  }
}

export default function PropertyCatalog({ filters, onInquire }: { filters: Filters; onInquire: (listing: PropertyListing) => void }) {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/property-listings", { headers: { Accept: "application/json" }, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(result?.listings)) throw new Error("catalog_unavailable");
        if (active) setListings(result.listings as PropertyListing[]);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const location = filters.location.trim().toLocaleLowerCase();
  const minimum = filters.budgetMin ? Number(filters.budgetMin) : null;
  const maximum = filters.budgetMax ? Number(filters.budgetMax) : null;
  const visible = listings.filter((listing) => {
    if (filters.type !== "any" && listing.propertyType !== filters.type) return false;
    if (location && !`${listing.city} ${listing.location}`.toLocaleLowerCase().includes(location)) return false;
    if (filters.bedrooms && (listing.bedrooms === null || listing.bedrooms < Number(filters.bedrooms))) return false;
    if (minimum !== null && (listing.priceAmount === null || listing.priceAmount < minimum)) return false;
    if (maximum !== null && (listing.priceAmount === null || listing.priceAmount > maximum)) return false;
    return true;
  });

  if (loading) return <div className="okbond-workflow__catalog-status" role="status"><RefreshCw aria-hidden="true" className="okbond-workflow__spin-icon" /> Loading verified property listings…</div>;
  if (error) return <div className="okbond-workflow__empty-listings" role="status"><Building2 aria-hidden="true" /><div><strong>Property catalog is not connected</strong><p>Verified listings will appear once the admin-managed catalog and server connection are configured. Nothing is invented or shown as live.</p></div></div>;
  if (visible.length === 0) return <div className="okbond-workflow__empty-listings" role="status"><Building2 aria-hidden="true" /><div><strong>{listings.length === 0 ? "No live property listings are connected" : "No listings match these filters"}</strong><p>{listings.length === 0 ? "No live or sample properties are displayed. Search preferences can still be included in a general inquiry." : "Adjust the filters or ask the team about your requirements."}</p></div></div>;

  return <div className="okbond-workflow__listing-grid" aria-label={`${visible.length} verified properties`}>
    {visible.map((listing) => (
      <article className="okbond-workflow__listing" key={listing.id}>
        {listing.images[0] ? <img className="okbond-workflow__listing-image" src={listing.images[0]} alt={listing.title} loading="lazy" /> : <div className="okbond-workflow__listing-placeholder" aria-label="No property image available"><Building2 aria-hidden="true" /></div>}
        <div className="okbond-workflow__listing-body">
          <span className="okbond-workflow__verified"><BadgeCheck aria-hidden="true" /> Verified listing</span>
          <h4>{listing.title}</h4>
          <p className="okbond-workflow__listing-location"><MapPin aria-hidden="true" /> {[listing.location, listing.city].filter(Boolean).join(", ") || "Location not listed"}</p>
          <p className="okbond-workflow__listing-meta"><span><Building2 aria-hidden="true" /> {listing.propertyType.replaceAll("_", " ")}</span>{listing.bedrooms !== null && <span><UsersRound aria-hidden="true" /> {listing.bedrooms} bedrooms</span>}</p>
          {listing.priceAmount !== null && <p className="okbond-workflow__listing-price"><WalletCards aria-hidden="true" /> {formatPrice(listing.priceAmount, listing.priceCurrency)}</p>}
          {listing.installmentTerms && <p className="okbond-workflow__listing-terms">Installment terms: {listing.installmentTerms}</p>}
          {listing.description && <p className="okbond-workflow__listing-description">{listing.description}</p>}
          <button type="button" className="okbond-workflow__secondary" onClick={() => onInquire(listing)}>Ask about this property <ChevronRight aria-hidden="true" /></button>
        </div>
      </article>
    ))}
  </div>;
}
