// src/websocket/events.ts

import { z } from "zod";
import { MessageSchema } from "../message/message.types";

export const WsMessageCreated = z.object({
  type: z.literal("MESSAGE_CREATED"),
  payload: MessageSchema,
});

export const WsMessageAck = z.object({
  type: z.literal("MESSAGE_ACK"),
  payload: z.object({
    clientMutationId: z.string().uuid(),
    messageId: z.string().uuid(),
  }),
});

export const WsTypingUpdate = z.object({
  type: z.literal("TYPING_UPDATE"),
  payload: z.object({
    userId: z.string().uuid(),
    isTyping: z.boolean(),
  }),
});

export const WsReceipt = z.object({
  type: z.literal("MESSAGE_RECEIPT"),
  payload: z.object({
    messageId: z.string().uuid(),
    userId: z.string().uuid(),
    deliveredAt: z.string().datetime().optional(),
    seenAt: z.string().datetime().optional(),
  }),
});

export const WsUnreadDelta = z.object({
  type: z.literal("UNREAD_DELTA"),
  payload: z.object({
    caseId: z.string().uuid(),
    delta: z.number(),
  }),
});

export const WsEventSchema = z.discriminatedUnion("type", [
  WsMessageCreated,
  WsMessageAck,
  WsTypingUpdate,
  WsReceipt,
  WsUnreadDelta,
]);

export type WsEvent = z.infer<typeof WsEventSchema>;
