// app/locations/[state]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildFaqPageJsonLd } from "@/lib/cms/faq";
import {
  geoForCity,
  geoForState,
  mapsRetailerSearchUrl,
  osmEmbedUrl,
} from "@/lib/locations/geo";
import { getLocationState, LOCATION_STATES } from "@/lib/locations/states";
import {
  buildBreadcrumbJsonLd,
  buildLocationStateJsonLd,
} from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLdScript } from "@/components/seo/json-ld-script";

type Params = Promise<{ state: string }>;

const EXPLORE_LINKS = [
  { href: "/shop/vapes", label: "DIME carts & vape pens" },
  { href: "/shop/vapes/live-reserve", label: "Live Reserve" },
  { href: "/shop/vapes/rosin", label: "Rosin" },
  { href: "/validate", label: "Validate authenticity" },
  { href: "/lab-results", label: "Lab results" },
  { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
  { href: "/blog/how-to-spot-fake-dime-carts", label: "Spot fake Dime carts" },
  { href: "/blog/beginners-guide-to-dime-carts", label: "Beginner’s guide" },
] as const;

export function generateStaticParams() {
  return LOCATION_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state: slug } = await params;
  const state = getLocationState(slug);
  if (!state) return { title: "Find DIME" };
  const cityHint = state.cities
    .slice(0, 3)
    .map((c) => c.name)
    .join(", ");
  return {
    title: state.slug === "nevada" ? "Find DIME THC in Las Vegas & Nevada" : `Find DIME in ${state.name}`,
    description: `${state.blurb}${cityHint ? ` Cities include ${cityHint}.` : ""}`,
    alternates: { canonical: `/locations/${state.slug}` },
  };
}

