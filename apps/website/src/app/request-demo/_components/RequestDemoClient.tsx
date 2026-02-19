// apps/website/src/app/request-demo/_components/RequestDemoClient.tsx
// Purpose: Client wrapper for the Request Demo page with role-based narrative injection.

"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useSafeExperienceStore } from "@/_store/useExperienceStore";
import { getRequestDemoNarrative } from "../requestDemoNarrate";
import type { PrimaryRole } from "@/_lib/experience.types";

/* =========================================================
   Design reasoning
   =========================================================
   Mirrors ArchitectureClient and ImpactClient structure.
   Keeps narrative isolated in requestDemoNarrate.ts.
   CTA remains simple mailto per requirement.
*/

/* =========================================================
   Component
   ========================================================= */

export default function RequestDemoClient(): JSX.Element {
  const role: PrimaryRole | null =
    useSafeExperienceStore((s) => s.primaryRole) ?? null;

  const narrative = getRequestDemoNarrative(role);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      {/* =========================================================
          HERO
         ========================================================= */}
      <section className="relative pt-32 pb-20 px-6 border-b border-slate-900">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-blue-500 font-mono text-xs uppercase tracking-[0.3em]">
            <Mail size={16} />
            Demonstration_Request_Channel
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            {narrative.hero.title}
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed">
            {narrative.hero.subtitle}
          </p>
        </div>
      </section>

      {/* =========================================================
          CTA SECTION
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

          <a
            href={`mailto:${narrative.cta.email}`}
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Schedule Demonstration
          </a>
        </motion.div>
      </section>
    </div>
  );
}

/* =========================================================
   Structure
   =========================================================
   - RequestDemoClient (default export)
     - Hero (role-aware)
     - CTA block (role-aware)
*/

/* =========================================================
   Implementation guidance
   =========================================================
   In /app/request-demo/page.tsx:

   import type { Metadata } from "next";
   import RequestDemoClient from "./_components/RequestDemoClient";

   export const metadata: Metadata = {
     title: "Request Demo | PostWins",
     description: "Schedule a deterministic governance walkthrough."
   };

   export default function RequestDemoPage() {
     return <RequestDemoClient />;
   }
*/

/* =========================================================
   Scalability insight
   =========================================================
   Can be upgraded to a validated form without changing
   narrative architecture or routing.
*/
