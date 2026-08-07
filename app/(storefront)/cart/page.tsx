// app/cart/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AGE_GATE_ENTRY_ENABLED } from "@/lib/compliance/age-gate-flags";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { CouponForm } from "@/components/cart/coupon-form";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getCartSnapshot } from "@/lib/cart";
import { resolveAppliedCoupon } from "@/lib/coupons/store";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default async function CartPage() {
  const ageGate = AGE_GATE_ENTRY_ENABLED
    ? await getAgeGateState()
    : { ageVerified: true as const, jurisdiction: null };
  const cart = ageGate.ageVerified
    ? await getCartSnapshot()
    : { lines: [], itemCount: 0, subtotalCents: 0 };
  const coupon =
    ageGate.ageVerified && cart.lines.length
      ? await resolveAppliedCoupon(cart.subtotalCents)
      : null;
  const discountCents = coupon?.discountCents ?? 0;
  const totalAfterDiscount = Math.max(0, cart.subtotalCents - discountCents);

  return (
    <>
      {!ageGate.ageVerified ? null : (
        <>
          <section className="relative isolate overflow-hidden border-b border-[var(--color-border)]">
            <Image
              src="/brand/concrete.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center opacity-40"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,14,14,0.96)_0%,rgba(14,14,14,0.88)_55%,rgba(14,14,14,0.75)_100%)]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_20%,rgba(201,177,56,0.12),transparent_50%)]"
              aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-[var(--container-pad-x)] py-12 sm:py-14">
              <p className="section-eyebrow">DIME</p>
              <h1 className="mt-2 font-[var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
                Cart
              </h1>
              <p className="mt-3 max-w-md text-[var(--scale-base)] text-white/75">
                {cart.lines.length === 0
                  ? "Your bag is empty — browse the catalog and add what you want."
                  : `${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} ready for checkout.`}
              </p>
              {cart.lines.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/checkout" className="btn-primary">
                    Proceed to checkout
                  </Link>
                  <Link href="/shop" className="btn-outline-light">
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  <Link href="/shop" className="btn-primary">
                    Shop now
                  </Link>
                </div>
              )}
            </div>
          </section>

          {cart.lines.length === 0 ? (
            <section className="bg-[var(--color-bg)]">
              <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
                <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-3">
                  {[
                    {
                      title: "Shop the lineup",
                      body: "Vapes, edibles, prerolls, and accessories — lab-tested and ready to ship where licensed.",
                      href: "/shop",
                      label: "Browse shop",
                    },
                    {
                      title: "Current offers",
                      body: "Apply checkout codes and bundle deals before you pay.",
                      href: "/promotions",
                      label: "View promotions",
                    },
                    {
                      title: "Earn rewards",
                      body: "Join Rewards and earn points on every order once you check out.",
                      href: "/rewards",
                      label: "Join rewards",
                    },
                  ].map((item) => (
                    <div key={item.href} className="bg-[var(--color-surface)] p-6 sm:p-8">
                      <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                        {item.title}
                      </h2>
                      <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                        {item.body}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors hover:text-[var(--color-resin-hover)]"
                      >
                        {item.label} →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-[var(--color-bg)]">
              <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1fr_22rem] lg:gap-12">
                <div>
                  <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                    Your bag
                  </p>
                  <h2 className="section-title mt-2">Items</h2>

                  <ul
                    className="mt-8 divide-y divide-[var(--color-border)] border border-[var(--color-border)]"
                    role="list"
                  >
                    {cart.lines.map((line) => (
                      <li
                        key={line.variantId}
                        className="bg-[var(--color-surface)] px-5 py-5 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--color-surface-raised)] sm:px-7"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${line.productSlug}`}
                              className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.04em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                            >
                              {line.productName}
                            </Link>
                            <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                              {line.lineName} · {line.weightOrFormat}
                            </p>
                            <p className="mt-1 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                              THC {line.thcPct}% · CBD {line.cbdPct}% · {line.sku}
                            </p>
                            <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                              {formatPrice(line.unitPriceCents)} each
                            </p>
                            <div className="mt-4">
                              <CartLineControls
                                variantId={line.variantId}
                                quantity={line.quantity}
                                maxQuantity={line.maxQuantity}
                              />
                            </div>
                          </div>
                          <p className="shrink-0 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin-strong)] sm:pt-1 sm:text-right">
                            {formatPrice(line.unitPriceCents * line.quantity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-7 lg:sticky lg:top-24">
                  <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                    Order summary
                  </p>
                  <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                    Checkout
                  </h2>

                  <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                    <p className="mb-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      Coupon
                    </p>
                    <CouponForm appliedCode={coupon?.code ?? null} />
                  </div>

                  <dl className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-5 text-[var(--scale-sm)]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-soft)]">Subtotal ({cart.itemCount})</dt>
                      <dd className="text-[var(--color-ink)]">{formatPrice(cart.subtotalCents)}</dd>
                    </div>
                    {discountCents > 0 ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--color-terp)]">{coupon?.label ?? "Discount"}</dt>
                        <dd className="text-[var(--color-terp)]">−{formatPrice(discountCents)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-soft)]">Tax</dt>
                      <dd className="text-[var(--color-ink-muted)]">At checkout</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-soft)]">Shipping</dt>
                      <dd className="text-[var(--color-ink-muted)]">At checkout</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[var(--color-border)] pt-4">
                      <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink)]">
                        Due today*
                      </dt>
                      <dd className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin)]">
                        {formatPrice(totalAfterDiscount)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                    *Before tax and shipping. No hidden fees — every charge is itemized before you pay.
                  </p>

                  <Link href="/checkout" className="btn-primary mt-6 w-full">
                    Proceed to checkout
                  </Link>
                  <Link
                    href="/shop"
                    className="mt-4 block text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    Continue shopping
                  </Link>
                  <Link
                    href="/promotions"
                    className="mt-3 block text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    View promotions
                  </Link>
                </aside>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
