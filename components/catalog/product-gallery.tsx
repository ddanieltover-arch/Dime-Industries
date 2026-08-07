// components/catalog/product-gallery.tsx
import Image from "next/image";

type Props = {
  /** Primary product image only — gallery thumbnails are not shown. */
  imageUrl?: string | null;
  productName: string;
  fallbackLabel: string;
};

export function ProductGallery({ imageUrl, productName, fallbackLabel }: Props) {
  if (!imageUrl) {
    return (
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface)]">
        <div className="flex h-full items-center justify-center font-[var(--font-display)] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {fallbackLabel}
        </div>
      </div>
    );
  }

  return (
    <figure className="group relative m-0 aspect-square overflow-hidden bg-[var(--color-surface)]">
      <Image
        src={imageUrl}
        alt={productName}
        fill
        priority
        className="object-contain p-8 transition-transform duration-500 ease-[var(--ease-out)] motion-safe:group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <figcaption className="sr-only">{productName}</figcaption>
    </figure>
  );
}
