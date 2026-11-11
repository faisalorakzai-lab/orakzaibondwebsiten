import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const comparisons = [
  {
    badge: "vs. Government Bonds",
    title: "Deflationary Supply?",
    description:
      "OKBOND uses contract-defined token-supply rules, not sovereign issuance. Any deflation depends on verified burn activity; scarcity alone does not guarantee value appreciation.",
    image: "/audience-cards/savers.webp",
    alt: "Financial chart with glowing market data",
  },
  {
    badge: "vs. Corporate Bonds",
    title: "Smart-Contract Security",
    description:
      "Deployed code can automate published rules. It does not remove code, administrator-key, custody or market risk, and it is not a repayment guarantee or proof of an audit.",
    image: "/audience-cards/staking.webp",
    alt: "Phone displaying a market chart in a person's hand",
  },
  {
    badge: "vs. Bank Bonds",
    title: "60-Day Cycle Concept",
    description:
      "The proposed Safety Vault describes a 60-day cadence. A cycle length is not a standard bond maturity, guaranteed redemption, principal protection or promised return.",
    image: "/audience-cards/everyday-services.webp",
    alt: "Person using a laptop for digital services",
  },
  {
    badge: "Global Shift",
    title: "Borderless by Design",
    description:
      "Polygon transactions can be technically transferable across borders. Wallet access, eligibility, local laws and participating-service availability still apply.",
    image: "/audience-cards/mobility.webp",
    alt: "Commuter seated on a train with a bag",
  },
  {
    badge: "Full Transparency",
    title: "On-Chain Proof",
    description:
      "Public ledger records can help verify token transfers and contract activity. They do not, by themselves, prove reserves, asset backing, solvency or an independent audit.",
    image: "/audience-cards/ambassadors.webp",
    alt: "People collaborating around a table",
  },
  {
    badge: "Potential Upside",
    title: "Prize-Draw Concept",
    description:
      "The proposed ‘zero-loss’ draw label is not a guarantee. Eligibility, entry and refund terms must be published before launch; no prize or refund is assured.",
    image: "/audience-cards/prize-draw.webp",
    alt: "A person holding a gold coin beside a smartphone",
  },
  {
    badge: "Active Utility",
    title: "Real-World Utility",
    description:
      "Planned payments and services could create additional use cases if launched and integrated. Acceptance, availability and any effect on token value are not assured.",
    image: "/audience-cards/property.webp",
    alt: "Contemporary residential home with a swimming pool",
  },
  {
    badge: "True Sovereignty",
    title: "Autonomous Code",
    description:
      "Smart contracts can execute encoded rules automatically. Permissions, upgrade controls, dependencies and security assumptions still need to be checked; autonomy is not absolute.",
    image: "/audience-cards/luxury-shopping.webp",
    alt: "Shoppers browsing a luxury retail store",
  },
];

export default function TraditionalBondCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-bond-card]");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "20") || 20;
    track.scrollBy({
      left: direction * ((card?.offsetWidth ?? 300) + gap),
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-labelledby="traditional-bonds-title"
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
        <div className="mb-9 sm:mb-11">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7bd72] sm:text-xs">
            A different fixed-income model
          </p>
          <h2
            id="traditional-bonds-title"
            className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[48px]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            OKBOND vs. Traditional Bonds
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
            Redefining Global Fixed Income &amp; Capital Security
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45 sm:text-sm">
            A conceptual design comparison, not a claim of superior performance, lower risk or guaranteed capital protection.
          </p>
        </div>

        <div
          ref={trackRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-12 lg:gap-6 lg:px-12 [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label="OKBOND and traditional bond comparison points"
        >
          {comparisons.map((item, index) => (
            <article
              key={item.badge}
              data-bond-card
              role="listitem"
              className="group relative isolate flex min-h-[430px] w-[min(78vw,300px)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[16px] border border-white/10 bg-[#151412] sm:min-h-[460px] sm:w-[300px] lg:min-h-[480px] lg:w-[calc((100%-72px)/4)]"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading={index < 3 ? "eager" : "lazy"}
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,4,4,0.08)_5%,rgba(4,4,4,0.28)_35%,rgba(4,4,4,0.94)_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-[16px] ring-1 ring-inset ring-white/[0.08]"
              />
              <div className="p-5 sm:p-6">
                <span className="mb-3 inline-flex max-w-full items-center rounded-full border border-[#d4af37]/35 bg-black/45 px-3 py-1.5 text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#f0d98f] sm:text-[10px]">
                  {item.badge}
                </span>
                <h3 className="text-xl font-semibold leading-snug text-white sm:text-[22px]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.65] text-white/75">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-5 sm:mt-8">
          <div className="flex items-center gap-3" aria-label="Carousel controls">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Show previous bond comparison cards"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition hover:border-[#d4af37]/70 hover:bg-[#d4af37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Show next bond comparison cards"
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
          <p className="max-w-3xl text-center text-xs leading-5 text-white/45">
            OKBOND is not a government, corporate or bank bond. Features and terms depend on verified deployed code, applicable law and confirmed availability. No return, principal protection, liquidity, prize, refund or audit is guaranteed by this comparison.
          </p>
        </div>
      </div>
    </section>
  );
}
