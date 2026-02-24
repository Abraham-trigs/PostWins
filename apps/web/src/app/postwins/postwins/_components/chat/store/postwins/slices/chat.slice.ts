// src/app/xotic/postwins/_components/chat/store/postwins/slices/chat.slice.ts
// Purpose: Deterministic Optimistic Chat Slice with ACK + receipts + cursor pagination.

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/contracts/domain/message";

export type ChatSlice = {
  messages: BackendMessage[];
  isLoading: boolean;

  nextCursor: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;

  setMessages: (
    messages: BackendMessage[],
    meta?: { nextCursor: string | null; hasMore: boolean },
  ) => void;

  prependMessages: (
    messages: BackendMessage[],
    meta: { nextCursor: string | null; hasMore: boolean },
  ) => void;

  setPagination: (meta: {
    nextCursor: string | null;
    hasMore: boolean;
  }) => void;

  resetPagination: () => void;

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

export const createChatSlice: StateCreator<
  ChatSlice,
  [["zustand/devtools", never]],
  [],
  ChatSlice
> = (set, get) => ({
  messages: [],
  isLoading: false,

  nextCursor: null,
  hasMore: true,
  isFetchingMore: false,

  setMessages: (incoming, meta) =>
    set(
      () => ({
        messages: [...incoming].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
        nextCursor: meta?.nextCursor ?? null,
        hasMore: meta?.hasMore ?? false,
      }),
      false,
      "chat/setMessages",
    ),

  prependMessages: (incoming, meta) =>
    set(
      (state) => {
        const map = new Map<string, BackendMessage>();

        for (const m of incoming) map.set(m.id, m);
        for (const m of state.messages) map.set(m.id, m);

        const merged = Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        return {
          messages: merged,
          nextCursor: meta.nextCursor,
          hasMore: meta.hasMore,
          isFetchingMore: false,
        };
      },
      false,
      "chat/prependMessages",
    ),

  setPagination: (meta) =>
    set(
      {
        nextCursor: meta.nextCursor,
        hasMore: meta.hasMore,
      },
      false,
      "chat/setPagination",
    ),

  resetPagination: () =>
    set(
      {
        nextCursor: null,
        hasMore: true,
        isFetchingMore: false,
      },
      false,
      "chat/resetPagination",
    ),

  appendMessage: (incoming) =>
    set(
      (state) => {
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
      "chat/appendMessage",
    ),

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
      "chat/confirmMessage",
    ),

  applyReceipt: (payload) =>
    set(
      (state) => {
        const index = state.messages.findIndex(
          (m) => m.id === payload.messageId,
        );

        if (index === -1) return state;

        const updated = [...state.messages];
        const message = { ...updated[index] };

        message.receipts = message.receipts ?? {};
        const existing = message.receipts[payload.userId] ?? {};

        message.receipts[payload.userId] = {
          deliveredAt: payload.deliveredAt ?? existing.deliveredAt ?? null,
          seenAt: payload.seenAt ?? existing.seenAt ?? null,
        };

        updated[index] = message;

        return { messages: updated };
      },
      false,
      "chat/applyReceipt",
    ),

  getMessageDeliveryState: (messageId) => {
    const state = get();
    const message = state.messages.find((m) => m.id === messageId);
    if (!message) return "sent";

    const currentUserId = (state as any).currentUserId;
    if (!currentUserId) return "sent";
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

  rollbackMessage: (mutationId) =>
    set(
      (state) => ({
        messages: state.messages.filter(
          (m) => m.clientMutationId !== mutationId,
        ),
      }),
      false,
      "chat/rollbackMessage",
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
      "chat/clearMessages",
    ),
});
