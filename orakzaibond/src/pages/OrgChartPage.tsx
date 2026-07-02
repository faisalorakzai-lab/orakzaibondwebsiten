import { useEffect } from "react";
  import { Link } from "wouter";

  const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 30%,#B38728 50%,#FBF5B7 70%,#AA771C 100%)";
  const MIDNIGHT = "#05060A";

  function useSeoHead() {
    useEffect(() => {
      const prev = document.title;
      document.title = "Team & Organization — Orakzai Bond (OKBOND) | Faisal Orakzai Leadership";
      const ld = document.createElement("script");
      ld.id = "ob-org-ld"; ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://orakzaibond.com/#organization",
            "name": "Orakzai Bond",
            "legalName": "Orakzai Bond (OKBOND)",
            "url": "https://orakzaibond.com",
            "logo": "https://orakzaibond.com/logo.png",
            "foundingDate": "2026",
            "numberOfEmployees": { "@type": "QuantitativeValue", "value": 51 },
            "address": { "@type": "PostalAddress", "addressCountry": "PK", "addressLocality": "Pakistan" },
            "founder": { "@type": "Person", "@id": "https://www.shamimforever.com/faisal-orakzai#person", "name": "Faisal Orakzai", "jobTitle": "Founder Chairman" },
            "employee": [
              { "@type": "Person", "name": "Dr Asma Orakzai",    "jobTitle": "Chief Executive Officer" },
              { "@type": "Person", "name": "Laiba Faisal",        "jobTitle": "President Group Head" },
              { "@type": "Person", "name": "Scottie Siu",         "jobTitle": "Chief Technology Officer" },
              { "@type": "Person", "name": "Arjun Mehta",         "jobTitle": "Chief Financial Officer" },
              { "@type": "Person", "name": "Dr. Elena Vance",     "jobTitle": "Senior Blockchain Architect" },
              { "@type": "Person", "name": "M Hayat Orakzai",     "jobTitle": "Chief Operating Officer" },
              { "@type": "Person", "name": "M Zubair Orakzai",    "jobTitle": "AI Lead" },
              { "@type": "Person", "name": "Fariha Aslam",        "jobTitle": "Head of Global Expansion" },
              { "@type": "Person", "name": "Sana Asim",           "jobTitle": "Legal Head" },
              { "@type": "Person", "name": "Shamim Afridi",       "jobTitle": "Head of Marketing" },
              { "@type": "Person", "name": "Isabella Rossi",      "jobTitle": "Strategic Brand Director" },
              { "@type": "Person", "name": "Fatima Zahra",        "jobTitle": "Chief of Staff, Group Office" },
              { "@type": "Person", "name": "Zaid Farooqui",       "jobTitle": "Group Strategy Manager" },
              { "@type": "Person", "name": "Noah Thompson",       "jobTitle": "Investor Relations Lead" },
              { "@type": "Person", "name": "Elena Petrova",       "jobTitle": "Lead Blockchain Engineer" },
              { "@type": "Person", "name": "Vikram Singh",        "jobTitle": "Smart Contract Developer" },
              { "@type": "Person", "name": "Juliette Blanc",      "jobTitle": "AI Integration Specialist" },
              { "@type": "Person", "name": "Kevin Lee",           "jobTitle": "DevOps Infrastructure Lead" },
              { "@type": "Person", "name": "Arshad Khan",         "jobTitle": "Cybersecurity Analyst" },
              { "@type": "Person", "name": "Maria Hussain",       "jobTitle": "Compliance Officer" },
              { "@type": "Person", "name": "James Wilson",        "jobTitle": "Senior Financial Analyst" },
              { "@type": "Person", "name": "Ananya Rao",          "jobTitle": "Treasury Operations Lead" },
              { "@type": "Person", "name": "Thomas Wright",       "jobTitle": "Risk & Compliance Officer" }
            ],
            "sameAs": [
              "https://theorg.com/org/orakzai-bond",
              "https://www.crunchbase.com/organization/orakzai-bond",
              "https://www.linkedin.com/company/orakzai-bond"
            ]
          }
        ]
      });
      document.head.appendChild(ld);
      return () => { document.title = prev; document.getElementById("ob-org-ld")?.remove(); };
    }, []);
  }

  const CARD_STYLE = {
    background: "rgba(191,149,63,0.04)",
    border: "1px solid rgba(191,149,63,0.15)",
    padding: "14px 16px",
    minWidth: 148,
    maxWidth: 180,
    textAlign: "center" as const,
    borderRadius: 2,
  };

  const ROLE_STYLE = { color: "#3a3530", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: "4px 0 0" };
  const NAME_STYLE = { color: "#c9a85c", fontSize: 13, fontWeight: 500, margin: 0 };

  function OrgCard({ name, role, highlight = false }: { name: string; role: string; highlight?: boolean }) {
    return (
      <div style={{ ...CARD_STYLE, ...(highlight ? { border: "1px solid rgba(191,149,63,0.5)", background: "rgba(191,149,63,0.09)" } : {}) }}>
        <p style={{ ...NAME_STYLE, fontSize: highlight ? 15 : 13 }}>{name}</p>
        <p style={ROLE_STYLE}>{role}</p>
      </div>
    );
  }

  function TeamRow({ members }: { members: Array<{ name: string; role: string }> }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {members.map(m => <OrgCard key={m.name} name={m.name} role={m.role} />)}
      </div>
    );
  }

  const CONNECTOR = {
    width: 1, borderLeft: "1px solid rgba(191,149,63,0.2)", height: 24, margin: "0 auto",
  };
  const H_LINE = { borderTop: "1px solid rgba(191,149,63,0.2)", flex: 1 };

  const C_SUITE = [
    { name: "Dr Asma Orakzai",  role: "CEO — Chief Executive Officer" },
    { name: "Laiba Faisal",     role: "President Group Head" },
    { name: "Scottie Siu",      role: "CTO — Chief Technology Officer" },
    { name: "Arjun Mehta",      role: "CFO — Chief Financial Officer" },
  ];

  const DEPT: Record<string, Array<{ name: string; role: string }>> = {
    "Dr Asma Orakzai": [
      { name: "M Hayat Orakzai", role: "COO — Chief Operating Officer" },
      { name: "Fariha Aslam",    role: "Head of Global Expansion" },
      { name: "Sana Asim",       role: "Legal Head" },
      { name: "Shamim Afridi",   role: "Head of Marketing" },
    ],
    "Laiba Faisal": [
      { name: "Isabella Rossi",  role: "Strategic Brand Director" },
      { name: "Fatima Zahra",    role: "Chief of Staff, Group Office" },
      { name: "Zaid Farooqui",   role: "Group Strategy Manager" },
      { name: "Noah Thompson",   role: "Investor Relations Lead" },
      { name: "Chloe Girard",    role: "Public Relations Executive" },
      { name: "Chloe Lefebvre",  role: "European Business Dev" },
    ],
    "Scottie Siu": [
      { name: "M Zubair Orakzai", role: "AI Lead" },
      { name: "Elena Petrova",    role: "Lead Blockchain Engineer" },
      { name: "Vikram Singh",     role: "Smart Contract Developer" },
      { name: "Juliette Blanc",   role: "AI Integration Specialist" },
      { name: "Kevin Lee",        role: "DevOps Infrastructure Lead" },
      { name: "Arshad Khan",      role: "Cybersecurity Analyst" },
    ],
    "Arjun Mehta": [
      { name: "Maria Hussain",    role: "Compliance Officer" },
      { name: "James Wilson",     role: "Senior Financial Analyst" },
      { name: "Ananya Rao",       role: "Treasury Operations Lead" },
      { name: "Thomas Wright",    role: "Risk & Compliance Officer" },
      { name: "Fatima Zahra",     role: "Corporate Capital Manager" },
      { name: "Hiroshi Tanaka",   role: "Audit Specialist" },
    ],
  };

  const TEAMS = [
    { name: "Executive Leadership",              count: 9 },
    { name: "Blockchain Management",             count: 7 },
    { name: "Finance & Treasury",                count: 5 },
    { name: "Global Expansion",                  count: 2 },
    { name: "Marketing & HR",                    count: 2 },
    { name: "Project & Supply Chain Management", count: 2 },
  ];

  export default function OrgChartPage() {
    useSeoHead();

    return (
      <div style={{ background: MIDNIGHT, color: "#f3ecd1", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>

        {/* ── HEADER ── */}
        <div style={{ padding: "80px 20px 48px", textAlign: "center", borderBottom: "1px solid #0e0e0e" }}>
          <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>
            Organization
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 200, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            Team & Leadership Structure
          </h1>
          <p style={{ color: "#3a3530", fontSize: 13, maxWidth: 520, margin: "0 auto 24px" }}>
            Orakzai Bond is led by Faisal Orakzai (Founder Chairman) and operates with 51–200 team members across 7 divisions.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://theorg.com/org/orakzai-bond" target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 16px", border: "1px solid rgba(191,149,63,0.4)", color: "#BF953F", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
              View on The Org →
            </a>
            <Link href="/faisal-orakzai" style={{ padding: "8px 16px", border: "1px solid #161616", color: "#3a3530", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
              Founder Profile
            </Link>
          </div>
        </div>

        {/* ── ORG CHART ── */}
        <div style={{ padding: "60px 16px", overflowX: "auto" }}>
          <div style={{ minWidth: 320, maxWidth: 1200, margin: "0 auto" }}>

            {/* Founder Chairman */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ ...CARD_STYLE, border: "1px solid rgba(191,149,63,0.7)", background: "rgba(191,149,63,0.1)", padding: "18px 28px", minWidth: 200 }}>
                <p style={{ backgroundImage: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 17, fontWeight: 500, margin: 0 }}>Faisal Orakzai</p>
                <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", margin: "5px 0 0" }}>Founder Chairman</p>
              </div>
            </div>

            <div style={CONNECTOR} />

            {/* C-Suite */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {C_SUITE.map(m => <OrgCard key={m.name} name={m.name} role={m.role} highlight />)}
            </div>

            {/* Department sections */}
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
              {C_SUITE.map(exec => (
                <div key={exec.name} style={{ padding: 20, border: "1px solid #0e0e0e", background: "rgba(255,255,255,0.008)" }}>
                  <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 4px" }}>Reports to</p>
                  <p style={{ color: "#c9a85c", fontSize: 13, fontWeight: 500, margin: "0 0 16px", paddingBottom: 14, borderBottom: "1px solid #111" }}>{exec.name}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DEPT[exec.name]?.map(m => (
                      <div key={m.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "rgba(191,149,63,0.4)", fontSize: 10, marginTop: 2, flexShrink: 0 }}>→</span>
                        <div>
                          <p style={{ color: "#a09075", fontSize: 13, margin: 0 }}>{m.name}</p>
                          <p style={{ color: "#2a2520", fontSize: 10, margin: "2px 0 0", letterSpacing: "0.1em" }}>{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Board & Advisors */}
            <div style={{ marginTop: 48, padding: "28px 24px", border: "1px solid #0e0e0e", background: "rgba(191,149,63,0.02)" }}>
              <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", margin: "0 0 16px" }}>Board & Advisors</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <OrgCard name="Dr. Elena Vance" role="Senior Blockchain Architect" highlight />
              </div>
            </div>
          </div>
        </div>

        {/* ── TEAMS ── */}
        <section style={{ padding: "60px 20px", background: "#070809", borderTop: "1px solid #0e0e0e" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ color: "#BF953F", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 8, marginTop: 0 }}>Divisions</p>
            <h2 style={{ color: "#f3ecd1", fontSize: 24, fontWeight: 300, letterSpacing: "-0.01em", marginTop: 0, marginBottom: 28 }}>Teams</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              {TEAMS.map(t => (
                <div key={t.name} style={{ padding: "16px 20px", border: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#a09075", fontSize: 13, margin: 0 }}>{t.name}</p>
                  <span style={{ color: "#BF953F", fontSize: 12, fontWeight: 300 }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div style={{ padding: "28px 20px", borderTop: "1px solid #0e0e0e", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ backgroundImage: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 13, margin: 0 }}>Orakzai Bond</p>
            <p style={{ color: "#2a2520", fontSize: 10, margin: "3px 0 0", letterSpacing: "0.2em", textTransform: "uppercase" }}>Leadership · 51–200 Employees · Pakistan</p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#3a3530", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>Home</Link>
            <Link href="/faisal-orakzai" style={{ color: "#3a3530", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>Founder</Link>
            <a href="https://theorg.com/org/orakzai-bond" target="_blank" rel="noopener noreferrer" style={{ color: "#3a3530", fontSize: 10, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>The Org</a>
          </div>
        </div>
      </div>
    );
  }
  