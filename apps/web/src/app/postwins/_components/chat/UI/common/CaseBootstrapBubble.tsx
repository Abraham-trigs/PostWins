// src/app/xotic/postwins/_components/chat/components/CaseBootstrapBubble.tsx
// Purpose: Renders a system lifecycle bubble when a case is initialized (CASE_BOOTSTRAP event)

"use client";

import React from "react";
import { FilePlus2 } from "lucide-react";
import type { ChatMessage } from "../../store/types";

/* ============================================================================
Assumptions
----------------------------------------------------------------------------
• UI pipeline uses ChatMessage (normalized from backend ThreadMessage)
• Lifecycle metadata is injected during mapping:
      metadata.systemEvent === "CASE_BOOTSTRAP"
      metadata.referenceCode
============================================================================ */

/* ============================================================================
Types
============================================================================ */

export interface CaseBootstrapBubbleProps {
  message: ChatMessage;
}

/* ============================================================================
Component
============================================================================ */

export function CaseBootstrapBubble({ message }: CaseBootstrapBubbleProps) {
  /**
   * ChatMessage is a union type. Some variants may not contain metadata,
   * so we access it defensively.
   */
  const metadata =
    (message as unknown as { metadata?: Record<string, unknown> }).metadata ??
    null;

  const referenceCode =
    (metadata as { referenceCode?: string } | null)?.referenceCode ?? "CASE";

  return (
    <div className="flex justify-center my-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 shadow-sm">
        <FilePlus2 className="w-4 h-4 shrink-0" />

        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Case {referenceCode} created
          </span>

          <span className="text-[11px] opacity-70">
            Intake initialized and ready for review
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
Design reasoning
----------------------------------------------------------------------------
This component renders lifecycle system messages without coupling UI to the
backend ThreadMessage domain model. By accepting ChatMessage, it stays aligned
with the UI message pipeline:

BackendMessage
   ↓
mapBackendMessageToChatMessage()
   ↓
ChatMessage
   ↓
MessagesSurface
   ↓
CaseBootstrapBubble

The component defensively accesses metadata because ChatMessage is a union
type that may represent different UI message variants.
============================================================================ */

/* ============================================================================
Structure
----------------------------------------------------------------------------
CaseBootstrapBubble
• Receives ChatMessage
• Extracts lifecycle metadata safely
• Displays system lifecycle event UI
============================================================================ */

/* ============================================================================
Implementation guidance
----------------------------------------------------------------------------
MessagesSurface should route lifecycle events like:

if (meta?.systemEvent === "CASE_BOOTSTRAP") {
   return <CaseBootstrapBubble message={item.data} />
}

This keeps ChatBubble purely conversational.
============================================================================ */

/* ============================================================================
Scalability insight
----------------------------------------------------------------------------
Future lifecycle events can reuse this pattern:

CASE_ROUTED
VERIFICATION_STARTED
EXECUTION_STARTED
CASE_CLOSED

Each event can map to a dedicated lifecycle bubble without modifying the
core chat renderer.
============================================================================ */
