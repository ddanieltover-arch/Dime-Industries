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
          className="flex h-11 w-11 touch-manipulation items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink)] transition-[border-color,color] duration-[var(--motion-fast)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative flex h-4 w-5 items-center justify-center" aria-hidden="true">
            <span
              className={`absolute block h-px w-5 origin-center bg-current transition-transform duration-[var(--motion-base)] ease-[var(--ease-out)] ${
                open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute block h-px w-5 bg-current transition-opacity duration-[var(--motion-fast)] ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block h-px origin-center bg-current transition-[transform,width] duration-[var(--motion-base)] ease-[var(--ease-out)] ${
                open ? "w-5 translate-y-0 -rotate-45" : "w-3 translate-y-1.5"
              }`}
            />
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Content
          className="drawer-panel-left fixed inset-y-0 left-0 z-50 flex w-[min(100vw,22rem)] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] outline-none"
          aria-describedby={undefined}
        >
          <div className="glass-panel flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
            <Dialog.Title className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="min-h-11 min-w-11 touch-manipulation font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                aria-label="Close menu"
              >
                Close
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Main mobile" className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
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
                        className={`block min-h-12 border-b border-[var(--color-border)] py-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
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
                      className="block min-h-12 border-b border-[var(--color-border)] py-3.5 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="border-t border-[var(--color-border)] p-5"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <Dialog.Close asChild>
              <Link href="/shop" className="btn-primary min-h-12 w-full touch-manipulation">
                Shop now
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
