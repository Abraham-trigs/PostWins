// src/app/xotic/postwins/_components/chat/hooks/useSeenObserver.ts
// Purpose: Viewport-based deterministic seen tracking (fires once per message).

import { useEffect, useRef } from "react";
import { wsService } from "@/services/websocket.service";
import { usePostWinStore } from "../store/usePostWinStore";

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// - Seen is viewport-based (not message arrival).
// - Fires once per mount.
// - Ignores own messages.
// - Requires tab visibility.
// - Pure WS, no polling.

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// - O(1) per message.
// - IntersectionObserver is browser-optimized.
// - No timers.
// - Deterministic distributed semantics.

export function useSeenObserver(messageId: string, authorId: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const currentUserId = usePostWinStore((s) => s.currentUserId);

  useEffect(() => {
    if (!ref.current) return;
    if (!currentUserId) return;

    // Never mark your own messages
    if (authorId === currentUserId) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && document.visibilityState === "visible") {
          wsService.sendSeen(messageId);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [messageId, authorId, currentUserId]);

  return ref;
}

// 3️⃣ Use it in message row

// Inside your message component:

// const ref = useSeenObserver(message.id, message.authorId);

// return (
//   <div ref={ref}>
//     ...
//   </div>
// );
