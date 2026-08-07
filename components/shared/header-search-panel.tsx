// components/shared/header-search-panel.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { SearchSuggestion } from "@/lib/catalog/suggest";

type SuggestResponse = {
  query?: string;
  suggestions?: SearchSuggestion[];
  ageRequired?: boolean;
  error?: string;
};

const DEBOUNCE_MS = 220;
const MIN_CHARS = 2;

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Heavy search UI — loaded on demand from `HeaderSearch`. */
export function HeaderSearchPanel({ open, onClose }: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [ageRequired, setAgeRequired] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listOpen, setListOpen] = useState(false);

  const closePanel = useCallback(() => {
    setListOpen(false);
    setActiveIndex(-1);
    abortRef.current?.abort();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (rootRef.current?.contains(target)) return;
      // Trigger lives in the shell; don't treat it as an outside click.
      if (
        target instanceof Element &&
        target.closest('[aria-controls="header-search-panel"]')
      ) {
        return;
      }
      closePanel();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < MIN_CHARS) {
      setSuggestions([]);
      setListOpen(false);
      setLoading(false);
      setAgeRequired(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query)}&limit=8`,
          { signal: controller.signal, credentials: "same-origin" },
        );
        const data = (await res.json()) as SuggestResponse;
        if (controller.signal.aborted) return;
        setAgeRequired(Boolean(data.ageRequired) || res.status === 401);
        const next = Array.isArray(data.suggestions) ? data.suggestions : [];
        setSuggestions(next);
        setListOpen(next.length > 0 || Boolean(data.ageRequired));
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSuggestions([]);
        setListOpen(false);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [q, open]);

  function goToShop(query: string) {
    closePanel();
    if (!query) {
      router.push("/shop");
      return;
    }
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      const hit = suggestions[activeIndex]!;
      closePanel();
      router.push(hit.href);
      return;
    }
    goToShop(query);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!listOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (suggestions.length) setListOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? Math.max(0, suggestions.length - 1) : i - 1));
    } else if (e.key === "Home" && suggestions.length) {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End" && suggestions.length) {
      e.preventDefault();
      setActiveIndex(suggestions.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (listOpen) {
        setListOpen(false);
        setActiveIndex(-1);
      } else {
        closePanel();
      }
    }
  }

  if (!open) return null;

  const activeId =
    activeIndex >= 0 && suggestions[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={rootRef}>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
        aria-label="Close search"
        onClick={closePanel}
      />
      <div
        id="header-search-panel"
        className="fixed inset-x-3 top-[4.5rem] z-50 border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-elevated)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.5rem)] sm:w-[min(92vw,22rem)]"
      >
        <form role="search" onSubmit={submit} className="flex gap-2 p-2">
          <label htmlFor="header-search-input" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Strain, line, SKU…"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            role="combobox"
            aria-expanded={listOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            className="field-input field-control min-w-0 flex-1 px-3 py-2.5"
          />
          <button type="submit" className="btn-primary min-h-11 touch-manipulation px-4 py-2">
            Go
          </button>
        </form>

        {listOpen ? (
          <div
            id={listId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-[min(60vh,20rem)] overflow-y-auto overscroll-contain border-t border-[var(--color-border)]"
          >
            {ageRequired ? (
              <p className="px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Confirm you&apos;re 21+ to search the catalog.
              </p>
            ) : null}

            {!ageRequired && loading && suggestions.length === 0 ? (
              <p className="px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
                Searching…
              </p>
            ) : null}

            {!ageRequired && !loading && q.trim().length >= MIN_CHARS && suggestions.length === 0 ? (
              <p className="px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                No matches — press Go to search the shop.
              </p>
            ) : null}

            {suggestions.map((hit, index) => {
              const selected = index === activeIndex;
              const optionId = `${listId}-opt-${index}`;
              if (hit.kind === "product") {
                return (
                  <Link
                    key={`p-${hit.slug}`}
                    id={optionId}
                    role="option"
                    aria-selected={selected}
                    href={hit.href}
                    onClick={closePanel}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex min-h-14 items-center gap-3 px-3 py-2.5 transition-colors ${
                      selected
                        ? "bg-[var(--color-surface-raised)]"
                        : "hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden bg-[var(--color-surface)]">
                      {hit.imageUrl ? (
                        <Image
                          src={hit.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                        {hit.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                        {hit.line}
                        {hit.thcPct > 0 ? ` · THC ${hit.thcPct}%` : ""}
                      </span>
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={`${hit.kind}-${hit.slug}`}
                  id={optionId}
                  role="option"
                  aria-selected={selected}
                  href={hit.href}
                  onClick={closePanel}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex min-h-14 items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                    selected
                      ? "bg-[var(--color-surface-raised)]"
                      : "hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                      {hit.kind === "category" ? "Category" : "Line"}
                    </span>
                    <span className="mt-0.5 block truncate font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                      {hit.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                    Shop
                  </span>
                </Link>
              );
            })}

            {!ageRequired && q.trim().length >= MIN_CHARS ? (
              <button
                type="button"
                className="w-full border-t border-[var(--color-border)] px-4 py-3 text-left text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-resin)] hover:bg-[var(--color-surface)]"
                onClick={() => goToShop(q.trim())}
              >
                View all results for “{q.trim()}”
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
