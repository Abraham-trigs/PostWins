// apps/web/src/app/xotic/_components/chat/store/usePostWinStore.ts
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  ChatMessage,
  IntakeStep,
  PostWinDraft,
  ComposerMode,
  EvidenceKind,
  EvidenceFile,
  ChatRole,
  PostWinIds,
  DeliveryDraft,
  DeliveryItem,
  QuestionnaireStep,
  QuestionnaireAnswers,
} from "./types";

/* =========================================================
   Helpers
========================================================= */

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function evidenceId(kind: EvidenceKind, file: File) {
  return `${kind}:${file.name}:${file.size}:${file.lastModified}`;
}

function makeTxId(prefix: string) {
  // @ts-expect-error - crypto.randomUUID exists in modern browsers
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error - crypto typing differs across environments
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* =========================================================
   Initial state builders
========================================================= */

const initialDraft: PostWinDraft = {
  narrative: "",
  evidence: [],
  hasEvidence: false,
};

const initialStep: IntakeStep = "postwin_narrative";

function makeInitialDeliveryDraft(): DeliveryDraft {
  return {
    location: "",
    items: [{ name: "", qty: 1 }],
    notes: "",
  };
}

function normalizeDeliveryItems(items: DeliveryItem[]) {
  return items
    .map((i) => ({ name: i.name.trim(), qty: Number(i.qty) }))
    .filter((i) => i.name.length > 0 && Number.isFinite(i.qty) && i.qty > 0);
}

/* =========================================================
   Store state
========================================================= */

type State = {
  ids: PostWinIds;
  messages: ChatMessage[];
  draft: PostWinDraft;
  currentStep: IntakeStep;

  composerMode: ComposerMode;
  composerText: string;

  submitting: boolean;
  error?: string;

  // Delivery
  deliveryDraft: DeliveryDraft;
  deliveryTxId: string | null;

  // Questionnaire (authoritative)
  questionnaire: {
    active: boolean;
    step: QuestionnaireStep;
    answers: QuestionnaireAnswers;
  };

  // Lifecycle
  bootstrapPostWin: () => void;
  attachIds: (ids: { projectId: string; postWinId?: string | null }) => void;
  resetPostWin: () => void;

  // Timeline
  appendText: (role: ChatRole, text: string, mode?: ComposerMode) => string;
  appendEvent: (payload: {
    title: string;
    meta: string;
    status?: "pending" | "logged" | "failed";
  }) => string;
  setEventStatus: (id: string, status: "pending" | "logged" | "failed") => void;

  // Flow
  goToStep: (step: IntakeStep) => void;
  pushFormBlock: (step: IntakeStep) => string;
  pushActionRow: (
    actions: Array<{ id: string; label: string; value: string }>,
  ) => string;

  // Draft
  patchDraft: (patch: Partial<PostWinDraft>) => void;
  addEvidence: (kind: EvidenceKind, files: File[]) => void;
  removeEvidence: (evidenceId: string) => void;

  // Delivery draft
  patchDeliveryDraft: (patch: Partial<DeliveryDraft>) => void;
  resetDeliveryDraft: () => void;

  // Questionnaire actions
  startQuestionnaire: () => void;
  answerQuestion: <K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K],
  ) => void;

  // Composer
  setComposerMode: (mode: ComposerMode) => void;
  setComposerText: (text: string) => void;
  clearComposer: () => void;

  submitBootstrap: (opts: {
    submit: (
      draft: PostWinDraft,
    ) => Promise<{ projectId: string; postWinId?: string | null }>;
  }) => Promise<void>;

  submitDelivery: (opts: {
    submit: (
      payload: {
        projectId: string;
        deliveryId: string;
        occurredAt: string;
        location: unknown;
        items: Array<{ name: string; qty: number }>;
        notes?: string;
      },
      ctx: { transactionId: string },
    ) => Promise<{
      ok: true;
      type: "DELIVERY_RECORDED";
      projectId: string;
      deliveryId: string;
    }>;
  }) => Promise<void>;
};

