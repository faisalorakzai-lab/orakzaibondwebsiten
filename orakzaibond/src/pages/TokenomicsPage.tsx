import { useEffect } from "react";
import Tokenomics from "@/components/Tokenomics";
import SEO, { PAGE_SEO } from "@/components/SEO";

export default function TokenomicsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Tokenomics | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <>
      <SEO {...PAGE_SEO.tokenomics} />
    <main className="flex-1 midnight-page">
      <div className="relative z-10">
        <Tokenomics />
      </div>
    </main>
    </>
  );
}
