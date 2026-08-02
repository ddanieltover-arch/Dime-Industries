// components/admin/site-settings-panel.tsx
"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/(admin)/actions";
import { saveSiteSettingsAction } from "@/app/(admin)/ops-actions";
import type { SiteOpsSettings } from "@/lib/admin/site-settings-store";
import { SITE_MIN_AGE } from "@/lib/compliance/jurisdictions";

const initial: AdminActionState = {};

const MARKETS = [
  {
    code: "CA",
    name: "California",
    detail: "Adult-use + medical fulfillment",
  },
  {
    code: "MA",
    name: "Massachusetts",
    detail: "Launch market · checkout gated",
  },
] as const;

function Feedback({ state }: { state: AdminActionState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-[var(--radius-sm)] border border-[var(--color-flag)]/40 bg-[var(--color-flag)]/10 px-3 py-2 text-[var(--scale-xs)] text-[var(--color-flag)]"
      >
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p
        role="status"
        className="rounded-[var(--radius-sm)] border border-[var(--color-terp)]/35 bg-[var(--color-terp)]/10 px-3 py-2 text-[var(--scale-xs)] text-[var(--color-terp)]"
      >
        {state.message}
      </p>
    );
  }
  return null;
}

function ToggleRow({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="group flex cursor-pointer items-start justify-between gap-6 border-b border-[var(--color-border)] py-5 last:border-b-0 last:pb-0 first:pt-0">
      <span className="min-w-0">
        <span className="block text-[var(--scale-sm)] font-medium text-[var(--color-ink)]">{title}</span>
        <span className="mt-1 block text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="h-6 w-11 rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-bg)] transition peer-checked:border-[var(--color-resin)] peer-checked:bg-[var(--color-resin)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-focus)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--color-ink-soft)] shadow-sm transition peer-checked:translate-x-5 peer-checked:bg-[var(--color-bg)]"
        />
      </span>
    </label>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteOpsSettings }) {
  const [state, action, pending] = useActionState(saveSiteSettingsAction, initial);

  return (
    <form action={action} className="space-y-8">
      <section className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div>
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Markets
            </p>
            <h3 className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
              Launch jurisdictions
            </h3>
            <p className="mt-1 max-w-xl text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Enabled markets accept checkout and catalog filtering. Disable a state to pause sales there
              without a deploy.
            </p>
          </div>
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Age gate {SITE_MIN_AGE}+ · code-locked
          </p>
        </header>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {MARKETS.map((market) => {
            const on = settings.jurisdictions.includes(market.code);
            return (
              <label
                key={market.code}
                className="group relative flex cursor-pointer flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition has-[:checked]:border-[var(--color-resin)] has-[:checked]:bg-[color-mix(in_srgb,var(--color-resin)_8%,transparent)]"
              >
                <input
                  type="checkbox"
                  name="jurisdiction"
                  value={market.code}
                  defaultChecked={on}
                  className="sr-only"
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                      {market.name}
                    </p>
                    <p className="mt-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      {market.code}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 items-center justify-center border border-[var(--color-border-interactive)] text-[10px] text-transparent transition group-has-[:checked]:border-[var(--color-resin)] group-has-[:checked]:bg-[var(--color-resin)] group-has-[:checked]:text-[var(--color-bg)]"
                  >
                    ✓
                  </span>
                </div>
                <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">{market.detail}</p>
              </label>
            );
          })}
        </div>
      </section>

      <section
        id="capabilities"
        className="scroll-mt-8 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <header className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Capabilities
          </p>
          <h3 className="mt-1 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            Feature flags
          </h3>
          <p className="mt-1 max-w-xl text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Runtime switches for storefront programs. Changes apply after save — no redeploy required.
          </p>
        </header>
        <div className="px-5 sm:px-6">
          <ToggleRow
            name="wholesaleEnabled"
            defaultChecked={settings.featureFlags.wholesaleEnabled}
            title="Wholesale program"
            description="When off, /wholesale closes applications and blocks shop ordering for approved accounts."
          />
          <ToggleRow
            name="vendorOnboarding"
            defaultChecked={settings.featureFlags.vendorOnboarding}
            title="Vendor onboarding"
            description="Reserved for multi-vendor intake. Flag is stored now; the public vendor portal is not live yet."
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:px-6">
        <div className="min-w-0 space-y-2">
          <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Saving writes to shared site settings and refreshes storefront routes.
          </p>
          <Feedback state={state} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary min-w-[9rem] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
