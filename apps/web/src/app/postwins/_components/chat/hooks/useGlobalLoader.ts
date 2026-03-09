"use client";

import { create } from "zustand";

interface LoaderState {
  activeCount: number;
  lastFinishedAt: number; // 🕒 Trigger for the "Ghost Flash"
  start: () => void;
  stop: () => void;
}

/**
 * 🧠 The Loader Brain
 * Tracks active requests and signals 'finish' events.
 */
export const useLoaderStore = create<LoaderState>((set) => ({
  activeCount: 0,
  lastFinishedAt: 0,
  start: () => set((s) => ({ activeCount: s.activeCount + 1 })),
  stop: () =>
    set((s) => ({
      activeCount: Math.max(0, s.activeCount - 1),
      lastFinishedAt: Date.now(), // 🚀 Signal a "Finish" event
    })),
}));

export function useGlobalLoader() {
  const { start, stop } = useLoaderStore();
  return { startLoading: start, stopLoading: stop };
}
