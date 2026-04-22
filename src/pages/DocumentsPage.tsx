import { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResourcesSection from "@/components/ResourcesSection";
import SecuritySection from "@/components/SecuritySection";

export default function DocumentsPage() {
  const { address, connect } = useWallet();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Documents & Security | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar address={address} onConnect={connect} />
      <main className="flex-1 pt-20">
        <ResourcesSection />
        <SecuritySection />
      </main>
      <Footer />
    </div>
  );
}
