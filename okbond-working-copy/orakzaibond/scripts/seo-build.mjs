import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SITE_URL = "https://orakzaibond.com";
const PERSON_URL = `${SITE_URL}/faisal-orakzai`;
const PERSON_ID = `${PERSON_URL}#person`;
const indexPath = resolve("dist/index.html");
let html = await readFile(indexPath, "utf8");

const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
const description = html.match(
  /<meta\s+name="description"\s+content="([^"]*)"/i,
)?.[1]?.trim();

if (!title || !description) {
  throw new Error("Homepage title or description is missing from dist/index.html");
}

const entityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Orakzai Bond",
      alternateName: "OKBOND",
      url: SITE_URL,
      description:
        "Official website for Orakzai Bond (OKBOND), a blockchain project on Polygon. Explore ecosystem information, token details, project updates, documents, and the team.",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/okbond-logo.png`,
        contentUrl: `${SITE_URL}/okbond-logo.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/opengraph.jpg`,
      founder: {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Faisal Orakzai",
        url: PERSON_URL,
      },
      sameAs: [
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
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Orakzai Bond",
      alternateName: "OKBOND",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: title,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      mainEntity: { "@id": `${SITE_URL}/#organization` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/opengraph.jpg`,
      },
      inLanguage: "en",
    },
  ],
};

const oldSchemaPattern =
  /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi;
const removedSchemaCount = (html.match(oldSchemaPattern) ?? []).length;
html = html.replace(oldSchemaPattern, "");

// Remove old off-screen crawler-only text and duplicated FAQ claims. The
// homepage now has a visible HTML fallback with useful links before React loads.
html = html
  .replace(
    /<h1\b(?=[^>]*\bstyle=["'][^"']*(?:left\s*:\s*-9999px|clip\s*:\s*rect)[^"']*["'])[^>]*>[\s\S]*?<\/h1>/gi,
    "",
  )
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
  .replace(
    /<section\b(?=[^>]*\bid=["']faq["'])[^>]*>[\s\S]*?<\/section>/gi,
    "",
  );

const schemaScript = `<script type="application/ld+json">\n${JSON.stringify(
  entityGraph,
  null,
  2,
)}\n</script>`;
if (!/<\/head>/i.test(html)) {
  throw new Error("Could not find </head> in dist/index.html");
}
html = html.replace(/<\/head>/i, `${schemaScript}\n</head>`);

const schemaBlocks = [
  ...html.matchAll(
    /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi,
  ),
];
if (schemaBlocks.length !== 1) {
  throw new Error(`Expected one homepage JSON-LD block; found ${schemaBlocks.length}`);
}
const emittedSchema = JSON.parse(schemaBlocks[0][1]);
const emittedTypes = emittedSchema["@graph"].map((entity) => entity["@type"]);
if (
  !["Organization", "WebSite", "WebPage"].every((type) =>
    emittedTypes.includes(type),
  )
) {
  throw new Error("Homepage JSON-LD is missing a required entity type");
}
if (!/<div id="root">[\s\S]*?<h1\b/i.test(html)) {
  throw new Error("Visible homepage fallback heading is missing");
}
if (/<noscript\b|id=["']faq["']|left:-9999px/i.test(html)) {
  throw new Error("Legacy hidden homepage SEO content remains in the build");
}

await writeFile(indexPath, html);
console.log(
  `SEO build: replaced ${removedSchemaCount} legacy JSON-LD blocks with one consistent homepage entity graph and removed hidden SEO-only content.`,
);

const personSameAs = [
  "https://x.com/faisalorakzaii",
  "https://www.linkedin.com/in/faisalorakzaii",
  "https://www.instagram.com/faisalorakzaii",
  "https://web.facebook.com/faisalorakzaii",
  "https://tiktok.com/@chairmanorakzai",
  "https://github.com/faisalorakzai-lab",
  "https://www.shamimforever.com/faisal-orakzai",
];

function setMeta(markup, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapedKey}["'])[^>]*>`,
    "i",
  );
  const tag = `<meta ${attribute}="${key}" content="${content}" />`;
  return pattern.test(markup)
    ? markup.replace(pattern, tag)
    : markup.replace(/<\/head>/i, `${tag}\n</head>`);
}

for (const profile of [
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
]) {
  const profilePath = resolve("dist", profile.filename);
  let profileHtml = await readFile(profilePath, "utf8");
  profileHtml = profileHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${profile.title}</title>`)
    .replace(
      /https:\/\/www\.wikidata\.org\/wiki\/Q140(?:264666|588912)/gi,
      PERSON_ID,
    )
    .replace(
      /Wikidata[- ]verified public figure/gi,
      "official founder profile",
    )
    .replace(
      /Wikidata(?:\s+(?:ID|entry|item))?(?:\s+is)?\s*:?\s*Q140(?:264666|588912)/gi,
      "official founder profile",
    )
    .replace(/\bQ140(?:264666|588912)\b/g, "")
    .replace(/Wikidata/gi, "official profile");

  profileHtml = setMeta(profileHtml, "name", "description", profile.description);
  profileHtml = setMeta(profileHtml, "property", "og:title", profile.title);
  profileHtml = setMeta(
    profileHtml,
    "property",
    "og:description",
    profile.description,
  );
  profileHtml = setMeta(profileHtml, "property", "og:url", `${SITE_URL}${profile.path}`);
  profileHtml = setMeta(profileHtml, "name", "twitter:title", profile.title);
  profileHtml = setMeta(
    profileHtml,
    "name",
    "twitter:description",
    profile.description,
  );

  const canonicalPattern =
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  const canonicalTag = `<link rel="canonical" href="${SITE_URL}${profile.path}" />`;
  profileHtml = canonicalPattern.test(profileHtml)
    ? profileHtml.replace(canonicalPattern, canonicalTag)
    : profileHtml.replace(/<\/head>/i, `${canonicalTag}\n</head>`);
  profileHtml = profileHtml.replace(
    /<meta\b(?=[^>]*\bname=["']keywords["'])[^>]*>/gi,
    "",
  );
  profileHtml = profileHtml.replace(oldSchemaPattern, "");

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      ...entityGraph["@graph"].slice(0, 2),
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Faisal Orakzai",
        url: PERSON_URL,
        image: `${SITE_URL}/faisal-orakzai-smiling.jpg`,
        worksFor: { "@id": `${SITE_URL}/#organization` },
        sameAs: personSameAs,
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}${profile.path}#profilepage`,
        url: `${SITE_URL}${profile.path}`,
        name: profile.title,
        description: profile.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": PERSON_ID },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/faisal-orakzai-smiling.jpg`,
        },
        inLanguage: "en",
      },
    ],
  };
  const profileSchemaTag = `<script type="application/ld+json">\n${JSON.stringify(
    pageSchema,
    null,
    2,
  )}\n</script>`;
  profileHtml = profileHtml.replace(
    /<\/head>/i,
    `${profileSchemaTag}\n</head>`,
  );

  if (/Q140(?:264666|588912)|wikidata\.org/i.test(profileHtml)) {
    throw new Error(`Invalid Wikidata reference remains in ${profile.filename}`);
  }
  const profileSchemas = [
    ...profileHtml.matchAll(
      /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  if (profileSchemas.length !== 1) {
    throw new Error(
      `Expected one profile JSON-LD block in ${profile.filename}; found ${profileSchemas.length}`,
    );
  }
  JSON.parse(profileSchemas[0][1]);

  await writeFile(profilePath, profileHtml);
  console.log(
    `SEO build: normalized ${profile.path} metadata and unified the founder entity ID.`,
  );
}
