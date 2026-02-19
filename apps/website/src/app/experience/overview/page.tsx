// apps/website/src/app/experience/overview/page.tsx
// Purpose: Base experience overview route that triggers modal interception

import type { Metadata } from "next";

/**
 * Design reasoning:
 * This page exists purely as the canonical base route for stakeholder onboarding.
 * The modal intercept attaches to this route via @modal/(.)experience/overview.
 * The page itself remains minimal and deterministic.
 *
 * Structure:
 * - Static metadata
 * - Lightweight placeholder content
 * - No client logic (modal handles identity derivation)
 *
 * Implementation guidance:
 * Do NOT embed ExperienceSurvey here.
 * The modal slot renders it via parallel route interception.
 *
 * Scalability insight:
 * This page can later evolve into a public overview manifesto
 * while still supporting modal-based onboarding.
 */

export const metadata: Metadata = {
  title: "Experience Overview | PostWins",
  description:
    "Select your governance perspective to enter the deterministic lifecycle engine.",
};

export default function ExperienceOverviewPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="text-center space-y-6 max-w-xl">
        <h1 className="text-4xl font-black tracking-tight">
          Governance Perspective Required
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed">
          PostWins enforces deterministic stakeholder identity before entering
          lifecycle workspaces.
        </p>

        <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
          Awaiting Identity Derivation...
        </p>
      </div>
    </section>
  );
}
