import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const socials = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/orakzai-bond/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.413v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM3.555 20.452h3.564V9H3.555v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1DYd2B9rCL/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.006 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.957.93-1.957 1.885v2.239h3.328l-.532 3.469h-2.796v8.385C19.612 23.079 24 18.092 24 12.073Z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/OrakzaiBond",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.637 7.584H.475l8.6-9.83L0 1.153h7.594l5.243 6.932zm-1.291 19.49h2.039L6.486 3.24H4.298z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/orakzaibond",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M23.505 3.498a.5.5 0 0 0-.67-.47L.33 11.78a.5.5 0 0 0 .06.954l5.62 1.73 2.14 6.72a.5.5 0 0 0 .84.19l3.12-3.2 5.63 4.1a.5.5 0 0 0 .78-.3l4.98-18.24a.5.5 0 0 0 .005-.236ZM9.35 14.97l9.75-8.83-7.28 9.91a.5.5 0 0 0-.08.17l-.94 3.36-1.45-4.55Z" />
      </svg>
    ),
  },
];

const links = [
  { labelKey: "nav.about", label: "About", href: "/about" },
  { labelKey: "nav.token", label: "Token", href: "/token" },
  { labelKey: "nav.icoBuy", label: "Services", href: "/ico" },
  { labelKey: "nav.lottery", label: "Lottery", href: "/lottery" },
  { labelKey: "nav.tokenomics", label: "Tokenomics", href: "/tokenomics" },
  { labelKey: "nav.roadmap", label: "Roadmap", href: "/roadmap" },
];

const legalLinks = [
  { labelKey: "nav.rules", label: "How to Buy", href: "/guide" },
  { labelKey: "nav.rules", label: "Rules & Disclaimer", href: "/rules" },
  { labelKey: "nav.system", label: "How It Works", href: "/system" },
  { labelKey: "nav.winners", label: "Winners Hall", href: "/winners" },
  { labelKey: "nav.founder", label: "The Group", href: "/founder" },
];

const socialLinkClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-[#aaa69b] transition hover:border-[#d4af37]/50 hover:bg-[#d4af37]/[0.08] hover:text-[#f0d77e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative isolate overflow-hidden border-t border-[#d4af37]/20 bg-[#050505] text-[#f1eee5]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.09),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-4xl flex-col items-center border-b border-white/10 py-14 text-center sm:py-16 lg:py-20"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d4af37] sm:text-xs">
            Orakzai Bond · OKBOND
          </p>
          <h2
            className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-[#f5f1e7] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Explore a more connected digital ecosystem.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#a9a59b] sm:text-base sm:leading-7">
            Discover OKBOND’s project information, token model and ecosystem vision. Features, rights and services depend on confirmed terms, deployed code and availability.
          </p>
          <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <a
              href="/#okbond-ecosystem"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#151208] transition hover:bg-[#f0d77e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d77e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              Explore OKBOND <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href="/rules"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.025] px-6 py-3 text-sm font-medium text-[#e1ddd2] transition hover:border-[#d4af37]/45 hover:text-[#f0d77e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              Read project rules <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </motion.section>

        <div className="flex justify-center gap-3 py-7 sm:py-8" aria-label="OKBOND social links">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              aria-label={social.name}
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClass}
              data-testid={`link-social-${social.name.toLowerCase()}`}
            >
              {social.icon}
            </a>
          ))}
        </div>

        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-white/10 py-8 sm:gap-x-12 sm:py-10 lg:gap-x-20"
        >
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8e897e]">
              Explore OKBOND
            </p>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-[0.06em] text-[#aaa69b] transition hover:text-[#f0d77e] focus-visible:outline-none focus-visible:text-[#f0d77e] sm:text-[15px]"
                  >
                    {t(link.labelKey) || link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8e897e]">
              Project &amp; information
            </p>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-[0.06em] text-[#aaa69b] transition hover:text-[#f0d77e] focus-visible:outline-none focus-visible:text-[#f0d77e] sm:text-[15px]"
                  >
                    {t(link.labelKey) || link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/legal"
                  className="text-sm uppercase tracking-[0.06em] text-[#aaa69b] transition hover:text-[#f0d77e] focus-visible:outline-none focus-visible:text-[#f0d77e] sm:text-[15px]"
                >
                  Legal information
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="relative overflow-hidden pb-8 pt-10 text-center sm:pb-10 sm:pt-14">
          <p
            aria-label="OKBOND"
            className="select-none whitespace-nowrap bg-gradient-to-b from-[#d4af37]/25 via-[#d4af37]/10 to-transparent bg-clip-text text-[clamp(4.5rem,23vw,19rem)] font-semibold leading-[0.78] tracking-[-0.085em] text-transparent"
            style={{ fontFamily: "'Space Grotesk', Arial, sans-serif" }}
          >
            OKBOND
          </p>
          <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.34em] text-[#777267] sm:text-[10px]">
            ORAKZAI BOND · DIGITAL-ASSET ECOSYSTEM
          </p>
        </div>

        <div className="border-t border-white/10 py-6">
          <p className="mx-auto max-w-5xl text-center text-[10px] leading-5 text-[#807c73] sm:text-xs sm:leading-6">
            OKBOND is a digital-asset project, not a government, corporate or bank bond. Digital assets involve risk. No yield, repayment, liquidity, prize, refund, reserve backing, audit or principal protection is guaranteed. Review applicable terms and laws before participating.
          </p>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-[#8e897e]">&copy; 2026 Orakzai Bond. All rights reserved.</p>
            <a
              href="/legal"
              className="text-xs text-[#8e897e] transition hover:text-[#f0d77e] focus-visible:outline-none focus-visible:text-[#f0d77e]"
            >
              Legal information &amp; disclosures
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
