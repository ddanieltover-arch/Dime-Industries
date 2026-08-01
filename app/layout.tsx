// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { CartShell } from "@/components/cart/cart-shell";
import { PwaClient } from "@/components/pwa/pwa-client";
import { CookieBannerHost } from "@/components/consent/cookie-banner-host";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dimeindustries.us"),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CartShell>
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <PwaClient />
            <CookieBannerHost />
          </CartShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
