// components/analytics/view-item-event.tsx
"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics/track";

type Props = {
  itemId: string;
  itemName: string;
  itemVariant?: string;
  priceUsd: number;
};

export function ViewItemEvent({
  itemId,
  itemName,
  itemVariant,
  priceUsd,
}: Props) {
  useEffect(() => {
    trackViewItem(
      {
        item_id: itemId,
        item_name: itemName,
        item_variant: itemVariant,
        price: priceUsd,
        quantity: 1,
      },
      priceUsd
    );
  }, [itemId, itemName, itemVariant, priceUsd]);

  return null;
}
