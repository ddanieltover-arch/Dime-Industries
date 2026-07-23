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
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/wholesale", label: "Wholesale" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/locations", label: "Store Locator" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/medical-privacy", label: "Medical Privacy" },
      { href: "/legal/returns", label: "Returns" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="relative h-8 w-32">
              <Image src="/brand/logo.png" alt="DIME" fill className="object-contain object-left" sizes="128px" />
            </div>
            <p className="mt-4 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-soft)]">
              For use only by adults 21 and older, or qualifying medical patients. Keep out of reach of children.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
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

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          <p>Bud Technology Distribution — Adult and Medical — License C11-0001413-LIC (CA)</p>
          <p>Bud Technology Manufacturing — Adult and Medical — License CDPH-0003528 (CA)</p>
          <p className="mt-2">Massachusetts licensing information available at checkout for MA-fulfilled orders.</p>
          <p className="mt-4">© {new Date().getFullYear()} DIME Industries.</p>
        </div>
      </div>
    </footer>
  );
}
