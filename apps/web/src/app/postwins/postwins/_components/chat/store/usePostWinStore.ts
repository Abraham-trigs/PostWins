"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchMessagesByCase } from "@/lib/api/contracts/domain/message";
import type { ThreadMessage } from "./types";
import { useAuthStore } from "@/lib/store/useAuthStore";

/* ===================== Slice Imports ===================== */

import { createChatSlice, type ChatSlice } from "./postwins/slices/chat.slice";
import {
  createCaseTimelineSlice,
  type CaseTimelineSlice,
  type CaseTimelineEvent,
} from "./postwins/slices/caseTimeline.slice";
import { createLifecycleSlice } from "./postwins/slices/lifecycle.slice";
import { createQuestionnaireSlice } from "./postwins/slices/questionnaire.slice";
import { createDraftSlice } from "./postwins/slices/draft.slice";
import { createDeliverySlice } from "./postwins/slices/delivery.slice";
import { createComposerSlice } from "./postwins/slices/composer.slice";
import { createSubmissionSlice } from "./postwins/slices/submission.slice";

/* ===================== Feed Model ===================== */

type FeedItem =
  | { kind: "chat"; timestamp: string; data: ThreadMessage }
  | { kind: "timeline"; timestamp: string; data: CaseTimelineEvent };

/* ===================== Store Type ===================== */

export type PostWinState = ChatSlice &
  CaseTimelineSlice & {
    lifecycle: any;
    questionnaire: any;
    draft: any;
    delivery: any;
    composer: any;
    submission: any;

    currentUserId: string | null;
    setCurrentUserId: (id: string) => void;

    unreadByCase: Record<string, number>;
    incrementUnread: (caseId: string, delta: number) => void;
    resetUnread: (caseId: string) => void;

    fetchMessages: (caseId: string) => Promise<void>;
    fetchMoreMessages: (caseId: string) => Promise<void>;

    getUnifiedFeed: () => FeedItem[];
  };

/* ===================== Store ===================== */

export const usePostWinStore = create<PostWinState>()(
  devtools(
    (set, get, ...a) => ({
      /* ======== Slices ======== */
      ...createChatSlice(set, get, ...a),
      ...createCaseTimelineSlice(set, get, ...a),
      ...createLifecycleSlice(set, get, ...a),
      ...createQuestionnaireSlice(set, get, ...a),
      ...createDraftSlice(set, get, ...a),
      ...createDeliverySlice(set, get, ...a),
      ...createComposerSlice(set, get, ...a),
      ...createSubmissionSlice(set, get, ...a),

      /* ======== Identity ======== */
      currentUserId: null,
      setCurrentUserId: (id: string) =>
        set({ currentUserId: id }, false, "identity/setCurrentUserId"),

      /* ======== Unread ======== */
      unreadByCase: {},
      incrementUnread: (caseId: string, delta: number) =>
        set(
          (state) => ({
            unreadByCase: {
              ...state.unreadByCase,
              [caseId]: (state.unreadByCase[caseId] ?? 0) + delta,
            },
          }),
          false,
          "unread/increment",
        ),

      resetUnread: (caseId: string) =>
        set(
          (state) => ({
            unreadByCase: { ...state.unreadByCase, [caseId]: 0 },
          }),
          false,
          "unread/reset",
        ),

      /* ======== Initial Fetch ======== */
      fetchMessages: async (caseId: string) => {
        const { isAuthenticated, isHydrated } = useAuthStore.getState();

        if (!caseId || !isAuthenticated || !isHydrated) return;

        try {
          set({ isLoading: true }, false, "chat/loading");

          const result = await fetchMessagesByCase(caseId);

          const normalized: ThreadMessage[] = (result.messages ?? []).map(
            (m: any) => ({
              id: m.id,
              authorId: m.authorId,
              type: m.type ?? "MESSAGE",
              body: m.body ?? "",
              createdAt: m.createdAt,
              navigationContext: m.navigationContext ?? null,
              receipts: m.receipts ?? {},
              clientMutationId: m.clientMutationId ?? null,
            }),
          );

          get().setMessages(normalized, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
          });

          set({ isLoading: false }, false, "chat/initialLoaded");
        } catch (error) {
          set({ isLoading: false }, false, "chat/error");
          console.error("Failed to fetch messages:", error);
        }
      },

      /* ======== Pagination Fetch ======== */
      fetchMoreMessages: async (caseId: string) => {
        const { isAuthenticated, isHydrated } = useAuthStore.getState();
        const { nextCursor, hasMore, isFetchingMore } = get();

        if (
          !caseId ||
          !isAuthenticated ||
          !isHydrated ||
          !hasMore ||
          !nextCursor ||
          isFetchingMore
        )
          return;

        try {
          set({ isFetchingMore: true }, false, "chat/loadingMore");

          const result = await fetchMessagesByCase(caseId, nextCursor);

          const normalized: ThreadMessage[] = (result.messages ?? []).map(
            (m: any) => ({
              id: m.id,
              authorId: m.authorId,
              type: m.type ?? "MESSAGE",
              body: m.body ?? "",
              createdAt: m.createdAt,
              navigationContext: m.navigationContext ?? null,
              receipts: m.receipts ?? {},
              clientMutationId: m.clientMutationId ?? null,
            }),
          );

          get().prependMessages(normalized, {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
          });

          set({ isFetchingMore: false }, false, "chat/loadedMore");
        } catch (error) {
          set({ isFetchingMore: false }, false, "chat/errorMore");
          console.error("Failed to fetch more messages:", error);
        }
      },

      /* ======== Unified Feed ======== */
      getUnifiedFeed: () => {
        const { messages, events } = get();

        const chatFeed: FeedItem[] = messages.map((m) => ({
          kind: "chat",
          timestamp: m.createdAt,
          data: m,
        }));

        const timelineFeed: FeedItem[] = events.map((e) => {
          const timestamp =
            e.type === "gap"
              ? e.scheduledFor
              : e.type === "window"
                ? e.openedAt
                : e.occurredAt;

          return { kind: "timeline", timestamp, data: e };
        });

        return [...chatFeed, ...timelineFeed].sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp),
        );
      },
    }),
    {
      name: "PostWins",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
