import { useSEO, PAGE_SEO } from "@/components/SEO";
import { useEffect } from "react";
import CommunityHub from "@/components/CommunityHub";

export default function CommunityHubPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Community Hub | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.communityHub);
  return (
    <main className="flex-1 pt-20">
      <CommunityHub />
    </main>
  );
}
