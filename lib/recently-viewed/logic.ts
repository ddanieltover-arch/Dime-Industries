// lib/recently-viewed/logic.ts
export const RECENT_MAX = 12;

export function pushRecentSlug(slugs: string[], slug: string, max = RECENT_MAX): string[] {
  const without = slugs.filter((s) => s !== slug);
  return [slug, ...without].slice(0, max);
}
