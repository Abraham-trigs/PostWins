// apps/website/src/_components/ArchitectureSection.tsx
"use client";

import { useSafeStore } from "../_store/useExperienceStore";
import { STAKEHOLDER_COPY } from "../_lib/stakeholder-content";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Search,
  RotateCcw,
} from "lucide-react";

const ARCH_LAYERS = [
  {
    name: "Domain Layer",
    icon: <Layers className="h-5 w-5" />,
    detail:
      "Explicit modeling of lifecycle states, transition rules, and authority hierarchies.",
  },
  {
    name: "Service Layer",
    icon: <Cpu className="h-5 w-5" />,
    detail:
      "Deterministic validation pipelines. No direct database mutation bypass allowed.",
  },
  {
    name: "Relational Integrity",
    icon: <Database className="h-5 w-5" />,
    detail:
      "Prisma-backed foreign key constraints and strict multi-tenant partitioning.",
  },
  {
    name: "Ledger Commit",
    icon: <ShieldCheck className="h-5 w-5" />,
    detail:
      "Immutable event hashing for full state reconstruction and audit readiness.",
  },
  {
    name: "Explainability Layer",
    icon: <Search className="h-5 w-5" />,
    detail:
      "Reconstruct decision rationale, approval mapping, and disbursement traces.",
  },
  {
    name: "Reconciliation Jobs",
    icon: <RotateCcw className="h-5 w-5" />,
    detail:
      "Continuous background jobs to validate ledger continuity and system integrity.",
  },
];

export default function ArchitectureSection() {
  const role = useSafeStore((s) => s.primaryRole) || "observer";
  const { architectureFocus } =
    STAKEHOLDER_COPY[role as keyof typeof STAKEHOLDER_COPY];

  return (
    <section className="py-32 bg-black border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left: The 6-Layer Engine */}
          <div className="lg:col-span-7 space-y-12">
            <header className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Infrastructure-Level <br />{" "}
                <span className="text-blue-600">Governance.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-xl">
                PostWins is engineered as a modular governance engine, not a
                dashboard. Our architecture enforces correctness at every layer.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
              {ARCH_LAYERS.map((layer, i) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group space-y-3"
                >
                  <div className="flex items-center gap-3 text-blue-500">
                    {layer.icon}
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                      Layer 0{i + 1}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">
                    {layer.name}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                    {layer.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Stakeholder-Specific "Why It Matters" */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              key={role}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 rounded-[2.5rem] glass-card border-blue-500/10 relative overflow-hidden"
            >
              {/* Animated Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                  Active Focus: {architectureFocus.layer}
                </div>

                <h3 className="text-2xl font-bold text-white">
                  Why This Matters for{" "}
                  {role === "observer" ? "Your Institution" : role + "s"}
                </h3>

                <p className="text-slate-400 leading-relaxed italic">
                  "{architectureFocus.whyItMatters}"
                </p>

                <div className="p-6 rounded-2xl bg-black/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    System Enforcement
                  </h4>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    {architectureFocus.enforcement}
                  </p>
                </div>

                <p className="text-[11px] text-slate-600 font-mono leading-tight">
                  // GOVERNANCE_ENFORCEMENT_PROTOCOL: ACTIVE <br />
                  // THREAT_MODEL: IDEMPOTENT_MUTATION_PROTECTION <br />
                  // STATUS: DETERMINISTIC_STATE_RECONSTRUCTION_READY
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
