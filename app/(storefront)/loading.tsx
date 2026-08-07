// app/(storefront)/loading.tsx
// Catch-all soft-nav skeleton for marketing/secondary routes (about, faq, blog…).
// Shop / cart / product / account / checkout keep more specific loaders.
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function StorefrontLoading() {
  return <PageLoadingSkeleton variant="page" />;
}
