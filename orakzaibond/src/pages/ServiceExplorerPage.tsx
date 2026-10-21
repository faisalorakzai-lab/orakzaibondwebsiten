import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import UtilityExplorer, {
  type CategoryId,
} from "../components/UtilityExplorer";
import { useSEO } from "../components/SEO";

const SERVICES: Partial<Record<
  string,
  { category: CategoryId; title: string; description: string }
>> = {
  stays: {
    category: "stays",
    title: "OKBOND Stays",
    description:
      "Preview the upcoming OKBOND stays and travel experience. Hotel inventory and reservations are not connected.",
  },
  properties: {
    category: "properties",
    title: "OKBOND Properties",
    description:
      "Preview the upcoming OKBOND property discovery experience. There are no live listings or transactions.",
  },
  mobility: {
    category: "transport",
    title: "OKBOND Mobility",
    description:
      "Preview the upcoming OKBOND mobility experience. Live routes, vehicles, and availability are not connected.",
  },
  pay: {
    category: "utilities",
    title: "OKBOND Pay",
    description:
      "Preview the upcoming OKBOND everyday payments experience. No bill or payment providers are connected.",
  },
};

export default function ServiceExplorerPage({ slug }: { slug: string }) {
  const service = SERVICES[slug];

  useSEO({
    title: service ? `${service.title} Service Preview` : "Service Not Found",
    description:
      service?.description ??
      "This OKBOND service page could not be found. Return to the homepage to choose a service.",
    canonical: `https://orakzaibond.com/services/${slug}`,
  });

  return (
    <div className="min-h-screen bg-[#080907] text-[#f4efe5]">
      <header className="mx-auto w-full max-w-7xl px-5 pt-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200/20 bg-white/[0.025] px-4 text-sm font-medium text-amber-100/80 transition hover:border-amber-200/50 hover:text-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </header>

      {service ? (
        <UtilityExplorer key={slug} initialCategory={service.category} />
      ) : (
        <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <p className="text-xs font-bold tracking-[0.2em] text-amber-200/75">
            OKBOND SERVICES
          </p>
          <h1 className="mt-4 font-serif text-4xl text-[#fbf7ee] sm:text-5xl">
            Service not found
          </h1>
          <p className="mt-4 text-white/65">
            Choose one of the four service cards on the homepage to open its
            preview.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center rounded-full border border-amber-200/35 px-5 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/10"
          >
            Go to homepage
          </Link>
        </section>
      )}
    </div>
  );
}
