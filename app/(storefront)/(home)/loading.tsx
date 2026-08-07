// app/(storefront)/(home)/loading.tsx
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function HomeLoading() {
  return <PageLoadingSkeleton variant="home" label="Loading DIME…" />;
}
