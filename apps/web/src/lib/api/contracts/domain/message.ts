/**
 * ============================================================================
 * File: apps/web/src/lib/api/contracts/domain/message.ts
 * Purpose: Authoritative Message API client (Tenant, Cursor & Rotation Aware).
 * Uses apiClient to preserve refresh rotation + interceptor safety.
 * ============================================================================
 */

import { apiClient } from "@/lib/api/apiClient";

/* =========================================================
   Types
========================================================= */

export type BackendMessageType =
  | "DISCUSSION"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION"
  | "FOLLOW_UP";

export type BackendNavigationContext = {
  target: "TASK" | "MESSAGE" | "EXTERNAL";
  id: string;
  label?: string | null;
  params?: {
    highlight?: boolean;
    focus?: boolean;
    mode?: "peek" | "full";
  } | null;
};

export type BackendMessage = {
  id: string;
  tenantId: string;
  caseId: string;
  authorId: string;
  type: BackendMessageType;
  clientMutationId: string | null;
  body: string | null;
  parentId: string | null;
  navigationContext: BackendNavigationContext | null;
  createdAt: string;
  receipts?: Record<
    string,
    {
      deliveredAt?: string | null;
      seenAt?: string | null;
    }
  >;
};

export type FetchMessagesResponse = {
  messages: BackendMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

/* =========================================================
   Helpers
========================================================= */

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

function assertDataShape(data: any) {
  if (!data) {
    throw new Error("Invalid response shape");
  }
}

/* =========================================================
   Create Message
   - Tenant header automatically injected by apiClient interceptor
   - Refresh rotation handled automatically
========================================================= */

export async function createMessage(payload: {
  caseId: string;
  type: BackendMessageType;
  body: string;
  parentId?: string | null;
  navigationContext?: BackendNavigationContext | null;
  clientMutationId?: string | null;
}): Promise<BackendMessage> {
  if (!payload.caseId) throw new Error("caseId is required");
  if (!payload.type) throw new Error("message type is required");
  if (!payload.body?.trim()) throw new Error("message body is required");

  const { data } = await apiClient.post("/messages", payload);

  assertDataShape(data);

  return data.data as BackendMessage;
}

/* =========================================================
   Fetch Messages (Cursor-Based Pagination)
   - Rotation-safe
   - Tenant header auto-injected
========================================================= */

export async function fetchMessagesByCase(
  caseId: string,
  cursor?: string | null,
  limit: number = 30,
): Promise<FetchMessagesResponse> {
  if (!caseId) throw new Error("caseId is required");

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const query = buildQuery({
    cursor: cursor ?? undefined,
    limit: safeLimit,
  });

  const { data } = await apiClient.get(
    `/messages/${caseId}${query ? `?${query}` : ""}`,
    { params: {} },
  );

  assertDataShape(data);

  return {
    messages: data.data ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}
