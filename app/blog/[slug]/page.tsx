// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { ContentByline } from "@/components/seo/content-byline";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildFaqPageJsonLd, parseBlogFaqSection } from "@/lib/cms/faq";
import { getBlogPost, listBlogPosts } from "@/lib/cms/store";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildHowToJsonLd,
  SPOT_FAKE_HOWTO_STEPS,
} from "@/lib/seo/json-ld";
import { blogSidebarLinks, pickRelatedPosts } from "@/lib/seo/related-posts";
import { outboundCitationsFor } from "@/lib/seo/outbound-citations";
import { absoluteUrl } from "@/lib/seo/site";
import { OutboundCitations } from "@/components/seo/outbound-citations";

type Params = Promise<{ slug: string }>;

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

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

  const allPosts = await listBlogPosts();
  const index = allPosts.findIndex((p) => p.slug === post.slug);
  const prev = index >= 0 ? allPosts[index + 1] ?? null : null;
  const next = index > 0 ? allPosts[index - 1] ?? null : null;
  const related = pickRelatedPosts(post.slug, allPosts, 3);
  const sidebarLinks = blogSidebarLinks(post.slug);
  const outbound = outboundCitationsFor(post.slug);

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

  const howToJsonLd =
    post.slug === "how-to-spot-fake-dime-carts"
      ? buildHowToJsonLd({
          name: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          steps: SPOT_FAKE_HOWTO_STEPS,
        })
      : post.slug === "how-to-use-a-dime-cart"
        ? buildHowToJsonLd({
            name: post.title,
            description: post.excerpt,
            url: `/blog/${post.slug}`,
            steps: [
              {
                name: "Buy licensed and validate",
                text: "Purchase from a licensed retailer, then scratch and verify the package code on Validate.",
              },
              {
                name: "Charge and attach",
                text: "Charge a DIME or compatible 510 battery, then thread the cart on straight until contacts seat.",
              },
              {
                name: "Start mid heat and draw slowly",
                text: "Begin on a mid heat preset and take slow draws; adjust heat only as needed.",
              },
              {
                name: "Store upright",
                text: "Power off and store the cart upright between sessions.",
              },
            ],
          })
        : post.slug === "how-to-charge-a-dime-battery"
          ? buildHowToJsonLd({
              name: post.title,
              description: post.excerpt,
              url: `/blog/${post.slug}`,
              steps: [
                { name: "Power off if needed", text: "Power the device off if your model has a switch or timeout." },
                { name: "Connect USB-C", text: "Connect USB-C to the battery or all-in-one charge port." },
                { name: "Use a known-good adapter", text: "Use a known-good wall adapter and avoid damaged cables." },
                { name: "Charge fully", text: "Charge until indicators show ready; do not leave on unsafe chargers overnight." },
                { name: "Reseat the cart", text: "Disconnect, then reseat the cart before your next session." },
              ],
            })
          : post.slug === "why-is-my-dime-cart-clogged"
            ? buildHowToJsonLd({
                name: post.title,
                description: post.excerpt,
                url: `/blog/${post.slug}`,
                steps: [
                  { name: "Warm gently", text: "Warm the cart gently in a pocket — never use open flame." },
                  { name: "Clear the mouthpiece", text: "Clear the mouthpiece carefully without sharp tools that damage seals." },
                  { name: "Reseat on charged battery", text: "Reseat on a fully charged battery and start on mid heat." },
                  { name: "Take slow pulls", text: "Take slow pulls and avoid rapid chain hits." },
                  { name: "Validate if still blocked", text: "If airflow stays blocked, stop and validate authenticity." },
                ],
              })
            : null;

  const published = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const updated = new Date(post.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const showUpdated =
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 60_000;

  return (
    <>
      <JsonLdScript data={blogPosting} />
      <JsonLdScript data={breadcrumbs} />
      {faqJsonLd ? <JsonLdScript data={faqJsonLd} /> : null}
      {howToJsonLd ? <JsonLdScript data={howToJsonLd} /> : null}

      <section className="relative isolate min-h-[min(48vh,420px)] overflow-hidden border-b border-[var(--color-border)]">
        <Image
          src="/brand/awards-hardware.webp"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(201,177,56,0.14),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(48vh,420px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-24 sm:pb-16 sm:pt-28">
          <nav aria-label="Breadcrumb" className="text-[var(--scale-sm)] text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-[var(--color-resin)]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-[var(--color-resin)]">
                  Blog
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="max-w-[12rem] truncate text-white/90 sm:max-w-xs" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          <p className="section-eyebrow mt-8">DIME</p>
          <p className="mt-3 font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            <time dateTime={post.publishedAt}>Published {published}</time>
            {showUpdated ? (
              <>
                {" · "}
                <time dateTime={post.updatedAt}>Last updated {updated}</time>
              </>
            ) : null}
          </p>
          <h1 className="mt-3 max-w-3xl font-[var(--font-display)] text-[clamp(1.75rem,4.5vw,3.25rem)] uppercase leading-[1.02] tracking-[0.04em] text-white">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-white/80">
            {post.excerpt}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#article" className="btn-primary">
              Read article
            </a>
            <Link href="/blog" className="btn-outline-light">
              All posts
            </Link>
          </div>
        </div>
      </section>

      <section id="article" className="scroll-mt-24 bg-[var(--color-bg)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
          <article>
            <BlogArticle body={post.body} />
            <ContentByline publishedAt={post.publishedAt} updatedAt={post.updatedAt} />
            <OutboundCitations citations={outbound} />

            <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:justify-between">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="group max-w-sm">
                  <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    Older
                  </p>
                  <p className="mt-2 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.04em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                    ← {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/blog/${next.slug}`} className="group max-w-sm sm:text-right">
                  <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                    Newer
                  </p>
                  <p className="mt-2 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.04em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                    {next.title} →
                  </p>
                </Link>
              ) : null}
            </div>
          </article>

          <aside className="h-fit lg:sticky lg:top-24">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Keep exploring
            </p>
            <ul className="mt-4 space-y-px bg-[var(--color-border)]" role="list">
              {sidebarLinks.map((link) => (
                <li key={link.href} className="bg-[var(--color-surface)] p-4">
                  <Link
                    href={link.href}
                    className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                  >
                    {link.label}
                  </Link>
                  <p className="mt-2 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-soft)]">
                    {link.body}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12">
            <h2
              id="related-heading"
              className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]"
            >
              More from the blog
            </h2>
            <ul className="mt-6 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
              {related.map((item) => (
                <li key={item.slug} className="bg-[var(--color-bg)] p-5 sm:p-6">
                  <Link href={`/blog/${item.slug}`} className="group block">
                    <time
                      dateTime={item.publishedAt}
                      className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]"
                    >
                      {new Date(item.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <p className="mt-2 font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.04em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-resin)]">
                      {item.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                      {item.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              className="mt-8 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
            >
              All posts →
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
