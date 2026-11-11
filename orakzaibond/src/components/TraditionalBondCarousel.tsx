import { ArrowUpRight } from "lucide-react";

const columns = [
  { title: "Government bonds", note: "Sovereign debt" },
  { title: "Corporate bonds", note: "Company debt" },
  { title: "Bank bonds", note: "Financial-institution debt" },
  { title: "OKBOND", note: "A different digital-asset model", featured: true },
] as const;

const comparisonRows = [
  {
    label: "What it is",
    cells: [
      "Debt issued by a national or regional government, with terms set by the specific offering.",
      "Debt issued by a company, with terms and seniority defined by the offering documents.",
      "Debt issued by a bank or financial institution; structure and ranking vary by issue.",
      "A blockchain-based token ecosystem—not a traditional bond or repayment claim by default.",
    ],
  },
  {
    label: "What the holder may receive",
    cells: [
      "Interest and repayment as specified in the bond terms, subject to the issuer meeting its obligations.",
      "Interest and repayment as specified in the bond terms, subject to the company meeting its obligations.",
      "Payments under the bond terms, subject to the bank meeting its obligations and the issue's ranking.",
      "Rights depend on applicable product terms and deployed code. Token ownership alone does not promise interest or repayment.",
    ],
  },
  {
    label: "How it is governed",
    cells: [
      "Offering terms and applicable public-sector laws; details differ by issuer and jurisdiction.",
      "Offering documents, issuer obligations and applicable securities laws; protections vary.",
      "Issue documents and applicable banking and securities rules; protections vary by jurisdiction.",
      "Aims to pair digital participation with ecosystem utility. Access and features depend on published terms and confirmed availability.",
    ],
  },
  {
    label: "Transparency & verification",
    cells: [
      "Issuer disclosures and reporting are governed by the issue and applicable requirements.",
      "Offering and ongoing disclosures depend on the issuer, issue and applicable rules.",
      "Disclosures depend on the issue, institution and applicable rules.",
      "Public-chain records may show transactions and contract activity; they do not alone verify reserves, backing, solvency or an audit.",
    ],
  },
  {
    label: "Access & transfer",
    cells: [
      "Access and resale depend on the issue, local eligibility, intermediaries and market availability.",
      "Access and resale depend on the offering, investor eligibility and market liquidity.",
      "Access and resale depend on the offering, investor eligibility and market liquidity.",
      "Wallet-based access is an intended digital model; eligibility, network, contract settings and service availability still apply.",
    ],
  },
  {
    label: "Timing & exit",
    cells: [
      "Maturity and payment dates are set out in the bond terms; a sale before maturity may be at a different price.",
      "Maturity and payment dates are set out in the bond terms; early sale depends on market conditions.",
      "Maturity and payment dates are set out in the bond terms; early sale depends on market conditions.",
      "Do not assume a bond-style maturity or redemption schedule. Transferability and exit depend on terms and available liquidity.",
    ],
  },
  {
    label: "Key risks",
    cells: [
      "May include interest-rate, inflation, currency and sovereign-credit risk; value can change before maturity.",
      "May include interest-rate, liquidity, currency and company-credit risk; recovery depends on the issue and circumstances.",
      "May include interest-rate, liquidity and issuer-credit risk; ranking and recovery depend on the issue and applicable rules.",
      "Token-price, market, liquidity, wallet/custody, network, contract and regulatory risks. No capital protection is assured.",
    ],
  },
] as const;

