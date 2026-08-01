// components/shared/site-footer.tsx
import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/shop/vapes", label: "Vapes" },
      { href: "/shop/edibles", label: "Edibles" },
      { href: "/shop/prerolls", label: "Prerolls" },
      { href: "/shop/accessories", label: "Accessories" },
      { href: "/promotions", label: "Promotions" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/wholesale", label: "Wholesale" },
      { href: "/locations", label: "Find DIME" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { href: "/validate", label: "Validate" },
      { href: "/lab-results", label: "Lab Results" },
      { href: "/rewards", label: "Rewards" },
      { href: "/assistant", label: "AI Assistant" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie preferences" },
      { href: "/legal/returns", label: "Returns" },
      { href: "/legal/medical-privacy", label: "Medical Privacy" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url(/brand/concrete.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(201,177,56,0.1),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-[var(--container-pad-x)] pt-14 lg:pt-16">
        <div className="flex flex-col gap-8 border-b border-[var(--color-border)] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <div className="relative h-10 w-40">
              <Image
                src="/brand/logo.png"
                alt="DIME Industries"
                fill
                className="object-contain object-left"
                sizes="160px"
              />
            </div>
            <p className="mt-3 font-[var(--font-script)] text-[var(--scale-xl)] text-[var(--color-resin)]">
              Elevate your experience
            </p>
            <p className="mt-3 text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              Est. 2016 · Official site of DIME Industries
            </p>
            <p className="mt-4 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
              For use only by adults 21 and older, or qualifying medical patients. Keep out of reach of children.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            <Link href="/locations" className="btn-outline">
              Find DIME
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
            <div className="max-w-sm">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
                Licensing
              </p>
              <ul className="mt-4 space-y-1.5 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-soft)]" role="list">
                <li>CA: C11-0000470-LIC</li>
                <li>AZ: 00000040ESDX57445071</li>
                <li>OK: PAAA-VYX6-QCHO</li>
                <li>NM: CCD-MICB-2022-0043-MANU</li>
              </ul>
            </div>
            <div className="max-w-xl space-y-2 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-muted)]">
              <p>Bud Technology Distribution — Adult and Medical — License C11-0001413-LIC (CA)</p>
              <p>Bud Technology Manufacturing — Adult and Medical — License CDPH-0003528 (CA)</p>
              <p>Massachusetts licensing information available at checkout for MA-fulfilled orders.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            © {year} DIME Industries. 21+ only.
          </p>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Lab-tested · Licensed · Award-winning
          </p>
        </div>
      </div>
    </footer>
  );
}
