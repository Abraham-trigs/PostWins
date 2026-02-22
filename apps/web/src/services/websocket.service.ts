// src/services/websocket.service.ts
// Purpose: Case-scoped resilient WebSocket transport with race protection,
// controlled reconnection, ACK reconciliation, receipt propagation,
// typing support, batched delivery + batched seen transport,
// unread delta + reset handling (exact-once UX semantics).

import { usePostWinStore } from "@/app/xotic/postwins/_components/chat/store/usePostWinStore";
import type { BackendMessage } from "@/lib/api/message";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   - Delivery + Seen both batched.
   - Reduces WS frames under high throughput.
   - Server authoritative for timestamps.
   - Idempotent persistence via backend upsert.
   - No polling. Pure WS.
   - Safe for multi-device + reconnect.
   - UNREAD handled via delta + reset events (no polling).
========================================================= */

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

class WebSocketService {
  private socket: WebSocket | null = null;
  private currentCaseId: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  // Batch Seen Transport
  private seenQueue = new Set<string>();
  private seenFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  // Batch Delivered Transport
  private deliveredQueue = new Set<string>();
  private deliveredFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  /////////////////////////////////////////////////////////////
  // Connect (Case Scoped)
  /////////////////////////////////////////////////////////////

  connect(caseId: string) {
    if (!caseId) return;

    if (this.socket && this.currentCaseId === caseId) return;

    if (this.socket && this.currentCaseId !== caseId) {
      this.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws/cases/${caseId}`;

    const socket = new WebSocket(url);

    this.socket = socket;
    this.currentCaseId = caseId;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      if (!this.currentCaseId || this.currentCaseId !== caseId) return;

      try {
        const data = JSON.parse(event.data) as WSMessage;

        switch (data.type) {
          ///////////////////////////////////////////////////////
          // Message Broadcast
          ///////////////////////////////////////////////////////

          case "MESSAGE_CREATED": {
            const state = usePostWinStore.getState();
            state.appendMessage(data.payload);

            const currentUserId = state.currentUserId;

            if (currentUserId && data.payload.authorId !== currentUserId) {
              this.queueDelivered(data.payload.id);
            }

            break;
          }

          ///////////////////////////////////////////////////////
          // ACK
          ///////////////////////////////////////////////////////

          case "MESSAGE_ACK":
            usePostWinStore
              .getState()
              .confirmMessage(
                data.payload.clientMutationId,
                data.payload.messageId,
              );
            break;

          ///////////////////////////////////////////////////////
          // Receipt
          ///////////////////////////////////////////////////////

          case "MESSAGE_RECEIPT":
            usePostWinStore.getState().applyReceipt(data.payload);
            break;

          ///////////////////////////////////////////////////////
          // Presence
          ///////////////////////////////////////////////////////

          case "PRESENCE_UPDATE":
            usePostWinStore.getState().setPresence(data.payload);
            break;

          ///////////////////////////////////////////////////////
          // Typing
          ///////////////////////////////////////////////////////

          case "TYPING_UPDATE":
            usePostWinStore
              .getState()
              .setTyping(data.payload.userId, data.payload.isTyping);
            break;

          ///////////////////////////////////////////////////////
          // STEP 46 — Unread Delta
          ///////////////////////////////////////////////////////

          case "UNREAD_DELTA":
            usePostWinStore
              .getState()
              .incrementUnread(data.payload.caseId, data.payload.delta);
            break;

          ///////////////////////////////////////////////////////
          // STEP 46 — Unread Reset
          ///////////////////////////////////////////////////////

          case "UNREAD_RESET":
            usePostWinStore.getState().resetUnread(data.payload.caseId);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket parse error", err);
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      if (this.currentCaseId === caseId) {
        this.scheduleReconnect(caseId);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  /////////////////////////////////////////////////////////////
  // Batched Delivery Sender
  /////////////////////////////////////////////////////////////

  queueDelivered(messageId: string) {
    this.deliveredQueue.add(messageId);

    if (this.deliveredFlushTimeout) return;

    this.deliveredFlushTimeout = setTimeout(() => {
      if (!this.socket || this.deliveredQueue.size === 0) {
        this.deliveredFlushTimeout = null;
        return;
      }

      this.socket.send(
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
  // Batched Seen Sender
  /////////////////////////////////////////////////////////////

  queueSeen(messageId: string) {
    this.seenQueue.add(messageId);

    if (this.seenFlushTimeout) return;

    this.seenFlushTimeout = setTimeout(() => {
      if (!this.socket || this.seenQueue.size === 0) {
        this.seenFlushTimeout = null;
        return;
      }

      this.socket.send(
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
  // Reconnect Strategy
  /////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////
  // Disconnect
  /////////////////////////////////////////////////////////////

  disconnect() {
    this.currentCaseId = null;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;

    this.socket?.close();
    this.socket = null;
  }
}

export const wsService = new WebSocketService();
