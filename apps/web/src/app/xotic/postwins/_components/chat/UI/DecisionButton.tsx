"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger";

type DecisionButtonProps = {
  variant?: Variant;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-red/90 focus-visible:ring-red",
  secondary:
    "bg-surface border border-line/50 text-ink hover:bg-surface-strong",
  danger:
    "bg-[var(--state-danger)] text-white hover:bg-[var(--state-danger)]/90",
};

export function DecisionButton({
  variant = "secondary",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: DecisionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-full px-4 py-2 text-xs font-semibold",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "transition-colors",

        VARIANT_STYLES[variant],

        isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "",

        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Processing…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
