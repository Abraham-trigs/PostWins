// src/app/xotic/postwins/_components/chat/store/postwins/slices/questionnaire.slice.ts
// Purpose: Questionnaire UI flow logic (UI-authoritative only, no backend inference)

import type { StateCreator } from "zustand";
import type {
  QuestionnaireStep,
  QuestionnaireAnswers,
  ChatMessage,
} from "../../types";
import { nowIso } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice manages questionnaire state and its UI-driven
   transitions. It does NOT persist or infer backend task
   state. It only:
   - Tracks active questionnaire step
   - Stores temporary answers
   - Pushes UI messages to timeline

   It interacts with timeline via state.messages mutation
   but does not own submission or draft persistence logic.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createQuestionnaireSlice()

   Owns:
   - questionnaire state
   - startQuestionnaire()
   - answerQuestion()
   - goToQuestionnaireStep()
   - finalizeQuestionnaire()
========================================================= */

type QuestionnaireSlice = {
  questionnaire: {
    active: boolean;
    step: QuestionnaireStep;
    answers: QuestionnaireAnswers;
  };

  startQuestionnaire: () => void;
  answerQuestion: <K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K],
  ) => void;

  goToQuestionnaireStep: (step: QuestionnaireStep) => void;
  finalizeQuestionnaire: () => void;
};

export const createQuestionnaireSlice: StateCreator<
  QuestionnaireSlice,
  [["zustand/devtools", never]],
  [],
  QuestionnaireSlice
> = (set) => ({
  questionnaire: {
    active: false,
    step: "step1_location",
    answers: {},
  },

  startQuestionnaire: () =>
    set(
      {
        questionnaire: {
          active: true,
          step: "step1_location",
          answers: {},
        },
      },
      false,
      "questionnaire:start",
    ),

  answerQuestion: (key, value) =>
    set(
      (state: any) => {
        const now = nowIso();

        const nextAnswers = {
          ...state.questionnaire.answers,
          [key]: value,
        };

        // Step 1 → Step 2
        if (
          state.questionnaire.step === "step1_location" &&
          key === "location"
        ) {
          return {
            questionnaire: {
              active: true,
              step: "step2",
              answers: nextAnswers,
            },
            messages: [
              ...state.messages,
              {
                id: crypto.randomUUID(),
                kind: "text",
                role: "system",
                mode: "record",
                text: "Got it. Now let’s talk about who this PostWin is for.",
                createdAt: now,
              },
              {
                id: crypto.randomUUID(),
                kind: "form_block",
                step: "beneficiary",
                createdAt: now,
              },
            ],
          };
        }

        // Step 2 → Review
        if (state.questionnaire.step === "step2" && key === "beneficiary") {
          const location = nextAnswers.location;

          return {
            questionnaire: {
              active: true,
              step: "review",
              answers: nextAnswers,
            },
            messages: [
              ...state.messages,
              {
                id: crypto.randomUUID(),
                kind: "text",
                role: "system",
                mode: "record",
                text: [
                  "Here’s a quick review before we create this PostWin:",
                  "",
                  location
                    ? `• Location: ${location.digitalAddress}`
                    : "• Location: —",
                  value && typeof value === "object"
                    ? "• Beneficiary: provided"
                    : "• Beneficiary: —",
                ].join("\n"),
                createdAt: now,
              },
              {
                id: crypto.randomUUID(),
                kind: "form_block",
                step: "review",
                createdAt: now,
              },
              {
                id: crypto.randomUUID(),
                kind: "action_row",
                actions: [
                  {
                    id: "confirm_postwin",
                    label: "Confirm & Create",
                    value: "confirm",
                  },
                  {
                    id: "edit_postwin",
                    label: "Edit answers",
                    value: "edit",
                  },
                ],
                createdAt: now,
              },
            ],
          };
        }

        return {
          questionnaire: {
            ...state.questionnaire,
            answers: nextAnswers,
          },
        };
      },
      false,
      "questionnaire:answer",
    ),

  goToQuestionnaireStep: (step) =>
    set(
      (state: any) => ({
        questionnaire: {
          ...state.questionnaire,
          step,
        },
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            kind: "form_block",
            step,
            createdAt: nowIso(),
          },
        ],
      }),
      false,
      "questionnaire:goto",
    ),

  finalizeQuestionnaire: () =>
    set(
      (state: any) => {
        const { location, beneficiary } = state.questionnaire.answers;

        return {
          questionnaire: {
            active: false,
            step: "done",
            answers: state.questionnaire.answers,
          },
          draft: {
            ...state.draft,
            location: location?.digitalAddress,
            beneficiaryType: beneficiary?.beneficiaryType,
            beneficiaryName: beneficiary?.beneficiaryName,
          },
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              kind: "text",
              role: "system",
              mode: "record",
              text: "Thanks. You can now describe the PostWin in your own words.",
              createdAt: nowIso(),
            },
          ],
        };
      },
      false,
      "questionnaire:finalize",
    ),
});

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Relies on:
       state.messages
       state.draft
   - Does not import draft or timeline slices directly.
   - Root store must compose slices before usage.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If questionnaire grows (multi-branch logic, async lookups,
   dynamic schema-driven forms), this slice can evolve into
   a state machine without touching delivery or submission
   logic.
========================================================= */
