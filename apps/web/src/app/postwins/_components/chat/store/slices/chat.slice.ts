// src/app/xotic/postwins/_components/chat/store/postwins/slices/chat.slice.ts
// Purpose: Backward-compatible ChatSlice composer

/**
 * ============================
 * Design reasoning
 * ============================
 * Maintains existing external contract.
 * Internally composes smaller focused slices.
 * Zero breaking changes.
 */

import type { StateCreator } from "zustand";

import {
  createChatContextSlice,
  type ChatContextSlice,
} from "./chatContext.slice";

import {
  createChatMessagesSlice,
  type ChatMessagesSlice,
} from "./chatMessages.slice";

import {
  createChatOptimisticSlice,
  type ChatOptimisticSlice,
} from "./chatOptimistic.slice";

import {
  createChatRealtimeSlice,
  type ChatRealtimeSlice,
} from "./chatRealtime.slice";

/* ============================
   Combined Type
============================ */

export type ChatSlice = ChatContextSlice &
  ChatMessagesSlice &
  ChatOptimisticSlice &
  ChatRealtimeSlice;

/* ============================
   Composer
============================ */

export const createChatSlice: StateCreator<
  ChatSlice,
  [["zustand/devtools", never]],
  [],
  ChatSlice
> = (set, get, api) => ({
  ...createChatContextSlice(set, get, api),
  ...createChatMessagesSlice(set, get, api),
  ...createChatOptimisticSlice(set, get, api),
  ...createChatRealtimeSlice(set, get, api),
});

/**
 * ============================
 * Structure
 * - context slice
 * - messages slice
 * - optimistic slice
 * - realtime slice
 *
 * ============================
 * Implementation guidance
 * No changes required in usePostWinStore.
 *
 * ============================
 * Scalability insight
 * Each slice is independently testable and swappable.
 */
