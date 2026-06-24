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
  const DEFAULT_TITLE = "Orakzai Bond — OKBOND | World's First Capital-Protected Decentralized Bond";
  const DEFAULT_DESC = "Orakzai Bond (OKBOND) — world's first capital-protected decentralized bond on Polygon. Real-asset backed DeFi. Sovereign yield. Founded by Faisal Orakzai, 2026.";
  const DEFAULT_OG_IMAGE = "https://orakzaibond.com/opengraph.jpg";
  const BASE_URL = "https://orakzaibond.com";

  function setMeta(name: string, content: string, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  }

  function setLD(id: string, data: object | object[]) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement("script"); el.setAttribute("type", "application/ld+json"); el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  }

  function removeLD(id: string) { const el = document.getElementById(id); if (el) el.remove(); }

  export default function SEO({ title, description, canonical, ogImage = DEFAULT_OG_IMAGE, ogType = "website", structuredData, noIndex = false }: SEOProps) {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESC;
    const canon = canonical ?? BASE_URL;

    useEffect(() => {
      document.title = fullTitle;
      setMeta("description", desc);
      setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1");

      let canonEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonEl) { canonEl = document.createElement("link"); (canonEl as HTMLLinkElement).rel = "canonical"; document.head.appendChild(canonEl); }
      (canonEl as HTMLLinkElement).href = canon;

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
    }, [fullTitle, desc, canon, ogImage, ogType, noIndex, structuredData]);

    return null;
  }

  export const PAGE_SEO = {
    home: { canonical: BASE_URL + "/" },
    faisalOrakzai: { title: "Faisal Orakzai — Founder & CEO | Blockchain Entrepreneur Pakistan", description: "Faisal Orakzai (born 30 April 2006) is a Pakistani blockchain entrepreneur and Founder & CEO of Orakzai Bond (OKBOND). Wikidata Q140264666. ORCID 0009-0000-0915-7272.", canonical: BASE_URL + "/faisal-orakzai", ogImage: "https://orakzaibond.com/faisal-orakzai.jpg", ogType: "profile" as const },
    founder: { title: "Founder Story — Faisal Orakzai | Building Pakistan's First DeFi Bond", description: "The story of Faisal Orakzai — Pakistani blockchain architect who founded Orakzai Bond (OKBOND), the world's first capital-protected decentralized bond on Polygon.", canonical: BASE_URL + "/founder", ogImage: "https://orakzaibond.com/faisal-orakzai.jpg", ogType: "profile" as const },
    token: { title: "OKBOND Token — Tokenomics, Capital Protection & Polygon DeFi", description: "OKBOND is a capital-protected decentralized bond token on Polygon. Real-asset backed, sovereign yield, founder-guaranteed.", canonical: BASE_URL + "/token" },
    staking: { title: "OKBOND Staking — Earn Sovereign Yield | Capital-Protected APY", description: "Stake OKBOND tokens to earn sovereign yield with capital protection on Polygon. Connect your Web3 wallet and start earning.", canonical: BASE_URL + "/staking" },
    ico: { title: "OKBOND ICO — Buy Orakzai Bond Tokens | Capital-Protected DeFi", description: "Join the OKBOND Initial Coin Offering. Buy Orakzai Bond tokens with capital protection on Polygon.", canonical: BASE_URL + "/ico" },
    dashboard: { title: "Dashboard — OKBOND Portfolio & Analytics", description: "View your OKBOND holdings, staking rewards, and vault performance in real-time.", canonical: BASE_URL + "/dashboard" },
    about: { title: "About Orakzai Bond — OKBOND | Pakistan's DeFi Revolution", description: "Learn about Orakzai Bond — the world's first capital-protected decentralized bond on Polygon. Mission, vision, and technology.", canonical: BASE_URL + "/about" },
    roadmap: { title: "Roadmap — Orakzai Bond Development Milestones", description: "Track OKBOND milestones, upcoming features, and the journey to becoming the sovereign DeFi bond protocol.", canonical: BASE_URL + "/roadmap" },
    community: { title: "Community — Orakzai Bond OKBOND Holders Network", description: "Join the Orakzai Bond community. Connect with OKBOND holders, ambassadors, and DeFi enthusiasts worldwide.", canonical: BASE_URL + "/community" },
    ambassador: { title: "Ambassador Program — Represent Orakzai Bond OKBOND Globally", description: "Become an Orakzai Bond ambassador. Represent OKBOND in your region, earn rewards, and help grow Pakistan's first capital-protected DeFi protocol.", canonical: BASE_URL + "/ambassador" },
    winners: { title: "Winners — OKBOND Lottery & Community Rewards", description: "Orakzai Bond community lottery winners and reward distributions. View past OKBOND prize distributions and upcoming draws.", canonical: BASE_URL + "/winners" },
    press: { title: "Press & Media — Orakzai Bond OKBOND News Coverage", description: "Orakzai Bond press coverage, media mentions, and official press releases. Media inquiries welcome.", canonical: BASE_URL + "/press" },
    documents: { title: "Documents — Whitepaper, Audit & Legal — Orakzai Bond", description: "Official Orakzai Bond documents: whitepaper, smart contract audit, tokenomics paper, and legal disclosures.", canonical: BASE_URL + "/documents" },
    contact: { title: "Contact — Orakzai Bond Support & Media Inquiries", description: "Get in touch with the Orakzai Bond team. Support, media inquiries, and investor relations for OKBOND.", canonical: BASE_URL + "/contact" },
    legal: { title: "Legal — Terms, Privacy & Disclaimers | Orakzai Bond", description: "Orakzai Bond legal information: terms of service, privacy policy, investment disclaimers, and risk disclosures.", canonical: BASE_URL + "/legal" },
    team: { title: "Team — Orakzai Bond Leadership & OKBOND Organization", description: "Meet the Orakzai Bond team. Leadership, advisors, and the organization structure behind OKBOND.", canonical: BASE_URL + "/team", ogImage: "https://orakzaibond.com/orakzai-group-logo.jpg" },
  };
  