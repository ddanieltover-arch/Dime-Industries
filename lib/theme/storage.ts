// lib/theme/storage.ts
/** Same key next-themes used — keeps existing visitor prefs. */
export const THEME_STORAGE_KEY = "theme";

export type SiteTheme = "dark" | "light";

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return value === "dark" || value === "light";
}
