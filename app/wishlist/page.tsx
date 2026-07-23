// app/wishlist/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { WishlistToggle } from "@/components/cart/wishlist-toggle";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getWishlistLines } from "@/lib/wishlist";
import { findVariantAcrossCatalog } from "@/lib/cart/catalog-lookup";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
  alternates: { canonical: "/wishlist" },
};

export default async function WishlistPage() {
  const ageGate = await getAgeGateState();
  const lines = ageGate.ageVerified ? await getWishlistLines() : [];

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified ? (
        <div aria-hidden="true" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
            Wishlist
          </h1>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Saved formats stay on this device until you remove them.
          </p>

          {lines.length === 0 ? (
            <div className="mt-10 border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
              <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                No saved items yet
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="mt-8 space-y-8" role="list">
              {lines.map((line) => {
                const found = findVariantAcrossCatalog(line.variantId);
                const variants = found?.product.variants ?? [];
                return (
                  <li
                    key={line.variantId}
                    className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
                  >
                    <Link
                      href={`/product/${line.productSlug}`}
                      className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                    >
                      {line.productName}
                    </Link>
                    <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                      {line.lineName} · {line.weightOrFormat} · {formatPrice(line.unitPriceCents)}
                    </p>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                      <AddToCartForm variants={variants} defaultVariantId={line.variantId} />
                      <WishlistToggle variantId={line.variantId} initiallySaved />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
