"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MobileChatScreen } from "../../_components/mobile/MobileChatScreen";
import { usePostWinStore } from "../../_components/chat/store/usePostWinStore";

export default function ChatDetailPage() {
  const params = useParams();
  const caseId = params?.id as string;

  // Pull actions from the store
  const fetchMessages = usePostWinStore((s) => s.fetchMessages);
  const setCurrentUserId = usePostWinStore((s) => s.setCurrentUserId);
  const clearMessages = usePostWinStore((s) => s.clearMessages); // Added for safety

  useEffect(() => {
    // 1. In production, these should come from your AuthContext or Session
    const tenantId = "YOUR_TENANT_ID";
    const currentUserId = "CURRENT_USER_ID";

    if (!caseId) return;

    // 2. Set the ID so "isOwn" logic in MessageRow works immediately
    setCurrentUserId(currentUserId);

    // 3. Trigger the fetch
    fetchMessages(tenantId, caseId);

    // 4. CLEANUP: Clear the thread when leaving this case
    // This prevents Case A's messages from appearing when opening Case B
    return () => {
      clearMessages();
    };
  }, [
    caseId,
    tenantId,
    currentUserId,
    fetchMessages,
    setCurrentUserId,
    clearMessages,
  ]);

  return <MobileChatScreen detailsHref="./details" />;
}
