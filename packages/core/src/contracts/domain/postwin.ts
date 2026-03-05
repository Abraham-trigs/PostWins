// packages/core/src/contracts/domain/postwin.ts
// Purpose: Canonical transport-safe read-model DTO representing a projected Case domain object.
// This contract is shared across backend and frontend. It MUST remain persistence-agnostic
// and must never import Prisma types.

// Assumptions:
// - packages/core/generated/enums.ts exists and is generated from Prisma.
// - AuditRecord and PostaContext are already transport-safe types.
// - Backend projection services assemble this DTO from Case + related records.

import type { AuditRecord } from "./integrity";
import type { PostaContext } from "./context";

import type {
  CaseStatus,
  CaseLifecycle,
  CaseType,
  OperationalMode,
  AccessScope,
  TaskId,
  VerificationStatus,
  RoutingOutcome,
} from "../../generated/enums";

// routingStatus

/**
 * PostWin
 *
 * Query-side projection of the Case domain assembled from:
 * - Case
 * - CaseAssignment
 * - RoutingDecision (latest)
 * - VerificationRecord (latest)
 * - AuditEntry
 *
 * This is NOT a persistence model.
 * It is a transport-safe DTO returned by API responses and consumed by frontend stores.
 */
export type PostWin = {
  // ---------------------------------------------------------------------------
  // Core identity
  // ---------------------------------------------------------------------------

  /** Unique Case identifier (UUID) */
  id: string;

  /** Human readable reference used externally */
  referenceCode: string;

  // ---------------------------------------------------------------------------
  // Lifecycle authority
  // ---------------------------------------------------------------------------

  /** Canonical case status from Case.status */
  status: CaseStatus;

  /** Derived lifecycle state (from lifecycle engine / ledger reconciliation) */
  lifecycle: CaseLifecycle;

  // ---------------------------------------------------------------------------
  // Domain classification
  // ---------------------------------------------------------------------------

  /** Domain case classification */
  type: CaseType;

  /** Operational execution mode */
  mode: OperationalMode;

  /** Visibility scope of the case */
  scope: AccessScope;

  // ---------------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------------

  /** Optional beneficiary entity */
  beneficiaryId?: string | null;

  /** Execution authority assigned to the case */
  assignedBodyId?: string | null;

  /** Current workflow task */
  taskId?: string | null;
  // ---------------------------------------------------------------------------
  // SDG mapping
  // ---------------------------------------------------------------------------

  /** Sustainable development goal reference (singular per schema) */
  sdgGoal?: string | null;

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /** Human readable summary */
  summary?: string | null;

  // ---------------------------------------------------------------------------
  // Derived states (computed during projection)
  // ---------------------------------------------------------------------------

  /** Latest routing outcome state */
  routingStatus?: RoutingOutcome | null;
  /** Latest verification outcome */
  verificationStatus?: VerificationStatus | null;

  // ---------------------------------------------------------------------------
  // Audit
  // ---------------------------------------------------------------------------

  /** Immutable audit history associated with the case */
  auditTrail?: AuditRecord[];

  // ---------------------------------------------------------------------------
  // Contextual enrichments
  // ---------------------------------------------------------------------------

  /** Context snapshot captured during intake or execution */
  context?: PostaContext;

  /** Localization confidence metadata */
  localization?: {
    confidence?: number;
  };

  /** Optional geolocation (transport safe) */
  location?: {
    lat?: number | null;
    lng?: number | null;
  };

  // ---------------------------------------------------------------------------
  // Transport-safe timestamp
  // ---------------------------------------------------------------------------

  /** Case creation timestamp serialized to ISO string */
  createdAt: string;
};

/**
 * Design reasoning
 *
 * This DTO represents a query-side projection of the Case domain rather than a
 * persistence model. The backend aggregates multiple sources (Case, Assignment,
 * RoutingDecision, VerificationRecord, AuditEntry) and returns a normalized
 * structure for clients. Enums are imported from the generated core enum module
 * to guarantee backend/frontend type alignment. All fields are JSON-safe to
 * prevent Prisma types (Date, Decimal, BigInt) leaking across the API boundary.
 */

/**
 * Structure
 *
 * - PostWin
 *   Core identity
 *   Lifecycle authority
 *   Domain classification
 *   Relationships
 *   SDG mapping
 *   Content
 *   Derived states
 *   Audit trail
 *   Context enrichments
 *   Transport-safe timestamp
 */

/**
 * Implementation guidance
 *
 * Backend projection layer should assemble this DTO through a mapper:
 *
 * Prisma models
 *   Case
 *   CaseAssignment
 *   RoutingDecision
 *   VerificationRecord
 *   AuditEntry
 *
 * Mapper example flow:
 *
 * const dto: PostWin = {
 *   id: case.id,
 *   referenceCode: case.referenceCode,
 *   status: case.status,
 *   lifecycle: deriveLifecycle(case),
 *   type: case.type,
 *   mode: case.mode,
 *   scope: case.scope,
 *   beneficiaryId: case.beneficiaryId,
 *   assignedBodyId: assignment?.executionBodyId ?? null,
 *   taskId: case.currentTaskDefinitionId ?? null,
 *   sdgGoal: case.sdgGoal,
 *   summary: case.summary,
 *   routingStatus: routing?.outcome ?? null,
 *   verificationStatus: verification?.status ?? null,
 *   auditTrail,
 *   context,
 *   localization,
 *   location,
 *   createdAt: case.createdAt.toISOString()
 * }
 */

/**
 * Scalability insight
 *
 * As the system evolves toward event-ledger authority, PostWin can become a
 * fully materialized read model produced by a projection service or background
 * reconciler rather than assembled synchronously. This allows the API layer to
 * serve consistent snapshots while ledger events continue to append
 * asynchronously.
 */

/**
 * Example usage
 *
 * const postWin: PostWin = {
 *   id: "case_123",
 *   referenceCode: "PW-2026-001",
 *   status: "EXECUTING",
 *   lifecycle: "EXECUTING",
 *   type: "EXECUTION",
 *   mode: "AI_AUGMENTED",
 *   scope: "INTERNAL",
 *   createdAt: new Date().toISOString()
 * }
 */
