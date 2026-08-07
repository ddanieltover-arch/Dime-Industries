// components/cart/cart-shell.tsx
import { getCartItemCount } from "@/lib/cart";
import { CartProvider } from "@/components/cart/cart-provider";

/** Layout shell — count only. Full cart lines hydrate via /api/cart when the drawer opens. */
export async function CartShell({ children }: { children: React.ReactNode }) {
  const itemCount = await getCartItemCount();
  return (
    <CartProvider initialCart={{ lines: [], itemCount, subtotalCents: 0 }}>
      {children}
    </CartProvider>
  );
}
