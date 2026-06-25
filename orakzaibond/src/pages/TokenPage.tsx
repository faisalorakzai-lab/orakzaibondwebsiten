import { useEffect } from "react";
import Token from "@/components/Token";

export default function TokenPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Token | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.token);
  return (
    <main className="flex-1">
      <Token />
    </main>
  );
}
