import { useState, useRef, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SiteSidebar, { SidebarHandle } from "./components/SiteSidebar";
import Footer from "./components/Footer";
import { useWallet } from "./hooks/useWallet";

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
import CommunityHubPage from "./pages/CommunityHubPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/not-found";
import AdminGate from "./components/AdminGate";
import WhatsAppBot from "./components/WhatsAppBot";
import LiveVaultStatus from "./components/LiveVaultStatus";
import MarcusAILiveLog from "./components/MarcusAILiveLog";
import SovereignGuarantee from "./components/SovereignGuarantee";
import OKBONDHeatmap from "./components/OKBONDHeatmap";
import MarcusOrb from "./components/MarcusOrb";
import PresenceGlow from "./components/PresenceGlow";
import FilmGrain from "./components/FilmGrain";
// FounderSection intentionally NOT imported on the homepage — the founder
// block lives on its dedicated /founder page (FounderPage.tsx). Reverting
// the unauthorized homepage embed per Chairman's directive.

console.log("App.tsx module loaded");

function App() {
  const { address, connect } = useWallet();
  const sidebarRef = useRef<SidebarHandle>(null);
  // useLocation drives the route-level ErrorBoundary's resetKey so that
  // navigating away from a broken page automatically clears the error
  // state — no full page reload required.
  const [location] = useLocation();

  useEffect(() => {
    console.log("App component mounted");
    document.documentElement.classList.add("dark");
  }, []);

  const handleMenuToggle = () => {
    if (sidebarRef.current) {
      sidebarRef.current.toggleMobile();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <ErrorBoundary scope="Navbar" silent>
        <Navbar
          address={address}
          onConnect={connect}
          onMenuToggle={handleMenuToggle}
        />
      </ErrorBoundary>
      <ErrorBoundary scope="Sidebar" silent>
        <SiteSidebar ref={sidebarRef} />
      </ErrorBoundary>

      <main className="flex-1 lg:pl-[60px]">
        {/* Route-level boundary. Keyed on `location` so a thrown render in
            FounderPage/etc. produces a friendly "Terminal interruption"
            panel instead of the previous black-void crash, and so simply
            clicking another sidebar link heals the UI. */}
        <ErrorBoundary scope={`route:${location}`} resetKey={location}>
          <Switch>
            <Route path="/">
              <>
                <Hero onConnect={connect} address={address} />
                <LiveVaultStatus />
                <MarcusAILiveLog />
                <SovereignGuarantee />
                <OKBONDHeatmap />
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
            <Route path="/community-hub" component={CommunityHubPage} />
            <Route path="/profile/:username" component={ProfilePage} />
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
