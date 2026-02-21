// src/app/xotic/postwins/_components/chat/store/postwins/slices/submission.slice.ts
// Purpose: Submission orchestration (bootstrap + delivery). Coordinates other slices safely.

import type { StateCreator } from "zustand";
import type { PostWinDraft } from "../../types";
import { nowIso, makeTxId, normalizeDeliveryItems } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice orchestrates async flows:
   - Bootstrap submission
   - Delivery submission

   It does NOT own draft, delivery, or timeline state.
   It reads from them and coordinates cross-slice calls.

   All side-effects:
   - Event creation
   - Event status updates
   - Composer transitions
   - Reset behavior

   happen through other slice APIs using get().

   This keeps submission logic centralized and safe.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createSubmissionSlice()

   Owns:
   - submitting
   - error
   - submitBootstrap()
   - submitDelivery()
========================================================= */

type SubmissionSlice = {
  submitting: boolean;
  error?: string;

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

export const createSubmissionSlice: StateCreator<
  SubmissionSlice,
  [["zustand/devtools", never]],
  [],
  SubmissionSlice
> = (set, get) => ({
  submitting: false,
  error: undefined,

  /* -----------------------------------------------------
     Bootstrap Submission
  ----------------------------------------------------- */

  submitBootstrap: async ({ submit }) => {
    const state: any = get();
    const { draft } = state;

    if (!draft.narrative || draft.narrative.trim().length < 10) {
      set(
        { error: "Please add a short description (at least 10 characters)." },
        false,
        "bootstrap:validation",
      );
      return;
    }

    set({ submitting: true, error: undefined }, false, "bootstrap:start");

    const eventId = state.appendEvent({
      title: "Creating PostWin",
      meta: "Creating project + seeding verification",
      status: "pending",
    });

    try {
      const res = await submit(draft);

      state.setEventStatus(eventId, "logged");
      state.attachIds({
        projectId: res.projectId,
        postWinId: res.postWinId ?? null,
      });

      set({ submitting: false }, false, "bootstrap:success");

      state.appendText(
        "system",
        "Created. Next: verification will begin.",
        "verify",
      );

      state.clearComposer();
      state.setComposerMode("verify");
    } catch (e) {
      state.setEventStatus(eventId, "failed");

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

  /* -----------------------------------------------------
     Delivery Submission
  ----------------------------------------------------- */

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

    const deliveryId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `delivery_${crypto.randomUUID()}`
        : `delivery_${Date.now()}`;

    const occurredAt = nowIso();

    const eventId = state.appendEvent({
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

      state.setEventStatus(eventId, "logged");
      set({ submitting: false }, false, "delivery:success");

      state.appendText(
        "system",
        `Delivery recorded (${res.deliveryId}).`,
        "verify",
      );

      set(
        {
          deliveryTxId: null,
          deliveryDraft: state.makeInitialDeliveryDraft?.() ?? {
            location: "",
            items: [{ name: "", qty: 1 }],
            notes: "",
          },
        },
        false,
        "delivery:resetForNext",
      );
    } catch (e) {
      state.setEventStatus(eventId, "failed");

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
   - Relies on:
       appendEvent
       setEventStatus
       attachIds
       appendText
       clearComposer
       setComposerMode
   - These must exist in composed slices.
   - No slice imports others directly.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If you later introduce:
   - Offline queueing
   - Optimistic delivery logging
   - Retry strategies
   - Idempotent replay

   All orchestration logic evolves here without touching
   draft, delivery, or timeline slices.
========================================================= */
