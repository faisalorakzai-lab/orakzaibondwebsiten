// Orakzai Terminal — UI translation table.
//
// Three first-class languages per the Chairman's directive:
//   en — English (default, LTR)
//   ur — اردو       (Urdu,   RTL, Pakistan national)
//   ps — پښتو      (Pashto, RTL, KPK regional / Chairman's mother tongue)
//
// Translations are intentionally TERSE and EXECUTIVE. They mirror the
// formal, board-room cadence. NOT colloquial.
//
// it stays scannable as the table grows. New keys default to English at
// runtime via the t() helper if a translation is missing — UI never
// breaks if a string is added in EN before being translated.

export type LangCode = "en" | "ur" | "ps";

export interface LangMeta {
  code: LangCode;
  label: string;        // English label (for diagnostics)
  native: string;       // Native script label (shown in switcher)
  dir: "ltr" | "rtl";
  htmlLang: string;     // BCP-47 tag for <html lang>
  ttsLang: string;      // BCP-47 tag for SpeechSynthesis (best-fit voice)
}

export const LANGUAGES: LangMeta[] = [
  { code: "en", label: "English", native: "English", dir: "ltr", htmlLang: "en",    ttsLang: "en-GB" },
  { code: "ur", label: "Urdu",    native: "اردو",     dir: "rtl", htmlLang: "ur-PK", ttsLang: "ur-PK" },
  { code: "ps", label: "Pashto",  native: "پښتو",    dir: "rtl", htmlLang: "ps-AF", ttsLang: "ps-AF" },
];

export const LANG_BY_CODE: Record<LangCode, LangMeta> = LANGUAGES.reduce(
  (acc, l) => { acc[l.code] = l; return acc; },
  {} as Record<LangCode, LangMeta>,
);

// ─── String table ─────────────────────────────────────────────────────────
// gracefully fall back to the English value, then to the key itself.

type Dict = Record<string, string>;

const en: Dict = {
  // Navigation
  "nav.home":          "Home",
  "nav.founder":       "Founder",
  "nav.bond":          "Bond",
  "nav.roadmap":       "Roadmap",
  "nav.community":     "Community",
  "nav.documents":     "Documents",
  "nav.about":         "About",
  "nav.aboutUs":       "About Us",
  "nav.contact":       "Contact",
  "nav.connect":       "Connect Wallet",
  "nav.connected":     "Connected",
  "nav.menu":          "Menu",
  "nav.language":      "Language",
  "nav.lottery":       "Lottery",
  "nav.token":         "Token",
  "nav.ico":           "Services",
  "nav.icoBuy":        "Services",
  "nav.stake":         "Stake",
  "nav.tokenomics":    "Tokenomics",
  "nav.profile":       "Profile",
  "nav.system":        "System",
  "nav.winners":       "Winners",
  "nav.rules":         "Rules",
  "nav.admin":         "Admin",
  "nav.icoLive":       "Live",
  "nav.stakeSoon":     "Soon",
  "nav.dashboard":     "Dashboard",
  "nav.staking":       "Staking",
  "nav.vault":         "Vault",
  "nav.security":      "Security",
  "nav.registry":      "Registry",
  "nav.ambassador":    "Ambassador",
  "nav.legal":         "Legal Vault",

  // Sidebar groupings
  "sidebar.docs":      "Documents",
  "sidebar.socials":   "Social",
  "sidebar.whitepaper":"Whitepaper",
  "sidebar.audit":     "Audit Report",

  // Calculator + Map
  "calc.title":        "OKBOND Smart Calculator",
  "calc.subtitle":     "Model returns, referrals, and ICO price across stages.",
  "calc.investment":   "Your Investment",
  "calc.amount":       "OKBOND Amount",
  "calc.duration":     "Duration",
  "map.title":         "Global Network Coverage",
  "map.subtitle":      "A world-connected vision, grounded in Orakzai Bond’s Pakistani roots.",

  // Common CTAs
  "cta.invest":        "Invest in OKBOND",
  "cta.whitepaper":    "Read Whitepaper",
  "cta.whatsapp":      "Speak to Concierge",
  "cta.learn":         "Learn More",
  "cta.back":          "Back",
  "cta.continue":      "Continue",
  "cta.close":         "Close",
  "cta.tryAgain":      "Try again",
  "cta.returnHome":    "Return home",

  // Marcus

  // Page titles / hero
  "page.founder.title":       "Chairman Faisal Orakzai",
  "page.founder.subtitle":    "Founder, Orakzai Group",
  "page.roadmap.title":       "Vision 2100 Roadmap",
  "page.community.title":     "The Orakzai Community",
  "page.documents.title":     "Documents & Whitepaper",

  // Errors / safety
  "error.terminal":           "Terminal interruption.",
  "error.terminalBody":       "A non-critical subsystem briefly went offline. The Chairman's terminal is restoring itself.",

  // Footer
  "footer.tagline":           "Vision 2100 — One Hundred Years of Trust.",
  "footer.rights":            "All rights reserved.",
};

