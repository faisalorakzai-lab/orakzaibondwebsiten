import { useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CarFront,
  CreditCard,
  Droplets,
  Flame,
  Hotel,
  MapPin,
  Search,
  Smartphone,
  UsersRound,
  Wifi,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./UtilityExplorer.css";

type CategoryId = "stays" | "properties" | "transport" | "utilities";

type Category = {
  id: CategoryId;
  label: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  sceneLabel: string;
  sceneDescription: string;
  notice: string;
};

const CATEGORIES: Category[] = [
  {
    id: "stays",
    label: "Hotels & Stays",
    eyebrow: "STAYS & TRAVEL",
    description:
      "A first look at finding a place to stay. Choose a destination and travel dates to explore the concept.",
    icon: Hotel,
    sceneLabel: "A considered stay",
    sceneDescription: "Illustrated hotel architecture",
    notice:
      "Preview only — hotel inventory and booking are not connected, so no availability or reservation is being checked.",
  },
  {
    id: "properties",
    label: "Properties",
    eyebrow: "REAL ESTATE",
    description:
      "Explore a future property discovery experience with location, property type, and sale or rent filters.",
    icon: Building2,
    sceneLabel: "Space to call home",
    sceneDescription: "Illustrated residential architecture",
    notice:
      "Preview only — there are no live property listings or transaction services connected.",
  },
  {
    id: "transport",
    label: "Transport",
    eyebrow: "MOBILITY",
    description:
      "Choose a travel mode and enter a route to preview how an OKBOND mobility search could begin.",
    icon: CarFront,
    sceneLabel: "Move with ease",
    sceneDescription: "Illustrated route and vehicle",
    notice:
      "Preview only — this does not request a vehicle or show live routes, tracking, or availability.",
  },
  {
    id: "utilities",
    label: "Utility Payments",
    eyebrow: "EVERYDAY SERVICES",
    description:
      "Browse everyday bill categories in a clear, simple interface built for future payment services.",
    icon: Zap,
    sceneLabel: "Everyday, connected",
    sceneDescription: "Illustrated utility network",
    notice:
      "Preview only — no bill details are submitted and no payment providers or OKBOND token payments are connected.",
  },
];

const UTILITY_TYPES = [
  { label: "Electricity", icon: Zap },
  { label: "Gas", icon: Flame },
  { label: "Water", icon: Droplets },
  { label: "Internet", icon: Wifi },
  { label: "Mobile", icon: Smartphone },
];

function ConceptScene({ category }: { category: Category }) {
  return (
    <div
      className={`okbond-explorer__scene okbond-explorer__scene--${category.id}`}
      role="img"
      aria-label={`${category.sceneDescription} concept artwork`}
    >
      <div className="okbond-explorer__scene-glow" />
      <div className="okbond-explorer__scene-grid" />
      <svg
        className="okbond-explorer__illustration"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="explorer-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#25251c" />
            <stop offset="0.56" stopColor="#10120f" />
            <stop offset="1" stopColor="#080a09" />
          </linearGradient>
          <linearGradient id="explorer-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1d38d" stopOpacity=".78" />
            <stop offset="1" stopColor="#a27a35" stopOpacity=".08" />
          </linearGradient>
          <linearGradient id="explorer-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#caa85e" stopOpacity=".28" />
            <stop offset="1" stopColor="#9b793a" stopOpacity=".035" />
          </linearGradient>
        </defs>
        <rect width="720" height="520" fill="url(#explorer-sky)" />
        <circle cx="523" cy="116" r="102" fill="#c8a65d" opacity=".075" />
        <path
          d="M0 321C112 274 178 300 275 272c92-26 160-21 238 10 75 30 124 30 207 3v235H0Z"
          fill="#111411"
        />
        <path
          d="M0 383c111-25 192-22 299-6 143 22 258 16 421-20v163H0Z"
          fill="#090c0a"
        />
        {category.id === "stays" && (
          <g>
            <path d="M0 357h720" stroke="#d0ad63" strokeOpacity=".22" />
            <rect x="95" y="175" width="174" height="194" rx="3" fill="#171a15" />
            <rect x="111" y="193" width="142" height="158" fill="url(#explorer-glass)" />
            <path d="M130 194v156M173 194v156M216 194v156M111 234h142M111 276h142M111 318h142" stroke="#d5b873" strokeOpacity=".3" />
            <rect x="282" y="118" width="210" height="251" rx="4" fill="#1b1d17" />
            <rect x="302" y="139" width="170" height="206" fill="url(#explorer-glass)" />
            <path d="M324 140v205M367 140v205M410 140v205M453 140v205M302 180h170M302 221h170M302 262h170M302 303h170" stroke="#d9bd7b" strokeOpacity=".34" />
            <rect x="505" y="208" width="112" height="161" rx="3" fill="#151813" />
            <path d="M523 225v126M559 225v126M595 225v126M523 264h74M523 306h74" stroke="#d9bd7b" strokeOpacity=".29" />
            <path d="M265 368h246" stroke="#dfbe75" strokeOpacity=".7" strokeWidth="2" />
            <path d="M317 369v-35a55 55 0 0 1 110 0v35" fill="#11130f" stroke="#d6b565" strokeOpacity=".48" />
          </g>
        )}
        {category.id === "properties" && (
          <g>
            <path d="M126 330 354 170l235 160v48H126Z" fill="#191c16" stroke="#d0ad63" strokeOpacity=".45" />
            <path d="m162 317 192-132 197 132" fill="none" stroke="#e1c47d" strokeOpacity=".55" strokeWidth="2" />
            <rect x="183" y="292" width="340" height="89" fill="url(#explorer-glass)" />
            <rect x="208" y="236" width="93" height="78" fill="#11140f" stroke="#d4b66f" strokeOpacity=".35" />
            <rect x="404" y="236" width="93" height="78" fill="#11140f" stroke="#d4b66f" strokeOpacity=".35" />
            <path d="M254 236v78M450 236v78M208 275h93M404 275h93" stroke="#d4b66f" strokeOpacity=".32" />
            <rect x="326" y="309" width="55" height="72" rx="26" fill="#11130f" stroke="#d4b66f" strokeOpacity=".52" />
            <path d="M84 382h548M142 398h433" stroke="#d6b565" strokeOpacity=".22" />
            <circle cx="575" cy="128" r="38" fill="none" stroke="#d9bb75" strokeOpacity=".2" />
          </g>
        )}
        {category.id === "transport" && (
          <g>
            <path d="M0 332c131-52 258-42 359 1s207 44 361-12" fill="none" stroke="#cba75d" strokeOpacity=".23" strokeWidth="2" />
            <path d="M-30 452c147-93 251-117 371-110 137 8 245 67 420 158" fill="none" stroke="#26281f" strokeWidth="116" />
            <path d="M-30 452c147-93 251-117 371-110 137 8 245 67 420 158" fill="none" stroke="#caa657" strokeOpacity=".56" strokeWidth="2" strokeDasharray="20 18" />
            <g transform="translate(300 251)">
              <path d="M30 77 47 39c5-11 14-18 26-18h102c13 0 22 8 28 19l17 37 19 9v47H9V87Z" fill="#1d2019" stroke="#ddbd75" strokeOpacity=".68" strokeWidth="2" />
              <path d="m71 35-14 39h142l-16-39c-3-7-8-10-16-10H87c-7 0-12 3-16 10Z" fill="url(#explorer-glass)" stroke="#d8ba73" strokeOpacity=".35" />
              <circle cx="59" cy="133" r="18" fill="#090b09" stroke="#d8ba73" strokeOpacity=".7" strokeWidth="3" />
              <circle cx="204" cy="133" r="18" fill="#090b09" stroke="#d8ba73" strokeOpacity=".7" strokeWidth="3" />
              <path d="M17 96h20M226 96h18" stroke="#efdda5" strokeOpacity=".78" strokeWidth="3" />
            </g>
            <circle cx="150" cy="138" r="4" fill="#e2c77e" />
            <circle cx="215" cy="114" r="3" fill="#e2c77e" opacity=".65" />
            <circle cx="574" cy="177" r="4" fill="#e2c77e" opacity=".7" />
          </g>
        )}
        {category.id === "utilities" && (
          <g>
            <path d="M118 278h122l61-99h113l73 99h113" fill="none" stroke="#d7b76e" strokeOpacity=".42" strokeWidth="2" />
            <path d="M161 370h90l54-88h153l61 88h53" fill="none" stroke="#d7b76e" strokeOpacity=".3" strokeWidth="2" />
            <path d="m349 118-54 112h48l-28 86 93-128h-52l37-70Z" fill="url(#explorer-gold)" stroke="#e4c77e" strokeOpacity=".78" strokeWidth="2" />
            <circle cx="118" cy="278" r="9" fill="#d5b66d" fillOpacity=".78" />
            <circle cx="240" cy="278" r="9" fill="#d5b66d" fillOpacity=".78" />
            <circle cx="414" cy="179" r="9" fill="#d5b66d" fillOpacity=".78" />
            <circle cx="487" cy="278" r="9" fill="#d5b66d" fillOpacity=".78" />
            <circle cx="600" cy="278" r="9" fill="#d5b66d" fillOpacity=".78" />
            <circle cx="161" cy="370" r="8" fill="#d5b66d" fillOpacity=".66" />
            <circle cx="509" cy="370" r="8" fill="#d5b66d" fillOpacity=".66" />
            <circle cx="360" cy="255" r="118" fill="none" stroke="#d3b269" strokeOpacity=".12" />
            <circle cx="360" cy="255" r="166" fill="none" stroke="#d3b269" strokeOpacity=".08" />
          </g>
        )}
        <path d="M0 437h720" stroke="#d7b76e" strokeOpacity=".15" />
      </svg>
      <div className="okbond-explorer__scene-caption">
        <span>{category.sceneDescription}</span>
        <strong>{category.sceneLabel}</strong>
      </div>
      <span className="okbond-explorer__scene-index" aria-hidden="true">
        OKBOND / PREVIEW
      </span>
    </div>
  );
}

export default function UtilityExplorer() {
  const [activeId, setActiveId] = useState<CategoryId>("stays");
  const [notice, setNotice] = useState("");
  const [propertyIntent, setPropertyIntent] = useState<"buy" | "rent">("buy");
  const [selectedUtility, setSelectedUtility] = useState("Electricity");
  const activeCategory =
    CATEGORIES.find((category) => category.id === activeId) ?? CATEGORIES[0];

  const selectCategory = (id: CategoryId) => {
    setActiveId(id);
    setNotice("");
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % CATEGORIES.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = CATEGORIES.length - 1;
    else return;

    event.preventDefault();
    const nextCategory = CATEGORIES[nextIndex];
    selectCategory(nextCategory.id);
    document.getElementById(`okbond-explorer-tab-${nextCategory.id}`)?.focus();
  };

  const showPreviewNotice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(activeCategory.notice);
  };

  return (
    <section
      className="okbond-explorer"
      id="okbond-service-explorer"
      aria-labelledby="okbond-explorer-title"
    >
      <div className="okbond-explorer__container">
        <header className="okbond-explorer__header">
          <div>
            <p className="okbond-explorer__eyebrow">
              <span aria-hidden="true" /> OKBOND SERVICE EXPLORER
            </p>
            <h2 id="okbond-explorer-title">Your World. Connected.</h2>
            <p className="okbond-explorer__subtitle">
              Explore the services and digital experiences being developed
              across the OKBOND ecosystem.
            </p>
          </div>
          <span className="okbond-explorer__preview-badge">
            <span aria-hidden="true" /> INTERACTIVE PREVIEW
          </span>
        </header>

        <div
          className="okbond-explorer__tabs"
          role="tablist"
          aria-label="Choose an OKBOND service preview"
        >
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const selected = category.id === activeId;
            return (
              <button
                className={`okbond-explorer__tab${selected ? " is-active" : ""}`}
                id={`okbond-explorer-tab-${category.id}`}
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="okbond-explorer-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectCategory(category.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <Icon aria-hidden="true" />
                <span>{category.label}</span>
                <span className="okbond-explorer__tab-indicator" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div
          className="okbond-explorer__panel"
          id="okbond-explorer-panel"
          role="tabpanel"
          aria-labelledby={`okbond-explorer-tab-${activeId}`}
          tabIndex={0}
        >
          <div className="okbond-explorer__content" key={activeId}>
            <div className="okbond-explorer__content-topline">
              <span className="okbond-explorer__category-label">
                {activeCategory.eyebrow}
              </span>
              <span className="okbond-explorer__concept-label">
                <span aria-hidden="true" /> PREVIEW · COMING SOON
              </span>
            </div>
            <h3>{activeCategory.label}</h3>
            <p className="okbond-explorer__description">
              {activeCategory.description}
            </p>

            {activeId === "stays" && (
              <form className="okbond-explorer__form" onSubmit={showPreviewNotice}>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Destination</span>
                  <span className="okbond-explorer__input-wrap">
                    <MapPin aria-hidden="true" />
                    <input
                      type="text"
                      name="destination"
                      placeholder="City or destination"
                      autoComplete="address-level2"
                    />
                  </span>
                </label>
                <label className="okbond-explorer__field">
                  <span>Check-in</span>
                  <span className="okbond-explorer__input-wrap">
                    <CalendarDays aria-hidden="true" />
                    <input type="date" name="checkIn" />
                  </span>
                </label>
                <label className="okbond-explorer__field">
                  <span>Check-out</span>
                  <span className="okbond-explorer__input-wrap">
                    <CalendarDays aria-hidden="true" />
                    <input type="date" name="checkOut" />
                  </span>
                </label>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Guests</span>
                  <span className="okbond-explorer__input-wrap">
                    <UsersRound aria-hidden="true" />
                    <select name="guests" defaultValue="2">
                      <option value="1">1 guest</option>
                      <option value="2">2 guests</option>
                      <option value="3">3 guests</option>
                      <option value="4">4+ guests</option>
                    </select>
                  </span>
                </label>
                <button className="okbond-explorer__submit" type="submit">
                  <Search aria-hidden="true" /> Explore stays
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>
            )}

            {activeId === "properties" && (
              <form className="okbond-explorer__form" onSubmit={showPreviewNotice}>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Location</span>
                  <span className="okbond-explorer__input-wrap">
                    <MapPin aria-hidden="true" />
                    <input
                      type="text"
                      name="propertyLocation"
                      placeholder="City or neighbourhood"
                      autoComplete="address-level2"
                    />
                  </span>
                </label>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Property type</span>
                  <span className="okbond-explorer__input-wrap">
                    <Building2 aria-hidden="true" />
                    <select name="propertyType" defaultValue="any">
                      <option value="any">Any property type</option>
                      <option value="home">Home</option>
                      <option value="apartment">Apartment</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </select>
                  </span>
                </label>
                <fieldset className="okbond-explorer__intent">
                  <legend>Looking to</legend>
                  <button
                    type="button"
                    aria-pressed={propertyIntent === "buy"}
                    className={propertyIntent === "buy" ? "is-active" : ""}
                    onClick={() => setPropertyIntent("buy")}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    aria-pressed={propertyIntent === "rent"}
                    className={propertyIntent === "rent" ? "is-active" : ""}
                    onClick={() => setPropertyIntent("rent")}
                  >
                    Rent
                  </button>
                </fieldset>
                <button className="okbond-explorer__submit" type="submit">
                  <Search aria-hidden="true" /> Search properties
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>
            )}

            {activeId === "transport" && (
              <form className="okbond-explorer__form" onSubmit={showPreviewNotice}>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Travel type</span>
                  <span className="okbond-explorer__input-wrap">
                    <CarFront aria-hidden="true" />
                    <select name="travelType" defaultValue="city">
                      <option value="city">City ride</option>
                      <option value="intercity">Intercity travel</option>
                      <option value="airport">Airport transfer</option>
                    </select>
                  </span>
                </label>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Pickup</span>
                  <span className="okbond-explorer__input-wrap">
                    <MapPin aria-hidden="true" />
                    <input
                      type="text"
                      name="pickup"
                      placeholder="Enter a pickup location"
                      autoComplete="street-address"
                    />
                  </span>
                </label>
                <label className="okbond-explorer__field okbond-explorer__field--wide">
                  <span>Destination</span>
                  <span className="okbond-explorer__input-wrap">
                    <MapPin aria-hidden="true" />
                    <input
                      type="text"
                      name="dropoff"
                      placeholder="Where would you like to go?"
                      autoComplete="street-address"
                    />
                  </span>
                </label>
                <button className="okbond-explorer__submit" type="submit">
                  <Search aria-hidden="true" /> Explore transport
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>
            )}

            {activeId === "utilities" && (
              <div className="okbond-explorer__utility-picker">
                <p className="okbond-explorer__utility-heading">
                  Choose a bill category
                </p>
                <div
                  className="okbond-explorer__utility-grid"
                  role="group"
                  aria-label="Utility payment preview categories"
                >
                  {UTILITY_TYPES.map(({ label, icon: Icon }) => (
                    <button
                      className={`okbond-explorer__utility-option${selectedUtility === label ? " is-active" : ""}`}
                      key={label}
                      type="button"
                      aria-pressed={selectedUtility === label}
                      onClick={() => {
                        setSelectedUtility(label);
                        setNotice("");
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <form onSubmit={showPreviewNotice}>
                  <button className="okbond-explorer__submit" type="submit">
                    <CreditCard aria-hidden="true" /> Preview {selectedUtility.toLowerCase()}
                    <ArrowRight aria-hidden="true" />
                  </button>
                </form>
              </div>
            )}

            {notice && (
              <p className="okbond-explorer__notice" role="status" aria-live="polite">
                <span aria-hidden="true">i</span> {notice}
              </p>
            )}
          </div>
          <ConceptScene category={activeCategory} />
        </div>

        <p className="okbond-explorer__disclosure">
          This interactive interface is a product preview. No live hotel
          inventory, property listings, transport tracking, or payment services
          are connected.
        </p>
      </div>
    </section>
  );
}
