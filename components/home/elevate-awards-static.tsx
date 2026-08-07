// components/home/elevate-awards-static.tsx
import Image from "next/image";
import Link from "next/link";
import { ELEVATE_AWARDS_GALLERY } from "@/components/home/elevate-awards-data";

/** SSR / pre-hydrate shell — first gallery frame only, no autoplay JS. */
export function ElevateAwardsStatic() {
  const shot = ELEVATE_AWARDS_GALLERY[0]!;

  return (
    <section aria-labelledby="elevate-heading" className="relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src="/brand/awards-hardware.webp"
          alt=""
          fill
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="section-eyebrow">Elevate your experience</p>
          <h2 id="elevate-heading" className="section-title mt-3 text-white">
            Award-winning products
          </h2>
          <p className="mt-5 max-w-lg text-[var(--scale-base)] leading-relaxed text-white/75">
            Innovation takes center stage. Our commitment to excellence has earned recognition
            across leading industry publications — shop the lineup that set the bar for potent,
            delicious cannabis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            <Link href="/about" className="btn-outline-light">
              Our story
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
