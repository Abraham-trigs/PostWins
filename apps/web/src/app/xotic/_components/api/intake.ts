// apps/web/src/app/xotic/_components/api/intake.ts
"use client";

import type { PostWinDraft, DeliveryDraft } from "../chat/store/types";

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

/**
 * ✅ NEW: Convert DeliveryDraft into the DeliveryPayload your backend expects.
 * - location: keep as unknown (backend decides structure)
 * - items: filter invalid rows (empty name or qty <= 0)
 */
function draftToDeliveryPayload(args: {
  projectId: string;
  draft: DeliveryDraft;
  notes?: string;
  occurredAt?: string; // allow caller override
  deliveryId?: string; // allow caller override
}): DeliveryPayload {
  const occurredAt = args.occurredAt ?? new Date().toISOString();
  const deliveryId =
    args.deliveryId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `del_${Math.random().toString(16).slice(2)}_${Date.now()}`);

  const items = args.draft.items
    .map((i) => ({ name: i.name.trim(), qty: Number(i.qty) }))
    .filter((i) => i.name.length > 0 && Number.isFinite(i.qty) && i.qty > 0);

  return {
    projectId: args.projectId,
    deliveryId,
    occurredAt,
    location: args.draft.location, // keep unknown; backend can normalize
    items,
    notes: args.notes,
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

/**
 * Existing low-level function: still supported.
 * Use this when you already have a complete DeliveryPayload.
 */
export async function deliveryIntake(
  payload: DeliveryPayload,
  opts?: { transactionId?: string },
): Promise<DeliveryResponse> {
  return postaPost<DeliveryResponse>("/api/intake/delivery", payload, opts);
}

/**
 * ✅ NEW ergonomic function: call with projectId + DeliveryDraft.
 * This is what Composer/store should use.
 */
export async function deliveryIntakeFromDraft(
  args: {
    projectId: string;
    draft: DeliveryDraft;
    notes?: string;
    occurredAt?: string;
    deliveryId?: string;
  },
  opts?: { transactionId?: string },
): Promise<DeliveryResponse> {
  const payload = draftToDeliveryPayload(args);
  return deliveryIntake(payload, opts);
}
