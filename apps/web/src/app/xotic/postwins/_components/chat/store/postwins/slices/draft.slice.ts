// src/app/xotic/postwins/_components/chat/store/postwins/slices/draft.slice.ts
// Purpose: Draft state management (narrative + evidence handling only)

import type { StateCreator } from "zustand";
import type { PostWinDraft, EvidenceKind, EvidenceFile } from "../../types";
import { evidenceId } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice owns ONLY PostWin draft mutation logic:
   - narrative updates
   - evidence attachment
   - evidence removal

   It does not:
   - handle submission
   - handle delivery
   - push timeline messages
   - manage questionnaire transitions

   This ensures draft logic stays isolated and easy to test.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createDraftSlice()

   Owns:
   - draft state
   - patchDraft()
   - addEvidence()
   - removeEvidence()
========================================================= */

type DraftSlice = {
  draft: PostWinDraft;

  patchDraft: (patch: Partial<PostWinDraft>) => void;

  addEvidence: (kind: EvidenceKind, files: File[]) => void;

  removeEvidence: (evidenceId: string) => void;
};

const initialDraft: PostWinDraft = {
  narrative: "",
  evidence: [],
  hasEvidence: false,
};

export const createDraftSlice: StateCreator<
  DraftSlice,
  [["zustand/devtools", never]],
  [],
  DraftSlice
> = (set, get) => ({
  draft: initialDraft,

  /**
   * Partial draft update.
   * Shallow merge only.
   */
  patchDraft: (patch) =>
    set(
      (state) => ({
        draft: {
          ...state.draft,
          ...patch,
        },
      }),
      false,
      "patchDraft",
    ),

  /**
   * Adds evidence files with dedupe protection.
   * Prevents duplicate attachments using deterministic ID.
   */
  addEvidence: (kind, files) => {
    const prev = get().draft.evidence ?? [];
    const seen = new Set(prev.map((e) => e.id));

    const next: EvidenceFile[] = [];

    for (const f of files) {
      const id = evidenceId(kind, f);
      if (!seen.has(id)) {
        next.push({ id, kind, file: f });
      }
    }

    const merged = [...prev, ...next];

    set(
      {
        draft: {
          ...get().draft,
          evidence: merged,
          hasEvidence: merged.length > 0,
        },
      },
      false,
      "addEvidence",
    );
  },

  /**
   * Removes evidence by ID.
   */
  removeEvidence: (id) => {
    const prev = get().draft.evidence ?? [];
    const next = prev.filter((e) => e.id !== id);

    set(
      {
        draft: {
          ...get().draft,
          evidence: next,
          hasEvidence: next.length > 0,
        },
      },
      false,
      "removeEvidence",
    );
  },
});

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Safe to call from UI components directly.
   - Evidence dedupe prevents accidental duplicate uploads.
   - No cross-slice calls required here.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If you later support:
   - async uploads
   - presigned URLs
   - file status tracking (pending/uploaded/failed)
   You can evolve evidence structure here without touching
   questionnaire or delivery logic.
========================================================= */
