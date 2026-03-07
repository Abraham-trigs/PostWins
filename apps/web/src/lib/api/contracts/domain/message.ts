/**
 * ============================================================================
 * File: apps/web/src/lib/api/contracts/domain/message.ts
 * Purpose: Authoritative Message API client (Tenant, Cursor & Rotation Aware).
 * Fully aligned with backend REST + WS contracts.
 * ============================================================================
 */

import { apiClient } from "@/lib/api/apiClient";

/* =========================================================
   Design reasoning
   - Web consumes backend as source of truth.
   - Defensive normalization prevents UI corruption.
   - No optimistic assumptions about backend shape.
   - Pagination contract strictly matches service layer.
   - SYSTEM_EVENT added to support lifecycle projections
========================================================= */

/* =========================================================
   Types (Aligned With Backend)
========================================================= */

export type BackendMessageType =
  | "DISCUSSION"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION"
  | "FOLLOW_UP"
  | "SYSTEM_EVENT"; // NEW

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

export type BackendAuthor = {
  id: string;
  name: string;
};

/* =========================================================
   Message metadata (system events)
========================================================= */

export type BackendMessageMetadata = {
  systemEvent?: "CASE_BOOTSTRAP";
  referenceCode?: string;
  [key: string]: unknown;
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

  metadata?: BackendMessageMetadata | null; // NEW

  author?: BackendAuthor;

  _count?: {
    replies: number;
  };

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

function assertOkResponse(data: any) {
  if (!data || data.ok !== true) {
    throw new Error(data?.error || "Invalid response shape");
  }
}

function normalizeMessage(raw: any): BackendMessage {
  return {
    id: raw.id,
    tenantId: raw.tenantId,
    caseId: raw.caseId,
    authorId: raw.authorId,
    type: raw.type,
    clientMutationId: raw.clientMutationId ?? null,
    body: raw.body ?? null,
    parentId: raw.parentId ?? null,
    navigationContext: raw.navigationContext ?? null,
    createdAt: raw.createdAt,
    metadata: raw.metadata ?? null, // NEW
    author: raw.author ?? undefined,
    _count: raw._count ?? undefined,
    receipts: raw.receipts ?? undefined,
  };
}

/* =========================================================
   Create Message
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

  assertOkResponse(data);

  return normalizeMessage(data.data);
}

/* =========================================================
   Fetch Messages (Cursor-Based Pagination)
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
  );

  assertOkResponse(data);

  const messages = Array.isArray(data.data)
    ? data.data.map(normalizeMessage)
    : [];

  return {
    messages,
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}

/* =========================================================
   Structure
   - Types (strict backend alignment)
   - Normalizers (defensive parsing)
   - REST API wrappers
========================================================= */

/* =========================================================
   Implementation guidance
   - Use createMessage with clientMutationId for optimistic UI.
   - Use nextCursor for infinite scroll.
   - SYSTEM_EVENT messages must be rendered separately in UI.
   - Merge MESSAGE_CREATED from WS via store.
   - Merge MESSAGE_RECEIPT separately.
========================================================= */

/* =========================================================
   Scalability insight
   - Lifecycle events can be transported through SYSTEM_EVENT:
       CASE_BOOTSTRAP
       CASE_ROUTED
       VERIFICATION_STARTED
       EXECUTION_STARTED
       CASE_CLOSED
========================================================= */
