import { useState, useRef, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar";
import { useIsDesktop } from "./hooks/useIsDesktop";
import Hero from "./components/Hero";
import SiteSidebar, { SidebarHandle } from "./components/SiteSidebar";
import MobileDrawer from "./components/MobileDrawer";
import Footer from "./components/Footer";
import { useWallet } from "./hooks/useWallet";
import { isAdminAddress } from "./lib/adminAuth";

// Pages
import AboutPage from "./pages/AboutPage";
import FounderPage from "./pages/FounderPage";
import ICOPage from "./pages/ICOPage";
import CommunityPage from "./pages/CommunityPage";
import ContactPage from "./pages/ContactPage";
import DocumentsPage from "./pages/DocumentsPage";
import GuidePage from "./pages/GuidePage";
import RulesPage from "./pages/RulesPage";
import RoadmapPage from "./pages/RoadmapPage";
import TokenPage from "./pages/TokenPage";
import TokenomicsPage from "./pages/TokenomicsPage";
import SystemPage from "./pages/SystemPage";
import WinnersPage from "./pages/WinnersPage";
import LotteryPage from "./pages/LotteryPage";
import AdminPage from "./pages/AdminPage";
import SecretAdminPage from "./pages/SecretAdminPage";
import ThreatConsolePage from "./pages/ThreatConsolePage";
import MarcusDefensePage from "./pages/MarcusDefensePage";
import CommunityHubPage from "./pages/CommunityHubPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/not-found";
import AmbassadorPage from "./pages/AmbassadorPage";
import LegalPage from "./pages/LegalPage";
import AdminGate from "./components/AdminGate";
import WhatsAppBot from "./components/WhatsAppBot";
import DashboardPage from "./pages/DashboardPage";
import StakingPage from "./pages/StakingPage";
import VaultPage from "./pages/VaultPage";
import SecurityPage from "./pages/SecurityPage";
import RegistryPage from "./pages/RegistryPage";
import LiveVaultStatus from "./components/LiveVaultStatus";
import MarcusAILiveLog from "./components/MarcusAILiveLog";
import SovereignGuarantee from "./components/SovereignGuarantee";
import MarcusOrb from "./components/MarcusOrb";
import PresenceGlow from "./components/PresenceGlow";
import FilmGrain from "./components/FilmGrain";
import AIBriefingTicker from "./components/AIBriefingTicker";
import OKBONDHeatmap from "./components/OKBONDHeatmap";
import TrustStrip from "./components/TrustStrip";
import WalletModal from "./components/WalletModal";
// OKBONDCalculator was previously rendered on the homepage; per Chairman
// directive (2026-04-30) it now lives ONLY on /ico (ICOPage.tsx) where
// it is already mounted with apy={18}. Do not re-add it to the home route.
// FounderSection intentionally NOT imported on the homepage — the founder
// block lives on its dedicated /founder page (FounderPage.tsx). Reverting
// the unauthorized homepage embed per Chairman's directive.

console.log("App.tsx module loaded");

function App() {
  const { address, connect, disconnect, error: walletError, clearError, okbondBalance } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Open wallet modal automatically when wallet hook surfaces an error
  useEffect(() => {
    if (walletError) setWalletModalOpen(true);
  }, [walletError]);
  // ── Mobile drawer state, LIFTED into App.tsx ─────────────────────────────
  // Previously SiteSidebar owned this state internally and exposed a
  // toggleMobile() method via forwardRef + useImperativeHandle. That worked
  // on desktop but on phones the hamburger tap was a silent no-op for some
  // users — if SiteSidebar's silent ErrorBoundary swallowed a render-time
  // error (ReserveWidget RPC failure, IntersectionObserver edge case, …),
  // sidebarRef.current never got attached and handleMenuToggle became a
  // dead handler. Lifting the state here makes the hamburger bulletproof:
  // the toggle is just a setState that always works, and the sidebar
  // becomes a controlled component driven by these props. The legacy ref
  // is kept so any existing call site that imports SidebarHandle still
  // type-checks.
  const sidebarRef = useRef<SidebarHandle>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // useLocation drives the route-level ErrorBoundary's resetKey so that
  // navigating away from a broken page automatically clears the error
  // state — no full page reload required.
  const [location, setLocation] = useLocation();
  // JS-measured viewport class — TRUE only when window >= 1024 CSS px
  // (Tailwind's `lg`). Drives the Navbar/MobileNavbar conditional render
  // below. See src/hooks/useIsDesktop.ts for the rationale.
  const isDesktop = useIsDesktop();

  useEffect(() => {
    console.log("App component mounted");
    document.documentElement.classList.add("dark");
  }, []);

  // Auto-close the mobile drawer whenever the route changes — guarantees
  // the drawer never gets "stuck open" after navigation, and lets each
  // tap on a sidebar link feel immediate.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // ── Chairman wallet auto-redirect to /admin ──────────────────────────────
  // Per Chairman directive 2026-04-30: when the authorised admin wallet
  // (currently 0x9b02e2…8cd7) connects to the dapp, route them straight to
  // the Admin Panel so they don't have to find the sidebar link on mobile.
  //
  // Implementation notes:
  // • We track the *previous* address with a ref so the redirect fires once
  //   per connect transition, NOT every render. Without the ref, every time
  //   the chairman navigates AWAY from /admin (e.g. to view a public page
  //   from the admin dashboard) this effect would yank them back, making
  //   the rest of the site unreachable while connected.
  // • We also skip the redirect if they're already on any admin sub-route
  //   (/admin, /secret-admin, /threat-console) so the effect is idempotent
  //   on the very first mount when the wallet was already connected from a
  //   previous session.
  const prevAddressRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevAddressRef.current;
    prevAddressRef.current = address;

    // Only react to a transition into a new admin address — not to repeated
    // renders with the same address.
    if (!isAdminAddress(address)) return;
    if (prev && prev.toLowerCase() === (address ?? "").toLowerCase()) return;

    // Don't bounce if the chairman is already inside any admin surface.
    const isOnAdminSurface =
      location === "/admin" ||
      location === "/secret-admin" ||
      location === "/threat-console";
    if (isOnAdminSurface) return;

    setLocation("/admin");
  }, [address, location, setLocation]);

  const handleMenuToggle = () => {
    setMobileMenuOpen((p) => !p);
  };

  // Expose a globally-accessible toggle so the Navbar's native `touchstart`
  // listener (and any future kill-switch surface like a debug console call,
  // a long-press gesture, or an external automation) can flip the mobile
  // drawer without going through React's synthetic event system. This pairs
  // with the listener wired up inside Navbar.tsx — see the comment block
  // there for the full rationale. Cleanup deletes the global on unmount so
  // we never leak references to a stale React state setter.
  useEffect(() => {
    const w = window as unknown as { toggleOrakzaiSidebar?: () => void };
    w.toggleOrakzaiSidebar = () => setMobileMenuOpen((p) => !p);
    return () => {
      delete w.toggleOrakzaiSidebar;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* Per Chairman's directive 2026-04-30: the desktop Navbar must be
          UNMOUNTED — not just CSS-hidden — below 1024px CSS px. Tailwind's
          `hidden md:flex` on the desktop nav links was failing inside Trust
          Wallet's in-app browser (and other Android webviews) which mis-
          report viewport width and therefore rendered BOTH the desktop nav
          links AND the mobile hamburger simultaneously, producing the
          "double-bar" the Chairman observed. JS-measured branch below
          ensures EXACTLY ONE chrome is in the React tree. The MobileNavbar
          calls the same `onMenuToggle` so the existing global toggle and
          touch listener on the desktop Navbar still operate identically. */}
      <ErrorBoundary scope="Navbar" silent>
        {isDesktop ? (
          <Navbar
            address={address}
            okbondBalance={okbondBalance}
            onConnect={() => { clearError(); connect(); }}
            onDisconnect={disconnect}
            onMenuToggle={handleMenuToggle}
          />
        ) : (
          <MobileNavbar
            address={address}
            okbondBalance={okbondBalance}
            onConnect={() => { clearError(); connect(); }}
            onDisconnect={disconnect}
            onMenuToggle={handleMenuToggle}
          />
        )}
      </ErrorBoundary>

      {/* Trust strip — sitewide trust signals scrolling bar */}
      <ErrorBoundary scope="TrustStrip" silent>
        <TrustStrip />
      </ErrorBoundary>

      {/* Wallet Modal — shown when MetaMask is not installed or on error */}
      <WalletModal
        open={walletModalOpen}
        onClose={() => { setWalletModalOpen(false); clearError(); }}
        error={walletError}
        onRetry={() => { setWalletModalOpen(false); clearError(); connect(); }}
      />
      <ErrorBoundary scope="Sidebar" silent>
        <SiteSidebar
          ref={sidebarRef}
          mobileOpen={mobileMenuOpen}
          onMobileOpenChange={setMobileMenuOpen}
        />
      </ErrorBoundary>

      {/* Chairman directive 2026-04-30 (round 3): the mobile drawer MUST
          render outside the Sidebar ErrorBoundary. Earlier the drawer lived
          inside <SiteSidebar/>, which meant any silent error inside the
          sidebar tree (e.g. ReserveWidget RPC failing on a flaky mobile
          network) would unmount the entire sidebar AND the drawer with it,
          producing the "button feels clicked but nothing happens" bug the
          Chairman observed on his phone. MobileDrawer now lives here in its
          OWN error boundary, has zero coupling to SiteSidebar, and portals
          itself to <body> — so it is bulletproof against anything that
          might break elsewhere on the page. */}
      <ErrorBoundary scope="MobileDrawer" silent>
        <MobileDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary scope="AIBriefingTicker" silent>
        <AIBriefingTicker />
      </ErrorBoundary>

      {/* Chairman directive 2026-04-30 (round 6): apply the Community
          page's Cyber-Grid + gold ambience to EVERY page except /founder
          (Founder keeps its own bespoke parchment treatment). The
          .neural-grid-strong class drives the animated grid bg + corner
          glow nodes — same DNA as Community — and is now applied at the
          <main> level so every route inherits it without per-page edits.
          Founder explicitly opts out by checking the location. */}
      <main
        className={`flex-1 lg:pl-[60px] ${
          location === "/founder" ? "" : "neural-grid-strong global-dispatch-theme"
        }`}
      >
        {/* Route-level boundary. Keyed on `location` so a thrown render in
            FounderPage/etc. produces a friendly "Terminal interruption"
            panel instead of the previous black-void crash, and so simply
            clicking another sidebar link heals the UI. */}
        <ErrorBoundary scope={`route:${location}`} resetKey={location}>
          <Switch>
            <Route path="/">
              {/* Chairman directive (2026-04-30): SmartCalculator MOVED to
                  /ico page (it is rendered inside ICOPage.tsx). The Global
                  Investor Map (OKBONDHeatmap) STAYS on the homepage and
                  must stack vertically at full width on every breakpoint
                  via its own responsive grid; no horizontal scroll. */}
              <>
                <Hero onConnect={connect} address={address} />
                <LiveVaultStatus />
                <MarcusAILiveLog />
                <SovereignGuarantee />
                <ErrorBoundary scope="OKBONDHeatmap" silent>
                  <OKBONDHeatmap />
                </ErrorBoundary>
              </>
            </Route>
            <Route path="/about" component={AboutPage} />
            <Route path="/founder" component={FounderPage} />
            <Route path="/ico">
              {() => {
                console.log("Rendering /ico route");
                return <ICOPage />;
              }}
            </Route>
            <Route path="/lottery" component={LotteryPage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/documents" component={DocumentsPage} />
            <Route path="/guide" component={GuidePage} />
            <Route path="/rules" component={RulesPage} />
            <Route path="/roadmap" component={RoadmapPage} />
            <Route path="/token" component={TokenPage} />
            <Route path="/tokenomics" component={TokenomicsPage} />
            <Route path="/system" component={SystemPage} />
            <Route path="/winners" component={WinnersPage} />
            <Route path="/admin">
              <AdminGate>
                <AdminPage />
              </AdminGate>
            </Route>
            <Route path="/secret-admin">
              <AdminGate>
                <SecretAdminPage />
              </AdminGate>
            </Route>
            <Route path="/threat-console">
              <AdminGate>
                <ThreatConsolePage />
              </AdminGate>
            </Route>
            <Route path="/marcus-defense">
              <AdminGate>
                <MarcusDefensePage />
              </AdminGate>
            </Route>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/staking" component={StakingPage} />
            <Route path="/vault" component={VaultPage} />
            <Route path="/security" component={SecurityPage} />
            <Route path="/registry" component={RegistryPage} />
            <Route path="/community-hub" component={CommunityHubPage} />
            <Route path="/profile/:username" component={ProfilePage} />
            <Route path="/ambassador" component={AmbassadorPage} />
            <Route path="/legal" component={LegalPage} />
            <Route component={NotFound} />
          </Switch>
        </ErrorBoundary>
      </main>

      <div className="lg:pl-[60px]">
        <ErrorBoundary scope="Footer" silent>
          <Footer />
        </ErrorBoundary>
      </div>

      {/* Floating widgets are each isolated in their own SILENT boundary.
          A crash in MarcusOrb / WhatsAppBot / PresenceGlow / FilmGrain
          must NEVER take down the page — it just hides that one widget. */}
      <ErrorBoundary scope="PresenceGlow" silent>
        <PresenceGlow />
      </ErrorBoundary>
      <ErrorBoundary scope="WhatsAppBot" silent>
        <WhatsAppBot />
      </ErrorBoundary>
      <ErrorBoundary scope="MarcusOrb" silent>
        <MarcusOrb />
      </ErrorBoundary>
      <ErrorBoundary scope="FilmGrain" silent>
        <FilmGrain />
      </ErrorBoundary>
    </div>
  );
}

export default App;
