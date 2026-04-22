import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AdminPage from "@/pages/AdminPage";
import FounderPage from "@/pages/FounderPage";
import SecretAdminPage from "@/pages/SecretAdminPage";
import WinnersPage from "@/pages/WinnersPage";
import SystemPage from "@/pages/SystemPage";
import RulesPage from "@/pages/RulesPage";
import ICOPage from "@/pages/ICOPage";
import GuidePage from "@/pages/GuidePage";
import AboutPage from "@/pages/AboutPage";
import CommunityPage from "@/pages/CommunityPage";
import ContactPage from "@/pages/ContactPage";
import DocumentsPage from "@/pages/DocumentsPage";

import Navbar from "@/components/Navbar";
import SiteSidebar from "@/components/SiteSidebar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TokenDetails from "@/components/TokenDetails";
import Lottery from "@/components/Lottery";
import Tokenomics from "@/components/Tokenomics";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";
import StatsStrip from "@/components/StatsStrip";
import { useWallet } from "@/hooks/useWallet";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Megaphone } from "lucide-react";
import WinnersHallOfFame from "@/components/WinnersHallOfFame";
import Community from "@/components/Community";
import FounderSection from "@/components/FounderSection";
import ResourcesSection from "@/components/ResourcesSection";
import SecuritySection from "@/components/SecuritySection";
import ContactSection from "@/components/ContactSection";
import ICOModule from "@/components/ICOModule";
import SafetyVault from "@/components/SafetyVault";
import LatestUpdates from "@/components/LatestUpdates";
import LoyaltyTier from "@/components/LoyaltyTier";
import WhatsAppBot from "@/components/WhatsAppBot";

const queryClient = new QueryClient();

// ── Global Announcement — edit this to push a new site-wide message ──────────
const GLOBAL_ANNOUNCEMENT = {
  active: true,
  message: "🚀 OKBOND ICO is LIVE!  |  $10 Entry  |  100% Capital Protection Guaranteed  |  Powered by Polygon Network  |  🔥 Orakzai Bond Lottery is LIVE — Connect your wallet and enter now!  |  250+ Projects · One Ecosystem · Infinite Power",
};

function Home() {
  const { address, provider, isPolygon, error: walletError, connect, switchToPolygon } = useWallet();
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(() =>
    sessionStorage.getItem("okbond_ann_dismissed") === "1"
  );
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (walletError) setErrorDismissed(false);
  }, [walletError]);

  // Parse ?ref=ADDRESS from URL — store in localStorage so it persists across tabs & sessions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.startsWith("0x") && ref.length === 42) {
      setReferrer(ref);
      localStorage.setItem("okbond_referrer", ref);
    } else {
      const stored = localStorage.getItem("okbond_referrer");
      if (stored && stored.startsWith("0x") && stored.length === 42) setReferrer(stored);
    }
  }, []);

  const showBanner = walletError && !errorDismissed;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} />
      <SiteSidebar />

      {/* ── Global Announcement Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {GLOBAL_ANNOUNCEMENT.active && !announcementDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full border-b border-primary/30 bg-gradient-to-r from-primary/15 via-primary/20 to-primary/15 px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <motion.div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
                animate={{ boxShadow: ["0 0 6px rgba(234,179,8,0.3)", "0 0 18px rgba(234,179,8,0.7)", "0 0 6px rgba(234,179,8,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Megaphone className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest font-mono">
                LIVE
              </span>
              {/* Scrolling ticker */}
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="ticker-track">
                  {/* Text duplicated for seamless loop */}
                  <span className="text-sm text-primary/90 font-semibold whitespace-nowrap pr-24">
                    {GLOBAL_ANNOUNCEMENT.message}
                  </span>
                  <span className="text-sm text-primary/90 font-semibold whitespace-nowrap pr-24" aria-hidden>
                    {GLOBAL_ANNOUNCEMENT.message}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setAnnouncementDismissed(true); sessionStorage.setItem("okbond_ann_dismissed", "1"); }}
              className="text-primary/50 hover:text-primary transition-colors flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet error banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{walletError}</span>
            </div>
            <button
              onClick={() => setErrorDismissed(true)}
              className="text-destructive/70 hover:text-destructive transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral banner */}
      <AnimatePresence>
        {referrer && referrer.toLowerCase() !== address?.toLowerCase() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full border-b border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-xs text-primary/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Referred by:{" "}
              <span className="font-mono text-primary font-semibold">
                {referrer.slice(0, 8)}…{referrer.slice(-6)}
              </span>{" "}
              — 5 OKBOND bonus applied to your entry
            </div>
            <button
              onClick={() => { setReferrer(null); localStorage.removeItem("okbond_referrer"); }}
              className="text-primary/40 hover:text-primary/70 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live stats ticker */}
      <StatsStrip provider={provider} />

      <main className="flex-1 lg:pl-[60px]">
        <Hero onConnect={connect} address={address} />
        <LoyaltyTier provider={provider} address={address} onConnect={connect} />
        <SafetyVault />
        <LatestUpdates />
        <About />
        <TokenDetails provider={provider} />
        <Lottery provider={provider} address={address} onConnect={connect} referrer={referrer} isPolygon={isPolygon} switchToPolygon={switchToPolygon} />
        <WinnersHallOfFame provider={provider} />
        <ICOModule provider={provider} address={address} onConnect={connect} referrer={referrer} isPolygon={isPolygon} switchToPolygon={switchToPolygon} />
        <Tokenomics />
        <Roadmap />
        <FounderSection />
        <Community />
        <ResourcesSection />
        <SecuritySection />
        <ContactSection />
      </main>
      <div className="lg:pl-[60px]">
        <Footer />
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const hideWA = location.includes("/admin") || location.includes("/faisal-admin-portal");
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ico" component={ICOPage} />
        <Route path="/founder" component={FounderPage} />
        <Route path="/winners" component={WinnersPage} />
        <Route path="/system" component={SystemPage} />
        <Route path="/rules" component={RulesPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/faisal-admin-portal" component={SecretAdminPage} />
        <Route path="/guide" component={GuidePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/Community" component={CommunityPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/Contact" component={ContactPage} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/Documents" component={DocumentsPage} />
        <Route component={NotFound} />
      </Switch>
      {!hideWA && <WhatsAppBot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
