// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { StorefrontChrome } from "@/components/shared/storefront-chrome";
import { CartShell } from "@/components/cart/cart-shell";
import { PwaClient } from "@/components/pwa/pwa-client";
import { CookieBannerHost } from "@/components/consent/cookie-banner-host";
import { GoogleAnalyticsHost } from "@/components/analytics/google-analytics-host";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dimeindustries.us"),
  title: { default: "DIME Industries", template: "%s | DIME" },
  description:
    "Award-winning cannabis vapes, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  applicationName: "DIME Industries",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DIME",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/brand/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "DIME Industries",
    title: "DIME Industries",
    description: "Elevate your experience with award-winning DIME products.",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "DIME Industries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
    { media: "(prefers-color-scheme: light)", color: "#0e0e0e" },
  ],
  colorScheme: "dark",
};

const organizationJsonLd = buildOrganizationJsonLd();
const websiteJsonLd = buildWebSiteJsonLd();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/brand/hero-poster.webp" fetchPriority="high" />
        <JsonLdScript data={organizationJsonLd} />
        <JsonLdScript data={websiteJsonLd} />
      </head>
      <body>
        <ThemeProvider>
          <CartShell>
            <StorefrontChrome>
              <main id="main-content">{children}</main>
            </StorefrontChrome>
            <PwaClient />
            <CookieBannerHost />
            <GoogleAnalyticsHost />
          </CartShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
