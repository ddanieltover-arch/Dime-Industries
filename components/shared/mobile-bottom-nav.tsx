// components/shared/mobile-bottom-nav.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  icon: ReactNode;
  badge?: number;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.5v-6h-3v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4.5 8.5h15l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.2a1.5 1.5 0 0 1-1.5-1.3L4.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3.5 5h1.6l1.4 11.2a1.5 1.5 0 0 0 1.5 1.3h9.3a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.1" fill="currentColor" />
      <circle cx="16.5" cy="20" r="1.1" fill="currentColor" />
    </svg>
  );
}

function RewardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3.5 13.7 8h4.8l-3.9 2.9 1.5 4.6L12 13.2 7.9 15.5l1.5-4.6L5.5 8h4.8L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Keep checkout uncluttered — primary CTA stays on the page.
  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) {
    return null;
  }

  const items: NavItem[] = [
    {
      href: "/",
      label: "Home",
      match: (p) => p === "/",
      icon: <HomeIcon />,
    },
    {
      href: "/shop",
      label: "Shop",
      match: (p) => p === "/shop" || p.startsWith("/shop/") || p.startsWith("/product/"),
      icon: <ShopIcon />,
    },
    {
      href: "/cart",
      label: "Cart",
      match: (p) => p === "/cart",
      icon: <CartIcon />,
      badge: itemCount,
    },
    {
      href: "/rewards",
      label: "Rewards",
      match: (p) => p === "/rewards" || p.startsWith("/rewards/"),
      icon: <RewardsIcon />,
    },
    {
      href: "/account",
      label: "Account",
      match: (p) => p === "/account" || p.startsWith("/account/"),
      icon: <AccountIcon />,
    },
  ];

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-5" role="list">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-full min-h-14 flex-col items-center justify-center gap-0.5 px-1",
                  "font-[var(--font-display)] text-[0.625rem] uppercase tracking-[0.1em]",
                  "touch-manipulation transition-colors duration-[var(--motion-fast)]",
                  active
                    ? "text-[var(--color-resin)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-resin)]",
                ].join(" ")}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-[var(--color-resin)] px-1 text-[0.5625rem] font-[var(--font-display)] leading-none text-black">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
