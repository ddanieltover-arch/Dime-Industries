// components/account/account-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
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
    <nav aria-label="Account" className="border-b border-[var(--color-border)]">
      <ul className="flex gap-4 overflow-x-auto px-4 py-3 sm:px-0">
        {LINKS.map((link) => {
          const active =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[var(--scale-sm)] underline-offset-4 ${
                  active
                    ? "text-[var(--color-ink)] underline"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
