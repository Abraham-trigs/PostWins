// src/app/xotic/postwins/_components/chat/store/postwins/mappers/message.mapper.ts

import type {
  BackendMessage,
  BackendMessageType,
} from "@/lib/api/contracts/domain/message";

import type { ChatMessage } from "@postwin-store/types";

/* =========================================================
   Backend → UI
========================================================= */

export function mapBackendMessageToChatMessage(
  backend: BackendMessage,
  currentUserId: string | null,
): ChatMessage {
  return {
    id: backend.id,
    kind: "text",
    role: backend.authorId === currentUserId ? "user" : "system",
    mode: mapBackendTypeToMode(backend.type),
    text: backend.body ?? "",
    createdAt: backend.createdAt,
  };
}

/* =========================================================
   UI → Backend Create Payload
========================================================= */

export function mapChatMessageToCreatePayload(
  message: ChatMessage,
  caseId: string,
) {
  if (message.kind !== "text") {
    throw new Error("Only text messages can be sent to backend");
  }

  const safeMode = (message.mode ?? "record") as ComposerMode;

  return {
    caseId,
    type: mapModeToBackendType(safeMode),
    body: message.text,
  };
}

/* =========================================================
   Type Mapping
========================================================= */
type ComposerMode = "record" | "followup" | "verify" | "delivery";

export function mapBackendTypeToMode(type: BackendMessageType): ComposerMode {
  switch (type) {
    case "VERIFICATION_REQUEST":
      return "verify";

    case "FOLLOW_UP":
      return "followup";

    case "EVIDENCE_SUBMISSION":
      return "delivery";

    case "COUNTER_CLAIM":
      return "record";

    default:
      return "record";
  }
}
export function mapModeToBackendType(mode: ComposerMode): BackendMessageType {
  switch (mode) {
    case "verify":
      return "VERIFICATION_REQUEST";

    case "followup":
      return "FOLLOW_UP";

    case "delivery":
      return "EVIDENCE_SUBMISSION";

    default:
      return "DISCUSSION";
  }
}
