// components/home/category-spotlight-deferred.tsx
"use client";

import dynamic from "next/dynamic";
import { CategorySpotlightStatic } from "@/components/home/category-spotlight-static";
import { LazyWhenVisible } from "@/components/home/lazy-when-visible";

const CategorySpotlight = dynamic(
  () => import("@/components/home/category-spotlight").then((m) => m.CategorySpotlight),
  { ssr: false, loading: () => <CategorySpotlightStatic /> },
);

/** Static CSS rail until near viewport, then hydrates the interactive carousel. */
export function CategorySpotlightDeferred() {
  return (
    <LazyWhenVisible
      fallback={<CategorySpotlightStatic />}
      active={<CategorySpotlight />}
    />
  );
}
