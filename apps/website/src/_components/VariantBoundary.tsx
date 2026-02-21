// apps/website/src/_components/VariantBoundary.tsx
"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeExperienceStore } from "../_store/useExperienceStore";

/**
 * Design reasoning:
 * VariantBoundary deterministically swaps UI clusters based on
 * persisted stakeholder identity. It must avoid hydration mismatch,
 * prevent early redirects, and never assume store state is ready.
 *
 * Structure:
 * - Safe store selectors
 * - Hydration guard
 * - Deterministic variant map
 * - Animated transition wrapper
 *
 * Implementation guidance:
 * - Never branch on store values before hydration resolves
 * - Avoid dynamic key access without defensive fallback
 *
 * Scalability insight:
 * If stakeholder roles expand, convert variants to a strongly typed
 * enum-backed mapping instead of string indexing.
 */

interface VariantProps {
  donor?: ReactNode;
  regulator?: ReactNode;
  operator?: ReactNode;
  technical?: ReactNode;
  observer?: ReactNode;
  fallback: ReactNode;
}

export default function VariantBoundary({
  donor,
  regulator,
  operator,
  technical,
  observer,
  fallback,
}: VariantProps) {
  const role = useSafeExperienceStore((s) => s.primaryRole);
  const isComplete = useSafeExperienceStore((s) => s.hasCompletedSurvey);

  // Wait for hydration
  if (role === null || isComplete === null) {
    return <div className="animate-fade-in">{fallback}</div>;
  }

  // If survey incomplete or role missing → fallback
  if (!isComplete || !role) {
    return <div className="animate-fade-in">{fallback}</div>;
  }

  const variants: Record<string, ReactNode | undefined> = {
    donor,
    regulator,
    operator,
    technical,
    observer,
  };

  const activeContent = variants[role] ?? fallback;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={role}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer" />
        </div>

        {activeContent}
      </motion.div>
    </AnimatePresence>
  );
}
