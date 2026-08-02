// app/(cms)/[...slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsArticle } from "@/components/cms/cms-article";
import { getCmsPage } from "@/lib/cms/store";

type Params = Promise<{ slug: string[] }>;

/** ISR so post-build requests can pick up DB CMS edits without blocking Vercel SSG. */
export const revalidate = 300;

export async function generateStaticParams() {
  return [
    { slug: ["about"] },
    { slug: ["faq"] },
    { slug: ["careers"] },
    { slug: ["promotions"] },
    { slug: ["links"] },
    { slug: ["wholesale"] },
    { slug: ["legal", "terms"] },
    { slug: ["legal", "privacy"] },
    { slug: ["legal", "medical-privacy"] },
    { slug: ["legal", "returns"] },
    { slug: ["legal", "wholesale-rewards"] },
  ];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPage(slug.join("/"));
  if (!page) return { title: "Page" };
  return {
    title: page.title,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function CmsCatchAllPage({ params }: { params: Params }) {
  const { slug } = await params;
  const path = slug.join("/");
  // Reserve app routes that already have dedicated folders
  const reserved = new Set([
    "shop",
    "product",
    "cart",
    "checkout",
    "account",
    "admin",
    "login",
    "signup",
    "wishlist",
    "blog",
    "api",
    "auth",
    "r",
    "locations",
    "validate",
    "lab-results",
    "rewards",
    "app",
    "assistant",
    "contact",
  ]);
  if (reserved.has(slug[0] ?? "")) notFound();

  const page = await getCmsPage(path);
  if (!page) notFound();
  return <CmsArticle title={page.title} body={page.body} />;
}
