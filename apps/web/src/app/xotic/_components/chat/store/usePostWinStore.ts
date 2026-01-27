// app/components/chat/store/usePostWinStore.ts
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
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function evidenceId(kind: EvidenceKind, file: File) {
  return `${kind}:${file.name}:${file.size}:${file.lastModified}`;
}

const initialDraft: PostWinDraft = {
  narrative: "",
  evidence: [],
  hasEvidence: false,
};

const initialStep: IntakeStep = "postwin_narrative";

type State = {
  ids: PostWinIds;
  messages: ChatMessage[];
  draft: PostWinDraft;
  currentStep: IntakeStep;

  composerMode: ComposerMode;
  composerText: string;

  submitting: boolean;
  error?: string;

  // Lifecycle
  bootstrapPostWin: () => void;
  attachIds: (ids: { projectId: string; postWinId?: string | null }) => void;
  resetPostWin: () => void;

  // Timeline actions
  appendText: (role: ChatRole, text: string, mode?: ComposerMode) => string;
  appendEvent: (payload: {
    title: string;
    meta: string;
    status?: "pending" | "logged" | "failed";
  }) => string;
  setEventStatus: (id: string, status: "pending" | "logged" | "failed") => void;

  // Flow actions
  goToStep: (step: IntakeStep) => void;
  pushFormBlock: (step: IntakeStep) => string;
  pushActionRow: (actions: Array<{ id: string; label: string; value: string }>) => string;

  // Draft actions
  patchDraft: (patch: Partial<PostWinDraft>) => void;
  addEvidence: (kind: EvidenceKind, files: File[]) => void;
  removeEvidence: (evidenceId: string) => void;

  // Composer actions
  setComposerMode: (mode: ComposerMode) => void;
  setComposerText: (text: string) => void;
  clearComposer: () => void;

  submitBootstrap: (opts: {
    submit: (draft: PostWinDraft) => Promise<{ projectId: string; postWinId?: string | null }>;
  }) => Promise<void>;
};

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

      // ✅ Clear + seed flow
      bootstrapPostWin: () => {
        set(
          {
            ids: { projectId: null, postWinId: null },
            messages: [],
            draft: initialDraft,
            currentStep: "postwin_narrative",
            composerMode: "record",
            composerText: "",
            submitting: false,
            error: undefined,
          },
          false,
          "bootstrapPostWin"
        );

        set(
          {
            messages: [
              {
                id: uid("m"),
                kind: "text",
                role: "system",
                text: "Let’s record a PostWin. What happened?",
                createdAt: nowIso(),
                mode: "record",
              },
              {
                id: uid("m"),
                kind: "form_block",
                step: "postwin_narrative",
                createdAt: nowIso(),
              },
            ],
          },
          false,
          "bootstrapPostWin:seed"
        );
      },

      attachIds: ({ projectId, postWinId = null }) =>
        set({ ids: { projectId, postWinId } }, false, "attachIds"),

      // ✅ Hard reset, no seed
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
          },
          false,
          "resetPostWin"
        ),

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
          "appendText"
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
          "appendEvent"
        );
        return id;
      },

      setEventStatus: (id, status) =>
        set(
          {
            messages: get().messages.map((m) =>
              m.kind === "event" && m.id === id ? { ...m, status } : m
            ),
          },
          false,
          "setEventStatus"
        ),

      goToStep: (step) => set({ currentStep: step }, false, "goToStep"),

      pushFormBlock: (step) => {
        const id = uid("m");
        set(
          {
            messages: [...get().messages, { id, kind: "form_block", step, createdAt: nowIso() }],
            currentStep: step,
          },
          false,
          "pushFormBlock"
        );
        return id;
      },

      pushActionRow: (actions) => {
        const id = uid("m");
        set(
          {
            messages: [...get().messages, { id, kind: "action_row", actions, createdAt: nowIso() }],
          },
          false,
          "pushActionRow"
        );
        return id;
      },

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
          "addEvidence"
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
          "removeEvidence"
        );
      },

      setComposerMode: (mode) => set({ composerMode: mode }, false, "setComposerMode"),
      setComposerText: (text) => set({ composerText: text }, false, "setComposerText"),
      clearComposer: () => set({ composerText: "" }, false, "clearComposer"),

      submitBootstrap: async ({ submit }) => {
        const { draft } = get();

        if (!draft.narrative || draft.narrative.trim().length < 10) {
          set({ error: "Please add a short description (at least 10 characters)." }, false);
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
          get().attachIds({ projectId: res.projectId, postWinId: res.postWinId ?? null });

          set({ submitting: false }, false, "bootstrap:success");

          get().appendText("system", "Created. Next: verification will begin.", "verify");
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
            "bootstrap:failed"
          );
        }
      },
    }),
    { name: "posta-postwin-store" }
  )
);
