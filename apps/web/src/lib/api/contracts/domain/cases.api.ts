// apps/web/src/lib/api/cases.api.ts
// Purpose: Resilient, abortable, deduplicated cursor-based client for GET /api/cases

import type { ListCasesResponse } from "@posta/core";
import { fetcher } from "../../../offline/fetcher";

/* ============================================================
   Design reasoning
   ------------------------------------------------------------
   - Accepts external AbortSignal (React lifecycle control).
   - Still deduplicates identical in-flight requests.
   - Never aborts caller-controlled signals.
   - Clean separation between dedupe and lifecycle cancellation.
   - Strongly typed boundary.
   ============================================================ */

/**
 * Indexed access keeps UI in sync with core contract.
 */
export type CaseListItem = ListCasesResponse["cases"][number];

export type ListCasesParams = {
  cursor?: string | null;
  limit?: number;
  search?: string;
};

type ListCasesOptions = {
  signal?: AbortSignal;
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
 * listCases
 *
 * - params: cursor, limit, search
 * - options.signal: external lifecycle cancellation
 */
export async function listCases(
  params: ListCasesParams = {},
  options: ListCasesOptions = {},
): Promise<ListCasesResponse> {
  const query = buildQuery(params);
  const key = `cases:${query}`;

  /**
   * Abort any identical in-flight request
   * (dedupe behavior — not lifecycle cancellation)
   */
  if (inflight.has(key)) {
    inflight.get(key)!.abort();
    inflight.delete(key);
  }

  const internalController = new AbortController();
  inflight.set(key, internalController);

  /**
   * Combine signals safely:
   * - external signal (React lifecycle)
   * - internal dedupe signal
   */
  const combinedController = new AbortController();

  function forwardAbort(signal: AbortSignal | undefined) {
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
  } catch (err: any) {
    if (err?.name === "AbortError") {
      // Controlled cancellation — not an error condition
      throw err;
    }

    throw err;
  } finally {
    inflight.delete(key);
  }
}
