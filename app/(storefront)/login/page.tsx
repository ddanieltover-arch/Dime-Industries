// app/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/account";
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <LoginForm
      nextPath={next.startsWith("/") ? next : "/account"}
      supabaseConfigured={isSupabaseConfigured()}
      errorParam={error}
    />
  );
}
