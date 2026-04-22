import { useEffect } from "react";
import Roadmap from "@/components/Roadmap";

export default function RoadmapPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Roadmap | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <main className="flex-1">
      <Roadmap />
    </main>
  );
}
