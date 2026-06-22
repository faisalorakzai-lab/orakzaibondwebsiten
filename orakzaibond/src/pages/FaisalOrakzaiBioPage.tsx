import { useEffect } from "react";
  import { motion } from "framer-motion";
  import { Link } from "wouter";
  import {
    ExternalLink, Linkedin, Globe2, ShieldCheck,
    Twitter, Github, BookOpen, Award, Briefcase,
    ChevronRight, ArrowRight,
  } from "lucide-react";

  const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
  const MIDNIGHT = "#05060A";

  // ── SEO: update document <head> for this route ──
  function useSeoHead() {
    useEffect(() => {
      document.title = "Faisal Orakzai — Founder & CEO of Orakzai Bond | Blockchain Architect";
      const metas: Array<[string, string, string]> = [
        ["name",     "description", "Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — the world's first capital-protected decentralized bond. Born April 30, 2006 in Pakistan. Blockchain architect, DeFi builder, and luxury brand founder."],
        ["name",     "keywords",    "Faisal Orakzai, Faisal Orakzai Orakzai Bond, Chairman Faisal Orakzai, faisalorakzaii, OKBOND founder, Orakzai Bond CEO, Pakistani blockchain entrepreneur, DeFi founder Pakistan, Faisal Orakzai biography"],
        ["property", "og:title",    "Faisal Orakzai — Founder & CEO of Orakzai Bond"],
        ["property", "og:description", "Pakistani entrepreneur born 2006. Founder of Orakzai Bond, Shamim Forever & Orakzai Group. Blockchain architect building the world's first capital-protected DeFi bond."],
        ["property", "og:image",    "https://orakzaibond.com/faisal-orakzai.jpg"],
        ["property", "og:url",      "https://orakzaibond.com/faisal-orakzai"],
        ["property", "og:type",     "profile"],
        ["name",     "twitter:card",  "summary_large_image"],
        ["name",     "twitter:title", "Faisal Orakzai — Founder of Orakzai Bond"],
        ["name",     "twitter:image","https://orakzaibond.com/faisal-orakzai.jpg"],
        ["name",     "robots",       "index, follow, max-image-preview:large"],
      ];
      const existing: HTMLMetaElement[] = [];
      metas.forEach(([attr, key, content]) => {
        let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
        if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); existing.push(el); }
        el.setAttribute("content", content);
      });
      // canonical
      let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
      canon.href = "https://orakzaibond.com/faisal-orakzai";
      // JSON-LD
      const ldId = "faisal-bio-jsonld";
      let ldEl = document.getElementById(ldId);
      if (!ldEl) { ldEl = document.createElement("script"); ldEl.id = ldId; (ldEl as HTMLScriptElement).type = "application/ld+json"; document.head.appendChild(ldEl); }
      ldEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": "https://www.shamimforever.com/faisal-orakzai#person",
            "name": "Faisal Orakzai",
            "givenName": "Faisal", "familyName": "Orakzai", "additionalName": "Moeen",
            "alternateName": ["Chairman Faisal Orakzai","Malak Faisal Orakzai","faisalorakzaii","Faisal Moeen Orakzai"],
            "description": "Founder & CEO of Orakzai Bond (OKBOND). Pakistani entrepreneur born April 30, 2006. Blockchain architect, DeFi builder, and luxury brand founder.",
            "url": "https://orakzaibond.com/faisal-orakzai",
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://orakzaibond.com/faisal-orakzai" },
            "image": { "@type": "ImageObject", "url": "https://orakzaibond.com/faisal-orakzai.jpg", "width": 1080, "height": 1080, "caption": "Faisal Orakzai — Founder & CEO, Orakzai Bond" },
            "birthDate": "2006-04-30",
            "birthPlace": { "@type": "Place", "name": "Pakistan", "addressCountry": "PK" },
            "nationality": { "@type": "Country", "name": "Pakistan" },
            "gender": "Male",
            "jobTitle": ["Founder & CEO","Chairman","Blockchain Architect","Entrepreneur"],
            "worksFor": [
              { "@type": "Organization", "name": "Orakzai Bond", "url": "https://orakzaibond.com", "foundingDate": "2026" },
              { "@type": "Organization", "name": "Shamim Forever", "url": "https://www.shamimforever.com", "foundingDate": "2023" },
              { "@type": "Organization", "name": "Orakzai Group" }
            ],
            "founder": [
              { "@type": "Organization", "name": "Orakzai Bond", "url": "https://orakzaibond.com" },
              { "@type": "Organization", "name": "Shamim Forever", "url": "https://www.shamimforever.com" }
            ],
            "identifier": [
              { "@type": "PropertyValue", "propertyID": "ORCID",     "value": "0009-0000-0915-7272", "url": "https://orcid.org/0009-0000-0915-7272" },
              { "@type": "PropertyValue", "propertyID": "Wikidata",  "value": "Q140264666",           "url": "https://www.wikidata.org/wiki/Q140264666" },
              { "@type": "PropertyValue", "propertyID": "Crunchbase","value": "faisal-orakzai",        "url": "https://www.crunchbase.com/person/faisal-orakzai" }
            ],
            "knowsAbout": ["Blockchain Architecture","Decentralized Finance","Capital-Protected Bonds","Luxury Commerce","NFT Technology","Tokenomics","DeFi Protocol","Asset Tokenization","Smart Contracts"],
            "sameAs": [
              "https://www.wikidata.org/wiki/Q140264666",
              "https://orcid.org/0009-0000-0915-7272",
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
              "https://www.f6s.com/faisalorakzai",
              "https://theorg.com/org/orakzai-bond?person=faisal-orakzai",
              "https://www.genglobal.org/user/faisal1",
              "https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2",
              "https://leetcode.com/u/faisalorakzai/",
              "https://www.shamimforever.com/faisal-orakzai",
              "https://www.shamimforever.com/founder",
              "https://orakzaibond.com/founder"
            ]
          }
        ]
      });
      return () => {
        document.title = "Orakzai Bond — OKBOND | World's First Capital-Protected Decentralized Bond";
        if (ldEl) ldEl.remove();
      };
    }, []);
  }

  // ── Fade-in animation variant ──
  const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  const SOCIALS = [
    { label: "LinkedIn",      url: "https://www.linkedin.com/in/faisalorakzaii",     icon: Linkedin },
    { label: "X / Twitter",   url: "https://x.com/faisalorakzaii",                   icon: Twitter },
    { label: "GitHub",        url: "https://github.com/faisalorakzai-lab",            icon: Github },
    { label: "HackerNoon",    url: "https://hackernoon.com/u/faisalorakzai",          icon: BookOpen },
    { label: "Crunchbase",    url: "https://www.crunchbase.com/person/faisal-orakzai",icon: Briefcase },
    { label: "Wikidata",      url: "https://www.wikidata.org/wiki/Q140264666",        icon: Globe2 },
    { label: "ORCID",         url: "https://orcid.org/0009-0000-0915-7272",           icon: Award },
    { label: "Y Combinator",  url: "https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2", icon: ShieldCheck },
  ];

  const VENTURES = [
    { name: "Orakzai Bond",   role: "Founder & CEO",      year: "2026", desc: "World's first capital-protected decentralized bond on Polygon. Quantitative fintech + real-asset backing.", url: "https://orakzaibond.com", tags: ["DeFi","Blockchain","Polygon"] },
    { name: "Shamim Forever", role: "Founder & Chairman",  year: "2023", desc: "Sovereign digital luxury house — bespoke fragrances, high jewellery, and blockchain-verified couture.", url: "https://www.shamimforever.com", tags: ["Luxury","E-Commerce","NFT"] },
    { name: "Orakzai Group",  role: "Chairman",            year: "2023", desc: "Strategic holding company overseeing digital innovation, luxury commerce, and blockchain ventures globally.", url: null, tags: ["Holdings","Investment","Strategy"] },
  ];

  const TIMELINE = [
    { year: "2018", title: "The Foundation",        body: "Entered the Real Estate sector, building the initial vision for asset-backed wealth creation." },
    { year: "2021", title: "The Test of Character", body: "Amid a global market crash, chose character over capital — paused operations to personally ensure investors faced zero loss." },
    { year: "2023", title: "Empire Begins",         body: "Founded Shamim Forever (global luxury house) and Orakzai Group — building institutions designed to last generations." },
    { year: "2026", title: "OKBOND Launch",         body: "Launched Orakzai Bond — the world's first capital-protected decentralized bond. The culmination of a decade-long vision." },
  ];

  export default function FaisalOrakzaiBioPage() {
    useSeoHead();

    return (
      <div style={{ background: MIDNIGHT, color: "#f3ecd1", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>

        {/* ── HERO ── */}
        <section style={{ padding: "100px 24px 60px", position: "relative", overflow: "hidden" }}>
          {/* Glow blob */}
          <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(191,149,63,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

          <motion.div initial="hidden" animate="show" variants={stagger} style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"300px 1fr", gap:64, alignItems:"center", position:"relative" }}>

            {/* ── CIRCULAR PORTRAIT ── */}
            <motion.div variants={fadeUp} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
              <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                {/* Gold ring */}
                <div style={{ position:"absolute", inset:-5, borderRadius:"50%", background:"conic-gradient(from 0deg,#BF953F,#FCF6BA,#B38728,#FBF5B7,#AA771C,#FCF6BA,#BF953F)", filter:"blur(1px)", opacity:0.85 }} />
                <div style={{ position:"absolute", inset:4, borderRadius:"50%", background:MIDNIGHT }} />
                <div style={{ position:"absolute", inset:11, borderRadius:"50%", border:"1px solid rgba(191,149,63,0.25)" }} />
                <img
                  src="/faisal-orakzai.jpg"
                  alt="Faisal Orakzai — Founder & CEO of Orakzai Bond, Pakistani Entrepreneur"
                  style={{ position:"relative", width:260, height:260, borderRadius:"50%", objectFit:"cover", objectPosition:"top center", margin:15 }}
                  loading="eager"
                />
              </div>

              {/* Verified badges */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                {[
                  { l:"✓ Wikidata", u:"https://www.wikidata.org/wiki/Q140264666" },
                  { l:"✓ ORCID",    u:"https://orcid.org/0009-0000-0915-7272" },
                ].map(b => (
                  <a key={b.l} href={b.u} target="_blank" rel="noopener noreferrer" style={{ padding:"4px 10px", border:"1px solid rgba(191,149,63,0.5)", color:"#BF953F", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", textDecoration:"none" }}>{b.l}</a>
                ))}
              </div>
            </motion.div>

            {/* ── TEXT ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <motion.div variants={fadeUp}>
                <p style={{ color:"#BF953F", fontSize:11, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Founder & CEO · Orakzai Bond</p>
                <h1 style={{ fontSize:70, fontWeight:200, letterSpacing:"-0.02em", lineHeight:1, margin:0 }}>Faisal</h1>
                <h1 style={{ fontSize:70, fontWeight:300, letterSpacing:"-0.02em", lineHeight:1, margin:0, backgroundImage:GOLD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Orakzai</h1>
              </motion.div>

              <motion.p variants={fadeUp} style={{ color:"#8b8070", fontSize:15, lineHeight:1.8, maxWidth:520, margin:0 }}>
                Pakistani entrepreneur born April 30, 2006. Building the world's sovereign financial and luxury infrastructure at the intersection of{" "}
                <strong style={{ color:"#d4b87a" }}>blockchain architecture</strong>,{" "}
                <strong style={{ color:"#d4b87a" }}>capital-protected DeFi</strong>, and heritage luxury commerce.
              </motion.p>

              {/* Pills */}
              <motion.div variants={fadeUp} style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {["Blockchain","DeFi","Capital Protection","Luxury","NFT","Pakistan"].map(t => (
                  <span key={t} style={{ padding:"4px 12px", border:"1px solid rgba(191,149,63,0.3)", color:"#BF953F", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" }}>{t}</span>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} style={{ display:"flex", gap:36, paddingTop:20, borderTop:"1px solid #111" }}>
                {[
                  { n:"3+",    l:"Ventures" },
                  { n:"2026",  l:"OKBOND Launch" },
                  { n:"67+",   l:"Citations" },
                  { n:"24+",   l:"Verified Profiles" },
                ].map(s => (
                  <div key={s.l}>
                    <p style={{ backgroundImage:GOLD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:22, fontWeight:300, margin:0 }}>{s.n}</p>
                    <p style={{ color:"#3a3530", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", margin:"4px 0 0" }}>{s.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp} style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <a href="https://www.linkedin.com/in/faisalorakzaii" target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", border:"1px solid rgba(191,149,63,0.6)", color:"#BF953F", fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase", textDecoration:"none" }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
                <Link href="/founder"
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", backgroundImage:GOLD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", border:"1px solid #BF953F", fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase", textDecoration:"none" }}>
                  Founder Page <ArrowRight size={14} />
                </Link>
                <a href="https://www.shamimforever.com/faisal-orakzai" target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", border:"1px solid #222", color:"#6b6055", fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase", textDecoration:"none" }}>
                  Shamim Forever <ExternalLink size={12} />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── BIOGRAPHY ── */}
        <section style={{ padding:"80px 24px", background:"#070809", borderTop:"1px solid #0d0d0d" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} style={{ maxWidth:860, margin:"0 auto" }}>
            <motion.p variants={fadeUp} style={{ color:"#BF953F", fontSize:10, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Biography</motion.p>
            <motion.h2 variants={fadeUp} style={{ color:"#f3ecd1", fontSize:30, fontWeight:300, letterSpacing:"-0.01em", marginTop:0, marginBottom:36 }}>About Faisal Orakzai</motion.h2>
            <motion.div variants={stagger} style={{ display:"flex", flexDirection:"column", gap:18, color:"#6b6055", fontSize:15, lineHeight:1.85 }}>
              {[
                "<strong>Faisal Orakzai</strong> (born April 30, 2006, Pakistan) is a visionary entrepreneur and blockchain architect who has established himself as one of Pakistan's most consequential digital-age founders. He is the architect of <strong>Orakzai Bond</strong> — the world's first capital-protected decentralized bond on Polygon — which represents a fundamental reimagining of what decentralized finance can offer.",
                "In 2023, Faisal founded <strong>Shamim Forever</strong>, a sovereign digital luxury house offering bespoke fragrances, high jewellery, and blockchain-verified couture collections worldwide. By combining heritage luxury tradition with Web3 authentication, Shamim Forever stands as the first luxury brand to offer NFT-verified luxury goods from Pakistan.",
                "Through <strong>Orakzai Group</strong>, his strategic holding company, Faisal coordinates ventures across blockchain infrastructure, luxury commerce, quantitative fintech, and smart-city development. His academic research — indexed on ORCID and cited across 67+ publications — bridges theoretical blockchain science with large-scale commercial implementation.",
                "A member of the <strong>GEN Global Entrepreneurship Network</strong>, featured in <strong>Y Combinator Startup School</strong>, and recognized by NUST Pakistan's 50 Under 50 programme, Faisal is building institutions designed to outlast their founder — sovereign, capital-protected, and global from day one.",
              ].map((html, i) => (
                <motion.p key={i} variants={fadeUp} style={{ margin:0 }} dangerouslySetInnerHTML={{ __html: html.replace(/<strong>/g,'<strong style="color:#d4b87a">') }} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── VENTURES ── */}
        <section style={{ padding:"80px 24px", borderTop:"1px solid #0d0d0d" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} style={{ maxWidth:1100, margin:"0 auto" }}>
            <motion.p variants={fadeUp} style={{ color:"#BF953F", fontSize:10, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Portfolio</motion.p>
            <motion.h2 variants={fadeUp} style={{ color:"#f3ecd1", fontSize:30, fontWeight:300, letterSpacing:"-0.01em", marginTop:0, marginBottom:36 }}>Ventures & Organizations</motion.h2>
            <motion.div variants={stagger} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
              {VENTURES.map(v => (
                <motion.div key={v.name} variants={fadeUp} style={{ padding:26, border:"1px solid #0f0f0f", background:"rgba(255,255,255,0.015)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div>
                      <p style={{ color:"#BF953F", fontSize:9, letterSpacing:"0.35em", textTransform:"uppercase", margin:"0 0 5px" }}>{v.role}</p>
                      <h3 style={{ color:"#f3ecd1", fontSize:18, fontWeight:300, margin:0 }}>
                        {v.url ? <a href={v.url} target={v.url.startsWith("http")?'_blank':'_self'} rel="noopener noreferrer" style={{ color:"inherit", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>{v.name} <ExternalLink size={12} style={{ color:"#BF953F" }} /></a> : v.name}
                      </h3>
                    </div>
                    <span style={{ color:"#BF953F", fontSize:11, fontWeight:300, opacity:0.7 }}>{v.year}</span>
                  </div>
                  <p style={{ color:"#3a3530", fontSize:13, lineHeight:1.7, margin:"0 0 14px" }}>{v.desc}</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{v.tags.map(t => <span key={t} style={{ padding:"2px 8px", border:"1px solid #161616", color:"#3a3530", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase" }}>{t}</span>)}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── TIMELINE ── */}
        <section style={{ padding:"80px 24px", background:"#070809", borderTop:"1px solid #0d0d0d" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} style={{ maxWidth:860, margin:"0 auto" }}>
            <motion.p variants={fadeUp} style={{ color:"#BF953F", fontSize:10, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Journey</motion.p>
            <motion.h2 variants={fadeUp} style={{ color:"#f3ecd1", fontSize:30, fontWeight:300, letterSpacing:"-0.01em", marginTop:0, marginBottom:36 }}>Milestones</motion.h2>
            <motion.div variants={stagger} style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {TIMELINE.map((t, i) => (
                <motion.div key={t.year} variants={fadeUp} style={{ display:"flex", gap:28, paddingBottom:32, borderLeft:"1px solid #1a1512", paddingLeft:28, position:"relative" }}>
                  <div style={{ position:"absolute", left:-6, top:4, width:11, height:11, borderRadius:"50%", backgroundImage:GOLD }} />
                  <div style={{ minWidth:48 }}>
                    <span style={{ color:"#BF953F", fontSize:13, fontWeight:300 }}>{t.year}</span>
                  </div>
                  <div>
                    <h3 style={{ color:"#f3ecd1", fontSize:16, fontWeight:400, margin:"0 0 8px" }}>{t.title}</h3>
                    <p style={{ color:"#3a3530", fontSize:13, lineHeight:1.75, margin:0 }}>{t.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── RECOGNITION ── */}
        <section style={{ padding:"80px 24px", borderTop:"1px solid #0d0d0d" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} style={{ maxWidth:1100, margin:"0 auto" }}>
            <motion.p variants={fadeUp} style={{ color:"#BF953F", fontSize:10, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Recognition</motion.p>
            <motion.h2 variants={fadeUp} style={{ color:"#f3ecd1", fontSize:30, fontWeight:300, letterSpacing:"-0.01em", marginTop:0, marginBottom:36 }}>Global Presence & Verification</motion.h2>
            <motion.div variants={stagger} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
              {[
                { org:"Wikidata",           d:"Q140264666 — Publicly verified global encyclopedia entry",        url:"https://www.wikidata.org/wiki/Q140264666" },
                { org:"ORCID",              d:"0009-0000-0915-7272 — Academic researcher identifier",            url:"https://orcid.org/0009-0000-0915-7272" },
                { org:"GEN Global Network", d:"Member — Global Entrepreneurship Network",                        url:"https://www.genglobal.org/user/faisal1" },
                { org:"Y Combinator",       d:"Startup School Co-Founder Matching",                              url:"https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2" },
                { org:"Crunchbase",         d:"Verified entrepreneur & startup founder profile",                 url:"https://www.crunchbase.com/person/faisal-orakzai" },
                { org:"HackerNoon",         d:"Published author — blockchain & DeFi",                           url:"https://hackernoon.com/u/faisalorakzai" },
                { org:"NUST Pakistan",      d:"50 Under 50 — Entrepreneurship Award",                            url:null },
                { org:"Google Scholar",     d:"67+ academic citations across blockchain publications",           url:null },
                { org:"Peerlist",           d:"Verified developer & entrepreneur profile",                       url:"https://peerlist.io/faisalorakzai" },
              ].map(r => (
                <motion.div key={r.org} variants={fadeUp} style={{ display:"flex", gap:14, padding:"14px 18px", border:"1px solid #0f0f0f", alignItems:"flex-start" }}>
                  <ChevronRight size={14} style={{ color:"#BF953F", flexShrink:0, marginTop:2 }} />
                  <div>
                    <p style={{ color:"#d4b87a", fontSize:13, margin:0, fontWeight:500 }}>
                      {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color:"inherit", textDecoration:"none" }}>{r.org}</a> : r.org}
                    </p>
                    <p style={{ color:"#2a2520", fontSize:12, margin:"3px 0 0" }}>{r.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── SOCIAL GRID ── */}
        <section style={{ padding:"80px 24px", background:"#070809", borderTop:"1px solid #0d0d0d" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger} style={{ maxWidth:860, margin:"0 auto" }}>
            <motion.p variants={fadeUp} style={{ color:"#BF953F", fontSize:10, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:10, marginTop:0 }}>Connect</motion.p>
            <motion.h2 variants={fadeUp} style={{ color:"#f3ecd1", fontSize:30, fontWeight:300, letterSpacing:"-0.01em", marginTop:0, marginBottom:36 }}>Find Faisal Online</motion.h2>
            <motion.div variants={stagger} style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              {[
                { l:"LinkedIn",     u:"https://www.linkedin.com/in/faisalorakzaii" },
                { l:"X / Twitter",  u:"https://x.com/faisalorakzaii" },
                { l:"Instagram",    u:"https://www.instagram.com/faisalorakzaii" },
                { l:"TikTok",       u:"https://tiktok.com/@chairmanorakzai" },
                { l:"Facebook",     u:"https://web.facebook.com/faisalorakzaii" },
                { l:"GitHub",       u:"https://github.com/faisalorakzai-lab" },
                { l:"Pinterest",    u:"https://www.pinterest.com/faisalorakzaii" },
                { l:"Crunchbase",   u:"https://www.crunchbase.com/person/faisal-orakzai" },
                { l:"Peerlist",     u:"https://peerlist.io/faisalorakzai" },
                { l:"HackerNoon",   u:"https://hackernoon.com/u/faisalorakzai" },
                { l:"F6S",          u:"https://www.f6s.com/faisalorakzai" },
                { l:"The Org",      u:"https://theorg.com/org/orakzai-bond?person=faisal-orakzai" },
                { l:"GEN Global",   u:"https://www.genglobal.org/user/faisal1" },
                { l:"ORCID",        u:"https://orcid.org/0009-0000-0915-7272" },
                { l:"Wikidata",     u:"https://www.wikidata.org/wiki/Q140264666" },
                { l:"Linktree",     u:"https://linktr.ee/faisalorakzaiofficial" },
                { l:"LeetCode",     u:"https://leetcode.com/u/faisalorakzai/" },
                { l:"Shamim Forever",u:"https://www.shamimforever.com/faisal-orakzai" },
              ].map(s => (
                <motion.a key={s.l} variants={fadeUp} href={s.u} target="_blank" rel="noopener noreferrer"
                  style={{ padding:"8px 16px", border:"1px solid #161616", color:"#6b6055", fontSize:12, letterSpacing:"0.1em", textDecoration:"none" }}
                  whileHover={{ borderColor:"#BF953F", color:"#BF953F" }}>
                  {s.l}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <div style={{ padding:"30px 24px", borderTop:"1px solid #0d0d0d", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
          <div>
            <p style={{ backgroundImage:GOLD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:14, margin:0 }}>Faisal Orakzai</p>
            <p style={{ color:"#2a2520", fontSize:10, margin:"3px 0 0", letterSpacing:"0.2em", textTransform:"uppercase" }}>Founder & CEO · Orakzai Bond · Shamim Forever</p>
          </div>
          <div style={{ display:"flex", gap:18 }}>
            <Link href="/" style={{ color:"#3a3530", fontSize:11, textDecoration:"none", letterSpacing:"0.15em", textTransform:"uppercase" }}>Orakzai Bond</Link>
            <Link href="/founder" style={{ color:"#3a3530", fontSize:11, textDecoration:"none", letterSpacing:"0.15em", textTransform:"uppercase" }}>Founder</Link>
            <a href="https://www.shamimforever.com" target="_blank" rel="noopener noreferrer" style={{ color:"#3a3530", fontSize:11, textDecoration:"none", letterSpacing:"0.15em", textTransform:"uppercase" }}>Shamim Forever</a>
          </div>
        </div>

      </div>
    );
  }
  