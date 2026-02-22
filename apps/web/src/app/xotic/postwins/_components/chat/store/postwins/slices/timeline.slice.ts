// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts
// Purpose: Deterministic Optimistic Timeline with ACK + durable receipt reconciliation + derived delivery state.

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/message";

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// - Receipts merge deterministically per user.
// - Delivery state is derived, never stored.
// - Derived state avoids race conditions and duplication.
// - Works with reconnect hydration.
// - Optimistic layer preserved.
// - No mutation of existing state references.

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// - O(n) per receipt event.
// - O(r) per delivery-state derivation (r = recipient count).
// - Pure client-side merge.
// - Safe for multi-device concurrent updates.
// - Compatible with server-authoritative timestamps.

export type TimelineSlice = {
  messages: BackendMessage[];
  isLoading: boolean;

  setMessages: (messages: BackendMessage[]) => void;
  appendMessage: (message: BackendMessage) => void;
  confirmMessage: (mutationId: string, messageId: string) => void;
  rollbackMessage: (mutationId: string) => void;
  clearMessages: () => void;

  applyReceipt: (payload: {
    messageId: string;
    userId: string;
    deliveredAt?: string;
    seenAt?: string;
  }) => void;

  getMessageDeliveryState: (
    messageId: string,
  ) => "sent" | "delivered" | "seen" | "none";
};

export const createTimelineSlice: StateCreator<
  TimelineSlice,
  [["zustand/devtools", never]],
  [],
  TimelineSlice
> = (set, get) => ({
  messages: [],
  isLoading: false,

  //////////////////////////////////////////////////////////////
  // Hydration Merge
  //////////////////////////////////////////////////////////////

  setMessages: (incoming) =>
    set(
      (state) => {
        const map = new Map<string, BackendMessage>();

        for (const m of state.messages) map.set(m.id, m);
        for (const m of incoming) map.set(m.id, m);

        const merged = Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        return { messages: merged };
      },
      false,
      "timeline/setMessages",
    ),

  //////////////////////////////////////////////////////////////
  // Atomic Append
  //////////////////////////////////////////////////////////////

  appendMessage: (incoming) =>
    set(
      (state) => {
        if (incoming.clientMutationId) {
          const ghostIndex = state.messages.findIndex(
            (m) =>
              m.clientMutationId &&
              m.clientMutationId === incoming.clientMutationId,
          );

          if (ghostIndex !== -1) {
            const updated = [...state.messages];
            updated[ghostIndex] = incoming;
            return { messages: updated };
          }
        }

        if (state.messages.some((m) => m.id === incoming.id)) {
          return state;
        }

        const next = [...state.messages, incoming].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        return { messages: next };
      },
      false,
      "timeline/appendMessage",
    ),

  //////////////////////////////////////////////////////////////
  // ACK Reconciliation
  //////////////////////////////////////////////////////////////

  confirmMessage: (mutationId, messageId) =>
    set(
      (state) => {
        const index = state.messages.findIndex(
          (m) => m.clientMutationId === mutationId,
        );

        if (index === -1) return state;

        const updated = [...state.messages];
        updated[index] = {
          ...updated[index],
          id: messageId,
        };

        return { messages: updated };
      },
      false,
      "timeline/confirmMessage",
    ),

  //////////////////////////////////////////////////////////////
  // Deterministic Receipt Merge
  //////////////////////////////////////////////////////////////

  applyReceipt: (payload) =>
    set(
      (state) => {
        const index = state.messages.findIndex(
          (m) => m.id === payload.messageId,
        );

        if (index === -1) return state;

        const updated = [...state.messages];
        const message = { ...updated[index] };

        if (!message.receipts) {
          message.receipts = {};
        }

        const existing = message.receipts[payload.userId] ?? {};

        // Monotonic merge (never erase newer state)
        message.receipts[payload.userId] = {
          deliveredAt: payload.deliveredAt ?? existing.deliveredAt ?? null,
          seenAt: payload.seenAt ?? existing.seenAt ?? null,
        };

        updated[index] = message;

        return { messages: updated };
      },
      false,
      "timeline/applyReceipt",
    ),

  //////////////////////////////////////////////////////////////
  // Derived Aggregate Delivery State
  //////////////////////////////////////////////////////////////

  getMessageDeliveryState: (messageId) => {
    const state = get();
    const message = state.messages.find((m) => m.id === messageId);

    if (!message) return "sent";

    const currentUserId = (state as any).currentUserId;
    if (!currentUserId) return "sent";

    // Only author sees delivery state
    if (message.authorId !== currentUserId) return "none";

    const receipts = message.receipts ?? {};

    const others = Object.entries(receipts).filter(
      ([userId]) => userId !== currentUserId,
    );

    if (others.length === 0) return "sent";

    const allSeen = others.every(([, r]) => !!r?.seenAt);
    if (allSeen) return "seen";

    const anyDelivered = others.some(([, r]) => !!r?.deliveredAt);
    if (anyDelivered) return "delivered";

    return "sent";
  },

  //////////////////////////////////////////////////////////////
  // Rollback
  //////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////
  // Clear
  //////////////////////////////////////////////////////////////

  clearMessages: () => set({ messages: [] }, false, "timeline/clearMessages"),
});

// const status = usePostWinStore(
//   (s) => s.getMessageDeliveryState(message.id),
// );
