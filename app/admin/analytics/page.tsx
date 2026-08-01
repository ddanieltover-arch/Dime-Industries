// app/admin/analytics/page.tsx
// Analytics/sales = dashboard KPIs only — no separate analytics product.
import { redirect } from "next/navigation";

export default function AdminAnalyticsRedirectPage() {
  redirect("/admin");
}
