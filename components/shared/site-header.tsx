// components/shared/site-header.tsx
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/shared/mobile-nav";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { HeaderSearch } from "@/components/shared/header-search";
import { HeaderNav } from "@/components/shared/header-nav";
import { CartHeaderControls } from "@/components/cart/cart-header-controls";

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-[var(--color-resin-strong)] focus:px-4 focus:py-2 focus:text-[var(--color-bg)]"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/92 backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-resin)]/50 to-transparent"
          aria-hidden
        />
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-[var(--container-pad-x)] lg:h-[4.75rem]">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav />
            <Link
              href="/"
              className="relative h-9 w-[8.75rem] shrink-0 transition-opacity duration-[var(--motion-fast)] hover:opacity-90 sm:h-10 sm:w-44"
            >
              <Image
                src="/brand/logo.png"
                alt="DIME Industries"
                fill
                priority
                className="object-contain object-left"
                sizes="176px"
              />
            </Link>
          </div>

          <HeaderNav />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <HeaderSearch />
            <ThemeToggle />
            <Link
              href="/account"
              className="hidden px-2 py-2 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)] sm:inline"
            >
              Account
            </Link>
            <CartHeaderControls />
          </div>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
