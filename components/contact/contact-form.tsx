// components/contact/contact-form.tsx
"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactActionState } from "@/app/(marketing)/contact-actions";
import { BRAND_EMAIL } from "@/lib/brand/email";

const initial: ContactActionState = {};

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);

  if (state.success) {
    return (
      <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
        Message sent. Check your inbox for a confirmation — we&apos;ll reply from {BRAND_EMAIL}.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Name
        <input name="name" required minLength={2} className="field-input mt-1.5" autoComplete="name" />
        {state.fieldErrors?.name?.[0] ? (
          <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Email
        <input
          name="email"
          type="email"
          required
          className="field-input mt-1.5"
          autoComplete="email"
        />
        {state.fieldErrors?.email?.[0] ? (
          <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.email[0]}</span>
        ) : null}
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Subject
        <input name="subject" required minLength={3} className="field-input mt-1.5" />
        {state.fieldErrors?.subject?.[0] ? (
          <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.subject[0]}</span>
        ) : null}
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Order ID <span className="text-[var(--color-ink-muted)]">(optional)</span>
        <input name="orderId" className="field-input mt-1.5" placeholder="ord_…" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Message
        <textarea name="message" required minLength={10} rows={6} className="field-input mt-1.5" />
        {state.fieldErrors?.message?.[0] ? (
          <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.message[0]}</span>
        ) : null}
      </label>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
