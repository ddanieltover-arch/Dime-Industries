// components/shared/site-header.tsx
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/shared/mobile-nav";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { HeaderSearch } from "@/components/shared/header-search";
import { HeaderNav } from "@/components/shared/header-nav";
import { CartHeaderControls } from "@/components/cart/cart-header-controls";
import { AccountIcon, headerIconBtnClass } from "@/components/shared/header-icons";

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-[var(--container-pad-x)] lg:gap-4 xl:h-[4.25rem]">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <MobileNav />
            <Link
              href="/"
              className="relative h-8 w-[7.5rem] shrink-0 transition-opacity duration-[var(--motion-fast)] hover:opacity-90 sm:h-9 sm:w-36 lg:w-[8.25rem]"
            >
              <Image
                src="/brand/logo.png"
                alt="DIME Industries"
                fill
                priority
                className="object-contain object-left"
                sizes="144px"
              />
            </Link>
          </div>

          <HeaderNav />

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <HeaderSearch />
            <ThemeToggle />
            <Link
              href="/account"
              aria-label="Account"
              className={`${headerIconBtnClass} hidden sm:inline-flex`}
            >
              <AccountIcon />
            </Link>
            <CartHeaderControls />
          </div>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
