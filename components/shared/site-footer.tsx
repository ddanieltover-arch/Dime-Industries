// components/shared/site-footer.tsx
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
            <p className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">DIME</p>
            <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              For use only by adults 21 and older, or qualifying medical patients.
              Keep out of reach of children.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[var(--scale-sm)] font-medium text-[var(--color-ink)]">{col.heading}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* License disclosure — required, per the reference-site research
            (dimeindustries.com footer convention) and SRS §7 */}
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          <p>Bud Technology Distribution — Adult and Medical — License C11-0001413-LIC (CA)</p>
          <p>Bud Technology Manufacturing — Adult and Medical — License CDPH-0003528 (CA)</p>
          <p className="mt-2">
            Massachusetts licensing information available at checkout for MA-fulfilled orders.
          </p>
          <p className="mt-4">© {new Date().getFullYear()} DIME Enterprise Commerce Platform.</p>
        </div>
      </div>
    </footer>
  );
}
