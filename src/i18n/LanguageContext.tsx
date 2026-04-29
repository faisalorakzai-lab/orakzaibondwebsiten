// Orakzai Terminal — global language context.
//
// Mounts at the root (src/main.tsx). Provides:
//   - the active language code (en | ur | ps)
//   - a setLang() dispatcher
//   - a useTranslation() hook returning t(key) for ergonomic call sites
//   - automatic <html lang=""> + dir="rtl|ltr" sync (RTL for ur/ps)
//   - localStorage persistence under "orakzai.lang"
//
// Marcus AI ALREADY auto-detects the language of each prompt server-side
// and replies in the same script — so the site language switcher is purely
// a UI-strings concern. Marcus respects whatever language the user types
// in regardless of the switcher state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGES,
  LANG_BY_CODE,
  translate,
  type LangCode,
  type LangMeta,
} from "./translations";

const STORAGE_KEY = "orakzai.lang";

interface LanguageContextValue {
  lang: LangCode;
  meta: LangMeta;
  setLang: (next: LangCode) => void;
  t: (key: string) => string;
  available: LangMeta[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): LangCode {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ur" || stored === "ps") return stored;
  } catch { /* noop */ }
  // Best-effort browser-language sniffing — fall back to English.
  const nav = window.navigator?.language || "en";
  if (/^ur\b/i.test(nav)) return "ur";
  if (/^ps\b/i.test(nav)) return "ps";
  return "en";
}

function applyHtmlAttrs(meta: LangMeta) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.lang = meta.htmlLang;
  html.dir = meta.dir;
  // Helpful CSS hook so designers can target [data-lang="ur"] for fonts.
  html.setAttribute("data-lang", meta.code);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => readInitialLang());

  useEffect(() => {
    const meta = LANG_BY_CODE[lang] || LANG_BY_CODE.en;
    applyHtmlAttrs(meta);
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    if (next === "en" || next === "ur" || next === "ps") setLangState(next);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      meta: LANG_BY_CODE[lang] || LANG_BY_CODE.en,
      setLang,
      t,
      available: LANGUAGES,
    }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Provider missing — graceful default so any component can call this
    // safely even before the provider has mounted (e.g. error boundary).
    return {
      lang: "en",
      meta: LANG_BY_CODE.en,
      setLang: () => { /* noop */ },
      t: (key: string) => translate("en", key),
      available: LANGUAGES,
    };
  }
  return ctx;
}

export function useTranslation() {
  const { t, lang } = useLanguage();
  return { t, lang };
}
