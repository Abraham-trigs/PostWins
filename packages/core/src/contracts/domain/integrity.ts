// packages/core/src/contracts/domain/integrity.ts
// Purpose: Audit + integrity transport contracts

export type IntegritySeverity = "LOW" | "HIGH";

export type IntegrityFlag = {
  type: "IDENTITY_MISMATCH" | "SUSPICIOUS_TONE" | "DUPLICATE_CLAIM";
  severity: IntegritySeverity;
  timestamp: number;
};

export type AuditRecord = {
  timestamp: number;
  action: string;
  actor: string;
  note?: string;
};
