"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";

export function MobileTopBar() {
  return (
    <header
      aria-label="Mobile top bar"
      className="
        h-[var(--xotic-topbar-h)] flex-shrink-0
        bg-surface
        border-b border-border
        px-[var(--xotic-pad-4)]
        flex items-center justify-between
      "
    >
      {/* Left: Back / context */}
      <button
        type="button"
        aria-label="Go back"
        className="
          h-9 w-9 rounded-full
          flex items-center justify-center
          text-ink
          hover:bg-surface-muted
          focus:outline-none focus-visible:ring-[var(--state-danger)]
        "
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Center: Title (context-aware later) */}
      <h1 className="text-sm font-semibold text-ink truncate">Conversations</h1>

      {/* Right: Overflow actions */}
      <button
        type="button"
        aria-label="More options"
        className="
          h-9 w-9 rounded-full
          flex items-center justify-center
          text-ink
          hover:bg-surface-muted
          focus:outline-none focus-visible:ring-[var(--state-danger)]
        "
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  );
}
