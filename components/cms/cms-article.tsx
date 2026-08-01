// components/cms/cms-article.tsx
import { renderCmsBody } from "@/lib/cms/render";

export function CmsArticle({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const blocks = renderCmsBody(body);
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.06em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
        {title}
      </h1>
      <div className="mt-8 space-y-4">
        {blocks.map((block, i) =>
          block.type === "h3" ? (
            <h2
              key={i}
              className="pt-4 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-resin)]"
            >
              {block.text}
            </h2>
          ) : (
            <p key={i} className="text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              {block.text}
            </p>
          )
        )}
      </div>
    </article>
  );
}
