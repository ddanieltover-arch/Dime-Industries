// components/admin/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS, isAdminNavActive } from "@/components/admin/admin-nav-config";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[var(--color-ink)]/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-5">
          <Link href="/admin" onClick={onClose} className="min-w-0">
            <p className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
              DIME
            </p>
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Back office
            </p>
          </Link>
          <button
            type="button"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-resin)] hover:text-[var(--color-ink)] lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
          <ul className="space-y-5">
            {ADMIN_NAV_GROUPS.map((group) => (
              <li key={group.id}>
                <p className="px-3 pb-2 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.links.map((link) => {
                    const active = isAdminNavActive(pathname, link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center border-l-2 px-3 py-2 text-[var(--scale-sm)] transition ${
                            active
                              ? "border-[var(--color-resin)] bg-[color-mix(in_srgb,var(--color-resin)_12%,transparent)] text-[var(--color-ink)]"
                              : "border-transparent text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
