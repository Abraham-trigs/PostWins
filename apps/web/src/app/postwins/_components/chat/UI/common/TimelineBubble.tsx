// src/app/xotic/postwins/_components/chat/components/TimelineBubble.tsx
// Purpose: Dedicated renderer for CaseTimelineEvent projections

"use client";

import React from "react";
import type { CaseTimelineEvent } from "@postwin-store/slices/caseTimeline.slice";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   TimelineBubble renders lifecycle projections.
   It is separate from ChatBubble to prevent
   domain mixing (conversation vs lifecycle).

   Keeps case-state visualization isolated.
========================================================= */

export type TimelineBubbleProps = {
  event: CaseTimelineEvent;
};

export function TimelineBubble({ event }: TimelineBubbleProps) {
  const timestamp =
    event.type === "gap"
      ? event.scheduledFor
      : event.type === "window"
        ? event.openedAt
        : event.occurredAt;

  return (
    <div className="flex justify-center my-4">
      <div className="w-full max-w-md rounded-xl border border-ocean/20 bg-ocean/5 px-4 py-3 text-xs text-ocean shadow-sm">
        <div className="font-semibold uppercase tracking-wider mb-1">
          {event.type.replace("_", " ")}
        </div>

        <div className="text-ink/80 text-sm">
          {renderTimelineContent(event)}
        </div>

        <div className="mt-2 text-[10px] text-ink/40">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function renderTimelineContent(event: CaseTimelineEvent) {
  switch (event.type) {
    case "delivery":
      return event.summary;

    case "followup":
      return `Follow-up • ${event.kind}`;

    case "gap":
      return `${event.label} • ${
        event.status === "missing" ? "Missing" : "Upcoming"
      }`;

    case "window":
      return `Window ${event.status} • closes ${new Date(
        event.closesAt,
      ).toLocaleDateString()}`;

    default:
      return "";
  }
}

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Used only for timeline feed items.
   - No store access.
   - Keep projection logic here, not in container.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If timeline events gain metadata (severity, actor,
   linked entity), extend CaseTimelineEvent and enhance
   rendering here without touching chat domain.
========================================================= */
