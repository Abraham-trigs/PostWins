/**
 * ============================================================================
 * File: apps/web/src/lib/api/contracts/domain/message.ts
 * Purpose: Authoritative Message API client (Tenant & Cursor Aware).
 * ============================================================================
 */

const BACKEND_ORIGIN = "";

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

function assertOk(res: Response, json: any) {
  if (!res.ok) {
    throw new Error(json?.error ?? "Request failed");
  }
}

/* =========================================================
   Create Message (Tenant Aware)
========================================================= */

export async function createMessage(
  payload: {
    caseId: string;
    type: BackendMessageType;
    body: string;
    parentId?: string | null;
    navigationContext?: BackendNavigationContext | null;
    clientMutationId?: string | null;
  },
  tenantId: string, // Explicit tenant context from store
): Promise<BackendMessage> {
  const res = await fetch(`${BACKEND_ORIGIN}/api/messages`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId, // Satisfies Server-side guard
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  assertOk(res, json);

  return json.data as BackendMessage;
}

/* =========================================================
   Fetch Messages (Tenant Aware + Cursor-Based)
========================================================= */

export async function fetchMessagesByCase(
  caseId: string,
  tenantId: string, // Explicit tenant context from store
  cursor?: string | null,
  limit: number = 30,
): Promise<FetchMessagesResponse> {
  if (!caseId) throw new Error("caseId is required");
  if (!tenantId) throw new Error("tenantId is required for guard validation");

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const query = buildQuery({
    cursor: cursor ?? undefined,
    limit: safeLimit,
  });

  const res = await fetch(
    `${BACKEND_ORIGIN}/api/messages/${caseId}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "x-tenant-id": tenantId, // Deterministic routing header
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const json = await res.json();
  assertOk(res, json);

  return {
    messages: json.data ?? [],
    nextCursor: json.nextCursor ?? null,
    hasMore: Boolean(json.hasMore),
  };
}
