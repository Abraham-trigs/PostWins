// src/app/xotic/postwins/_components/chat/store/postwins/slices/delivery.slice.ts
// Purpose: Delivery draft + transaction state management (UI-only, no submission logic)

import type { StateCreator } from "zustand";
import type { DeliveryDraft } from "../../types";
import { makeInitialDeliveryDraft } from "../helpers";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This slice owns delivery draft state and transaction ID.
   It does NOT perform submission or timeline mutation.

   Separation ensures:
   - Delivery draft stays independent
   - Submission logic can orchestrate safely
   - Offline/idempotency logic can extend later
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   Exports:
   - createDeliverySlice()

   Owns:
   - deliveryDraft
   - deliveryTxId
   - patchDeliveryDraft()
   - resetDeliveryDraft()
========================================================= */

type DeliverySlice = {
  deliveryDraft: DeliveryDraft;
  deliveryTxId: string | null;

  patchDeliveryDraft: (patch: Partial<DeliveryDraft>) => void;
  resetDeliveryDraft: () => void;
};

export const createDeliverySlice: StateCreator<
  DeliverySlice,
  [["zustand/devtools", never]],
  [],
  DeliverySlice
> = (set, get) => ({
  deliveryDraft: makeInitialDeliveryDraft(),
  deliveryTxId: null,

  /**
   * Partial update of delivery draft.
   * Shallow merge only.
   */
  patchDeliveryDraft: (patch) =>
    set(
      {
        deliveryDraft: {
          ...get().deliveryDraft,
          ...patch,
        },
      },
      false,
      "patchDeliveryDraft",
    ),

  /**
   * Reset draft + transaction ID.
   * Used after successful submission.
   */
  resetDeliveryDraft: () =>
    set(
      {
        deliveryDraft: makeInitialDeliveryDraft(),
        deliveryTxId: null,
      },
      false,
      "resetDeliveryDraft",
    ),
});

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Submission slice must read:
       get().deliveryDraft
       get().deliveryTxId
   - Transaction ID should be set by submission slice.
   - Do NOT introduce submission logic here.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If delivery becomes multi-step (photos, geo-coordinates,
   verification signatures), this slice can expand safely
   without affecting questionnaire or draft logic.
========================================================= */
