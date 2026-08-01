// components/shared/site-header.tsx
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/shared/mobile-nav";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { HeaderSearch } from "@/components/shared/header-search";
import { CartHeaderControls } from "@/components/cart/cart-header-controls";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/promotions", label: "Promotions" },
  { href: "/validate", label: "Validate" },
  { href: "/rewards", label: "Rewards" },
  { href: "/locations", label: "Find DIME" },
];

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-[var(--color-resin-strong)] focus:px-4 focus:py-2 focus:text-[var(--color-bg)]"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-[var(--container-pad-x)]">
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/" className="relative h-9 w-[8.5rem] shrink-0 sm:h-10 sm:w-40">
              <Image
                src="/brand/logo.png"
                alt="DIME"
                fill
                priority
                className="object-contain object-left"
                sizes="160px"
              />
            </Link>
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="sm:block">
              <HeaderSearch />
            </div>
            <ThemeToggle />
            <Link href="/account" className="nav-link hidden sm:inline">
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