const ur: Dict = {
  "nav.home":          "صفحۂ اوّل",
  "nav.founder":       "بانی",
  "nav.bond":          "اورکزئی بانڈ",
  "nav.roadmap":       "روڈ میپ",
  "nav.community":     "کمیونٹی",
  "nav.documents":     "دستاویزات",
  "nav.about":         "تعارف",
  "nav.aboutUs":       "ہمارے بارے میں",
  "nav.contact":       "رابطہ",
  "nav.connect":       "والٹ منسلک کریں",
  "nav.connected":     "منسلک",
  "nav.menu":          "مینو",
  "nav.language":      "زبان",
  "nav.lottery":       "لاٹری",
  "nav.token":         "ٹوکن",
  "nav.ico":           "Services",
  "nav.icoBuy":        "Services",
  "nav.stake":         "اسٹیک",
  "nav.tokenomics":    "ٹوکنومکس",
  "nav.profile":       "پروفائل",
  "nav.system":        "سسٹم",
  "nav.winners":       "فاتحین",
  "nav.rules":         "قواعد",
  "nav.admin":         "ایڈمن",
  "nav.icoLive":       "براہِ راست",
  "nav.stakeSoon":     "جلد",

  "sidebar.docs":      "دستاویزات",
  "sidebar.socials":   "سوشل میڈیا",
  "sidebar.whitepaper":"وائٹ پیپر",
  "sidebar.audit":     "آڈٹ رپورٹ",

  "calc.title":        "اوکے بانڈ سمارٹ کیلکولیٹر",
  "calc.subtitle":     "منافع، حوالہ جات، اور آئی سی او قیمت کا تخمینہ لگائیں۔",
  "calc.investment":   "آپ کی سرمایہ کاری",
  "calc.amount":       "اوکے بانڈ مقدار",
  "calc.duration":     "مدت",
  "map.title":         "عالمی نیٹ ورک کی رسائی", 
  "map.subtitle":      "اورکزئی بانڈ کی پاکستانی جڑوں سے جڑا عالمی وژن۔", 

  "cta.invest":        "اوکے بانڈ میں سرمایہ کاری",
  "cta.whitepaper":    "وائٹ پیپر پڑھیں",
  "cta.whatsapp":      "کنسیئرج سے بات کریں",
  "cta.learn":         "مزید جانیں",
  "cta.back":          "واپس",
  "cta.continue":      "آگے بڑھیں",
  "cta.close":         "بند کریں",
  "cta.tryAgain":      "دوبارہ کوشش کریں",
  "cta.returnHome":    "صفحۂ اوّل پر واپس",


  "page.founder.title":       "چیئرمین فیصل اورکزئی",
  "page.founder.subtitle":    "بانی، اورکزئی گروپ",
  "page.roadmap.title":       "ویژن 2100 روڈ میپ",
  "page.community.title":     "اورکزئی کمیونٹی",
  "page.documents.title":     "دستاویزات اور وائٹ پیپر",

  "error.terminal":           "ٹرمینل میں عارضی رکاوٹ۔",
  "error.terminalBody":       "ایک ذیلی نظام لمحہ بھر کے لیے بند ہوا۔ چیئرمین کا ٹرمینل بحال ہو رہا ہے۔",

  "footer.tagline":           "ویژن 2100 — ایک سو سالہ اعتماد۔",
  "footer.rights":            "جملہ حقوق محفوظ ہیں۔",
};

