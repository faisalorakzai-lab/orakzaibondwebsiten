import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, CarFront, CreditCard, Hotel, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./EcosystemDiscovery.css";

type EcosystemService = {
  slug: string;
  title: string;
  category: string;
  description: string;
  action: string;
  visualLabel: string;
  icon: LucideIcon;
  availability: string;
};

const SERVICES: EcosystemService[] = [
  {
    slug: "stays",
    title: "OKBOND STAYS",
    category: "Hotel Booking & Travel",
    description:
      "Discover accommodation, explore destinations, and access hotel booking services.",
    action: "Explore Stays",
    visualLabel: "STAYS",
    icon: Hotel,
    availability:
      "Hotel inventory and booking services are not available on this website yet.",
  },
  {
    slug: "mobility",
    title: "OKBOND MOBILITY",
    category: "Transportation",
    description:
      "Explore transport services, mobility options, and travel-related utilities.",
    action: "Explore Transport",
    visualLabel: "MOBILITY",
    icon: CarFront,
    availability:
      "Transport options, routes, and live availability are not available on this website yet.",
  },
  {
    slug: "properties",
    title: "OKBOND PROPERTIES",
    category: "Real Estate",
    description:
      "Discover properties for sale, rent, and future real-estate ecosystem services.",
    action: "Explore Properties",
    visualLabel: "PROPERTIES",
    icon: Building2,
    availability:
      "There are no live property listings or property transactions on this website yet.",
  },
  {
    slug: "pay",
    title: "OKBOND PAY",
    category: "Bills & Everyday Payments",
    description:
      "Explore utility-payment services and digital transaction tools as they become available.",
    action: "Explore Payments",
    visualLabel: "EVERYDAY",
    icon: CreditCard,
    availability:
      "Utility payments and payment-provider integrations are not available here. OKBOND token payments are not supported by this service.",
  },
];

function ServiceArtwork({ service }: { service: EcosystemService }) {
  const Icon = service.icon;

  return (
    <div
      className={
        "okbond-discovery__art okbond-discovery__art--" + service.slug
      }
      aria-hidden="true"
    >
      <span className="okbond-discovery__art-orbit okbond-discovery__art-orbit--outer" />
      <span className="okbond-discovery__art-orbit okbond-discovery__art-orbit--inner" />
      <div
        className={
          "okbond-discovery__art-object okbond-discovery__art-object--" +
          service.slug
        }
      >
        <Icon className="okbond-discovery__art-icon" strokeWidth={1.35} />
        <span className="okbond-discovery__art-wordmark">OKBOND</span>
        <span className="okbond-discovery__art-label">
          {service.visualLabel}
        </span>
      </div>
      <span className="okbond-discovery__art-index">
        {String(SERVICES.indexOf(service) + 1).padStart(2, "0")} / 04
      </span>
    </div>
  );
}

export default function EcosystemDiscovery() {
  const [activeService, setActiveService] = useState<EcosystemService | null>(
    null,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeService && !dialog.open) {
      dialog.showModal();
    } else if (!activeService && dialog.open) {
      dialog.close();
    }
  }, [activeService]);

  return (
    <section
      className="okbond-discovery"
      id="okbond-discovery"
      aria-labelledby="okbond-discovery-title"
    >
      <div className="okbond-discovery__container">
        <header className="okbond-discovery__header">
          <p className="okbond-discovery__eyebrow">
            <span aria-hidden="true" /> THE ORAKZAI ECOSYSTEM
          </p>
          <div className="okbond-discovery__intro">
            <div>
              <h2 id="okbond-discovery-title">Everything Connected.</h2>
              <p className="okbond-discovery__subtitle">
                Explore real-world services across the Orakzai ecosystem.
              </p>
            </div>
            <p className="okbond-discovery__availability">
              Service concepts are shown for discovery; these services are not
              available through this website yet.
            </p>
          </div>
        </header>

        <div className="okbond-discovery__rail" aria-label="Ecosystem services">
          {SERVICES.map((service) => (
            <article
              className="okbond-discovery__card"
              id={"okbond-service-" + service.slug}
              key={service.slug}
              aria-labelledby={"okbond-service-title-" + service.slug}
            >
              <ServiceArtwork service={service} />
              <div className="okbond-discovery__card-body">
                <div className="okbond-discovery__card-meta">
                  <span className="okbond-discovery__category">
                    {service.category}
                  </span>
                  <span className="okbond-discovery__coming-soon">
                    Coming soon
                  </span>
                </div>
                <h3
                  className="okbond-discovery__card-title"
                  id={"okbond-service-title-" + service.slug}
                >
                  {service.title}
                </h3>
                <p className="okbond-discovery__card-description">
                  {service.description}
                </p>
                <button
                  className="okbond-discovery__action"
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="okbond-service-dialog"
                  aria-label={"Open " + service.title + " service overview"}
                  onClick={() => setActiveService(service)}
                >
                  {service.action}
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="okbond-discovery__disclosure">
          No live hotel inventory, property listings, transportation availability,
          or payment-provider connections are represented here.
        </p>
      </div>

      <dialog
        className="okbond-discovery__dialog"
        id="okbond-service-dialog"
        ref={dialogRef}
        aria-labelledby="okbond-service-dialog-title"
        onClose={() => setActiveService(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveService(null);
        }}
      >
        {activeService && (
          <div className="okbond-discovery__dialog-content">
            <button
              className="okbond-discovery__dialog-close"
              type="button"
              aria-label="Close service overview"
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden="true" />
            </button>
            <p className="okbond-discovery__eyebrow">
              <span aria-hidden="true" /> SERVICE OVERVIEW
            </p>
            <span className="okbond-discovery__coming-soon">
              Coming soon
            </span>
            <h2 id="okbond-service-dialog-title">{activeService.title}</h2>
            <p className="okbond-discovery__dialog-category">
              {activeService.category}
            </p>
            <p className="okbond-discovery__dialog-description">
              {activeService.description}
            </p>
            <p className="okbond-discovery__dialog-note">
              {activeService.availability}
            </p>
            <div className="okbond-discovery__dialog-actions">
              <a href="/about" className="okbond-discovery__about-link">
                Learn about OKBOND <ArrowRight aria-hidden="true" />
              </a>
              <button
                className="okbond-discovery__close-link"
                type="button"
                onClick={() => dialogRef.current?.close()}
              >
                Close overview
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
