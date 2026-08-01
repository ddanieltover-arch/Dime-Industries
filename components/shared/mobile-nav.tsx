// components/shared/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/promotions", label: "Promotions" },
  { href: "/validate", label: "Validate" },
  { href: "/rewards", label: "Rewards" },
  { href: "/locations", label: "Find DIME" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)] lg:hidden"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-3 bg-current" />
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,20rem)] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] outline-none"
          aria-describedby={undefined}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
            <Dialog.Title className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="nav-link px-2 py-1"
                aria-label="Close menu"
              >
                Close
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Main mobile" className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Dialog.Close asChild>
                    <Link
                      href={link.href}
                      className="block border-b border-[var(--color-border)] py-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
