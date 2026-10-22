import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Droplets,
  Flame,
  Hotel,
  MapPin,
  Printer,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
  Wifi,
  Zap,
} from "lucide-react";
import PropertyCatalog, { type PropertyListing } from "@/components/PropertyCatalog";
import "./ServiceWorkflows.css";

type ServiceCategory = "hotel" | "transport" | "car-rental" | "property" | "utility";
type RequestDraft = {
  category: ServiceCategory;
  requestType: string;
  payload: Record<string, string>;
  submissionId: string;
};
type ServiceRecord = {
  id: string;
  reference: string;
  category: ServiceCategory;
  requestType: string;
  payload: Record<string, string>;
  status: "draft" | "pending" | "confirmed" | "completed" | "failed" | "cancelled";
  paymentStatus: "not_applicable" | "pending" | "paid" | "failed" | "refunded";
  amount: number | null;
  createdAt: string;
};

type ServiceTab = "hotel" | "transport" | "car-rental" | "property" | "utility" | "history";

const OWNER_STORAGE_KEY = "okbond-service-owner-v1";
const UTILITIES = [
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "gas", label: "Gas", icon: Flame },
  { id: "water", label: "Water", icon: Droplets },
  { id: "internet", label: "Internet", icon: Wifi },
  { id: "mobile", label: "Mobile top-up", icon: Smartphone },
] as const;
type UtilityId = (typeof UTILITIES)[number]["id"];
const UTILITY_CONFIG: Record<UtilityId, { providerLabel: string; providerPlaceholder: string; accountLabel: string; accountPlaceholder: string; help: string }> = {
  electricity: { providerLabel: "Electricity supplier / distribution company", providerPlaceholder: "Optional; as printed on the bill", accountLabel: "Electricity consumer / reference number", accountPlaceholder: "Enter the consumer reference", help: "Use the consumer reference shown on your electricity bill." },
  gas: { providerLabel: "Gas utility / distribution company", providerPlaceholder: "Optional; as printed on the bill", accountLabel: "Gas consumer / account number", accountPlaceholder: "Enter the gas account reference", help: "Use the customer or meter reference shown on your gas bill." },
  water: { providerLabel: "Water utility / board", providerPlaceholder: "Optional; as printed on the bill", accountLabel: "Water consumer / connection number", accountPlaceholder: "Enter the water connection reference", help: "Use the consumer or connection reference from your water bill." },
  internet: { providerLabel: "Internet service provider", providerPlaceholder: "Optional; as printed on the bill", accountLabel: "Internet subscriber / account number", accountPlaceholder: "Enter the subscriber reference", help: "Use the subscriber or account reference on your internet bill." },
  mobile: { providerLabel: "Mobile operator", providerPlaceholder: "Optional; as printed on the bill", accountLabel: "Mobile number or account reference", accountPlaceholder: "Enter the mobile/account reference", help: "Use your mobile number or account reference; only its final four characters are stored." },
};

const TABS: { id: ServiceTab; label: string; icon: typeof Hotel }[] = [
  { id: "hotel", label: "Hotel inquiry", icon: Hotel },
  { id: "transport", label: "Transport", icon: CarFront },
  { id: "car-rental", label: "Car rental", icon: CarFront },
  { id: "property", label: "Property", icon: Building2 },
  { id: "utility", label: "Utilities", icon: Zap },
  { id: "history", label: "My requests", icon: ReceiptText },
];

function getOwnerToken(): string {
  let token = window.localStorage.getItem(OWNER_STORAGE_KEY);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(OWNER_STORAGE_KEY, token);
  }
  return token;
}

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function contactLooksValid(value: string): boolean {
  const contact = value.trim();
  if (contact.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  return /^\+?[0-9().\s-]{7,24}$/.test(contact);
}

function toPayload(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value).trim()]),
  );
}

function LabelField({
  label,
  icon: Icon,
  children,
  required = false,
  className = "",
}: {
  label: string;
  name?: string;
  icon?: typeof MapPin;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`okbond-workflow__field ${className}`}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <span className="okbond-workflow__input-wrap">
        {Icon && <Icon aria-hidden="true" />}
        {children}
      </span>
    </label>
  );
}

