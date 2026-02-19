// apps/website/src/_components/ImpactSection.tsx
"use client";

import { useSafeStore } from "../_store/useExperienceStore";
import { STAKEHOLDER_COPY } from "../_lib/stakeholder-content";
import { motion } from "framer-motion";
import { Zap, Shield, Target } from "lucide-react";

export default function ImpactSection() {
  const role = useSafeStore((s) => s.primaryRole) || "observer";
  const { solution } = STAKEHOLDER_COPY[role as keyof typeof STAKEHOLDER_COPY];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/10 blur-[120px] -translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <header className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {solution.title}
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            {solution.summary}
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {solution.transitions.map((trait, i) => (
            <motion.div
              key={trait}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center space-y-4"
            >
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                {i === 0 && <Target size={24} />}
                {i === 1 && <Shield size={24} />}
                {i === 2 && <Zap size={24} />}
              </div>
              <h4 className="text-xl font-bold text-white uppercase tracking-tighter">
                {trait}
              </h4>
              <p className="text-sm text-slate-500 font-mono">
                ENFORCED BY DETERMINISTIC <br /> LIFECYCLE ENGINE
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-[0.4em] mb-8">
            Impact is measurable because it is structural.
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Replace with actual partner/donor logos later */}
            <span className="text-xl font-black text-white tracking-widest italic uppercase">
              UN-GOVERNED
            </span>
            <span className="text-xl font-black text-white tracking-widest italic uppercase">
              TRUST-CORE
            </span>
            <span className="text-xl font-black text-white tracking-widest italic uppercase">
              AUDIT-PRO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
