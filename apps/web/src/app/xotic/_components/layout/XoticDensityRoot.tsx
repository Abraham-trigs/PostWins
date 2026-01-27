"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Rows } from "lucide-react";

type Density = "comfortable" | "compact";
type Position = { x: number; y: number };

const STORAGE_KEY = "xotic:density";
const POSITION_KEY = "xotic:density:position";

// Small helper to keep the button within the viewport.
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function XoticDensityRoot({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>("comfortable");

  // Position is in viewport pixels (top-left origin). We set an initial fallback after mount.
  const [pos, setPos] = useState<Position>({ x: 16, y: 16 });

  // Used to measure the toggle size for viewport clamping.
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Drag state lives in a ref to avoid rerenders during pointer move.
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  // Load density + position
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "compact" || saved === "comfortable") setDensity(saved);
    } catch {}

    try {
      const raw = window.localStorage.getItem(POSITION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Position;
        if (
          typeof parsed?.x === "number" &&
          typeof parsed?.y === "number" &&
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y)
        ) {
          setPos(parsed);
          return;
        }
      }
    } catch {}

    // If no saved position, default to bottom-left after mount (since we need viewport height).
    // We’ll also clamp after measuring the button.
    requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rect = toggleRef.current?.getBoundingClientRect();
      const btnW = rect?.width ?? 140;
      const btnH = rect?.height ?? 40;

      setPos({
        x: 16,
        y: h - btnH - 16,
      });

      // Extra safety clamp.
      setPos((p) => ({
        x: clamp(p.x, 0, Math.max(0, w - btnW)),
        y: clamp(p.y, 0, Math.max(0, h - btnH)),
      }));
    });
  }, []);

  // Persist density
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, density);
    } catch {}
  }, [density]);

  // Persist position
  useEffect(() => {
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch {}
  }, [pos]);

  const nextDensity = useMemo<Density>(
    () => (density === "comfortable" ? "compact" : "comfortable"),
    [density]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only primary button / main touch.
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const origin = pos;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
      moved: false,
    };

    // Capture the pointer so we keep receiving move/up events.
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Mark as "moved" once we cross a small threshold, so click won’t toggle density accidentally.
    if (!drag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      drag.moved = true;
    }

    const rect = toggleRef.current?.getBoundingClientRect();
    const btnW = rect?.width ?? 140;
    const btnH = rect?.height ?? 40;

    const maxX = Math.max(0, window.innerWidth - btnW);
    const maxY = Math.max(0, window.innerHeight - btnH);

    setPos({
      x: clamp(drag.originX + dx, 0, maxX),
      y: clamp(drag.originY + dy, 0, maxY),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    // Release drag state.
    dragRef.current = null;

    // If user didn't drag (it was a click), toggle density.
    // If they dragged, do NOT toggle.
    // We detect that in onClick too as an extra guard.
    if (!drag.moved) {
      setDensity(nextDensity);
    }
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If a pointer drag happened, block click-to-toggle.
    // (Browsers can still fire click after drag.)
    const drag = dragRef.current;
    if (drag?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="min-h-dvh w-full bg-paper text-ink overflow-hidden relative"
      data-xotic-density={density}
    >
      {children}

      {/* Movable density toggle */}
      <button
        ref={toggleRef}
        type="button"
        aria-label={`Switch density to ${nextDensity}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        className="
          fixed z-50
          flex items-center gap-2
          h-10 px-2
          rounded-pill
          border border-line/50
          bg-surface-strong
          backdrop-blur
          shadow-card
          text-ink/70
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          cursor-grab active:cursor-grabbing
          touch-none select-none
        "
        style={{
          left: 0,
          top: 0,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
        title="Drag to move • Click to toggle density"
      >
        <span className="sr-only">{`Current density: ${density}`}</span>

        {/* Comfortable icon */}
        <LayoutGrid
          className={[
            "h-4 w-4 transition-colors",
            density === "comfortable"
              ? "text-[var(--brand-primary)]"
              : "text-ink/40",
          ].join(" ")}
        />

        {/* Toggle track */}
        <span
          aria-hidden="true"
          className="
            relative h-5 w-10
            rounded-full
            bg-surface
            border border-line/50
          "
        >
          <span
            className={[
              "absolute top-0.5 h-4 w-4 rounded-full transition-transform",
              "bg-[var(--brand-primary)]",
              density === "compact" ? "translate-x-5" : "translate-x-1",
            ].join(" ")}
          />
        </span>

        {/* Compact icon */}
        <Rows
          className={[
            "h-4 w-4 transition-colors",
            density === "compact"
              ? "text-[var(--brand-primary)]"
              : "text-ink/40",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
