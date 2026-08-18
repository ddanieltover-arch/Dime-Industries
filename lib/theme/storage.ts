// lib/theme/storage.ts
/** Same key next-themes used — keeps existing visitor prefs. */
export const THEME_STORAGE_KEY = "theme";

export type SiteTheme = "dark" | "light";

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return value === "dark" || value === "light";
}

/**
 * Blocking `<head>` boot — applies saved theme before paint.
 * Must be `(function(){...})()` — `(!function(){...})()` is `false()` and throws
 * `TypeError: (intermediate value) is not a function` on every page.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t="dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;
