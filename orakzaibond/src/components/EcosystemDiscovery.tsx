import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  Coins,
  Layers3,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./EcosystemDiscovery.css";

type EcosystemPillar = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  availability: string;
  icon: LucideIcon;
  href?: string;
  linkLabel?: string;
};

const PILLARS: EcosystemPillar[] = [
  {
    number: "01",
    eyebrow: "Digital asset",
    title: "OKBOND on Polygon",
    description:
      "The OKBOND digital asset sits at the centre of a Polygon-based ecosystem designed for transparent, accessible participation.",
    availability: "Foundation layer · Polygon network",
    icon: Coins,
    href: "/token",
    linkLabel: "View token",
  },
  {
    number: "02",
    eyebrow: "Ecosystem utilities",
    title: "Practical by design",
    description:
      "Explore the utility vision across everyday services, travel, mobility and property—introduced clearly as experiences develop.",
    availability: "Utility experiences · Availability varies",
    icon: Layers3,
    href: "#okbond-ecosystem",
    linkLabel: "Explore services",
  },
  {
    number: "03",
    eyebrow: "Participation",
    title: "Staking & participation",
    description:
      "Existing staking functionality gives holders a dedicated place to review participation. Planned features remain clearly separated from what is live.",
    availability: "Staking interface · Available on site",
    icon: LockKeyhole,
    href: "/staking",
    linkLabel: "Open staking",
  },
  {
    number: "04",
    eyebrow: "Transparency & security",
    title: "Verify the foundations",
    description:
      "Review the project’s published documents and contract references without relying on invented claims or implied guarantees.",
    availability: "Documentation · Published resources",
    icon: ShieldCheck,
    href: "/documents",
    linkLabel: "View documents",
  },
];

export default function EcosystemDiscovery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`okbond-discovery ${isVisible ? "is-visible" : ""}`}
      id="okbond-ecosystem-works"
      aria-labelledby="okbond-discovery-title"
    >
      <div className="okbond-discovery__ambient" aria-hidden="true" />
      <div className="okbond-discovery__container">
        <header className="okbond-discovery__header">
          <p className="okbond-discovery__eyebrow">
            <span aria-hidden="true" /> THE OKBOND ECOSYSTEM
          </p>
          <div className="okbond-discovery__intro">
            <div className="okbond-discovery__intro-copy">
              <h2 id="okbond-discovery-title">How the OKBOND Ecosystem Works</h2>
              <p className="okbond-discovery__subtitle">
                A connected digital asset ecosystem designed to bring blockchain
                infrastructure, practical utilities, participation and transparency together.
              </p>
            </div>
            <div className="okbond-discovery__signal">
              <span className="okbond-discovery__signal-dot" aria-hidden="true" />
              <span>Infrastructure first. Utility follows.</span>
            </div>
          </div>
        </header>

        <div className="okbond-discovery__rail" aria-label="OKBOND ecosystem pillars">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <article
                className="okbond-discovery__card"
                key={pillar.number}
                style={{ "--delay": `${index * 90}ms` } as CSSProperties}
              >
                <div className="okbond-discovery__card-top">
                  <span className="okbond-discovery__number">{pillar.number}</span>
                  <span className="okbond-discovery__icon"><Icon aria-hidden="true" /></span>
                </div>
                <div className="okbond-discovery__node" aria-hidden="true">
                  <span />
                </div>
                <p className="okbond-discovery__card-eyebrow">{pillar.eyebrow}</p>
                <h3>{pillar.title}</h3>
                <p className="okbond-discovery__description">{pillar.description}</p>
                <div className="okbond-discovery__card-footer">
                  <span>{pillar.availability}</span>
                  {pillar.href && pillar.linkLabel ? (
                    <a href={pillar.href} className="okbond-discovery__link">
                      {pillar.linkLabel} <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="okbond-discovery__bottomline">
          <p>Four layers. One connected direction.</p>
          <a href="/about" className="okbond-discovery__cta">
            Explore the Ecosystem <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
