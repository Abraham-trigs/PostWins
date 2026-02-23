// apps/web/src/lib/api/cases.api.ts
// Purpose: Resilient, abortable, deduplicated cursor-based client for GET /api/cases

import type { ListCasesResponse } from "@posta/core";
import { fetcher } from "../../../offline/fetcher";

/* ============================================================
   Design reasoning session 
   ------------------------------------------------------------
   - Uses shared fetcher (offline-aware).
   - Deduplicates identical in-flight requests.
   - Aborts stale requests automatically.
   - Strongly typed transport boundary.
   - Cursor-based pagination.
   ============================================================ */

/**
 * FIXED: Exported CaseListItem for UI components
 * Uses Indexed Access types to stay in sync with @posta/core
 */
export type CaseListItem = ListCasesResponse["cases"][number];

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

/**
 * FIXED: Silent Tenant Resolver
 * Returns null if no session found to prevent UI crashes.
 */
function getTenantId(): string | null {
  // Check if we are in a browser environment
  if (typeof window === "undefined") {
    return "SSR_MODE";
  }

  return localStorage.getItem("tenantId");
}

export async function listCases(
  params: ListCasesParams = {},
): Promise<ListCasesResponse> {
  const query = buildQuery(params);
  const key = `cases:${query}`;

  if (inflight.has(key)) {
    inflight.get(key)!.abort();
    inflight.delete(key);
  }

  const controller = new AbortController();
  inflight.set(key, controller);

  try {
    const data = await fetcher(`/api/cases?${query}`, {
      method: "GET",
      credentials: "include", // critical for cookie auth
      signal: controller.signal,
    });

    if (!data?.ok) {
      throw new Error("Invalid response shape");
    }

    return data as ListCasesResponse;
  } finally {
    inflight.delete(key);
  }
}
