# OKBOND Services Lower-Page Refinement

## Scope

Redesign only the sections below the existing `/services` hero and image-card carousel. Preserve the hero section and the image-card carousel exactly as they are, including their imagery, copy, card behavior, and responsive treatment. Keep the existing country selector, service category links, inquiry workflows, real routes, request-only disclosures, and backend behavior intact.

## Implementation

- Keep `ICOPage.tsx` hero and `ServiceCarousel` markup/behavior unchanged.
- Refine the existing `GlobalServicesHub` and `ServiceWorkflows` presentation through scoped CSS, without inventing live availability, pricing, integrations, bookings, payments, or financial claims.
- Use the current real destinations and inquiry-only wording; preserve local country selection and existing query/hash links.
- Add a global category registry with market-specific category visibility, including Pakistan government payments, savings, insurance, travel/mobility, and digital product service inventories.
- Add a country-aware “See all services” directory that expands complete services for the selected market and updates when the country filter changes.
- Maintain no horizontal overflow on Android/mobile and preserve reduced-motion behavior.
- Run the existing Vite build after edits and update the repository on `origin/main`.

## Design

- **Design movement:** institutional private-bank / sovereign service desk; calm, editorial, and operational rather than “tech demo”.
- **Core principles:** clarity before decoration, restrained luxury, visible status, and generous breathing room.
- **Color philosophy:** obsidian surfaces create trust and focus; champagne gold is reserved for navigation and hierarchy; muted sage signals availability without implying guarantees.
- **Layout paradigm:** a full-width editorial band followed by a structured market panel and a measured two-column request desk, not a dense generic grid.
- **Signature elements:** hairline gold rules, quiet section numbering, framed selector panels, and consistent status dots.
- **Interaction philosophy:** every interactive element maps to an existing route, anchor, or inquiry flow; hover states are subtle and keyboard focus remains obvious.
- **Animation:** restrained lift and border transitions only; reduced motion removes transforms and long transitions.
- **Typography system:** existing Playfair Display for editorial headlines, Inter/Sora for interface copy, and compact uppercase metadata for operational labels.
- **Brand essence:** a clear, request-led gateway to OKBOND services across supported markets; composed, credible, practical.
- **Brand voice:** direct and honest, e.g. “Built around real next steps.” and “No unsupported service is represented as live.”
- **Wordmark & logo:** preserve the existing OKBOND wordmark treatment and current site chrome.
- **Signature brand color:** sovereign champagne gold `#E5C46F`.

## Project structure

- `orakzaibond/src/pages/ICOPage.tsx`: existing service page composition; preserve hero and image-card carousel markup.
- `orakzaibond/src/pages/ServicesMarketplace.css`: scoped lower-page refinement rules for the global hub and workflow section.
- `orakzaibond/src/components/ServiceWorkflows.tsx`: existing inquiry functionality and disclosure language; no behavioral changes.
- `orakzaibond/src/components/ServiceWorkflows.css`: existing workflow layout and form styles; append only presentation refinements where needed.
- `orakzaibond/public/manus-routes.json`: existing `/services` declaration remains unchanged.
