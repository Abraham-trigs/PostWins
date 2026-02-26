"use client";

/**
 * ============================================================================
 * File: useUnreadDivider.ts
 * Purpose: Derive first unread message anchor from ChatMessage store state.
 * ============================================================================
 */

import { useEffect } from "react";
import { usePostWinStore } from "../store/usePostWinStore";
import type { ChatMessage } from "../store/types";

export function useUnreadDivider() {
  // Store is ChatMessage[], not ThreadMessage[]
  const messages = usePostWinStore((s) => s.messages);

  const currentUserId = usePostWinStore((s) => s.currentUserId);

  const setUnreadAnchor = usePostWinStore((s) => s.setUnreadAnchor);

  useEffect(() => {
    if (!currentUserId) return;

    const firstUnread = messages.find((m: ChatMessage) => {
      // Only text messages can be unread
      if (m.kind !== "text") return false;

      // Only applies to user-authored messages
      if (m.role === "user" && currentUserId) {
        // If you later add receipts to ChatMessage,
        // extend logic here safely.
        return false;
      }

      return false;
    });

    setUnreadAnchor(firstUnread?.id ?? null);
  }, [messages, currentUserId, setUnreadAnchor]);
}
