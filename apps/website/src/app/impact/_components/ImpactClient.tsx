// apps/website/src/app/impact/_components/ImpactClient.tsx
// Purpose: Client wrapper for the Impact page. Injects role-based narrative from stakeholderNarrative.ts while preserving static ImpactSection.

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useSafeExperienceStore } from "@/_store/useExperienceStore";
import ImpactSection from "@/_components/ImpactSection";
import { getImpactNarrative } from "./ImpactNarrative";
import type { PrimaryRole } from "@/_lib/experience.types";

/* =========================================================
   Assumptions
   =========================================================
   - useSafeExperienceStore exposes `primaryRole`
   - stakeholderNarrative.ts exists in the same /impact folder
   - ImpactSection is static and presentation-only
   - Route "/request-demo" exists
*/

/* =========================================================
   Design reasoning
   =========================================================
   This component mirrors ArchitectureClient structure:
   - Role-aware hero
   - Static ImpactSection
   - Role-aware CTA

   Narrative data is isolated in stakeholderNarrative.ts.
   UI logic remains clean and deterministic.
*/

/* =========================================================
   Component
   ========================================================= */

export default function ImpactClient(): JSX.Element {
  const role: PrimaryRole | null =
    useSafeExperienceStore((s) => s.primaryRole) ?? null;

  const narrative = getImpactNarrative(role);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      {/* =========================================================
          1. HERO
         ========================================================= */}
      <section className="relative pt-32 pb-20 px-6 border-b border-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-blue-500 font-mono text-xs uppercase tracking-[0.3em]">
            <BarChart3 size={16} />
            Impact_Validation_Framework
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            {narrative.hero.title}
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            {narrative.hero.subtitle}
          </p>
        </div>
      </section>

      {/* =========================================================
          2. IMPACT GRID (STATIC)
         ========================================================= */}
      <ImpactSection />

      {/* =========================================================
          3. ROLE-AWARE CTA
         ========================================================= */}
      <section className="py-32 text-center bg-black border-t border-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8 px-6"
        >
          <h2 className="text-3xl font-bold">{narrative.cta.headline}</h2>

          <p className="text-slate-500">{narrative.cta.body}</p>

          <Link
            href="/request-demo"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Request Demonstration
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

/* =========================================================
   Structure
   =========================================================
   - ImpactClient (default export)
     - Hero (role-aware)
     - ImpactSection (static)
     - CTA (role-aware)
*/

/* =========================================================
   Implementation guidance
   =========================================================
   In /app/impact/page.tsx:

   import type { Metadata } from "next";
   import ImpactClient from "./_components/ImpactClient";

   export const metadata: Metadata = {
     title: "Impact | PostWins",
     description: "Measurable governance impact through deterministic execution."
   };

   export default function ImpactPage() {
     return <ImpactClient />;
   }
*/

/* =========================================================
   Scalability insight
   =========================================================
   If role logic later moves server-side:
   - Pass role as prop from page.tsx
   - Remove direct store read
   - Keep stakeholderNarrative unchanged

   This preserves deterministic rendering and improves SEO alignment.
*/
