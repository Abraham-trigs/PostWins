// src/services/websocket.service.ts
// Purpose: Case-scoped resilient WebSocket transport with full lifecycle control,
// explicit typing + seen + read tracking, ACK reconciliation, receipt propagation,
// unread delta/reset handling, and deterministic reconnect behavior.

import { usePostWinStore } from "../app/postwins/postwins/_components/chat/store/usePostWinStore";
import type { BackendMessage } from "@/lib/api/contracts/domain/message";

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

  private seenQueue = new Set<string>();
  private seenFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  private deliveredQueue = new Set<string>();
  private deliveredFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  ///////////////////////////////////////////////////////////// protocol
  // CONNECT
  /////////////////////////////////////////////////////////////

  connect(caseId: string) {
    if (!caseId) return;

    if (this.socket && this.currentCaseId === caseId) return;

    if (this.socket && this.currentCaseId !== caseId) {
      this.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const backendHost =
      process.env.NEXT_PUBLIC_BACKEND_WS_URL || "localhost:3001";

    const url = `${protocol}//${backendHost}/ws/cases/${caseId}`;

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
          case "MESSAGE_CREATED": {
            const state = usePostWinStore.getState();
            state.appendMessage(data.payload);

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
            usePostWinStore.getState().applyReceipt(data.payload);
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
        // ignore malformed frames
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      if (this.currentCaseId === caseId) this.scheduleReconnect(caseId);
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

    this.reconnectAttempts = 0;

    this.socket?.close();
    this.socket = null;
  }
}

export const wsService = new WebSocketService();
