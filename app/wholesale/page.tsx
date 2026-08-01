// app/wholesale/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WholesaleApplyForm } from "@/components/wholesale/apply-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { primaryVariant, listProducts, SEED_CATALOG, withCatalogSource } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { formatPrice } from "@/lib/format";
import {
  defaultWholesalePriceCents,
  getWholesaleAccount,
  termsLabel,
  WHOLESALE_DEFAULT_MOQ,
  WHOLESALE_MIN_ORDER_CENTS,
  WHOLESALE_PRICE_BPS,
} from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Apply for DIME wholesale pricing — ~30% off retail, MOQ 5+, NET-30, NET-60, or Bitcoin upfront. Browse sample SKUs at B2B rates.",
  alternates: { canonical: "/wholesale" },
};

const BENEFITS = [
  {
    title: "Wholesale pricing",
    body: `About ${Math.round(100 - WHOLESALE_PRICE_BPS / 100)}% off retail on active SKUs, with optional admin price overrides per variant.`,
  },
  {
    title: "Order terms",
    body: `MOQ ${WHOLESALE_DEFAULT_MOQ}+ per SKU and a ${formatPrice(WHOLESALE_MIN_ORDER_CENTS)} minimum order once your account is approved.`,
  },
  {
    title: "Payment options",
    body: "Choose NET-30, NET-60, or pay upfront with Bitcoin — set a preference on your application.",
  },
] as const;

