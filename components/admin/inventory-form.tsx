// components/admin/inventory-form.tsx
"use client";

import { useActionState } from "react";
import { updateAdminInventory, type AdminActionState } from "@/app/(admin)/actions";

const initial: AdminActionState = {};

export function InventoryForm({
  productId,
  variantId,
  quantityOnHand,
}: {
  productId: string;
  variantId: string;
  quantityOnHand: number;
}) {
  const [state, action, pending] = useActionState(updateAdminInventory, initial);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={variantId} />
      <input
        name="quantityOnHand"
        type="number"
        min={0}
        defaultValue={quantityOnHand}
        className="w-20 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1 text-[var(--scale-sm)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
      >
        Set qty
      </button>
      {state.error ? <span className="text-[var(--scale-xs)] text-[var(--color-flag)]">{state.error}</span> : null}
    </form>
  );
}
