// xotic/_components/chat/MessageCanvas.tsx
"use client";

import { MessagesSurface } from "./MessagesSurface";
import { usePostWinStor } from "./store/usePostWinStore";

export function MessageCanvas() {
  const { messages, appendText } = usePostWinStor((s) => ({
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