export default async function LocationStatePage({ params }: { params: Params }) {
  const { state: slug } = await params;
  const state = getLocationState(slug);
  if (!state) notFound();

  const otherStates = LOCATION_STATES.filter((s) => s.slug !== state.slug);
  const stateGeo = geoForState(state.slug);
  const citiesWithGeo = state.cities.map((city) => {
    const geo = geoForCity(city.name);
    return {
      ...city,
      lat: geo?.lat,
      lng: geo?.lng,
      mapsUrl: mapsRetailerSearchUrl(`${city.name}, ${state.name}`),
    };
  });
  const primaryCity = citiesWithGeo.find((c) => c.lat != null && c.lng != null) ?? null;

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Find DIME", path: "/locations" },
    { name: state.name, path: `/locations/${state.slug}` },
  ]);
  const faqJsonLd = buildFaqPageJsonLd(
    state.faqs,
    absoluteUrl(`/locations/${state.slug}`)
  );
  const localJsonLd = buildLocationStateJsonLd({
    slug: state.slug,
    name: state.name,
    code: state.code,
    blurb: state.blurb,
    purchasableOnline: state.purchasableOnline,
    stateLat: stateGeo?.lat,
    stateLng: stateGeo?.lng,
    cities: citiesWithGeo.map((c) => ({
      name: c.name,
      lat: c.lat,
      lng: c.lng,
    })),
  });

  return (
    <>
      <JsonLdScript data={breadcrumbs} />
      <JsonLdScript data={faqJsonLd} />
      <JsonLdScript data={localJsonLd} />

      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/locations" className="transition-colors hover:text-[var(--color-resin)]">
                  Find DIME
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-[var(--color-ink)]" aria-current="page">
                {state.name}
              </li>
            </ol>
          </nav>

          <p className="mt-8 font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            {state.code}
            {state.purchasableOnline ? " · Online + retail" : " · Retailers"}
          </p>
          <h1 className="section-title mt-2">{state.h1}</h1>

          <aside
            id="answer"
            aria-label="Quick Answer"
            className="mt-6 max-w-2xl border-l-2 border-[var(--color-resin)] bg-[var(--color-surface)] px-5 py-4"
          >
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Quick answer
            </p>
            <p className="mt-2 text-[var(--scale-base)] font-semibold leading-relaxed text-[var(--color-ink)]">
              {state.answer}
            </p>
          </aside>

          {state.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]"
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-8 flex flex-wrap gap-3">
            {state.purchasableOnline ? (
              <Link href="/shop" className="btn-primary">
                Shop online in {state.code}
              </Link>
            ) : null}
            {primaryCity ? (
              <a
                href={primaryCity.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Map retailers near {primaryCity.name}
              </a>
            ) : null}
            <Link href="/locations" className="btn-outline">
              All states
            </Link>
            <Link href="/validate" className="btn-outline">
              Validate
            </Link>
          </div>

          {!state.purchasableOnline ? (
            <p className="mt-6 max-w-xl text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
              Online checkout isn&apos;t available in {state.code} yet — visit a licensed retailer near you.
            </p>
          ) : null}
        </div>
      </section>

      {state.purchasableOnline ? (
        <section
          id="delivery"
          aria-labelledby="delivery-heading"
          className="scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Delivery
            </p>
            <h2 id="delivery-heading" className="section-title mt-2">
              DIME delivery in {state.name}
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Licensed online shopping for DIME is available in {state.code} after age verification. Browse{" "}
              <Link href="/shop/vapes" className="text-[var(--color-resin)] hover:underline">
                carts &amp; vapes
              </Link>
              , confirm your jurisdiction at checkout, and validate authenticity after delivery. Prefer in-person
              pickup? Use the retailer map below or read{" "}
              <Link href="/blog/buy-dime-carts-online" className="text-[var(--color-resin)] hover:underline">
                Can I buy Dime carts online?
              </Link>
              .
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                Shop online in {state.code}
              </Link>
              <Link href="/blog/where-to-buy-dime-carts" className="btn-outline">
                Where to buy (licensed only)
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="cities-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Local hubs
          </p>
          <h2 id="cities-heading" className="section-title mt-2">
            DIME near cities in {state.name}
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Availability is retailer-specific. Use these hubs as a starting point, then confirm stock with a
            licensed shop. Maps open a Google search for licensed dispensaries near each city — DIME does not
            operate those storefronts.
          </p>

          <ul
            className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {citiesWithGeo.map((city) => (
              <li key={city.name} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {city.name}
                </h3>
                {city.note ? (
                  <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                    {city.note}
                  </p>
                ) : null}
                <a
                  href={city.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
                >
                  Open map near {city.name} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {primaryCity && primaryCity.lat != null && primaryCity.lng != null ? (
        <section
          aria-labelledby="map-heading"
          className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Local map
            </p>
            <h2 id="map-heading" className="section-title mt-2">
              {primaryCity.name} area overview
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Orientation map for the {primaryCity.name} metro. Use the Google Maps retailer search above to
              find licensed shops that may stock DIME — then ask for Signature, Live Reserve, or Rosin by name.
            </p>
            <div className="mt-8 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
              <iframe
                title={`Map of ${primaryCity.name}, ${state.name}`}
                src={osmEmbedUrl({ lat: primaryCity.lat, lng: primaryCity.lng })}
                className="h-[min(52vh,420px)] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Map data © OpenStreetMap contributors. Not a DIME-owned retail location.
            </p>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="ask-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            What to ask for
          </p>
          <h2 id="ask-heading" className="section-title mt-2">
            Popular DIME lines in {state.code}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2" role="list">
            {state.askFor.map((item) => (
              <li
                key={item}
                className="border border-[var(--color-border)] px-4 py-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink)]"
              >
                {item}
              </li>
            ))}
          </ul>

          <nav aria-label="Explore DIME" className="mt-10">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Keep exploring
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" role="list">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section aria-labelledby="retailers-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Where to go
          </p>
          <h2 id="retailers-heading" className="section-title mt-2">
            Retailers in {state.name}
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Ask for DIME Signature, Live Reserve, edibles, and hardware at authorized shops. Always purchase from
            licensed retailers.
          </p>

          <ul className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
            {state.retailers.map((r) => (
              <li
                key={`${r.name}-${r.city}`}
                className="bg-[var(--color-bg)] px-5 py-5 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--color-surface-raised)] sm:px-7"
              >
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {r.name}
                </p>
                <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{r.city}</p>
                {r.note ? (
                  <p className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-muted)]">
                    {r.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="reviews-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="reviews-heading" className="section-title">
            Reviews &amp; authenticity in {state.code}
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            After a licensed purchase, validate your pack and leave product feedback on the storefront when
            signed in. Brand Google Business Profile reviews (when published by the owner) should be answered
            within 48 hours — see the local SEO owner checklist.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/validate" className="btn-primary">
              Validate your product
            </Link>
            <Link href="/trust" className="btn-outline">
              Trust &amp; quality
            </Link>
            <Link href="/shop" className="btn-outline">
              Shop &amp; review products
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="faq-heading" className="section-title">
            {state.name} FAQ
          </h2>
          <dl className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {state.faqs.map((faq) => (
              <div key={faq.question} className="bg-[var(--color-bg)] px-5 py-5 sm:px-7">
                <dt className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {faq.question}
                </dt>
                <dd className="mt-3 max-w-3xl text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="more-states-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12">
          <h2
            id="more-states-heading"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]"
          >
            Other markets
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3" role="list">
            {otherStates.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/locations/${s.slug}`}
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)]"
                >
                  Find DIME in {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/locations"
                className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
              >
                View all →
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
