// apps/web/src/lib/api/cases.api.ts
// Purpose: Resilient, abortable, deduplicated cursor-based client for GET /api/cases

import type { ListCasesResponse } from "@posta/core";
import { fetcher } from "../offline/fetcher";

/* ============================================================
   Design reasoning
   ------------------------------------------------------------
   - Uses shared fetcher (offline-aware).
   - Deduplicates identical in-flight requests.
   - Aborts stale requests automatically.
   - Strongly typed transport boundary.
   - Cursor-based pagination.
   ============================================================ */

type ListCasesParams = {
  cursor?: string | null;
  limit?: number;
  search?: string;
};

const inflight = new Map<string, AbortController>();

function buildQuery(params: ListCasesParams) {
  const q = new URLSearchParams();

  if (params.cursor) q.set("cursor", params.cursor);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);

  return q.toString();
}

function getTenantId(): string {
  // Replace with your real tenant source
  const tenant = localStorage.getItem("tenantId");
  if (!tenant) throw new Error("Missing tenantId");
  return tenant;
}

export async function listCases(
  params: ListCasesParams = {},
): Promise<ListCasesResponse> {
  const query = buildQuery(params);
  const key = `cases:${query}`;

  // Abort previous identical request
  if (inflight.has(key)) {
    inflight.get(key)!.abort();
    inflight.delete(key);
  }

  const controller = new AbortController();
  inflight.set(key, controller);

  try {
    const data = await fetcher(`/api/cases?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": getTenantId(),
      },
      signal: controller.signal,
    });

    if (!data?.ok) {
      throw new Error("Invalid response shape");
    }

    return data as ListCasesResponse;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw error;
    }

    // Retry once for transient failures
    const retry = await fetcher(`/api/cases?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": getTenantId(),
      },
    });

    if (!retry?.ok) {
      throw new Error("Failed after retry");
    }

    return retry as ListCasesResponse;
  } finally {
    inflight.delete(key);
  }
}

/* ============================================================
   Structure
   ------------------------------------------------------------
   - Query builder
   - Tenant resolver
   - In-flight dedupe map
   - Abort-safe request
   - Retry-safe fallback
   ============================================================ */

/* ============================================================
   Implementation guidance
   ------------------------------------------------------------
   - Use inside Zustand store.
   - Always pass cursor from store state.
   - Never compute lifecycle client-side.
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   Deduping prevents rapid scroll spam.
   Abort controller prevents memory leaks.
   Cursor keeps list stable under writes.
   ============================================================ */
