// components/admin/admin-topbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { adminPageTitle } from "@/components/admin/admin-nav-config";

type Props = {
  email: string;
  onMenuOpen: () => void;
  menuOpen: boolean;
};

export function AdminTopbar({ email, onMenuOpen, menuOpen }: Props) {
  const pathname = usePathname();
  const title = adminPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center border border-[var(--color-border-interactive)] text-[var(--color-ink)] transition hover:border-[var(--color-resin)] lg:hidden"
        onClick={onMenuOpen}
        aria-label="Open navigation"
        aria-controls="admin-sidebar"
        aria-expanded={menuOpen}
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
          {title}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-[var(--scale-xs)] sm:gap-4 sm:text-[var(--scale-sm)]">
        <Link
          href="/shop"
          className="hidden text-[var(--color-ink-soft)] underline-offset-4 transition hover:text-[var(--color-resin)] hover:underline sm:inline"
        >
          View storefront
        </Link>
        <p className="hidden max-w-[12rem] truncate font-[var(--font-mono)] text-[10px] text-[var(--color-ink-muted)] md:block">
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="border border-[var(--color-border-interactive)] px-3 py-1.5 text-[var(--color-ink-soft)] transition hover:border-[var(--color-resin)] hover:text-[var(--color-ink)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
