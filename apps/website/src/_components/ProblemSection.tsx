// apps/website/src/_components/ProblemSection.tsx
"use client";

import { useSafeExperienceStore } from "../_store/useExperienceStore";
import { STAKEHOLDER_COPY } from "../_lib/stakeholder-content";

/**
 * Design reasoning:
 * Problem messaging adapts to stakeholder identity and must remain
 * hydration-safe. We never assume role exists during first render.
 *
 * Structure:
 * - Safe role selector
 * - Defensive stakeholder resolution
 * - Structured risk rendering
 *
 * Implementation guidance:
 * - Always guard against null role
 * - Never cast types blindly from store
 *
 * Scalability insight:
 * If problem definitions expand, consider strongly typing
 * STAKEHOLDER_COPY with a shared domain contract.
 */

export default function ProblemSection() {
  const roleFromStore = useSafeExperienceStore((s) => s.primaryRole);

  const role = roleFromStore ?? "observer";

  const stakeholder =
    STAKEHOLDER_COPY[role as keyof typeof STAKEHOLDER_COPY] ??
    STAKEHOLDER_COPY["observer"];

  const { problem } = stakeholder;

  return (
    <section className="py-20 border-t border-slate-900 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-6">{problem.title}</h2>

        <p className="text-lg text-slate-400 mb-8">{problem.body}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {problem.risks.map((risk, i) => (
            <div
              key={risk}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-slate-300">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
