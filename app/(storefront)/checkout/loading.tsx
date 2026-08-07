// app/(storefront)/checkout/loading.tsx
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function CheckoutLoading() {
  return <PageLoadingSkeleton variant="checkout" label="Loading checkout" />;
}
