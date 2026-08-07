// components/product/mobile-pdp-buy-bar.tsx
"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Props = {
  priceCents: number;
  productName: string;
  formId?: string;
  inStock: boolean;
};

/**
 * Sticky mobile buy bar — appears once the in-page ATC block scrolls out of view,
 * sitting above the bottom nav so shoppers never lose the purchase action.
 */
export function MobilePdpBuyBar({
  priceCents,
  productName,
  formId = "pdp-add-to-cart",
  inStock,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!inStock) return;
    const target = document.getElementById(formId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry?.isIntersecting);
      },
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [formId, inStock]);

  if (!inStock || !visible) return null;

  return (
    <div
      className="mobile-pdp-buy-bar fixed inset-x-0 z-[45] border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-[var(--container-pad-x)] py-3 backdrop-blur-md lg:hidden"
      role="region"
      aria-label="Quick add to cart"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            {productName}
          </p>
          <p className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-resin-strong)]">
            {formatPrice(priceCents)}
          </p>
        </div>
        <button
          type="submit"
          form={formId}
          className="btn-primary min-h-11 shrink-0 touch-manipulation px-5 py-2.5"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
