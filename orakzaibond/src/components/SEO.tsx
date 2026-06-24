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
  const DEFAULT_TITLE = "Orakzai Bond (OKBOND) | Capital-Protected DeFi on Polygon";
  const DEFAULT_DESC = "World's first capital-protected decentralized bond on Polygon. Real-asset backed DeFi by Faisal Orakzai. Earn sovereign yield with principal protection.";
  const DEFAULT_OG_IMAGE = "https://orakzaibond.com/opengraph.jpg";
  const BASE_URL = "https://orakzaibond.com";

  function setMeta(name: string, content: string, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  }

  function setLink(rel: string, href: string) {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) { el = document.createElement("link") as HTMLLinkElement; el.rel = rel; document.head.appendChild(el); }
    el.href = href;
  }

  function setLD(id: string, data: object | object[]) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement("script"); el.setAttribute("type", "application/ld+json"); el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  }
  function removeLD(id: string) { const el = document.getElementById(id); if (el) el.remove(); }

  /** Auto-derive canonical from current URL if not provided */
  function getCanonical(override?: string) {
    if (override) return override;
    const url = new URL(window.location.href);
    return BASE_URL + url.pathname.replace(/\/+$/, "") || BASE_URL + "/";
  }

  export default function SEO({
    title, description, canonical, ogImage = DEFAULT_OG_IMAGE,
    ogType = "website", structuredData, noIndex = false
  }: SEOProps) {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESC;

    useEffect(() => {
      const canon = getCanonical(canonical);

      document.title = fullTitle;
      setMeta("description", desc);
      setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1");
      setLink("canonical", canon);

      setMeta("og:title", fullTitle, "property");
      setMeta("og:description", desc, "property");
      setMeta("og:image", ogImage, "property");
      setMeta("og:url", canon, "property");
      setMeta("og:type", ogType, "property");
      setMeta("twitter:title", fullTitle);
      setMeta("twitter:description", desc);
      setMeta("twitter:image", ogImage);

      if (structuredData) { setLD("dynamic-ld", structuredData); } else { removeLD("dynamic-ld"); }
      return () => { document.title = DEFAULT_TITLE; };
    }, [fullTitle, desc, canonical, ogImage, ogType, noIndex, structuredData]);

    return null;
  }

  // Binance-level per-page SEO configs
  export const PAGE_SEO = {
    home: {
      title: undefined as string | undefined,
      description: DEFAULT_DESC,
      canonical: BASE_URL + "/",
    },
    faisalOrakzai: {
      title: "Faisal Orakzai — Founder & CEO of Orakzai Bond",
      description: "Faisal Orakzai (born 30 April 2006) is a Pakistani blockchain entrepreneur and Founder & CEO of Orakzai Bond (OKBOND). Wikidata Q140264666. ORCID 0009-0000-0915-7272.",
      canonical: BASE_URL + "/faisal-orakzai",
      ogImage: "https://orakzaibond.com/faisal-orakzai.jpg",
      ogType: "profile" as const,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "dateCreated": "2026-01-01",
        "dateModified": "2026-06-24",
        "mainEntity": {
          "@type": "Person",
          "@id": "https://orakzaibond.com/faisal-orakzai#person",
          "name": "Faisal Orakzai",
          "givenName": "Faisal",
          "familyName": "Orakzai",
          "honorificPrefix": "Chairman",
          "alternateName": ["Chairman Faisal Orakzai","Malak Faisal Orakzai","faisalorakzaii"],
          "description": "Founder & CEO of Orakzai Bond (OKBOND). Pakistani blockchain entrepreneur. Born 30 April 2006. Founder of Shamim Forever and Orakzai Group.",
          "image": {"@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai.jpg"},
          "birthDate": "2006-04-30",
          "birthPlace": {"@type": "Place", "name": "Pakistan", "addressCountry": "PK"},
          "nationality": {"@type": "Country", "name": "Pakistan"},
          "jobTitle": ["Founder & CEO", "Chairman", "Blockchain Architect"],
          "worksFor": {"@type": "Organization", "name": "Orakzai Bond", "url": "https://orakzaibond.com"},
          "identifier": [
            {"@type": "PropertyValue", "propertyID": "ORCID", "value": "0009-0000-0915-7272", "url": "https://orcid.org/0009-0000-0915-7272"},
            {"@type": "PropertyValue", "propertyID": "Wikidata", "value": "Q140264666", "url": "https://www.wikidata.org/wiki/Q140264666"}
          ],
          "sameAs": [
            "https://www.wikidata.org/wiki/Q140264666","https://orcid.org/0009-0000-0915-7272",
            "https://www.crunchbase.com/person/faisal-orakzai","https://www.linkedin.com/in/faisalorakzaii",
            "https://x.com/faisalorakzaii","https://www.instagram.com/faisalorakzaii",
            "https://web.facebook.com/faisalorakzaii","https://tiktok.com/@chairmanorakzai",
            "https://github.com/faisalorakzai-lab","https://linktr.ee/faisalorakzaiofficial",
            "https://peerlist.io/faisalorakzai","https://hackernoon.com/u/faisalorakzai",
            "https://www.shamimforever.com/faisal-orakzai"
          ]
        }
      }
    },
    founder: {
      title: "Founder Story — Faisal Orakzai | Pakistan's DeFi Pioneer",
      description: "The story of Faisal Orakzai — Pakistani blockchain architect who founded Orakzai Bond (OKBOND), world's first capital-protected DeFi bond on Polygon, at age 20.",
      canonical: BASE_URL + "/founder",
      ogImage: "https://orakzaibond.com/faisal-orakzai.jpg",
      ogType: "article" as const,
    },
    token: {
      title: "OKBOND Token — Tokenomics & Capital Protection on Polygon",
      description: "OKBOND is a capital-protected decentralized bond token on Polygon. Real-asset backed, sovereign yield, founder-guaranteed by Faisal Orakzai.",
      canonical: BASE_URL + "/token",
    },
    staking: {
      title: "OKBOND Staking — Earn Sovereign Yield | Capital-Protected",
      description: "Stake OKBOND tokens and earn sovereign yield with capital protection on Polygon. Connect your Web3 wallet and start earning passive income.",
      canonical: BASE_URL + "/staking",
    },
    ico: {
      title: "OKBOND ICO — Buy Orakzai Bond | Capital-Protected DeFi",
      description: "Join the OKBOND ICO. Buy Orakzai Bond tokens with capital protection on Polygon. Pakistan's first blockchain bond investment opportunity.",
      canonical: BASE_URL + "/ico",
    },
    dashboard: {
      title: "Dashboard — OKBOND Portfolio & Real-Time Analytics",
      description: "View your OKBOND holdings, staking rewards, and vault performance. Real-time blockchain data on the Orakzai Bond decentralized dashboard.",
      canonical: BASE_URL + "/dashboard",
    },
    about: {
      title: "About Orakzai Bond — OKBOND | Pakistan's DeFi Revolution",
      description: "Learn about Orakzai Bond — the world's first capital-protected decentralized bond on Polygon. Our mission, vision, technology behind OKBOND.",
      canonical: BASE_URL + "/about",
    },
    roadmap: {
      title: "Roadmap — Orakzai Bond OKBOND Development Milestones",
      description: "Track OKBOND milestones, upcoming features, and the journey to becoming the sovereign DeFi bond protocol on Polygon.",
      canonical: BASE_URL + "/roadmap",
    },
    community: {
      title: "Community — Orakzai Bond OKBOND Holders Network",
      description: "Join the Orakzai Bond community. Connect with OKBOND holders, ambassadors, and DeFi enthusiasts from Pakistan and worldwide.",
      canonical: BASE_URL + "/community",
    },
    ambassador: {
      title: "Ambassador Program — Represent Orakzai Bond Globally",
      description: "Become an Orakzai Bond ambassador. Represent OKBOND in your region, earn rewards, and help grow Pakistan's first capital-protected DeFi protocol.",
      canonical: BASE_URL + "/ambassador",
    },
    winners: {
      title: "Winners — OKBOND Lottery & Community Rewards",
      description: "Orakzai Bond community lottery winners and reward distributions. View past OKBOND prize distributions and upcoming draws.",
      canonical: BASE_URL + "/winners",
    },
    press: {
      title: "Press & Media — Orakzai Bond OKBOND News Coverage",
      description: "Orakzai Bond press coverage, media mentions, and official press releases. Media inquiries: contact Faisal Orakzai and the OKBOND team.",
      canonical: BASE_URL + "/press",
    },
    documents: {
      title: "Documents — Whitepaper, Audit & Legal | Orakzai Bond",
      description: "Official Orakzai Bond documents: whitepaper, smart contract audit, tokenomics paper, and legal disclosures for OKBOND investors.",
      canonical: BASE_URL + "/documents",
    },
    contact: {
      title: "Contact — Orakzai Bond OKBOND Support & Inquiries",
      description: "Get in touch with the Orakzai Bond team. Support, media inquiries, and investor relations for OKBOND. Reach Faisal Orakzai directly.",
      canonical: BASE_URL + "/contact",
    },
    legal: {
      title: "Legal — Terms, Privacy & Disclaimers | Orakzai Bond",
      description: "Orakzai Bond legal information: terms of service, privacy policy, investment disclaimers, and risk disclosures for OKBOND token.",
      canonical: BASE_URL + "/legal",
    },
    team: {
      title: "Team — Orakzai Bond Leadership & OKBOND Organization",
      description: "Meet the Orakzai Bond team. Leadership, advisors, and organization structure behind OKBOND. Founded by Faisal Orakzai.",
      canonical: BASE_URL + "/team",
      ogImage: "https://orakzaibond.com/orakzai-group-logo.jpg",
    },
    tokenomics: {
      title: "Tokenomics — OKBOND Token Distribution & Economics",
      description: "Detailed OKBOND tokenomics: token distribution, vesting schedules, supply mechanics, and capital protection model of Orakzai Bond.",
      canonical: BASE_URL + "/tokenomics",
    },
    vault: {
      title: "Vault — OKBOND Capital Reserve & Asset Backing",
      description: "Orakzai Bond vault: real asset reserves backing the OKBOND capital protection model. Transparent blockchain-verified collateral.",
      canonical: BASE_URL + "/vault",
    },
    guide: {
      title: "Guide — How to Use Orakzai Bond OKBOND Platform",
      description: "Step-by-step guide to buying, staking, and managing OKBOND tokens on Orakzai Bond. Web3 wallet setup and DeFi investment guide.",
      canonical: BASE_URL + "/guide",
    },
    lottery: {
      title: "Lottery — OKBOND Community Prize Draws",
      description: "Participate in the Orakzai Bond community lottery. OKBOND holders are eligible for regular prize draws and community rewards.",
      canonical: BASE_URL + "/lottery",
    },
  };
  