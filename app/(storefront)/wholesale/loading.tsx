// app/(storefront)/wholesale/loading.tsx
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function WholesaleLoading() {
  return <PageLoadingSkeleton variant="page" label="Loading wholesale" />;
}
