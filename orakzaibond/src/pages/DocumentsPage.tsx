import { useEffect } from "react";
import ResourcesSection from "@/components/ResourcesSection";
import SecuritySection from "@/components/SecuritySection";
import SEO, { PAGE_SEO } from "@/components/SEO";

export default function DocumentsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Documents & Security | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <>
      <SEO {...PAGE_SEO.documents} />
    <main className="flex-1 pt-20">
      <ResourcesSection />
      <SecuritySection />
    </main>
    </>
  );
}
