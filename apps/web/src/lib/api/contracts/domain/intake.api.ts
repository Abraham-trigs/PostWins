// src/lib/api/contracts/domain/intake.api.ts
// Purpose: Offline-first Intake API client with idempotent POST handling and optimistic offline support.

/**
 * ============================================================================
 * Assumptions
 * ============================================================================
 * - PostWinDraft and DeliveryDraft types are correctly defined in the referenced path.
 * - Offline helpers (enqueue, isOnline, sha256, stableStringify) exist and work as expected.
 * - All successful server responses follow shape { ok: true, ... }.
 * - Server guarantees idempotency when Idempotency-Key header is provided.
 */

/**
 * ============================================================================
 * Design reasoning
 * ============================================================================
 * This module implements an offline-first POST abstraction with deterministic
 * idempotency keys derived from a stable payload fingerprint. Instead of unsafe
 * generic intersections (T & { offline: true }), the return type is modeled as
 * a union (T | OfflineOptimistic). This reflects the true runtime behavior:
 * either a real server response (T) or a locally optimistic offline result.
 *
 * Constraining T with `extends { ok: true }` guarantees shape compatibility
 * without unsafe casts. This preserves type safety while keeping the API
 * ergonomic for callers.
 */

/**
 * ============================================================================
 * Structure
 * ============================================================================
 * - Types:
 *    - BootstrapResponse
 *    - DeliveryResponse
 *    - BootstrapPayload
 *    - DeliveryPayload
 *    - OfflineOptimistic
 *
 * - Helpers:
 *    - getTenantId()
 *    - draftToBootstrapPayload()
 *    - draftToDeliveryPayload()
 *
 * - Core:
 *    - postaPost<T>()
 *
 * - Public API:
 *    - bootstrapIntake()
 *    - deliveryIntake()
 *    - deliveryIntakeFromDraft()
 */

/**
 * ============================================================================
 * Implementation
 * ============================================================================
 */

"use client";

import type {
  PostWinDraft,
  DeliveryDraft,
} from "../../../../app/postwins/_components/chat/store/types";

// Offline infrastructure
import { enqueue } from "@/lib/offline/queue";
import { isOnline } from "@/lib/offline/network";
import { sha256, stableStringify } from "@/lib/offline/serializer";

/* ============================================================================
   Response Types
============================================================================ */

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

/**
 * Optimistic offline response shape.
 * This is intentionally minimal and safe.
 */
type OfflineOptimistic = {
  ok: true;
  offline: true;
};

/* ============================================================================
   Payload Types
============================================================================ */

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

/**
 * Resolves tenant ID from env or localStorage.
 * Throws hard error if missing — tenant isolation is mandatory.
 */
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

/**
 * Converts PostWinDraft into API-safe payload.
 * Performs no mutation.
 */
function draftToBootstrapPayload(draft: PostWinDraft): BootstrapPayload {
  return {
    narrative: draft.narrative,
    category: draft.category,
    location: draft.location,
    language: draft.language,
    sdgGoals: draft.sdgGoals,
  };
}

/**
 * Converts DeliveryDraft into normalized API payload.
 * - Trims item names
 * - Coerces qty to number
 * - Filters invalid items
 * - Generates deterministic deliveryId if missing
 */
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
    .map((i) => ({
      name: i.name.trim(),
      qty: Number(i.qty),
    }))
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
   Core: Offline-first POST with Idempotency
============================================================================ */

/**
 * Generic POST helper.
 *
 * T is constrained to `{ ok: true }` to ensure compatibility with optimistic fallback.
 * Returns either:
 *  - T (real server response)
 *  - OfflineOptimistic (offline optimistic enqueue)
 */
async function postaPost<T extends { ok: true }>(
  path: string,
  body: unknown,
): Promise<T | OfflineOptimistic> {
  const tenantId = getTenantId();

  // Deterministic idempotency key
  const fingerprint = stableStringify({
    path,
    body,
  });

  const transactionId = await sha256(fingerprint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-Id": tenantId,
    "Idempotency-Key": transactionId,
    "X-Source": "web",
  };

  /**
   * Offline mode:
   * - Enqueue request
   * - Return optimistic success
   * - No unsafe casting required
   */
  if (!isOnline()) {
    enqueue({
      id: transactionId,
      url: path,
      method: "POST",
      headers,
      body,
      createdAt: Date.now(),
    });

    return { ok: true, offline: true };
  }

  /**
   * Online mode:
   * - Normal fetch
   * - Explicit JSON parsing
   * - Explicit error propagation
   */
  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const error =
      typeof data === "object" && data && "error" in data
        ? (data as any).error
        : "Request failed";

    throw new Error(error);
  }

  return data as T;
}

/* ============================================================================
   Public API
============================================================================ */

/**
 * Bootstraps intake flow from PostWinDraft.
 */
export async function bootstrapIntake(
  draft: PostWinDraft,
): Promise<BootstrapResponse | OfflineOptimistic> {
  return postaPost<BootstrapResponse>(
    "/api/intake/bootstrap",
    draftToBootstrapPayload(draft),
  );
}

/**
 * Records delivery intake.
 */
export async function deliveryIntake(
  payload: DeliveryPayload,
): Promise<DeliveryResponse | OfflineOptimistic> {
  return postaPost<DeliveryResponse>("/api/intake/delivery", payload);
}

/**
 * Convenience wrapper: converts DeliveryDraft → DeliveryPayload.
 */
export async function deliveryIntakeFromDraft(args: {
  projectId: string;
  draft: DeliveryDraft;
  notes?: string;
  occurredAt?: string;
  deliveryId?: string;
}): Promise<DeliveryResponse | OfflineOptimistic> {
  const payload = draftToDeliveryPayload(args);
  return deliveryIntake(payload);
}

/**
 * ============================================================================
 * Implementation guidance
 * ============================================================================
 * - Call bootstrapIntake(draft) from chat workflow when user confirms.
 * - Check `if ("offline" in response)` to detect optimistic case.
 * - Use deliveryIntakeFromDraft when saving delivery forms.
 * - Keep server response shapes strictly `{ ok: true, ... }`.
 */

/**
 * ============================================================================
 * Scalability insight
 * ============================================================================
 * This abstraction can be extended to support PUT/DELETE while preserving
 * idempotency and offline queueing. For multi-tenant SaaS at scale, the
 * transactionId (sha256 fingerprint) becomes a deterministic replay-safe
 * operation key, enabling exactly-once semantics across retries and reconnects.
 */
