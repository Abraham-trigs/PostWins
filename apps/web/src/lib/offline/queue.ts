// apps/web/src/lib/offline/queue.ts
// NOTE:
// Offline queue is transport-only.
// Must not infer, modify, or advance taskId or lifecycle.

export type OfflineMutation = {
  id: string;
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body: unknown;
  createdAt: number;
};

const KEY = "posta.offline.queue";

function read(): OfflineMutation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(queue: OfflineMutation[]) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function enqueue(mutation: OfflineMutation) {
  const queue = read();
  write([...queue, mutation]);
}

export function dequeue(id: string) {
  const queue = read().filter((m) => m.id !== id);
  write(queue);
}

export function listQueue(): OfflineMutation[] {
  return read();
}
