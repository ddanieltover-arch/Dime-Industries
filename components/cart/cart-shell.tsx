// components/cart/cart-shell.tsx
import { Suspense } from "react";
import { getCartItemCount } from "@/lib/cart";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartCountSetter } from "@/components/cart/cart-count-setter";

/**
 * Non-blocking cart chrome. Never await here — an async parent that waits
 * before rendering `{children}` stalls every navigation on cart/auth I/O.
 * Count streams in via Suspense; lines hydrate when the drawer opens.
 */
async function CartCountHydrator() {
  try {
    const itemCount = await getCartItemCount();
    return <CartCountSetter count={itemCount} />;
  } catch {
    return null;
  }
}

export function CartShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider initialCart={{ lines: [], itemCount: 0, subtotalCents: 0 }}>
      <Suspense fallback={null}>
        <CartCountHydrator />
      </Suspense>
      {children}
    </CartProvider>
  );
}
