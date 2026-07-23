// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsArticle } from "@/components/cms/cms-article";
import { getBlogPost } from "@/lib/cms/store";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <Link
          href="/blog"
          className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
        >
          ← Blog
        </Link>
      </div>
      <CmsArticle title={post.title} body={post.body} />
    </div>
  );
}
