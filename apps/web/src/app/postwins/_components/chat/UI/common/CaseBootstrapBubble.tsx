// src/app/xotic/postwins/_components/chat/bubbles/CaseBootstrapBubble.tsx
// Purpose: Dedicated bubble for rendering CASE_BOOTSTRAP system events in the chat timeline.

/* =============================================================================
Assumptions
------------------------------------------------------------------------------
• ThreadMessage type exists in ../../store/types
• Backend inserts SYSTEM_EVENT message with metadata.systemEvent === "CASE_BOOTSTRAP"
• MessagesSurface will route this message to this component
=============================================================================*/

"use client";

import { FilePlus2 } from "lucide-react";
import type { ThreadMessage } from "../../store/types";

/* =============================================================================
Types
=============================================================================*/

type Props = {
  message: ThreadMessage;
};

/* =============================================================================
Component
=============================================================================*/

export function CaseBootstrapBubble({ message }: Props) {
  const metadata = message.metadata as Record<string, any> | null;

  const referenceCode = metadata?.referenceCode ?? "CASE";

  return (
    <div className="flex justify-center my-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 shadow-sm">
        <FilePlus2 className="w-4 h-4 shrink-0" />

        <div className="flex flex-col leading-tight">
          <span className="font-semibold">Case {referenceCode} created</span>

          <span className="text-[11px] opacity-70">
            Intake initialized and ready for review
          </span>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
Design reasoning
------------------------------------------------------------------------------
A dedicated component prevents overloading ChatBubble with system-specific
rendering logic. Case creation is a structural event in the lifecycle, not a
conversation message, so it deserves its own renderer.

This separation keeps the UI architecture clean and allows additional system
events to be implemented without complicating existing chat bubbles.
=============================================================================*/

/* =============================================================================
Structure
------------------------------------------------------------------------------
CaseBootstrapBubble
  • Receives ThreadMessage
  • Extracts metadata.referenceCode
  • Renders centered lifecycle event bubble
=============================================================================*/

/* =============================================================================
Implementation guidance
------------------------------------------------------------------------------
MessagesSurface must detect the system event and route to this component:

if (
  item.data.type === "SYSTEM_EVENT" &&
  item.data.metadata?.systemEvent === "CASE_BOOTSTRAP"
) {
  return <CaseBootstrapBubble message={item.data} />
}

=============================================================================*/

/* =============================================================================
Scalability insight
------------------------------------------------------------------------------
Additional lifecycle bubbles can follow the same pattern:

CaseRoutedBubble
VerificationStartedBubble
ExecutionStartedBubble
CaseClosedBubble

Each maps to a ledger event but stays visually distinct from user chat.
=============================================================================*/
