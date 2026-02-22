// packages/core/src/contracts/cases/case-list.ts
// Purpose: Canonical HTTP contract for GET /api/cases

import type { CaseLifecycle, RoutingOutcome } from "../../generated/enums";

/**
 * Design reasoning
 * ------------------------------------------------------------
 * This is a transport-layer contract.
 * It mirrors backend output exactly.
 * Dates are ISO strings.
 * Enums come from generated Prisma source.
 * Any change here = API change.
 */

/* ============================================================
   Routing Snapshot
   ============================================================ */

// export type RoutingOutcome = "UNASSIGNED" | "MATCHED" | "FALLBACK" | "BLOCKED";

/* ============================================================
   Last Message Projection
   ============================================================ */

export type CaseLastMessage = {
  body: string | null;
  type: string;
  createdAt: string; // ISO string
} | null;

/* ============================================================
   Case List Item
   ============================================================ */

export type CaseListItem = {
  id: string;

  lifecycle: CaseLifecycle;

  routingOutcome: RoutingOutcome;

  currentTask: string;
  type: string;
  scope: string;

  sdgGoal: string | null;
  summary: string | null;

  createdAt: string;
  updatedAt: string;

  lastMessage: CaseLastMessage;
};

/* ============================================================
   Response Shape
   ============================================================ */

export type ListCasesResponse = {
  ok: true;
  cases: CaseListItem[];
  meta: {
    nextCursor: string | null;
    limit: number;
  };
};

/* ============================================================
   Structure
   ------------------------------------------------------------
   - RoutingOutcome
   - CaseLastMessage
   - CaseListItem
   - ListCasesResponse
   ============================================================ */

/* ============================================================
   Implementation guidance
   ------------------------------------------------------------
   Backend:
     - Must serialize Date → ISO string.
     - Must map Prisma → this shape explicitly.

   Frontend:
     - Import CaseListItem from @posta/core.
     - Never redefine locally.
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   Add pagination metadata as optional additive field later.
   Never remove fields once public.
   ============================================================ */