export default async function WholesaleLandingPage() {
  const { isWholesaleEnabled } = await import("@/lib/admin/site-settings-store");
  if (!(await isWholesaleEnabled())) {
    return (
      <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-14 lg:py-16">
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
          B2B
        </p>
        <h1 className="section-title mt-2">Wholesale</h1>
        <p className="mt-4 text-[var(--color-ink-soft)]">
          Wholesale applications are temporarily unavailable. Check back soon or contact support.
        </p>
        <Link href="/contact" className="btn-primary mt-8 inline-flex">
          Contact support
        </Link>
      </div>
    );
  }

  const [profile, catalog] = await Promise.all([
    getCurrentProfile().catch(() => null),
    loadEffectiveCatalog().catch(() => SEED_CATALOG),
  ]);
  const account = profile
    ? await Promise.race([
        getWholesaleAccount(profile.email).catch(() => null),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_500)),
      ])
    : null;
  const discountPct = Math.round(100 - WHOLESALE_PRICE_BPS / 100);
  const approved = account?.status === "approved";

  // Public preview uses default wholesale BPS (no override DB round-trip).
  const sampleProducts = withCatalogSource(catalog, () => {
    const { items } = listProducts({ sort: "popularity", pageSize: 24 });
    return items
      .filter((p) => !p.isBundle && p.inStock)
      .slice(0, 6)
      .map((card) => {
        const product = catalog.find((p) => p.slug === card.slug);
        if (!product) return null;
        const variant = primaryVariant(product);
        return {
          slug: product.slug,
          name: product.name,
          line: product.lineName ?? product.categoryName,
          weightOrFormat: variant.weightOrFormat,
          sku: variant.sku,
          imageUrl: product.imageUrl,
          retailPriceCents: variant.retailPriceCents,
          wholesalePriceCents: defaultWholesalePriceCents(variant.retailPriceCents),
          minQuantity: WHOLESALE_DEFAULT_MOQ,
        };
      })
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  });

  return (
    <>
      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/category-vapes.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_30%,rgba(201,177,56,0.18),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow wholesale-rise">DIME</p>
          <h1 className="wholesale-rise mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            Wholesale
          </h1>
          <p className="wholesale-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            Licensed B2B pricing on award-winning vapes, edibles, and prerolls — about {discountPct}% off retail.
          </p>
          <div className="wholesale-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            {approved ? (
              <Link href="/wholesale/shop" className="btn-primary">
                Open wholesale shop
              </Link>
            ) : (
              <a href="#apply" className="btn-primary">
                Apply now
              </a>
            )}
            <a href="#sample-pricing" className="btn-outline-light">
              View sample pricing
            </a>
          </div>
        </div>
      </section>

      {account ? (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-[var(--container-pad-x)] py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                Your application
              </p>
              <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink)]">
                {account.businessName} · <span className="capitalize">{account.status}</span>
                {approved ? ` · default ${termsLabel(account.defaultPaymentTerms)}` : null}
              </p>
              {account.status === "pending" ? (
                <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                  Pending admin review. You&apos;ll access the shop once approved.
                </p>
              ) : null}
              {account.status === "rejected" ? (
                <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-flag)]">
                  Application was rejected. Contact support or re-apply below.
                </p>
              ) : null}
            </div>
            {approved ? (
              <Link href="/wholesale/shop" className="btn-primary shrink-0 self-start sm:self-auto">
                Open shop
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="benefits-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            B2B program
          </p>
          <h2 id="benefits-heading" className="section-title mt-2">
            Built for retailers
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Approved accounts unlock the wholesale shop with tier pricing and flexible payment terms.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="bg-[var(--color-surface)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {benefit.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="sample-pricing"
        aria-labelledby="sample-heading"
        className="scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                Sample pricing
              </p>
              <h2 id="sample-heading" className="section-title mt-2">
                Wholesale vs retail
              </h2>
              <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Preview B2B rates on popular SKUs. Full catalog ordering unlocks after approval.
              </p>
            </div>
            {approved ? (
              <Link
                href="/wholesale/shop"
                className="nav-link shrink-0 text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                Shop all SKUs
              </Link>
            ) : (
              <a
                href="#apply"
                className="nav-link shrink-0 text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
              >
                Apply to order
              </a>
            )}
          </div>

          {sampleProducts.length > 0 ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {sampleProducts.map((product) => (
                <li
                  key={product.slug}
                  className="group flex flex-col bg-[var(--color-bg)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)] hover:bg-[var(--color-surface-raised)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface)]">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-5 transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                        DIME
                      </div>
                    )}
                    <span className="absolute left-3 top-3 bg-black/70 px-2 py-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] backdrop-blur-sm">
                      Wholesale
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col border-t border-[var(--color-border)] p-5">
                    <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      {product.line}
                    </p>
                    <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                      {product.weightOrFormat} · SKU {product.sku}
                    </p>

                    <div className="mt-auto pt-4">
                      <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin-strong)]">
                        {formatPrice(product.wholesalePriceCents)}
                        <span className="ml-2 text-[var(--scale-sm)] font-normal text-[var(--color-ink-muted)] line-through">
                          {formatPrice(product.retailPriceCents)}
                        </span>
                      </p>
                      <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                        MOQ {product.minQuantity} · save{" "}
                        {formatPrice(product.retailPriceCents - product.wholesalePriceCents)} / unit
                      </p>
                    </div>

                    {approved ? (
                      <Link href="/wholesale/shop" className="btn-outline mt-5 w-full">
                        Order in shop
                      </Link>
                    ) : (
                      <a href="#apply" className="btn-outline mt-5 w-full text-center">
                        Apply to order
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Sample pricing will appear when catalog products are available.
            </p>
          )}
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-24 bg-[var(--color-bg)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Get access
            </p>
            <h2 id="apply-heading" className="section-title mt-2">
              {approved ? "You're approved" : "Apply for wholesale"}
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              {approved
                ? "Your account is ready. Open the wholesale shop to order at B2B rates."
                : "Tell us about your business and preferred terms. We'll review and unlock the shop when approved."}
            </p>
            {!profile ? (
              <p className="mt-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Already applied?{" "}
                <Link
                  href="/login?next=/wholesale"
                  className="text-[var(--color-resin)] underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>{" "}
                with the same email to see status.
              </p>
            ) : null}
            <p className="mt-6 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Demo: sign in with role <span className="text-[var(--color-ink-soft)]">Wholesale</span> to
              preview the shop without approval.
            </p>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            {approved ? (
              <div>
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Next step
                </p>
                <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  Browse the full catalog at wholesale pricing and checkout when you hit the{" "}
                  {formatPrice(WHOLESALE_MIN_ORDER_CENTS)} minimum.
                </p>
                <Link href="/wholesale/shop" className="btn-primary mt-6 inline-flex">
                  Open wholesale shop
                </Link>
              </div>
            ) : !account || account.status === "rejected" ? (
              <WholesaleApplyForm defaultEmail={profile?.email ?? ""} />
            ) : (
              <div>
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Application pending
                </p>
                <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  Thanks — {account.businessName} is in review. We&apos;ll notify you when the wholesale shop
                  opens for your account.
                </p>
                <Link href="/contact" className="btn-outline mt-6 inline-flex">
                  Contact support
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Questions?
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Talk to the wholesale desk
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes wholesale-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wholesale-rise {
          animation: wholesale-rise 0.7s var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .wholesale-rise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
