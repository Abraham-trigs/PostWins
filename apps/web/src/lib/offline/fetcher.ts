// apps/web/src/lib/offline/fetcher.ts
// Purpose: Centralized fetch wrapper with offline queue support,
// credential forwarding, and safe refresh mutex handling.

import { isOnline } from "./network";
import { enqueue } from "./queue";
import { stableStringify, sha256 } from "./serializer";
import { refreshSession } from "../api/auth.api";

type FetchOptions = RequestInit & {
  offlineQueue?: boolean;
};

/* ============================================================
   REFRESH MUTEX (single-flight protection)
   ============================================================ */

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  try {
    await refreshSession();
    return true;
  } catch {
    return false;
  }
}

async function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/* ============================================================
   FETCHER
   ============================================================ */

export async function fetcher(url: string, options: FetchOptions = {}) {
  const { offlineQueue = false, ...init } = options;

  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
  };

  const execute = async (): Promise<Response> => {
    return fetch(url, requestInit);
  };

  /* ============================================================
     READS (never queued)
     ============================================================ */
  if (!offlineQueue) {
    let res = await execute();

    if (res.status === 401) {
      const refreshed = await ensureRefreshed();
      if (!refreshed) {
        const error: any = new Error("Unauthorized");
        error.status = 401;
        throw error;
      }
      res = await execute();
    }

    if (!res.ok) {
      const error: any = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }

    return res.json();
  }

  /* ============================================================
     WRITES (online)
     ============================================================ */
  if (isOnline()) {
    let res = await execute();

    if (res.status === 401) {
      const refreshed = await ensureRefreshed();
      if (!refreshed) {
        const error: any = new Error("Unauthorized");
        error.status = 401;
        throw error;
      }
      res = await execute();
    }

    if (!res.ok) {
      const error: any = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }

    return res.json();
  }

  /* ============================================================
     OFFLINE WRITE → enqueue
     ============================================================ */

  // SAFE BODY PARSING: Handles JSON strings, objects, or FormData
  let body = null;
  try {
    body =
      typeof requestInit.body === "string"
        ? JSON.parse(requestInit.body)
        : requestInit.body;
  } catch {
    body = requestInit.body;
  }

  // Generate deterministic fingerprint for idempotency
  const fingerprint = await sha256(
    stableStringify({
      url,
      method: requestInit.method || "GET",
      body,
    }),
  );

  enqueue({
    id: fingerprint,
    url,
    method: (requestInit.method || "GET") as any,
    headers: requestInit.headers as Record<string, string>,
    body,
    createdAt: Date.now(),
  });

  return { queued: true };
}
