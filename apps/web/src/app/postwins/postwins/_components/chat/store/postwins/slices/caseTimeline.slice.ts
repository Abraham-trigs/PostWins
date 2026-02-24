// Purpose: Read-only Case Timeline Projection Slice
// Mirrors backend TimelineService projection exactly.
// No optimistic logic. No receipts. No pagination.
// This slice represents immutable ledger projections.

import type { StateCreator } from "zustand";

/* =========================================================
   Backend Timeline Projection (Mirror of API Contract)
========================================================= */

export type CaseTimelineEvent =
  | {
      type: "delivery";
      occurredAt: string;
      deliveryId: string;
      summary: string;
    }
  | {
      type: "followup";
      occurredAt: string;
      followupId: string;
      kind: string;
      deliveryId: string;
    }
  | {
      type: "gap";
      scheduledFor: string;
      deliveryId: string;
      label: string;
      status: "missing" | "upcoming";
      daysFromDelivery: number;
    }
  | {
      type: "window";
      openedAt: string;
      closesAt: string;
      label: string;
      status: "open" | "closed" | "expired";
    };

/* =========================================================
   Slice State
========================================================= */

export type CaseTimelineSlice = {
  events: CaseTimelineEvent[];
  isTimelineLoading: boolean;

  setTimelineLoading: (loading: boolean) => void;
  setTimeline: (events: CaseTimelineEvent[]) => void;
  appendTimelineEvent: (event: CaseTimelineEvent) => void;
  clearTimeline: () => void;
};

/* =========================================================
   Slice Implementation
========================================================= */

export const createCaseTimelineSlice: StateCreator<
  CaseTimelineSlice,
  [["zustand/devtools", never]],
  [],
  CaseTimelineSlice
> = (set, get) => ({
  events: [],
  isTimelineLoading: false,

  setTimelineLoading: (loading) =>
    set({ isTimelineLoading: loading }, false, "caseTimeline/setLoading"),

  setTimeline: (events) =>
    set(
      {
        events: [...events].sort((a, b) => {
          const ta =
            a.type === "gap"
              ? a.scheduledFor
              : a.type === "window"
                ? a.openedAt
                : a.occurredAt;

          const tb =
            b.type === "gap"
              ? b.scheduledFor
              : b.type === "window"
                ? b.openedAt
                : b.occurredAt;

          return ta.localeCompare(tb);
        }),
      },
      false,
      "caseTimeline/setTimeline",
    ),

  appendTimelineEvent: (event) =>
    set(
      (state) => {
        const next = [...state.events, event].sort((a, b) => {
          const ta =
            a.type === "gap"
              ? a.scheduledFor
              : a.type === "window"
                ? a.openedAt
                : a.occurredAt;

          const tb =
            b.type === "gap"
              ? b.scheduledFor
              : b.type === "window"
                ? b.openedAt
                : b.occurredAt;

          return ta.localeCompare(tb);
        });

        return { events: next };
      },
      false,
      "caseTimeline/appendEvent",
    ),

  clearTimeline: () =>
    set(
      {
        events: [],
        isTimelineLoading: false,
      },
      false,
      "caseTimeline/clear",
    ),
});
