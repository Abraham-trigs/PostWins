// src/app/xotic/postwins/_components/chat/store/postwins/slices/timeline.slice.ts

import type { StateCreator } from "zustand";
import type { BackendMessage } from "@/lib/api/message";

type TimelineSlice = {
  messages: BackendMessage[];
  isLoading: boolean;

  setMessages: (messages: BackendMessage[]) => void;
  appendMessage: (message: BackendMessage) => void;
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
      (state) => ({
        messages: [...state.messages, message],
      }),
      false,
      "timeline/appendMessage",
    ),

  clearMessages: () => set({ messages: [] }, false, "timeline/clearMessages"),
});
