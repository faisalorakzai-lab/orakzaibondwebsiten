import { useEffect } from "react";
import Community from "@/components/Community";
import OrakzaiSocialFeed from "@/components/OrakzaiSocialFeed";

export default function CommunityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Community | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <>
      <div className="starfield-bg" />
      <main className="flex-1 pt-20 pb-16 community-page-deep-space relative z-10">
        <Community />
        <OrakzaiSocialFeed />
      </main>
    </>
  );
}
