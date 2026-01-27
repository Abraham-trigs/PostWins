"use client";

import { Search } from "lucide-react";

export function MobileSearch() {
  return (
    <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
      <div className="relative">
        {/* Search icon (inside input, left) */}
        <Search
          aria-hidden="true"
          className="
            absolute left-4 top-1/2 -translate-y-1/2
            h-4.5 w-4.5
            text-ink/60
          "
        />

        {/* Search input */}
        <input
          type="search"
          aria-label="Search conversations"
          placeholder="Search conversations…"
          className={[
            // Layout
            "h-11 w-full rounded-[var(--radius-pill)] pl-11 pr-4 text-sm",

            // Surface (same family as composer input)
            "bg-surface-muted",

            // Text
            "text-ink placeholder:text-ink/60",

            // Definition + focus
            "border border-border",
            "focus:outline-none focus-visible:ring-[var(--state-danger)]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
