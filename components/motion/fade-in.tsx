// components/motion/fade-in.tsx
import type { CSSProperties, ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds (API compatible with prior Framer usage). */
  delay?: number;
  /** Kept for API compat; CSS uses a fixed rise distance. */
  y?: number;
};

/** Mount-time entrance — Server Component safe (CSS animation). */
export function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
  const style: CSSProperties | undefined =
    delay > 0 ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined;

  return (
    <div className={`dime-fade-in ${className}`} style={style}>
      {children}
    </div>
  );
}

type FadeInStaggerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

/** Staggered mount entrance for hero eyebrow → title → body → CTAs. */
export function FadeInStagger({
  children,
  className = "",
  staggerDelay = 0.08,
}: FadeInStaggerProps) {
  const style = {
    ["--fade-stagger" as string]: `${Math.round(staggerDelay * 1000)}ms`,
  } as CSSProperties;

  return (
    <div className={`dime-fade-stagger ${className}`} style={style}>
      {children}
    </div>
  );
}

type FadeInItemProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInItem({ children, className = "" }: FadeInItemProps) {
  return <div className={`dime-fade-in-item ${className}`}>{children}</div>;
}
