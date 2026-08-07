// components/social-proof/purchase-toast.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { PurchaseNotification } from "@/lib/social-proof/purchase-notifications";
import { productHref } from "@/lib/social-proof/purchase-notifications";

type PurchaseToastProps = {
  notification: PurchaseNotification;
  onDismiss: () => void;
  visible: boolean;
};

export function PurchaseToast({ notification, onDismiss, visible }: PurchaseToastProps) {
  const href = productHref(notification.product.slug);
  const fullName = `${notification.firstName} ${notification.lastName}`;
  const { product } = notification;

  return (
    <div
      className={[
        "purchase-toast-anchor pointer-events-none fixed z-[45] px-3",
        "left-0 right-0 flex justify-start sm:right-auto sm:max-w-[26rem]",
        "transition-[opacity,transform] duration-[var(--motion-base)] ease-[var(--ease-out)]",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={[
          "pointer-events-auto relative w-full max-w-[22rem] overflow-hidden",
          "rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)]",
          "border border-[var(--color-border)] shadow-[var(--shadow-elevated)]",
        ].join(" ")}
      >
        <span
          className="absolute inset-y-0 left-0 w-1.5 bg-[var(--color-resin)]"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 py-3 pl-4 pr-10">
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="56px"
              />
            ) : (
              <span className="flex h-full items-center justify-center font-[var(--font-display)] text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                DIME
              </span>
            )}
          </Link>

          <Link
            href={href}
            className="min-w-0 flex-1 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]"
            aria-label={`${fullName} from ${notification.state} just purchased ${product.name}. View product.`}
          >
            <p className="font-[var(--font-body)] text-[0.8125rem] leading-snug text-[var(--color-ink-soft)]">
              <span className="font-semibold text-[var(--color-ink)]">{fullName}</span>
              {" from "}
              {notification.state}
              {" just purchased "}
              <span className="font-semibold text-[var(--color-resin)]">{product.name}</span>
              .
            </p>
            <p className="mt-1.5 font-[var(--font-display)] text-[0.625rem] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              Just now
            </p>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
            className="absolute right-2 top-2 flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
            aria-label="Stop purchase notifications for this visit"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
