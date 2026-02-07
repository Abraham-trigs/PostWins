"use client";

import type { PostWinDraft, DeliveryDraft } from "../chat/store/types";

// 🧠 Offline infrastructure
import { enqueue } from "@/lib/offline/queue";
import { isOnline } from "@/lib/offline/network";
import { sha256, stableStringify } from "@/lib/offline/serializer";

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
  occurredAt: string;
  location: unknown;
  items: Array<{ name: string; qty: number }>;
  notes?: string;
};

/* ============================================================================
   Helpers
============================================================================ */

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
    sdgGoals: draft.sdgGoals,
  };
}

function draftToDeliveryPayload(args: {
  projectId: string;
  draft: DeliveryDraft;
  notes?: string;
  occurredAt?: string;
  deliveryId?: string;
}): DeliveryPayload {
  const occurredAt = args.occurredAt ?? new Date().toISOString();
  const deliveryId =
    args.deliveryId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `del_${Math.random().toString(16).slice(2)}_${Date.now()}`);

  const items = args.draft.items
    .map((i) => ({ name: i.name.trim(), qty: Number(i.qty) }))
    .filter((i) => i.name.length > 0 && i.qty > 0);

  return {
    projectId: args.projectId,
    deliveryId,
    occurredAt,
    location: args.draft.location,
    items,
    notes: args.notes,
  };
}

/* ============================================================================
   Core: Offline-first POST with idempotency
============================================================================ */

async function postaPost<T>(
  path: string,
  body: unknown,
): Promise<T & { offline?: true }> {
  const tenantId = getTenantId();

  // 🔐 Stable idempotency key (payload-derived)
  const fingerprint = stableStringify({
    path,
    body,
  });
  const transactionId = await sha256(fingerprint);

  const headers = {
    "Content-Type": "application/json",
    "X-Tenant-Id": tenantId,
    "Idempotency-Key": transactionId,
    "X-Source": "web",
  };

  // 📴 Offline → enqueue + optimistic success
  if (!isOnline()) {
    enqueue({
      id: transactionId,
      url: path,
      method: "POST",
      headers,
      body,
      createdAt: Date.now(),
    });

    return { ok: true, offline: true } as T & { offline: true };
  }

  // 🌐 Online → normal fetch
  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

/* ============================================================================
   Public API
============================================================================ */

export async function bootstrapIntake(
  draft: PostWinDraft,
): Promise<BootstrapResponse & { offline?: true }> {
  return postaPost<BootstrapResponse>(
    "/api/intake/bootstrap",
    draftToBootstrapPayload(draft),
  );
}

export async function deliveryIntake(
  payload: DeliveryPayload,
): Promise<DeliveryResponse & { offline?: true }> {
  return postaPost<DeliveryResponse>("/api/intake/delivery", payload);
}

export async function deliveryIntakeFromDraft(args: {
  projectId: string;
  draft: DeliveryDraft;
  notes?: string;
  occurredAt?: string;
  deliveryId?: string;
}): Promise<DeliveryResponse & { offline?: true }> {
  const payload = draftToDeliveryPayload(args);
  return deliveryIntake(payload);
}
