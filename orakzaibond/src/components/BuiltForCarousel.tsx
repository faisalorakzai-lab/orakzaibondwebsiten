import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const audiences = [
  {
    title: "Zero-Loss Prize Seekers",
    description:
      "Explore the planned on-chain prize-draw experience. Entry terms, eligibility, refunds and rewards will be published before any draw opens; no win or refund is guaranteed here.",
    image: "/audience-cards/prize-draw.webp",
    alt: "A person holding a gold coin beside a smartphone",
  },
  {
    title: "Everyday Service Users",
    description:
      "Discover the ecosystem vision for utility payments, stays, travel and digital services. Participating services and token payments depend on availability and launch status.",
    image: "/audience-cards/everyday-services.webp",
    alt: "Person using a laptop for digital services",
  },
  {
    title: "Capital-Protected Savers",
    description:
      "Learn about the proposed 60-day Safety Vault concept. It is not a guarantee of principal protection or returns; final terms and availability must be confirmed before launch.",
    image: "/audience-cards/savers.webp",
    alt: "Financial chart with glowing market data",
  },
  {
    title: "Staking & Yield Investors",
    description:
      "Review the planned staking experience. Pools, APY, lockups, liquidity and smart-contract terms are subject to verification and publication; returns are not assured.",
    image: "/audience-cards/staking.webp",
    alt: "Phone displaying a market chart in a person's hand",
  },
  {
    title: "Real Estate & Property Seekers",
    description:
      "See the vision for property discovery and potential real-world-asset opportunities. No fractional investment or priority access is represented as currently available.",
    image: "/audience-cards/property.webp",
    alt: "Contemporary residential home with a swimming pool",
  },
  {
    title: "Luxury Shoppers & Authenticity",
    description:
      "Explore a future concept for product provenance. Any authenticity or anti-counterfeit feature would require a live, verifiable provenance system and participating sellers.",
    image: "/audience-cards/luxury-shopping.webp",
    alt: "Shoppers browsing a luxury retail store",
  },
  {
    title: "Commuters & Fleet Partners",
    description:
      "Discover the mobility vision for transport payments and rewards. Ride-hailing, fleet integrations and operator partnerships are not promised until confirmed live.",
    image: "/audience-cards/mobility.webp",
    alt: "Commuter seated on a train with a bag",
  },
  {
    title: "Ambassadors & Referral Earners",
    description:
      "Learn about the proposed ambassador and referral program. Eligibility, reward tiers, wallet delivery and launch timing will depend on published program rules.",
    image: "/audience-cards/ambassadors.webp",
    alt: "People collaborating around a table",
  },
];

export default function BuiltForCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-audience-card]");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "20") || 20;
    track.scrollBy({ left: direction * ((card?.offsetWidth ?? 300) + gap), behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="built-for-title"
      className="relative overflow-hidden border-y border-[#d4af37]/15 bg-[#080807] py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #d4af37 1px, transparent 1px), linear-gradient(to bottom, #d4af37 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-9 flex flex-col gap-3 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7bd72] sm:text-xs">
              Designed around real needs
            </p>
            <h2
              id="built-for-title"
              className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[48px]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Built For Everyday Users, Savers &amp; Businesses
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Explore the people OKBOND aims to serve, and the ecosystem experiences being developed.
            </p>
          </div>
        </div>

        <div
          ref={trackRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-12 lg:gap-6 lg:px-12 [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label="OKBOND audience use cases"
        >
          {audiences.map((audience, index) => (
            <article
              key={audience.title}
              data-audience-card
              role="listitem"
              className="group relative isolate flex min-h-[390px] w-[min(78vw,300px)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[20px] border border-white/10 bg-[#151412] sm:min-h-[430px] sm:w-[300px] lg:min-h-[460px] lg:w-[calc((100%-72px)/4)]"
            >
              <img
                src={audience.image}
                alt={audience.alt}
                loading={index < 3 ? "eager" : "lazy"}
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,4,4,0.02)_5%,rgba(4,4,4,0.18)_35%,rgba(4,4,4,0.92)_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-[20px] ring-1 ring-inset ring-white/[0.08]"
              />
              <div className="p-5 sm:p-6">
                <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#f0d98f]/85">
                  Use case {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold leading-snug text-white sm:text-[22px]">
                  {audience.title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.65] text-white/75">
                  {audience.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-6 sm:mt-8">
          <div className="flex items-center gap-3" aria-label="Carousel controls">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Show previous audience cards"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition hover:border-[#d4af37]/70 hover:bg-[#d4af37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Show next audience cards"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition hover:border-[#d4af37]/70 hover:bg-[#d4af37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <a
            href="#okbond-ecosystem"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-black px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.28)] transition hover:border-[#d4af37]/50 hover:text-[#f0d98f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
          >
            Explore OKBOND Ecosystem <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <p className="max-w-2xl text-center text-xs leading-5 text-white/45">
            These are planned use cases, not a representation that every service is currently live. Features, terms and availability may change; no prize, refund, principal protection or yield is guaranteed.
          </p>
        </div>
      </div>
    </section>
  );
}
