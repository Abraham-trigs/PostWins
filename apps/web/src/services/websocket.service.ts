// src/services/websocket.service.ts
// Purpose: Case-scoped WebSocket transport for real-time message delivery.

import { usePostWinStore } from "@/app/xotic/postwins/_components/chat/store/usePostWinStore";
import type { BackendMessage } from "@/lib/api/message";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   - One socket per active case
   - Idempotent connect()
   - Safe case switching
   - Atomic handoff to appendMessage()
   - Socket + REST + optimistic share same reconciliation path
========================================================= */

class WebSocketService {
  private socket: WebSocket | null = null;
  private currentCaseId: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /* =========================================================
     Connect (Case Scoped)
  ========================================================= */
  connect(caseId: string) {
    // If already connected to same case → do nothing
    if (this.socket && this.currentCaseId === caseId) return;

    // If switching case → fully teardown first
    if (this.socket && this.currentCaseId !== caseId) {
      this.disconnect();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const url = `${protocol}//${window.location.host}/ws/cases/${caseId}`;

    this.socket = new WebSocket(url);
    this.currentCaseId = caseId;

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "MESSAGE_CREATED") {
          const message = data.payload as BackendMessage;

          /**
           * ⚡ ATOMIC HAND-OFF
           * Same appendMessage pipeline used by:
           * - Optimistic Composer
           * - REST hydration
           * - WebSocket stream
           *
           * Store handles:
           * - Ghost reconciliation
           * - ID dedupe
           * - Order safety
           */
          usePostWinStore.getState().appendMessage(message);
        }
      } catch (err) {
        console.error("WebSocket parse error", err);
      }
    };

    this.socket.onclose = () => {
      this.socket = null;

      // Optional: auto-reconnect only if still on same case
      if (this.currentCaseId) {
        this.scheduleReconnect(this.currentCaseId);
      }
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  /* =========================================================
     Reconnect Strategy (Simple Backoff)
  ========================================================= */
  private scheduleReconnect(caseId: string) {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;

      // Only reconnect if still intended case
      if (this.currentCaseId === caseId) {
        this.connect(caseId);
      }
    }, 2000); // Simple 2s retry (upgrade to exponential if needed)
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

    this.socket?.close();
    this.socket = null;
  }
}

export const wsService = new WebSocketService();

/* =========================================================
   Implementation guidance
   - Call wsService.connect(caseId) inside chat page useEffect
   - Call wsService.disconnect() on unmount or case switch
   - Ensure backend emits:
       { type: "MESSAGE_CREATED", payload: BackendMessage }
========================================================= */

/* =========================================================
   Scalability insight
   This architecture supports:
   - Multi-tenant case streaming
   - Presence events
   - Typing indicators
   - Delivery receipts
   - Server fan-out via pub/sub

   All message paths converge into appendMessage(),
   guaranteeing deterministic reconciliation.
========================================================= */
