// components/cart/cart-drawer.tsx
"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { CartRemoveButton } from "@/components/cart/cart-remove-button";
import { formatPrice } from "@/lib/format";
import type { CartSnapshot } from "@/lib/cart/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartSnapshot;
};

export function CartDrawer({ open, onOpenChange, cart }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby="cart-drawer-desc"
          className="drawer-panel fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] outline-none"
        >
          <div className="glass-panel flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <Dialog.Title className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Your cart
            </Dialog.Title>
            <Dialog.Close className="nav-link min-h-11 min-w-11 touch-manipulation px-2">
              Close
            </Dialog.Close>
          </div>

          <p id="cart-drawer-desc" className="sr-only">
            Review items in your shopping cart.
          </p>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {cart.lines.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
                  Your cart is empty
                </p>
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="mt-4 inline-flex min-h-11 items-center text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
                >
                  Return to shop
                </Link>
              </div>
            ) : (
              <ul className="space-y-4" role="list">
                {cart.lines.map((line) => (
                  <li key={line.variantId} className="border-b border-[var(--color-border)] pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${line.productSlug}`}
                          onClick={() => onOpenChange(false)}
                          className="font-[var(--font-display)] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                        >
                          {line.productName}
                        </Link>
                        <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                          {line.weightOrFormat} · Qty {line.quantity}
                        </p>
                        <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink)]">
                          {formatPrice(line.unitPriceCents * line.quantity)}
                        </p>
                      </div>
                      <CartRemoveButton variantId={line.variantId} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="space-y-3 border-t border-[var(--color-border)] px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-between font-[var(--font-display)] text-[var(--color-ink)]">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotalCents)}</span>
            </div>
            <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Tax and shipping calculated at checkout. No hidden fees.
            </p>
            <Link
              href="/cart"
              onClick={() => onOpenChange(false)}
              className="btn-outline min-h-12 w-full touch-manipulation"
            >
              View cart
            </Link>
            {cart.lines.length > 0 ? (
              <Link
                href="/checkout"
                onClick={() => onOpenChange(false)}
                className="btn-primary min-h-12 w-full touch-manipulation"
              >
                Checkout
              </Link>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
