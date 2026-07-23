// app/admin/layout.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOut } from "@/app/(auth)/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-ink-soft)]">
            Admin
          </p>
          <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            Back office
          </h1>
          <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{admin.email}</p>
        </div>
        <div className="flex items-center gap-4 text-[var(--scale-sm)]">
          <Link href="/shop" className="text-[var(--color-ink-soft)] underline-offset-4 hover:underline">
            View storefront
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-[var(--color-ink-soft)] underline-offset-4 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="mt-6">
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
