// src/lib/api/message.ts
// Purpose: Authoritative message API client + shared DTO types for PostWin threads.

/* =========================================================
   Types (Authoritative DTO Contracts)
========================================================= */

export type BackendMessageType =
  | "DISCUSSION"
  | "VERIFICATION_REQUEST"
  | "COUNTER_CLAIM"
  | "EVIDENCE_SUBMISSION"
  | "FOLLOW_UP";

/**
 * UPDATED: Aligned with Navigation Intelligence Utility.
 * Uses 'target' and 'id' as the primary steering mechanism.
 */
export type BackendNavigationContext = {
  target: "TASK" | "MESSAGE" | "EXTERNAL";
  id: string; // The UUID of the Task/Message or the External URL
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
  body: string | null;
  parentId: string | null;
  navigationContext: BackendNavigationContext | null;
  createdAt: string; // ISO string
};

/* =========================================================
   Helpers
========================================================= */

function assertTenant(tenantId: string | null | undefined) {
  if (!tenantId) throw new Error("Missing tenantId");
}

function normalizeNullableString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

/* =========================================================
   Create Message
========================================================= */

export async function createMessage(payload: {
  tenantId: string;
  caseId: string;
  authorId: string;
  type: BackendMessageType;
  body: string | null;
  parentId?: string | null;
  navigationContext?: BackendNavigationContext | null;
}): Promise<BackendMessage> {
  assertTenant(payload.tenantId);

  const res = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": payload.tenantId,
    },
    body: JSON.stringify({
      ...payload,
      body: normalizeNullableString(payload.body),
      parentId: normalizeNullableString(payload.parentId),
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error ?? "Failed to create message");
  }

  // Matches Backend Controller: { ok: true, data: BackendMessage }
  return json.data as BackendMessage;
}

/* =========================================================
   Fetch Messages by Case
========================================================= */

export async function fetchMessagesByCase(
  tenantId: string,
  caseId: string,
): Promise<BackendMessage[]> {
  assertTenant(tenantId);

  const res = await fetch(`/api/messages/${tenantId}/${caseId}`, {
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
    },
    cache: "no-store",
    next: { tags: [`messages-${caseId}`] },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error ?? "Failed to load messages");
  }

  // Matches Backend Controller: { ok: true, data: BackendMessage[] }
  return json.data as BackendMessage[];
}
