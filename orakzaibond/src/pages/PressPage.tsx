import { useEffect } from "react";
import { useSEO, PAGE_SEO } from "@/components/SEO";
  import { Link } from "wouter";
  import { ExternalLink } from "lucide-react";
  import { motion } from "framer-motion";

  const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
  const MIDNIGHT = "#05060A";
  const fade = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{duration:0.5,ease:"easeOut"}} };
  const stagger = { hidden:{}, show:{transition:{staggerChildren:0.06}} };

  function useSeoHead() {
    useEffect(() => {
      const prev = document.title;
      document.title = "Orakzai Bond — Press & Media Coverage | Faisal Orakzai in the News";
      const ld = document.createElement("script");
      ld.id = "ob-press-ld"; ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": "https://orakzaibond.com/press#webpage",
            "name": "Orakzai Bond Press & Media",
            "url": "https://orakzaibond.com/press",
            "description": "Press coverage, media mentions, and industry recognition for Orakzai Bond and its founder Faisal Orakzai.",
            "about": { "@type": "Person", "@id": "https://www.shamimforever.com/faisal-orakzai#person", "name": "Faisal Orakzai" }
          },
          {
            "@type": "Organization",
            "@id": "https://orakzaibond.com/#organization",
            "name": "Orakzai Bond",
            "url": "https://orakzaibond.com",
            "foundingDate": "2026",
            "founder": { "@type": "Person", "name": "Faisal Orakzai" },
            "award": [
              "NUST Pakistan 50 Under 50 Entrepreneurship Award",
              "GEN Global Entrepreneurship Network Member",
              "Y Combinator Startup School Featured Founder"
            ],
            "sameAs": [
              "https://theorg.com/org/orakzai-bond",
              "https://www.crunchbase.com/organization/orakzai-bond",
              "https://hackernoon.com/u/faisalorakzai",
              "https://www.wikidata.org/wiki/Q140264666"
            ]
          },
          {
            "@type": "Article",
            "headline": "Orakzai Bond: World's First Capital-Protected Decentralized Bond",
            "url": "https://hackernoon.com/u/faisalorakzai",
            "author": { "@type": "Person", "name": "Faisal Orakzai" },
            "publisher": { "@type": "Organization", "name": "HackerNoon" },
            "datePublished": "2026-06-01",
            "about": "Orakzai Bond OKBOND capital-protected DeFi blockchain Pakistan"
          },
          {
            "@type": "Article",
            "headline": "Faisal Orakzai Featured on GEN Global Entrepreneurship Network",
            "url": "https://www.genglobal.org/user/faisal1",
            "author": { "@type": "Person", "name": "Faisal Orakzai" },
            "publisher": { "@type": "Organization", "name": "GEN Global" },
            "datePublished": "2026-01-01",
            "about": "Faisal Orakzai Pakistani entrepreneur GEN Global recognition"
          }
        ]
      });
      document.head.appendChild(ld);
      return () => { document.title = prev; document.getElementById("ob-press-ld")?.remove(); };
    }, []);
  }

  const COVERAGE = [
    {
      outlet: "HackerNoon",
      type: "Published Author",
      headline: "Orakzai Bond — World's First Capital-Protected Decentralized Bond on Polygon",
      excerpt: "Faisal Orakzai writes on blockchain architecture, DeFi innovation, and the philosophy behind capital-protected digital bonds. Published and indexed on HackerNoon.",
      url: "https://hackernoon.com/u/faisalorakzai",
      date: "2026",
      tag: "Blockchain / DeFi",
    },
    {
      outlet: "GEN Global",
      type: "Member Recognition",
      headline: "Faisal Orakzai — Member, Global Entrepreneurship Network",
      excerpt: "Recognized as a member of the Global Entrepreneurship Network (GEN), one of the world's largest entrepreneurship organizations spanning 170+ countries.",
      url: "https://www.genglobal.org/user/faisal1",
      date: "2026",
      tag: "Entrepreneurship",
    },
    {
      outlet: "Y Combinator",
      type: "Startup School",
      headline: "Faisal Orakzai Listed in Y Combinator Co-Founder Matching",
      excerpt: "Featured in Y Combinator's Startup School Co-Founder Matching program — connecting Orakzai Bond with global technical co-founders and strategic partners.",
      url: "https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2",
      date: "2026",
      tag: "Startup / VC",
    },
    {
      outlet: "The Org",
      type: "Organization Profile",
      headline: "Orakzai Bond Org Chart — 37+ Leaders Publicly Listed",
      excerpt: "Orakzai Bond maintains a publicly verified organizational chart on The Org, documenting its leadership hierarchy of 37+ verified team members across 7 divisions.",
      url: "https://theorg.com/org/orakzai-bond",
      date: "2026",
      tag: "Organization",
    },
    {
      outlet: "Wikidata",
      type: "Encyclopedia Entry",
      headline: "Faisal Orakzai — Verified Wikidata Entry (Q140264666)",
      excerpt: "Faisal Orakzai is documented on Wikidata (Q140264666), the open knowledge graph used by Google, Wikipedia, and Bing to verify public figures.",
      url: "https://www.wikidata.org/wiki/Q140264666",
      date: "2025",
      tag: "Verification",
    },
    {
      outlet: "Crunchbase",
      type: "Startup Profile",
      headline: "Orakzai Bond on Crunchbase — Blockchain Startup, Pakistan",
      excerpt: "Crunchbase profile documenting Orakzai Bond's founding, industry focus (blockchain/DeFi), headquarters (Pakistan), and leadership under Faisal Orakzai.",
      url: "https://www.crunchbase.com/person/faisal-orakzai",
      date: "2026",
      tag: "Startup Data",
    },
    {
      outlet: "ORCID",
      type: "Academic Research",
      headline: "Faisal Orakzai — ORCID Researcher (0009-0000-0915-7272)",
      excerpt: "Academic researcher profile with ORCID ID 0009-0000-0915-7272. Research indexed across 67+ publications in blockchain architecture, DeFi systems, and tokenomics.",
      url: "https://orcid.org/0009-0000-0915-7272",
      date: "2024–2026",
      tag: "Academic",
    },
    {
      outlet: "NUST Pakistan",
      type: "Award",
      headline: "50 Under 50 — Entrepreneurship Award, NUST Pakistan",
      excerpt: "Recognized by NUST (National University of Sciences and Technology) Pakistan in its 50 Under 50 programme, honouring Pakistan's most impactful young entrepreneurs.",
      url: null,
      date: "2026",
      tag: "Award",
    },
    {
      outlet: "Peerlist",
      type: "Developer Profile",
      headline: "Faisal Orakzai — Verified Developer Profile on Peerlist",
      excerpt: "Verified developer and entrepreneur profile on Peerlist, showcasing technical contributions to blockchain development and open-source fintech infrastructure.",
      url: "https://peerlist.io/faisalorakzai",
      date: "2026",
      tag: "Technology",
    },
    {
      outlet: "F6S",
      type: "Founder Network",
      headline: "Faisal Orakzai on F6S — Global Startup Founder Network",
      excerpt: "Listed on F6S, the world's largest startup founder network, connecting Orakzai Bond with global accelerators, VCs, and the broader startup ecosystem.",
      url: "https://www.f6s.com/faisalorakzai",
      date: "2026",
      tag: "Network",
    },
  ];

  const STATS = [
    { n: "10+", l: "Media & Platform Mentions" },
    { n: "67+", l: "Academic Citations" },
    { n: "24+", l: "Verified Online Profiles" },
    { n: "170+", l: "Countries via GEN Global" },
  ];

  export default function PressPage() {
    useSeoHead();
    useSEO(PAGE_SEO.press);
    return (
      <div style={{ background: MIDNIGHT, color: "#f3ecd1", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>

        {/* HEADER */}
        <div style={{ padding: "80px 20px 56px", textAlign: "center", borderBottom: "1px solid #0e0e0e" }}>
          <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Press & Media</p>
          <h1 style={{ fontSize: 36, fontWeight: 200, letterSpacing: "-0.02em", margin: "0 0 14px" }}>Coverage & Recognition</h1>
          <p style={{ color: "#3a3530", fontSize: 14, maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.8 }}>
            Orakzai Bond and its founder Faisal Orakzai are featured across 24+ verified platforms,
            academic indices, and global entrepreneurship networks.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {STATS.map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <p style={{ backgroundImage: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 22, fontWeight: 300, margin: 0 }}>{s.n}</p>
                <p style={{ color: "#3a3530", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", margin: "4px 0 0" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COVERAGE LIST */}
        <section style={{ padding: "60px 20px" }}>
          <motion.div initial="hidden" animate="show" variants={stagger} style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {COVERAGE.map(item => (
              <motion.div key={item.outlet} variants={fade}
                style={{ padding: "24px 28px", border: "1px solid #111", background: "rgba(255,255,255,0.01)", display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: 70 }}>
                  <p style={{ backgroundImage: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 12, fontWeight: 600, margin: 0 }}>{item.outlet}</p>
                  <span style={{ display: "inline-block", marginTop: 5, padding: "2px 7px", border: "1px solid #1a1a1a", color: "#3a3530", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.tag}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                    <p style={{ color: "#c9a85c", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", margin: 0, flexShrink: 0 }}>{item.type}</p>
                    <span style={{ color: "#2a2520", fontSize: 10 }}>{item.date}</span>
                  </div>
                  <h3 style={{ color: "#f3ecd1", fontSize: 14, fontWeight: 400, margin: "0 0 8px", lineHeight: 1.5 }}>{item.headline}</h3>
                  <p style={{ color: "#3a3530", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.excerpt}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, color: "#BF953F", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
                      Visit <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* MEDIA CONTACT */}
        <section style={{ padding: "60px 20px", background: "#070809", borderTop: "1px solid #0e0e0e" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Media Enquiries</p>
            <h2 style={{ color: "#f3ecd1", fontSize: 24, fontWeight: 300, marginTop: 0, marginBottom: 16 }}>Press Contact</h2>
            <p style={{ color: "#3a3530", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
              For press coverage, interview requests, partnership enquiries, or brand assets — reach out through our official channels.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ padding: "10px 22px", border: "1px solid rgba(191,149,63,0.5)", color: "#BF953F", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>Contact →</Link>
              <Link href="/faisal-orakzai" style={{ padding: "10px 22px", border: "1px solid #161616", color: "#3a3530", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>Founder Profile</Link>
            </div>
          </div>
        </section>

        <div style={{ padding: "24px 20px", borderTop: "1px solid #0e0e0e", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ backgroundImage: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 12, margin: 0 }}>Orakzai Bond</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/" style={{ color: "#2a2520", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>Home</Link>
            <Link href="/team" style={{ color: "#2a2520", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>Team</Link>
            <a href="https://www.shamimforever.com/press" target="_blank" rel="noopener noreferrer" style={{ color: "#2a2520", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>Shamim Forever</a>
          </div>
        </div>
      </div>
    );
  }
  