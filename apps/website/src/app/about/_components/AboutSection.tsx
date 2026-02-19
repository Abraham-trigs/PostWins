// apps/website/src/_components/AboutSection.tsx
"use client";

import { useExperienceStore } from "../../../_store/useExperienceStore";
import { STAKEHOLDER_COPY } from "../../../_lib/stakeholder-content";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, Cpu, Lock, ArrowRight, Zap } from "lucide-react";

export default function AboutSection() {
  const primaryRole = useExperienceStore((s) => s.primaryRole);

  // Deterministic fallback
  const role = primaryRole ?? "observer";

  const { architectureFocus } =
    STAKEHOLDER_COPY[role as keyof typeof STAKEHOLDER_COPY];

  const LIFECYCLE_STEPS = [
    "Intake",
    "Classification",
    "Routing",
    "Verification",
    "Approval",
    "Disbursement",
    "Execution",
    "Reconciliation",
  ];

  return (
    <section className="bg-slate-950 py-32 border-t border-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        {/* 1. THE PREMISE */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              About <span className="text-blue-600">PostWins.</span>
            </h2>
            <div className="space-y-4 text-xl text-slate-400 leading-relaxed italic border-l-4 border-blue-600 pl-8 py-2">
              <p>
                "In high-governance environments, ambiguity is unacceptable."
              </p>
              <p className="text-slate-200">
                Most platforms track cases. PostWins governs execution.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white">
              Why PostWins Exists
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Organizations face systemic risks: manual routing, opaque logic,
              and fragmented audit trails. These are not UI problems.{" "}
              <span className="text-white font-bold">
                They are architectural problems.
              </span>
            </p>
            <ul className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-red-500 rounded-full" /> Manual
                Routing
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-red-500 rounded-full" /> Opaque Logic
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-red-500 rounded-full" /> Audit Gaps
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-red-500 rounded-full" /> Tenant Risk
              </li>
            </ul>
          </div>
        </div>

        {/* 2. THE PHILOSOPHY (Stakeholder Aware) */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight underline decoration-blue-600 underline-offset-8">
              Our Philosophy
            </h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.4em]">
              Governance Engineered, Not Assumed
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Correctness > Convenience",
                icon: <Scale />,
                desc: "Deterministic transitions over manual overrides.",
              },
              {
                title: "Structural Auditability",
                icon: <ShieldCheck />,
                desc: architectureFocus.whyItMatters,
              },
              {
                title: "Engineered Governance",
                icon: <Lock />,
                desc: "Policy enforcement at the service layer.",
              },
              {
                title: "Deterministic Velocity",
                icon: <Zap />,
                desc: "Correctness accelerates impact delivery.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-black border border-slate-900 group hover:border-blue-500/50 transition-all"
              >
                <div className="text-blue-500 mb-4">{item.icon}</div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. DIFFERENTIATION: THE LIFECYCLE LAW */}
        <div className="p-12 rounded-[4rem] bg-gradient-to-br from-slate-900 to-black border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cpu size={120} />
          </div>
          <div className="relative z-10 space-y-12">
            <header className="max-w-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                1. Deterministic State Modeling
              </h3>
              <p className="text-slate-400">
                Every operational lifecycle is modeled explicitly. Invalid
                transitions are rejected. The ledger is the authoritative
                history.
              </p>
            </header>

            {/* Visual Lifecycle Pipeline */}
            <div className="flex flex-wrap justify-between items-center gap-y-8 gap-x-4">
              {LIFECYCLE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600">
                      {i + 1}
                    </span>
                    <span className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold uppercase tracking-tighter text-slate-300">
                      {step}
                    </span>
                  </div>
                  {i < LIFECYCLE_STEPS.length - 1 && (
                    <ArrowRight size={12} className="text-slate-800 mt-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FINAL MISSION STATEMENT */}
        <div className="text-center max-w-2xl mx-auto space-y-6 pb-20">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-500 italic">
            "To reduce ambiguity in high-governance environments. We are not
            building dashboards. We are building deterministic execution
            infrastructure for institutions that cannot afford uncertainty."
          </p>
        </div>
      </div>
    </section>
  );
}
