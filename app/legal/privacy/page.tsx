// app/legal/privacy/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DIME Industries collects and uses account, order, and device data.",
  alternates: { canonical: "/legal/privacy" },
};

export default async function PrivacyPage() {
  const page = await getCmsPage("legal/privacy");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="What we collect to run the storefront — and what we don't do with your information."
      body={page.body}
      currentHref="/legal/privacy"
    />
  );
}
