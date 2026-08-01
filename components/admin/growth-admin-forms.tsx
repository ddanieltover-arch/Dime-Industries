// components/admin/growth-admin-forms.tsx
"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/(admin)/actions";
import {
  adjustLoyaltyAction,
  saveBannerAction,
  saveBlogPostAction,
  saveCmsPageAction,
  saveCouponAction,
  saveHomepageLayoutAction,
} from "@/app/(admin)/growth-actions";
import {
  HOME_SECTION_LABELS,
  supportsHomeCopy,
} from "@/lib/cms/homepage-layout";
import type { BlogPost, CmsPage, HomepageBanner, HomepageLayout, HomepageSection } from "@/lib/cms/types";
import type { Coupon } from "@/lib/coupons/types";

const initial: AdminActionState = {};

function Feedback({ state }: { state: AdminActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-[var(--scale-xs)] text-[var(--color-flag)]">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="text-[var(--scale-xs)] text-[var(--color-terp)]">
        {state.message}
      </p>
    );
  }
  return null;
}

export function CmsPageForm({ page }: { page: CmsPage }) {
  const [state, action, pending] = useActionState(saveCmsPageAction, initial);
  return (
    <form action={action} className="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <input type="hidden" name="slug" value={page.slug} />
      <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        /{page.slug}
      </p>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Title
        <input
          name="title"
          defaultValue={page.title}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Body
        <textarea
          name="body"
          rows={6}
          defaultValue={page.body}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Status
        <select
          name="status"
          defaultValue={page.status}
          className="mt-1 block rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        >
          <option value="published">published</option>
          <option value="draft">draft</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save page"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function HomepageLayoutForm({ layout }: { layout: HomepageLayout }) {
  const [state, action, pending] = useActionState(saveHomepageLayoutAction, initial);
  const [sections, setSections] = useState<HomepageSection[]>(layout.sections);

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      const [row] = copy.splice(index, 1);
      copy.splice(next, 0, row);
      return copy;
    });
  }

  function patch(index: number, partial: Partial<HomepageSection>) {
    setSections((prev) => prev.map((row, i) => (i === index ? { ...row, ...partial } : row)));
  }

  return (
    <form action={action} className="space-y-4 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <input type="hidden" name="layout" value={JSON.stringify({ sections })} />
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Toggle and reorder homepage sections. Banner copy is edited above; optional overrides apply to
        hero, rewards, locator, validate, and newsletter.
      </p>
      <ul className="space-y-3" role="list">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex flex-1 items-center gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => patch(index, { enabled: e.target.checked })}
                />
                {HOME_SECTION_LABELS[section.id]}
                <span className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  {section.id}
                </span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-2 py-1 text-[var(--scale-xs)] text-[var(--color-ink)] disabled:opacity-40"
                  aria-label={`Move ${HOME_SECTION_LABELS[section.id]} up`}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sections.length - 1}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-2 py-1 text-[var(--scale-xs)] text-[var(--color-ink)] disabled:opacity-40"
                  aria-label={`Move ${HOME_SECTION_LABELS[section.id]} down`}
                >
                  Down
                </button>
              </div>
            </div>
            {supportsHomeCopy(section.id) ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  Headline override
                  <input
                    value={section.headline ?? ""}
                    onChange={(e) => patch(index, { headline: e.target.value })}
                    placeholder="Default"
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
                  />
                </label>
                <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  Body override
                  <input
                    value={section.body ?? ""}
                    onChange={(e) => patch(index, { body: e.target.value })}
                    placeholder="Default"
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
                  />
                </label>
                {section.id !== "newsletter" ? (
                  <>
                    <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                      CTA label
                      <input
                        value={section.ctaLabel ?? ""}
                        onChange={(e) => patch(index, { ctaLabel: e.target.value })}
                        placeholder="Default"
                        className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
                      />
                    </label>
                    <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                      CTA href
                      <input
                        value={section.ctaHref ?? ""}
                        onChange={(e) => patch(index, { ctaHref: e.target.value })}
                        placeholder="Default"
                        className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
                      />
                    </label>
                  </>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save homepage layout"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function BannerForm({ banner }: { banner: HomepageBanner }) {
  const [state, action, pending] = useActionState(saveBannerAction, initial);
  return (
    <form action={action} className="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <label className="flex items-center gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input type="checkbox" name="enabled" defaultChecked={banner.enabled} />
        Enabled
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Headline
        <input
          name="headline"
          defaultValue={banner.headline}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Body
        <input
          name="body"
          defaultValue={banner.body}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          CTA label
          <input
            name="ctaLabel"
            defaultValue={banner.ctaLabel}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          CTA href
          <input
            name="ctaHref"
            defaultValue={banner.ctaHref}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save banner"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const [state, action, pending] = useActionState(saveBlogPostAction, initial);
  return (
    <form action={action} className="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Slug
        <input
          name="slug"
          defaultValue={post?.slug ?? ""}
          required
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Title
        <input
          name="title"
          defaultValue={post?.title ?? ""}
          required
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Excerpt
        <input
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Body
        <textarea
          name="body"
          rows={5}
          defaultValue={post?.body ?? ""}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Status
        <select
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="mt-1 block rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        >
          <option value="published">published</option>
          <option value="draft">draft</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : post ? "Update post" : "Create post"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function CouponFormAdmin({ coupon }: { coupon?: Coupon }) {
  const [state, action, pending] = useActionState(saveCouponAction, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Code
        <input
          name="code"
          defaultValue={coupon?.code ?? ""}
          required
          className="mt-1 block w-32 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Type
        <select
          name="type"
          defaultValue={coupon?.type ?? "percentage"}
          className="mt-1 block rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        >
          <option value="percentage">percentage</option>
          <option value="fixed">fixed (cents)</option>
        </select>
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Value
        <input
          name="value"
          type="number"
          defaultValue={coupon?.value ?? 10}
          className="mt-1 block w-24 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Min subtotal ¢
        <input
          name="minSubtotalCents"
          type="number"
          defaultValue={coupon?.minSubtotalCents ?? 0}
          className="mt-1 block w-28 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="flex items-center gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} />
        Active
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "…" : coupon ? "Update" : "Add"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function LoyaltyAdjustForm() {
  const [state, action, pending] = useActionState(adjustLoyaltyAction, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 block w-56 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Delta
        <input
          name="delta"
          type="number"
          required
          className="mt-1 block w-24 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Reason
        <input
          name="reason"
          defaultValue="Admin adjustment"
          className="mt-1 block w-48 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "…" : "Adjust"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
