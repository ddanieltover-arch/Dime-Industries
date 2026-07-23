// components/catalog/record-product-view.tsx
"use client";

import { useEffect } from "react";
import { trackProductView } from "@/app/(commerce)/recent-actions";

/** Fires once per mount to record PDP views in the recently-viewed cookie. */
export function RecordProductView({ slug }: { slug: string }) {
  useEffect(() => {
    void trackProductView(slug);
  }, [slug]);
  return null;
}
