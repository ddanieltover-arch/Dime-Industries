// lib/theme/storage.ts
/** Bumped key — old dark/light prefs must not paint the retired dark concrete theme. */
export const THEME_STORAGE_KEY = "theme-retail-v1";

/** Single storefront theme after clean-retail redesign. */
export type SiteTheme = "retail";

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return value === "retail";
}

/**
 * Blocking `<head>` boot — applies retail theme before paint.
 * Must be `(function(){...})()` — `(!function(){...})()` is `false()` and throws
 * `TypeError: (intermediate value) is not a function` on every page.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-theme","retail");try{localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},"retail");}catch(e){}}catch(e){document.documentElement.setAttribute("data-theme","retail");}})();`;
