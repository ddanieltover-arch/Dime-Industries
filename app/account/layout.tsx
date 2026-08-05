// app/account/layout.tsx
import { requireUser } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/account-nav";
import { signOut } from "@/app/(auth)/actions";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return (
    <div className="mx-auto max-w-5xl px-[var(--container-pad-x)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-8 sm:py-10 lg:pb-14 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6 sm:pb-8">
        <div className="min-w-0 flex-1">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Customer account
          </p>
          <h1 className="section-title mt-2 break-words text-[clamp(1.25rem,4vw,2.5rem)]">
            <span className="block truncate sm:whitespace-normal sm:break-all">
              {profile.email}
            </span>
          </h1>
        </div>
        <form action={signOut} className="shrink-0">
          <button
            type="submit"
            className="btn-outline min-h-11 touch-manipulation px-5 py-2.5"
          >
            Sign out
          </button>
        </form>
      </div>
      <div className="mt-1">
        <AccountNav />
      </div>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );
}
