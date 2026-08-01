// app/admin/cms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { FAQ_CMS_SLUG } from "@/lib/cms/faq";
import { getHomepageBanner, getHomepageLayout, listCmsPages } from "@/lib/cms/store";
import { BannerForm, CmsPageForm, HomepageLayoutForm } from "@/components/admin/growth-admin-forms";

export const metadata: Metadata = {
  title: "Admin CMS",
  robots: { index: false, follow: false },
};

export default async function AdminCmsPage() {
  await requireAdmin();
  const [pages, banner, layout] = await Promise.all([
    listCmsPages(true),
    getHomepageBanner(),
    getHomepageLayout(),
  ]);

  const faqPage = pages.find((p) => p.slug === FAQ_CMS_SLUG) ?? null;
  const otherPages = pages.filter((p) => p.slug !== FAQ_CMS_SLUG);

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
          Homepage builder
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Section components stay in code; this controls order, visibility, and optional copy.
        </p>
        <div className="mt-4">
          <HomepageLayoutForm layout={layout} />
        </div>
      </section>
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          FAQ
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          One CMS page at{" "}
          <Link href="/faq" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
            /faq
          </Link>
          . Use <code className="font-[var(--font-mono)] text-[var(--scale-xs)]">### Question</code>{" "}
          headings with answer paragraphs — there is no separate FAQ item CRUD.
        </p>
        <div className="mt-4">
          {faqPage ? (
            <CmsPageForm page={faqPage} />
          ) : (
            <p className="text-[var(--scale-sm)] text-[var(--color-flag)]">FAQ page missing from CMS store.</p>
          )}
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
          {otherPages.map((page) => (
            <li key={page.slug}>
              <CmsPageForm page={page} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
