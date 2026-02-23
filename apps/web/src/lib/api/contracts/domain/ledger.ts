/**
 * LEDGER COMMUNICATION CONTRACT (FRONTEND)
 *
 * - These types describe data RECEIVED from the backend.
 * - They are NOT ledger-internal types.
 * - They must remain JSON-safe and UI-oriented.
 * - No cryptography, no BigInt, no workflow inference.
 *
 * If you need to change these, you are changing the API.
 */

/* -------------------------------------------------------------------------- */
/* Enums (string unions for stability)                                         */
/* -------------------------------------------------------------------------- */

export type ActorKindDTO = "HUMAN" | "SYSTEM";

export type LedgerEventTypeDTO =
  | "CASE_CREATED"
  | "CASE_UPDATED"
  | "CASE_CLOSED"
  | "LEGACY_EVENT";

/* -------------------------------------------------------------------------- */
/* Ledger Audit Record                                                         */
/* -------------------------------------------------------------------------- */

export interface LedgerAuditDTO {
  /** Epoch milliseconds */
  ts: number;

  tenantId: string;
  caseId: string | null;

  eventType: LedgerEventTypeDTO;
  actorKind: ActorKindDTO;
  actorUserId: string | null;

  /**
   * Opaque payload.
   * The UI may display or pattern-match,
   * but must not infer workflow state.
   */
  payload: Record<string, unknown>;

  /**
   * Optional audit-only fields.
   * Present only if the API exposes them.
   */
  commitmentHash?: string;
  signature?: string;

  /* ---------------------------------------------------------------------- */
  /* Legacy transport metadata (display-only)                                */
  /* ---------------------------------------------------------------------- */

  action?: string;
  actorId?: string;
  previousState?: unknown;
  newState?: unknown;
  postWinId?: string;
}

/* -------------------------------------------------------------------------- */
/* Ledger Health                                                              */
/* -------------------------------------------------------------------------- */

export interface LedgerHealthDTO {
  status: "HEALTHY" | "CORRUPTED";
  checkedAt: number;
  recordCount: number;
  publicKeyPresent: boolean;
  note?: string;
}
