// app/components/ChatEmptyState.tsx — Calm, accessible empty state for the chat thread panel (tablet/desktop)

"use client";

import { MessageSquareText } from "lucide-react";
import { PrimaryActionButton } from "../ui/PrimaryActionButton";

type Variant = "tablet" | "desktop";

type ChatEmptyStateProps = {
  variant: Variant;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

export function ChatEmptyState({
  variant,
  onPrimaryAction,
  primaryActionLabel = "Start New PostWin",
}: ChatEmptyStateProps) {
  const isDesktop = variant === "desktop";

  return (
    <section
      className="h-full w-full flex items-center justify-center p-[var(--xotic-pad-6)]"
      aria-label="Empty selection"
    >
      <div
        className={[
          "w-full border border-line/50 bg-surface rounded-[var(--xotic-radius-lg)]",
          "p-[var(--xotic-pad-6)]",
          "shadow-card",
          isDesktop ? "max-w-xl" : "max-w-md",
        ].join(" ")}
      >
        {/* Visual anchor */}
        <div className="flex items-center justify-center">
          <div
            aria-hidden="true"
            className={[
              "grid place-items-center",
              "border border-line/50 bg-surface-muted",
              "rounded-[var(--xotic-radius)]",
              isDesktop ? "h-28 w-28" : "h-24 w-24",
            ].join(" ")}
          >
            <div className="relative grid place-items-center">
              <MessageSquareText
                className="h-8 w-8 text-ocean"
                aria-hidden="true"
              />
              <span
                className="absolute -z-10 h-14 w-14 rounded-full bg-ocean/15"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="mt-6 text-center">
          <h2 className="text-base font-semibold text-ink">
            Select a conversation
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Choose a project thread on the left to view updates, coordinate
            stakeholders, and keep the record clean.
          </p>
        </div>

        {/* Primary action (updated) */}
        <div className="mt-6 flex justify-center">
          <PrimaryActionButton
            label={primaryActionLabel}
            onClick={onPrimaryAction ?? (() => {})}
            disabled={!onPrimaryAction}
          />
        </div>

        {/* Micro-hint */}
        <p className="mt-4 text-center text-xs text-ink/55">
          Tip: use threads to track decisions, deliveries, and verification in
          one place.
        </p>
      </div>
    </section>
  );
}
