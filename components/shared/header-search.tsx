// components/shared/header-search.tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { headerIconBtnClass, SearchIcon } from "@/components/shared/header-icons";

const HeaderSearchPanel = dynamic(
  () =>
    import("@/components/shared/header-search-panel").then((m) => m.HeaderSearchPanel),
  { ssr: false },
);

function prefetchSearchPanel() {
  void import("@/components/shared/header-search-panel");
}

/** Eager search trigger — panel chunk loads on intent (hover/focus/open). */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [panelReady, setPanelReady] = useState(false);

  const ensurePanel = useCallback(() => {
    setPanelReady(true);
    prefetchSearchPanel();
  }, []);

  const toggle = useCallback(() => {
    ensurePanel();
    setOpen((v) => !v);
  }, [ensurePanel]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="header-search-panel"
        onClick={toggle}
        onPointerEnter={ensurePanel}
        onFocus={ensurePanel}
        className={`${headerIconBtnClass} touch-manipulation`}
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      {panelReady ? (
        <HeaderSearchPanel open={open} onClose={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
