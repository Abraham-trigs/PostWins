// xotic/_components/chat/MessageCanvas.tsx
"use client";

import { MessagesSurface } from "./MessagesSurface";
import { useChatStore } from "./store/useChatStore";

export function MessageCanvas() {
  const { messages, appendText } = useChatStore((s) => ({
    messages: s.messages,
    appendText: s.appendText,
  }));

  return (
    <MessagesSurface
      messages={messages}
      onAction={(action) => {
        // audit: record the user's selection in the timeline
        appendText("user", action.value);
        // optionally: appendText("user", action.value, "record");
      }}
    />
  );
}
