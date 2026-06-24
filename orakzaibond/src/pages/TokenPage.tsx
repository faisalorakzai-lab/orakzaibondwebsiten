import { useEffect } from "react";
import Token from "@/components/Token";
import SEO, { PAGE_SEO } from "@/components/SEO";

export default function TokenPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Token | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  return (
    <>
      <SEO {...PAGE_SEO.token} />
    <main className="flex-1">
      <Token />
    </main>
    </>
  );
}
