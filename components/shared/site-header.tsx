// components/shared/site-header.tsx
import Image from "next/image";
import Link from "next/link";
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-[var(--container-pad-x)] lg:gap-4 xl:h-[4.25rem]">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="brand-mark relative h-9 w-[7.75rem] shrink-0 sm:h-10 sm:w-36 lg:w-[8.5rem]">
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
