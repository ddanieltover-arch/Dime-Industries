// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsArticle } from "@/components/cms/cms-article";
import { buildFaqPageJsonLd, parseBlogFaqSection } from "@/lib/cms/faq";
import { getBlogPost } from "@/lib/cms/store";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post" };
  const url = `/blog/${post.slug}`;
  const ogImage = absoluteUrl("/brand/og.png");
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const blogPosting = buildBlogPostingJsonLd(post);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const faqEntries = parseBlogFaqSection(post.body);
  const faqJsonLd =
    faqEntries.length >= 2
      ? buildFaqPageJsonLd(faqEntries, absoluteUrl(`/blog/${post.slug}`))
      : null;

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="underline-offset-4 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/blog" className="underline-offset-4 hover:underline">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[var(--color-ink)]" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>
      </div>
      <CmsArticle title={post.title} body={post.body} />
    </div>
  );
}
