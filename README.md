# Orakzai Bond

Institutional website for **$OKBOND** — capital-protected, RWA-backed sovereign-grade digital bond from the Orakzai Group.

## Stack

- React 19 + Vite 7
- Tailwind CSS v4
- Wouter (client-side routing)
- Framer Motion
- Marcus AI v9.0 — interactive concierge with WhatsApp deep-link to the Chairman's desk

## Deploy

This site auto-deploys to Vercel on push to `main`. The `vercel.json` configures:

- SPA fallback for client-side routes
- Branded redirects: `/whitepaper`, `/pdf`, `/Auditreport` → corresponding PDFs in `public/pdfs/`
- PDF content-type + cache headers

To preview locally:

```bash
npm install
npm run dev
```

To build:

```bash
npm run build
```

Output is written to `dist/`.

## PDFs

Drop the institutional PDFs in `public/pdfs/` with these exact filenames:

- `whitepaper.pdf` — served at `/whitepaper`
- `marketing.pdf` — served at `/pdf`
- `audit-report.pdf` — served at `/Auditreport` and `/auditreport`

## Marcus AI Concierge

The pulsing gold orb in the bottom-right is **Marcus v9.0**. Clicking it opens a glassmorphism chat panel with three smart options:

1. Verify $OKBOND Security
2. Guide me to Buy
3. Explain the 2100 Vision

Complex queries are routed directly to the Chairman via WhatsApp: **+92 336 797 0004**.
