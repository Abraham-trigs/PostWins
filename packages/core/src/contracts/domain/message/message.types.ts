// src/message/message.types.ts

import { z } from "zod";

export const MessageAuthorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const MessageEvidenceSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  storageKey: z.string(),
  sha256: z.string(),
  mimeType: z.string().nullable(),
  byteSize: z.number().nullable(),
  createdAt: z.string().datetime(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  authorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  type: z.string(),
  body: z.string().nullable(),
  createdAt: z.string().datetime(),
  navigationContext: z.any().nullable(),
  author: MessageAuthorSchema,
  evidence: z.array(MessageEvidenceSchema),
  _count: z.object({
    replies: z.number(),
  }),
});

export const PaginatedMessagesSchema = z.object({
  data: z.array(MessageSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type PaginatedMessages = z.infer<typeof PaginatedMessagesSchema>;

export type Message = z.infer<typeof MessageSchema>;
