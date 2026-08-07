// app/(storefront)/account/loading.tsx
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function AccountLoading() {
  return <PageLoadingSkeleton variant="account" label="Loading account" />;
}
