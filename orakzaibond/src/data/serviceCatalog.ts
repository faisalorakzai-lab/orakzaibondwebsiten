import {
  ArrowUpRight,
  Building2,
  CarFront,
  Globe2,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type HubCountry = {
  name: string;
  code: string;
  dial: string;
  flag: string;
  region: string;
};

export type HubCategory = {
  id: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  href: string;
  services: string[];
};

export const HUB_COUNTRIES: HubCountry[] = [
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰", region: "Asia" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪", region: "Middle East" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦", region: "Middle East" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧", region: "Europe" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸", region: "North America" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦", region: "North America" },
  { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦", region: "Middle East" },
  { name: "Türkiye", code: "TR", dial: "+90", flag: "🇹🇷", region: "Europe" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺", region: "Oceania" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦", region: "Africa" },
];

const PAKISTAN_GOVERNMENT_SERVICES = [
  "Federal · NADRA Fees",
  "Federal · Passport Fees",
  "Federal · SECP Payments",
  "Federal · FBR Income Tax",
  "Federal · FBR Sales Tax",
  "Federal · FBR Federal Excise",
  "Punjab · Punjab Vehicle Token Tax",
  "Punjab · Punjab e-Challan",
  "Sindh · Sindh Vehicle Token Tax",
  "Sindh · Karachi Traffic Challan",
  "Islamabad / CDA · CDA Service Fees",
  "Islamabad / CDA · CDA Property Tax",
  "Islamabad / CDA · Islamabad Traffic Violation Challan",
  "Khyber Pakhtunkhwa · KPK Sales Tax on Sales",
  "Khyber Pakhtunkhwa · KPK Infrastructure Development Cess",
  "Khyber Pakhtunkhwa · KPK Driving License Fees",
  "Khyber Pakhtunkhwa · KPK Traffic Violation Challan",
  "Khyber Pakhtunkhwa · KPK Food Authority Fees",
  "Other · CRMS Fees",
  "Other · Private Education Providers Registration",
  "Other · Other supported government fees",
];

export const GLOBAL_CATEGORIES: HubCategory[] = [
  { id: "featured", label: "Featured", detail: "Core OKBOND service pathways", icon: Globe2, href: "/services/catalog/featured", services: ["Hotel Booking", "Transport", "Car Rental", "Property", "Utilities"] },
  { id: "financing", label: "Loans & Financing", detail: "Inquiry-led finance pathways", icon: Landmark, href: "/services/catalog/financing", services: ["Loss Recovery Loan", "Crypto Loan", "Gold Loan", "Real Estate Loan", "Buy Now Pay Later", "Easy Salary"] },
  { id: "rentals", label: "Rent & Leasing", detail: "Rental inquiry pathways", icon: Building2, href: "/services/catalog/rentals", services: ["Rent a Car", "Rent a Property", "Rent a Room", "Rent a Shop", "Rent an Office", "Rent Equipment", "Rent Machinery", "Rent Furniture"] },
  { id: "bills", label: "Bill Payments", detail: "Provider-led payment inquiries", icon: ReceiptText, href: "/services/catalog/bills", services: ["Electricity Bills", "Gas Bills", "Water Bills", "Solar Payments", "Internet Bills", "Telephone Bills", "School Fees", "Credit Card Payments", "Invoice Payments", "1Bill", "Kuickpay", "Payroll", "Haball", "Store at Door"] },
  { id: "easyload", label: "Easyload & Packages", detail: "Mobile and connectivity pathways", icon: Wifi, href: "/services/catalog/easyload", services: ["Mobile Easyload", "Postpaid Bills", "Prepaid Packages", "Internet Packages"] },
  { id: "government", label: "Government Payments", detail: "Country-specific public services", icon: ShieldCheck, href: "/services/catalog/government", services: PAKISTAN_GOVERNMENT_SERVICES },
  { id: "savings", label: "Savings & Investment", detail: "Terms and risks shown when verified", icon: ArrowUpRight, href: "/services/catalog/savings", services: ["Crypto Staking", "Digital Savings", "Fixed-Term Savings", "Investment Opportunities"] },
  { id: "insurance", label: "Insurance", detail: "Provider and coverage dependent", icon: ShieldCheck, href: "/services/catalog/insurance", services: ["Health Insurance", "Income Protection", "Mobile Insurance", "Life Insurance", "Travel Insurance"] },
  { id: "travel", label: "Travel & Mobility", detail: "Travel and transport inquiries", icon: CarFront, href: "/services/catalog/travel", services: ["M-Tag Recharge", "ZU BRT", "Flight Booking", "City-to-City Travel", "Bus Tickets", "Train Tickets", "Airport Transfers", "Hotel Reservations"] },
  { id: "digital", label: "Digital Products", detail: "Region and provider dependent", icon: Zap, href: "/services/catalog/digital", services: ["Gift Cards", "eSIM", "Mobile Top-ups", "Gaming Credits", "Digital Vouchers", "Subscription Payments"] },
];

const MARKET_OVERRIDES: Record<string, Partial<Record<string, string[]>>> = {
  AE: {
    government: ["National identity and document fees", "Traffic and vehicle services", "Business and tax services", "Other supported government fees"],
    easyload: ["Mobile top-up", "Postpaid bills", "Prepaid packages", "Home internet packages"],
  },
  SA: {
    government: ["National identity and document fees", "Traffic and vehicle services", "Business and tax services", "Other supported government fees"],
    easyload: ["Mobile top-up", "Postpaid bills", "Prepaid packages", "Home internet packages"],
  },
  GB: {
    government: ["Identity and document services", "Vehicle and traffic services", "Business and tax services", "Other supported government fees"],
  },
  US: {
    government: ["Identity and document services", "Vehicle and traffic services", "Business and tax services", "Other supported government fees"],
  },
  CA: {
    government: ["Identity and document services", "Vehicle and traffic services", "Business and tax services", "Other supported government fees"],
  },
  QA: {
    government: ["National identity and document fees", "Traffic and vehicle services", "Business and tax services", "Other supported government fees"],
  },
  TR: {
    government: ["Identity and document services", "Traffic and vehicle services", "Business and tax services", "Other supported government fees"],
  },
  AU: {
    government: ["Identity and document services", "Vehicle and traffic services", "Business and tax services", "Other supported government fees"],
  },
  ZA: {
    government: ["Identity and document services", "Vehicle and traffic services", "Business and tax services", "Other supported government fees"],
  },
};

export function categoriesForMarket(code: string): HubCategory[] {
  const overrides = MARKET_OVERRIDES[code] ?? {};
  return GLOBAL_CATEGORIES.map((category) => ({
    ...category,
    services: overrides[category.id] ?? category.services,
  }));
}

export function catalogSlug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
