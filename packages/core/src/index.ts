// packages/core/src/index.ts
// Permissive shared types to unblock backend compilation.
// Tighten later when runtime + DB schema stabilizes.

export type UUID = string;

export type AuditRecord = {
  action?: string;
  ts?: number | bigint;

  // legacy/alternate field names used in backend code
  timestamp?: number | string;
  actor?: string;
  actorId?: string;
  note?: string;
  assignedBodyId?: string;

  actorKind?: "HUMAN" | "SYSTEM" | string;
  actorUserId?: UUID | null;
  payload?: unknown;

  [k: string]: any;
};

export type LedgerCommitment = {
  tenantId: UUID;
  caseId?: UUID | null;

  // some code uses postWinId; allow it (we’ll normalize to caseId later)
  postWinId?: UUID;

  eventType: string;

  // Prisma BigInt + JS number both appear in your codepaths
  ts: number | bigint;

  actorKind: "HUMAN" | "SYSTEM" | string;
  actorUserId?: UUID | null;

  payload: unknown;
  supersedesCommitId?: UUID | null;

  [k: string]: any;
};

export type LocalizationContext = {
  locale?: string;
  country?: string;
  region?: string;

  // used by backend localization.service.ts
  detectedLanguage?: string;
  requiresTranslation?: boolean;
  regionalDialect?: string;
  confidence?: number;

  [k: string]: any;
};

export type PostaContext = {
  tenantId?: UUID;
  userId?: UUID | null;

  intent?: string;
  literacyLevel?: string;
  role?: string;

  localization?: LocalizationContext;

  [k: string]: any;
};

export type IntegrityFlag = {
  // backend uses type/severity/timestamp
  type?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | string;
  timestamp?: number;

  // older shape
  code?: string;
  details?: string;

  [k: string]: any;
};

export type VerificationRecord = {
  id?: UUID;
  sdgGoal: string;
  requiredVerifiers: number;

  consensusReached?: boolean;
  routedAt?: string | Date;
  verifiedAt?: string | Date | null;

  // backend uses these fields
  receivedVerifications?: string[];
  timestamps?: { verifiedAt?: string; routedAt?: string };

  [k: string]: any;
};

export type ExecutionBody = {
  id: UUID;

  name?: string;
  trustScore?: number;

  // DB has Json; code sometimes assumes array or structured object
  capabilities: any;

  location?: { lat: number; lng: number; radius?: number };

  isFallback?: boolean;

  [k: string]: any;
};

export type Task = {
  id: string;

  order?: number;
  label?: string;
  requiredForSdg?: string;

  dependencies: string[];

  [k: string]: any;
};

export type Journey = {
  id?: string;
  currentTaskId?: string;
  completedTaskIds: string[];

  [k: string]: any;
};

export type PostWin = {
  id?: UUID;
  tenantId?: UUID;

  sdgGoals: string[];

  // used by routing/intake code
  beneficiaryId?: string;
  authorId?: string;
  description?: string;

  taskId?: string;
  preferredBodyId?: string;

  assignedBodyId?: string;
  routingStatus?: string;
  verificationStatus?: string;

  notes?: string;

  location?: { lat: number; lng: number };
  localization?: LocalizationContext;

  verificationRecords?: VerificationRecord[];
  auditTrail?: AuditRecord[];

  context?: PostaContext;

  [k: string]: any;
};

export const KHALISTAR_ID = "KHALISTAR" as const;

// Backend expects SDG_TARGETS.SDG_4.PRIMARY etc.
export const SDG_TARGETS = {
  SDG_4: { PRIMARY: "SDG_4_PRIMARY", LITERACY: "SDG_4_LITERACY" },
  SDG_5: { EMPOWERMENT: "SDG_5_EMPOWERMENT" },
} as const;
