// src/services/websocket.service.ts
// Purpose: Case-scoped resilient WebSocket transport with full lifecycle control,
// explicit typing + seen + read tracking, ACK reconciliation, receipt propagation,
// unread delta/reset handling, and deterministic reconnect behavior.

/* =============================================================================
Design reasoning
------------------------------------------------------------------------------
The backend strictly expects UUID caseIds for both REST and WebSocket routes.
However the UI temporarily uses draft identifiers (e.g. draft_<uuid>) before
bootstrap completes. Passing these directly to the backend causes Prisma UUID
errors.

This service now normalizes incoming case identifiers by stripping the
"draft_" prefix before building the WebSocket URL.

This guarantees:
• backend always receives a UUID
• websocket connections never fail due to prefixed draft ids
• store logic can still use draft ids internally if needed
=============================================================================*/

/* =============================================================================
Structure
------------------------------------------------------------------------------
WebSocketService
  • connect()
  • disconnect()
  • sendTypingStart()
  • sendTypingStop()
  • sendSeen()
  • sendReadUpTo()
  • internal batching helpers
=============================================================================*/

"use client";

import { usePostWinStore } from "../app/postwins/_components/chat/store/usePostWinStore";
import type { BackendMessage } from "@/lib/api/contracts/domain/message";
import { mapBackendMessageToChatMessage } from "@postwin-store/mappers/message.mapper";

/* =============================================================================
Types
=============================================================================*/

type PresencePayload = {
  userId: string;
  tenantId: string;
}[];

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

type AckPayload = {
  clientMutationId: string;
  messageId: string;
};

type ReceiptPayload = {
  messageId: string;
  userId: string;
  deliveredAt?: string;
  seenAt?: string;
};

type WSMessage =
  | { type: "MESSAGE_CREATED"; payload: BackendMessage }
  | { type: "MESSAGE_ACK"; payload: AckPayload }
  | { type: "PRESENCE_UPDATE"; payload: PresencePayload }
  | { type: "TYPING_UPDATE"; payload: TypingPayload }
  | { type: "MESSAGE_RECEIPT"; payload: ReceiptPayload }
  | { type: "UNREAD_DELTA"; payload: { caseId: string; delta: number } }
  | { type: "UNREAD_RESET"; payload: { caseId: string } };

/* =============================================================================
Helpers
=============================================================================*/

/**
 * Normalize case identifier.
 * Removes "draft_" prefix so backend receives valid UUID.
 */
function normalizeCaseId(caseId: string): string {
  if (!caseId) return caseId;

  if (caseId.startsWith("draft_")) {
    return caseId.replace("draft_", "");
  }

  return caseId;
}

/* =============================================================================
WebSocket Service
=============================================================================*/

class WebSocketService {
  private socket: WebSocket | null = null;
  private currentCaseId: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  private seenQueue = new Set<string>();
  private seenFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  private deliveredQueue = new Set<string>();
  private deliveredFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  /////////////////////////////////////////////////////////////
  // CONNECT
  /////////////////////////////////////////////////////////////

