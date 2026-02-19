// app/components/chat/ModeTab.tsx
"use client";

import type { ReactNode } from "react";

export function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "h-8 px-3 rounded-full text-[11px] font-semibold tracking-wide",
        "transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
        active
          ? "bg-ocean text-ink"
          : "bg-transparent text-ink/80 hover:bg-surface",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
