// apps/web/src/lib/api/cases.api.ts
// Purpose: Resilient, abortable, deduplicated client for GET /api/cases + GET /api/cases/:id

import type { ListCasesResponse, CaseDetailsResponse } from "@posta/core";
import { fetcher } from "../../../offline/fetcher";

/* ============================================================
   Assumptions
   ------------------------------------------------------------
   - Backend routes:
       GET /api/cases
       GET /api/cases/:id
   - fetcher returns parsed JSON
   - Response shape always includes { ok: boolean }
   ============================================================ */

/* ============================================================
   Types
   ============================================================ */

export type CaseListItem = ListCasesResponse["cases"][number];

export type ListCasesParams = {
  cursor?: string | null;
  limit?: number;
  search?: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

/* ============================================================
   Internal request dedupe store (list only)
   ============================================================ */

const inflight = new Map<string, AbortController>();

function buildQuery(params: ListCasesParams) {
  const q = new URLSearchParams();

  if (params.cursor) q.set("cursor", params.cursor);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);

  return q.toString();
}

/* ============================================================
   LIST CASES (lightweight projection)
   ============================================================ */

export async function listCases(
  params: ListCasesParams = {},
  options: RequestOptions = {},
): Promise<ListCasesResponse> {
  const query = buildQuery(params);
  const key = `cases:${query}`;

  // Abort identical in-flight request (dedupe)
  if (inflight.has(key)) {
    inflight.get(key)!.abort();
    inflight.delete(key);
  }

  const internalController = new AbortController();
  inflight.set(key, internalController);

  const combinedController = new AbortController();

  function forwardAbort(signal?: AbortSignal) {
    if (!signal) return;
    if (signal.aborted) {
      combinedController.abort();
      return;
    }
    signal.addEventListener("abort", () => {
      combinedController.abort();
    });
  }

  forwardAbort(options.signal);
  forwardAbort(internalController.signal);

  try {
    const data = await fetcher(`/api/cases?${query}`, {
      method: "GET",
      credentials: "include",
      signal: combinedController.signal,
    });

    if (!data?.ok) {
      throw new Error("Invalid response shape");
    }

    return data as ListCasesResponse;
  } finally {
    inflight.delete(key);
  }
}

/* ============================================================
   GET CASE DETAILS (authoritative projection)
   ============================================================ */

export async function getCaseDetails(
  id: string,
  options: RequestOptions = {},
): Promise<CaseDetailsResponse> {
  if (!id) {
    throw new Error("Case id is required");
  }

  const data = await fetcher(`/api/cases/${id}`, {
    method: "GET",
    credentials: "include",
    signal: options.signal,
  });

  if (!data?.ok) {
    throw new Error("Invalid response shape");
  }

  return data as CaseDetailsResponse;
}

/* ============================================================
   Design reasoning
   ------------------------------------------------------------
   - Separation maintained:
       listCases → lightweight navigation projection
       getCaseDetails → authoritative heavy projection
   - Deduping only applied to list (common repeated calls).
   - Details endpoint respects React lifecycle cancellation.
   - Strongly typed return contracts from core.
   - No any, no inference guessing.
   ============================================================ */

/* ============================================================
   Structure
   ------------------------------------------------------------
   - buildQuery
   - listCases (cursor + dedupe + abort-safe)
   - getCaseDetails (authoritative fetch)
   ============================================================ */

/* ============================================================
   Implementation guidance
   ------------------------------------------------------------
   In DetailsPanel:
     const controller = new AbortController()
     getCaseDetails(id, { signal: controller.signal })

   Abort on unmount to avoid state updates after teardown.
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   If details payload grows large (timeline, ledger, evidence),
   consider adding:
       GET /cases/:id?include=timeline,ledger
   to allow partial hydration.
   ============================================================ */
