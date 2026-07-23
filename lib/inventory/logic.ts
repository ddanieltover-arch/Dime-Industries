// lib/inventory/logic.ts
/** Pure helpers for reservation math (unit-tested). */

export type ReserveLine = { variantId: string; quantity: number };

export function canReserve(onHand: number, quantity: number): boolean {
  return quantity > 0 && onHand >= quantity;
}

export function applyReserve(onHand: number, quantity: number): number | null {
  if (!canReserve(onHand, quantity)) return null;
  return onHand - quantity;
}

export function applyRelease(onHand: number, quantity: number): number {
  return Math.max(0, onHand + Math.max(0, quantity));
}

/** Collapse duplicate variant lines before locking rows. */
export function collapseReserveLines(lines: ReserveLine[]): ReserveLine[] {
  const map = new Map<string, number>();
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    map.set(line.variantId, (map.get(line.variantId) ?? 0) + line.quantity);
  }
  return [...map.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}
