"use client";

/**
 * ============================================================================
 * File: usePrependScrollRestore.ts
 * Purpose: Preserve scroll position when older messages are prepended.
 * ============================================================================
 *
 * Design reasoning:
 * - Captures container scrollHeight before load.
 * - After prepend, adjusts scrollTop by delta.
 * - Prevents visual jump.
 * - Works with infinite scroll at top.
 *
 * Scalability insight:
 * - O(1) math.
 * - No forced reflows beyond natural layout.
 * - Safe under high-frequency pagination.
 */

import { useRef } from "react";

export function usePrependScrollRestore() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousHeightRef = useRef<number>(0);

  const captureHeight = () => {
    if (!containerRef.current) return;
    previousHeightRef.current = containerRef.current.scrollHeight;
  };

  const restoreScroll = () => {
    if (!containerRef.current) return;

    const newHeight = containerRef.current.scrollHeight;
    const heightDelta = newHeight - previousHeightRef.current;

    containerRef.current.scrollTop += heightDelta;
  };

  return {
    containerRef,
    captureHeight,
    restoreScroll,
  };
}

// ✅ How To Wire It With Infinite Scroll

// Inside your message list component:

// const {
//   fetchMoreMessages,
//   hasMore,
//   isFetchingMore,
// } = usePostWinStore();

// const {
//   containerRef,
//   captureHeight,
//   restoreScroll,
// } = usePrependScrollRestore();

// const { sentinelRef } = useInfiniteScroll({
//   enabled: hasMore && !isFetchingMore,
//   onLoadMore: async () => {
//     captureHeight();
//     await fetchMoreMessages(caseId);
//     restoreScroll();
//   },
//   root: containerRef.current,
// });

// Render:

// <div ref={containerRef} className="overflow-y-auto h-full">
//   <div ref={sentinelRef} />
//   {messages.map(...)}
// </div>
