// components/shared/theme-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { headerIconBtnClass, MoonIcon, SunIcon } from "@/components/shared/header-icons";
import { isSiteTheme, THEME_STORAGE_KEY, type SiteTheme } from "@/lib/theme/storage";

function readTheme(): SiteTheme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  if (isSiteTheme(attr)) return attr;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isSiteTheme(stored)) return stored;
  } catch {
    // ignore
  }
  return "dark";
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

/** Tiny theme toggle — no provider / next-themes. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<SiteTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const next: SiteTheme = isDark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={headerIconBtnClass}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
