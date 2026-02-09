// apps/web/src/lib/offline/fetcher.ts
import { isOnline } from "./network";
import { enqueue } from "./queue";
import { stableStringify, sha256 } from "./serializer";

type FetchOptions = RequestInit & {
  offlineQueue?: boolean; // explicit opt-in
};

export async function fetcher(url: string, options: FetchOptions = {}) {
  const { offlineQueue = false, ...init } = options;

  // READS: never queued
  if (!offlineQueue) {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // WRITES
  if (isOnline()) {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // OFFLINE WRITE → enqueue
  const body = init.body ? JSON.parse(init.body as string) : null;

  const fingerprint = await sha256(
    stableStringify({ url, method: init.method, body }),
  );

  enqueue({
    id: fingerprint,
    url,
    method: init.method as any,
    headers: init.headers as Record<string, string>,
    body,
    createdAt: Date.now(),
  });

  return { queued: true };
}
