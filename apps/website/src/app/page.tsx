// apps/website/src/app/page.tsx
import VariantBoundary from "@/_components/VariantBoundary";
import CTAGroup from "@/_components/CTAGroup";
import ProblemSection from "@/_components/ProblemSection";
import ArchitectureSection from "@/app/architecture/_components/ArchitectureSection";
import ImpactSection from "@/_components/ImpactSection";

/**
 * PRODUCTION-GRADE LANDING PAGE
 * Orchestrates a deterministic stakeholder journey through
 * hot-swappable value propositions and architectural evidence.
 */
export default function HomePage() {
  return (
    <div className="bg-slate-950 overflow-x-hidden">
      {/* 1. HERO SECTION: IDENTITY & VALUE PROP */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Visual Background Layer */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)]" />

        <VariantBoundary
          // Donor Perspective
          donor={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                Verified <span className="text-green-500">Impact ROI.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Directly link funding to infrastructure uptime and NGO
                compliance through deterministic, ledger-backed audit trails.
              </p>
            </div>
          }
          // Regulator Perspective
          regulator={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                Real-time <span className="text-blue-500">Audit.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Automated compliance monitoring for cross-border deployments
                with verified governance snapshots and transition integrity.
              </p>
            </div>
          }
          // Technical Perspective
          technical={
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                Hardened <span className="text-orange-500">Nodes.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Distributed impact infrastructure with verifiable state
                transitions and role-based capability enforcement.
              </p>
            </div>
          }
          // Default / Observer
          fallback={
            <div className="space-y-6 max-w-4xl">
              <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter">
                Governance <br />
                <span className="text-blue-600">Redefined.</span>
              </h1>
              <p className="text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
                Deterministic infrastructure for organizations that cannot
                afford ambiguity.
              </p>
            </div>
          }
        />

        {/* Orchestrated CTA Layer: Swaps based on stakeholder state */}
        <CTAGroup />
      </section>

      {/* 2. PROBLEM SECTION: AMBIGUITY RISKS */}
      <ProblemSection />

      {/* 3. ARCHITECTURE SECTION: 6-LAYER ENGINE DEEP-DIVE */}
      <ArchitectureSection />

      {/* 4. IMPACT SECTION: PROVABLE OUTCOMES */}
      <ImpactSection />

      {/* 5. FOOTER */}
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
