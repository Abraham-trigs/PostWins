// src/app/xotic/postwins/_components/chat/store/postwins/slices/composer.slice.ts
// Purpose: Composer UI state (mode, text input control only)

import type { StateCreator } from "zustand";
import type { ComposerMode } from "../../types";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   The composer is a pure UI concern:
   - What mode the composer is in (record, verify, etc.)
   - What text is currently typed

   It must NOT:
   - Push messages directly
   - Perform submission
   - Mutate draft automatically

   This guarantees that message creation always flows
   through timeline logic, preserving deterministic behavior.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createComposerSlice()

   Owns:
   - composerMode
   - composerText
   - setComposerMode()
   - setComposerText()
   - clearComposer()
========================================================= */

type ComposerSlice = {
  composerMode: ComposerMode;
  composerText: string;

  setComposerMode: (mode: ComposerMode) => void;
  setComposerText: (text: string) => void;
  clearComposer: () => void;
};

export const createComposerSlice: StateCreator<
  ComposerSlice,
  [["zustand/devtools", never]],
  [],
  ComposerSlice
> = (set) => ({
  composerMode: "record",
  composerText: "",

  /**
   * Sets active composer mode.
   * Used when transitioning from record → verify.
   */
  setComposerMode: (mode) =>
    set({ composerMode: mode }, false, "setComposerMode"),

  /**
   * Controlled input setter.
   * UI components should bind to this.
   */
  setComposerText: (text) =>
    set({ composerText: text }, false, "setComposerText"),

  /**
   * Clears text only.
   * Does not alter mode.
   */
  clearComposer: () => set({ composerText: "" }, false, "clearComposer"),
});

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Timeline slice reads composerMode.
   - UI binds to composerText.
   - Submission slice may clear composer after success.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If you later support:
   - Rich text
   - Voice recording blobs
   - Slash commands
   - Attachments

   Expand composer state here without touching
   questionnaire or submission logic.
========================================================= */
