// components/admin/ops-admin-forms.tsx
"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/(admin)/actions";
import { saveCategoryAction } from "@/app/(admin)/ops-actions";
import type { AdminCategoryRow } from "@/lib/admin/categories-store";

const initial: AdminActionState = {};

function Feedback({ state }: { state: AdminActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-[var(--scale-xs)] text-[var(--color-flag)]">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="text-[var(--scale-xs)] text-[var(--color-terp)]">
        {state.message}
      </p>
    );
  }
  return null;
}

export function CategoryForm({ category }: { category: AdminCategoryRow }) {
  const [state, action, pending] = useActionState(saveCategoryAction, initial);
  return (
    <form action={action} className="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <input type="hidden" name="slug" value={category.slug} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            /shop/{category.slug}
          </p>
          <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            {category.activeCount} active · {category.productCount} products
          </p>
        </div>
        <a
          href={category.href}
          className="text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
        >
          View shop
        </a>
      </div>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Display name
        <input
          name="name"
          defaultValue={category.name}
          required
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={category.sortOrder}
            className="mt-1 w-24 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>
        <label className="flex items-center gap-2 pb-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input type="checkbox" name="hidden" defaultChecked={category.hidden} />
          Hidden in admin lists
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save category"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function ReportCsvButton({
  filename,
  csv,
  label,
}: {
  filename: string;
  csv: string;
  label: string;
}) {
  function download() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-3 py-1.5 text-[var(--scale-xs)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
    >
      {label}
    </button>
  );
}
