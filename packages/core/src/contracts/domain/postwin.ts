// packages/core/src/contracts/domain/postwin.ts
// Purpose: Canonical transport-safe PostWin contract mirroring backend usage.

import type { AuditRecord } from "./integrity";
import type { PostaContext } from "./context";

export type PostWin = {
  id: string;

  type?: string;

  beneficiaryId?: string;

  sdgGoals: string[];

  description?: string | null;

  mode?: string;

  intent?: string;

  scope?: string;

  notes?: string;

  assignedBodyId?: string;

  verificationStatus?: string;

  routingStatus?: string;

  taskId?: string;

  auditTrail?: AuditRecord[];

  context?: PostaContext;

  localization?: {
    confidence?: number;
  };

  location?: {
    lat: number;
    lng: number;
  };

  createdAt?: string;
};
