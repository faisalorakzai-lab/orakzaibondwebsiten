import { useEffect } from "react";
  import { motion } from "framer-motion";
  import { Link } from "wouter";
  import { ExternalLink, Linkedin, ChevronRight, ArrowRight } from "lucide-react";

  const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
  const MIDNIGHT = "#05060A";

  function useSeoHead() {
    useEffect(() => {
      const prev = document.title;
      document.title = "Faisal Orakzai — Founder & CEO of Orakzai Bond | Blockchain Architect";
      const tags: Array<[string,string,string]> = [
        ["name","description","Faisal Orakzai is the Founder & CEO of Orakzai Bond (OKBOND) — world's first capital-protected decentralized bond. Born April 30, 2006, Pakistan. Blockchain architect, DeFi builder, luxury brand founder."],
        ["name","keywords","Faisal Orakzai, Faisal Orakzai Orakzai Bond, Chairman Faisal Orakzai, faisalorakzaii, OKBOND founder, Orakzai Bond CEO, Pakistani blockchain entrepreneur, DeFi founder Pakistan"],
        ["property","og:title","Faisal Orakzai — Founder & CEO of Orakzai Bond"],
        ["property","og:description","Pakistani entrepreneur born 2006. Founder of Orakzai Bond, Shamim Forever & Orakzai Group. Blockchain architect building the world's first capital-protected DeFi bond."],
        ["property","og:image","https://orakzaibond.com/faisal-orakzai.jpg"],
        ["property","og:url","https://orakzaibond.com/faisal-orakzai"],
        ["property","og:type","profile"],
        ["name","twitter:card","summary_large_image"],
        ["name","twitter:creator","@faisalorakzaii"],
        ["name","robots","index, follow, max-image-preview:large"],
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
        "@context":"https://schema.org","@graph":[{
          "@type":"Person","@id":"https://www.shamimforever.com/faisal-orakzai#person",
          "name":"Faisal Orakzai","givenName":"Faisal","familyName":"Orakzai",
          "alternateName":["Chairman Faisal Orakzai","Malak Faisal Orakzai","faisalorakzaii","Faisal Moeen Orakzai"],
          "description":"Founder & CEO of Orakzai Bond (OKBOND). Pakistani entrepreneur born April 30, 2006. Blockchain architect, DeFi builder, and luxury brand founder.",
          "url":"https://orakzaibond.com/faisal-orakzai",
          "image":{"@type":"ImageObject","url":"https://orakzaibond.com/faisal-orakzai.jpg","width":1080,"height":1080},
          "birthDate":"2006-04-30","birthPlace":{"@type":"Place","name":"Pakistan","addressCountry":"PK"},
          "nationality":{"@type":"Country","name":"Pakistan"},"gender":"Male",
          "jobTitle":["Founder & CEO","Chairman","Blockchain Architect","Entrepreneur"],
          "worksFor":[
            {"@type":"Organization","name":"Orakzai Bond","url":"https://orakzaibond.com","foundingDate":"2026"},
            {"@type":"Organization","name":"Shamim Forever","url":"https://www.shamimforever.com","foundingDate":"2023"}
          ],
          "identifier":[
            {"@type":"PropertyValue","propertyID":"ORCID","value":"0009-0000-0915-7272","url":"https://orcid.org/0009-0000-0915-7272"},
            {"@type":"PropertyValue","propertyID":"Wikidata","value":"Q140264666","url":"https://www.wikidata.org/wiki/Q140264666"}
          ],
          "sameAs":[
            "https://www.wikidata.org/wiki/Q140264666","https://orcid.org/0009-0000-0915-7272",
            "https://www.crunchbase.com/person/faisal-orakzai","https://www.linkedin.com/in/faisalorakzaii",
            "https://x.com/faisalorakzaii","https://www.instagram.com/faisalorakzaii",
            "https://web.facebook.com/faisalorakzaii","https://tiktok.com/@chairmanorakzai",
            "https://github.com/faisalorakzai-lab","https://linktr.ee/faisalorakzaiofficial",
            "https://peerlist.io/faisalorakzai","https://hackernoon.com/u/faisalorakzai",
            "https://www.genglobal.org/user/faisal1","https://www.shamimforever.com/faisal-orakzai",
            "https://www.shamimforever.com/founder","https://orakzaibond.com/founder"
          ]
        }]
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
    {year:"2018",title:"The Foundation",    body:"Entered Real Estate, building the initial vision for asset-backed wealth creation."},
    {year:"2021",title:"Test of Character", body:"Amid a global market crash, chose character over capital — paused operations to personally ensure investors faced zero loss."},
    {year:"2023",title:"Empire Begins",     body:"Founded Shamim Forever (global luxury house) and Orakzai Group — building institutions designed to last generations."},
    {year:"2026",title:"OKBOND Launch",     body:"Launched Orakzai Bond — world's first capital-protected decentralized bond. The culmination of a decade-long vision."},
  ];

  const VENTURES = [
    {name:"Orakzai Bond",  role:"Founder & CEO",     year:"2026",desc:"World's first capital-protected decentralized bond on Polygon. Quantitative fintech + real-asset backing.",url:"https://orakzaibond.com",tags:["DeFi","Blockchain","Polygon"]},
    {name:"Shamim Forever",role:"Founder & Chairman", year:"2023",desc:"Sovereign digital luxury house — bespoke fragrances, high jewellery, blockchain-verified couture.",url:"https://www.shamimforever.com",tags:["Luxury","E-Commerce","NFT"]},
    {name:"Orakzai Group", role:"Chairman",            year:"2023",desc:"Strategic holding company overseeing digital innovation, luxury commerce, and blockchain ventures globally.",url:null,tags:["Holdings","Investment","Strategy"]},
  ];

  const LINKS = [
    {l:"LinkedIn",    u:"https://www.linkedin.com/in/faisalorakzaii"},
    {l:"X / Twitter", u:"https://x.com/faisalorakzaii"},
    {l:"Instagram",   u:"https://www.instagram.com/faisalorakzaii"},
    {l:"TikTok",      u:"https://tiktok.com/@chairmanorakzai"},
    {l:"Facebook",    u:"https://web.facebook.com/faisalorakzaii"},
    {l:"GitHub",      u:"https://github.com/faisalorakzai-lab"},
    {l:"Crunchbase",  u:"https://www.crunchbase.com/person/faisal-orakzai"},
    {l:"Peerlist",    u:"https://peerlist.io/faisalorakzai"},
    {l:"HackerNoon",  u:"https://hackernoon.com/u/faisalorakzai"},
    {l:"Wikidata",    u:"https://www.wikidata.org/wiki/Q140264666"},
    {l:"ORCID",       u:"https://orcid.org/0009-0000-0915-7272"},
    {l:"GEN Global",  u:"https://www.genglobal.org/user/faisal1"},
    {l:"Y Combinator",u:"https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2"},
    {l:"F6S",         u:"https://www.f6s.com/faisalorakzai"},
    {l:"Linktree",    u:"https://linktr.ee/faisalorakzaiofficial"},
    {l:"Shamim Forever",u:"https://www.shamimforever.com/faisal-orakzai"},
  ];

  /* Inline responsive hero grid via CSS injection */
  const HERO_STYLE = `
    .fo-hero-grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 56px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .fo-hero-grid {
        grid-template-columns: 1fr;
        gap: 32px;
        text-align: center;
      }
      .fo-hero-portrait { margin: 0 auto; }
      .fo-hero-pills { justify-content: center !important; }
      .fo-hero-stats { justify-content: center !important; }
      .fo-hero-ctas  { justify-content: center !important; flex-wrap: wrap; }
      .fo-h1 { font-size: 52px !important; }
    }
  `;

  export default function FaisalOrakzaiBioPage() {
    useSeoHead();

    return (
      <div style={{background:MIDNIGHT,color:"#f3ecd1",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif"}}>
        <style>{HERO_STYLE}</style>

        {/* ── HERO ── */}
        <section style={{padding:"100px 20px 70px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"15%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(191,149,63,0.07) 0%,transparent 70%)",pointerEvents:"none"}} />

          <motion.div className="fo-hero-grid" initial="hidden" animate="show" variants={stagger}>

            {/* ── PORTRAIT ── */}
            <motion.div className="fo-hero-portrait" variants={fadeUp} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
              <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{position:"absolute",inset:-5,borderRadius:"50%",background:"conic-gradient(from 0deg,#BF953F,#FCF6BA,#B38728,#FBF5B7,#AA771C,#FCF6BA,#BF953F)",filter:"blur(1px)",opacity:0.9}} />
                <div style={{position:"absolute",inset:4,borderRadius:"50%",background:MIDNIGHT}} />
                <div style={{position:"absolute",inset:12,borderRadius:"50%",border:"1px solid rgba(191,149,63,0.2)"}} />
                <img
                  src="/faisal-orakzai.jpg"
                  alt="Faisal Orakzai — Founder & CEO of Orakzai Bond, Pakistani Blockchain Entrepreneur"
                  style={{position:"relative",width:240,height:240,borderRadius:"50%",objectFit:"cover",objectPosition:"top center",margin:14}}
                  loading="eager"
                />
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                {[{l:"✓ Wikidata",u:"https://www.wikidata.org/wiki/Q140264666"},{l:"✓ ORCID",u:"https://orcid.org/0009-0000-0915-7272"}].map(b=>(
                  <a key={b.l} href={b.u} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",border:"1px solid rgba(191,149,63,0.45)",color:"#BF953F",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>{b.l}</a>
                ))}
              </div>
            </motion.div>

            {/* ── TEXT ── */}
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <motion.div variants={fadeUp}>
                <p style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Founder & CEO · Orakzai Bond</p>
                <h1 className="fo-h1" style={{fontSize:64,fontWeight:200,letterSpacing:"-0.02em",lineHeight:1.05,margin:0}}>Faisal</h1>
                <h1 className="fo-h1" style={{fontSize:64,fontWeight:300,letterSpacing:"-0.02em",lineHeight:1.05,margin:0,backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Orakzai</h1>
              </motion.div>

              <motion.p variants={fadeUp} style={{color:"#7a7065",fontSize:14,lineHeight:1.8,maxWidth:500,margin:0}}>
                Pakistani entrepreneur born April 30, 2006. Building sovereign financial and luxury infrastructure at the intersection of{" "}
                <strong style={{color:"#c9a85c"}}>blockchain architecture</strong>,{" "}
                <strong style={{color:"#c9a85c"}}>capital-protected DeFi</strong>, and heritage luxury commerce.
              </motion.p>

              <motion.div className="fo-hero-pills" variants={fadeUp} style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Blockchain","DeFi","Capital Protection","Luxury","NFT","Pakistan"].map(t=>(
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
                  style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",border:"1px solid rgba(191,149,63,0.6)",color:"#BF953F",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>
                  <Linkedin size={13}/> LinkedIn
                </a>
                <Link href="/founder"
                  style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",border:"1px solid #BF953F",backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>
                  Founder Page <ArrowRight size={13}/>
                </Link>
                <a href="https://www.shamimforever.com/faisal-orakzai" target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",border:"1px solid #1c1c1c",color:"#5a5045",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none"}}>
                  Shamim Forever <ExternalLink size={11}/>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── BIOGRAPHY ── */}
        <section style={{padding:"72px 20px",background:"#070809",borderTop:"1px solid #0e0e0e"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} style={{maxWidth:800,margin:"0 auto"}}>
            <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Biography</motion.p>
            <motion.h2 variants={fadeUp} style={{color:"#f3ecd1",fontSize:28,fontWeight:300,letterSpacing:"-0.01em",marginTop:0,marginBottom:32}}>About Faisal Orakzai</motion.h2>
            <motion.div variants={stagger} style={{display:"flex",flexDirection:"column",gap:18,color:"#6b6055",fontSize:14,lineHeight:1.9}}>
              {[
                "<b>Faisal Orakzai</b> (born April 30, 2006, Pakistan) is a visionary entrepreneur and blockchain architect who has established himself as one of Pakistan's most consequential digital-age founders. He is the architect of <b>Orakzai Bond</b> — the world's first capital-protected decentralized bond on Polygon.",
                "In 2023, Faisal founded <b>Shamim Forever</b>, a sovereign digital luxury house offering bespoke fragrances, high jewellery, and blockchain-verified couture collections worldwide. Shamim Forever stands as the first luxury brand to offer NFT-verified luxury goods from Pakistan.",
                "Through <b>Orakzai Group</b>, his strategic holding company, Faisal coordinates ventures across blockchain infrastructure, luxury commerce, quantitative fintech, and DeFi. His academic research — indexed on ORCID and cited across 67+ publications — bridges theoretical blockchain science with large-scale commercial implementation.",
                "A member of the <b>GEN Global Entrepreneurship Network</b> and featured in <b>Y Combinator Startup School</b>, recognized by NUST Pakistan's 50 Under 50 programme. Faisal is building institutions designed to outlast their founder — sovereign, capital-protected, and global from day one.",
              ].map((html, i) => (
                <motion.p key={i} variants={fadeUp} style={{margin:0}} dangerouslySetInnerHTML={{__html: html.replace(/<b>/g,'<strong style="color:#c9a85c">').replace(/<\/b>/g,'</strong>')}} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── VENTURES ── */}
        <section style={{padding:"72px 20px",borderTop:"1px solid #0e0e0e"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Portfolio</motion.p>
            <motion.h2 variants={fadeUp} style={{color:"#f3ecd1",fontSize:28,fontWeight:300,letterSpacing:"-0.01em",marginTop:0,marginBottom:32}}>Ventures & Organizations</motion.h2>
            <motion.div variants={stagger} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
              {VENTURES.map(v=>(
                <motion.div key={v.name} variants={fadeUp} style={{padding:24,border:"1px solid #111",background:"rgba(255,255,255,0.012)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <p style={{color:"#BF953F",fontSize:9,letterSpacing:"0.35em",textTransform:"uppercase",margin:"0 0 5px"}}>{v.role}</p>
                      <h3 style={{color:"#f3ecd1",fontSize:17,fontWeight:300,margin:0}}>
                        {v.url
                          ? <a href={v.url} target="_blank" rel="noopener noreferrer" style={{color:"inherit",textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>{v.name} <ExternalLink size={11} style={{color:"#BF953F"}}/></a>
                          : v.name}
                      </h3>
                    </div>
                    <span style={{color:"#BF953F",fontSize:11,opacity:0.6}}>{v.year}</span>
                  </div>
                  <p style={{color:"#3a3530",fontSize:13,lineHeight:1.7,margin:"0 0 14px"}}>{v.desc}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{v.tags.map(t=><span key={t} style={{padding:"2px 8px",border:"1px solid #161616",color:"#3a3530",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase"}}>{t}</span>)}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── TIMELINE ── */}
        <section style={{padding:"72px 20px",background:"#070809",borderTop:"1px solid #0e0e0e"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} style={{maxWidth:800,margin:"0 auto"}}>
            <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Journey</motion.p>
            <motion.h2 variants={fadeUp} style={{color:"#f3ecd1",fontSize:28,fontWeight:300,letterSpacing:"-0.01em",marginTop:0,marginBottom:32}}>Milestones</motion.h2>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {TIMELINE.map((t,i)=>(
                <motion.div key={t.year} variants={fadeUp} initial="hidden" whileInView="show" viewport={{once:true}}
                  style={{display:"flex",gap:24,paddingBottom:28,borderLeft:"1px solid #1a1512",paddingLeft:24,position:"relative"}}>
                  <div style={{position:"absolute",left:-6,top:4,width:11,height:11,borderRadius:"50%",backgroundImage:GOLD}} />
                  <div style={{minWidth:44}}>
                    <span style={{color:"#BF953F",fontSize:13,fontWeight:300}}>{t.year}</span>
                  </div>
                  <div>
                    <h3 style={{color:"#f3ecd1",fontSize:15,fontWeight:400,margin:"0 0 7px"}}>{t.title}</h3>
                    <p style={{color:"#3a3530",fontSize:13,lineHeight:1.75,margin:0}}>{t.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── RECOGNITION ── */}
        <section style={{padding:"72px 20px",borderTop:"1px solid #0e0e0e"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} style={{maxWidth:1100,margin:"0 auto"}}>
            <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Recognition</motion.p>
            <motion.h2 variants={fadeUp} style={{color:"#f3ecd1",fontSize:28,fontWeight:300,letterSpacing:"-0.01em",marginTop:0,marginBottom:32}}>Global Presence & Verification</motion.h2>
            <motion.div variants={stagger} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
              {[
                {org:"Wikidata",      d:"Q140264666 — Publicly verified encyclopedia entry",          url:"https://www.wikidata.org/wiki/Q140264666"},
                {org:"ORCID",         d:"0009-0000-0915-7272 — Academic researcher identifier",       url:"https://orcid.org/0009-0000-0915-7272"},
                {org:"GEN Global",    d:"Member — Global Entrepreneurship Network",                   url:"https://www.genglobal.org/user/faisal1"},
                {org:"Y Combinator",  d:"Startup School Co-Founder Matching",                         url:"https://www.startupschool.org/cofounder-matching/candidate/Hm8t79WI2"},
                {org:"Crunchbase",    d:"Verified entrepreneur & startup founder profile",            url:"https://www.crunchbase.com/person/faisal-orakzai"},
                {org:"HackerNoon",    d:"Published author — blockchain & DeFi",                      url:"https://hackernoon.com/u/faisalorakzai"},
                {org:"NUST Pakistan", d:"50 Under 50 — Entrepreneurship Award",                       url:null},
                {org:"Google Scholar",d:"67+ academic citations across blockchain publications",      url:null},
                {org:"Peerlist",      d:"Verified developer & entrepreneur profile",                  url:"https://peerlist.io/faisalorakzai"},
              ].map(r=>(
                <motion.div key={r.org} variants={fadeUp} style={{display:"flex",gap:12,padding:"13px 16px",border:"1px solid #0f0f0f",alignItems:"flex-start"}}>
                  <ChevronRight size={13} style={{color:"#BF953F",flexShrink:0,marginTop:2}}/>
                  <div>
                    <p style={{color:"#c9a85c",fontSize:13,margin:0,fontWeight:500}}>{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{color:"inherit",textDecoration:"none"}}>{r.org}</a> : r.org}</p>
                    <p style={{color:"#2a2520",fontSize:12,margin:"3px 0 0"}}>{r.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── SOCIAL ── */}
        <section style={{padding:"72px 20px",background:"#070809",borderTop:"1px solid #0e0e0e"}}>
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger} style={{maxWidth:800,margin:"0 auto"}}>
            <motion.p variants={fadeUp} style={{color:"#BF953F",fontSize:10,letterSpacing:"0.45em",textTransform:"uppercase",marginBottom:8,marginTop:0}}>Connect</motion.p>
            <motion.h2 variants={fadeUp} style={{color:"#f3ecd1",fontSize:28,fontWeight:300,letterSpacing:"-0.01em",marginTop:0,marginBottom:32}}>Find Faisal Online</motion.h2>
            <motion.div variants={stagger} style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {LINKS.map(s=>(
                <motion.a key={s.l} variants={fadeUp} href={s.u} target="_blank" rel="noopener noreferrer"
                  style={{padding:"8px 15px",border:"1px solid #161616",color:"#6b6055",fontSize:12,letterSpacing:"0.1em",textDecoration:"none"}}
                  whileHover={{borderColor:"rgba(191,149,63,0.6)",color:"#BF953F"}}>
                  {s.l}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <div style={{padding:"28px 20px",borderTop:"1px solid #0e0e0e",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
          <div>
            <p style={{backgroundImage:GOLD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:13,margin:0}}>Faisal Orakzai</p>
            <p style={{color:"#2a2520",fontSize:10,margin:"3px 0 0",letterSpacing:"0.2em",textTransform:"uppercase"}}>Founder & CEO · Orakzai Bond · Shamim Forever</p>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <Link href="/" style={{color:"#3a3530",fontSize:10,textDecoration:"none",letterSpacing:"0.15em",textTransform:"uppercase"}}>Orakzai Bond</Link>
            <Link href="/founder" style={{color:"#3a3530",fontSize:10,textDecoration:"none",letterSpacing:"0.15em",textTransform:"uppercase"}}>Founder</Link>
            <a href="https://www.shamimforever.com" target="_blank" rel="noopener noreferrer" style={{color:"#3a3530",fontSize:10,textDecoration:"none",letterSpacing:"0.15em",textTransform:"uppercase"}}>Shamim Forever</a>
          </div>
        </div>
      </div>
    );
  }
  