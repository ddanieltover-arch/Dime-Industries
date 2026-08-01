// components/shared/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { HEADER_NAV_LINKS } from "@/components/shared/header-nav";

const EXTRA_LINKS = [
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/contact", label: "Contact" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink)] transition-[border-color,color] duration-[var(--motion-fast)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)] lg:hidden"
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 data-[state=open]:animate-in" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,22rem)] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] outline-none"
          aria-describedby={undefined}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
            <Dialog.Title className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                aria-label="Close menu"
              >
                Close
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Main mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-0" role="list">
              {HEADER_NAV_LINKS.map((link) => {
                const active =
                  link.href === "/shop"
                    ? pathname === "/shop" || pathname.startsWith("/shop/")
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Dialog.Close asChild>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`block border-b border-[var(--color-border)] py-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                          active
                            ? "text-[var(--color-resin)]"
                            : "text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </Dialog.Close>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Account
            </p>
            <ul className="mt-3 space-y-0" role="list">
              {EXTRA_LINKS.map((link) => (
                <li key={link.href}>
                  <Dialog.Close asChild>
                    <Link
                      href={link.href}
                      className="block border-b border-[var(--color-border)] py-3.5 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-[var(--color-border)] p-5">
            <Dialog.Close asChild>
              <Link href="/shop" className="btn-primary w-full">
                Shop now
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
