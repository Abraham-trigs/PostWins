// src/app/xotic/postwins/_components/chat/store/postwins/slices/submission.slice.ts
// Purpose: Submission orchestration (bootstrap + delivery). Coordinates other slices safely.

import type { StateCreator } from "zustand";
import type { PostWinDraft } from "../types";
import {
  nowIso,
  makeTxId,
  normalizeDeliveryItems,
} from "@postwin-store/helpers";

/**
 * =========================================================
 * Purpose: Unified Submission Slice
 * Handles the transition from local UI Drafts to real
 * Ledger-backed Project IDs (Bootstrap) and subsequent
 * delivery records.
 * =========================================================
 */

/* =========================================================
   Types
========================================================= */

type BootstrapResponse = {
  ok: true;
  projectId: string;
  referenceCode: string;
};

type DeliveryResponse = {
  ok: true;
  type: "EXECUTION_PROGRESS_RECORDED";
  projectId: string;
  deliveryId: string;
};

export type SubmissionSlice = {
  submitting: boolean;
  error?: string;

  submitBootstrap: (opts: {
    submit: () => Promise<BootstrapResponse>;
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
    ) => Promise<DeliveryResponse>;
  }) => Promise<void>;
};

/* =========================================================
   Slice Implementation
========================================================= */

export const createSubmissionSlice: StateCreator<
  SubmissionSlice & {
    deliveryTxId: string | null;
    submitting: boolean;
    error?: unknown;
  },
  [["zustand/devtools", never]],
  [],
  SubmissionSlice
> = (set, get) => ({
  submitting: false,
  error: undefined,

  /* ======================================================
     Bootstrap Submission (Draft -> Live UUID)
  ====================================================== */

  submitBootstrap: async ({ submit }) => {
    const state: any = get();
    const { draft } = state;

    // 1. Validation
    if (!draft.narrative || draft.narrative.trim().length < 10) {
      set(
        { error: "Please add a short description (at least 10 characters)." },
        false,
        "bootstrap:validation",
      );
      return;
    }

    set({ submitting: true, error: undefined }, false, "bootstrap:start");

    /**
     * Timeline hint event for immediate UI feedback
     */
    state.appendTimelineEvent({
      type: "delivery",
      occurredAt: new Date().toISOString(),
      deliveryId: "bootstrap",
      summary: "Creating PostWin project",
    });

    try {
      // 2. Perform Backend Bootstrap
      const res = await submit();

      // 3. ATOMIC ID HANDOFF: Replace draft_ prefix with real UUID
      // This update triggers DesktopShell's gated useEffects
      state.attachIds({
        projectId: res.projectId,
        postWinId: null,
      });

      // 4. Reset Draft Narrative
      state.patchDraft({
        narrative: "",
        evidence: [],
        hasEvidence: false,
      });

      set({ submitting: false }, false, "bootstrap:success");

      // 5. System notification
      state.appendText(
        "system",
        `PostWin created. Ref: ${res.referenceCode}`,
        "verify",
      );

      // 6. UI Cleanup
      state.clearComposer();
      state.setComposerMode("verify");
    } catch (e) {
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

  /* ======================================================
     Delivery Submission (Post-Bootstrap)
  ====================================================== */

  submitDelivery: async ({ submit }) => {
    const state: any = get();
    const { ids, deliveryDraft, deliveryTxId } = state;

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

    if (!deliveryTxId) {
      set({ deliveryTxId: txId }, false, "delivery:setTxId");
    }

    set({ submitting: true, error: undefined }, false, "delivery:start");

    const deliveryId = `delivery_${crypto.randomUUID()}`;
    const occurredAt = nowIso();

    /**
     * Timeline hint
     */
    state.appendTimelineEvent({
      type: "delivery",
      occurredAt,
      deliveryId,
      summary: "Recording delivery",
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

      set({ submitting: false }, false, "delivery:success");

      state.appendText(
        "system",
        `Delivery recorded (${res.deliveryId}).`,
        "verify",
      );

      // Reset delivery inputs for next entry
      set(
        () => ({
          deliveryTxId: null,
          deliveryDraft: {
            location: "",
            items: [{ name: "", qty: 1 }],
            notes: "",
          },
        }),
        false,
        "delivery:resetForNext",
      );
    } catch (e) {
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
});

/* =========================================================
Implementation guidance
---------------------------------------------------------
This slice orchestrates async submission flows.

It does not own:
- draft
- delivery
- timeline
- chat

Instead it calls other slices through get().

Timeline slice remains projection-only and should
never track optimistic states like pending/failed.
========================================================= */

/* =========================================================
Scalability insight
---------------------------------------------------------
If future requirements introduce:

• offline command queue
• retry logic
• background sync
• command idempotency

this orchestration slice becomes the command layer
without polluting the timeline or chat slices.
========================================================= */
