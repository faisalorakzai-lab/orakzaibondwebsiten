import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SITE_URL = "https://orakzaibond.com";
const PERSON_URL = `${SITE_URL}/faisal-orakzai`;
const PERSON_ID = `${PERSON_URL}#person`;
const DESCRIPTION =
  "Explore Orakzai Bond (OKBOND), its stated Sovereign Vault allocations and Polygon smart-contract references. Figures are illustrative, not independently verified.";
const JSON_LD_PATTERN =
  /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(key)}["'])[^>]*>`,
    "gi",
  );
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  let replaced = false;
  html = html.replace(pattern, () => {
    if (replaced) return "";
    replaced = true;
    return tag;
  });
  return replaced ? html : html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function setCanonical(html, path) {
  const pattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi;
  const tag = `<link rel="canonical" href="${SITE_URL}${path}" />`;
  let replaced = false;
  html = html.replace(pattern, () => {
    if (replaced) return "";
    replaced = true;
    return tag;
  });
  return replaced ? html : html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function setTitle(html, title) {
  const escapedTitle = escapeHtml(title);
  const pattern = /<title\b[^>]*>[\s\S]*?<\/title>/i;
  if (!pattern.test(html)) throw new Error("HTML title is missing");
  return html.replace(pattern, `<title>${escapedTitle}</title>`);
}

function setSocialMetadata(html, { title, description, path }) {
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", `${SITE_URL}${path}`);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  return setCanonical(html, path);
}

function addJsonLd(html, data) {
  const script = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
  if (!/<\/head>/i.test(html)) throw new Error("Could not find </head>");
  return html.replace(/<\/head>/i, `${script}\n</head>`);
}

function readJsonLd(html) {
  return [...html.matchAll(JSON_LD_PATTERN)].map((match) =>
    JSON.parse(match[1]),
  );
}

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;
const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "Orakzai Bond",
      alternateName: "OKBOND",
      url: `${SITE_URL}/`,
      description:
        "Official website for Orakzai Bond (OKBOND), a blockchain project on Polygon.",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/okbond-logo.png`,
      },
      image: `${SITE_URL}/opengraph.jpg`,
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${SITE_URL}/`,
      name: "Orakzai Bond",
      alternateName: "OKBOND",
      publisher: { "@id": organizationId },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: "Orakzai Bond (OKBOND) | Blockchain Platform on Polygon",
      description: DESCRIPTION,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      mainEntity: { "@id": organizationId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/opengraph.jpg`,
      },
      inLanguage: "en",
    },
  ],
};

let homeHtml = await readFile(resolve("dist/index.html"), "utf8");
homeHtml = setTitle(homeHtml, homeGraph["@graph"][2].name);
homeHtml = setSocialMetadata(homeHtml, {
  title: homeGraph["@graph"][2].name,
  description: DESCRIPTION,
  path: "/",
});
homeHtml = homeHtml
  .replace(JSON_LD_PATTERN, "")
  .replace(
    /<h1\b(?=[^>]*\bstyle=["'][^"']*(?:left\s*:\s*-9999px|clip\s*:\s*rect)[^"']*["'])[^>]*>[\s\S]*?<\/h1>/gi,
    "",
  )
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
  .replace(
    /<section\b(?=[^>]*\bid=["']faq["'])[^>]*>[\s\S]*?<\/section>/gi,
    "",
  )
  .replace(
    /<meta\b(?=[^>]*\bname=["']keywords["'])[^>]*>/gi,
    "",
  );
homeHtml = addJsonLd(homeHtml, homeGraph);

const homeSchemas = readJsonLd(homeHtml);
if (homeSchemas.length !== 1) {
  throw new Error(`Expected one homepage JSON-LD block; found ${homeSchemas.length}`);
}
const homeTypes = homeSchemas[0]["@graph"].map((entity) => entity["@type"]);
if (!["Organization", "WebSite", "WebPage"].every((type) => homeTypes.includes(type))) {
  throw new Error("Homepage JSON-LD is missing Organization, WebSite, or WebPage");
}
if (!/<div\b[^>]*id=["']root["'][^>]*>[\s\S]*?<h1\b/i.test(homeHtml)) {
  throw new Error("Visible homepage fallback heading is missing");
}
const ecosystemFallbackText = [
  "Choose a service.",
  "/services/stays",
  "/services/properties",
  "/services/mobility",
  "/services/pay",
];
if (!ecosystemFallbackText.every((text) => homeHtml.includes(text))) {
  throw new Error("Visible homepage service-card fallback is incomplete");
}
if (
  [
    "OKBOND STAYS",
    "OKBOND MOBILITY",
    "OKBOND PROPERTIES",
    "OKBOND PAY",
    "Your World. Connected.",
    "Preview only",
  ].some((text) => homeHtml.includes(text))
) {
  throw new Error("Service preview content must stay on its dedicated page");
}

if (/<noscript\b|id=["']faq["']|left\s*:\s*-9999px|clip\s*:\s*rect/i.test(homeHtml)) {
  throw new Error("Legacy hidden homepage SEO content remains in the build");
}
await writeFile(resolve("dist/index.html"), homeHtml);
console.log("SEO build: homepage metadata and single entity graph verified.");

const profiles = [
  {
    filename: "faisal-orakzai.html",
    path: "/faisal-orakzai",
    title: "Faisal Orakzai | Official Founder Profile",
    description:
      "Official profile of Faisal Orakzai, founder of Orakzai Bond (OKBOND). Explore his work and the OKBOND project.",
  },
  {
    filename: "founder.html",
    path: "/founder",
    title: "Faisal Orakzai | Founder of Orakzai Bond (OKBOND)",
    description:
      "Learn about Faisal Orakzai, founder of Orakzai Bond (OKBOND), and explore the project's people, history, and ecosystem.",
  },
];

for (const profile of profiles) {
  const profilePath = resolve("dist", profile.filename);
  let profileHtml = await readFile(profilePath, "utf8");
  profileHtml = profileHtml
    .replace(
      /https:\/\/www\.wikidata\.org\/wiki\/Q140(?:264666|588912)/gi,
      PERSON_ID,
    )
    .replace(/Wikidata[- ]verified public figure/gi, "official founder profile")
    .replace(
      /Wikidata(?:\s+(?:ID|entry|item))?(?:\s+is)?\s*:?\s*Q140(?:264666|588912)/gi,
      "official founder profile",
    )
    .replace(/\bQ140(?:264666|588912)\b/g, "")
    .replace(/Wikidata/gi, "official profile")
    .replace(JSON_LD_PATTERN, "")
    .replace(
      /<meta\b(?=[^>]*\bname=["']keywords["'])[^>]*>/gi,
      "",
    );
  profileHtml = setTitle(profileHtml, profile.title);
  profileHtml = setSocialMetadata(profileHtml, profile);

  const personSameAs = [
    "https://x.com/faisalorakzaii",
    "https://www.linkedin.com/in/faisalorakzaii",
    "https://www.instagram.com/faisalorakzaii",
    "https://web.facebook.com/faisalorakzaii",
    "https://tiktok.com/@chairmanorakzai",
    "https://github.com/faisalorakzai-lab",
  ];
  const profileGraph = {
    "@context": "https://schema.org",
    "@graph": [
      homeGraph["@graph"][0],
      homeGraph["@graph"][1],
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Faisal Orakzai",
        url: PERSON_URL,
        image: `${SITE_URL}/faisal-orakzai-smiling.jpg`,
        worksFor: { "@id": organizationId },
        sameAs: personSameAs,
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}${profile.path}#profilepage`,
        url: `${SITE_URL}${profile.path}`,
        name: profile.title,
        description: profile.description,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": PERSON_ID },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/faisal-orakzai-smiling.jpg`,
        },
        inLanguage: "en",
      },
    ],
  };
  profileHtml = addJsonLd(profileHtml, profileGraph);

  const profileSchemas = readJsonLd(profileHtml);
  if (profileSchemas.length !== 1) {
    throw new Error(
      `Expected one JSON-LD block in ${profile.filename}; found ${profileSchemas.length}`,
    );
  }
  if (/Q140(?:264666|588912)|wikidata\.org/i.test(profileHtml)) {
    throw new Error(`Conflicting Wikidata reference remains in ${profile.filename}`);
  }
  const canonical = profileHtml.match(
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)/i,
  )?.[1];
  if (canonical !== `${SITE_URL}${profile.path}`) {
    throw new Error(`Wrong canonical in ${profile.filename}: ${canonical}`);
  }

  await writeFile(profilePath, profileHtml);
  console.log(`SEO build: ${profile.path} metadata and entity graph verified.`);
}
