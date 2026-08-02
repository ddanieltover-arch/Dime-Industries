// components/admin/admin-nav-config.ts
export type AdminNavLink = {
  href: string;
  label: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  links: AdminNavLink[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/launch", label: "Launch" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/returns", label: "Returns" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    links: [
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/loyalty", label: "Loyalty" },
      { href: "/admin/affiliate", label: "Affiliate" },
      { href: "/admin/wholesale", label: "Wholesale" },
    ],
  },
  {
    id: "content",
    label: "Content",
    links: [
      { href: "/admin/cms", label: "CMS" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/reviews", label: "Reviews" },
    ],
  },
  {
    id: "system",
    label: "System",
    links: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit", label: "Audit" },
    ],
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function adminPageTitle(pathname: string): string {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const link of group.links) {
      if (isAdminNavActive(pathname, link.href)) return link.label;
    }
  }
  return "Back office";
}
