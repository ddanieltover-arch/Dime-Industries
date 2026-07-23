// components/cart/wishlist-toggle.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  toggleWishlistItem,
  type WishlistActionState,
} from "@/app/(commerce)/wishlist-actions";

const initial: WishlistActionState = {};

export function WishlistToggle({
  variantId,
  initiallySaved,
}: {
  variantId: string;
  initiallySaved: boolean;
}) {
  const [state, formAction, pending] = useActionState(toggleWishlistItem, initial);
  const router = useRouter();
  const saved = state.inWishlist ?? initiallySaved;

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="variantId" value={variantId} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={saved}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : saved ? "Saved to wishlist" : "Add to wishlist"}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
