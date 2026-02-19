// apps/website/src/features/ab-testing/VariantBoundary.tsx
"use client";

import { useSafeExperienceStore } from "../../_store/useExperienceStore";
import { getVariant, Variant } from "./variant";

export function VariantBoundary({
  control,
  variants,
}: {
  control: React.ReactNode;
  variants: Partial<Record<Variant, React.ReactNode>>;
}) {
  // Use session ID or device ID for consistency
  const activeVariant = getVariant("user-session-id");

  return <>{variants[activeVariant] || control}</>;
}
