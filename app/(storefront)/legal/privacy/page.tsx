// app/legal/privacy/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DIME Industries collects, uses, and shares account, order, and device data — and how to make privacy requests.",
  alternates: { canonical: "/legal/privacy" },
};

export default async function PrivacyPage() {
  const page = await getCmsPage("legal/privacy");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="What we collect to run the storefront, how we use it, and how to make privacy requests."
      body={page.body}
      currentHref="/legal/privacy"
    />
  );
}
