"use client";

/**
 * ============================
 * Design reasoning
 * ============================
 * Updated to support "View-Aware" real-time ingestion.
 * When a message arrives, we now check the user's active ViewToggle state
 * to trigger side-bar notifications for hidden content.
 */

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../types";
import type { ChatMessagesSlice } from "./chatMessages.slice";
import type { PostWinState } from "../usePostWinStore"; // 🚀 Import main state type

/* ============================
   Types
============================ */

export type PresenceUser = {
  userId: string;
  tenantId: string;
};

export interface ChatRealtimeSlice {
  /* ===== Real-time Message Handling ===== */
  applyWsMessage: (message: ChatMessage) => void;

  updateReceipt: (payload: {
    messageId: string;
    userId: string;
    deliveredAt?: string;
    seenAt?: string;
  }) => void;

  /* ===== Presence ===== */
  presence: PresenceUser[];
  setPresence: (users: PresenceUser[]) => void;

  /* ===== Typing ===== */
  typing: Record<string, boolean>;
  setTyping: (userId: string, isTyping: boolean) => void;

  /* ===== Unread ===== */
  unreadCount: number;
  incrementUnread: (delta: number) => void;
  resetUnread: () => void;
}

/* ============================
   Implementation
============================ */

export const createChatRealtimeSlice: StateCreator<
  ChatMessagesSlice & ChatRealtimeSlice & PostWinState, // 🚀 Bind to full state for notify logic
  [["zustand/devtools", never]],
  [],
  ChatRealtimeSlice
> = (set, get) => ({
  /* ================= Presence ================= */

  presence: [],

  setPresence: (users) =>
    set({ presence: users }, false, "chatRealtime/setPresence"),

  /* ================= Typing ================= */

  typing: {},

  setTyping: (userId, isTyping) =>
    set(
      (state) => ({
        typing: {
          ...state.typing,
          [userId]: isTyping,
        },
      }),
      false,
      "chatRealtime/setTyping",
    ),

  /* ================= Unread ================= */

  unreadCount: 0,

  incrementUnread: (delta) =>
    set(
      (state) => ({
        unreadCount: state.unreadCount + delta,
      }),
      false,
      "chatRealtime/incrementUnread",
    ),

  resetUnread: () => set({ unreadCount: 0 }, false, "chatRealtime/resetUnread"),

  /* ================= WS Message ================= */

  applyWsMessage: (incoming) => {
    // 1. Prevent duplication (optimistic + WS race-safe)
    if (get().messages.some((m) => m.id === incoming.id)) {
      return;
    }

    // 2. 🔔 UI NOTIFICATION LOGIC
    // Check if the incoming message mode matches a hidden view
    const activeView = get().activeView;

    // 🚀 CLEAN: No more 'as any' needed because 'mode' is in the ChatMessage intersection base
    const mode = incoming.mode ?? "record";

    if (activeView !== "all" && activeView !== mode) {
      // Trigger the pulsing dot on the relevant ViewToggle button
      set(
        (state: any) => ({
          viewActivity: {
            ...state.viewActivity,
            [mode]: true,
          },
        }),
        false,
        "ui/notifyViewActivity",
      );
    }

    // 3. Commit message to state
    set(
      (state) => ({
        messages: [...state.messages, incoming].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      }),
      false,
      "chatRealtime/applyWsMessage",
    );
  },

  /* ================= Receipt ================= */

  updateReceipt: (payload) =>
    set(
      (state) => ({
        messages: state.messages.map((m) => {
          if (m.id !== payload.messageId) return m;
          if (m.kind !== "text") return m;

          const receipts = { ...(m.receipts ?? {}) };

          receipts[payload.userId] = {
            deliveredAt:
              payload.deliveredAt ??
              receipts[payload.userId]?.deliveredAt ??
              null,
            seenAt: payload.seenAt ?? receipts[payload.userId]?.seenAt ?? null,
          };

          return {
            ...m,
            receipts,
          };
        }),
      }),
      false,
      "chatRealtime/updateReceipt",
    ),
});
