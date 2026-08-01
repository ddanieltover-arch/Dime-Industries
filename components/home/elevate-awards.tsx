// components/home/elevate-awards.tsx
import Image from "next/image";
import Link from "next/link";

const GALLERY = [
  {
    src: "/brand/awards-hardware.webp",
    alt: "Industry award trophies on dark concrete",
    className: "col-span-2 aspect-[16/10]",
  },
  {
    src: "/brand/awards-medals.webp",
    alt: "Gold award medals and engraved plaque",
    className: "aspect-[4/5]",
  },
  {
    src: "/brand/awards.webp",
    alt: "DIME award-winning product lineup",
    className: "aspect-[4/5]",
  },
] as const;

export function ElevateAwards() {
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
            Innovation takes center stage. Our commitment to craft has earned recognition across
            leading industry publications — shop the lineup that set the bar.
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

        <div className="grid grid-cols-2 gap-3">
          {GALLERY.map((shot) => (
            <div key={shot.src} className={`relative overflow-hidden ${shot.className}`}>
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