const ps: Dict = {
  "nav.home":          "کور",
  "nav.founder":       "بنسټګر",
  "nav.bond":          "اورکزی بانډ",
  "nav.roadmap":       "د لارې نقشه",
  "nav.community":     "ټولنه",
  "nav.documents":     "اسناد",
  "nav.about":         "د موږ په اړه",
  "nav.aboutUs":       "زموږ په اړه",
  "nav.contact":       "اړیکه",
  "nav.connect":       "والټ ونښلوئ",
  "nav.connected":     "نښلول شوی",
  "nav.menu":          "مینو",
  "nav.language":      "ژبه",
  "nav.lottery":       "لاټرۍ",
  "nav.token":         "ټوکن",
  "nav.ico":           "Services",
  "nav.icoBuy":        "Services",
  "nav.stake":         "سټېک",
  "nav.tokenomics":    "ټوکنومکس",
  "nav.profile":       "پروفایل",
  "nav.system":        "سیسټم",
  "nav.winners":       "بریالي",
  "nav.rules":         "اصول",
  "nav.admin":         "اډمن",
  "nav.icoLive":       "ژوندی",
  "nav.stakeSoon":     "ژر",

  "sidebar.docs":      "اسناد",
  "sidebar.socials":   "ټولنیز رسنۍ",
  "sidebar.whitepaper":"سپینه پاڼه",
  "sidebar.audit":     "د پلټنې راپور",

  "calc.title":        "د اوکې بانډ سمارټ کالکولیټر",
  "calc.subtitle":     "د عوایدو، راجع کوونکو، او د آی سي او بیې اټکل وکړئ.",
  "calc.investment":   "ستاسو پانګونه",
  "calc.amount":       "د اوکې بانډ مقدار",
  "calc.duration":     "موده",
  "map.title":         "د نړیوالې شبکې پوښښ", 
  "map.subtitle":      "د اورکزي بانډ د پاکستاني ریښو سره تړلی نړیوال لید.", 

  "cta.invest":        "په اوکې بانډ کې پانګونه",
  "cta.whitepaper":    "سپینه پاڼه ولولئ",
  "cta.whatsapp":      "د کانسیرج سره خبرې",
  "cta.learn":         "نور زده کړئ",
  "cta.back":          "شاته",
  "cta.continue":      "مخکې لاړ شه",
  "cta.close":         "وتړئ",
  "cta.tryAgain":      "بیا هڅه وکړئ",
  "cta.returnHome":    "کور ته بیرته",


  "page.founder.title":       "ښاغلی چیرمن فیصل اورکزی",
  "page.founder.subtitle":    "بنسټګر، د اورکزي ګروپ",
  "page.roadmap.title":       "د 2100 لیدلوري نقشه",
  "page.community.title":     "د اورکزو ټولنه",
  "page.documents.title":     "اسناد او سپینه پاڼه",

  "error.terminal":           "په ټرمینل کې لنډ ځنډ.",
  "error.terminalBody":       "یو فرعي سیسټم لنډ مهال بند شو. د چیرمن ټرمینل بیا فعالیږي.",

  "footer.tagline":           "لیدلوری ۲۱۰۰ — د یوې پیړۍ اعتماد.",
  "footer.rights":            "ټول حقونه خوندي دي.",
};

const TABLE: Record<LangCode, Dict> = { en, ur, ps };

export function translate(lang: LangCode, key: string): string {
  return TABLE[lang]?.[key] ?? TABLE.en[key] ?? key;
}
