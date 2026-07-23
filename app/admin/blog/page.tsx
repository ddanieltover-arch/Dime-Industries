// app/admin/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listBlogPosts } from "@/lib/cms/store";
import { BlogPostForm } from "@/components/admin/growth-admin-forms";

export const metadata: Metadata = {
  title: "Admin blog",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await listBlogPosts(true);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Blog
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Create or update posts. Published posts appear on{" "}
          <Link href="/blog" className="underline-offset-4 hover:underline">
            /blog
          </Link>
          .
        </p>
      </section>
      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          New post
        </h3>
        <div className="mt-4">
          <BlogPostForm />
        </div>
      </section>
      <section className="space-y-6">
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Existing
        </h3>
        {posts.map((post) => (
          <BlogPostForm key={post.slug} post={post} />
        ))}
      </section>
    </div>
  );
}
