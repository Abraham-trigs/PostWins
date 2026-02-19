// apps/website/src/_components/ImpactSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Zap,
  BarChart3,
  Database,
  Lock,
} from "lucide-react";

/**
 * PRODUCTION-GRADE IMPACT SECTION
 * Visualizes the provable outcomes of the PostWins Governance Engine.
 */
export default function ImpactSection() {
  const OUTCOMES = [
    {
      title: "Reduced Operational Ambiguity",
      icon: <Activity className="h-5 w-5" />,
      desc: "Eliminate undocumented decisions through structured lifecycle enforcement.",
    },
    {
      title: "Accelerated Compliant Routing",
      icon: <Zap className="h-5 w-5" />,
      desc: "Deterministic pathing reduces manual lag while maintaining 100% policy alignment.",
    },
    {
      title: "Ledger-Backed Defensibility",
      icon: <ShieldCheck className="h-5 w-5" />,
      desc: "Provide authoritative, forensic-level history to donors and regulators.",
    },
    {
      title: "Transparent Authority Chains",
      icon: <BarChart3 className="h-5 w-5" />,
      desc: "Every approval is mapped to a verified authority with full rationale reconstruction.",
    },
    {
      title: "Structural Tenant Isolation",
      icon: <Database className="h-5 w-5" />,
      desc: "Data separation is architectural, preventing cross-tenant mutation by design.",
    },
    {
      title: "Lifecycle State Precision",
      icon: <Lock className="h-5 w-5" />,
      desc: "Reconstruct any case state with precision from immutable ledger history.",
    },
  ];

  return (
    <section className="bg-slate-950 py-32 border-t border-slate-900 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-20">
        <header className="max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold"
          >
            Outcome_Verification_Ready
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tight">
            Speed & <span className="text-blue-600">Provable Impact.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Impact becomes measurable because governance is structural. PostWins
            enables organizations to deliver results that are both fast and
            defensible.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {OUTCOMES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all shadow-xl"
            >
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 w-fit mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <footer className="pt-12 text-center">
          <p className="text-slate-600 font-mono text-[9px] uppercase tracking-[0.5em]">
            Trust becomes Architectural • Outcomes become Defensible
          </p>
        </footer>
      </div>
    </section>
  );
}
