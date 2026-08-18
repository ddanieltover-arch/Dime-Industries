// components/social-proof/purchase-toast-boundary.tsx
"use client";

import { Component, type ReactNode } from "react";

/** Isolates purchase-toast failures so they cannot take down storefront chrome. */
export class PurchaseToastBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
