import { useEffect } from "react";
  import { motion } from "framer-motion";
  import { Link } from "wouter";
  import { ExternalLink, ChevronRight, ArrowRight } from "lucide-react";

  const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
  const MIDNIGHT = "#05060A";
  const TODAY = "2026-06-25";

  function useSeoHead() {
    useEffect(() => {
      const prev = document.title;
      document.title = "Faisal Orakzai — Founder & CEO of Orakzai Bond | Blockchain Architect";
      const tags: Array<[string,string,string]> = [
        ["name","description","Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — world's first capital-protected decentralized bond on Polygon. Born April 30, 2006, Orakzai Pakistan. Blockchain architect, DeFi builder, luxury brand founder. Wikidata Q140264666."],
        ["name","keywords","Faisal Orakzai, Chairman Faisal Orakzai, Faisal Orakzai Orakzai Bond, faisalorakzaii, OKBOND founder, Orakzai Bond CEO, Pakistani blockchain entrepreneur, DeFi founder Pakistan, Malak Faisal Orakzai, Faisal Orakzai blockchain, Wikidata Q140264666"],
        ["property","og:title","Faisal Orakzai — Founder & CEO of Orakzai Bond | Pakistani Blockchain Architect"],
        ["property","og:description","Pakistani entrepreneur born 2006. Founder of Orakzai Bond (OKBOND), Shamim Forever & Orakzai Group. Blockchain architect building world's first capital-protected DeFi bond on Polygon. Wikidata Q140264666."],
        ["property","og:image","https://orakzaibond.com/faisal-orakzai.jpg"],
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
        ["name","twitter:image","https://orakzaibond.com/faisal-orakzai.jpg"],
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

      const ldId = "faisal-bio-ld";
      let ld = document.getElementById(ldId) as HTMLScriptElement | null;
      if (!ld) { ld = document.createElement("script") as HTMLScriptElement; ld.id = ldId; ld.type = "application/ld+json"; document.head.appendChild(ld); }
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ProfilePage",
            "@id": "https://orakzaibond.com/faisal-orakzai#profilepage",
            "url": "https://orakzaibond.com/faisal-orakzai",
            "name": "Faisal Orakzai — Founder & CEO of Orakzai Bond | Pakistani Blockchain Architect",
            "description": "Official profile page of Faisal Orakzai, Founder & CEO of Orakzai Bond (OKBOND), Pakistani blockchain architect and entrepreneur. Wikidata Q140264666.",
            "datePublished": "2026-01-01",
            "dateModified": TODAY,
            "inLanguage": "en",
            "isPartOf": {"@id":"https://orakzaibond.com/#website"},
            "about": {"@id":"https://www.wikidata.org/wiki/Q140264666"},
            "mainEntity": {"@id":"https://www.wikidata.org/wiki/Q140264666"},
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {"@type":"ListItem","position":1,"name":"Home","item":"https://orakzaibond.com/"},
                {"@type":"ListItem","position":2,"name":"Faisal Orakzai","item":"https://orakzaibond.com/faisal-orakzai"}
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
            "alternateName": ["Chairman Faisal Orakzai","Malak Faisal Orakzai","faisalorakzaii","Faisal Orakzai OKBOND"],
            "disambiguatingDescription": "Pakistani entrepreneur and blockchain architect (born 30 April 2006, Tirah, Orakzai). Founder of Orakzai Bond (OKBOND) and Shamim Forever. Not to be confused with Dr. Faisal Moeen Orakzai, who is a separate individual.",
            "description": "Faisal Orakzai (born 30 April 2006, Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan) is a Pakistani blockchain architect and serial entrepreneur. Founder & CEO of Orakzai Bond (OKBOND) — the world's first capital-protected decentralized bond on Polygon. Founder & Chairman of Shamim Forever luxury house. Chairman of Orakzai Group. Stevie® Gold Award winner 2026.",
            "url": "https://orakzaibond.com/faisal-orakzai",
            "mainEntityOfPage": "https://orakzaibond.com/faisal-orakzai",
            "image": {"@type":"ImageObject","url":"https://orakzaibond.com/faisal-orakzai.jpg","width":1080,"height":1080,"caption":"Faisal Orakzai — Founder & CEO of Orakzai Bond, Pakistani Blockchain Entrepreneur"},
            "birthDate": "2006-04-30",
            "birthPlace": {
              "@type": "Place",
              "name": "Tirah, Orakzai, Khyber Pakhtunkhwa, Pakistan",
              "addressRegion": "Khyber Pakhtunkhwa",
              "addressCountry": "PK",
              "geo": {"@type":"GeoCoordinates","latitude":33.6,"longitude":70.2}
            },
            "nationality": {"@type":"Country","name":"Pakistan"},
            "gender": "Male",
            "jobTitle": ["Founder & CEO","Chairman","Blockchain Architect","Quantitative Fintech Engineer"],
            "award": [
              "Stevie® Gold Award — Best Young Entrepreneur, 2026 International Business Awards (Orakzai Group SMC)",
              "NUST 50 Under 50 — Entrepreneurship"
            ],
            "worksFor": [
              {"@type":"Organization","name":"Orakzai Bond","url":"https://orakzaibond.com","@id":"https://orakzaibond.com/#organization","foundingDate":"2026"},
              {"@type":"Organization","name":"Shamim Forever","url":"https://www.shamimforever.com","foundingDate":"2023"},
              {"@type":"Organization","name":"Orakzai Group","foundingDate":"2023"}
            ],
            "owns": [
              {"@type":"Organization","name":"Orakzai Bond (OKBOND)","url":"https://orakzaibond.com"},
              {"@type":"Organization","name":"Shamim Forever","url":"https://www.shamimforever.com"},
              {"@type":"Organization","name":"Orakzai Group SMC"}
            ],
            "alumniOf": {"@type":"CollegeOrUniversity","name":"Ziauddin University","url":"https://zu.edu.pk","address":{"@type":"PostalAddress","addressLocality":"Karachi","addressRegion":"Sindh","addressCountry":"PK"}},
            "knowsAbout": ["Blockchain Architecture","Decentralized Finance","Smart Contracts","Polygon Network","Capital Protection","Luxury Commerce","Real Asset Tokenization","Quantitative Finance","NFT","Web3","DeFi Protocol Design"],
            "identifier": [
              {"@type":"PropertyValue","propertyID":"ORCID","value":"0009-0000-0915-7272","url":"https://orcid.org/0009-0000-0915-7272"},
              {"@type":"PropertyValue","propertyID":"Wikidata","value":"Q140264666","url":"https://www.wikidata.org/wiki/Q140264666"}
            ],
            "sameAs": [
              "https://www.wikidata.org/wiki/Q140264666",
              "https://orcid.org/0009-0000-0915-7272",
              "https://scholar.google.com/citations?user=ER8h90UAAAAJ",
              "https://www.crunchbase.com/person/faisal-orakzai",
              "https://www.linkedin.com/in/faisalorakzaii",
              "https://x.com/faisalorakzaii",
              "https://www.instagram.com/faisalorakzaii",
              "https://web.facebook.com/faisalorakzaii",
              "https://tiktok.com/@chairmanorakzai",
              "https://github.com/faisalorakzai-lab",
              "https://linktr.ee/faisalorakzaiofficial",
              "https://peerlist.io/faisalorakzai",
              "https://hackernoon.com/u/faisalorakzai",
              "https://www.genglobal.org/user/faisal1",
              "https://www.shamimforever.com/faisal-orakzai",
              "https://en.everybodywiki.com/Faisal_Orakzai",
              "https://www.f6s.com/faisalorakzai",
              "https://pa.bio/faisalorakzaii",
              "https://bio.site/faisalorakzai",
              "https://www.pinterest.com/faisalorakzaii",
              "https://theorg.com/org/orakzai-bond?person=faisal-orakzai",
              "https://orakzaibond.com/founder",
              "https://www.shamimforever.com/founder"
            ]
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {"@type":"Question","name":"Who is Faisal Orakzai?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai (born April 30, 2006, Orakzai, Pakistan) is a Pakistani blockchain architect and serial entrepreneur — Founder & CEO of Orakzai Bond (OKBOND), the world's first capital-protected decentralized bond on Polygon, and Founder & Chairman of Shamim Forever luxury house."}},
              {"@type":"Question","name":"What is Faisal Orakzai known for?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai is known for founding Orakzai Bond (OKBOND) in 2026 — the world's first capital-protected DeFi bond on Polygon. He also founded Shamim Forever in 2023, a global digital luxury house, and chairs Orakzai Group."}},
              {"@type":"Question","name":"What companies did Faisal Orakzai found?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai founded: (1) Orakzai Bond (OKBOND) in 2026 — world's first capital-protected DeFi bond on Polygon; (2) Shamim Forever in 2023 — global digital luxury house; (3) Orakzai Group in 2023 — strategic holding company for blockchain and luxury ventures."}},
              {"@type":"Question","name":"Where is Faisal Orakzai from?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai is from Orakzai, Khyber Pakhtunkhwa, Pakistan. He is based in Karachi and studied at Ziauddin University."}},
              {"@type":"Question","name":"Is Faisal Orakzai on Wikipedia?","acceptedAnswer":{"@type":"Answer","text":"Yes. Faisal Orakzai has an official entry on Wikidata (Q140264666) and EverybodyWiki. His ORCID is 0009-0000-0915-7272. He also appears on Crunchbase, TheOrg, F6S, and Y Combinator Startup School."}},
              {"@type":"Question","name":"What is Faisal Orakzai's social media?","acceptedAnswer":{"@type":"Answer","text":"Official handles: Twitter/X: @faisalorakzaii, Instagram: @faisalorakzaii, TikTok: @chairmanorakzai, LinkedIn: linkedin.com/in/faisalorakzaii, Facebook: facebook.com/faisalorakzaii, GitHub: github.com/faisalorakzai-lab, Linktree: linktr.ee/faisalorakzaiofficial."}},
              {"@type":"Question","name":"How can I contact Faisal Orakzai?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai can be reached through orakzaibond.com/contact, via LinkedIn at linkedin.com/in/faisalorakzaii, or through X @faisalorakzaii."}},
              {"@type":"Question","name":"What is Faisal Orakzai's role in Orakzai Bond?","acceptedAnswer":{"@type":"Answer","text":"Faisal Orakzai is the Founder & CEO and Chairman of Orakzai Bond. He architected the OKBOND protocol — the world's first capital-protected decentralized bond on Polygon — combining quantitative fintech infrastructure with real-asset backing."}}
            ]
          }
        ]
      });

      return () => {
        document.title = prev;
        if (ld) ld.remove();
        added.forEach(el => el.remove());
      };
    }, []);
  }

  const fadeUp = { hidden:{opacity:0,y:28}, show:{opacity:1,y:0,transition:{duration:0.55,ease:"easeOut"}} };
  const stagger = { hidden:{}, show:{transition:{staggerChildren:0.07}} };

  const TIMELINE = [
    {year:"2018",title:"The Foundation",    body:"Entered Real Estate, building the initial vision for asset-backed wealth creation across Pakistan."},
    {year:"2021",title:"Test of Character", body:"Amid a global market crash, chose character over capital — paused operations to personally ensure investors faced zero loss."},
    {year:"2023",title:"Empire Begins",     body:"Founded Shamim Forever (global luxury house) and Orakzai Group — building institutions designed to last generations."},
    {year:"2026",title:"OKBOND Launch",     body:"Launched Orakzai Bond — world's first capital-protected decentralized bond on Polygon. The culmination of a decade-long vision."},
  ];

  const VENTURES = [
    {name:"Orakzai Bond",  role:"Founder & CEO",     year:"2026",desc:"World's first capital-protected decentralized bond on Polygon. Quantitative fintech + real-asset backing.",url:"https://orakzaibond.com",tags:["DeFi","Blockchain","Polygon"]},
    {name:"Shamim Forever",role:"Founder & Chairman", year:"2023",desc:"Sovereign digital luxury house — bespoke fragrances, high jewellery, blockchain-verified couture.",url:"https://www.shamimforever.com",tags:["Luxury","E-Commerce","NFT"]},
    {name:"Orakzai Group", role:"Chairman",            year:"2023",desc:"Strategic holding company overseeing digital innovation, luxury commerce, and blockchain ventures globally.",url:null,tags:["Holdings","Investment","Strategy"]},
  ];

  const LINKS = [
    {l:"LinkedIn",      u:"https://www.linkedin.com/in/faisalorakzaii"},
    {l:"X / Twitter",  u:"https://x.com/faisalorakzaii"},
    {l:"Instagram",    u:"https://www.instagram.com/faisalorakzaii"},
    {l:"TikTok",       u:"https://tiktok.com/@chairmanorakzai"},
    {l:"Facebook",     u:"https://web.facebook.com/faisalorakzaii"},
    {l:"GitHub",       u:"https://github.com/faisalorakzai-lab"},
    {l:"Crunchbase",   u:"https://www.crunchbase.com/person/faisal-orakzai"},
    {l:"Peerlist",     u:"https://peerlist.io/faisalorakzai"},
    {l:"HackerNoon",   u:"https://hackernoon.com/u/faisalorakzai"},
    {l:"Wikidata",     u:"https://www.wikidata.org/wiki/Q140264666"},
    {l:"ORCID",        u:"https://orcid.org/0009-0000-0915-7272"},
    {l:"GEN Global",   u:"https://www.genglobal.org/user/faisal1"},
    {l:"Y Combinator", u:"https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2"},
    {l:"F6S",          u:"https://www.f6s.com/faisalorakzai"},
    {l:"Linktree",     u:"https://linktr.ee/faisalorakzaiofficial"},
    {l:"Shamim Forever",u:"https://www.shamimforever.com/faisal-orakzai"},
    {l:"EverybodyWiki",u:"https://en.everybodywiki.com/Faisal_Orakzai"},
    {l:"Pinterest",    u:"https://www.pinterest.com/faisalorakzaii"},
    {l:"TheOrg",       u:"https://theorg.com/org/orakzai-bond?person=faisal-orakzai"},
    {l:"Gust",         u:"https://gust.com/user/014bee5e-1c09-4f2d-b5ae-f5c937bbcc0e"},
    {l:"BeBee",        u:"https://bebee.com/pk/people/faisalorakzai"},
    {l:"pa.bio",       u:"https://pa.bio/faisalorakzaii"},
    {l:"bio.site",     u:"https://bio.site/faisalorakzai"},
    {l:"LeetCode",     u:"https://leetcode.com/u/faisalorakzai/"},
  ];

  const FAQS = [
    {q:"Who is Faisal Orakzai?",a:"Faisal Orakzai (born April 30, 2006, Orakzai, Pakistan) is a Pakistani blockchain architect and serial entrepreneur. He is the Founder & CEO of Orakzai Bond (OKBOND) — the world's first capital-protected decentralized bond on Polygon blockchain — and Founder & Chairman of Shamim Forever global luxury house."},
    {q:"What is Faisal Orakzai known for?",a:"Faisal Orakzai is known for founding Orakzai Bond (OKBOND) in 2026 — the world's first capital-protected DeFi bond on Polygon. He also founded Shamim Forever in 2023, a global digital luxury house, and chairs Orakzai Group, a strategic holding company."},
    {q:"What blockchain projects has Faisal Orakzai built?",a:"Faisal Orakzai architected the OKBOND protocol on Polygon with capital-protected bond tokens, smart contract staking, time-bound liquidity pools, and DeFi lotteries. He also integrated blockchain-verified NFT couture with Shamim Forever luxury house."},
    {q:"Where can I find Faisal Orakzai's official profiles?",a:"Official profiles: Wikidata Q140264666, ORCID 0009-0000-0915-7272, LinkedIn /in/faisalorakzaii, X @faisalorakzaii, Crunchbase, EverybodyWiki, Peerlist, Linktree. Official websites: orakzaibond.com and shamimforever.com."},
    {q:"Is Faisal Orakzai on Wikipedia or Wikidata?",a:"Yes. Faisal Orakzai has an official entry on Wikidata (Q140264666) and EverybodyWiki. His ORCID researcher profile is 0009-0000-0915-7272. He also appears on Crunchbase, TheOrg, F6S, and Y Combinator Startup School."},
    {q:"What companies did Faisal Orakzai found?",a:"Faisal Orakzai founded: (1) Orakzai Bond (OKBOND) in 2026 — world's first capital-protected DeFi bond on Polygon; (2) Shamim Forever in 2023 — global digital luxury house; (3) Orakzai Group in 2023 — strategic holding company for blockchain and luxury ventures globally."},
    {q:"What is Faisal Orakzai's social media?",a:"Official handles: Twitter/X: @faisalorakzaii, Instagram: @faisalorakzaii, TikTok: @chairmanorakzai, LinkedIn: linkedin.com/in/faisalorakzaii, Facebook: facebook.com/faisalorakzaii, GitHub: github.com/faisalorakzai-lab, Linktree: linktr.ee/faisalorakzaiofficial."},
    {q:"How can I contact Faisal Orakzai?",a:"Faisal Orakzai can be reached through orakzaibond.com/contact, via LinkedIn at linkedin.com/in/faisalorakzaii, or through X @faisalorakzaii. Business enquiries for Shamim Forever: shamimforever.com."},
  ];

  const ORG_PANEL = [
    {org:"Orakzai Bond",  role:"Founder & CEO / Chairman",since:"2026",url:"https://orakzaibond.com",      badge:"DeFi · Blockchain · Polygon"},
    {org:"Shamim Forever",role:"Founder & Chairman",      since:"2023",url:"https://www.shamimforever.com",badge:"Luxury · NFT · E-Commerce"},
    {org:"Orakzai Group", role:"Chairman",                since:"2023",url:null,                           badge:"Holdings · Investment · Strategy"},
  ];

  const HERO_STYLE = `
    .fo-hero-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:280px 1fr;gap:56px;align-items:center;}
    @media(max-width:768px){
      .fo-hero-grid{grid-template-columns:1fr;gap:32px;text-align:center;}
      .fo-hero-portrait{margin:0 auto;}
      .fo-hero-pills,.fo-hero-stats,.fo-hero-ctas{justify-content:center!important;flex-wrap:wrap;}
      .fo-h1{font-size:44px!important;}
    }
  `;

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
                <img src="/faisal-orakzai.jpg" alt="Faisal Orakzai — Founder & CEO of Orakzai Bond, Pakistani Blockchain Entrepreneur"
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
  