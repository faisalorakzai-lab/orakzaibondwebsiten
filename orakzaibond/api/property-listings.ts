export const config = { runtime: "edge" };

const DEFAULT_SUPABASE_URL = "https://aqjfleanijwtfdfjimwz.supabase.co";
function originAllowed(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) return true;
    return url.protocol === "https:" && (
      url.hostname === "orakzaibond.com" ||
      url.hostname === "www.orakzaibond.com" ||
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}
function json(body: unknown, status = 200, origin?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (origin && originAllowed(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}
export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin") || undefined;
  if (origin && !originAllowed(origin)) return json({ error: "origin_not_allowed" }, 403, origin);
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405, origin);
  const key = typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() : undefined;
  if (!key) return json({ error: "catalog_not_configured" }, 503, origin);
  const supabaseUrl = ((typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(supabaseUrl)) return json({ error: "catalog_not_configured" }, 503, origin);

  const query = new URLSearchParams({
    select: "id,slug,title,city,location,description,property_type,bedrooms,price_amount,price_currency,installment_terms,image_urls,published_at,verified",
    listing_status: "eq.published",
    verified: "eq.true",
    order: "published_at.desc",
    limit: "50",
  });
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/property_listings?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!response.ok) return json({ error: "catalog_unavailable" }, 502, origin);
    const rows = await response.json() as Array<Record<string, unknown>>;
    const listings = rows.map((row) => ({
      id: String(row.id || ""),
      slug: String(row.slug || ""),
      title: String(row.title || ""),
      city: String(row.city || ""),
      location: String(row.location || ""),
      description: String(row.description || ""),
      propertyType: String(row.property_type || ""),
      bedrooms: typeof row.bedrooms === "number" ? row.bedrooms : null,
      priceAmount: typeof row.price_amount === "number" ? row.price_amount : null,
      priceCurrency: typeof row.price_currency === "string" ? row.price_currency : null,
      installmentTerms: typeof row.installment_terms === "string" ? row.installment_terms : null,
      images: Array.isArray(row.image_urls) ? row.image_urls.filter((url): url is string => typeof url === "string" && url.startsWith("https://")).slice(0, 8) : [],
      publishedAt: typeof row.published_at === "string" ? row.published_at : null,
      verified: row.verified === true,
    })).filter((listing) => listing.id && listing.title && listing.verified);
    return json({ listings }, 200, origin);
  } catch {
    return json({ error: "catalog_unavailable" }, 502, origin);
  }
}