export default function TraditionalBondCarousel() {
  return (
    <section
      aria-labelledby="traditional-bonds-title"
      className="border-y border-[#d4af37]/20 bg-[#050505] py-16 text-[#f2eee2] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-8 max-w-4xl sm:mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4af37] sm:text-xs">
            A clearer view of the difference
          </p>
          <h2
            id="traditional-bonds-title"
            className="text-balance text-3xl font-semibold leading-tight tracking-tight text-[#f5f1e7] sm:text-4xl lg:text-[48px]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            OKBOND vs. Traditional Bonds
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-[#c8c3b7] sm:text-lg">
            Redefining Global Fixed Income &amp; Capital Security
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#9d998e]">
            A vision for digital access, transparency and utility—not a claim that OKBOND is fixed income, a bond, or capital-protected.
          </p>
        </div>

        <div className="mb-3 flex items-center justify-between gap-4 text-xs text-[#9d998e] sm:mb-4">
          <p>Compare the instrument, holder rights and practical risks.</p>
          <p className="shrink-0 sm:hidden">Swipe to compare →</p>
        </div>

        <div
          aria-label="Scrollable comparison of government bonds, corporate bonds, bank bonds and OKBOND"
          className="overflow-x-auto rounded-2xl border border-[#3a3527] bg-[#090909] shadow-[0_20px_60px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38b25]"
          role="region"
          tabIndex={0}
        >
          <table className="w-full min-w-[1050px] table-fixed border-collapse text-left">
            <caption className="sr-only">
              A conceptual comparison of government, corporate and bank bonds with OKBOND.
            </caption>
            <colgroup>
              <col className="w-[170px]" />
              <col className="w-[220px]" />
              <col className="w-[220px]" />
              <col className="w-[220px]" />
              <col className="w-[240px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[#39362d] bg-[#11110d]">
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-r border-[#343128] bg-[#11110d] px-4 py-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a7a194] sm:px-5"
                >
                  Dimension
                </th>
                {columns.map((column) => (
                  <th
                    key={column.title}
                    scope="col"
                    className={`border-r border-[#343128] px-4 py-5 align-top last:border-r-0 sm:px-5 ${
                      column.featured ? "bg-[rgba(212,175,55,0.08)]" : ""
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold leading-5 ${
                        column.featured ? "text-[#e1c56d]" : "text-[#ede9de]"
                      }`}
                    >
                      {column.title}
                    </span>
                    <span className="mt-1 block text-xs font-normal leading-5 text-[#a7a194]">
                      {column.note}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <tr
                  key={row.label}
                  className={rowIndex < comparisonRows.length - 1 ? "border-b border-[#2b2922]" : ""}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-[#343128] bg-[#090909] px-4 py-5 align-top text-xs font-semibold leading-5 text-[#d9d4c8] sm:px-5 sm:text-sm"
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={columns[cellIndex].title}
                      className={`border-r border-[#2b2922] px-4 py-5 align-top text-[13px] leading-[1.65] text-[#c0bcb3] last:border-r-0 sm:px-5 ${
                        cellIndex === 3 ? "bg-[rgba(212,175,55,0.06)]" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-5 rounded-2xl border border-[#d4af37]/25 bg-[#0d0c09] p-5 sm:mt-10 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center sm:p-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              The intended shift
            </p>
            <h3
              className="mt-2 text-xl font-semibold leading-snug text-[#f2eee3] sm:text-2xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              From debt instruments to digital participation
            </h3>
          </div>
          <p className="text-sm leading-6 text-[#bbb5a8] sm:text-[15px]">
            Traditional bonds are debt with defined issuer obligations. OKBOND aims to explore a wallet-first token model with potential ecosystem utility and publicly viewable on-chain activity where available. It is a different category—not a one-to-one replacement for bonds—and its rights and use depend on confirmed terms, deployed code and availability.
          </p>
        </div>

        <div className="mt-7 flex flex-col items-center gap-4 sm:mt-8">
          <a
            href="#okbond-ecosystem"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#151208] transition hover:bg-[#f0d77e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d77e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
          >
            Explore OKBOND Ecosystem <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <p className="max-w-4xl text-center text-xs leading-5 text-[#a7a194]">
            Conceptual comparison only—not investment, legal or suitability advice. Bond features vary by issue and jurisdiction. OKBOND is not automatically a bond or repayment claim; no yield, repayment, protection, refund, liquidity, prize, reserve backing, audit or performance is guaranteed.
          </p>
        </div>
      </div>
    </section>
  );
}
