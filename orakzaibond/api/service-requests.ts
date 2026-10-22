export const config = { runtime: "edge" };

type Category = "hotel" | "transport" | "car-rental" | "property" | "utility";
type RequestBody = {
  category?: Category;
  requestType?: string;
  payload?: Record<string, unknown>;
  submissionId?: string;
  ownerToken?: string;
};

type DbRow = {
  id: string;
  request_ref: string;
  service_category: Category;
  request_type: string;
  payload: Record<string, string>;
  status: string;
  payment_status: string;
  amount: number | null;
  created_at: string;
};

const DEFAULT_SUPABASE_URL = "https://aqjfleanijwtfdfjimwz.supabase.co";
const MAX_BODY_BYTES = 12_000;
const rateWindows = new Map<string, { start: number; count: number }>();
const REQUEST_TYPES: Record<Category, string> = {
  hotel: "stay_inquiry",
  transport: "transport_inquiry",
  "car-rental": "car_rental_inquiry",
  property: "property_inquiry",
  utility: "bill_tracking_inquiry",
};
const FIELD_LIMITS: Record<string, number> = {
  customerName: 120,
  contact: 160,
  destination: 160,
  pickup: 160,
  checkIn: 10,
  checkOut: 10,
  guests: 2,
  rooms: 2,
  travelDate: 10,
  travelTime: 5,
  passengers: 2,
  vehicleCategory: 32,
  returnDate: 10,
  returnTime: 5,
  pickupLocation: 160,
  pickupDate: 10,
  driverRequirement: 32,
  intent: 24,
  propertyType: 40,
  propertyLocation: 120,
  selectedPropertyId: 36,
  selectedPropertyTitle: 180,
  selectedPropertyLocation: 160,
  bedrooms: 2,
  budgetMin: 16,
  budgetMax: 16,
  message: 1000,
  utilityType: 24,
  providerMode: 24,
  providerName: 120,
  accountReferenceSuffix: 4,
  dueDate: 10,
  note: 500,
};

