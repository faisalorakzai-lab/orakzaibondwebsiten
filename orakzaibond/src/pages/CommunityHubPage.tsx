import { useEffect } from "react";
import CommunityHub from "@/components/CommunityHub";
import SEO, { PAGE_SEO } from "@/components/SEO";

export default function CommunityHubPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Community Hub | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <>
      <SEO {...PAGE_SEO.communityHub} />
    <main className="flex-1 pt-20">
      <CommunityHub />
    </main>
    </>
  );
}
