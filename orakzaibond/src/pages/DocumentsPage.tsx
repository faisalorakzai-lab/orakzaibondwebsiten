import { useEffect } from "react";
import ResourcesSection from "@/components/ResourcesSection";
import SecuritySection from "@/components/SecuritySection";

export default function DocumentsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Documents & Security | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.documents);
  return (
    <main className="flex-1 pt-20">
      <ResourcesSection />
      <SecuritySection />
    </main>
  );
}
