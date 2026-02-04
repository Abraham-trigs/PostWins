// apps/web/src/app/xotic/_components/api/intake.ts
"use client";

import type { PostWinDraft } from "../chat/store/types";

export type BootstrapResponse = {
  ok: true;
  projectId: string;
  postWinId?: string | null;
};

export type DeliveryResponse = {
  ok: true;
  type: "DELIVERY_RECORDED";
  projectId: string;
  deliveryId: string;
};

type BootstrapPayload = {
  narrative: string;
  beneficiaryId?: string;
  category?: string;
  location?: unknown;
  language?: string;
  sdgGoals?: string[];
};

export type DeliveryPayload = {
  projectId: string;
  deliveryId: string;
  occurredAt: string; // ISO string
  location: unknown;
  items: Array<{ name: string; qty: number }>;
  notes?: string;
};

function makeTransactionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// NOTE: Dev-only tenant selection. In production, tenantId must come from auth/session.
function getTenantId(): string {
  const envTenant =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_TENANT_ID ?? "")
      : "";

  if (envTenant && envTenant.trim()) return envTenant.trim();

  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("posta.tenantId");
    if (ls && ls.trim()) return ls.trim();
  }

  throw new Error(
    "Missing tenantId. Set NEXT_PUBLIC_TENANT_ID or localStorage posta.tenantId",
  );
}

function draftToBootstrapPayload(draft: PostWinDraft): BootstrapPayload {
  return {
    narrative: draft.narrative,
    category: draft.category,
    location: draft.location,
    language: draft.language,
  };
}

async function postaPost<T>(
  path: string,
  body: unknown,
  opts?: { transactionId?: string },
): Promise<T> {
  const tenantId = getTenantId();
  const transactionId = opts?.transactionId ?? makeTransactionId();

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      "x-transaction-id": transactionId,
      "X-Source": "web",
      // later when auth exists:
      // "X-Actor-Id": userId,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

export async function bootstrapIntake(
  draft: PostWinDraft,
  opts?: { transactionId?: string },
): Promise<BootstrapResponse> {
  return postaPost<BootstrapResponse>(
    "/api/intake/bootstrap",
    draftToBootstrapPayload(draft),
    opts,
  );
}

export async function deliveryIntake(
  payload: DeliveryPayload,
  opts?: { transactionId?: string },
): Promise<DeliveryResponse> {
  return postaPost<DeliveryResponse>("/api/intake/delivery", payload, opts);
}