function ContactFields() {
  return (
    <>
      <LabelField label="Your name" name="customerName" icon={BadgeCheck} required>
        <input name="customerName" autoComplete="name" minLength={2} maxLength={120} required placeholder="Full name" />
      </LabelField>
      <LabelField label="Email or phone" name="contact" icon={Smartphone} required>
        <input name="contact" autoComplete="email" maxLength={160} required placeholder="How should we reach you?" />
      </LabelField>
    </>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="okbond-workflow__error" role="alert">{children}</p>;
}

export default function ServiceWorkflows() {
  const [activeTab, setActiveTab] = useState<ServiceTab>("hotel");
  const [review, setReview] = useState<RequestDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successRecord, setSuccessRecord] = useState<ServiceRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [propertyIntent, setPropertyIntent] = useState("buy");
  const [propertyFilters, setPropertyFilters] = useState({ type: "any", location: "", bedrooms: "", budgetMin: "", budgetMax: "" });
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [utilityType, setUtilityType] = useState<(typeof UTILITIES)[number]["id"]>("electricity");
  const [roundTrip, setRoundTrip] = useState(false);
  const [recordLoaded, setRecordLoaded] = useState(false);

  useEffect(() => {
    if (activeTab !== "history") return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError("");
    const run = async () => {
      try {
        const response = await fetch("/api/service-requests", {
          method: "GET",
          headers: { "x-okbond-owner": getOwnerToken() },
          cache: "no-store",
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error === "persistence_not_configured"
          ? "Request storage is not configured yet. No server-side request history is available."
          : "We could not load your saved requests. Please try again later.");
        if (!cancelled) {
          setRecords(Array.isArray(body.records) ? body.records : []);
          setRecordLoaded(true);
        }
      } catch (error) {
        if (!cancelled) setHistoryError(error instanceof Error ? error.message : "Request history is temporarily unavailable.");
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [activeTab]);

  const prepareReview = (event: FormEvent<HTMLFormElement>, category: ServiceCategory, requestType: string) => {
    event.preventDefault();
    setFormError("");
    setSuccessRecord(null);
    const payload = toPayload(event.currentTarget);

    if (!contactLooksValid(payload.contact ?? "")) {
      setFormError("Enter a valid email address or phone number so the team can reply.");
      return;
    }
    if ((payload.customerName ?? "").trim().length < 2) {
      setFormError("Enter your name (at least 2 characters).");
      return;
    }

    if (category === "hotel") {
      if (payload.checkIn < todayISO()) {
        setFormError("Check-in must be today or a future date.");
        return;
      }
      if (payload.checkOut <= payload.checkIn) {
        setFormError("Check-out must be after check-in.");
        return;
      }
    }
    if (category === "transport") {
      if (payload.travelDate < todayISO()) {
        setFormError("Travel date must be today or a future date.");
        return;
      }
      if (roundTrip && payload.returnDate && payload.returnDate < payload.travelDate) {
        setFormError("Return date cannot be before the departure date.");
        return;
      }
    }
    if (category === "car-rental") {
      if (payload.pickupDate < todayISO()) {
        setFormError("Pickup date must be today or a future date.");
        return;
      }
      if (payload.returnDate <= payload.pickupDate) {
        setFormError("Return date must be after pickup date.");
        return;
      }
    }
    if (category === "property" && payload.budgetMin && payload.budgetMax && Number(payload.budgetMin) > Number(payload.budgetMax)) {
      setFormError("Maximum budget must be greater than or equal to minimum budget.");
      return;
    }
    if (category === "utility") {
      if (payload.accountReference) {
        const trimmed = payload.accountReference.replace(/\s+/g, "");
        payload.accountReferenceSuffix = trimmed.slice(-4);
        delete payload.accountReference;
      }
      payload.utilityType = utilityType;
    }
    setReview({ category, requestType, payload, submissionId: window.crypto.randomUUID() });
  };

  const submitReviewedRequest = async () => {
    if (!review || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-okbond-owner": getOwnerToken() },
        body: JSON.stringify({ ...review, ownerToken: getOwnerToken() }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (body.error === "persistence_not_configured") {
          throw new Error("Server-side request storage is not configured. Your information was not submitted or saved; please contact support@orakzaibond.com or try again later.");
        }
        if (body.error === "duplicate_submission") throw new Error("This request has already been received. Check My requests before submitting again.");
        throw new Error(body.error === "invalid_request"
          ? "Some request details could not be validated. Review the form and try again."
          : "We could not save your request. Nothing was marked as booked or paid; please try again later.");
      }
      const saved = body.record as ServiceRecord;
      if (!saved?.reference) throw new Error("The server response could not be verified. Please check My requests before retrying.");
      setSuccessRecord(saved);
      setRecords((existing) => [saved, ...existing.filter((record) => record.reference !== saved.reference)]);
      setRecordLoaded(true);
      setReview(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Your request could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReview = () => { setReview(null); setFormError(""); };

  return (
    <section className="okbond-workflow" id="service-workflows" aria-labelledby="service-workflow-title">
      <div className="okbond-workflow__container">
        <header className="okbond-workflow__header">
          <div>
            <p className="okbond-workflow__eyebrow"><span /> SERVICE WORKFLOWS</p>
            <h2 id="service-workflow-title">A clear request.<br /><em>An honest next step.</em></h2>
            <p>Search, filter, and prepare service inquiries. No booking, payment, listing, or utility-provider integration is implied.</p>
          </div>
          <span className="okbond-workflow__status"><ShieldCheck aria-hidden="true" /> Inquiry only</span>
        </header>

        <div className="okbond-workflow__tabs" role="tablist" aria-orientation="horizontal" aria-label="Choose a service workflow">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" tabIndex={activeTab === id ? 0 : -1} aria-selected={activeTab === id} aria-controls="service-workflow-panel" id={`service-workflow-tab-${id}`} className={activeTab === id ? "is-active" : ""} onClick={() => { setActiveTab(id); setReview(null); setSuccessRecord(null); setFormError(""); }} onKeyDown={(event) => {
              if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const index = TABS.findIndex((tab) => tab.id === id);
              const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
              const nextId = TABS[next].id;
              setActiveTab(nextId);
              setReview(null);
              setSuccessRecord(null);
              setFormError("");
              requestAnimationFrame(() => document.getElementById(`service-workflow-tab-${nextId}`)?.focus());
            }}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>

        <div className="okbond-workflow__panel" id="service-workflow-panel" role="tabpanel" aria-labelledby={`service-workflow-tab-${activeTab}`}>
          <div className="okbond-workflow__content">
            {successRecord ? (
              <div className="okbond-workflow__success" role="status" aria-live="polite">
                <span className="okbond-workflow__success-icon"><Check aria-hidden="true" /></span>
                <p className="okbond-workflow__eyebrow"><span /> REQUEST SAVED</p>
                <h3>Your inquiry is recorded.</h3>
                <p>Reference <strong>{successRecord.reference}</strong> · {formatDate(successRecord.createdAt)}</p>
                <p className="okbond-workflow__disclosure">Status: Pending response. This is not a booking confirmation or payment receipt.</p>
                <button type="button" className="okbond-workflow__primary" onClick={() => { setSuccessRecord(null); setActiveTab("history"); }}>View request history <ArrowRight aria-hidden="true" /></button>
              </div>
            ) : review ? (
              <div className="okbond-workflow__review">
                <p className="okbond-workflow__eyebrow"><span /> REVIEW BEFORE SUBMISSION</p>
                <h3>Check your request details</h3>
                <p className="okbond-workflow__review-intro">Your details will be sent as an inquiry. No supplier booking or bill payment will be made.</p>
                <dl>{Object.entries(review.payload).filter(([key, value]) => value && key !== "requestType").map(([key, value]) => (
                  <div key={key}><dt>{key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</dt><dd>{key === "accountReferenceSuffix" ? `•••• ${value}` : value}</dd></div>
                ))}</dl>
                <p className="okbond-workflow__privacy"><ShieldCheck aria-hidden="true" /> Account references are reduced to their last four characters before submission. Never provide a PIN, password, seed phrase, or private key.</p>
                {formError && <FieldError>{formError}</FieldError>}
                <div className="okbond-workflow__review-actions">
                  <button type="button" className="okbond-workflow__secondary" onClick={cancelReview}>Edit details</button>
                  <button type="button" className="okbond-workflow__primary" onClick={() => void submitReviewedRequest()} disabled={submitting}>
                    {submitting ? <><span className="okbond-workflow__spinner" /> Saving request…</> : <>Submit inquiry <ArrowRight aria-hidden="true" /></>}
                  </button>
                </div>
              </div>
            ) : activeTab === "history" ? (
              <div className="okbond-workflow__history">
                <p className="okbond-workflow__eyebrow"><span /> REQUESTS &amp; RECEIPTS</p>
                <h3>Your service history</h3>
                <p className="okbond-workflow__subtext">Only server-confirmed records appear here. A pending inquiry is not a reservation or paid transaction.</p>
                {historyLoading && <p className="okbond-workflow__inline-status"><span className="okbond-workflow__spinner" /> Loading records…</p>}
                {historyError && <FieldError>{historyError}</FieldError>}
                {!historyLoading && !historyError && recordLoaded && records.length === 0 && (
                  <div className="okbond-workflow__empty-history"><ReceiptText aria-hidden="true" /><strong>No saved requests yet</strong><p>Once a request is successfully saved, its reference and status will appear here.</p></div>
                )}
                {!historyLoading && !historyError && records.length > 0 && <div className="okbond-workflow__records">
                  {records.map((record) => (
                    <article className="okbond-workflow__record" key={record.reference}>
                      <div className="okbond-workflow__record-top"><span>{record.reference}</span><span className={`okbond-workflow__pill okbond-workflow__pill--${record.status}`}>{record.status}</span></div>
                      <h4>{record.category.replaceAll("-", " ")} · {record.requestType.replaceAll("_", " ")}</h4>
                      <p>Created {formatDate(record.createdAt)}</p>
                      <p>Payment status: <strong>{record.paymentStatus.replaceAll("_", " ")}</strong>{record.amount !== null ? ` · Amount: ${record.amount}` : " · No payment recorded"}</p>
                      {record.status === "completed" && record.paymentStatus === "paid" && <button type="button" className="okbond-workflow__print" onClick={() => window.print()}><Printer aria-hidden="true" /> Print verified receipt</button>}
                    </article>
                  ))}
                </div>}
                {!recordLoaded && !historyLoading && !historyError && <div className="okbond-workflow__empty-history"><CircleHelp aria-hidden="true" /><strong>History will appear after storage is connected</strong><p>There are no locally fabricated or sample transactions on this page.</p></div>}
              </div>
            ) : activeTab === "hotel" ? (
              <form className="okbond-workflow__form" onSubmit={(event) => prepareReview(event, "hotel", "stay_inquiry")}>
                <p className="okbond-workflow__eyebrow"><span /> HOTEL INQUIRY CENTER</p>
                <h3>Plan a stay inquiry</h3>
                <p className="okbond-workflow__subtext">Hotel inventory and reservations are not connected. Share your trip details for an inquiry; no live availability will be shown.</p>
                <div className="okbond-workflow__grid">
                  <LabelField label="Destination or city" icon={MapPin} className="is-wide" required><input name="destination" autoComplete="address-level2" minLength={2} maxLength={120} required placeholder="City or destination" /></LabelField>
                  <LabelField label="Check-in" icon={CalendarDays} required><input name="checkIn" type="date" min={todayISO()} required /></LabelField>
                  <LabelField label="Check-out" icon={CalendarDays} required><input name="checkOut" type="date" min={todayISO()} required /></LabelField>
                  <LabelField label="Guests" icon={UsersRound} required><input name="guests" type="number" min="1" max="20" defaultValue="2" required /></LabelField>
                  <LabelField label="Rooms" icon={Building2} required><input name="rooms" type="number" min="1" max="10" defaultValue="1" required /></LabelField>
                  <ContactFields />
                </div>
                {formError && <FieldError>{formError}</FieldError>}
                <div className="okbond-workflow__form-footer"><p><CircleHelp aria-hidden="true" /> Search sends an inquiry only; it does not check inventory.</p><button type="submit" className="okbond-workflow__primary"><Search aria-hidden="true" /> Review hotel inquiry <ArrowRight aria-hidden="true" /></button></div>
              </form>
            ) : activeTab === "transport" ? (
              <form className="okbond-workflow__form" onSubmit={(event) => prepareReview(event, "transport", "transport_inquiry")}>
                <p className="okbond-workflow__eyebrow"><span /> TRANSPORT INQUIRY</p>
                <h3>Describe your journey</h3>
                <p className="okbond-workflow__subtext">No operators, fare estimates, tracking, or vehicle availability are connected. This request is not a confirmed ride.</p>
                <div className="okbond-workflow__grid">
                  <LabelField label="Pickup location" icon={MapPin} required><input name="pickup" autoComplete="street-address" minLength={2} maxLength={160} required placeholder="Address, airport, or location" /></LabelField>
                  <LabelField label="Destination" icon={MapPin} required><input name="destination" minLength={2} maxLength={160} required placeholder="Where are you going?" /></LabelField>
                  <LabelField label="Travel date" icon={CalendarDays} required><input name="travelDate" type="date" min={todayISO()} required /></LabelField>
                  <LabelField label="Travel time" icon={Clock3} required><input name="travelTime" type="time" required /></LabelField>
                  <LabelField label="Passengers" icon={UsersRound} required><input name="passengers" type="number" min="1" max="20" defaultValue="1" required /></LabelField>
                  <LabelField label="Vehicle category" icon={CarFront} required><select name="vehicleCategory" defaultValue="" required><option value="" disabled>Select a preference</option><option value="standard">Standard</option><option value="executive">Executive</option><option value="van">Van / group</option><option value="no-preference">No preference</option></select></LabelField>
                  <label className="okbond-workflow__check is-wide"><input type="checkbox" checked={roundTrip} onChange={(event) => setRoundTrip(event.target.checked)} /> <span>Request an optional return journey</span></label>
                  {roundTrip && <><LabelField label="Return date" icon={CalendarDays}><input name="returnDate" type="date" min={todayISO()} required /></LabelField><LabelField label="Return time" icon={Clock3}><input name="returnTime" type="time" required /></LabelField></>}
                  <ContactFields />
                </div>
                {formError && <FieldError>{formError}</FieldError>}
                <div className="okbond-workflow__form-footer"><p><CircleHelp aria-hidden="true" /> Review details before an inquiry is sent.</p><button type="submit" className="okbond-workflow__primary">Review transport request <ArrowRight aria-hidden="true" /></button></div>
              </form>
            ) : activeTab === "car-rental" ? (
              <form className="okbond-workflow__form" onSubmit={(event) => prepareReview(event, "car-rental", "car_rental_inquiry")}>
                <p className="okbond-workflow__eyebrow"><span /> RENT A CAR INQUIRY</p>
                <h3>Tell us what you need</h3>
                <p className="okbond-workflow__subtext">Rental inventory and driver services are not configured. Your request is not a vehicle reservation.</p>
                <div className="okbond-workflow__grid">
                  <LabelField label="Pickup location" icon={MapPin} className="is-wide" required><input name="pickupLocation" autoComplete="address-level2" minLength={2} maxLength={160} required placeholder="City, airport, or location" /></LabelField>
                  <LabelField label="Pickup date" icon={CalendarDays} required><input name="pickupDate" type="date" min={todayISO()} required /></LabelField>
                  <LabelField label="Return date" icon={CalendarDays} required><input name="returnDate" type="date" min={todayISO()} required /></LabelField>
                  <LabelField label="Vehicle category" icon={CarFront} required><select name="vehicleCategory" defaultValue="" required><option value="" disabled>Select a preference</option><option value="compact">Compact</option><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="van">Van / group</option><option value="no-preference">No preference</option></select></LabelField>
                  <LabelField label="Driver preference" icon={BadgeCheck} required><select name="driverRequirement" defaultValue="" required><option value="" disabled>Select a preference</option><option value="with-driver">With driver</option><option value="self-drive">Self-drive (subject to eligibility)</option><option value="no-preference">No preference</option></select></LabelField>
                  <ContactFields />
                </div>
                {formError && <FieldError>{formError}</FieldError>}
                <div className="okbond-workflow__form-footer"><p><CircleHelp aria-hidden="true" /> No availability or fare is confirmed.</p><button type="submit" className="okbond-workflow__primary">Review car-rental inquiry <ArrowRight aria-hidden="true" /></button></div>
              </form>
            ) : activeTab === "property" ? (
              <div className="okbond-workflow__property">
                <p className="okbond-workflow__eyebrow"><span /> PROPERTY DISCOVERY</p>
                <h3>Filter what you’re looking for</h3>
                <p className="okbond-workflow__subtext">Use these filters to describe your interest. No live property inventory or verified listing catalog is currently connected.</p>
                <div className="okbond-workflow__grid okbond-workflow__filters">
                  <LabelField label="Purchase or rental path" icon={Building2}><select value={propertyIntent} onChange={(event) => setPropertyIntent(event.target.value)}><option value="buy">Buy</option><option value="rent">Rent</option><option value="installments">Installment-based</option></select></LabelField>
                  <LabelField label="Property type" icon={Building2}><select name="propertyType" value={propertyFilters.type} onChange={(event) => setPropertyFilters((current) => ({ ...current, type: event.target.value }))}><option value="any">Any type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="commercial">Commercial</option><option value="land">Land</option></select></LabelField>
                  <LabelField label="City or location" icon={MapPin}><input name="propertyLocation" value={propertyFilters.location} onChange={(event) => setPropertyFilters((current) => ({ ...current, location: event.target.value }))} autoComplete="address-level2" maxLength={120} placeholder="City or neighbourhood" /></LabelField>
                  <LabelField label="Bedrooms" icon={UsersRound}><select name="bedrooms" value={propertyFilters.bedrooms} onChange={(event) => setPropertyFilters((current) => ({ ...current, bedrooms: event.target.value }))}><option value="">Any</option>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}{count === 6 ? "+" : ""}</option>)}</select></LabelField>
                  <LabelField label="Budget minimum (local currency)" icon={WalletCards}><input name="budgetMin" type="number" min="0" step="1" value={propertyFilters.budgetMin} onChange={(event) => setPropertyFilters((current) => ({ ...current, budgetMin: event.target.value }))} placeholder="Optional" /></LabelField>
                  <LabelField label="Budget maximum (local currency)" icon={WalletCards}><input name="budgetMax" type="number" min="0" step="1" value={propertyFilters.budgetMax} onChange={(event) => setPropertyFilters((current) => ({ ...current, budgetMax: event.target.value }))} placeholder="Optional" /></LabelField>
                </div>
                <PropertyCatalog filters={propertyFilters} onInquire={(listing) => {
                  setSelectedProperty(listing);
                  requestAnimationFrame(() => document.getElementById("property-inquiry-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
                }} />
                <form id="property-inquiry-form" className="okbond-workflow__form okbond-workflow__property-inquiry" onSubmit={(event) => prepareReview(event, "property", "property_inquiry")}>
                  <h4>Ask about property options</h4>
                  <p>{selectedProperty ? `Selected verified listing: ${selectedProperty.title} · ${[selectedProperty.location, selectedProperty.city].filter(Boolean).join(", ")}` : "No property selected. This is a general inquiry only."}</p>
                  <input type="hidden" name="intent" value={propertyIntent} />
                  <input type="hidden" name="selectedPropertyId" value={selectedProperty?.id || ""} />
                  <input type="hidden" name="selectedPropertyTitle" value={selectedProperty?.title || ""} />
                  <input type="hidden" name="selectedPropertyLocation" value={[selectedProperty?.location, selectedProperty?.city].filter(Boolean).join(", ")} />
                  <input type="hidden" name="propertyType" value={propertyFilters.type} />
                  <input type="hidden" name="propertyLocation" value={propertyFilters.location} />
                  <input type="hidden" name="bedrooms" value={propertyFilters.bedrooms} />
                  <input type="hidden" name="budgetMin" value={propertyFilters.budgetMin} />
                  <input type="hidden" name="budgetMax" value={propertyFilters.budgetMax} />
                  <ContactFields />
                  <LabelField label="What are you looking for?" icon={Building2} className="is-wide" required><textarea name="message" minLength={10} maxLength={1000} required placeholder="Share a location, budget, property type, or timeline." /></LabelField>
                  {formError && <FieldError>{formError}</FieldError>}
                  <div className="okbond-workflow__form-footer"><p><CircleHelp aria-hidden="true" /> We will not present sample listings as real.</p><button type="submit" className="okbond-workflow__primary">Review property inquiry <ArrowRight aria-hidden="true" /></button></div>
                </form>
              </div>
            ) : (
              <form className="okbond-workflow__form" onSubmit={(event) => prepareReview(event, "utility", "bill_tracking_inquiry")}>
                <p className="okbond-workflow__eyebrow"><span /> UTILITY BILL CENTER</p>
                <h3>Track a bill inquiry</h3>
                <p className="okbond-workflow__subtext">Inquiry only. Payment integration is required for live billing. No provider or balance lookup is connected; provide only your last-four-masked account reference.</p>
                <div className="okbond-workflow__utility-types" role="group" aria-label="Utility category">
                  {UTILITIES.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={utilityType === id ? "is-active" : ""} aria-pressed={utilityType === id} onClick={() => setUtilityType(id)}><Icon aria-hidden="true" />{label}</button>)}
                </div>
                <div className="okbond-workflow__grid">
                  <LabelField label="Utility type" icon={Zap} required><select name="utilityType" value={utilityType} onChange={(event) => setUtilityType(event.target.value as typeof utilityType)}>{UTILITIES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select></LabelField>
                  <LabelField label="Provider selector" icon={ChevronRight} required><select name="providerMode" defaultValue="manual"><option value="manual">Manual inquiry — no providers connected</option></select></LabelField>
                  <LabelField label={UTILITY_CONFIG[utilityType].providerLabel} icon={Building2} className="is-wide"><input name="providerName" maxLength={120} placeholder={UTILITY_CONFIG[utilityType].providerPlaceholder} /></LabelField>
                  <LabelField label={UTILITY_CONFIG[utilityType].accountLabel} icon={CreditCard} className="is-wide" required><input name="accountReference" autoComplete="off" inputMode="text" minLength={4} maxLength={64} required placeholder={UTILITY_CONFIG[utilityType].accountPlaceholder} /></LabelField>
                  <LabelField label="Bill due date (optional)" icon={CalendarDays}><input name="dueDate" type="date" min={todayISO()} /></LabelField>
                  <LabelField label={UTILITY_CONFIG[utilityType].help} icon={CircleHelp} className="is-wide"><textarea name="note" maxLength={500} placeholder="Optional context for the service team" /></LabelField>
                  <ContactFields />
                </div>
                <p className="okbond-workflow__privacy"><ShieldCheck aria-hidden="true" /> Only the last four characters of the account reference are stored. Never enter an OTP, PIN, password, or payment-card details.</p>
                {formError && <FieldError>{formError}</FieldError>}
                <div className="okbond-workflow__form-footer"><p><CircleHelp aria-hidden="true" /> No provider lookup, balance, or payment confirmation.</p><button type="submit" className="okbond-workflow__primary">Review bill inquiry <ArrowRight aria-hidden="true" /></button></div>
              </form>
            )}
          </div>
          <aside className="okbond-workflow__aside">
            <span className="okbond-workflow__aside-icon"><ShieldCheck aria-hidden="true" /></span>
            <p className="okbond-workflow__eyebrow"><span /> CLEAR STATUS, ALWAYS</p>
            <h3>Inquiries aren’t transactions.</h3>
            <p>Hotel, transport, car-rental, property, and utility requests remain <strong>Pending</strong> until the team responds. No payment is taken and no booking is confirmed.</p>
            <div className="okbond-workflow__aside-row"><Clock3 aria-hidden="true" /><span>Created only after server confirmation</span></div>
            <div className="okbond-workflow__aside-row"><ReceiptText aria-hidden="true" /><span>Printable receipts only for verified paid completions</span></div>
            <div className="okbond-workflow__aside-row"><ShieldCheck aria-hidden="true" /><span>Wallet connection alone is never treated as payment evidence</span></div>
          </aside>
        </div>

        <p className="okbond-workflow__footnote"><CircleHelp aria-hidden="true" /> Private request history uses a random browser access key. Clearing this browser’s site data will remove access to that history. Do not submit confidential account credentials.</p>
      </div>
    </section>
  );
}
