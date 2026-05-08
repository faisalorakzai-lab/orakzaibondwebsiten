import { useEffect } from "react";
import Community from "@/components/Community";

export default function CommunityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Community | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <main className="flex-1 pt-20 pb-16 neural-grid-strong relative z-10">
      <Community />
    </main>
  );
}
