// app/blog/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listBlogPosts } from "@/lib/cms/store";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "Product education, potency guides, and platform updates from DIME.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();
  const [featured, ...rest] = posts;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumbs} />

      <section className="relative isolate min-h-[min(52vh,480px)] overflow-hidden">
        <Image
          src="/brand/awards.webp"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_35%,rgba(201,177,56,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(52vh,480px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-16 sm:pt-32">
          <p className="section-eyebrow">DIME</p>
          <h1 className="mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            Blog
          </h1>
          <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Product education, potency guides, and notes from the brand — built for curious shoppers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#posts" className="btn-primary">
              Read posts
            </a>
            <Link href="/shop" className="btn-outline-light">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      {featured ? (
        <section
          aria-labelledby="featured-heading"
          className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Latest
            </p>
            <h2 id="featured-heading" className="sr-only">
              Featured post
            </h2>
            <Link href={`/blog/${featured.slug}`} className="group mt-4 block max-w-3xl">
              <time
                dateTime={featured.publishedAt}
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]"
              >
                {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <p className="mt-3 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.25rem)] uppercase leading-[1.05] tracking-[0.04em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                {featured.title}
              </p>
              <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
                {featured.excerpt}
              </p>
              <span className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                Read article →
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      <section id="posts" aria-labelledby="posts-heading" className="scroll-mt-24 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Archive
          </p>
          <h2 id="posts-heading" className="section-title mt-2">
            All posts
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Hardware, potency, COAs, and how to shop DIME with confidence.
          </p>

          {rest.length > 0 ? (
            <ul
              className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]"
              role="list"
            >
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-2 bg-[var(--color-surface)] px-5 py-6 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--color-surface-raised)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-7"
                  >
                    <div className="min-w-0">
                      <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.04em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                        {post.title}
                      </p>
                      <p className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                        {post.excerpt}
                      </p>
                    </div>
                    <time
                      dateTime={post.publishedAt}
                      className="shrink-0 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]"
                    >
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              New posts are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Dig deeper
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Look up lab results anytime
            </p>
          </div>
          <Link href="/lab-results" className="btn-primary shrink-0">
            Lab results
          </Link>
        </div>
      </section>
    </>
  );
}
