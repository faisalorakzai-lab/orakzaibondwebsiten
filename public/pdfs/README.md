# PDF Assets

Drop the following PDF files in this folder before deploying to Vercel. The filenames must match exactly so the redirect routes in `vercel.json` resolve correctly.

| File | Vercel Route | Purpose |
|------|--------------|---------|
| `whitepaper.pdf` | `/whitepaper` | Official $OKBOND whitepaper |
| `marketing.pdf` | `/pdf` | Investor marketing deck |
| `audit-report.pdf` | `/Auditreport` and `/auditreport` | Independent audit report |

These files are git-ignored placeholders until you add the real PDFs. After dropping the files here, commit and push — Vercel will pick them up automatically and the redirect routes will go live.
