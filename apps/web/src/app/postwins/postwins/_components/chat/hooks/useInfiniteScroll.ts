"use client";

/**
 * ============================================================================
 * File: useInfiniteScroll.ts
 * Purpose: Hardened infinite scroll trigger for message timeline.
 * ============================================================================
 *
 * Design reasoning:
 * - IntersectionObserver-based (no scroll event listeners).
 * - Single in-flight guard.
 * - Stable ref prevents double execution.
 * - Works with cursor-based pagination.
 *
 * Structure:
 * - useInfiniteScroll hook
 * - sentinelRef
 * - attach observer
 * - safe cleanup
 *
 * Scalability insight:
 * - No polling.
 * - No event flood.
 * - O(1) observer cost.
 */

import { useEffect, useRef } from "react";

type UseInfiniteScrollParams = {
  enabled: boolean;
  onLoadMore: () => Promise<void>;
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number;
};

export function useInfiniteScroll({
  enabled,
  onLoadMore,
  root = null,
  rootMargin = "150px",
  threshold = 0,
}: UseInfiniteScrollParams) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!sentinelRef.current) return;

    const node = sentinelRef.current;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;
        if (isLoadingRef.current) return;

        try {
          isLoadingRef.current = true;
          await onLoadMore();
        } finally {
          isLoadingRef.current = false;
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onLoadMore, root, rootMargin, threshold]);

  return { sentinelRef };
}

// ✅ How To Use It (MessageCanvas example)

// Inside your chat scroll container:

// const {
//   fetchMoreMessages,
//   hasMore,
//   isFetchingMore,
// } = usePostWinStore();

// const { sentinelRef } = useInfiniteScroll({
//   enabled: hasMore && !isFetchingMore,
//   onLoadMore: () => fetchMoreMessages(caseId),
//   root: scrollContainerRef.current,
// });

// At the top of the message list:

// <div ref={sentinelRef} />

// Important:

// Sentinel must be at the top (because we load older messages).
