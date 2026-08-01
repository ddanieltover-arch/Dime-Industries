// components/cart/cart-shell.tsx
import { getCartSnapshot } from "@/lib/cart";
import { CartProvider } from "@/components/cart/cart-provider";

export async function CartShell({ children }: { children: React.ReactNode }) {
  const cart = await getCartSnapshot();
  return <CartProvider initialCart={cart}>{children}</CartProvider>;
}