function json(body: unknown, status = 200, origin?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, X-OKBOND-Owner";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname)) return true;
    return parsed.protocol === "https:" && (
      parsed.hostname === "orakzaibond.com" ||
      parsed.hostname === "www.orakzaibond.com" ||
      parsed.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function configured(): { url: string; key: string } | null {
  const key = typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() : undefined;
  if (!key) return null;
  const url = ((typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(url)) return null;
  return { url, key };
}

function isOwnerToken(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

async function hashOwnerToken(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function rateLimited(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const existing = rateWindows.get(ip);
  if (!existing || now - existing.start >= 60_000) {
    rateWindows.set(ip, { start: now, count: 1 });
    return false;
  }
  existing.count += 1;
  return existing.count > 8;
}

function validContact(contact: string): boolean {
  return contact.includes("@")
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    : /^\+?[0-9().\s-]{7,24}$/.test(contact);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function validTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
}

function cleanPayload(input: Record<string, unknown>): Record<string, string> | null {
  const payload: Record<string, string> = {};
  for (const [key, raw] of Object.entries(input)) {
    if (!(key in FIELD_LIMITS) || typeof raw !== "string") return null;
    const value = raw.trim();
    if (value.length > FIELD_LIMITS[key] || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) return null;
    payload[key] = value;
  }
  if (!payload.customerName || payload.customerName.length < 2 || !validContact(payload.contact || "")) return null;
  return payload;
}

function categoryPayloadValid(category: Category, payload: Record<string, string>): boolean {
  const required: Record<Category, string[]> = {
    hotel: ["destination", "checkIn", "checkOut", "guests", "rooms"],
    transport: ["pickup", "destination", "travelDate", "travelTime", "passengers", "vehicleCategory"],
    "car-rental": ["pickupLocation", "pickupDate", "returnDate", "vehicleCategory", "driverRequirement"],
    property: ["intent", "message"],
    utility: ["utilityType", "providerMode", "accountReferenceSuffix"],
  };
  if (required[category].some((key) => !payload[key])) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (category === "hotel") {
    const guests = Number(payload.guests), rooms = Number(payload.rooms);
    if (!validDate(payload.checkIn) || !validDate(payload.checkOut) || payload.checkIn < today || payload.checkOut <= payload.checkIn) return false;
    if (!Number.isInteger(guests) || guests < 1 || guests > 20 || !Number.isInteger(rooms) || rooms < 1 || rooms > 10) return false;
  }
  if (category === "transport") {
    const passengers = Number(payload.passengers);
    if (!validDate(payload.travelDate) || payload.travelDate < today || !validTime(payload.travelTime) || !Number.isInteger(passengers) || passengers < 1 || passengers > 20) return false;
    if (!["standard", "executive", "van", "no-preference"].includes(payload.vehicleCategory)) return false;
    if (payload.returnDate && (!validDate(payload.returnDate) || payload.returnDate < payload.travelDate || !validTime(payload.returnTime || ""))) return false;
  }
  if (category === "car-rental") {
    if (!validDate(payload.pickupDate) || !validDate(payload.returnDate) || payload.pickupDate < today || payload.returnDate <= payload.pickupDate) return false;
    if (!["compact", "sedan", "suv", "van", "no-preference"].includes(payload.vehicleCategory)) return false;
    if (!["with-driver", "self-drive", "no-preference"].includes(payload.driverRequirement)) return false;
  }
  if (category === "property") {
    if (!["buy", "rent", "installments"].includes(payload.intent) || payload.message.length < 10) return false;
    if (payload.selectedPropertyId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.selectedPropertyId)) return false;
    if (payload.propertyType && !["any", "house", "apartment", "commercial", "land"].includes(payload.propertyType)) return false;
    if (payload.bedrooms && (!/^\d+$/.test(payload.bedrooms) || Number(payload.bedrooms) < 1 || Number(payload.bedrooms) > 6)) return false;
    if ((payload.budgetMin && !/^\d+(?:\.\d{1,2})?$/.test(payload.budgetMin)) || (payload.budgetMax && !/^\d+(?:\.\d{1,2})?$/.test(payload.budgetMax))) return false;
    if (payload.budgetMin && payload.budgetMax && Number(payload.budgetMin) > Number(payload.budgetMax)) return false;
  }
  if (category === "utility") {
    if (!["electricity", "gas", "water", "internet", "mobile"].includes(payload.utilityType)) return false;
    if (payload.providerMode !== "manual" || !/^[\p{L}\p{N}]{4}$/u.test(payload.accountReferenceSuffix)) return false;
    if (payload.dueDate && (!validDate(payload.dueDate) || payload.dueDate < today)) return false;
  }
  return true;
}

function publicRecord(row: DbRow) {
  return {
    id: row.id,
    reference: row.request_ref,
    category: row.service_category,
    requestType: row.request_type,
    payload: row.payload,
    status: row.status,
    paymentStatus: row.payment_status,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

async function dbFetch(url: string, key: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin") || undefined;
  if (origin && !isAllowedOrigin(origin)) return json({ error: "origin_not_allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin || "https://orakzaibond.com", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-OKBOND-Owner", "Vary": "Origin" } });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  const supabase = configured();
  if (!supabase) return json({ error: "persistence_not_configured" }, 503, origin);

  const ownerHeader = req.headers.get("x-okbond-owner");
  if (!isOwnerToken(ownerHeader)) return json({ error: "invalid_owner" }, 401, origin);
  const ownerHash = await hashOwnerToken(ownerHeader);
  const tableUrl = `${supabase.url}/rest/v1/service_requests`;

  if (req.method === "GET") {
    const query = new URLSearchParams({
      select: "id,request_ref,service_category,request_type,payload,status,payment_status,amount,created_at",
      owner_token_hash: `eq.${ownerHash}`,
      order: "created_at.desc",
      limit: "100",
    });
    try {
      const response = await dbFetch(`${tableUrl}?${query}`, supabase.key);
      if (!response.ok) return json({ error: "storage_unavailable" }, 502, origin);
      const rows = await response.json() as DbRow[];
      return json({ records: rows.map(publicRecord) }, 200, origin);
    } catch {
      return json({ error: "storage_unavailable" }, 502, origin);
    }
  }

  if (rateLimited(req)) return json({ error: "rate_limited" }, 429, origin);
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: "request_too_large" }, 413, origin);

  let body: RequestBody;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "request_too_large" }, 413, origin);
    body = JSON.parse(raw) as RequestBody;
  } catch {
    return json({ error: "invalid_request" }, 400, origin);
  }
  if (body.ownerToken !== ownerHeader || !isOwnerToken(body.ownerToken)) return json({ error: "invalid_owner" }, 401, origin);
  if (!body.category || !(body.category in REQUEST_TYPES) || body.requestType !== REQUEST_TYPES[body.category]) return json({ error: "invalid_request" }, 400, origin);
  if (!body.submissionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.submissionId)) return json({ error: "invalid_request" }, 400, origin);
  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) return json({ error: "invalid_request" }, 400, origin);
  const payload = cleanPayload(body.payload);
  if (!payload || !categoryPayloadValid(body.category, payload)) return json({ error: "invalid_request" }, 400, origin);

  if (body.category === "property") {
    const selectedPropertyId = payload.selectedPropertyId;
    delete payload.selectedPropertyTitle;
    delete payload.selectedPropertyLocation;
    if (selectedPropertyId) {
      const propertyQuery = new URLSearchParams({
        select: "id,title,city,location",
        id: `eq.${selectedPropertyId}`,
        listing_status: "eq.published",
        verified: "eq.true",
        limit: "1",
      });
      try {
        const verification = await dbFetch(`${supabase.url}/rest/v1/property_listings?${propertyQuery}`, supabase.key);
        if (!verification.ok) return json({ error: "catalog_unavailable" }, 502, origin);
        const matched = await verification.json() as Array<{ id: string; title: string; city: string; location: string }>;
        if (!matched[0]) return json({ error: "property_no_longer_available" }, 409, origin);
        payload.selectedPropertyTitle = matched[0].title;
        payload.selectedPropertyLocation = [matched[0].location, matched[0].city].filter(Boolean).join(", ").slice(0, 160);
      } catch {
        return json({ error: "catalog_unavailable" }, 502, origin);
      }
    } else {
      delete payload.selectedPropertyId;
    }
  }

  const submissionId = body.submissionId.toLowerCase();
  const reference = `OKB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const row = {
    request_ref: reference,
    submission_id: submissionId,
    owner_token_hash: ownerHash,
    service_category: body.category,
    request_type: body.requestType,
    payload,
    status: "pending",
    payment_status: "not_applicable",
    amount: null,
  };

  try {
    const response = await dbFetch(tableUrl, supabase.key, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (response.ok) {
      const inserted = await response.json() as DbRow[];
      if (!Array.isArray(inserted) || !inserted[0]) return json({ error: "storage_unavailable" }, 502, origin);
      return json({ record: publicRecord(inserted[0]) }, 201, origin);
    }

    const providerError = await response.json().catch(() => null) as { code?: string } | null;
    if (response.status === 409 || providerError?.code === "23505") {
      const query = new URLSearchParams({
        select: "id,request_ref,service_category,request_type,payload,status,payment_status,amount,created_at",
        owner_token_hash: `eq.${ownerHash}`,
        submission_id: `eq.${submissionId}`,
        limit: "1",
      });
      const existingResponse = await dbFetch(`${tableUrl}?${query}`, supabase.key);
      if (existingResponse.ok) {
        const existing = await existingResponse.json() as DbRow[];
        if (existing[0]) return json({ record: publicRecord(existing[0]), duplicate: true }, 200, origin);
      }
    }
    return json({ error: "storage_unavailable" }, 502, origin);
  } catch {
    return json({ error: "storage_unavailable" }, 502, origin);
  }
}
