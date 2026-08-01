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
    <nav aria-label="Account" className="border-b border-[var(--color-border)]">
      <ul className="flex gap-5 overflow-x-auto py-3">
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
                className={`font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "text-[var(--color-resin)]"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
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
