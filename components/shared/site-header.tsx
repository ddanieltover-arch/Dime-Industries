// components/shared/site-header.tsx
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CartHeaderControls } from "@/components/cart/cart-header-controls";
import { getCartSnapshot } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/vapes", label: "Vapes" },
  { href: "/shop/edibles", label: "Edibles" },
  { href: "/shop/prerolls", label: "Prerolls" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/locations", label: "Find DIME" },
];

export async function SiteHeader() {
  const cart = await getCartSnapshot();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-[var(--color-resin-strong)] focus:px-4 focus:py-2 focus:text-[var(--color-bg)]"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="relative h-8 w-[7.5rem] shrink-0 sm:h-9 sm:w-36">
            <Image
              src="/brand/logo.png"
              alt="DIME"
              fill
              priority
              className="object-contain object-left"
              sizes="144px"
            />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/account"
              className="hidden font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)] sm:block"
            >
              Account
            </Link>
            <Link
              href="/admin"
              className="hidden font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)] lg:block"
            >
              Admin
            </Link>
            <CartHeaderControls cart={cart} />
          </div>
        </div>

        <nav aria-label="Main mobile" className="border-t border-[var(--color-border)] px-4 py-2 md:hidden">
          <ul className="flex gap-4 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="shrink-0">
              <Link
                href="/wishlist"
                className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]"
              >
                Wishlist
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
