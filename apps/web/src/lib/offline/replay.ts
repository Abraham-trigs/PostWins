// apps/web/src/lib/offline/replay.ts

import { listQueue, dequeue } from "./queue";
import { isOnline, onNetworkChange } from "./network";

export async function replayQueue() {
  if (!isOnline()) return;

  const queue = listQueue();

  for (const job of queue) {
    try {
      const res = await fetch(job.url, {
        method: job.method,
        headers: job.headers,
        body: JSON.stringify(job.body),
      });

      if (!res.ok) {
        // server rejected → keep in queue
        continue;
      }

      // success → remove
      dequeue(job.id);
    } catch {
      // network failed → stop replay
      return;
    }
  }
}

// Auto-replay when back online
onNetworkChange((online) => {
  if (online) replayQueue();
});
