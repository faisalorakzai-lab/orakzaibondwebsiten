import { useState, useRef, useEffect } from "react";
import { Route, Switch } from "wouter";
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
import CommunityHubPage from "./pages/CommunityHubPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/not-found";
import AdminGate from "./components/AdminGate";
import WhatsAppBot from "./components/WhatsAppBot";

console.log("App.tsx module loaded");

function App() {
  const { address, connect } = useWallet();
  const sidebarRef = useRef<SidebarHandle>(null);

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
      <Navbar 
        address={address} 
        onConnect={connect} 
        onMenuToggle={handleMenuToggle}
      />
      <SiteSidebar ref={sidebarRef} />

      <main className="flex-1 lg:pl-[60px]">
        <Switch>
          <Route path="/">
            <Hero onConnect={connect} address={address} />
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
          <Route path="/community-hub" component={CommunityHubPage} />
          <Route path="/profile/:username" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <div className="lg:pl-[60px]">
        <Footer />
      </div>

      {/* Floating WhatsApp widget — visible on every page */}
      <WhatsAppBot />
    </div>
  );
}

export default App;
