// components/shared/mobile-bottom-nav.tsx
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { HEADER_NAV_LINKS } from "@/components/shared/header-nav";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  icon: ReactNode;
  badge?: number;
};

/** Destinations not on the primary 4 tabs — opened from More. */
const MORE_LINKS = [
  ...HEADER_NAV_LINKS.filter((l) => l.href !== "/shop"),
  { href: "/wishlist", label: "Wishlist" },
  { href: "/contact", label: "Contact" },
] as const;

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

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function linkActive(pathname: string, href: string) {
  if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/shop/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Single mobile navigation island — primary tabs + More sheet.
 * Replaces the former header hamburger so mobile only hydrates one nav.
 */
export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { itemCount } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep checkout uncluttered — primary CTA stays on the page.
  const hideBar = pathname.startsWith("/checkout") || pathname.startsWith("/admin");

  useEffect(() => {
    if (!moreOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      moreTriggerRef.current?.focus();
    };
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  if (hideBar) return null;

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
      href: "/account",
      label: "Account",
      match: (p) => p === "/account" || p.startsWith("/account/"),
      icon: <AccountIcon />,
    },
  ];

  const moreActive = MORE_LINKS.some((link) => linkActive(pathname, link.href));

  return (
    <>
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
          <li className="min-w-0">
            <button
              ref={moreTriggerRef}
              type="button"
              aria-expanded={moreOpen}
              aria-controls={panelId}
              onClick={() => setMoreOpen((v) => !v)}
              className={[
                "relative flex h-full min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1",
                "font-[var(--font-display)] text-[0.625rem] uppercase tracking-[0.1em]",
                "touch-manipulation transition-colors duration-[var(--motion-fast)]",
                moreOpen || moreActive
                  ? "text-[var(--color-resin)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-resin)]",
              ].join(" ")}
            >
              <MoreIcon />
              <span className="truncate">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <>
          <button
            type="button"
            className="drawer-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden"
            data-state="open"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMoreOpen(false)}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-state="open"
            className="drawer-panel-left fixed inset-y-0 left-0 z-50 flex w-[min(100vw,22rem)] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] outline-none lg:hidden"
          >
            <div className="glass-panel flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
              <p
                id={titleId}
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]"
              >
                More
              </p>
              <button
                type="button"
                className="min-h-11 min-w-11 touch-manipulation font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                aria-label="Close menu"
                onClick={() => setMoreOpen(false)}
              >
                Close
              </button>
            </div>

            <nav aria-label="More destinations" className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <ul className="space-y-0" role="list">
                {MORE_LINKS.map((link) => {
                  const active = linkActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                        className={`block min-h-12 border-b border-[var(--color-border)] py-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                          active
                            ? "text-[var(--color-resin)]"
                            : "text-[var(--color-ink)] hover:text-[var(--color-resin)]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              className="border-t border-[var(--color-border)] p-5"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <Link
                href="/shop"
                onClick={() => setMoreOpen(false)}
                className="btn-primary min-h-12 w-full touch-manipulation"
              >
                Shop now
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
