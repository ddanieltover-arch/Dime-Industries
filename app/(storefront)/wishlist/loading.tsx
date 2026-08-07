// app/(storefront)/wishlist/loading.tsx
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function WishlistLoading() {
  return <PageLoadingSkeleton variant="page" label="Loading wishlist" />;
}
