// app/(storefront)/layout.tsx
// Server Component chrome — header/footer stay out of the client graph.
// Admin lives outside this route group and keeps its own shell.

import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { PurchaseToastHost } from "@/components/social-proof/purchase-toast-host";
import { getSocialProofProducts } from "@/lib/social-proof/products";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const socialProofProducts = getSocialProofProducts();

  return (
    <>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <PurchaseToastHost products={socialProofProducts} />
    </>
  );
}
