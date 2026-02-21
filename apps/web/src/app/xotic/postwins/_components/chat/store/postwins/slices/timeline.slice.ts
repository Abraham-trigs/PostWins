// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts
// Purpose: Manage the frontend message state for the "Signal-driven UX".

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/message";

export type TimelineSlice = {
  messages: BackendMessage[];
  isLoading: boolean;

  /**
   * Replaces current message list (e.g., on initial load)
   */
  setMessages: (messages: BackendMessage[]) => void;

  /**
   * Appends a single message. Includes a safety check to prevent
   * duplicate IDs if a WebSocket and API call fire simultaneously.
   */
  appendMessage: (message: BackendMessage) => void;

  /**
   * Wipes the thread (e.g., when switching cases)
   */
  clearMessages: () => void;
};

export const createTimelineSlice: StateCreator<
  TimelineSlice,
  [["zustand/devtools", never]],
  [],
  TimelineSlice
> = (set) => ({
  messages: [],
  isLoading: false,

  setMessages: (messages) => set({ messages }, false, "timeline/setMessages"),

  appendMessage: (message) =>
    set(
      (state) => {
        // ID-based deduplication ensures "Fast navigation" logic stays reliable
        const exists = state.messages.some((m) => m.id === message.id);
        if (exists) return state;

        return {
          messages: [...state.messages, message],
        };
      },
      false,
      "timeline/appendMessage",
    ),

  clearMessages: () => set({ messages: [] }, false, "timeline/clearMessages"),
});
