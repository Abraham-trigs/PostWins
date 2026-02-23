// packages/core/src/contracts/domain/ledger.ts
// Purpose: Canonical transport contract mirroring Prisma LedgerCommit model.
// Persistence-agnostic (no Prisma import). Dates serialized as ISO strings.

export type LedgerCommitment = {
  id: string;

  tenantId: string;

  caseId?: string | null;

  eventType: string;

  actorKind: string;

  actorUserId?: string | null;

  authorityProof?: string | null;

  payload?: unknown | null;

  metadata?: Record<string, unknown> | null;

  signature?: string | null;

  createdAt?: string; // optional — backend may not return it immediately
};
