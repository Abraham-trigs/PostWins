// src/app/xotic/postwins/_components/chat/store/usePostWinStore.ts
// Purpose: Root PostWin store — composes all slices into a single Zustand store with devtools support.

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

/* ===================== Slices ===================== */

import { createLifecycleSlice } from "./postwins/slices/lifecycle.slice";
import { createTimelineSlice } from "./postwins/slices/timeline.slice";
import { createQuestionnaireSlice } from "./postwins/slices/questionnaire.slice";
import { createDraftSlice } from "./postwins/slices/draft.slice";
import { createDeliverySlice } from "./postwins/slices/delivery.slice";
import { createComposerSlice } from "./postwins/slices/composer.slice";
import { createSubmissionSlice } from "./postwins/slices/submission.slice";

/* =========================================================
   Assumptions
   ---------------------------------------------------------
   - types.ts remains at:
     src/app/xotic/postwins/_components/chat/store/types.ts
   - No external file imports internal slice paths.
   - Existing UI imports from this file remain unchanged.
========================================================= */

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This file composes all PostWin slices into one unified store.

   Key properties:
   - Single Zustand store instance.
   - Devtools preserved.
   - No behavior change.
   - Cross-slice communication occurs only via get().
   - Slices remain domain-isolated.

   The root store does NOT contain logic.
   It only merges slice outputs.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   - usePostWinStore (exported hook)
   - Composes:
       lifecycle
       timeline
       questionnaire
       draft
       delivery
       composer
       submission
========================================================= */

export const usePostWinStore = create<any>()(
  devtools(
    (set, get) => ({
      /* Order does not affect runtime,
         but grouping improves readability */

      ...createLifecycleSlice(set, get),
      ...createTimelineSlice(set, get),
      ...createQuestionnaireSlice(set, get),
      ...createDraftSlice(set, get),
      ...createDeliverySlice(set, get),
      ...createComposerSlice(set, get),
      ...createSubmissionSlice(set, get),
    }),
    { name: "PostWins" },
  ),
);

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - No UI changes required.
   - All existing component calls remain valid.
   - Devtools name preserved ("PostWins").
   - Safe to delete original monolithic store file.

   If TypeScript strict typing is desired:
   - Replace <any> with a composed RootState type.
   - Export RootState for test isolation.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If PostWins expands (offline replay, audit trail,
   server sync reconciliation), new slices can be added
   without modifying existing ones.

   This structure supports:
   - Feature toggles
   - Slice-level testing
   - Future migration to Zustand store splitting per feature
========================================================= */
