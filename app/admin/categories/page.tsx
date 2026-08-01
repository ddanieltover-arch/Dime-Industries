// app/admin/categories/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminCategories } from "@/lib/admin/categories-store";
import { CategoryForm } from "@/components/admin/ops-admin-forms";

export const metadata: Metadata = {
  title: "Admin categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listAdminCategories();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Categories
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Rename and reorder storefront categories. Slugs stay stable for URLs; display names apply as
          catalog overrides.
        </p>
      </section>
      <ul className="space-y-4" role="list">
        {categories.map((category) => (
          <li key={category.slug}>
            <CategoryForm category={category} />
          </li>
        ))}
      </ul>
    </div>
  );
}
