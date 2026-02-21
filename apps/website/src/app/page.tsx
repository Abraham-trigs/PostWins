// apps/website/src/app/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import VariantBoundary from "@/_components/VariantBoundary";
import CTAGroup from "@/_components/CTAGroup";
import ProblemSection from "@/_components/ProblemSection";
import ArchitectureSection from "@/app/architecture/_components/ArchitectureSection";
import ImpactSection from "@/_components/ImpactSection";

export default function HomePage() {
  if (!motion || !motion.div) {
    return <div className="text-white">Loading Animation Engine...</div>;
  }

  return (
    <div className="bg-slate-950 overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* LOGO SECTION - Adjusted for Mobile Positioning */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          // Pulls logo up into the header area on mobile (-mt-24)
          // while keeping standard desktop spacing (md:-mt-20)
          className="mb-8 -mt-24 md:-mt-20 relative group z-20"
        >
          {/* Enhanced glow to fill the upper gap */}
          <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full scale-150 opacity-40 group-hover:opacity-60 transition-opacity" />

          <Image
            src="/PostWins_logo_version_2.svg"
            alt="PostWins Logo"
            width={844}
            height={964}
            // Keeps logo size consistent (h-40) across screen sizes
            className="h-40 md:h-60 w-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            priority
          />
        </motion.div>

        <VariantBoundary
          donor={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">
                Verified <span className="text-green-500">Impact ROI.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Directly link funding to infrastructure uptime and NGO
                compliance through deterministic, ledger-backed audit trails.
              </p>
            </div>
          }
          regulator={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">
                Real-time <span className="text-blue-500">Audit.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Automated compliance monitoring for cross-border deployments
                with verified governance snapshots and transition integrity.
              </p>
            </div>
          }
          technical={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">
                Hardened <span className="text-orange-500">Nodes.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Distributed impact infrastructure with verifiable state
                transitions and role-based capability enforcement.
              </p>
            </div>
          }
          fallback={
            <div className="space-y-6 max-w-4xl">
              <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.9]">
                Governance <br />
                <span className="text-blue-600">Redefined.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium mt-4">
                Deterministic infrastructure for organizations that cannot
                afford ambiguity.
              </p>
            </div>
          }
        />

        <div className="mt-10 md:mt-16">
          <CTAGroup />
        </div>
      </section>

      {/* OTHER SECTIONS REMAIN UNCHANGED */}
      <ProblemSection />
      <ArchitectureSection />
      <ImpactSection />

      <footer className="py-20 border-t border-slate-900 bg-black text-center">
        <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-slate-600">
          PostWins Infrastructure • Deterministic Layer v2.0
        </div>
        <p className="text-slate-700 text-xs font-medium">
          Built for high-governance institutions. Trust is architectural.
        </p>
      </footer>
    </div>
  );
}
