// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts
// Purpose: Deterministic Optimistic Timeline using clientMutationId reconciliation.

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/message";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice provides fully deterministic optimistic UI:

   - Ghost messages carry clientMutationId
   - Server returns same clientMutationId
   - Reconciliation swaps atomically by mutationId
   - No content heuristics
   - No timestamp comparison
   - No clock skew risk

   All transport paths (Optimistic, REST, WebSocket)
   converge through appendMessage().
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

  /**
   * Atomic append with mutationId reconciliation.
   */
  appendMessage: (message: BackendMessage) => void;

  /**
   * Removes ghost by clientMutationId.
   */
  rollbackMessage: (mutationId: string) => void;

  clearMessages: () => void;
};

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
     Atomic Append with Deterministic Reconciliation
  ========================================================= */
  appendMessage: (incoming) =>
    set(
      (state) => {
        // 1️⃣ Precise Reconciliation via clientMutationId
        if (incoming.clientMutationId) {
          const ghostIndex = state.messages.findIndex(
            (m) =>
              m.clientMutationId &&
              m.clientMutationId === incoming.clientMutationId,
          );

          if (ghostIndex !== -1) {
            const updated = [...state.messages];
            updated[ghostIndex] = incoming; // Atomic swap
            return { messages: updated };
          }
        }

        // 2️⃣ Strict ID deduplication (REST + Socket collision safe)
        if (state.messages.some((m) => m.id === incoming.id)) {
          return state;
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
     Rollback Ghost (Network Failure)
  ========================================================= */
  rollbackMessage: (mutationId) =>
    set(
      (state) => ({
        messages: state.messages.filter(
          (m) => m.clientMutationId !== mutationId,
        ),
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
   ---------------------------------------------------------
   Requirements:
   - Composer must generate clientMutationId
   - Ghost message must include clientMutationId
   - Backend must persist and return clientMutationId
   - WebSocket must emit message with clientMutationId

   Example:
   const clientMutationId = crypto.randomUUID();
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   This enables:
   - Infinite scroll
   - Streaming updates
   - Offline queue replay
   - Message retries
   - Exactly-once UI semantics

   This is the same mutation reconciliation pattern
   used by Relay and Stripe APIs.
========================================================= */
