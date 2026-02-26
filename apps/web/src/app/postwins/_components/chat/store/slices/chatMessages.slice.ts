// src/app/xotic/postwins/_components/chat/store/postwins/slices/chatMessages.slice.ts
// Purpose: Deterministic message collection + pagination control

/**
 * ============================
 * Design reasoning
 * ============================
 * Handles only message state and pagination.
 * Guarantees ASC ordering.
 * Prevents duplication via id-based merging.
 */

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../types";

/* ============================
   Types
============================ */

export interface ChatMessagesSlice {
  messages: ChatMessage[];
  isLoading: boolean;

  nextCursor: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;

  setMessages: (
    messages: ChatMessage[],
    meta?: { nextCursor: string | null; hasMore: boolean },
  ) => void;

  prependMessages: (
    messages: ChatMessage[],
    meta: { nextCursor: string | null; hasMore: boolean },
  ) => void;

  setPagination: (meta: {
    nextCursor: string | null;
    hasMore: boolean;
  }) => void;

  resetPagination: () => void;

  clearMessages: () => void;
}

/* ============================
   Helpers
============================ */

function sortAsc(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function mergeById(existing: ChatMessage[], incoming: ChatMessage[]) {
  const map = new Map<string, ChatMessage>();
  for (const m of existing) map.set(m.id, m);
  for (const m of incoming) map.set(m.id, m);
  return sortAsc(Array.from(map.values()));
}

/* ============================
   Implementation
============================ */

export const createChatMessagesSlice: StateCreator<
  ChatMessagesSlice,
  [["zustand/devtools", never]],
  [],
  ChatMessagesSlice
> = (set, get) => ({
  messages: [],
  isLoading: false,

  nextCursor: null,
  hasMore: true,
  isFetchingMore: false,

  setMessages: (incoming, meta) =>
    set(
      {
        messages: sortAsc(incoming),
        nextCursor: meta?.nextCursor ?? null,
        hasMore: meta?.hasMore ?? false,
      },
      false,
      "chatMessages/setMessages",
    ),

  prependMessages: (incoming, meta) =>
    set(
      (state) => ({
        messages: mergeById(state.messages, incoming),
        nextCursor: meta.nextCursor,
        hasMore: meta.hasMore,
        isFetchingMore: false,
      }),
      false,
      "chatMessages/prependMessages",
    ),

  setPagination: (meta) =>
    set(
      { nextCursor: meta.nextCursor, hasMore: meta.hasMore },
      false,
      "chatMessages/setPagination",
    ),

  resetPagination: () =>
    set(
      { nextCursor: null, hasMore: true, isFetchingMore: false },
      false,
      "chatMessages/resetPagination",
    ),

  clearMessages: () =>
    set(
      {
        messages: [],
        nextCursor: null,
        hasMore: true,
        isFetchingMore: false,
      },
      false,
      "chatMessages/clearMessages",
    ),
});

/**
 * ============================
 * Structure
 * - message list
 * - pagination controls
 * - deterministic sorting
 *
 * ============================
 * Implementation guidance
 * Use prependMessages only for cursor pagination.
 *
 * ============================
 * Scalability insight
 * Can migrate to normalized map store if message volume grows significantly.
 */
