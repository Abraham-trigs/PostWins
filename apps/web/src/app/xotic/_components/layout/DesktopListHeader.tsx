"use client";

/**
 * DesktopListHeader
 * - Strictly using NGO palette colors One-Five
 * - No shadows, flat design
 * - Density aware via xotic tokens
 */
export function DesktopListHeader() {
  return (
    <div className="sticky top-0 z-10 bg-paper">
      {/* Top strip (matches rail height) */}
      <div className="h-[var(--xotic-topbar-h)] border-b border-line/40 bg-surface-muted" />

      {/* Search Bar - Color Three surface */}
      <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
        <div
          aria-label="Search"
          className="h-10 w-full rounded-pill bg-surface border border-line/40"
        />
      </div>

      {/* Tabs - Interactive Color Three */}
      <div className="px-[var(--xotic-pad-4)] pb-[var(--xotic-pad-3)]">
        <div className="flex gap-2 overflow-hidden">
          {/* Active tab */}
          <div className="h-8 w-16 flex-shrink-0 rounded-pill bg-surface-strong text-ink border border-line/60" />

          {/* Inactive tabs */}
          <div className="h-8 w-24 flex-shrink-0 rounded-pill bg-surface border border-line/40" />
          <div className="h-8 w-24 flex-shrink-0 rounded-pill bg-surface border border-line/40" />
          <div className="h-8 w-24 flex-shrink-0 rounded-pill bg-surface border border-line/40" />
          <div className="h-8 w-8 flex-shrink-0 rounded-pill bg-surface border border-line/40" />
        </div>
      </div>

      {/* Archived Row - Subtle Three surface */}
      <div className="px-[var(--xotic-pad-4)] pb-[var(--xotic-pad-3)]">
        <div
          aria-label="Archived chats"
          className="h-12 w-full rounded-[var(--xotic-radius-sm)] bg-surface-muted border border-line/40"
        />
      </div>

      <div className="border-b border-line/40" />
    </div>
  );
}
