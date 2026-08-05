// components/account/account-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/returns", label: "Returns" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/loyalty", label: "Loyalty" },
  { href: "/account/affiliate", label: "Affiliate" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/validate", label: "Validate" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="sticky top-16 z-30 -mx-[var(--container-pad-x)] border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md xl:top-[4.25rem]"
    >
      <div className="relative">
        <ul
          className="rail-scroll flex gap-1 overflow-x-auto px-[var(--container-pad-x)] py-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {LINKS.map((link) => {
            const active =
              link.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="shrink-0 snap-start">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center touch-manipulation px-3 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "text-[var(--color-resin)]"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <span
                      className="absolute inset-x-3 bottom-1 h-px bg-[var(--color-resin)]"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent sm:w-12"
          aria-hidden
        />
      </div>
    </nav>
  );
}
