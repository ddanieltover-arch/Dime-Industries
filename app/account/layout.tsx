// app/account/layout.tsx
import { requireUser } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/account-nav";
import { signOut } from "@/app/(auth)/actions";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-ink-soft)]">
            Customer account
          </p>
          <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
            {profile.email}
          </h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
