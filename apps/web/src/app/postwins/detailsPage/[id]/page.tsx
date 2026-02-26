"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MobileChatScreen } from "@ui/layout/mobile/MobileChatScreen";
import { usePostWinStore } from "@postwin-store/usePostWinStore";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function ChatDetailPage() {
  const params = useParams();
  const caseId = params?.id as string | undefined;

  // Pull auth properly (no hardcoded values)
  const userId = useAuthStore((s) => s.user?.id);

  // Store actions
  const fetchMessages = usePostWinStore((s) => s.fetchMessages);
  const setCurrentUserId = usePostWinStore((s) => s.setCurrentUserId);
  const clearMessages = usePostWinStore((s) => s.clearMessages);

  useEffect(() => {
    if (!caseId || !userId) return;

    // Set current user for "isOwn" message rendering
    setCurrentUserId(userId);

    // Fetch messages (tenant handled internally via API layer)
    fetchMessages(caseId);

    // Cleanup on unmount or case change
    return () => {
      clearMessages();
    };
  }, [caseId, userId, fetchMessages, setCurrentUserId, clearMessages]);

  return <MobileChatScreen detailsHref="./details" />;
}
