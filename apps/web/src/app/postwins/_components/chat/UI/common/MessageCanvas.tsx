// xotic/_components/chat/MessageCanvas.tsx
// Purpose: Chat layout wrapper. Rendering handled by MessagesSurface via store.

"use client";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   MessagesSurface is store-driven and does not accept props.
   Passing messages/onAction breaks its contract.
   MessageCanvas should remain a layout wrapper only.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   - MessageCanvas component (thin wrapper)
========================================================= */

import { MessagesSurface } from "./MessagesSurface";

export function MessageCanvas() {
  return <MessagesSurface />;
}

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Optimistic message creation must live in Composer layer.
   - Do not push message mutations from layout layer.
   - MessagesSurface remains purely presentational.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   Keeping MessageCanvas stateless prevents future
   tight coupling between layout and message lifecycle.
========================================================= */
