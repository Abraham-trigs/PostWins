// src/app/xotic/postwins/_components/chat/store/postwins/slices/chatRealtime.slice.ts
// Purpose: WebSocket integration, presence/typing state, and unread management

/**
 * ============================
 * Design reasoning
 * ============================
 * This slice owns all real-time transport concerns:
 * - WS message ingestion
 * - Receipt propagation
 * - Presence tracking
 * - Typing indicators
 * - Unread counter
 *
 * Public contract compatibility is preserved (setPresence, setTyping).
 * No behavioral regression from previous store structure.
 */

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../types";
import type { ChatMessagesSlice } from "./chatMessages.slice";

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
  ChatMessagesSlice & ChatRealtimeSlice,
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

  applyWsMessage: (incoming) =>
    set(
      (state) => {
        // Prevent duplication (optimistic + WS race-safe)
        if (state.messages.some((m) => m.id === incoming.id)) {
          return state;
        }

        return {
          messages: [...state.messages, incoming].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        };
      },
      false,
      "chatRealtime/applyWsMessage",
    ),

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

/**
 * ============================
 * Structure
 * - presence state
 * - typing state
 * - unread tracking
 * - ws message ingestion
 * - receipt updates
 *
 * ============================
 * Implementation guidance
 * WebSocket service binds directly to:
 * - applyWsMessage
 * - updateReceipt
 * - setPresence
 * - setTyping
 * - incrementUnread / resetUnread
 *
 * ============================
 * Scalability insight
 * Presence can later be normalized into a Map for O(1) lookups
 * if user counts grow significantly.
 */
