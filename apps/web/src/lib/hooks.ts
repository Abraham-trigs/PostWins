// apps/web/src/lib/hooks.ts
// Purpose: Auth hydration hook aligned with Zustand store lifecycle

"use client";

import { useEffect } from "react";
import { useAuthStore } from "../lib/store/useAuthStore";

/**
 * Design reasoning:
 * - Hydration logic lives inside the store.
 * - Hook only triggers store.hydrate().
 * - Prevents duplicated state logic.
 * - Avoids direct mutation of internal state setters.
 *
 * Structure:
 * - useAuthHydration()
 *
 * Implementation guidance:
 * - Used once in AuthHydrator component.
 * - Do not call getCurrentUser here directly.
 *
 * Scalability insight:
 * - Can extend to include session revalidation interval.
 */

export function useAuthHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
