// lib/admin/categories-logic.ts — pure helpers (safe for unit tests)
export type CategoryOverride = {
  name?: string;
  sortOrder?: number;
  hidden?: boolean;
};

export type CategoryOverrides = Record<string, CategoryOverride>;

/** Apply display-name overrides onto catalog products (storefront + admin). */
export function applyCategoryNameOverrides<T extends { categorySlug: string; categoryName: string }>(
  products: T[],
  overrides: CategoryOverrides
): T[] {
  if (!Object.keys(overrides).length) return products;
  return products.map((p) => {
    const name = overrides[p.categorySlug]?.name?.trim();
    return name ? { ...p, categoryName: name } : p;
  });
}
