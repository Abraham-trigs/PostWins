// apps/website/src/_components/SecuritySection.tsx
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Layers, Key, CheckCircle2 } from "lucide-react";

/**
 * PRODUCTION-GRADE SECURITY MODEL SECTION
 * Visualizes the deterministic enforcement layers of PostWins.
 */
export default function SecuritySection() {
  const ITEMS = [
    {
      title: "Role-Based Access Control (RBAC)",
      icon: <Key className="h-6 w-6" />,
      desc: "Capabilities are derived deterministically. Permissions are enforced at policy and transition level — not only at the endpoint.",
    },
    {
      title: "Tenant Isolation",
      icon: <Layers className="h-6 w-6" />,
      desc: "Data separation is architectural. Partitioning is enforced at schema, middleware, and lifecycle reconciliation layers.",
    },
    {
      title: "Idempotent Mutation Protection",
      icon: <ShieldCheck className="h-6 w-6" />,
      desc: "Repeated requests cannot create duplicate or invalid state transitions. Deterministic state reconstruction ready.",
    },
    {
      title: "Service-Layer Enforcement",
      icon: <Lock className="h-6 w-6" />,
      desc: "No direct database mutation bypass. All state mutations pass through deterministic validation pipelines.",
    },
  ];

  return (
    <section className="bg-slate-950 py-32 border-t border-slate-900 relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto px-6 space-y-20">
        <header className="max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-blue-500 font-mono text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            <ShieldCheck className="h-4 w-4" />
            Security_Protocol_v2.0
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tight">
            Security <span className="text-blue-600">Model.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Security is not a feature; it is an architectural constant. We
            enforce protection through deterministic policy validation, tenant
            partitioning, and capability derivation.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[2rem] bg-black border border-slate-900 hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.05)]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-lg tracking-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
                {item.desc}
              </p>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-slate-800 uppercase tracking-widest group-hover:text-blue-900 transition-colors">
                <CheckCircle2 className="h-3 w-3" />
                Enforced by Architecture
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
