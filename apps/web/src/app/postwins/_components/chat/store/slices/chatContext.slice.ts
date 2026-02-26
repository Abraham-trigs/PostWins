// src/app/xotic/postwins/_components/chat/store/postwins/slices/chatContext.slice.ts
// Purpose: Isolated chat identity & case context management

/**
 * ============================
 * Design reasoning
 * ============================
 * Separates identity and case binding from message logic.
 * Prevents cross-concern coupling with pagination or WS logic.
 * Keeps state deterministic and explicit.
 */

import type { StateCreator } from "zustand";

/* ============================
   Types
============================ */

export interface ChatContextSlice {
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;

  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;

  projectId: string | null;
  postWinId: string | null;

  attachIds: (ids: {
    projectId: string | null;
    postWinId: string | null;
  }) => void;
}

/* ============================
   Implementation
============================ */

export const createChatContextSlice: StateCreator<
  ChatContextSlice,
  [["zustand/devtools", never]],
  [],
  ChatContextSlice
> = (set) => ({
  activeCaseId: null,
  setActiveCaseId: (id) =>
    set({ activeCaseId: id }, false, "chatContext/setActiveCaseId"),

  currentUserId: null,
  setCurrentUserId: (id) =>
    set({ currentUserId: id }, false, "chatContext/setCurrentUserId"),

  projectId: null,
  postWinId: null,

  attachIds: ({ projectId, postWinId }) =>
    set({ projectId, postWinId }, false, "chatContext/attachIds"),
});

/**
 * ============================
 * Structure
 * - activeCaseId
 * - identity setters
 * - project/postWin binding
 *
 * ============================
 * Implementation guidance
 * Call attachIds when case context is resolved.
 *
 * ============================
 * Scalability insight
 * Future multi-tab support can extend this slice without touching message logic.
 */
