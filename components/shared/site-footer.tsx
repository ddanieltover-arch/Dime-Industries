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
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-14 lg:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <div className="relative h-9 w-36">
              <Image src="/brand/logo.png" alt="DIME" fill className="object-contain object-left" sizes="144px" />
            </div>
            <p className="mt-2 font-[var(--font-script)] text-[var(--scale-lg)] text-[var(--color-resin)]">
              Elevate your experience
            </p>
            <p className="mt-3 text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              Est. 2016 · Official site of DIME Industries
            </p>
            <p className="mt-4 max-w-xs text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
              For use only by adults 21 and older, or qualifying medical patients. Keep out of reach of children.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-8">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Licensing
          </p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2 text-[var(--scale-xs)] leading-relaxed">
            <div className="space-y-1 text-[var(--color-ink-soft)]">
              <p>CA: C11-0000470-LIC</p>
              <p>AZ: 00000040ESDX57445071</p>
              <p>OK: PAAA-VYX6-QCHO</p>
              <p>NM: CCD-MICB-2022-0043-MANU</p>
            </div>
            <div className="space-y-1 text-[var(--color-ink-muted)]">
              <p>Bud Technology Distribution — Adult and Medical — License C11-0001413-LIC (CA)</p>
              <p>Bud Technology Manufacturing — Adult and Medical — License CDPH-0003528 (CA)</p>
              <p>Massachusetts licensing information available at checkout for MA-fulfilled orders.</p>
            </div>
          </div>
          <p className="mt-6 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            © {new Date().getFullYear()} DIME Industries. 21+ only.
          </p>
        </div>
      </div>
    </footer>
  );
}
