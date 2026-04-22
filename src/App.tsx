import { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SiteSidebar, { SidebarHandle } from "./components/SiteSidebar";
import Footer from "./components/Footer";
import { useWallet } from "./hooks/useWallet";

function App() {
  const { address, connect } = useWallet();
  const sidebarRef = useRef<SidebarHandle>(null);

  useEffect(() => {
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
        {/* The Home screen only shows the Hero (Launchpad) section */}
        <Hero onConnect={connect} address={address} />
      </main>

      <div className="lg:pl-[60px]">
        <Footer />
      </div>
    </div>
  );
}

export default App;
