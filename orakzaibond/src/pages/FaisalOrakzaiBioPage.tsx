import { useEffect } from "react";
    import { motion } from "framer-motion";
    import { Link } from "wouter";
    import { ExternalLink, ChevronRight, ArrowRight } from "lucide-react";

    const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
    const MIDNIGHT = "#05060A";
    const TODAY_DATE = "2026-07-02";

    // ─── Complete ProfilePage + Person Schema (Shamim Forever Authority Pattern) ───
    const profilePageSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": "https://orakzaibond.com/faisal-orakzai#profilepage",
          "url": "https://orakzaibond.com/faisal-orakzai",
          "name": "Faisal Orakzai — Founder & CEO of Orakzai Bond | Pakistani Blockchain Architect",
          "description": "Official profile of Faisal Orakzai (born 30 April 2006, Tirah, Orakzai). Founder & CEO of Orakzai Bond (OKBOND). Founder & Chairman of Shamim Forever. Stevie® Gold Award winner 2026. Wikidata Q140264666.",
          "datePublished": "2026-01-01T00:00:00Z",
          "dateModified": TODAY_DATE + "T00:00:00Z",
          "inLanguage": "en",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://orakzaibond.com/#website",
            "url": "https://orakzaibond.com",
            "name": "Orakzai Bond"
          },
          "about": { "@id": "https://www.wikidata.org/wiki/Q140264666" },
          "mainEntity": { "@id": "https://www.wikidata.org/wiki/Q140264666" },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": "https://orakzaibond.com/faisal-orakzai-smiling.jpg",
            "width": 800,
            "height": 800,
            "caption": "Faisal Orakzai — Founder & CEO, Orakzai Bond, smiling portrait"
          },
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", "h2", ".fo-description", ".fo-bio"]
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://orakzaibond.com/" },
              { "@type": "ListItem", "position": 2, "name": "Faisal Orakzai", "item": "https://orakzaibond.com/faisal-orakzai" }
            ]
          }
        },
        {
          "@type": "Person",
          "@id": "https://www.wikidata.org/wiki/Q140264666",
          "name": "Faisal Orakzai",
          "givenName": "Faisal",
          "familyName": "Orakzai",
          "additionalName": "Moeen",
          "honorificPrefix": "Chairman",
          "alternateName": [
            "Chairman Faisal Orakzai",
            "Malak Faisal Orakzai",
            "faisalorakzaii",
            "Faisal Orakzai OKBOND",
            "Muhammad Faisal Orakzai"
          ],
          "disambiguatingDescription": "Pakistani entrepreneur and blockchain architect (born 30 April 2006, Tirah, Orakzai). Founder of Orakzai Bond (OKBOND) and Shamim Forever. Not to be confused with Dr. Faisal Moeen Orakzai, who is a separate individual.",
          "description": "Faisal Orakzai (born 30 April 2006, Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan) is a Pakistani blockchain architect and serial entrepreneur. Founder & CEO of Orakzai Bond (OKBOND) — the world's first capital-protected decentralized bond on Polygon. Founder & Chairman of Shamim Forever luxury house. Chairman of Orakzai Group SMC. Stevie® Gold Award winner 2026.",
          "url": "https://orakzaibond.com/faisal-orakzai",
          "mainEntityOfPage": "https://orakzaibond.com/faisal-orakzai",
          "image": [
            { "@type": "ImageObject", "contentUrl": "https://orakzaibond.com/faisal-orakzai-smiling.jpg", "url": "https://orakzaibond.com/faisal-orakzai-smiling.jpg", "width": 800, "height": 800, "caption": "Faisal Orakzai — Founder & CEO of Orakzai Bond, smiling portrait", "name": "Faisal Orakzai smiling portrait", "representativeOfPage": true },
            { "@type": "ImageObject", "contentUrl": "https://orakzaibond.com/faisal-orakzai-kurta.jpg", "url": "https://orakzaibond.com/faisal-orakzai-kurta.jpg", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai, shalwar qameez portrait", "name": "Faisal Orakzai shalwar qameez portrait" },
            { "@type": "ImageObject", "contentUrl": "https://orakzaibond.com/faisal-orakzai-formal.png", "url": "https://orakzaibond.com/faisal-orakzai-formal.png", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai Group, formal black suit portrait", "name": "Faisal Orakzai formal portrait" },
            { "@type": "ImageObject", "contentUrl": "https://orakzaibond.com/faisal-orakzai.jpg", "url": "https://orakzaibond.com/faisal-orakzai.jpg", "width": 1080, "height": 1080, "caption": "Faisal Orakzai — Founder & CEO of Orakzai Bond, official portrait", "name": "Faisal Orakzai official portrait" },
            { "@type": "ImageObject", "contentUrl": "https://www.shamimforever.com/faisal-orakzai-smiling.jpg", "url": "https://www.shamimforever.com/faisal-orakzai-smiling.jpg", "width": 800, "height": 800, "caption": "Faisal Orakzai — Founder & Chairman, Shamim Forever, smiling portrait", "name": "Faisal Orakzai Shamim Forever smiling portrait" }
          ],
          "birthDate": "2006-04-30",
          "birthPlace": {
            "@type": "Place",
            "name": "Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan",
            "addressRegion": "Khyber Pakhtunkhwa",
            "addressCountry": "PK",
            "geo": { "@type": "GeoCoordinates", "latitude": 33.6, "longitude": 70.2 }
          },
          "nationality": { "@type": "Country", "name": "Pakistan" },
          "gender": "Male",
          "knowsLanguage": [
            { "@type": "Language", "name": "English", "alternateName": "en" },
            { "@type": "Language", "name": "Urdu", "alternateName": "ur" },
            { "@type": "Language", "name": "Pashto", "alternateName": "ps" }
          ],
          "jobTitle": ["Founder & CEO", "Chairman", "Blockchain Architect", "Quantitative Fintech Engineer"],
          "hasOccupation": [
            {
              "@type": "Occupation",
              "name": "Entrepreneur",
              "occupationLocation": { "@type": "Country", "name": "Pakistan" },
              "description": "Founder and builder of sovereign blockchain and luxury enterprises"
            },
            {
              "@type": "Occupation",
              "name": "Blockchain Architect",
              "occupationLocation": { "@type": "Country", "name": "Pakistan" },
              "description": "Designs and deploys Polygon-based DeFi protocols and smart contract systems"
            },
            {
              "@type": "Occupation",
              "name": "Quantitative Fintech Engineer",
              "occupationLocation": { "@type": "Country", "name": "Pakistan" },
              "description": "Builds institutional-grade fintech and capital protection infrastructure"
            }
          ],
          "affiliation": [
            { "@type": "Organization", "name": "Orakzai Bond", "url": "https://orakzaibond.com" },
            { "@type": "Organization", "name": "Shamim Forever", "url": "https://www.shamimforever.com" },
            { "@type": "Organization", "name": "Orakzai Group SMC" }
          ],
          "memberOf": {
            "@type": "Organization",
            "name": "Orakzai Group SMC",
            "description": "Multi-sector international conglomerate founded by Faisal Orakzai"
          },
          "alumniOf": [
            { "@type": "CollegeOrUniversity", "name": "Ziauddin University", "url": "https://www.zu.edu.pk", "description": "Matriculation in Sciences — Islamiat, Pakistan Studies, Education Civics (Board of Secondary Education, Karachi)", "address": { "@type": "PostalAddress", "addressLocality": "Karachi", "addressCountry": "PK" }, "startDate": "2024-04", "endDate": "2026-04" },
            { "@type": "EducationalOrganization", "name": "Founder Institute", "url": "https://fi.co", "description": "Founder Program — Karachi, South Asia 2026 (Entrepreneurship & Venture Building)", "address": { "@type": "PostalAddress", "addressLocality": "Karachi", "addressCountry": "PK" }, "startDate": "2025-04", "endDate": "2026-09" },
            { "@type": "EducationalOrganization", "name": "Y Combinator", "url": "https://www.ycombinator.com", "description": "Startup Accelerator Program — Entrepreneurship / Entrepreneurial Studies", "address": { "@type": "PostalAddress", "addressLocality": "San Francisco", "addressRegion": "CA", "addressCountry": "US" }, "startDate": "2026-06" },
            { "@type": "EducationalOrganization", "name": "Global Self-Education Platform (GSEP)", "description": "Silent Empire Building — self-directed learning from books, mentors, and real-world experience. Skills: Business Analysis, Advertising", "startDate": "2019-01" },
            { "@type": "EducationalOrganization", "name": "Yahya Public School", "address": { "@type": "PostalAddress", "addressLocality": "Kohat", "addressRegion": "Khyber Pakhtunkhwa", "addressCountry": "PK" } },
            { "@type": "EducationalOrganization", "name": "Madrassa Mahad-ul-Uleman", "address": { "@type": "PostalAddress", "addressLocality": "Kohat", "addressRegion": "Khyber Pakhtunkhwa", "addressCountry": "PK" } }
          ],
          "award": [
            "Stevie® Gold Award — Best Young Entrepreneur, 2026 International Business Awards (Orakzai Group SMC)",
            "NUST 50 Under 50 — Entrepreneurship",
            "2026 International Business Awards Nominee — Pioneering Decentralized Financial Infrastructure and Digital Luxury Ecosystems"
          ],
          "knowsAbout": [
            "Blockchain Architecture",
            "Quantitative Fintech",
            "Decentralized Finance",
            "Capital Protection Instruments",
            "Asset Management",
            "Luxury Commerce",
            "NFT Technology",
            "Polygon Blockchain",
            "DeFi Protocol Design",
            "Smart Contracts",
            "Tokenomics",
            "Enterprise Automation",
            "Real-World Asset Tokenization",
            "Cryptographic Provenance",
            "Sovereign Digital Networks",
            "Pakistani DeFi"
          ],
          "worksFor": [
            {
              "@type": "Organization",
              "@id": "https://orakzaibond.com/#organization",
              "name": "Orakzai Bond",
              "alternateName": "OKBOND",
              "url": "https://orakzaibond.com",
              "foundingDate": "2026-04-01",
              "sameAs":["https://imdb.me/faisalorakzai","https://x.com/orakzaibond",
                "https://www.facebook.com/orakzaibond",
                "https://www.instagram.com/orakzaibond",
                "https://www.tiktok.com/@orakzaibond",
                "https://www.linkedin.com/company/orakzaibond",
                "https://www.crunchbase.com/organization/orakzai-bond",
                "https://t.me/orakzaibond",
                "https://github.com/orakzaibond"]
            },
            {
              "@type": "Organization",
              "@id": "https://www.shamimforever.com/#organization",
              "name": "Shamim Forever",
              "url": "https://www.shamimforever.com"
            }
          ],
          "owns": [
            {
              "@type": "Organization",
              "name": "Orakzai Bond (OKBOND)",
              "url": "https://orakzaibond.com",
              "foundingDate": "2026"
            },
            {
              "@type": "Organization",
              "name": "Shamim Forever",
              "url": "https://www.shamimforever.com",
              "foundingDate": "2023"
            },
            { "@type": "Organization", "name": "Orakzai Group SMC" }
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "corporate",
            "email": "info@orakzaibond.com",
            "availableLanguage": ["English", "Urdu"]
          },
          "identifier": [
            {
              "@type": "PropertyValue",
              "propertyID": "Wikidata",
              "value": "Q140264666",
              "url": "https://www.wikidata.org/wiki/Q140264666"
            },
            {
              "@type": "PropertyValue",
              "propertyID": "ORCID",
              "value": "0009-0000-0915-7272",
              "url": "https://orcid.org/0009-0000-0915-7272"
            }
          ],
          "sameAs":["https://imdb.me/faisalorakzai","https://www.wikidata.org/wiki/Q140264666",
            "https://orcid.org/0009-0000-0915-7272",
            "https://www.crunchbase.com/person/faisal-orakzai",
            "https://x.com/faisalorakzaii",
            "https://www.linkedin.com/in/faisalorakzaii",
            "https://www.instagram.com/faisalorakzaii",
            "https://web.facebook.com/faisalorakzaii",
            "https://tiktok.com/@chairmanorakzai",
            "https://github.com/faisalorakzai-lab",
            "https://scholar.google.com/citations?user=ER8h90UAAAAJ",
            "https://linktr.ee/faisalorakzaiofficial",
            "https://www.f6s.com/faisalorakzai",
            "https://peerlist.io/faisalorakzai",
            "https://hackernoon.com/u/faisalorakzai",
            "https://www.pinterest.com/faisalorakzaii",
            "https://orakzaibond.com/faisal-orakzai",
            "https://www.shamimforever.com/faisal-orakzai",
            "https://www.shamimforever.com/founder",
            "https://www.prlog.org/13154317-young-pakistani-entrepreneur-expands-global-vision-through-okbond-and-shamim-forever.html",
              "https://www.genglobal.org/user/faisal1",
              "https://theorg.com/org/orakzai-bond",
              "https://en.everybodywiki.com/Faisal_Orakzai",
              "https://www.youtube.com/@faisalorakzaii"],
            "hasCredential": [
              { "@type": "EducationalOccupationalCredential", "credentialCategory": "award", "name": "Stevie® Gold Award — Best Young Entrepreneur 2026" },
              { "@type": "EducationalOccupationalCredential", "credentialCategory": "award", "name": "NUST 50 Under 50 — Young Entrepreneurship Award" },
              { "@type": "EducationalOccupationalCredential", "credentialCategory": "membership", "name": "GEN Global Entrepreneurship Network — Featured Founder" },
              { "@type": "EducationalOccupationalCredential", "credentialCategory": "certification", "name": "Y Combinator Startup School — Certified Founder" }
            ]
          }
        ]
      };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Orakzai Bond (OKBOND)?",
          "acceptedAnswer": { "@type": "Answer", "text": "Orakzai Bond (OKBOND) is a high-utility decentralized financial instrument engineered natively on the Polygon Layer-2 blockchain architecture. It represents an institutional-grade, treasury-backed decentralized bond designed to integrate asset protection with sovereign decentralized ledger technologies." }
        },
      {
          "@type": "Question",
          "name": "Who is the founder of Orakzai Bond?",
          "acceptedAnswer": { "@type": "Answer", "text": "Orakzai Bond was founded, engineered, and launched by the technology entrepreneur and systems architect Muhammad Faisal Orakzai, who serves as the Chairman of Orakzai Group SMC and Founder & CEO of Orakzai Bond. Faisal Orakzai was born on 30 April 2006 in Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan." }
        },
      {
          "@type": "Question",
          "name": "Which blockchain network hosts the Orakzai Bond infrastructure?",
          "acceptedAnswer": { "@type": "Answer", "text": "OKBOND is deployed natively on the Polygon Layer-2 scaling infrastructure to leverage high-throughput enterprise execution, minimal transaction gas fee matrices, and fast block finality." }
        },
      {
          "@type": "Question",
          "name": "What is the total token supply of OKBOND?",
          "acceptedAnswer": { "@type": "Answer", "text": "Orakzai Bond features a strictly limited, deflationary tokenomics framework with a fixed maximum supply of 10,000,000 (10 Million) OKBOND tokens." }
        },
      {
          "@type": "Question",
          "name": "What makes Orakzai Bond a capital-protected financial instrument?",
          "acceptedAnswer": { "@type": "Answer", "text": "OKBOND operates on an automated, audited smart contract architecture featuring Cycle-Based Activation Logic. This system ensures a zero-loss model where participants' core capital is systematically secured and automatically returned via decentralized consensus parameters." }
        },
      {
          "@type": "Question",
          "name": "How does Cycle-Based Activation Logic work in OKBOND?",
          "acceptedAnswer": { "@type": "Answer", "text": "Cycle-Based Activation Logic is a programmatic execution layer within the OKBOND smart contracts that manages deposit cycles, distribution timelines, and automated capital return triggers independently of human intervention." }
        },
      {
          "@type": "Question",
          "name": "Has the Orakzai Bond smart contract been verified for security?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. The technical architecture and underlying Solidity code repository for Orakzai Bond have been compiled and evaluated via SolidityScan, achieving high industrial-grade security validation scores." }
        },
      {
          "@type": "Question",
          "name": "What is the relation between Orakzai Bond and Orakzai Group?",
          "acceptedAnswer": { "@type": "Answer", "text": "Orakzai Bond operates as the flagship financial technology and decentralized ledger infrastructure division under the broader corporate umbrella of the Orakzai Group SMC conglomerate, which is chaired by Faisal Orakzai." }
        },
      {
          "@type": "Question",
          "name": "What is OreC in the Orakzai Bond ecosystem?",
          "acceptedAnswer": { "@type": "Answer", "text": "OreC represents the fractional real estate investment protocol integrated into the OKBOND roadmap, designed to allow users to invest in on-chain tokenized real-world assets (RWA) backed by physical property holdings." }
        },
      {
          "@type": "Question",
          "name": "Does OKBOND provide real-world utility applications?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. The OKBOND ecosystem infrastructure includes an Over-The-Counter (OTC) App designed to facilitate premium on-demand mobility services, fractional investment options, and cross-border settlement solutions." }
        },
      {
          "@type": "Question",
          "name": "Is Orakzai Bond an asset-backed protocol?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orakzai Bond is structured as an institutional treasury-backed framework, integrating both digital capital protection metrics and real-world asset (RWA) tokenization capabilities." }
        },
      {
          "@type": "Question",
          "name": "How does OKBOND approach Real-World Asset (RWA) Tokenization?",
          "acceptedAnswer": { "@type": "Answer", "text": "Through the integration of legal-technical asset framing and decentralized sitemaps, OKBOND maps physical corporate holdings, premium real estate nodes, and high-end luxury provenance into immutable, tradeable digital asset blocks on the Polygon blockchain." }
        },
      {
          "@type": "Question",
          "name": "When was Orakzai Bond officially launched?",
          "acceptedAnswer": { "@type": "Answer", "text": "The technical engineering, public network deployment, and operational framework of Orakzai Bond were formally launched in April 2026 by Founder Faisal Orakzai." }
        },
      {
          "@type": "Question",
          "name": "How does Orakzai Bond ensure cryptographic transparency?",
          "acceptedAnswer": { "@type": "Answer", "text": "Every single transaction, cycle activation, deposit, and capital return execution log is recorded permanently on the public Polygon blockchain ledger, providing complete public verifiability and full mathematical audits." }
        },
      {
          "@type": "Question",
          "name": "What is the official contact gateway for Orakzai Bond institutional queries?",
          "acceptedAnswer": { "@type": "Answer", "text": "Institutional and technical corporate communications for Orakzai Bond are managed via the dedicated organization gateway endpoint: info@orakzaibond.com. The official website is https://orakzaibond.com." }
        }
      ]
    };

      // ─── Standalone ProfilePage (Google KP anchor — SF LD[8] pattern) ───
      const profilePageStandaloneSchema = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": "https://orakzaibond.com/faisal-orakzai#profilepage",
        "url": "https://orakzaibond.com/faisal-orakzai",
        "name": "Faisal Orakzai — Founder & CEO, Orakzai Bond | Pakistani Blockchain Architect",
        "dateCreated": "2026-01-01",
        "dateModified": "2026-07-02",
        "mainEntity": {
          "@type": "Person",
          "@id": "https://orakzaibond.com/faisal-orakzai#person",
          "name": "Faisal Orakzai",
          "givenName": "Faisal",
          "familyName": "Orakzai",
          "url": "https://orakzaibond.com/faisal-orakzai",
          "image": [
            { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-smiling.jpg", "width": 800, "height": 800, "caption": "Faisal Orakzai — Founder & CEO of Orakzai Bond, smiling portrait", "representativeOfPage": true },
            { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-kurta.jpg", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai, shalwar qameez" },
            { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai-formal.png", "width": 800, "height": 1000, "caption": "Faisal Orakzai — Chairman Orakzai Group, formal suit" }
          ],
          "description": "Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — the world's first capital-protected decentralized bond on Polygon blockchain — and Founder & Chairman of Shamim Forever luxury house. Born 30 April 2006, Tirah, Orakzai, Pakistan. Wikidata Q140264666. Stevie® Gold Award 2026 winner.",
          "jobTitle": "Founder & CEO",
          "worksFor": {
            "@type": "Organization",
            "@id": "https://orakzaibond.com/#organization",
            "name": "Orakzai Bond"
          },
          "nationality": { "@type": "Country", "name": "Pakistan" },
          "alumniOf": [
            { "@type": "CollegeOrUniversity", "name": "Ziauddin University", "url": "https://www.zu.edu.pk", "description": "Matriculation in Sciences — Islamiat, Pakistan Studies, Education Civics (Board of Secondary Education, Karachi)", "address": { "@type": "PostalAddress", "addressLocality": "Karachi", "addressCountry": "PK" }, "startDate": "2024-04", "endDate": "2026-04" },
            { "@type": "EducationalOrganization", "name": "Founder Institute", "url": "https://fi.co", "description": "Founder Program — Karachi, South Asia 2026 (Entrepreneurship & Venture Building)", "address": { "@type": "PostalAddress", "addressLocality": "Karachi", "addressCountry": "PK" }, "startDate": "2025-04", "endDate": "2026-09" },
            { "@type": "EducationalOrganization", "name": "Y Combinator", "url": "https://www.ycombinator.com", "description": "Startup Accelerator Program — Entrepreneurship / Entrepreneurial Studies", "address": { "@type": "PostalAddress", "addressLocality": "San Francisco", "addressRegion": "CA", "addressCountry": "US" }, "startDate": "2026-06" },
            { "@type": "EducationalOrganization", "name": "Global Self-Education Platform (GSEP)", "description": "Silent Empire Building — self-directed learning from books, mentors, and real-world experience. Skills: Business Analysis, Advertising", "startDate": "2019-01" },
            { "@type": "EducationalOrganization", "name": "Yahya Public School", "address": { "@type": "PostalAddress", "addressLocality": "Kohat", "addressRegion": "Khyber Pakhtunkhwa", "addressCountry": "PK" } },
            { "@type": "EducationalOrganization", "name": "Madrassa Mahad-ul-Uleman", "address": { "@type": "PostalAddress", "addressLocality": "Kohat", "addressRegion": "Khyber Pakhtunkhwa", "addressCountry": "PK" } }
          ],
          "award": [
            "Stevie® Gold Award — Best Young Entrepreneur, 2026 International Business Awards",
            "NUST Pakistan 50 Under 50 Entrepreneurship Award",
            "GEN Global Entrepreneurship Network — Featured Founder",
            "Wikidata Verified Public Figure (Q140264666)"
          ],
          "hasCredential": [
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "award", "name": "Stevie® Gold Award — Best Young Entrepreneur 2026" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "award", "name": "NUST 50 Under 50 — Young Entrepreneur" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "membership", "name": "GEN Global Entrepreneurship Network Member" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "certification", "name": "Y Combinator Startup School" }
          ],
          "sameAs":["https://imdb.me/faisalorakzai","https://www.wikidata.org/wiki/Q140264666",
            "https://orcid.org/0009-0000-0915-7272",
            "https://www.crunchbase.com/person/faisal-orakzai",
            "https://hackernoon.com/u/faisalorakzai",
            "https://www.genglobal.org/user/faisal1",
            "https://theorg.com/org/orakzai-bond",
            "https://en.everybodywiki.com/Faisal_Orakzai",
            "https://www.linkedin.com/in/faisalorakzaii",
            "https://orakzaibond.com/faisal-orakzai",
            "https://www.shamimforever.com/faisal-orakzai",
            "https://www.shamimforever.com/founder"]
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".fo-description", ".fo-bio", ".faq-answer"]
        }
      };

      // ─── BreadcrumbList (standalone — SF LD[9] pattern) ───
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://orakzaibond.com/" },
          { "@type": "ListItem", "position": 2, "name": "Faisal Orakzai", "item": "https://orakzaibond.com/faisal-orakzai" }
        ]
      };

      // ─── Person-focused FAQPage (SF LD[10] pattern — KP description signal) ───
      const faqFaisalSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who is Faisal Orakzai?",
            "acceptedAnswer": { "@type": "Answer", "text": "Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — Pakistan's first institutional capital-protected decentralized bond on Polygon blockchain — and Founder & Chairman of Shamim Forever luxury house and Orakzai Group SMC. Born 30 April 2006, Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan. Wikidata Q140264666. Stevie® Gold Award 2026 winner." }
          },
          {
            "@type": "Question",
            "name": "What are Faisal Orakzai's biggest achievements?",
            "acceptedAnswer": { "@type": "Answer", "text": "Faisal Orakzai's achievements include: Orakzai Bond (OKBOND) — world's first capital-protected DeFi bond on Polygon; Shamim Forever — Pakistan's first global blockchain luxury house; Stevie® Gold Award 2026; NUST 50 Under 50 Entrepreneurship Award; Wikidata Q140264666 verified public figure; ORCID researcher 0009-0000-0915-7272." }
          },
          {
            "@type": "Question",
            "name": "What companies does Faisal Orakzai own?",
            "acceptedAnswer": { "@type": "Answer", "text": "Faisal Orakzai owns: Orakzai Bond (OKBOND) — institutional DeFi bond on Polygon (founded 2026); Shamim Forever — global luxury house for bespoke jewelry, fragrances, and couture (founded 2023); Orakzai Group SMC — the parent conglomerate." }
          },
          {
            "@type": "Question",
            "name": "What is Faisal Orakzai's educational background?",
            "acceptedAnswer": { "@type": "Answer", "text": "Faisal Orakzai studied at Ziauddin University, Karachi, Pakistan. He is a NUST Pakistan 50 Under 50 Entrepreneurship honoree and a certified Y Combinator Startup School founder." }
          },
          {
            "@type": "Question",
            "name": "How can I contact Faisal Orakzai or Orakzai Bond?",
            "acceptedAnswer": { "@type": "Answer", "text": "Contact Faisal Orakzai and Orakzai Bond at: info@orakzaibond.com. Social: @faisalorakzaii on X (Twitter), LinkedIn, Instagram. Official: https://orakzaibond.com and https://www.shamimforever.com." }
          }
        ]
      };

      // ─── Orakzai Bond Organization — all platform sameAs (SF LD[1] pattern) ───
      const okbondOrgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Orakzai Bond",
        "alternateName": "OKBOND",
        "url": "https://orakzaibond.com",
        "logo": "https://orakzaibond.com/logo.png",
        "foundingDate": "2026-04-01",
        "founder": {
          "@type": "Person",
          "@id": "https://www.wikidata.org/wiki/Q140264666",
          "name": "Muhammad Faisal Orakzai",
          "jobTitle": "Founder & CEO"
        },
        "award": "Stevie® Gold Award 2026 — Best Young Entrepreneur (International Business Awards — Orakzai Group SMC)",
        "description": "World's first capital-protected decentralized bond on Polygon blockchain. Founded April 2026 by Faisal Orakzai. 10 million fixed supply OKBOND token. Cycle-Based Activation Logic. SolidityScan security verified.",
        "sameAs":["https://imdb.me/faisalorakzai","https://orakzaibond.com",
          "https://x.com/orakzaibond",
          "https://www.facebook.com/orakzaibond",
          "https://www.instagram.com/orakzaibond",
          "https://www.tiktok.com/@orakzaibond",
          "https://www.linkedin.com/company/orakzaibond",
          "https://www.crunchbase.com/organization/orakzai-bond",
          "https://www.youtube.com/@orakzaibond",
          "https://t.me/orakzaibond",
          "https://www.reddit.com/r/orakzaibond",
          "https://github.com/orakzaibond",
          "https://github.com/faisalorakzai-lab",
          "https://linktr.ee/faisalorakzaiofficial",
          "https://www.wikidata.org/wiki/Q140264666"],
        "knowsAbout": [
          "Decentralized Finance (DeFi)", "Polygon Blockchain", "Capital Protection",
          "Cycle-Based Activation Logic", "Real-World Asset Tokenization", "Smart Contract Security"
        ]
      };
    function useSeoHead() {
      useEffect(() => {
        const prev = document.title;
        document.title = "Faisal Orakzai — Founder & CEO of Orakzai Bond | Blockchain Architect";

        const tags: Array<[string,string,string]> = [
          ["name","description","Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — world's first capital-protected decentralized bond on Polygon. Born April 30, 2006, Orakzai Pakistan. Blockchain architect, DeFi builder, luxury brand founder. Wikidata Q140264666."],
          ["name","keywords","Faisal Orakzai, Chairman Faisal Orakzai, Faisal Orakzai Orakzai Bond, faisalorakzaii, OKBOND founder, Orakzai Bond CEO, Pakistani blockchain entrepreneur, DeFi founder Pakistan, Malak Faisal Orakzai, Faisal Orakzai blockchain, Wikidata Q140264666, Faisal Orakzai ORCID, Faisal Orakzai Shamim Forever"],
          ["property","og:title","Faisal Orakzai — Founder & CEO of Orakzai Bond | Pakistani Blockchain Architect"],
          ["property","og:description","Pakistani entrepreneur born 2006. Founder of Orakzai Bond (OKBOND), Shamim Forever & Orakzai Group. Blockchain architect building world's first capital-protected DeFi bond on Polygon. Wikidata Q140264666."],
          ["property","og:image","https://orakzaibond.com/faisal-orakzai-smiling.jpg"],
          ["property","og:url","https://orakzaibond.com/faisal-orakzai"],
          ["property","og:type","profile"],
          ["property","og:site_name","Orakzai Bond"],
          ["property","profile:first_name","Faisal"],
          ["property","profile:last_name","Orakzai"],
          ["property","profile:username","faisalorakzaii"],
          ["name","twitter:card","summary_large_image"],
          ["name","twitter:site","@faisalorakzaii"],
          ["name","twitter:creator","@faisalorakzaii"],
          ["name","twitter:title","Faisal Orakzai — Founder & CEO, Orakzai Bond"],
          ["name","twitter:description","Pakistani blockchain architect. Founder of Orakzai Bond (OKBOND), world's first capital-protected DeFi bond on Polygon. Born 2006. Wikidata Q140264666."],
          ["name","twitter:image","https://orakzaibond.com/faisal-orakzai-smiling.jpg"],
          ["name","robots","index, follow, max-image-preview:large, max-snippet:-1"],
        ];

        const added: HTMLMetaElement[] = [];
        tags.forEach(([attr, key, val]) => {
          let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
          if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); added.push(el); }
          el.setAttribute("content", val);
        });

        let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canon) { canon = document.createElement("link"); canon.setAttribute("rel","canonical"); document.head.appendChild(canon); }
        canon.setAttribute("href","https://orakzaibond.com/faisal-orakzai");

        // Inject ProfilePage + Person schema
        const ldIds = [
            "faisal-bio-profilepage-ld", "faisal-bio-faq-ld",
            "faisal-bio-standalone-ld", "faisal-bio-breadcrumb-ld",
            "faisal-bio-faqfaisal-ld", "faisal-bio-okbondorg-ld"
          ];
          const ldData = [
            profilePageSchema, faqSchema,
            profilePageStandaloneSchema, breadcrumbSchema,
            faqFaisalSchema, okbondOrgSchema
          ];
        ldIds.forEach((id, i) => {
          let ld = document.getElementById(id) as HTMLScriptElement | null;
          if (!ld) { ld = document.createElement("script") as HTMLScriptElement; ld.id = id; ld.type = "application/ld+json"; document.head.appendChild(ld); }
          ld.textContent = JSON.stringify(ldData[i]);
        });

        return () => {
          document.title = prev;
          added.forEach(el => el.remove());
          ldIds.forEach(id => document.getElementById(id)?.remove());
        };
      }, []);
    }

