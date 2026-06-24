import { useEffect } from "react";
import ContactSection from "@/components/ContactSection";
import { useSEO, PAGE_SEO } from "@/components/SEO";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Contact Us | Orakzai Bond";
    return () => { document.title = "Orakzai Bond"; };
  }, []);

  useSEO(PAGE_SEO.contact);
  return (
    <main className="flex-1 pt-20">
      <ContactSection />
    </main>
  );
}
