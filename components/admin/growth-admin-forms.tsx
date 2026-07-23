// components/admin/growth-admin-forms.tsx
"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/(admin)/actions";
import {
  adjustLoyaltyAction,
  saveBannerAction,
  saveBlogPostAction,
  saveCmsPageAction,
  saveCouponAction,
} from "@/app/(admin)/growth-actions";
import type { BlogPost, CmsPage, HomepageBanner } from "@/lib/cms/types";
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
