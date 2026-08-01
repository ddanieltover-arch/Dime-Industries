// components/shared/header-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const HEADER_NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/promotions", label: "Promotions" },
  { href: "/validate", label: "Validate" },
  { href: "/rewards", label: "Rewards" },
  { href: "/locations", label: "Find DIME" },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/shop/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1 xl:gap-2">
        {HEADER_NAV_LINKS.map((link) => {
          const active = linkActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group relative inline-flex px-3 py-2 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                  active
                    ? "text-[var(--color-resin)]"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-px origin-left bg-[var(--color-resin)] transition-transform duration-[var(--motion-base)] ease-[var(--ease-out)] ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
