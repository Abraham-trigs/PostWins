// apps/website/src/_components/VariantBoundary.tsx
"use client";

import { useSafeStore } from "../_store/useExperienceStore";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VariantProps {
  donor?: ReactNode;
  regulator?: ReactNode;
  operator?: ReactNode;
  technical?: ReactNode;
  observer?: ReactNode; // Added for growth
  fallback: ReactNode;
}

/**
 * PRODUCTION-GRADE VARIANT BOUNDARY
 * Deterministically swaps UI clusters based on persisted stakeholder state.
 * Prevents hydration mismatch and enforces smooth state transitions.
 */
export default function VariantBoundary({
  donor,
  regulator,
  operator,
  technical,
  observer,
  fallback,
}: VariantProps) {
  const role = useSafeStore((s) => s.primaryRole);
  const isComplete = useSafeStore((s) => s.hasCompletedSurvey);

  // 1. Static Fallback for initial server render / unpersonalized state
  if (!isComplete || !role) {
    return <div className="animate-fade-in">{fallback}</div>;
  }

  // 2. Deterministic Mapping (Replaces eval)
  const variants: Record<string, ReactNode> = {
    donor,
    regulator,
    operator,
    technical,
    observer,
  };

  const activeContent = variants[role] || fallback;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={role}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1], // Custom "Governance" ease-out
        }}
        className="relative"
      >
        {/* Visual Cue: Stakeholder State Active */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />
        </div>

        {activeContent}
      </motion.div>
    </AnimatePresence>
  );
}
