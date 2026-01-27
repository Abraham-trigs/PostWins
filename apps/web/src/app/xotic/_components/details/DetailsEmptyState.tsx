// app/components/DetailsEmptyState.tsx — Wrapper empty state for the details panel using ChatEmptyState.

"use client";

import { ChatEmptyState } from "../chat/ChatEmptyState";
import { usePostWinStore } from "../chat/store/usePostWinStore";

/**
 * DetailsEmptyState
 * Purpose:
 * - Provides a bordered, padded container for empty-detail views
 * - Delegates actual messaging and CTA behavior to ChatEmptyState
 */
export function DetailsEmptyState() {
  const bootstrapPostWin = usePostWinStore((s) => s.bootstrapPostWin);

  return (
    <div className="h-full w-full p-4">
      <div className="h-full w-full rounded-[var(--xotic-radius)] border border-border bg-background overflow-hidden">
        <ChatEmptyState variant="tablet" onPrimaryAction={bootstrapPostWin} />
      </div>
    </div>
  );
}
