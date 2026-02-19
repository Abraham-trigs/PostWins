// apps/website/src/_components/ExperienceRouter.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSafeExperienceStore } from "../_store/useExperienceStore";

/**
 * Design reasoning:
 * This component acts as a deterministic client-side traffic controller.
 * It only redirects after store hydration completes and survey context
 * is formally validated. Prevents SSR mismatch and redirect loops.
 *
 * Structure:
 * - Safe store selectors
 * - Hydration guard
 * - Lifecycle steering logic
 *
 * Implementation guidance:
 * - Never redirect before hydration resolves
 * - Always use router.replace to avoid history pollution
 *
 * Scalability insight:
 * Future extension: integrate feature flags or AB test routing
 * before deterministic role steering executes.
 */

export default function ExperienceRouter() {
  const router = useRouter();
  const pathname = usePathname();

  const role = useSafeExperienceStore((s) => s.primaryRole);
  const isComplete = useSafeExperienceStore((s) => s.hasCompletedSurvey);

  useEffect(() => {
    // Wait for hydration to resolve
    if (role === null || isComplete === null) return;

    // Only steer when formally complete
    if (!isComplete || !role) return;

    const isTargetedPath = pathname.startsWith(`/experience/${role}`);

    const isManifestoPath =
      pathname === "/about" || pathname === "/architecture";

    if (!isTargetedPath && !isManifestoPath) {
      router.replace(`/experience/${role}`);
    }
  }, [isComplete, role, pathname, router]);

  return null;
}
