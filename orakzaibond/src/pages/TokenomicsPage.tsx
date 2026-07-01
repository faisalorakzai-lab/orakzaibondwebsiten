import { useSEO, PAGE_SEO } from "@/components/SEO";
import { useEffect } from "react";
import Tokenomics from "@/components/Tokenomics";

export default function TokenomicsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Tokenomics | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.tokenomics);
  return (
    <main className="flex-1 midnight-page">
      <div className="relative z-10">
        <Tokenomics />
      </div>
    </main>
  );
}
