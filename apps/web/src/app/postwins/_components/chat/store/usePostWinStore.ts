"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchMessagesByCase } from "@/lib/api/contracts/domain/message";
import type { ChatMessage } from "./types";
import { useAuthStore } from "@/lib/store/useAuthStore";

/* ===================== Slice Imports ===================== */

import { createChatSlice, type ChatSlice } from "./slices/chat.slice";
import {
  createCaseTimelineSlice,
  type CaseTimelineSlice,
  type CaseTimelineEvent,
  getEventTimestamp, // Added this import
} from "./slices/caseTimeline.slice";
import { createLifecycleSlice } from "./slices/lifecycle.slice";
import { createQuestionnaireSlice } from "./slices/questionnaire.slice";
import { createDraftSlice } from "./slices/draft.slice";
import { createDeliverySlice } from "./slices/delivery.slice";
import { createComposerSlice } from "./slices/composer.slice";
import { createSubmissionSlice } from "./slices/submission.slice";

import { mapBackendMessageToChatMessage } from "@postwin-store/mappers/message.mapper";

/* ===================== Feed Model ===================== */

type FeedItem =
  | { kind: "chat"; timestamp: string; data: ChatMessage }
  | { kind: "timeline"; timestamp: string; data: CaseTimelineEvent };

/* ===================== Store Type ===================== */

type LifecycleSlice = ReturnType<typeof createLifecycleSlice>;
type QuestionnaireSlice = ReturnType<typeof createQuestionnaireSlice>;
type DraftSlice = ReturnType<typeof createDraftSlice>;
type DeliverySlice = ReturnType<typeof createDeliverySlice>;
type ComposerSlice = ReturnType<typeof createComposerSlice>;
type SubmissionSlice = ReturnType<typeof createSubmissionSlice>;

export type PostWinState = ChatSlice &
  CaseTimelineSlice &
  LifecycleSlice &
  QuestionnaireSlice &
  DraftSlice &
  DeliverySlice &
  ComposerSlice &
  SubmissionSlice & {
    currentUserId: string | null;
    setCurrentUserId: (id: string) => void;

    unreadByCase: Record<string, number>;
    incrementUnread: (caseId: string, delta: number) => void;
    resetUnread: (caseId: string) => void;

    unreadAnchor: string | null;
    setUnreadAnchor: (messageId: string | null) => void;

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

      unreadAnchor: null,

      setUnreadAnchor: (messageId: string | null) =>
        set({ unreadAnchor: messageId }, false, "unread/setAnchor"),

      /* ======== Initial Fetch ======== */
      fetchMessages: async (caseId: string) => {
        const { isAuthenticated, isHydrated } = useAuthStore.getState();
        if (!caseId || !isAuthenticated || !isHydrated) return;

        try {
          set({ isLoading: true }, false, "chat/loading");

          const result = await fetchMessagesByCase(caseId);

          const normalized: ChatMessage[] = (result.messages ?? []).map((m) =>
            mapBackendMessageToChatMessage(m, get().currentUserId),
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

          const normalized: ChatMessage[] = (result.messages ?? []).map((m) =>
            mapBackendMessageToChatMessage(m, get().currentUserId),
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

      /* ===================== Unified Feed ===================== */
      getUnifiedFeed: () => {
        const { messages, events } = get();

        const chatFeed: FeedItem[] = messages.map((m) => ({
          kind: "chat",
          timestamp: m.createdAt,
          data: m,
        }));

        const timelineFeed: FeedItem[] = events.map((e) => ({
          kind: "timeline",
          timestamp: getEventTimestamp(e),
          data: e,
        }));

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
