// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts
// Purpose: Manage Signal-driven UX with Optimistic UI, Ghost Reconciliation, and Deduplication.

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/message";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice provides:
   - Optimistic "ghost" message support
   - Deterministic reconciliation when server truth arrives
   - Protection against duplicate socket/API collisions
   - Safe rollback when network fails

   Reconciliation logic:
   - Matches ghost by author + body
   - Only within a 5-minute window
   - Avoids server/client clock skew issues
========================================================= */

/* =========================================================
   Structure
   - setMessages()
   - appendMessage()
   - rollbackMessage()
   - clearMessages()
========================================================= */

export type TimelineSlice = {
  messages: BackendMessage[];
  isLoading: boolean;

  setMessages: (messages: BackendMessage[]) => void;
  appendMessage: (message: BackendMessage) => void;
  rollbackMessage: (tempId: string) => void;
  clearMessages: () => void;
};

const GHOST_RECONCILIATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const createTimelineSlice: StateCreator<
  TimelineSlice,
  [["zustand/devtools", never]],
  [],
  TimelineSlice
> = (set) => ({
  messages: [],
  isLoading: false,

  /* =========================================================
     Replace entire thread (hydration)
  ========================================================= */
  setMessages: (messages) => set({ messages }, false, "timeline/setMessages"),

  /* =========================================================
     Append Message (Optimistic-safe + Deduplication)
  ========================================================= */
  appendMessage: (incoming) =>
    set(
      (state) => {
        // 1️⃣ Exact ID dedupe (server/socket collision safe)
        if (state.messages.some((m) => m.id === incoming.id)) {
          return state;
        }

        // 2️⃣ Ghost reconciliation
        const ghostIndex = state.messages.findIndex((m) => {
          if (!m.id.startsWith("ghost-")) return false;
          if (m.authorId !== incoming.authorId) return false;
          if (m.body !== incoming.body) return false;

          const ghostTime = new Date(m.createdAt).getTime();
          const now = Date.now();

          // Only reconcile recent ghosts
          return now - ghostTime < GHOST_RECONCILIATION_WINDOW_MS;
        });

        if (ghostIndex !== -1) {
          const updated = [...state.messages];
          updated[ghostIndex] = incoming;
          return { messages: updated };
        }

        // 3️⃣ Normal append
        return {
          messages: [...state.messages, incoming],
        };
      },
      false,
      "timeline/appendMessage",
    ),

  /* =========================================================
     Rollback (Network Failure)
  ========================================================= */
  rollbackMessage: (tempId) =>
    set(
      (state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }),
      false,
      "timeline/rollbackMessage",
    ),

  /* =========================================================
     Clear Thread (Case Switch)
  ========================================================= */
  clearMessages: () => set({ messages: [] }, false, "timeline/clearMessages"),
});

/* =========================================================
   Implementation guidance
   - Ghost IDs must be prefixed with "ghost-"
   - Ghost createdAt must be client timestamp
   - Server messages must return ISO createdAt
   - Socket messages can safely call appendMessage()

   This slice assumes:
   - createMessage() returns BackendMessage
   - optimistic UI inserts ghost before network call
========================================================= */

/* =========================================================
   Scalability insight
   This design supports:
   - WebSocket streaming
   - Pagination extension
   - Infinite scroll hydration
   - Retry + resend UX
   - Event-sourced reconstruction

   For absolute determinism, upgrade to clientMutationId
   instead of heuristic body matching.
========================================================= */
