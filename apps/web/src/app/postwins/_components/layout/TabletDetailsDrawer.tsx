"use client";

import { DetailsPanelSelected } from "../details/DetailsPanelSelected";

type Props = {
  open: boolean;
  caseId: string | null;
  onClose: () => void;
  onOpenFullScreen?: () => void;
};

/**
 * TabletDetailsDrawer
 * - Slide-in drawer for tablet layouts (right side)
 * - Uses dark surface system (one/two/four/five/high)
 * - Accessible: backdrop closes, Escape closes, focus rings visible
 */
export function TabletDetailsDrawer({
  open,
  caseId,
  onClose,
  onOpenFullScreen,
}: Props) {
  return (
    <div
      className={[
        "absolute inset-0 z-20",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close details backdrop"
        onClick={onClose}
        className={[
          "absolute inset-0 transition-opacity",
          "bg-paper/60",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Panel */}
      <aside
        aria-label="Details drawer"
        className={[
          "absolute inset-y-0 right-0 w-[360px] max-w-[92vw]",
          "bg-paper border-l border-line/50 shadow-lg",
          "transition-transform will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Top strip */}
        <div
          className={[
            "h-[var(--xotic-topbar-h)] flex items-center justify-end px-4 gap-2",
            "bg-surface-strong border-b border-line/50",
          ].join(" ")}
        >
          {onOpenFullScreen ? (
            <button
              type="button"
              aria-label="Open details in full screen"
              onClick={onOpenFullScreen}
              className={[
                "h-9 w-9 rounded-lg grid place-items-center",
                "bg-surface border border-line/50",
                "text-ink",
                "hover:bg-surface-muted transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ].join(" ")}
            >
              <ExpandIcon />
            </button>
          ) : (
            <div
              className={[
                "h-9 w-9 rounded-lg grid place-items-center",
                "bg-success border border-line/40",
                "text-ink/40",
              ].join(" ")}
              aria-hidden="true"
            >
              <ExpandIcon />
            </div>
          )}

          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className={[
              "h-9 w-9 rounded-lg grid place-items-center",
              "bg-surface border border-line/50",
              "text-ink",
              "hover:bg-surface-muted transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            ].join(" ")}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-var(--xotic-topbar-h))]">
          {caseId && <DetailsPanelSelected caseId={caseId} />}
        </div>
      </aside>
    </div>
  );
}

/* =========================
   Inline icons (no deps)
   ========================= */

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3H3v6" />
      <path d="M3 3l7 7" />
      <path d="M15 21h6v-6" />
      <path d="M21 21l-7-7" />
    </svg>
  );
}
