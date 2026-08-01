"use client";

import { cn } from "@/lib/utils";

/**
 * GradientBackground (gradient-background-4)
 *
 * A pure CSS radial gradient layer with no props, no state, no images.
 *
 * Positioning contract:
 *   - This element is `absolute inset-0`, so the parent MUST be `relative`
 *     (or `fixed`/`absolute`) and sized. Actual content should be `relative z-10`.
 *
 * Theming:
 *   - Light: soft #c7d2fe (indigo-100) bloom from 50% above viewport top.
 *   - Dark:  rgba(99,102,241,0.21) — translucent indigo-500 — same origin.
 *   - Switching is handled by `.gradient-bg-4` + `[data-theme="dark"] .gradient-bg-4`
 *     in globals.css (reliable; avoids Tailwind v4 arbitrary-value dark: issues).
 */
export const Component = ({ className }) => {
  return (
    <div
      className={cn(
        "gradient-bg-4",   // theming via globals.css [data-theme] selectors
        "absolute inset-0 h-full w-full pointer-events-none",
        className
      )}
      aria-hidden="true"
    />
  );
};
