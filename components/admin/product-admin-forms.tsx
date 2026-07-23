// components/admin/product-admin-forms.tsx
"use client";

import { useActionState } from "react";
import {
  updateAdminProduct,
  updateAdminVariantPrice,
  type AdminActionState,
} from "@/app/(admin)/actions";

const initial: AdminActionState = {};

export function ProductStatusForm({
  productId,
  name,
  status,
}: {
  productId: string;
  name: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(updateAdminProduct, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="productId" value={productId} />
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Name
        <input
          name="name"
          defaultValue={name}
          className="mt-1 block w-48 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Status
        <select
          name="status"
          defaultValue={status}
          className="mt-1 block rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        >
          <option value="active">active</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        Save
      </button>
      {state.message ? (
        <span className="text-[var(--scale-xs)] text-[var(--color-terp)]">{state.message}</span>
      ) : null}
      {state.error ? (
        <span className="text-[var(--scale-xs)] text-[var(--color-flag)]">{state.error}</span>
      ) : null}
    </form>
  );
}

export function VariantPriceForm({
  productId,
  variantId,
  priceCents,
}: {
  productId: string;
  variantId: string;
  priceCents: number;
}) {
  const [state, action, pending] = useActionState(updateAdminVariantPrice, initial);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={variantId} />
      <label className="sr-only" htmlFor={`price-${variantId}`}>
        Price cents
      </label>
      <input
        id={`price-${variantId}`}
        name="priceCents"
        type="number"
        min={0}
        defaultValue={priceCents}
        className="w-24 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1 text-[var(--scale-sm)]"
      />
      <button type="submit" disabled={pending} className="text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline">
        Update ¢
      </button>
      {state.error ? <span className="text-[var(--scale-xs)] text-[var(--color-flag)]">{state.error}</span> : null}
    </form>
  );
}