/* =========================================================
   Store
========================================================= */

export const usePostWinStore = create<State>()(
  devtools(
    (set, get) => ({
      ids: { projectId: null, postWinId: null },

      messages: [],
      draft: initialDraft,
      currentStep: initialStep,

      composerMode: "record",
      composerText: "",

      submitting: false,
      error: undefined,

      deliveryDraft: makeInitialDeliveryDraft(),
      deliveryTxId: null,

      questionnaire: {
        active: false,
        step: "step1_location",
        answers: {},
      },

      /* ---------- lifecycle ---------- */

      bootstrapPostWin: () =>
        set(
          (state) => ({
            ...state,
            messages: [
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
            ],
            questionnaire: {
              active: true,
              step: "step1_location",
              answers: {},
            },
          }),
          false,
          "bootstrapPostWin",
        ),

      attachIds: ({ projectId, postWinId = null }) =>
        set({ ids: { projectId, postWinId } }, false, "attachIds"),

      resetPostWin: () =>
        set(
          {
            ids: { projectId: null, postWinId: null },
            messages: [],
            draft: initialDraft,
            currentStep: initialStep,
            composerMode: "record",
            composerText: "",
            submitting: false,
            error: undefined,
            deliveryDraft: makeInitialDeliveryDraft(),
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

      /* ---------- questionnaire ---------- */

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
          (state) => ({
            questionnaire: {
              ...state.questionnaire,
              answers: {
                ...state.questionnaire.answers,
                [key]: value,
              },
              step:
                state.questionnaire.step === "step1_location"
                  ? "step2"
                  : state.questionnaire.step,
            },
          }),
          false,
          "questionnaire:answer",
        ),

      /* ---------- timeline ---------- */

      appendText: (role, text, mode) => {
        const id = uid("m");
        const useMode = mode ?? get().composerMode;

        set(
          {
            messages: [
              ...get().messages,
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
            composerText: role === "user" ? "" : get().composerText,
          },
          false,
          "appendText",
        );

        return id;
      },

      appendEvent: ({ title, meta, status = "pending" }) => {
        const id = uid("e");
        set(
          {
            messages: [
              ...get().messages,
              { id, kind: "event", title, meta, status, createdAt: nowIso() },
            ],
          },
          false,
          "appendEvent",
        );
        return id;
      },

      setEventStatus: (id, status) =>
        set(
          {
            messages: get().messages.map((m) =>
              m.kind === "event" && m.id === id ? { ...m, status } : m,
            ),
          },
          false,
          "setEventStatus",
        ),

      /* ---------- flow ---------- */

      goToStep: (step) => set({ currentStep: step }, false, "goToStep"),

      pushFormBlock: (step) => {
        const id = uid("m");
        set(
          {
            messages: [
              ...get().messages,
              { id, kind: "form_block", step, createdAt: nowIso() },
            ],
            currentStep: step,
          },
          false,
          "pushFormBlock",
        );
        return id;
      },

      pushActionRow: (actions) => {
        const id = uid("m");
        set(
          {
            messages: [
              ...get().messages,
              { id, kind: "action_row", actions, createdAt: nowIso() },
            ],
          },
          false,
          "pushActionRow",
        );
        return id;
      },

      /* ---------- draft ---------- */

      patchDraft: (patch) =>
        set({ draft: { ...get().draft, ...patch } }, false, "patchDraft"),

      addEvidence: (kind, files) => {
        const prev = get().draft.evidence ?? [];
        const seen = new Set(prev.map((e) => e.id));

        const next: EvidenceFile[] = [];
        for (const f of files) {
          const id = evidenceId(kind, f);
          if (!seen.has(id)) next.push({ id, kind, file: f });
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

      /* ---------- delivery ---------- */

      patchDeliveryDraft: (patch) =>
        set(
          { deliveryDraft: { ...get().deliveryDraft, ...patch } },
          false,
          "patchDeliveryDraft",
        ),

      resetDeliveryDraft: () =>
        set(
          { deliveryDraft: makeInitialDeliveryDraft(), deliveryTxId: null },
          false,
          "resetDeliveryDraft",
        ),

      /* ---------- composer ---------- */

      setComposerMode: (mode) =>
        set({ composerMode: mode }, false, "setComposerMode"),
      setComposerText: (text) =>
        set({ composerText: text }, false, "setComposerText"),
      clearComposer: () => set({ composerText: "" }, false, "clearComposer"),

      /* ---------- submissions ---------- */

      submitBootstrap: async ({ submit }) => {
        const { draft } = get();

        if (!draft.narrative || draft.narrative.trim().length < 10) {
          set(
            {
              error: "Please add a short description (at least 10 characters).",
            },
            false,
          );
          return;
        }

        set({ submitting: true, error: undefined }, false, "bootstrap:start");

        const eventId = get().appendEvent({
          title: "Creating PostWin",
          meta: "Creating project + seeding verification",
          status: "pending",
        });

        try {
          const res = await submit(draft);

          get().setEventStatus(eventId, "logged");
          get().attachIds({
            projectId: res.projectId,
            postWinId: res.postWinId ?? null,
          });

          set({ submitting: false }, false, "bootstrap:success");

          get().appendText(
            "system",
            "Created. Next: verification will begin.",
            "verify",
          );
          get().clearComposer();
          get().setComposerMode("verify");
        } catch (e) {
          get().setEventStatus(eventId, "failed");
          set(
            {
              submitting: false,
              error: e instanceof Error ? e.message : "Bootstrap failed.",
            },
            false,
            "bootstrap:failed",
          );
        }
      },

      submitDelivery: async ({ submit }) => {
        const { ids, deliveryDraft, deliveryTxId } = get();

        if (!ids.projectId) {
          set(
            { error: "Missing projectId. Run bootstrap first." },
            false,
            "delivery:missingProject",
          );
          return;
        }

        const location = deliveryDraft.location.trim();
        const items = normalizeDeliveryItems(deliveryDraft.items);
        const notes = deliveryDraft.notes?.trim() || undefined;

        if (!location) {
          set({ error: "Missing location." }, false, "delivery:badInput");
          return;
        }

        if (items.length === 0) {
          set(
            { error: "Add at least 1 delivered item (name + qty > 0)." },
            false,
            "delivery:badInput",
          );
          return;
        }

        const txId = deliveryTxId ?? makeTxId("delivery");
        if (!deliveryTxId)
          set({ deliveryTxId: txId }, false, "delivery:setTxId");

        set({ submitting: true, error: undefined }, false, "delivery:start");

        const deliveryId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? `delivery_${crypto.randomUUID()}`
            : `delivery_${Date.now()}`;

        const occurredAt = nowIso();

        const eventId = get().appendEvent({
          title: "Recording delivery",
          meta: `Delivery ${deliveryId}`,
          status: "pending",
        });

        try {
          const res = await submit(
            {
              projectId: ids.projectId,
              deliveryId,
              occurredAt,
              location,
              items,
              notes,
            },
            { transactionId: txId },
          );

          get().setEventStatus(eventId, "logged");
          set({ submitting: false }, false, "delivery:success");

          get().appendText(
            "system",
            `Delivery recorded (${res.deliveryId}).`,
            "verify",
          );

          set(
            {
              deliveryTxId: null,
              deliveryDraft: makeInitialDeliveryDraft(),
            },
            false,
            "delivery:resetForNext",
          );
        } catch (e) {
          get().setEventStatus(eventId, "failed");
          set(
            {
              submitting: false,
              error: e instanceof Error ? e.message : "Delivery failed.",
            },
            false,
            "delivery:failed",
          );
        }
      },
    }),
    { name: "posta-postwin-store" },
  ),
);
