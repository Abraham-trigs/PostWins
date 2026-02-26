// src/app/xotic/postwins/_components/chat/store/postwins/slices/lifecycle.slice.ts
// Purpose: Lifecycle and initialization logic for PostWin UI store (bootstrap, attach IDs, reset).
// Updated to use ChatMessage (UI-authoritative model only).

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../types";
import { nowIso } from "@postwin-store/helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice controls lifecycle transitions only.

   The store is UI-authoritative, therefore:
   - Only ChatMessage is allowed in state.
   - Backend domain models (ThreadMessage) must never
     enter the store directly.
   - Bootstrap messages are system ChatMessage objects.
========================================================= */

/* =========================================================
   Structure
========================================================= */

type LifecycleSlice = {
  ids: {
    projectId: string | null;
    postWinId: string | null;
  };

  bootstrapPostWin: () => void;
  attachIds: (ids: { projectId: string; postWinId?: string | null }) => void;
  resetPostWin: () => void;
};

/* =========================================================
   Slice
========================================================= */

export const createLifecycleSlice: StateCreator<
  LifecycleSlice & {
    messages: ChatMessage[];
    questionnaire: any;
    draft: any;
    composerMode: any;
    composerText: string;
    submitting: boolean;
    deliveryDraft: any;
    deliveryTxId: string | null;
    error?: unknown;
    currentStep?: string;
    currentUserId?: string | null;
  },
  [["zustand/devtools", never]],
  [],
  LifecycleSlice
> = (set, get) => ({
  ids: { projectId: null, postWinId: null },

  /* =========================================================
     Bootstrap
  ========================================================= */

  bootstrapPostWin: () =>
    set(
      (state) => {
        const bootstrapMessage: ChatMessage = {
          id: crypto.randomUUID(),
          kind: "text",
          role: "system",
          mode: "record",
          text: "Let’s record a PostWin. First, where is it located?",
          createdAt: nowIso(),
          authorId: state.currentUserId ?? "system",
          receipts: {},
        };

        return {
          messages: [...state.messages, bootstrapMessage],
          questionnaire: {
            active: true,
            step: "step1_location",
            answers: {},
          },
        };
      },
      false,
      "bootstrapPostWin",
    ),

  /* =========================================================
     Attach Backend IDs
  ========================================================= */

  attachIds: ({ projectId, postWinId = null }) =>
    set({ ids: { projectId, postWinId } }, false, "attachIds"),

  /* =========================================================
     Reset
  ========================================================= */

  resetPostWin: () =>
    set(
      {
        ids: { projectId: null, postWinId: null },
        messages: [],
        draft: {
          narrative: "",
          evidence: [],
          hasEvidence: false,
        },
        currentStep: "postwin_narrative",
        composerMode: "record",
        composerText: "",
        submitting: false,
        error: undefined,
        deliveryDraft: {
          location: "",
          items: [{ name: "", qty: 1 }],
          notes: "",
        },
        deliveryTxId: null,
        questionnaire: {
          active: false,
          step: "step1_location",
          answers: {},
        },
      },
      false,
      "resetPostWin",
    ),
});
