// app/components/ChatEmptyState.tsx
// Purpose: Accessible empty state for the chat panel with integrated case-start flow.

"use client";

import { MessageSquareText } from "lucide-react";
import { PrimaryActionButton } from "@ui/chat/UI/common/PrimaryActionButton";
import { usePostWinStore } from "@postwin-store/usePostWinStore";

/**
 * Assumptions
 * - usePostWinStore exists and exposes:
 *   - setComposerMode(mode: "record" | ...)
 *   - appendText(role, text, mode)
 * - PrimaryActionButton supports { label, onClick }
 */

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

  /**
   * Chat store integration
   * Enables launching the intake flow directly
   * from the empty state panel.
   */
  const setComposerMode = usePostWinStore((s) => s.setComposerMode);
  const appendMessage = usePostWinStore((s) => s.appendMessage);
  /**
   * Handles start-case action.
   *
   * Priority:
   * 1. Use external handler if parent overrides it
   * 2. Otherwise trigger built-in intake flow
   */
  function handleStartCase() {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }

    // Switch chat composer into "record" mode
    setComposerMode("record");

    // Insert system starter message into thread
    appendMessage({
      id: crypto.randomUUID(),
      kind: "text",
      role: "system",
      mode: "record",
      text: "Let's create a new case. I’ll ask a few questions to get started.",
      createdAt: new Date().toISOString(),
    });
  }

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

        {/* Primary action */}
        <div className="mt-6 flex justify-center">
          <PrimaryActionButton
            label={primaryActionLabel}
            onClick={handleStartCase}
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

/*
Design reasoning
The empty state is used as a controlled entry point for starting a new case. Instead of forcing upstream logic to inject a handler, the component safely triggers the intake flow using the chat store. This keeps UX responsive while allowing optional override behavior when embedded in other flows.

Structure
- ChatEmptyState component
- Store integration via usePostWinStore
- handleStartCase helper for default intake flow
- Accessible UI layout with visual anchor and CTA

Implementation guidance
Place this component inside the chat thread panel container when no conversation is selected. The store-driven action allows the system to immediately transition the composer into "record" mode and seed the system message that begins the intake conversation.

Scalability insight
If additional onboarding flows (e.g., "Start Verification", "Submit Evidence") are introduced later, the same pattern can extend with variant actions while keeping the UI component stable and store-driven.
*/
