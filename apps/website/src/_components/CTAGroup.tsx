// apps/website/src/_components/CTAGroup.tsx
"use client";

import Link from "next/link";
import { useSafeExperienceStore } from "../_store/useExperienceStore";
import { motion } from "framer-motion";

/**
 * Design reasoning:
 * CTA behavior must be deterministic and hydration-safe.
 * We read persisted stakeholder context using the safe store hook
 * and render conditionally only after hydration resolves.
 *
 * Structure:
 * - Safe store selectors
 * - Null-safe fallbacks
 * - Conditional CTA rendering
 *
 * Implementation guidance:
 * - Always guard against null from useSafeExperienceStore
 * - Never assume store has hydrated on first render
 *
 * Scalability insight:
 * Future: inject experiment flags or feature toggles into CTA logic
 * without coupling to presentation layer.
 */

export default function CTAGroup() {
  const role = useSafeExperienceStore((s) => s.primaryRole);
  const isComplete = useSafeExperienceStore((s) => s.hasCompletedSurvey);

  // Prevent flicker before hydration
  if (role === null && isComplete === null) {
    return null;
  }

  const hasContext = Boolean(role && isComplete);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
    >
      {hasContext ? (
        <>
          <Link
            href={`/experience/${role}`}
            className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all"
          >
            Enter {role?.replace("_", " ")} Workspace
          </Link>

          <Link
            href="/experience/overview"
            className="px-10 py-4 bg-slate-900 text-slate-400 rounded-full font-bold text-lg border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
          >
            Change Perspective
          </Link>
        </>
      ) : (
        <Link
          href="/experience/overview"
          className="px-12 py-5 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all"
        >
          Personalize Your Experience
        </Link>
      )}
    </motion.div>
  );
}
