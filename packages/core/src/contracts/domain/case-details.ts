// packages/core/src/contracts/cases/case-details.ts
// Purpose: Canonical HTTP contract for GET /api/cases/:id

import type {
  CaseLifecycle,
  RoutingOutcome,
  VerificationStatus,
} from "../../generated/enums";

/**
 * Design reasoning
 * ------------------------------------------------------------
 * This represents the detailed projection returned when a
 * single case is requested.
 *
 * It is transport-safe:
 * - No Prisma types
 * - Dates serialized as ISO strings
 * - Enums sourced from generated Prisma enums
 */

export type CaseDetails = {
  id: string;

  referenceCode: string;
  status: string;

  lifecycle: CaseLifecycle;
  routingOutcome: RoutingOutcome | null;
  verificationStatus: VerificationStatus | null;

  type: string;
  scope: string;

  sdgGoal: string | null;
  summary: string | null;

  currentTask: {
    label: string;
  } | null;

  beneficiary?: {
    id: string;
    pii?: {
      phone?: string | null;
      address?: string | null;
      dateOfBirth?: string | null;
    };
  } | null;

  assignedStaff?: {
    name?: string | null;
    email?: string | null;
  } | null;

  createdAt: string;
  updatedAt: string;
};

export type CaseDetailsResponse = {
  ok: true;
  case: CaseDetails;
};

/**
 * Structure
 * ------------------------------------------------------------
 * - CaseDetails
 * - CaseDetailsResponse
 */

/**
 * Implementation guidance
 * ------------------------------------------------------------
 * Backend controller must map Prisma models explicitly
 * and serialize dates to ISO strings.
 *
 * Example:
 *
 * return {
 *   ok: true,
 *   case: mapper(caseRow)
 * }
 */

/**
 * Scalability insight
 * ------------------------------------------------------------
 * Additional projections like execution, decision,
 * disbursement, or audit trail should be added as
 * optional additive fields to CaseDetails.
 */
