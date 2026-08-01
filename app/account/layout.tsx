// app/account/layout.tsx
import { requireUser } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/account-nav";
import { signOut } from "@/app/(auth)/actions";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return (
    <div className="mx-auto max-w-5xl px-[var(--container-pad-x)] py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-8">
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Customer account
          </p>
          <h1 className="section-title mt-2">{profile.email}</h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn-outline px-5 py-2.5">
            Sign out
          </button>
        </form>
      </div>
      <div className="mt-2">
        <AccountNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
