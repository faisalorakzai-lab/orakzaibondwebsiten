import { createRoot } from "react-dom/client";
import App from "./App";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import "./index.css";

// KeyedApp re-mounts the entire <App /> tree whenever the active language
// changes. This is the cleanest way to guarantee that EVERY component —
// even those that don't subscribe to useLanguage themselves — re-renders
// against the new locale, the new <html dir/lang>, and any RTL layout
// rules. Without this key, components that read translations once at mount
// (or that cache derived strings in refs) would silently keep the old
// language. With it, switching to Urdu / Pashto produces a hard, obvious
// flip — exactly what the chairman expects.
function KeyedApp() {
  const { lang } = useLanguage();
  return <App key={lang} />;
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <KeyedApp />
  </LanguageProvider>,
);

// PWA: register the service worker for offline + Add-to-Home-Screen support.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW registration failure is non-fatal */
    });
  });
}
