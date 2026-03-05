// packages/core/src/types.ts
// Purpose: Canonical shared domain contracts using generated Prisma enums to eliminate duplication and drift.

////////////////////////////////////////////////////////////
// ASSUMPTIONS
////////////////////////////////////////////////////////////
// - Prisma enum types are generated into: packages/core/src/generated/enums.ts
// - This file is consumed across backend + web.
// - No service relies on local string literal unions anymore.

////////////////////////////////////////////////////////////
// IMPORT GENERATED ENUM TYPES
////////////////////////////////////////////////////////////

import type {
  CaseLifecycle,
  CaseStatus,
  CaseType,
  AccessScope,
  RoutingOutcome,
  OperationalMode,
  VerificationStatus,
  MessageType,
} from "./generated/enums";

////////////////////////////////////////////////////////////
// DISBURSEMENT DOMAIN TYPES
////////////////////////////////////////////////////////////

/**
 * PayeeKind
 *
 * Represents the identity class receiving funds.
 * This is intentionally defined at the contract layer
 * because the Prisma schema currently stores payeeKind
 * as a String (not enum).
 *
 * This allows backend + frontend to share the same
 * type safety without forcing a schema migration.
 */
export const PAYEE_KINDS = [
  "ORGANIZATION",
  "USER",
  "EXTERNAL_ACCOUNT",
] as const;

export type PayeeKind = (typeof PAYEE_KINDS)[number];

/**
 * Shared disbursement contract used by UI + services.
 */
export interface DisbursementDestination {
  kind: PayeeKind;
  id: string;
}

///////////////////////////////
// CASE LIST + DETAILS TYPES //
///////////////////////////////

export interface CaseListItem {
  id: string;

  lifecycle: CaseLifecycle;
  type: CaseType;
  scope: AccessScope;

  sdgGoal: string | null;
  summary: string | null;

  currentTaskId: string | null;
  currentTaskLabel: string | null;

  routingOutcome: RoutingOutcome;

  createdAt: string;
  updatedAt: string;

  lastMessage: null | {
    body: string;
    type: MessageType;
    createdAt: string;
  };
}

export interface ListCasesResponse {
  ok: true;
  cases: CaseListItem[];
  meta: {
    nextCursor: string | null;
    limit: number;
  };
}

/**
 * Authoritative case details projection.
 * Backend guarantees tenant isolation + role-gated PII.
 */
export interface CaseDetailsResponse {
  ok: true;
  case: {
    id: string;
    referenceCode: string;

    lifecycle: CaseLifecycle;
    status: CaseStatus;

    type: CaseType;
    scope: AccessScope;

    sdgGoal: string | null;
    summary: string | null;

    createdAt: string;
    updatedAt: string;

    currentTask: {
      id: string | null;
      label: string | null;
    };

    beneficiary: null | {
      id: string;
      profile: Record<string, unknown> | null;
      pii: null | {
        phone: string | null;
        address: string | null;
        dateOfBirth: string | null;
      };
    };

    assignedStaff: null | {
      id: string;
      name: string | null;
      email: string | null;
    };

    latestRoutingOutcome: RoutingOutcome;

    lastMessage: null | {
      body: string;
      type: string;
      createdAt: string;
    };
  };
}

///////////////////////////////
// CORE DOMAIN TYPES //
///////////////////////////////

export interface PostWinContext {
  /**
   * Heuristic persona inferred during intake.
   * Advisory only. Never used for authorization or governance.
   */
  persona: "AUTHOR" | "BENEFICIARY" | "VERIFIER" | "NGO_PARTNER";

  isImplicit: boolean;
}

export type RoutingStatus = RoutingOutcome;

export type OwnershipStatus =
  | "UNOWNED"
  | "ACCEPTED"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED";

export interface PostWin {
  id: string;

  taskId: string;

  location?: { lat: number; lng: number };

  preferredBodyId?: string;
  assignedBodyId?: string;

  routingStatus: RoutingStatus;
  ownershipStatus: OwnershipStatus;

  verificationRecords: VerificationRecord[];
  auditTrail: AuditEntry[];

  notes?: string;
  description: string;

  beneficiaryId: string;
  authorId: string;

  sdgGoals: ("SDG_4" | "SDG_5")[];

  verificationStatus: VerificationStatus;

  mode: OperationalMode;

  localization?: LocalizationContext;
}

////////////////////////
// VERIFICATION TYPES //
////////////////////////

export interface VerificationRecord {
  sdgGoal: string;
  requiredVerifiers: number;
  receivedVerifications: string[];
  consensusReached: boolean;
  timestamps: {
    routedAt: string;
    verifiedAt?: string;
  };
}

export interface AuditEntry {
  action: string;
  actor: string;
  timestamp: string;
  assignedBodyId?: string;
  note?: string;
}

export interface AuditRecord {
  timestamp: number;
  postWinId: string;
  action:
    | "INTAKE"
    | "ROUTED"
    | "ACCEPTED"
    | "VERIFIED"
    | "FLAGGED"
    | "EXECUTED";
  actorId: string;
  previousState: string;
  newState: string;
  commitmentHash: string;
  signature: string;
}

export interface LedgerCommitment {
  hash: string;
  signature: string;
}

export interface VerificationStep {
  role: "VERIFIER" | "NGO_PARTNER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  timestamp?: number;
  verifierId?: string;
}

export interface PostWinVerification {
  postWinId: string;
  requiredConsensus: number;
  steps: VerificationStep[];
  startedAt: number;
}

export interface IntegrityFlag {
  type: "DUPLICATE_CLAIM" | "SUSPICIOUS_TONE" | "IDENTITY_MISMATCH";
  severity: "LOW" | "HIGH";
  timestamp: number;
}

/////////////////////////
// JOURNEY + EXECUTION //
/////////////////////////

export interface Task {
  id: string;
  order: number;
  label: string;
  requiredForSdg: "SDG_4" | "SDG_5";
  dependencies: string[];
}

export interface Journey {
  id: string;
  beneficiaryId: string;
  currentTaskId: string;
  completedTaskIds: string[];
}

export interface ExecutionBody {
  id: string;
  name: string;
  location: { lat: number; lng: number; radius: number };
  capabilities: ("SDG_4" | "SDG_5")[];
  trustScore: number;
}

export interface LocalizationContext {
  detectedLanguage: string;
  confidence: number;
  regionalDialect?: string;
  requiresTranslation: boolean;
}

export const KHALISTAR_ID = "KHALISTAR";

////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////
// - Removes all duplicated enum unions and imports canonical Prisma-generated types.
// - Guarantees compile-time drift detection across backend and frontend.
// - Enforces single source of truth: schema → generated → shared types.
// - Prevents silent enum mismatch in distributed systems.

////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////
// - Prisma enum imports at top.
// - All projections reference generated enum types.
// - Domain interfaces remain unchanged structurally.
// - No inline lifecycle/status/type/scope literal duplication.

////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////
// - Regenerate enums after every Prisma schema change.
// - Never redefine enum unions locally again.
// - If compilation breaks after enum change, fix mapping layers instead of casting.
// - Avoid `as any` or string coercion in controllers.

////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////
// This makes enum evolution explicit and safe across microservices,
// edge clients, workers, and future SDKs without contract drift.
////////////////////////////////////////////////////////////
