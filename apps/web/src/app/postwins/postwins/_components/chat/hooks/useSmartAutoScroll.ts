"use client";

/**
 * ============================================================================
 * File: useSmartAutoScroll.ts
 * Purpose: Smart auto-scroll behavior for chat timeline.
 * ============================================================================
 *
 * Design reasoning:
 * - Detect if user is near bottom before auto-scrolling.
 * - Prevent scroll hijacking when user reads history.
 * - Works with optimistic and realtime messages.
 *
 * Scalability insight:
 * - O(1) math.
 * - No event flooding.
 * - Safe under rapid message bursts.
 */

import { useEffect, useRef } from "react";

type Params = {
  containerRef: React.RefObject<HTMLDivElement>;
  dependency: any; // usually messages.length
  threshold?: number; // px distance from bottom
};

export function useSmartAutoScroll({
  containerRef,
  dependency,
  threshold = 120,
}: Params) {
  const shouldAutoScrollRef = useRef(true);

  // Detect if user scrolls away from bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      shouldAutoScrollRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, threshold]);

  // Auto-scroll only if user was near bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (shouldAutoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dependency, containerRef]);
}

// ✅ How To Use It

// Inside your message container component:

// const { messages } = usePostWinStore();

// const {
//   containerRef,
//   captureHeight,
//   restoreScroll,
// } = usePrependScrollRestore();

// useSmartAutoScroll({
//   containerRef,
//   dependency: messages.length,
// });

// Your scroll container:

// <div ref={containerRef} className="overflow-y-auto h-full">
//   <div ref={sentinelRef} />
//   {messages.map(...)}
// </div>

// ✅ Step  — Render Divider

// Inside your message list:

// const { messages, unreadAnchorId } = usePostWinStore();

// {messages.map((m) => (
//   <React.Fragment key={m.id}>
//     {m.id === unreadAnchorId && (
//       <div className="flex items-center my-4">
//         <div className="flex-1 h-px bg-blue-500" />
//         <span className="px-3 text-xs font-medium text-blue-600">
//           New Messages
//         </span>
//         <div className="flex-1 h-px bg-blue-500" />
//       </div>
//     )}
//     <MessageBubble message={m} />
//   </React.Fragment>
// ))}

// ✅ Step  — Clear Divider When User Reaches Bottom

// Inside useSmartAutoScroll, modify:

// When user is near bottom:

// if (distanceFromBottom < threshold) {
//   shouldAutoScrollRef.current = true;
//   usePostWinStore.getState().setUnreadAnchor(null);
// }

// Now:

// User scrolls to bottom

// Divider disappears

// State remains deterministic
