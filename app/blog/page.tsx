// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts } from "@/lib/cms/store";

export const metadata: Metadata = {
  title: "Blog",
  description: "Product education, potency guides, and platform updates from DIME.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
        Blog
      </h1>
      <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Guides and notes from the lab-ticket storefront.
      </p>
      <ul className="mt-10 space-y-8" role="list">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] hover:text-[var(--color-resin)]"
            >
              {post.title}
            </Link>
            <p className="mt-1 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
            <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
