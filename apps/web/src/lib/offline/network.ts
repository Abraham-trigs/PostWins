// apps/web/src/lib/offline/network.ts

type Listener = (online: boolean) => void;

let online = typeof navigator !== "undefined" ? navigator.onLine : true;
const listeners = new Set<Listener>();

export function isOnline() {
  return online;
}

export function onNetworkChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    online = true;
    listeners.forEach((l) => l(true));
  });

  window.addEventListener("offline", () => {
    online = false;
    listeners.forEach((l) => l(false));
  });
}
