"use client";

import { useSafeExperienceStore } from "@/_store/useExperienceStore";
import ArchitectureSection from "./ArchitectureSection";
import ImpactSection from "@/_components/ImpactSection";
import { motion } from "framer-motion";
import { Code2, Cpu, Fingerprint, Network } from "lucide-react";

export default function ArchitectureClient() {
  const role = useSafeExperienceStore((s) => s.primaryRole) || "observer";

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      {/* 1. TECHNICAL HERO */}
      <section className="relative pt-32 pb-20 px-6 border-b border-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-blue-500 font-mono text-xs uppercase tracking-[0.3em]">
            <Cpu size={16} />
            System Specification v2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Deterministic <br />
            <span className="text-blue-600">Execution Stack.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            PostWins is engineered as a modular governance engine. It enforces
            structured lifecycle progression across operational systems where
            outcomes must be provable.
          </p>
        </div>
      </section>

      {/* 2. CORE ARCHITECTURE ENGINE */}
      <ArchitectureSection />

      {/* 3. CORE ARCHITECTURAL TENETS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
            <Fingerprint className="text-blue-500 h-8 w-8" />
            <h3 className="text-xl font-bold">Immutable Ledger</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              All critical lifecycle transitions are committed to an immutable
              ledger, enabling full state reconstruction and regulatory audit
              readiness.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
            <Network className="text-blue-500 h-8 w-8" />
            <h3 className="text-xl font-bold">Multi-Tenant Isolation</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Data separation is architectural, not conventional. Isolation is
              enforced at the schema, middleware, and policy levels.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
            <Code2 className="text-blue-500 h-8 w-8" />
            <h3 className="text-xl font-bold">Deterministic Modeling</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Invalid transitions are rejected at the service layer. Governance
              is engineered into the state machine, not assumed by trust.
            </p>
          </div>
        </div>
      </section>

      {/* 4. IMPACT PROOF SECTION */}
      <ImpactSection />

      {/* 5. FINAL CTA */}
      <section className="py-32 text-center bg-black border-t border-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-3xl font-bold">
            Ready to enforce {role} integrity?
          </h2>

          <p className="text-slate-500">
            Join institutions reducing systemic risk through architectural
            enforcement.
          </p>

          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all active:scale-95">
              Request Tech Spec
            </button>

            <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold border border-slate-800 hover:bg-slate-800 transition-all">
              Contact Engineering
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
