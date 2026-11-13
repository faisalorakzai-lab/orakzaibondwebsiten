# OKBOND Ecosystem Section Plan

## Scope
Insert one premium ecosystem-explanation section immediately after the existing `Hero` and before `BuiltForCarousel`. Do not alter existing hero, audience carousel, navigation, footer, routes, wallet behavior, contracts, or backend systems.

## Implementation
- Reuse the existing `EcosystemDiscovery` component and stylesheet, which are currently not mounted on the homepage.
- Replace its service-discovery content with four non-fake ecosystem pillars: Digital Asset, Ecosystem Utilities, Staking & Participation, and Transparency & Security.
- Mount it in `App.tsx` directly after the hero boundary.
- Use real destinations only: `/staking`, `/documents`, `/about`, and the existing `#okbond-ecosystem` anchor.
- Add IntersectionObserver-based entrance state and CSS motion with reduced-motion support.
- Keep mobile cards in a vertical progression with no horizontal overflow; use a four-column connected composition at desktop widths.

## Design
- **Design movement:** cinematic institutional fintech / sovereign wealth interface.
- **Core principles:** restrained luxury, precise hierarchy, transparent availability, and generous whitespace.
- **Color philosophy:** matte black grounds the interface; metallic gold is reserved for signal, state, and connection lines.
- **Layout paradigm:** a left editorial introduction feeds into a connected four-stage rail rather than a generic card grid.
- **Signature elements:** fine gold connector rail, numbered stage markers, and a softly lit central-node motif.
- **Interaction philosophy:** cards respond to pointer hover and enter on scroll; only real routes/anchors are interactive.
- **Animation:** short opacity/translate reveals, subtle connector pulse, and restrained hover lift; fully disabled under reduced motion.
- **Typography system:** existing Playfair Display heading paired with Inter/Sora body and mono metadata.
- **Brand essence:** a transparent, practical digital-asset ecosystem for users, savers, and businesses; composed, credible, forward-looking.
- **Brand voice:** clear and factual, e.g. “Infrastructure first. Utility follows.” and “Availability is shown plainly, not implied.”
- **Wordmark/mark:** retain the existing OKBOND wordmark treatment and use numbered orbital nodes.
- **Signature brand color:** sovereign metallic gold `#D4AF37`.

## Project structure
- `orakzaibond/src/App.tsx`: homepage composition and insertion point.
- `orakzaibond/src/components/EcosystemDiscovery.tsx`: section structure/content.
- `orakzaibond/src/components/EcosystemDiscovery.css`: isolated responsive styling and motion.
