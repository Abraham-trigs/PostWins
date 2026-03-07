// File: packages/core/src/contracts/domain/message/message.types.ts
// Purpose: Transport-safe message DTO validation for thread messages used across
// frontend contracts and API boundaries (does NOT define the canonical enum).

/* =============================================================================
Assumptions
------------------------------------------------------------------------------
• Canonical MessageType for persistence lives in Prisma schema.
• Backend uses: import { MessageType } from "@prisma/client".
• This file is only responsible for transport validation and DTO safety.
• Avoid exporting MessageType here to prevent collisions with generated enums.
=============================================================================*/

/* =============================================================================
Design reasoning
------------------------------------------------------------------------------
Transport contracts should remain independent from persistence layers.
The backend owns the authoritative enum via Prisma. This contract layer
only validates API payloads using Zod.

This prevents enum drift across:

Prisma (persistence)
Backend services
Frontend contracts
=============================================================================*/

/* =============================================================================
Structure
------------------------------------------------------------------------------
MessageAuthorSchema
MessageEvidenceSchema
MessageTypeSchema
MessageSchema
PaginatedMessagesSchema
=============================================================================*/

import { z } from "zod";

/* =============================================================================
Author DTO
=============================================================================*/

export const MessageAuthorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

/* =============================================================================
Evidence DTO
=============================================================================*/

export const MessageEvidenceSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  storageKey: z.string(),
  sha256: z.string(),
  mimeType: z.string().nullable(),
  byteSize: z.number().nullable(),
  createdAt: z.string().datetime(),
});

/* =============================================================================
Message Type Validation
------------------------------------------------------------------------------
Must match Prisma enum values but is NOT exported as a TypeScript type to
avoid duplicate exports across the monorepo.
=============================================================================*/

export const MessageTypeSchema = z.enum([
  "DISCUSSION",
  "FOLLOW_UP",
  "VERIFICATION_REQUEST",
  "COUNTER_CLAIM",
  "EVIDENCE_SUBMISSION",
  "SYSTEM_EVENT",
]);

/* =============================================================================
Message DTO
=============================================================================*/

export const MessageSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  authorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),

  type: MessageTypeSchema,

  body: z.string().nullable(),

  createdAt: z.string().datetime(),

  navigationContext: z.any().nullable(),

  metadata: z.record(z.any()).nullable().optional(),

  author: MessageAuthorSchema,

  evidence: z.array(MessageEvidenceSchema),

  _count: z.object({
    replies: z.number(),
  }),
});

/* =============================================================================
Pagination wrapper
=============================================================================*/

export const PaginatedMessagesSchema = z.object({
  data: z.array(MessageSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

/* =============================================================================
Types
=============================================================================*/

export type PaginatedMessages = z.infer<typeof PaginatedMessagesSchema>;
export type Message = z.infer<typeof MessageSchema>;

/* =============================================================================
Implementation guidance
------------------------------------------------------------------------------
Backend:

import { MessageType } from "@prisma/client"

type: MessageType.SYSTEM_EVENT

Frontend:

Validate server responses using MessageSchema.parse(response)

Chat UI should detect system events via:

message.type === "SYSTEM_EVENT"
=============================================================================*/

/* =============================================================================
Scalability insight
------------------------------------------------------------------------------
Future governance timeline events can be projected into chat via:

SYSTEM_EVENT metadata.systemEvent values such as:

CASE_CREATED
CASE_ROUTED
VERIFICATION_STARTED
VERIFICATION_APPROVED
EXECUTION_STARTED
EXECUTION_PROGRESS_RECORDED
CASE_CLOSED

This preserves a readable governance timeline in chat without expanding
the core Case schema.
=============================================================================*/

/* =============================================================================
Example validation
------------------------------------------------------------------------------
MessageSchema.parse({
  id: crypto.randomUUID(),
  caseId: crypto.randomUUID(),
  authorId: crypto.randomUUID(),
  parentId: null,
  type: "SYSTEM_EVENT",
  body: "Case initialized",
  createdAt: new Date().toISOString(),
  navigationContext: null,
  metadata: null,
  author: { id: crypto.randomUUID(), name: "System" },
  evidence: [],
  _count: { replies: 0 }
})
=============================================================================*/
