// src/app/xotic/postwins/_components/chat/store/postwins/slices/chatOptimistic.slice.ts
// Purpose: Optimistic message lifecycle management

/**
 * ============================
 * Design reasoning
 * ============================
 * Isolates optimistic behavior from transport logic.
 * Prevents race duplication.
 */

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../types";
import type { ChatMessagesSlice } from "./chatMessages.slice";

/* ============================
   Types
============================ */

export interface ChatOptimisticSlice {
  appendMessage: (message: ChatMessage) => void;
  confirmMessage: (tempId: string, realId: string) => void;
  rollbackMessage: (tempId: string) => void;
}

/* ============================
   Implementation
============================ */

export const createChatOptimisticSlice: StateCreator<
  ChatMessagesSlice & ChatOptimisticSlice,
  [["zustand/devtools", never]],
  [],
  ChatOptimisticSlice
> = (set, get) => ({
  appendMessage: (incoming) =>
    set(
      (state) => {
        if (state.messages.some((m) => m.id === incoming.id)) return state;
        return {
          messages: [...state.messages, incoming].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        };
      },
      false,
      "chatOptimistic/appendMessage",
    ),

  confirmMessage: (tempId, realId) =>
    set(
      (state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, id: realId } : m,
        ),
      }),
      false,
      "chatOptimistic/confirmMessage",
    ),

  rollbackMessage: (tempId) =>
    set(
      (state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }),
      false,
      "chatOptimistic/rollbackMessage",
    ),
});

/**
 * ============================
 * Structure
 * - append
 * - confirm
 * - rollback
 *
 * ============================
 * Implementation guidance
 * Call confirmMessage on ACK from backend.
 *
 * ============================
 * Scalability insight
 * Safe for multi-instance optimistic writes.
 */
