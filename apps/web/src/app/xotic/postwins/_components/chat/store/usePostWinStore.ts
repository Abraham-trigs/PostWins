"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchMessagesByCase } from "@/lib/api/message";
import type { ThreadMessage } from "./types";

/* ===================== Slice Types ===================== */
import type { TimelineSlice } from "./postwins/slices/timeline.slice";

/* ===================== Root State ===================== */

export type PostWinState = TimelineSlice & {
  lifecycle: any;
  questionnaire: any;
  draft: any;
  delivery: any;
  composer: any;
  submission: any;

  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;

  fetchMessages: (tenantId: string, caseId: string) => Promise<void>;
};

/* ===================== Slices ===================== */
import { createLifecycleSlice } from "./postwins/slices/lifecycle.slice";
import { createTimelineSlice } from "./postwins/slices/timeline.slice";
import { createQuestionnaireSlice } from "./postwins/slices/questionnaire.slice";
import { createDraftSlice } from "./postwins/slices/draft.slice";
import { createDeliverySlice } from "./postwins/slices/delivery.slice";
import { createComposerSlice } from "./postwins/slices/composer.slice";
import { createSubmissionSlice } from "./postwins/slices/submission.slice";

export const usePostWinStore = create<PostWinState>()(
  devtools(
    (set, get, ...a) => ({
      ...createLifecycleSlice(set, get, ...a),
      ...createTimelineSlice(set, get, ...a),
      ...createQuestionnaireSlice(set, get, ...a),
      ...createDraftSlice(set, get, ...a),
      ...createDeliverySlice(set, get, ...a),
      ...createComposerSlice(set, get, ...a),
      ...createSubmissionSlice(set, get, ...a),

      /* ===================== Thread Identity ===================== */

      currentUserId: null,

      setCurrentUserId: (id) =>
        set({ currentUserId: id }, false, "setCurrentUserId"),

      /* ===================== Fetch Thread ===================== */

      fetchMessages: async (tenantId, caseId) => {
        try {
          set({ isLoading: true }, false, "timeline/loading");

          const messages = await fetchMessagesByCase(tenantId, caseId);

          set(
            { messages: messages as ThreadMessage[], isLoading: false },
            false,
            "timeline/setFromServer",
          );
        } catch (error) {
          console.error("Failed to fetch messages", error);
          set({ isLoading: false }, false, "timeline/error");
        }
      },
    }),
    {
      name: "PostWins",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
