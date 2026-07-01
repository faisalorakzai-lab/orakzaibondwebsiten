import { useSEO, PAGE_SEO } from "@/components/SEO";
import { useEffect } from "react";
import Roadmap from "@/components/Roadmap";

export default function RoadmapPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Roadmap | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.roadmap);
  return (
    <main className="flex-1 midnight-page">
      <div className="relative z-10">
        <Roadmap />
      </div>
    </main>
  );
}
