// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts
// Purpose: Timeline mutation logic (text messages, events, form blocks, action rows).

import type { StateCreator } from "zustand";
import type {
  ChatMessage,
  ChatRole,
  ComposerMode,
  EventMessage,
  IntakeStep,
} from "../../types";
import { nowIso, uid } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice owns timeline mutations only:
   - Text messages
   - Event messages
   - Form blocks
   - Action rows

   It does NOT own:
   - Questionnaire logic
   - Draft mutation
   - Submission side-effects

   This guarantees that message rendering logic is fully
   isolated and future timeline types can be added without
   touching business flow slices.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createTimelineSlice()

   Owns:
   - messages
   - appendText()
   - appendEvent()
   - setEventStatus()
   - upsertEvent()
   - pushFormBlock()
   - pushActionRow()
   - goToStep()
========================================================= */

type TimelineSlice = {
  messages: ChatMessage[];
  currentStep: IntakeStep;

  appendText: (role: ChatRole, text: string, mode?: ComposerMode) => string;

  appendEvent: (payload: {
    title: string;
    meta: string;
    status?: "pending" | "logged" | "failed";
  }) => string;

  setEventStatus: (id: string, status: "pending" | "logged" | "failed") => void;

  upsertEvent: (
    event: Omit<EventMessage, "id" | "kind"> & { key: string },
  ) => void;

  pushFormBlock: (step: IntakeStep) => string;
  pushActionRow: (
    actions: Array<{ id: string; label: string; value: string }>,
  ) => string;

  goToStep: (step: IntakeStep) => void;
};

export const createTimelineSlice: StateCreator<
  TimelineSlice,
  [["zustand/devtools", never]],
  [],
  TimelineSlice
> = (set, get) => ({
  messages: [],
  currentStep: "postwin_narrative",

  appendText: (role, text, mode) => {
    const id = uid("m");
    const useMode = mode ?? (get() as any).composerMode;

    set(
      (state: any) => ({
        messages: [
          ...state.messages,
          {
            id,
            kind: "text",
            role,
            text,
            mode: useMode,
            createdAt: nowIso(),
          },
        ],
        composerMode: useMode,
        composerText: role === "user" ? "" : state.composerText,
      }),
      false,
      "appendText",
    );

    return id;
  },

  appendEvent: ({ title, meta, status = "pending" }) => {
    const id = uid("e");

    set(
      (state: any) => ({
        messages: [
          ...state.messages,
          {
            id,
            kind: "event",
            title,
            meta,
            status,
            createdAt: nowIso(),
          },
        ],
      }),
      false,
      "appendEvent",
    );

    return id;
  },

  setEventStatus: (id, status) =>
    set(
      (state: any) => ({
        messages: state.messages.map((m: ChatMessage) =>
          m.kind === "event" && m.id === id ? { ...m, status } : m,
        ),
      }),
      false,
      "setEventStatus",
    ),

  upsertEvent: (event) =>
    set(
      (state: any) => {
        const index = state.messages.findIndex(
          (m: ChatMessage): m is EventMessage =>
            m.kind === "event" && m.key === event.key,
        );

        if (index === -1) {
          return {
            messages: [
              ...state.messages,
              {
                id: crypto.randomUUID(),
                kind: "event",
                ...event,
              },
            ],
          };
        }

        const updated = [...state.messages];
        updated[index] = {
          ...updated[index],
          ...event,
        };

        return { messages: updated };
      },
      false,
      "upsertEvent",
    ),

  pushFormBlock: (step) => {
    const id = uid("m");

    set(
      (state: any) => ({
        messages: [
          ...state.messages,
          {
            id,
            kind: "form_block",
            step,
            createdAt: nowIso(),
          },
        ],
        currentStep: step,
      }),
      false,
      "pushFormBlock",
    );

    return id;
  },

  pushActionRow: (actions) => {
    const id = uid("m");

    set(
      (state: any) => ({
        messages: [
          ...state.messages,
          {
            id,
            kind: "action_row",
            actions,
            createdAt: nowIso(),
          },
        ],
      }),
      false,
      "pushActionRow",
    );

    return id;
  },

  goToStep: (step) => set({ currentStep: step }, false, "goToStep"),
});

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Compose into root store.
   - Relies on composerMode/composerText existing in
     composer slice.
   - Does not import other slices directly.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If message virtualization, server replay, or optimistic
   reconciliation is introduced, this slice becomes the
   single extension point for timeline logic.
========================================================= */
