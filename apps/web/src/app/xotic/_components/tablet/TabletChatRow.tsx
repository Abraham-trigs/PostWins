"use client";

type Props = {
  active?: boolean;
  onSelect?: () => void;
};

/**
 * TabletChatRow
 * - Base surface: surface
 * - Interaction surface only: surface-muted
 * - High used only as micro-accent (active rail)
 * - No skeleton theatrics, just calm tablet rhythm
 */
export function TabletChatRow({ active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={active ? "Deselect chat" : "Select chat"}
      className={[
        // Layout + a11y
        "w-full text-left transition-colors",
        "focus:outline-none focus-visible:ring-[var(--state-danger)]",

        // Surface discipline
        active ? "bg-surface-muted" : "bg-surface hover:bg-surface-muted/70",
      ].join(" ")}
    >
      <div className="relative w-full flex items-center gap-3 px-4 py-3">
        {/* Active indicator (micro-accent only) */}
        <span
          aria-hidden="true"
          className={[
            "absolute left-0 top-2 bottom-2 w-1 rounded-r",
            active ? "bg-red" : "bg-transparent",
          ].join(" ")}
        />

        {/* Avatar placeholder (base surface = surface) */}
        <div
          className={[
            "h-12 w-12 rounded-full border flex-shrink-0",
            "bg-surface border-border/25",
          ].join(" ")}
        />

        {/* Text blocks (base = surface, interaction = surface-muted) */}
        <div className="min-w-0 flex-1">
          <div
            className={[
              "h-4 w-40 max-w-[70%] rounded border",
              active
                ? "bg-surface-muted border-border/35"
                : "bg-surface border-border/25",
            ].join(" ")}
            aria-hidden="true"
          />
          <div
            className={[
              "mt-2 h-3 w-56 max-w-[85%] rounded border",
              active
                ? "bg-surface-muted/80 border-border/35"
                : "bg-surface border-border/25",
            ].join(" ")}
            aria-hidden="true"
          />
        </div>

        {/* Time / badge placeholders */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div
            className={[
              "h-3 w-10 rounded border",
              active
                ? "bg-surface-muted/80 border-border/35"
                : "bg-surface border-border/25",
            ].join(" ")}
            aria-hidden="true"
          />
          <div
            className={[
              "h-5 w-5 rounded-full border",
              active
                ? "bg-surface-muted border-border/35"
                : "bg-surface border-border/25",
            ].join(" ")}
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  );
}
