import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CarFront,
  Hotel,
  Zap,
} from "lucide-react";
import "./Hero.css";

const EcosystemScene = lazy(() => import("./EcosystemScene"));

interface HeroProps {
  onConnect: () => void;
  address: string | null;
}

const SERVICES = [
  {
    label: "STAYS & TRAVEL",
    detail: "Hotels & journeys",
    icon: Hotel,
    position: "top",
  },
  {
    label: "REAL ESTATE",
    detail: "Places to call home",
    icon: Building2,
    position: "left",
  },
  {
    label: "MOBILITY",
    detail: "Move with ease",
    icon: CarFront,
    position: "right",
  },
  {
    label: "EVERYDAY SERVICES",
    detail: "Utilities & essentials",
    icon: Zap,
    position: "bottom",
  },
] as const;

function StaticEcosystem() {
  return (
    <div className="okbond-static-orb" aria-hidden="true">
      <div className="okbond-static-orb__ring okbond-static-orb__ring--one" />
      <div className="okbond-static-orb__ring okbond-static-orb__ring--two" />
      <div className="okbond-static-orb__sphere">
        <div className="okbond-static-orb__wordmark">
          OK<span>BOND</span>
          <small>ORAKZAI ECOSYSTEM</small>
        </div>
      </div>
    </div>
  );
}

export default function Hero(_props: HeroProps) {
  const visualRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setWebglAvailable(false);
      return;
    }

    let supported = false;
    try {
      const canvas = document.createElement("canvas");
      supported = Boolean(
        canvas.getContext("webgl2") || canvas.getContext("webgl"),
      );
    } catch {
      supported = false;
    }
    setWebglAvailable(supported);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const target = visualRef.current;
    if (!target) return;

    if (!("IntersectionObserver" in window)) {
      setSceneReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const reveal = (delay: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="okbond-hero relative isolate overflow-hidden">
      <div className="okbond-hero__grid" aria-hidden="true" />
      <div className="okbond-hero__glow" aria-hidden="true" />

      <div className="okbond-hero__layout relative z-10 mx-auto grid w-full max-w-7xl items-center gap-2 px-5 pb-8 pt-24 sm:px-8 md:grid-cols-[0.92fr_1.08fr] md:gap-4 md:px-10 md:pb-14 md:pt-28">
        <div className="okbond-hero__copy">
          <motion.div {...reveal(0)} className="okbond-hero__eyebrow">
            <span className="okbond-hero__status-dot" aria-hidden="true" />
            ORAKZAI <span aria-hidden="true">/</span> THE OKBOND ECOSYSTEM
          </motion.div>

          <motion.h1
            {...reveal(0.08)}
            className="okbond-hero__title mt-5 text-[clamp(2.8rem,8vw,5.8rem)] leading-[0.98] md:mt-7"
          >
            One Ecosystem.
            <br />
            <span>A World of Possibilities.</span>
          </motion.h1>

          <motion.p
            {...reveal(0.16)}
            className="okbond-hero__description mt-5 max-w-xl text-base leading-7 sm:text-lg sm:leading-8"
          >
            Discover properties, book stays, explore transportation, and access
            everyday services through the growing OKBOND ecosystem.
          </motion.p>

          <motion.div
            {...reveal(0.24)}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              className="okbond-hero__button okbond-hero__button--primary"
              href="#okbond-ecosystem"
              onClick={(event) => {
                event.preventDefault();
                visualRef.current?.scrollIntoView({
                  behavior: prefersReducedMotion ? "auto" : "smooth",
                  block: "center",
                });
              }}
            >
              Explore the Ecosystem
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              className="okbond-hero__button okbond-hero__button--secondary"
              href="/about"
            >
              Discover OKBOND
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            {...reveal(0.32)}
            className="okbond-hero__footnote mt-7 flex items-center gap-3"
          >
            <span className="okbond-hero__footnote-line" aria-hidden="true" />
            A connected experience, designed around everyday life.
          </motion.div>
        </div>

        <motion.div
          {...reveal(0.12)}
          className="okbond-hero__visual-wrap"
        >
          <div
            id="okbond-ecosystem"
            ref={visualRef}
            className="okbond-hero__visual"
            role="img"
            aria-label="OKBOND ecosystem globe surrounded by hotels and travel, real estate, mobility, and everyday services"
          >
            <div className="okbond-hero__visual-halo" aria-hidden="true" />
            {webglAvailable && sceneReady ? (
              <Suspense fallback={<StaticEcosystem />}>
                <div className="okbond-hero__scene" aria-hidden="true">
                  <EcosystemScene reducedMotion={Boolean(prefersReducedMotion)} />
                </div>
              </Suspense>
            ) : (
              <StaticEcosystem />
            )}

            {SERVICES.map(({ label, detail, icon: Icon, position }, index) => (
              <motion.div
                key={label}
                className={`okbond-service-card okbond-service-card--${position}`}
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: [0, index % 2 === 0 ? -5 : 5, 0] }
                }
                transition={{
                  opacity: { duration: 0.45, delay: 0.3 + index * 0.08 },
                  y: {
                    duration: 5 + index * 0.45,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <span className="okbond-service-card__icon">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <span className="okbond-service-card__copy">
                  <span className="okbond-service-card__label">{label}</span>
                  <span className="okbond-service-card__detail">{detail}</span>
                </span>
              </motion.div>
            ))}
          </div>
          <div className="okbond-hero__visual-caption" aria-hidden="true">
            <span>ONE CONNECTED WORLD</span>
            <span className="okbond-hero__caption-line" />
            <span>OKBOND · ORAKZAI</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
