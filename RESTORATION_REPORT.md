# Orakzai Terminal — Full Elite Suite Restoration Report

**Branch:** `restore/full-elite-suite-2026-04-29`
**Date:** April 30, 2026
**Build status:** ✅ green (`vite build` — 3012 modules transformed, ~13s, 545 kB gzip JS)
**Pre-existing files NOT touched:** `CommunityPage.tsx`, `CommunityHubPage.tsx`, `FounderPage.tsx`, `main` branch.

---

## Chairman's directives addressed

### 1 · Multi-language engine (Pashto / Urdu lock UI without translating Marcus)

**Files:** `src/i18n/translations.ts`, `src/i18n/LanguageContext.tsx`, `src/main.tsx`,
`src/components/Navbar.tsx`, `src/components/SiteSidebar.tsx`,
`src/components/Footer.tsx`, `src/components/OKBONDCalculator.tsx`,
`src/components/OKBONDHeatmap.tsx`.

- `<html lang>` and `<html dir="rtl|ltr">` are written by `LanguageProvider`
  on every change, so RTL flips reliably for Urdu and Pashto.
- `main.tsx` now renders `<App />` inside a `KeyedApp` wrapper that uses
  `key={lang}`, forcing a hard remount of the entire tree on every locale
  change. Components that don't subscribe to `useLanguage` themselves
  still re-render against the new locale.
- `translations.ts` expanded across **en / ur / ps** with
  `nav.lottery`, `nav.token`, `nav.ico`, `nav.icoBuy`, `nav.icoLive`,
  `nav.stake`, `nav.stakeSoon`, `nav.tokenomics`, `nav.profile`,
  `nav.system`, `nav.winners`, `nav.rules`, `nav.admin`, `nav.aboutUs`,
  `sidebar.docs`, `sidebar.socials`, `sidebar.whitepaper`, `sidebar.audit`,
  `calc.title`, `calc.subtitle`, `calc.investment`, `calc.amount`,
  `calc.duration`, `map.title`, `map.subtitle`.
- `translate()` falls back EN → key on missing entries, so any future
  English-only string still renders, never breaks.
- Marcus AI itself is **not translated** — it continues to detect the
  user's prompt language server-side and reply in the same script.

### 2 · Marcus AI mid-sentence stop ("…Faisal Orakzai." cutoff)

**File:** `src/components/MarcusOrb.tsx`.

- All long-pause punctuation (em-dash `—`, en-dash `–`, ellipsis `…`)
  removed from `FALLBACK_GREETING_INVESTOR`,
  `FALLBACK_GREETING_CHAIRMAN`, `INVESTOR_FALLBACK`, and `ELITE_FALLBACK`.
  Chrome's SpeechSynthesis treats `—` as a hard break and frequently
  fails to start the next utterance — that is the precise byte the orb
  was choking on.
- New `speechSafe()` sanitiser strips U+2014 / U+2013 / U+2026 and
  collapses double-spaces. Wired into both `enqueue()` (the streaming
  TTS feeder) and `speakChunked()` (the non-stream fallback) so the
  same hardening applies to every audio path.
- New **inter-chunk watchdog** (12 s) in the SSE reader aborts the
  connection if upstream goes quiet mid-stream, so we fall through to
  the proven non-stream brain instead of leaving Marcus mute.
- New **truncation guard** rejects any stream that closes WITHOUT a
  `done` event AND delivered fewer than ~120 characters — the exact
  failure mode that produced the "Faisal Orakzai." cutoff.

### 3 · SmartCalculator + Investor Map back on Home

**Files:** `src/App.tsx`, `src/components/OKBONDCalculator.tsx`.

- `OKBONDCalculator` imported and rendered on the `/` route, ABOVE
  `OKBONDHeatmap`, both wrapped in their own `<ErrorBoundary scope=…
  silent>` so a failure in one cannot blank the other.
- The Calculator already supports the optional `adminAPY`, `adminPrice`,
  and `adminStage` props and reads from Supabase live settings — no
  changes needed beyond mounting it.
- Vertical stack on every breakpoint; the components own their own
  responsive grids so mobile renders single-column with no overflow.

### 4 · Mobile fixes for `AIBriefingTicker`

**File:** `src/components/AIBriefingTicker.tsx`.

- **UTC clock hidden < md** (`hidden md:flex`) so it cannot eat scarce
  mobile width.
- **"Marcus" label** uses `text-[7px] md:text-[9px]` and a responsive
  `<span className="md:hidden">Marcus</span>` /
  `<span className="hidden md:inline">Marcus · Briefing</span>` swap to
  collapse to the bare word on phones.
- Briefing text bumped to `text-[12px]` on mobile (was 10–11), with a
  smaller diamond separator `mx-6` to give it priority.
- Side-gutters now controlled by a tiny scoped `<style>` block:
  `margin-left: 70px; margin-right: 14px` on phones, `160px` /
  `200px` on `md+`. The scrolling text never slides under the badges
  and the right edge no longer overflows on a 375 px viewport.

### 5 · Clean build verification

```
vite v5.4.21 building for production...
✓ 3012 modules transformed.
dist/index.html                     2.29 kB │ gzip:   0.88 kB
dist/assets/index-CIpg1R6W.css    305.73 kB │ gzip:  39.40 kB
dist/assets/index-CgXrdCc8.js   1,930.31 kB │ gzip: 545.46 kB
✓ built in 12.70s
```

Also fixed a pre-existing duplicate `style` JSX attribute on the
"Discussing:" pill inside `MarcusOrb.tsx` that was failing the
production build (the second `style` block was a strict superset of
the first; the redundant earlier one was removed).

---

## Files changed in this commit

```
src/App.tsx                            (Calculator on home + ErrorBoundary scopes)
src/main.tsx                           (KeyedApp wrapper for full lang remount)
src/i18n/translations.ts               (en/ur/ps key expansion)
src/components/AIBriefingTicker.tsx    (mobile gutters, hide UTC, briefing priority)
src/components/MarcusOrb.tsx           (em-dashes removed, speechSafe + watchdog + truncation guard, dup style fix)
src/components/Navbar.tsx              (t() wired across nav + Connect Wallet)
src/components/SiteSidebar.tsx         (NAV_ITEMS / PAGE_LINKS labelKey wiring)
src/components/Footer.tsx              (links / legalLinks t() wiring)
src/components/OKBONDCalculator.tsx    (header title/subtitle via t())
src/components/OKBONDHeatmap.tsx       (header title/subtitle via t())
RESTORATION_REPORT.md                  (this file)
```

## Out-of-scope per Chairman directive

- `src/pages/CommunityPage.tsx` — untouched.
- `src/pages/CommunityHubPage.tsx` — untouched.
- `src/pages/FounderPage.tsx` — untouched.
- `main` branch — untouched. Push goes to
  `restore/full-elite-suite-2026-04-29` only, fast-forward only,
  no force-push.
