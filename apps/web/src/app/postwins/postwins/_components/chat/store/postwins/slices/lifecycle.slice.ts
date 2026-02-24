// src/app/xotic/postwins/_components/chat/store/postwins/slices/lifecycle.slice.ts
// Purpose: Lifecycle and initialization logic for PostWin UI store (bootstrap, attach IDs, reset).

import type { StateCreator } from "zustand";
import type { ChatMessage } from "../../types";
import { nowIso } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice owns lifecycle transitions only:
   - Bootstrapping the conversation
   - Attaching backend identifiers
   - Full store reset

   It does not handle draft logic, timeline mutation beyond
   initial messages, or submission. This keeps lifecycle
   transitions isolated and predictable.

   All state updates remain UI-authoritative and do not
   infer backend domain transitions.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createLifecycleSlice()

   Owns:
   - ids
   - reset behavior
   - initial bootstrap messages
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

export const createLifecycleSlice: StateCreator<
  LifecycleSlice,
  [["zustand/devtools", never]],
  [],
  LifecycleSlice
> = (set) => ({
  ids: { projectId: null, postWinId: null },

  /**
   * Initializes questionnaire flow.
   * Pushes first system message + first form block.
   */
  bootstrapPostWin: () =>
    set(
      (state: any) => {
        const messages: ChatMessage[] = [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            kind: "text",
            role: "system",
            mode: "record",
            text: "Let’s record a PostWin. First, where is it located?",
            createdAt: nowIso(),
          },
          {
            id: crypto.randomUUID(),
            kind: "form_block",
            step: "step1_location",
            createdAt: nowIso(),
          },
        ];

        return {
          messages,
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

  /**
   * Attaches backend identifiers after bootstrap submission.
   * UI-only state; no backend inference.
   */
  attachIds: ({ projectId, postWinId = null }) =>
    set({ ids: { projectId, postWinId } }, false, "attachIds"),

  /**
   * Full UI reset.
   * Safe to call when leaving screen or starting new flow.
   */
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

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Must be composed inside root store.
   - Assumes other slices define:
       messages
       questionnaire
       draft
       composerMode
       composerText
       deliveryDraft
   - Does not import other slices directly.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If lifecycle becomes more complex (resume flows,
   rehydration, offline recovery), this slice becomes the
   correct extension point without touching other domains.
========================================================= */
