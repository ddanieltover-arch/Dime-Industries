// app/admin/cms/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getHomepageBanner, listCmsPages } from "@/lib/cms/store";
import { BannerForm, CmsPageForm } from "@/components/admin/growth-admin-forms";

export const metadata: Metadata = {
  title: "Admin CMS",
  robots: { index: false, follow: false },
};

export default async function AdminCmsPage() {
  await requireAdmin();
  const [pages, banner] = await Promise.all([listCmsPages(true), getHomepageBanner()]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Homepage banner
        </h2>
        <div className="mt-4">
          <BannerForm banner={banner} />
        </div>
      </section>
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Pages
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Edits persist in the session CMS cookie and publish to public routes.
        </p>
        <ul className="mt-6 space-y-6" role="list">
          {pages.map((page) => (
            <li key={page.slug}>
              <CmsPageForm page={page} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
