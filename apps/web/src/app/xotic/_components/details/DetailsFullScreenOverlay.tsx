// app/components/DetailsFullScreenOverlay.tsx — Fullscreen modal overlay for details panel with accessible close control.

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react"; // Lucide icon used to replace raw "×" for consistency and theming
import { DetailsPanelSelected } from "../details/DetailsPanelSelected";

type Props = {
  open: boolean; // Controls visibility of the fullscreen overlay
  onClose: () => void; // Callback invoked on backdrop click, Escape key, or close button
};

export function DetailsFullScreenOverlay({ open, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null); // Used to move focus on open for accessibility

  // Handle Escape-to-close, body scroll lock, and initial focus management
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Prevent background scroll while modal is open

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(); // Allow keyboard users to close reliably
    };

    window.addEventListener("keydown", onKeyDown);

    // Focus the close button once mounted (simple, predictable entry point)
    queueMicrotask(() => closeBtnRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow; // Restore previous scroll state
    };
  }, [open, onClose]);

  // Do not render anything when closed to avoid offscreen focus issues
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen details"
    >
      {/* Backdrop: clicking closes the overlay */}
      <div
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Foreground panel */}
      <section
        className={[
          "absolute inset-3 md:inset-6",
          "bg-paper border border-line shadow-card",
          "rounded-[var(--xotic-radius-lg)] overflow-hidden",
          "flex flex-col",
        ].join(" ")}
        // Stop click propagation so interacting inside doesn't trigger backdrop close
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="h-[var(--xotic-topbar-h)] border-b border-line/60 bg-paper flex items-center justify-between px-4">
          <div className="text-sm font-semibold text-ink/80">Details</div>

          {/* Close button */}
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="
        h-9 w-9 rounded-lg
        bg-surface border border-line
        transition-colors
        hover:bg-surface-muted
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        flex items-center justify-center
      "
          >
            <span className="sr-only">Close</span>
            <X
              size={18}
              strokeWidth={2.5}
              className="text-ink"
              aria-hidden="true"
            />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 min-h-0">
          {/* Pass undefined so nested panel doesn't render a dead fullscreen control */}
          <DetailsPanelSelected onOpenFullScreen={undefined} />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
Design reasoning
- Replacing the raw “×” character with a Lucide icon ensures visual consistency, theming alignment, and predictable sizing.
- The close button remains a real <button> with proper focus handling and Escape-key support, preserving accessibility.
- Focus is intentionally moved to the close button on open to give keyboard users a safe, obvious exit.

Structure
- DetailsFullScreenOverlay: controlled modal component driven by `open` and `onClose`.
- Internal refs/effects handle focus, keyboard interaction, and scroll locking.
- UI is split into Backdrop → Panel → Top bar → Body.

Implementation guidance
- If you later add a full focus trap, keep the initial focus on the close button as the entry anchor.
- You can swap Lucide icons globally without touching logic, keeping iconography consistent across modals.
- Ensure this component is mounted at a high layout level to avoid z-index conflicts.

Scalability insight
- This overlay can be generalized into a reusable `FullscreenDialog` that accepts a title and body slot.
- Centralizing modal behavior (scroll lock, Escape handling) reduces subtle UX bugs as more overlays are added.
-------------------------------------------------------------------------------------------------- */
