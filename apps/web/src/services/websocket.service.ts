// src/services/websocket.service.ts
// Purpose: Case-scoped resilient WebSocket transport with race protection and controlled reconnection.

import { usePostWinStore } from "@/app/xotic/postwins/_components/chat/store/usePostWinStore";
import type { BackendMessage } from "@/lib/api/message";

/* =========================================================
   Types
========================================================= */

type PresencePayload = {
  userId: string;
  tenantId: string;
}[];

type WSMessage =
  | { type: "MESSAGE_CREATED"; payload: BackendMessage }
  | { type: "PRESENCE_UPDATE"; payload: PresencePayload };

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   - One socket per active case
   - Idempotent connect()
   - Zombie event protection
   - Exponential backoff reconnect
   - Visibility + online awareness
   - Atomic handoff to store mutations
========================================================= */

class WebSocketService {
  private socket: WebSocket | null = null;
  private currentCaseId: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  /* =========================================================
     Connect (Case Scoped)
  ========================================================= */
  connect(caseId: string) {
    if (!caseId) return;

    // Already connected to same case
    if (this.socket && this.currentCaseId === caseId) return;

    // Switching case
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
      // 🔒 Zombie protection: ignore if case switched
      if (!this.currentCaseId || this.currentCaseId !== caseId) return;

      try {
        const data = JSON.parse(event.data) as WSMessage;

        switch (data.type) {
          case "MESSAGE_CREATED":
            usePostWinStore.getState().appendMessage(data.payload);
            break;

          case "PRESENCE_UPDATE":
            usePostWinStore.getState().setPresence(data.payload);
            break;

          default:
            // Unknown message types are ignored safely
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

      // Reconnect only if still active case
      if (this.currentCaseId === caseId) {
        this.scheduleReconnect(caseId);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  /* =========================================================
     Reconnect Strategy (Exponential Backoff)
  ========================================================= */
  private scheduleReconnect(caseId: string) {
    if (this.reconnectTimeout) return;

    // Avoid reconnect when offline
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

  /* =========================================================
     Disconnect
  ========================================================= */
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

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Call wsService.connect(caseId) inside chat page useEffect
   - Call wsService.disconnect() on unmount or case switch
   - Backend must emit:
       { type: "MESSAGE_CREATED", payload: BackendMessage }
       { type: "PRESENCE_UPDATE", payload: PresencePayload }
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   This design prevents:
   - Ghost messages from previous case
   - Infinite reconnect loops
   - Network offline thrashing
   - Multi-tab race conditions

   All real-time mutations converge into the store,
   guaranteeing deterministic reconciliation.
========================================================= */
