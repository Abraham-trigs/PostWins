// src/chat/store/slices/caseTimeline.slice.ts
// Purpose: Read-only Case Timeline Projection Slice
// Mirrors backend TimelineService projection exactly.

import type { StateCreator } from "zustand";

/* =========================================================
   Backend Timeline Projection
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
   Helpers (Exported for use in getUnifiedFeed)
========================================================= */

export function getEventTimestamp(event: CaseTimelineEvent): string {
  switch (event.type) {
    case "gap":
      return event.scheduledFor;
    case "window":
      return event.openedAt;
    case "delivery":
    case "followup":
      return event.occurredAt;
    default:
      return new Date(0).toISOString();
  }
}

export function sortEvents(events: CaseTimelineEvent[]): CaseTimelineEvent[] {
  return [...events].sort((a, b) =>
    getEventTimestamp(a).localeCompare(getEventTimestamp(b)),
  );
}

/* =========================================================
   Slice State
========================================================= */

export type CaseTimelineSlice = {
  events: CaseTimelineEvent[];
  isTimelineLoading: boolean;

  setTimelineLoading: (loading: boolean) => void;
  setTimeline: (events: CaseTimelineEvent[]) => void;
  appendTimelineEvent: (event: CaseTimelineEvent) => string;
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
> = (set) => ({
  events: [],
  isTimelineLoading: false,

  setTimelineLoading: (loading) =>
    set({ isTimelineLoading: loading }, false, "caseTimeline/setLoading"),

  setTimeline: (events) =>
    set({ events: sortEvents(events) }, false, "caseTimeline/setTimeline"),

  appendTimelineEvent: (event) => {
    const id = crypto.randomUUID();

    set(
      (state) => ({
        events: sortEvents([
          ...state.events,
          { ...event, id } as any, // Cast to any to handle internal UI ID
        ]),
      }),
      false,
      "caseTimeline/appendEvent",
    );

    return id;
  },

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
