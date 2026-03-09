// src/app/postwins/_components/chat/store/usePostWinStore.ts
// Purpose: Zustand store managing PostWins chat + timeline feed with functional UI view modes (record, followup, verify, delivery).

"use client";

/*
Design reasoning
---------------
The store manages unified conversation state across chat messages, timeline
events, and UI view modes. The `activeView` represents the current functional
conversation context, while `viewActivity` tracks activity indicators for each
mode (record, followup, verify, delivery). When a user switches to a view,
its activity indicator is cleared automatically.

Structure
---------
FeedView        → UI conversation modes
FeedItem        → Unified feed model
PostWinState    → Zustand store interface
usePostWinStore → Zustand implementation
getUnifiedFeed  → selector merging messages + timeline with view filtering

Implementation guidance
-----------------------
Switching UI modes:

const setView = usePostWinStore(s => s.setActiveView)
setView("verify")

Reading unified feed:

const feed = usePostWinStore(s => s.getUnifiedFeed())

Scalability insight
-------------------
Additional conversation modes (appeals, governance, dispute resolution)
can be introduced by extending FeedView and aligning message.mode.
*/

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
  getEventTimestamp,
} from "./slices/caseTimeline.slice";
import { createLifecycleSlice } from "./slices/lifecycle.slice";
import { createQuestionnaireSlice } from "./slices/questionnaire.slice";
import { createDraftSlice } from "./slices/draft.slice";
import { createDeliverySlice } from "./slices/delivery.slice";
import { createComposerSlice } from "./slices/composer.slice";
import { createSubmissionSlice } from "./slices/submission.slice";

import { mapBackendMessageToChatMessage } from "@postwin-store/mappers/message.mapper";

/* ===================== Feed Model ===================== */

export type FeedView = "all" | "record" | "followup" | "verify" | "delivery";

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

    /* UI conversation view state */
    activeView: FeedView;

    viewActivity: {
      record: boolean;
      followup: boolean;
      verify: boolean;
      delivery: boolean;
    };

    setActiveView: (view: FeedView) => void;

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

      /* ======== UI View State ======== */

      activeView: "all",

      viewActivity: {
        record: false,
        followup: false,
        verify: false,
        delivery: false,
      },

      setActiveView: (view: FeedView) => {
        set({ activeView: view }, false, "ui/setActiveView");

        // Clear activity indicator when selected
        if (view !== "all") {
          set(
            (state) => ({
              viewActivity: {
                ...state.viewActivity,
                [view]: false,
              },
            }),
            false,
            "ui/clearViewActivity",
          );
        }
      },

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
        const { messages, events, activeView } = get();

        const filteredMessages = messages.filter((m) => {
          if (activeView === "all") return true;
          // 🚀 FIX: Fallback to "record" handles messages where mode is undefined
          const messageMode = m.mode ?? "record";
          return messageMode === activeView;
        });

        const chatFeed: FeedItem[] = filteredMessages.map((m) => ({
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

/*
Example usage

const setView = usePostWinStore(s => s.setActiveView)
setView("verify")

const feed = usePostWinStore(s => s.getUnifiedFeed)
*/
