import { useEffect } from "react";

  interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    ogType?: "website" | "article" | "profile";
    structuredData?: object | object[];
    noIndex?: boolean;
  }

  const SITE_NAME = "Orakzai Bond";
  const DEFAULT_TITLE = "Orakzai Bond (OKBOND) | Blockchain Platform on Polygon";
  const DEFAULT_DESC =
    "Explore Orakzai Bond (OKBOND), a blockchain project on Polygon. Learn about its ecosystem, token information, technology, team, roadmap, and official documents.";
  const DEFAULT_OG_IMAGE = "https://orakzaibond.com/opengraph.jpg";
  const BASE_URL = "https://orakzaibond.com";

  function setMeta(name: string, content: string, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setLink(rel: string, href: string) {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      const link = document.createElement("link") as HTMLLinkElement;
      link.rel = rel;
      document.head.appendChild(link);
      el = link;
    }
    el.href = href;
  }

  function setLD(id: string, data: object | object[]) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.setAttribute("type", "application/ld+json");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function removeLD(id: string) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function getCanonical(override?: string): string {
    if (override) return override;
    const url = new URL(window.location.href);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return BASE_URL + path;
  }

  /** Hook — call at the top of a component body (no JSX needed) */
  export function useSEO(props: SEOProps) {
    const title = props.title;
    const description = props.description;
    const canonical = props.canonical;
    const ogImage = props.ogImage ?? DEFAULT_OG_IMAGE;
    const ogType = props.ogType ?? "website";
    const structuredData = props.structuredData;
    const noIndex = props.noIndex ?? false;

    useEffect(() => {
      const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
      const desc = description ?? DEFAULT_DESC;
      const canon = getCanonical(canonical);

      document.title = fullTitle;
      setMeta("description", desc);
      setMeta(
        "robots",
        noIndex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1"
      );
      setLink("canonical", canon);
      setMeta("og:title", fullTitle, "property");
      setMeta("og:description", desc, "property");
      setMeta("og:image", ogImage, "property");
      setMeta("og:url", canon, "property");
      setMeta("og:type", ogType, "property");
      setMeta("twitter:title", fullTitle);
      setMeta("twitter:description", desc);
      setMeta("twitter:image", ogImage);

      if (structuredData) {
        setLD("dynamic-ld", structuredData);
      } else {
        removeLD("dynamic-ld");
      }

      return () => {
        document.title = DEFAULT_TITLE;
      };
    }, [title, description, canonical, ogImage, ogType, noIndex, structuredData]);
  }

  /** Component — renders null, applies SEO via hook */
  export default function SEO(props: SEOProps) {
    useSEO(props);
    return null;
  }

  export const PAGE_SEO: Record<string, SEOProps> = {
    home: { description: DEFAULT_DESC, canonical: BASE_URL + "/" },
    faisalOrakzai: {
      title: "Faisal Orakzai | Founder of Orakzai Bond",
      description:
        "Official profile of Faisal Orakzai, founder of Orakzai Bond (OKBOND). Explore his work and the OKBOND project.",
      canonical: BASE_URL + "/faisal-orakzai",
      ogImage: "https://orakzaibond.com/faisal-orakzai-smiling.jpg",
      ogType: "profile",
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${BASE_URL}/#organization`,
            name: SITE_NAME,
            alternateName: "OKBOND",
            url: `${BASE_URL}/`,
            founder: { "@id": `${BASE_URL}/faisal-orakzai#person` },
          },
          {
            "@type": "WebSite",
            "@id": `${BASE_URL}/#website`,
            url: `${BASE_URL}/`,
            name: SITE_NAME,
            publisher: { "@id": `${BASE_URL}/#organization` },
          },
          {
            "@type": "Person",
            "@id": `${BASE_URL}/faisal-orakzai#person`,
            name: "Faisal Orakzai",
            url: `${BASE_URL}/faisal-orakzai`,
            image: "https://orakzaibond.com/faisal-orakzai-smiling.jpg",
            worksFor: { "@id": `${BASE_URL}/#organization` },
            sameAs: [
              "https://x.com/faisalorakzaii",
              "https://www.linkedin.com/in/faisalorakzaii",
              "https://www.instagram.com/faisalorakzaii",
              "https://web.facebook.com/faisalorakzaii",
              "https://tiktok.com/@chairmanorakzai",
              "https://github.com/faisalorakzai-lab",
            ],
          },
          {
            "@type": "ProfilePage",
            "@id": `${BASE_URL}/faisal-orakzai#profilepage`,
            url: `${BASE_URL}/faisal-orakzai`,
            name: "Faisal Orakzai | Official Founder Profile",
            description:
              "Official profile of Faisal Orakzai, founder of Orakzai Bond (OKBOND). Explore his work and the OKBOND project.",
            isPartOf: { "@id": `${BASE_URL}/#website` },
            mainEntity: { "@id": `${BASE_URL}/faisal-orakzai#person` },
            inLanguage: "en",
          },
        ],
      },
    },
    founder: {
      title: "Faisal Orakzai | Founder of Orakzai Bond (OKBOND)",
      description:
        "Learn about Faisal Orakzai, founder of Orakzai Bond (OKBOND), and explore the project's people, history, and ecosystem.",
      canonical: BASE_URL + "/founder",
      ogImage: "https://orakzaibond.com/faisal-orakzai-smiling.jpg",
      ogType: "profile",
    },
    about: {
      title: "About Orakzai Bond — OKBOND | Pakistan's DeFi Revolution",
      description:
        "Learn about Orakzai Bond — the world's first capital-protected decentralized bond on Polygon. Mission, vision, and technology behind OKBOND.",
      canonical: BASE_URL + "/about",
    },
    token: {
      title: "OKBOND Token — Tokenomics & Capital Protection on Polygon",
      description:
        "OKBOND is a capital-protected decentralized bond token on Polygon. Real-asset backed, sovereign yield, founder-guaranteed by Faisal Orakzai.",
      canonical: BASE_URL + "/token",
    },
    tokenomics: {
      title: "Tokenomics — OKBOND Token Distribution & Bond Economics",
      description:
        "Detailed OKBOND tokenomics: token distribution, vesting schedules, supply mechanics, and the capital protection model of Orakzai Bond.",
      canonical: BASE_URL + "/tokenomics",
    },
    staking: {
      title: "OKBOND Staking — Earn Sovereign Yield | Capital-Protected",
      description:
        "Stake OKBOND tokens and earn sovereign yield with capital protection on Polygon. Connect your Web3 wallet and start earning passive income.",
      canonical: BASE_URL + "/staking",
    },
    ico: {
      title: "OKBOND ICO — Buy Orakzai Bond | Capital-Protected DeFi",
      description:
        "Join the OKBOND ICO. Buy Orakzai Bond tokens with capital protection on Polygon. Pakistan's first blockchain bond investment opportunity.",
      canonical: BASE_URL + "/ico",
    },
    dashboard: {
      title: "Dashboard — OKBOND Portfolio & Real-Time Analytics",
      description:
        "View your OKBOND holdings, staking rewards, and vault performance. Real-time blockchain data on the Orakzai Bond decentralized dashboard.",
      canonical: BASE_URL + "/dashboard",
    },
    roadmap: {
      title: "Roadmap — Orakzai Bond OKBOND Development Milestones",
      description:
        "Track OKBOND milestones, upcoming features, and the journey to becoming the sovereign DeFi bond protocol on Polygon.",
      canonical: BASE_URL + "/roadmap",
    },
    community: {
      title: "Community — Orakzai Bond OKBOND Holders Network",
      description:
        "Join the Orakzai Bond community. Connect with OKBOND holders, ambassadors, and DeFi enthusiasts worldwide.",
      canonical: BASE_URL + "/community",
    },
    communityHub: {
      title: "Community Hub — OKBOND Discussions & Social Trading",
      description:
        "Orakzai Bond Community Hub — share ideas, discuss OKBOND trading strategies, and connect with fellow DeFi investors on Polygon.",
      canonical: BASE_URL + "/community-hub",
    },
    ambassador: {
      title: "Ambassador Program — Represent Orakzai Bond Globally",
      description:
        "Become an Orakzai Bond ambassador. Represent OKBOND in your region, earn rewards, and help grow Pakistan's first capital-protected DeFi protocol.",
      canonical: BASE_URL + "/ambassador",
    },
    winners: {
      title: "Winners — OKBOND Lottery & Community Rewards",
      description:
        "Orakzai Bond community lottery winners and reward distributions. View past OKBOND prize distributions and upcoming draws.",
      canonical: BASE_URL + "/winners",
    },
    lottery: {
      title: "Lottery — OKBOND Community Prize Draws by Orakzai Bond",
      description:
        "Participate in Orakzai Bond community lottery. OKBOND holders are eligible for regular prize draws and community rewards.",
      canonical: BASE_URL + "/lottery",
    },
    press: {
      title: "Press & Media — Orakzai Bond OKBOND News Coverage",
      description:
        "Orakzai Bond press coverage, media mentions, and official press releases. Media inquiries: contact Faisal Orakzai and the OKBOND team.",
      canonical: BASE_URL + "/press",
    },
    documents: {
      title: "Documents — Whitepaper, Audit & Legal | Orakzai Bond",
      description:
        "Official Orakzai Bond documents: whitepaper, smart contract audit, tokenomics paper, and legal disclosures for OKBOND investors.",
      canonical: BASE_URL + "/documents",
    },
    contact: {
      title: "Contact — Orakzai Bond OKBOND Support & Inquiries",
      description:
        "Get in touch with the Orakzai Bond team. Support, media inquiries, and investor relations for OKBOND.",
      canonical: BASE_URL + "/contact",
    },
    legal: {
      title: "Legal — Terms, Privacy & Disclaimers | Orakzai Bond",
      description:
        "Orakzai Bond legal information: terms of service, privacy policy, investment disclaimers, and risk disclosures for OKBOND token.",
      canonical: BASE_URL + "/legal",
    },
    team: {
      title: "Team — Orakzai Bond Leadership & OKBOND Organization",
      description:
        "Meet the Orakzai Bond team. Leadership, advisors, and organization structure behind OKBOND. Founded by Faisal Orakzai.",
      canonical: BASE_URL + "/team",
      ogImage: "https://orakzaibond.com/opengraph.jpg",
    },
    vault: {
      title: "Vault — OKBOND Capital Reserve & Real Asset Backing",
      description:
        "Orakzai Bond vault: real asset reserves backing the OKBOND capital protection model. Transparent blockchain-verified collateral on Polygon.",
      canonical: BASE_URL + "/vault",
    },
    guide: {
      title: "Guide — How to Use Orakzai Bond OKBOND Platform",
      description:
        "Step-by-step guide to buying, staking, and managing OKBOND tokens on Orakzai Bond. Web3 wallet setup and DeFi investment guide.",
      canonical: BASE_URL + "/guide",
    },
    rules: {
      title: "Rules — Orakzai Bond OKBOND Community & Platform Rules",
      description:
        "Official rules and guidelines for participating in the Orakzai Bond (OKBOND) platform, community, and lottery programs.",
      canonical: BASE_URL + "/rules",
    },
    security: {
      title: "Security — Orakzai Bond OKBOND Smart Contract Safety",
      description:
        "Orakzai Bond security architecture: smart contract audits, Polygon PoS safety, capital protection mechanisms, and OKBOND investor safeguards.",
      canonical: BASE_URL + "/security",
    },
    system: {
      title: "System — Orakzai Bond OKBOND Platform Status & Metrics",
      description:
        "Live system status, on-chain metrics, and Orakzai Bond OKBOND platform performance data on Polygon blockchain.",
      canonical: BASE_URL + "/system",
    },
    registry: {
      title: "Registry — OKBOND Holder Registry & On-Chain Records",
      description:
        "Verified Orakzai Bond OKBOND holder registry. Transparent on-chain record of OKBOND token holders and staking positions.",
      canonical: BASE_URL + "/registry",
    },
  };
  