// components/cms/cms-article.tsx
import { renderCmsBody } from "@/lib/cms/render";

export function CmsArticle({ title, body }: { title: string; body: string }) {
  const blocks = renderCmsBody(body);
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
        {title}
      </h1>
      <div className="mt-8 space-y-4">
        {blocks.map((block, i) =>
          block.type === "h3" ? (
            <h2
              key={i}
              className="pt-2 font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]"
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