export default function FaisalOrakzaiBioPage() {
    useSeoHead();
    return (
      <div style={{background:MIDNIGHT,color:"#f3ecd1",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif"}}>
        <style>{HERO_STYLE}</style>

        {/* HERO */}
        <section style={{padding:"100px 20px 70px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"15%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(191,149,63,0.07) 0%,transparent 70%)",pointerEvents:"none"}} />
          <motion.div className="fo-hero-grid" initial="hidden" animate="show" variants={stagger}>

            <motion.div className="fo-hero-portrait" variants={fadeUp} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
              <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{position:"absolute",inset:-5,borderRadius:"50%",background:"conic-gradient(from 0deg,#BF953F,#FCF6BA,#B38728,#FBF5B7,#AA771C,#FCF6BA,#BF953F)",filter:"blur(1px)",opacity:0.9}} />
                <div style={{position:"absolute",inset:4,borderRadius:"50%",background:MIDNIGHT}} />
                <img src="/faisal-orakzai-smiling.jpg" alt="Faisal Orakzai — Founder & CEO of Orakzai Bond, Pakistani Blockchain Entrepreneur"
                  style={{position:"relative",width:240,height:240,borderRadius:"50%",objectFit:"cover",objectPosition:"top center",margin:14}}
                  loading="eager" />
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                <a href="https://www.wikidata.org/wiki/Q140264666" target="_blank" rel="noopener noreferrer"
                  style={{padding:"4px 10px",border:"1px solid rgba(191,149,63,0.45)",color:"#BF953F",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>✓ Wikidata Q140264666</a>
                <a href="https://orcid.org/0009-0000-0915-7272" target="_blank" rel="noopener noreferrer"
                  style={{padding:"4px 10px",border:"1px solid rgba(191,149,63,0.45)",color:"#BF953F",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>✓ ORCID</a>
                <a href="https://en.everybodywiki.com/Faisal_Orakzai" target="_blank" rel="noopener noreferrer"
                  style={{padding:"4px 10px",border:"1px solid rgba(191,149,63,0.45)",color:"#BF953F",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>✓ EverybodyWiki</a>
              </div>
            </motion.div>

            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <motion.div variants={fadeUp}>
                <p style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Founder & CEO · Orakzai Bond · Chairman · Orakzai Group</p>
                <h1 className="fo-h1" style={{fontSize:64,fontWeight:200,letterSpacing:"-0.02em",lineHeight:1.05,margin:0}}>Faisal</h1>
                <h1 className="fo-h1" style={{fontSize:64,fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.05,margin:0,backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Orakzai</h1>
              </motion.div>
              <motion.p variants={fadeUp} style={{color:"#7a7065",fontSize:14,lineHeight:1.8,maxWidth:520,margin:0}}>
                Pakistani entrepreneur born <strong style={{color:"#c9a85c"}}>April 30, 2006</strong> in Orakzai, KPK, Pakistan.
                Building sovereign financial and luxury infrastructure at the intersection of{" "}
                <strong style={{color:"#c9a85c"}}>blockchain architecture</strong>,{" "}
                <strong style={{color:"#c9a85c"}}>capital-protected DeFi</strong>, and heritage luxury commerce.
                Founder of <a href="https://orakzaibond.com" style={{color:"#c9a85c",textDecoration:"none"}}>Orakzai Bond</a> and{" "}
                <a href="https://www.shamimforever.com" style={{color:"#c9a85c",textDecoration:"none"}}>Shamim Forever</a>,
                Chairman of <strong style={{color:"#c9a85c"}}>Orakzai Group</strong>.
              </motion.p>
              <motion.div className="fo-hero-pills" variants={fadeUp} style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Blockchain","DeFi","Capital Protection","Luxury","NFT","Pakistan","Polygon"].map(t=>(
                  <span key={t} style={{padding:"4px 12px",border:"1px solid rgba(191,149,63,0.25)",color:"#BF953F",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase"}}>{t}</span>
                ))}
              </motion.div>
              <motion.div className="fo-hero-stats" variants={fadeUp} style={{display:"flex",gap:32,paddingTop:18,borderTop:"1px solid #111",flexWrap:"wrap"}}>
                {[{n:"3+",l:"Ventures"},{n:"2026",l:"OKBOND Launch"},{n:"67+",l:"Citations"},{n:"24+",l:"Profiles"}].map(s=>(
                  <div key={s.l}>
                    <p style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:20,fontWeight:300,margin:0}}>{s.n}</p>
                    <p style={{color:"#3a3530",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",margin:"4px 0 0"}}>{s.l}</p>
                  </div>
                ))}
              </motion.div>
              <motion.div className="fo-hero-ctas" variants={fadeUp} style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <a href="https://www.linkedin.com/in/faisalorakzaii" target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",border:"1px solid rgba(191,149,63,0.6)",color:"#BF953F",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>LinkedIn</a>
                <Link href="/founder"
                  style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",border:"1px solid #BF953F",backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>
                  Full Founder Story <ArrowRight size={12}/>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ORGANIZATION PANEL */}
        <section style={{padding:"60px 20px",borderTop:"1px solid #111"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:32}}>Organization Panel</motion.p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:1,background:"#111"}}>
                {ORG_PANEL.map(o=>(
                  <motion.div key={o.org} variants={fadeUp} style={{background:MIDNIGHT,padding:"28px 32px",display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        {o.url
                          ? <a href={o.url} target="_blank" rel="noopener noreferrer" style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:18,fontWeight:300,textDecoration:"none",display:"block"}}>{o.org}</a>
                          : <p style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:18,fontWeight:300,margin:0}}>{o.org}</p>}
                        <p style={{color:"#f3ecd1",fontSize:12,marginTop:4,marginBottom:0}}>{o.role}</p>
                      </div>
                      <span style={{color:"#3a3530",fontSize:11,letterSpacing:"0.1em"}}>{o.since}</span>
                    </div>
                    <p style={{color:"#3a3530",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",margin:0}}>{o.badge}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* EDUCATION */}
        <section style={{padding:"60px 20px",borderTop:"1px solid #111"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:32}}>Education</motion.p>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[
                  {name:"Y Combinator",detail:"Startup Accelerator — Entrepreneurship / Entrepreneurial Studies",period:"Jun 2026 – Present"},
                  {name:"Founder Institute",detail:"Founder Program, Karachi (South Asia 2026) — Venture Building",period:"Apr 2025 – Sep 2026"},
                  {name:"Ziauddin University",detail:"Matriculation in Sciences — Islamiat, Pakistan Studies, Civics (Board of Secondary Education)",period:"Apr 2024 – Apr 2026"},
                  {name:"Global Self-Education Platform (GSEP)",detail:"Silent Empire Building — Business Analysis, Advertising",period:"Jan 2019 – Present"},
                  {name:"Yahya Public School, Kohat",detail:"Early education",period:""},
                  {name:"Madrassa Mahad-ul-Uleman, Kohat",detail:"Early education",period:""},
                ].map(e=>(
                  <div key={e.name} style={{borderTop:"1px solid #111",padding:"18px 0",display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
                    <div>
                      <p style={{color:"#f3ecd1",fontSize:14,fontWeight:500,margin:"0 0 4px"}}>{e.name}</p>
                      <p style={{color:"#5a554d",fontSize:12,lineHeight:1.6,margin:0}}>{e.detail}</p>
                    </div>
                    {e.period && <span style={{color:"#3a3530",fontSize:11,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>{e.period}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* TIMELINE */}
        <section style={{padding:"60px 20px",borderTop:"1px solid #111"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:40}}>Timeline</motion.p>
              <div style={{position:"relative",paddingLeft:40}}>
                <div style={{position:"absolute",left:0,top:8,bottom:8,width:1,background:"linear-gradient(to bottom,transparent,#BF953F,transparent)"}} />
                {TIMELINE.map((t,i)=>(
                  <motion.div key={t.year} variants={fadeUp} style={{display:"flex",gap:28,marginBottom:i<TIMELINE.length-1?40:0}}>
                    <div style={{flexShrink:0,width:60,textAlign:"right"}}>
                      <span style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:13,fontWeight:500}}>{t.year}</span>
                    </div>
                    <div>
                      <p style={{color:"#f3ecd1",fontSize:14,fontWeight:500,margin:"0 0 6px"}}>{t.title}</p>
                      <p style={{color:"#5a554d",fontSize:13,lineHeight:1.7,margin:0}}>{t.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* VENTURES */}
        <section style={{padding:"60px 20px",borderTop:"1px solid #111"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:40}}>Ventures</motion.p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
                {VENTURES.map(v=>(
                  <motion.div key={v.name} variants={fadeUp} style={{border:"1px solid #141414",padding:"28px",display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <p style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:16,fontWeight:400,margin:0}}>{v.name}</p>
                      <span style={{color:"#2a2520",fontSize:11}}>{v.year}</span>
                    </div>
                    <p style={{color:"#BF953F",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",margin:0}}>{v.role}</p>
                    <p style={{color:"#5a554d",fontSize:13,lineHeight:1.7,margin:0}}>{v.desc}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                      {v.tags.map(t=><span key={t} style={{padding:"2px 8px",border:"1px solid #1a1a1a",color:"#3a3530",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase"}}>{t}</span>)}
                    </div>
                    {v.url && <a href={v.url} target="_blank" rel="noopener noreferrer" style={{color:"#BF953F",fontSize:11,textDecoration:"none",display:"flex",alignItems:"center",gap:4,marginTop:4}}>Visit <ChevronRight size={12}/></a>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ALL LINKS */}
        <section style={{padding:"60px 20px",borderTop:"1px solid #111"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:32}}>All Official Profiles & Links</motion.p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:"#0d0d0d"}}>
                {LINKS.map(lk=>(
                  <motion.a key={lk.l} href={lk.u} target="_blank" rel="noopener noreferrer" variants={fadeUp}
                    style={{display:"block",padding:"14px 18px",background:MIDNIGHT,color:"#7a7065",fontSize:12,textDecoration:"none"}}
                    onMouseEnter={e=>(e.currentTarget.style.color="#BF953F")}
                    onMouseLeave={e=>(e.currentTarget.style.color="#7a7065")}>
                    {lk.l} <ExternalLink size={10} style={{display:"inline",marginLeft:4,opacity:0.4}}/>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{padding:"70px 20px 80px",borderTop:"1px solid #111"}} itemScope itemType="https://schema.org/FAQPage">
          <div style={{maxWidth:800,margin:"0 auto"}}>
            <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:8}}>FAQ</motion.p>
              <motion.h2 variants={fadeUp} style={{fontSize:28,fontWeight:200,color:"#f3ecd1",marginTop:0,marginBottom:40}}>Frequently Asked Questions — Faisal Orakzai</motion.h2>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {FAQS.map((faq,i)=>(
                  <motion.div key={i} variants={fadeUp} itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                    style={{borderTop:"1px solid #111",padding:"24px 0"}}>
                    <h3 itemProp="name" style={{color:"#c9a85c",fontSize:14,fontWeight:500,margin:"0 0 10px"}}>{faq.q}</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p itemProp="text" style={{color:"#5a554d",fontSize:13,lineHeight:1.8,margin:0}}>{faq.a}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section style={{padding:"50px 20px",borderTop:"1px solid #111",textAlign:"center"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={fadeUp}>
            <p style={{color:"#3a3530",fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:20}}>Explore Orakzai Bond</p>
            <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 32px",border:"1px solid rgba(191,149,63,0.5)",backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>
              Visit orakzaibond.com <ArrowRight size={12}/>
            </Link>
          </motion.div>
        </section>
      </div>
    );
  }
  