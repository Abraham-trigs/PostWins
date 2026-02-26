// src/evidence/evidence.types.ts

import { z } from "zod";

export const EvidenceItemSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid().nullable(),
  kind: z.string(),
  title: z.string().nullable(),
  originalFilename: z.string().nullable(),
  mimeType: z.string().nullable(),
  byteSize: z.number().nullable(),
  createdAt: z.string().datetime(),
  timelineEntryId: z.string().uuid().nullable(),
  caseTaskId: z.string().uuid().nullable(),
  verificationRecordId: z.string().uuid().nullable(),
  approvalRequestId: z.string().uuid().nullable(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const EvidenceListSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  items: z.array(EvidenceItemSchema),
});

export type EvidenceList = z.infer<typeof EvidenceListSchema>;
