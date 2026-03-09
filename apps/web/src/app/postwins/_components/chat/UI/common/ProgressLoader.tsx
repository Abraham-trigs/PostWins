"use client";

import { useLoaderStore } from "../../hooks/useGlobalLoader";
import { useEffect, useState } from "react";

export function ProgressLoader() {
  const activeCount = useLoaderStore((s) => s.activeCount);
  const lastFinishedAt = useLoaderStore((s) => s.lastFinishedAt);
  const [isAnimatingGhost, setIsAnimatingGhost] = useState(false);

  // 👻 TRIGGER THE GHOST "VICTORY LAP"
  // When a task finishes, we keep the container alive for 600ms
  // to allow the faint pulse to shoot to 100% and fade.
  useEffect(() => {
    if (lastFinishedAt > 0) {
      setIsAnimatingGhost(true);
      const timer = setTimeout(() => setIsAnimatingGhost(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastFinishedAt]);

  const isVisible = activeCount > 0 || isAnimatingGhost;

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 h-[2.5px] w-full bg-transparent overflow-hidden z-50 pointer-events-none">
      {/* 1. THE GHOST FLASH (Faint color hitting the finish line) */}
      {isAnimatingGhost && (
        <div
          key={lastFinishedAt} // Force CSS reset for consecutive finishes
          className="absolute inset-0 bg-ocean/40 animate-ghost-finish w-full origin-left"
        />
      )}

      {/* 2. THE MAIN ACTIVE LINE (Only if tasks remain) */}
      {activeCount > 0 && (
        <div className="h-full bg-ocean animate-progress-loading w-full origin-left shadow-[0_0_10px_rgba(14,165,233,0.6)]" />
      )}
    </div>
  );
}
