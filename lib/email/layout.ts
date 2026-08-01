// lib/email/layout.ts
// Shared HTML shell for DIME transactional emails — dark brand header, light body.

import "server-only";

const BRAND = {
  bg: "#0e0e0e",
  surface: "#171616",
  resin: "#c9b138",
  resinStrong: "#e5bd6f",
  ink: "#171616",
  inkSoft: "#4e433c",
  muted: "#7a6f66",
  border: "#e8e4dc",
  cream: "#f5f2ea",
  white: "#ffffff",
  flag: "#8b232d",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function siteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dimeindustries.us");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type EmailLayoutInput = {
  preheader?: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
};

/** Professional transactional layout with DIME brand chrome. */
export function emailLayout(input: EmailLayoutInput): string {
  const preheader = escapeHtml(input.preheader ?? "");
  const eyebrow = input.eyebrow ? escapeHtml(input.eyebrow) : null;
  const title = escapeHtml(input.title);
  const year = new Date().getFullYear();
  const shop = siteUrl("/shop");
  const contact = siteUrl("/contact");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};color:${BRAND.ink};font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};">
          <tr>
            <td style="background:${BRAND.bg};padding:28px 32px;border-bottom:3px solid ${BRAND.resin};">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND.resin};">DIME Industries</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a;">Licensed cannabis · Craft hardware</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;">
              ${eyebrow ? `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.resin};">${eyebrow}</p>` : ""}
              <h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.ink};font-weight:700;">${title}</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${BRAND.inkSoft};">
                ${input.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top:20px;border-top:1px solid ${BRAND.border};">
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                      ${input.footerNote ? escapeHtml(input.footerNote) : "Questions? Reply to this email or reach support@dimeindustries.us."}
                    </p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                      <a href="${shop}" style="color:${BRAND.ink};text-decoration:underline;">Shop</a>
                      &nbsp;·&nbsp;
                      <a href="${contact}" style="color:${BRAND.ink};text-decoration:underline;">Contact</a>
                      &nbsp;·&nbsp;
                      © ${year} DIME Industries
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailTable(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};vertical-align:top;">${row.value}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">${cells}</table>`;
}

export function ctaButton(label: string, href: string): string {
  return `<p style="margin:28px 0 8px;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.resin};color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:14px 22px;">${escapeHtml(label)}</a>
  </p>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`;
}

export function mutedNote(text: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">${text}</p>`;
}

export { BRAND };
