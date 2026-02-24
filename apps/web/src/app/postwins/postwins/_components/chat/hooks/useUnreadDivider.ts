"use client";

/**
 * ============================================================================
 * File: useUnreadDivider.ts
 * Purpose: Derive first unread message anchor.
 * ============================================================================
 */

import { useEffect } from "react";
import { usePostWinStore } from "../store/usePostWinStore";

export function useUnreadDivider() {
  const { messages, currentUserId, setUnreadAnchor } = usePostWinStore();

  useEffect(() => {
    if (!currentUserId) return;

    const firstUnread = messages.find((m) => {
      if (m.authorId === currentUserId) return false;

      const receipt = m.receipts?.[currentUserId];
      return !receipt?.seenAt;
    });

    setUnreadAnchor(firstUnread?.id ?? null);
  }, [messages, currentUserId, setUnreadAnchor]);
}

// HOW TO USE IMPLEMENT
// ✅ Step 1 — Add unread anchor tracking to timeline slice

// Update:

// timeline.slice.ts

// Add this to TimelineSlice type:

// unreadAnchorId: string | null;
// setUnreadAnchor: (messageId: string | null) => void;

// Add implementation inside slice:

// unreadAnchorId: null,

// setUnreadAnchor: (messageId) =>
//   set(
//     { unreadAnchorId: messageId },
//     false,
//     "timeline/setUnreadAnchor",
//   ),
