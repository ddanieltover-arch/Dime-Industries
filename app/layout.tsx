// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { CartShell } from "@/components/cart/cart-shell";
import { PwaHost } from "@/components/pwa/pwa-host";
import { GoogleAnalyticsHost } from "@/components/analytics/google-analytics-host";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/json-ld";
import { THEME_STORAGE_KEY } from "@/lib/theme/storage";
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
  viewportFit: "cover",
};

const organizationJsonLd = buildOrganizationJsonLd();
const websiteJsonLd = buildWebSiteJsonLd();

/** Blocking boot — applies saved theme before paint (no next-themes provider). */
const themeBootScript = `(!function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t="dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link rel="preload" as="image" href="/brand/hero-poster.webp" fetchPriority="high" />
        <JsonLdScript data={organizationJsonLd} />
        <JsonLdScript data={websiteJsonLd} />
      </head>
      <body>
        <CartShell>
          {children}
          {/* PWA deferred until idle — see `PwaHost`. Cookie banner host omitted while disabled (restore via `CookieBannerHost`). */}
          <PwaHost />
          <GoogleAnalyticsHost />
        </CartShell>
      </body>
    </html>
  );
}
