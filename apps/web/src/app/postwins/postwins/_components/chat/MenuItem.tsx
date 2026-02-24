// app/components/chat/MenuItem.tsx
"use client";

import type { ReactNode } from "react";

export function MenuItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3",
        "rounded-[var(--xotic-radius-sm)] px-3 py-2",
        "text-sm text-ink",
        "hover:bg-surface-muted transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-danger)]",
      ].join(" ")}
    >
      <span className="text-ink/70">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