  connect(caseId: string) {
    if (!caseId) return;

    const normalizedCaseId = normalizeCaseId(caseId);

    if (this.socket && this.currentCaseId === normalizedCaseId) return;

    if (this.socket && this.currentCaseId !== normalizedCaseId) {
      this.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const backendHost =
      process.env.NEXT_PUBLIC_BACKEND_WS_URL || "localhost:3001";

    const url = `${protocol}//${backendHost}/ws/cases/${normalizedCaseId}`;

    const socket = new WebSocket(url);

    this.socket = socket;
    this.currentCaseId = normalizedCaseId;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      if (!this.currentCaseId || this.currentCaseId !== normalizedCaseId)
        return;

      try {
        const data = JSON.parse(event.data) as WSMessage;

        switch (data.type) {
          case "MESSAGE_CREATED": {
            const state = usePostWinStore.getState();

            const mapped = mapBackendMessageToChatMessage(
              data.payload,
              state.currentUserId ?? null,
            );

            state.appendMessage(mapped);

            const currentUserId = state.currentUserId;
            if (currentUserId && data.payload.authorId !== currentUserId) {
              this.queueDelivered(data.payload.id);
            }
            break;
          }

          case "MESSAGE_ACK":
            usePostWinStore
              .getState()
              .confirmMessage(
                data.payload.clientMutationId,
                data.payload.messageId,
              );
            break;

          case "MESSAGE_RECEIPT":
            usePostWinStore.getState().updateReceipt(data.payload);
            break;

          case "PRESENCE_UPDATE":
            usePostWinStore.getState().setPresence(data.payload);
            break;

          case "TYPING_UPDATE":
            usePostWinStore
              .getState()
              .setTyping(data.payload.userId, data.payload.isTyping);
            break;

          case "UNREAD_DELTA":
            usePostWinStore
              .getState()
              .incrementUnread(data.payload.caseId, data.payload.delta);
            break;

          case "UNREAD_RESET":
            usePostWinStore.getState().resetUnread(data.payload.caseId);
            break;

          default:
            break;
        }
      } catch {
        // Ignore malformed frames
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      if (this.currentCaseId === normalizedCaseId)
        this.scheduleReconnect(normalizedCaseId);
    };

    socket.onerror = () => socket.close();
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC SENDERS
  /////////////////////////////////////////////////////////////

  sendTypingStart() {
    if (!this.isOpen()) return;
    this.socket!.send(JSON.stringify({ type: "TYPING_START" }));
  }

  sendTypingStop() {
    if (!this.isOpen()) return;
    this.socket!.send(JSON.stringify({ type: "TYPING_STOP" }));
  }

  sendSeen(messageId: string) {
    this.queueSeen(messageId);
  }

  sendReadUpTo(messageId: string) {
    if (!this.isOpen()) return;

    this.socket!.send(
      JSON.stringify({
        type: "CASE_READ_UP_TO",
        messageId,
      }),
    );
  }

  /////////////////////////////////////////////////////////////
  // DELIVERY (BATCHED)
  /////////////////////////////////////////////////////////////

  private queueDelivered(messageId: string) {
    this.deliveredQueue.add(messageId);

    if (this.deliveredFlushTimeout) return;

    this.deliveredFlushTimeout = setTimeout(() => {
      if (!this.isOpen() || this.deliveredQueue.size === 0) {
        this.deliveredFlushTimeout = null;
        return;
      }

      this.socket!.send(
        JSON.stringify({
          type: "MESSAGE_DELIVERED_BATCH",
          messageIds: Array.from(this.deliveredQueue),
        }),
      );

      this.deliveredQueue.clear();
      this.deliveredFlushTimeout = null;
    }, 120);
  }

  /////////////////////////////////////////////////////////////
  // SEEN (BATCHED)
  /////////////////////////////////////////////////////////////

  private queueSeen(messageId: string) {
    this.seenQueue.add(messageId);

    if (this.seenFlushTimeout) return;

    this.seenFlushTimeout = setTimeout(() => {
      if (!this.isOpen() || this.seenQueue.size === 0) {
        this.seenFlushTimeout = null;
        return;
      }

      this.socket!.send(
        JSON.stringify({
          type: "MESSAGE_SEEN_BATCH",
          messageIds: Array.from(this.seenQueue),
        }),
      );

      this.seenQueue.clear();
      this.seenFlushTimeout = null;
    }, 150);
  }

  /////////////////////////////////////////////////////////////
  // INTERNAL HELPERS
  /////////////////////////////////////////////////////////////

  private isOpen() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(caseId: string) {
    if (this.reconnectTimeout) return;
    if (!navigator.onLine) return;

    const delay = Math.min(2000 * 2 ** this.reconnectAttempts, 15000);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts++;

      if (this.currentCaseId === caseId) {
        this.connect(caseId);
      }
    }, delay);
  }

  disconnect() {
    this.currentCaseId = null;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.seenFlushTimeout) {
      clearTimeout(this.seenFlushTimeout);
      this.seenFlushTimeout = null;
    }

    if (this.deliveredFlushTimeout) {
      clearTimeout(this.deliveredFlushTimeout);
      this.deliveredFlushTimeout = null;
    }

    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }

    this.seenQueue.clear();
    this.deliveredQueue.clear();
  } // <--- Closes disconnect()
} // <--- Closes WebSocketService class

export const wsService = new WebSocketService();

/* =============================================================================
Implementation guidance
------------------------------------------------------------------------------
Use wsService.connect(caseId) after the active case changes.

The service now automatically normalizes draft ids before sending them
to the backend.

Example:

wsService.connect("draft_2e392c41-f43e-4d77-a82d-6ba0a1861f40")

becomes:

ws://localhost:3001/ws/cases/2e392c41-f43e-4d77-a82d-6ba0a1861f40
=============================================================================*/

/* =============================================================================
Scalability insight
------------------------------------------------------------------------------
Centralizing ID normalization here prevents similar bugs in:

• REST case endpoints
• websocket routing
• unread counters
• receipt propagation

Future transport layers (SSE / WebTransport) can reuse the same
normalization logic without touching UI components.
=============================================================================*/
