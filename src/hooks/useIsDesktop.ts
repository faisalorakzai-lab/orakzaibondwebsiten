// Orakzai Terminal — viewport-class hook.
//
// Returns TRUE only when the live JS-measured viewport is >= 1024 CSS px
// (Tailwind's `lg` breakpoint). Listens for resize + orientationchange and
// rerenders subscribers when the class flips.
//
// WHY THIS EXISTS:
//   The previous Navbar relied entirely on Tailwind's `hidden md:flex` and
//   `lg:hidden` responsive classes to swap mobile vs desktop chrome. CSS
//   media queries are derived from `window.innerWidth` indirectly via the
//   user-agent's viewport meta — and Android in-app browsers (notably
//   Trust Wallet, Telegram, X, Instagram) FREQUENTLY mis-report the
//   effective viewport, leaving Tailwind to render the desktop layout
//   inside what is visibly a phone-width window. The Chairman observed
//   this in Trust Wallet on 2026-04-30: the desktop nav links AND the
//   mobile hamburger were both visible, producing the "double-bar" bug.
//
//   The fix the Chairman demanded — and which is the correct fix — is to
//   conditionally UNMOUNT the desktop chrome below 1024px instead of
//   merely hiding it with CSS. This hook is the source of truth for that
//   decision. App.tsx branches on it to mount EITHER <Navbar/> or
//   <MobileNavbar/> — never both.

import { useEffect, useState } from "react";

const LG_BREAKPOINT = 1024; // CSS px — matches Tailwind's `lg`

function measureIsDesktop(): boolean {
  if (typeof window === "undefined") return false;
  // Use the actual visualViewport when available (more accurate inside
  // in-app browsers that overlay system UI on top of the layout vp).
  const w =
    (window.visualViewport && window.visualViewport.width) ||
    window.innerWidth ||
    document.documentElement.clientWidth ||
    0;
  return w >= LG_BREAKPOINT;
}

export function useIsDesktop(): boolean {
  // Default FALSE during SSR / first paint — safer to render the mobile
  // chrome briefly than to flash a desktop nav on a phone.
  const [isDesktop, setIsDesktop] = useState<boolean>(() => measureIsDesktop());

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      // Coalesce rapid resize spam (orientation flips, in-app browser
      // chrome show/hide) into one render per animation frame.
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = measureIsDesktop();
        setIsDesktop((prev) => (prev === next ? prev : next));
      });
    };

    // Initial sync — handles the case where SSR/first-paint measurement
    // disagreed with the post-mount measurement.
    onResize();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize, { passive: true });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onResize);
      }
    };
  }, []);

  return isDesktop;
}
